import math
import numpy as np


def sigmoid(z):
    
    # converts any raw number into a probability between 0 and 1
    z_clipped = np.clip(z, -500.0, 500.0) # caps values between -500 and 500 to prevent overflow
    
    return 1.0 / (1.0 + np.exp(-z_clipped)) # applies the sigmoid formula


def fit_spline_transform(X_train_num, num_knots = 2):
    
    # percentile knot locations for numerical features from training data
    knots_per_feature = []
    num_rows = len(X_train_num)

    # loop thru process budget (0), infraYear (1), and planned_duration (2), latitude (3), and longitude (4)
    for col_idx in range(5):
        col_values = []
        
        for row in X_train_num: # extracts every row's value for that column
            col_values.append(row[col_idx])

        col_values.sort()
        feature_knots = []

        for k in range(1, num_knots + 1):
            percentile_index = int((k / (num_knots + 1)) * num_rows) # computes the index position for each quantile (ex: 33 and 66 percent)
            feature_knots.append(col_values[percentile_index])

        knots_per_feature.append(feature_knots) # stores the column's knots

    return knots_per_feature # list of knot thresholds per feature


def transform_features(X_data, knots_per_feature):
    
    # expands continuous features using piecewise quadratic truncated basis terms
    expanded_rows = []

    for row in X_data:
        new_row = []

        # numerical features = linear + quadratic + truncated knot terms
        for col_idx in range(5):
            val = row[col_idx]
            new_row.append(val)
            new_row.append(val ** 2)

            knots = knots_per_feature[col_idx]
            
            for knot in knots:
                diff = val - knot
                
                if diff > 0:
                    new_row.append(diff ** 2)
                
                else:
                    new_row.append(0.0)

        # categorical frequency features: retained as linear terms
        for col_idx in range(5, len(row)):
            new_row.append(row[col_idx])

        expanded_rows.append(new_row)

    return np.array(expanded_rows)


def add_intercept(X):
    
    # prepends intercept bias column (x0 = 1.0)
    num_samples = X.shape[0]
    ones_column = np.ones((num_samples, 1))
    
    return np.hstack((ones_column, X))


def calculate_loss(y_true, y_pred, weights, l2_reg = 0.01):
    
    # calculates binary cross entropy loss with L2 penalty
    n_samples = len(y_true)
    eps = 1e-15
    y_pred_bounded = np.clip(y_pred, eps, 1.0 - eps)

    bce_loss = 0.0
    
    for i in range(n_samples):
        y = y_true[i]
        p = y_pred_bounded[i]
        bce_loss += -(y * math.log(p) + (1.0 - y) * math.log(1.0 - p))

    bce_loss = bce_loss / n_samples

    # regularization penalty excluding bias term (w0)
    l2_penalty = 0.0
    
    for w in weights[1:]:
        l2_penalty += w * w

    l2_penalty = (l2_reg / (2.0 * n_samples)) * l2_penalty

    return bce_loss + l2_penalty


def calculate_gradients(X, y_true, y_pred, weights, l2_reg = 0.01):
    
    # computes loss gradients with respect to model parameters
    n_samples = X.shape[0]
    errors = y_pred - y_true

    gradients = np.dot(X.T, errors) / n_samples

    for j in range(1, len(weights)):
        gradients[j] += (l2_reg / n_samples) * weights[j]

    return gradients


def train_model(X_train, y_train, learning_rate = 0.1, epochs = 200, l2_reg = 0.01):
    
    # optimizes model weights using gradient descent
    n_samples, n_features = X_train.shape
    weights = np.zeros(n_features)
    y_train_arr = np.array(y_train)

    loss_history = []

    for epoch in range(epochs):

        linear_output = np.dot(X_train, weights)
        y_pred = sigmoid(linear_output)

        loss = calculate_loss(y_train_arr, y_pred, weights, l2_reg)
        loss_history.append(loss)

        gradients = calculate_gradients(X_train, y_train_arr, y_pred, weights, l2_reg)
        weights -= learning_rate * gradients

    return weights, loss_history


def predict_proba(X, weights):
    
    # calculates class probabilities
    linear_output = np.dot(X, weights)
    
    return sigmoid(linear_output)


def predict(X, weights, threshold = 0.5):
    
    # converts probabilities into binary class labels (0 or 1)
    probabilities = predict_proba(X, weights)
    binary_predictions = []

    for p in probabilities:
    
        if p >= threshold:
            binary_predictions.append(1)
     
        else:
            binary_predictions.append(0)

    return np.array(binary_predictions)
