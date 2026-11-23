import textwrap

import numpy as np

import data_loader
from classification_metrics import evaluate_model
from gradient_boosted_trees import run_gradient_boosted_trees
from knn import KNN
from preprocessing import (
    CATEGORICAL_COLUMNS,
    build_dataset,
    encode_categoricals,
    feature_delay,
    normalize,
    split_dataset,
)
import spline_logistic_regression as sl


def run_knn(normalized_train, status_train, normalized_test, status_test, k=5):
    print("\n--- Initializing and Training Standard NumPy KNN ---")
    knn_model = KNN(k=k)
    knn_model.fit(np.array(normalized_train), np.array(status_train, dtype=int))

    predictions = knn_model.predict(np.array(normalized_test))
    results = evaluate_model(status_test, predictions)
    cm = results["confusion_matrix"]
    tn, fp = cm[0][0], cm[0][1]
    fn, tp = cm[1][0], cm[1][1]
    print("\n" + "=" * 45)
    print("        NUMPY KNN FULL EVALUATION RESULTS         ")
    print("=" * 45)
    print("Confusion Matrix:")
    print(f"  [ TN: {tn:6d}  |  FP: {fp:6d} ]")
    print(f"  [ FN: {fn:6d}  |  TP: {tp:6d} ]")
    print("-" * 45)
    print(f"Accuracy:  {results['accuracy'] * 100:6.2f}%")
    print(f"Precision: {results['precision'] * 100:6.2f}%")
    print(f"Recall:    {results['recall'] * 100:6.2f}%")
    print(f"F1-Score:  {results['f1_score'] * 100:6.2f}%")
    print("=" * 45)


def run_spline_logreg(encoded_train, status_train, encoded_test, status_test):
    print("\n--- Spline Logistic Regression --- ")

    knots = sl.fit_spline_transform(encoded_train)
    expanded_train = sl.transform_features(encoded_train, knots)
    expanded_test = sl.transform_features(encoded_test, knots)

    norm_train, norm_test = normalize(expanded_train, expanded_test)

    X_train = sl.add_intercept(np.array(norm_train))
    X_test = sl.add_intercept(np.array(norm_test))
    y_train = np.array(status_train)
    y_test = np.array(status_test)

    print(f"X_train shape: {X_train.shape}")

    weights, loss_history = sl.train_model(X_train, y_train, learning_rate=0.1, epochs=200)
    print(f"Loss: first {loss_history[0]:.4f} | mid {loss_history[len(loss_history)//2]:.4f} | last {loss_history[-1]:.4f}")

    probs = sl.predict_proba(X_test, weights)
    print(f"Probs: min {probs.min():.3f} | max {probs.max():.3f} | mean {probs.mean():.3f}")

    for t in [0.5, 0.4, 0.3, 0.2]:
        y_pred = sl.predict(X_test, weights, threshold=t)
        r = evaluate_model(y_test, y_pred)
        cm = r["confusion_matrix"]
        tn, fp = cm[0][0], cm[0][1]
        fn, tp = cm[1][0], cm[1][1]

        print("\n" + "=" * 45)
        print("Confusion Matrix:")
        print(f"    [TN]: {tn:6d} | [FP]: {fp:6d}")
        print(f"    [FN]: {fn:6d} | [TP]: {tp:6d}")
        print("-" * 45)
        print(f"Threshold {t}: Accuracy {r['accuracy']*100:.2f}% | Precision {r['precision']*100:.2f}% | Recall {r['recall']*100:.2f}% | F1 Score {r['f1_score']*100:.2f}%")
        print("=" * 45)



def main():
    rows = data_loader.load_csv()

    print(f"Loaded {len(rows)} rows")

    features, statuses, proj_ids = build_dataset(rows)

    print(f"Built dataset: {len(features)} valid projects")
    print(f"Class 0: {statuses.count(0)}")
    print(f"Class 1: {statuses.count(1)}")

    feat_train, feat_test, status_train, status_test, _, _ = split_dataset(
        features, statuses, proj_ids
    )
    if len(feat_train) < 2 or not feat_test:
        raise SystemExit("Need at least two labeled training projects and one test project.")

    print(f"Training samples: {len(feat_train)}")
    print(f"Testing samples: {len(feat_test)}")
    encoded_train, encoded_test = encode_categoricals(
        feat_train, feat_test, CATEGORICAL_COLUMNS, status_train
    )

    normalized_train, normalized_test = normalize(encoded_train, encoded_test)

    print("Normalization complete...")
    print(f"Features per project: {len(normalized_train[0])}")

    print("Sample normalized data:")
    print(normalized_train[0] if normalized_train else "No training data")

    name_width = 150

    for col in CATEGORICAL_COLUMNS:
        analysis_results = feature_delay(rows, col, min_projects=5, max_year=2025)
        header = f"TOP DELAY-PRONE BY {col.upper()} (Projects > {5}, <= {2025})"

        print(f"\n{header}")
        print("-" * len(header))

        if not analysis_results:
            print("  No qualifying records found.")
            continue

        print(f"  {'Entity':<{name_width}} | {'Delay':>7} | {'Projects':>8}")
        print(f"  {'-' * name_width}-+-{'-' * 7}-+-{'-' * 8}")

        for val, rate, count in analysis_results[:100]:
            wrapped = textwrap.wrap(str(val), width=name_width) or [""]
            print(f"  {wrapped[0]:<{name_width}} | {rate:6.2f}% | {count:8d}")
            for line in wrapped[1:]:
                print(f"  {line:<{name_width}} |         |")
    print("=" * 75 + "\n")
    print("\nSelect model method to run:")
    print("  [1] Standard NumPy KNN")
    print("  [2] Spline Logistic Regression")
    print("  [3] Gradient Boosted Trees (XGBoost-style)")
    choice = input("Enter choice (1/2/3): ").strip()

    if choice == "1":
        k = 5
        if len(normalized_train) < k:
            raise SystemExit(f"KNN needs at least {k} training projects.")
        run_knn(normalized_train, status_train, normalized_test, status_test, k=k)
    elif choice == "2":
        run_spline_logreg(encoded_train, status_train, encoded_test, status_test)
    elif choice == "3":
        run_gradient_boosted_trees(encoded_train, status_train, encoded_test, status_test)
    else:
        raise SystemExit("Choose 1, 2, or 3.")


if __name__ == "__main__":
    main()
