def evaluate_model(y_true, y_pred):
    # Computes evaluation metrics
    tp = 0
    fp = 0
    tn = 0
    fn = 0

    for i in range(len(y_true)):
        actual = y_true[i]
        predicted = y_pred[i]

        if actual == 1 and predicted == 1:
            tp += 1

        elif actual == 0 and predicted == 1:
            fp += 1
        
        elif actual == 0 and predicted == 0:
            tn += 1
        
        elif actual == 1 and predicted == 0:
            fn += 1

    accuracy = (tp + tn) / len(y_true) if len(y_true) > 0 else 0.0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1_score = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0

    return {
        "accuracy": accuracy,
        "precision": precision,
        "recall": recall,
        "f1_score": f1_score,
        "confusion_matrix": [[tn, fp], [fn, tp]]
    }