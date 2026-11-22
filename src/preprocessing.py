import data_loader
import random
import math

from evaluate_model import evaluate_model
from knn import KNN
import spline_logreg as sl

from datetime import datetime
import textwrap
import numpy as np
# Supposed duration of the infrastructure projects before exceeding expiry data
def planned_duration(row):
    if row["expiryDate"] is None or row["contractEffectivityDate"] is None:
        return -1
    return (row["expiryDate"] - row["contractEffectivityDate"]).days


# Delay days checker with 5% tolerance
def is_delayed(row):
    if row["completionDate"] is None or row["expiryDate"] is None:
        return False
    planned = planned_duration(row)
    if planned < 0:
        return False
    delay = (row["completionDate"] - row["expiryDate"]).days
    tolerance = planned * 0.05

    return delay > tolerance 


# Checks statuses of projects if terminated and if complete but with inconsistencies
def build_status(row):
    status = row["status"].strip().lower()

    if status == "terminated":
        return 1

    if status == "completed":
        if row["completionDate"] is None:
            return None
        if row["progress"] < 100.0:
            return 1  
        if is_delayed(row):
            return 1
        return 0
    
    if "ongoing" in status or "on-going" in status:
        expiry = row.get("expiryDate")
        if expiry and datetime.now() > expiry:
            return 1
        
    return None


#get all relevant features to predict reliability of a contractor
def build_features(row):
    return {
        "budget": row["budget"],
        "infraYear": row["infraYear"],
        "planned_duration": planned_duration(row),
        "latitude": row["latitude"],
        "longitude": row["longitude"],
        "region": row["region"],
        "province": row["province"],
        "category": row["category"],
        "componentCategory": row["componentCategory"],
        "contractor": row["contractor"],
    }


# The dataset to be used be the ML model to train data
def build_dataset(rows, max_year=2025):
    features = []
    statuses = []
    proj_ids = []

    for row in rows:
        #projects started in 2026 aren't included bcs the usual contract expiry is year after start
        if row["infraYear"] > max_year:
            continue

        status = build_status(row)
        
        if status is None:
            continue

        duration = planned_duration(row)
        if duration < 0:
            continue

        features.append(build_features(row))
        statuses.append(status)
        proj_ids.append(row["contractId"])

    return features, statuses, proj_ids


#split the data set to train and test data using an 80/20, split, from less to more recent
def split_dataset(features, status, proj_ids, test_size=0.2):
    combined = list(zip(features, status, proj_ids))
    combined.sort(key=lambda x: x[0]["infraYear"])

    train_size = int(len(combined) * (1 - test_size))
    train_data = combined[:train_size]#aka the past data
    test_data = combined[train_size:]#aka the future data

    feat_train = [data[0] for data in train_data]
    status_train = [data[1] for data in train_data]
    id_train = [data[2] for data in train_data]

    feat_test = [data[0] for data in test_data]
    status_test = [data[1] for data in test_data]
    id_test = [data[2] for data in test_data]

    return feat_train, feat_test, status_train, status_test, id_train, id_test


def learn_rates(features, statuses, cat_columns, m):
    global_rate = sum(statuses)/len(statuses)
    rates = {col: {} for col in cat_columns}

    for col in cat_columns:
        counts = {} # value -> [total, delayed]
        for row, status in zip(features, statuses):
            val = row[col]
            if val not in counts:
                counts[val] = [0, 0]
            counts[val][0] += 1
            counts[val][1] += status

        for val, (total, delayed) in counts.items():
            rates[col][val] = (delayed + m * global_rate) / (total + m)

    return rates, global_rate


def apply_encoding(data_list, cat_columns, rates, global_rate):
    encoded_data = []
    for row in data_list:
        #start with base numerical features
        encoded_row = [row["budget"], row["infraYear"], row["planned_duration"], row["latitude"], row["longitude"]]
        
        #append the learned frequency score for each categorical column
        for col in cat_columns:
            #if a test category was never seen during training, default to 0.0 frequency
            encoded_row.append(rates[col].get(row[col], global_rate))
        
        encoded_data.append(encoded_row)
        
    return encoded_data

def encode_categoricals(train_features, test_features, cat_columns, status_train, m=10, n_folds=5):
    encoded_train = [None] * len(train_features)

    # Learn frequencies using training data
    for fold in range(n_folds):
        fit_features = []
        fit_statuses = []
        held_idx = []

        # Separate the training data into 5 folds
        for i in range(len(train_features)):
            if i%n_folds == fold:
                held_idx.append(i)
            else:
                # Learning folds
                fit_features.append(train_features[i])
                fit_statuses.append(status_train[i])

        # Get category rates from other groups
        rates, global_rate = learn_rates(fit_features, fit_statuses, cat_columns, m)

        # Encode the held-out fold
        held_rows = [train_features[i] for i in held_idx]
        encoded_held = apply_encoding(held_rows, cat_columns, rates, global_rate)

        # Restore encoded rows to original positions
        for i, enc_row in zip(held_idx, encoded_held):
            encoded_train[i] = enc_row

    # Get category rates using all training data
    rates, global_rate = learn_rates(train_features, status_train, cat_columns, m)

    # Encode test data
    encoded_test = apply_encoding(test_features, cat_columns, rates, global_rate)

    return encoded_train, encoded_test

    # for row in train_features:
    #     for col in cat_columns:
    #         val = row[col]
    #         frequencies[col][val] = frequencies[col].get(val, 0) + 1
            
    # train_size = len(train_features)
    # for col in cat_columns:#gives us the frequencies of the categories
    #     for val in frequencies[col]:
    #         frequencies[col][val] /= train_size
    # encoded_train = apply_encoding(train_features, cat_columns, frequencies)
    # encoded_test = apply_encoding(test_features, cat_columns, frequencies)
    # return encoded_train, encoded_test

# apply normalization to the numerical statistics
def normalizer(num_stats, means, std_devs):
    normalized = []

    for row in num_stats:
        normalized_row = []

        for i in range(len(row)):
            if std_devs[i] == 0:
                normalized_row.append(0)
            else:
                value = (row[i] - means[i]) /std_devs[i]
                normalized_row.append(value)

        normalized.append(normalized_row)

    return normalized


# calculate mean and standard deviation for normalization
def calc_stats(num_train):
    means = []
    std_devs = []

    for col in zip(*num_train):
        mean = sum(col)/len(col)
        # s^2 = summation of (x - mean)^2 all over n
        variance = sum((value - mean) ** 2 for value in col) / len(col)
        std_dev = math.sqrt(variance)

        means.append(mean)
        std_devs.append(std_dev)

    return means, std_devs


# normalize the numerical data from train and test data
def normalize(num_train, num_test):
    means, std_devs = calc_stats(num_train)

    normalized_num_train = normalizer(num_train, means, std_devs)
    normalized_num_test = normalizer(num_test, means, std_devs)

    return normalized_num_train, normalized_num_test


def feature_delay(rows, feature_key, min_projects, max_year=2025):
    #get the delay rate for the historical features, ignore anything wIth less than min
    stats = {}
    for row in rows:
        if row.get("infraYear") is None or row["infraYear"] > max_year:
            continue
        val = row.get(feature_key)
        if val is None:
            continue
        status = build_status(row)
        if status is None:
            continue
        if val not in stats:#same thing in bow, create key value pair if first encounter, otherwise just add
            stats[val] = {"total": 0, "delayed": 0}
        stats[val]["total"] += 1
        if status == 1:
            stats[val]["delayed"] += 1
            
    #get delay percentage
    results = []
    for val, data in stats.items():
        if data["total"] > min_projects:
            rate = (data["delayed"] / data["total"]) * 100.0
            results.append((val, rate, data["total"]))
        
    #sort by the highest delay rate
    results.sort(key=lambda x: x[1], reverse=True)
    return results

if __name__ == "__main__":
    rows = data_loader.load_csv()

    print(f"Loaded {len(rows)} rows")

    features, statuses, proj_ids = build_dataset(rows)

    print(f"Built dataset: {len(features)} valid projects")
    print(f"Class 0: {statuses.count(0)}")
    print(f"Class 1: {statuses.count(1)}")

    feat_train, feat_test, status_train, status_test, id_train, id_test = split_dataset(
        features, statuses, proj_ids
    )

    print(f"Training samples: {len(feat_train)}")
    print(f"Testing samples: {len(feat_test)}")
    cat_columns = ["region", "province", "category", "componentCategory", "contractor"]
    encoded_train, encoded_test = encode_categoricals(feat_train, feat_test, cat_columns, status_train)
    
    normalized_train, normalized_test = normalize(encoded_train, encoded_test)

    print("Normalization complete...")
    print(f"Training features: {len(normalized_train)}")
    print(f"Testing features: {len(normalized_test)}")

    print("Sample normalized data:")
    print(normalized_train[0] if normalized_train else "No training data")

    target_columns = ["region", "province", "category", "componentCategory", "contractor"]
    name_width = 150

    for col in target_columns:
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

   #####KNN evaluation, uncomment this later, add something like a 1 2 3 to choose which method
   #####you want to run when all methods have been coded
    print("\n--- Initializing and Training Standard NumPy KNN ---")
    knn_model = KNN(k=5)
    knn_model.fit(np.array(normalized_train), np.array(status_train))

    predictions = knn_model.predict(np.array(normalized_test))
    results = evaluate_model(status_test, predictions)
    cm = results["confusion_matrix"]
    tn, fp = cm[0][0], cm[0][1]
    fn, tp = cm[1][0], cm[1][1]
    print("\n" + "=" * 45)
    print("        NUMPY KNN FULL EVALUATION RESULTS         ")
    print("=" * 45)
    print(f"Confusion Matrix:")
    print(f"  [ TN: {tn:6d}  |  FP: {fp:6d} ]")
    print(f"  [ FN: {fn:6d}  |  TP: {tp:6d} ]")
    print("-" * 45)
    print(f"Accuracy:  {results['accuracy'] * 100:6.2f}%")
    print(f"Precision: {results['precision'] * 100:6.2f}%")
    print(f"Recall:    {results['recall'] * 100:6.2f}%")
    print(f"F1-Score:  {results['f1_score'] * 100:6.2f}%")
    print("=" * 45)

    #####spline logistic regression method
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
