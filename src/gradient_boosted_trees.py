import numpy as np
from spline_logreg import sigmoid


def node_score(grad_sum, hess_sum, l2_reg):
    return grad_sum ** 2 / (hess_sum + l2_reg)


def build_tree(X, gradients, hessians, depth, l2_reg):
    total_grad = gradients.sum()
    total_hess = hessians.sum()

    # every project in this leaf gets the same adjustment
    leaf = {"value": -total_grad / (total_hess + l2_reg)}

    if depth == 0 or len(X) < 2:
        return leaf

    parent_score = node_score(total_grad, total_hess, l2_reg)

    best_gain = 0.0
    best_feature = None
    best_threshold = None

    for col in range(X.shape[1]):
        order = np.argsort(X[:, col], kind="stable")
        values = X[order, col]

        # only try a split between two different values
        cuts = np.flatnonzero(values[:-1] < values[1:])

        if len(cuts) == 0:
            continue

        # running totals let us check each split without adding the same rows again
        left_grad = np.cumsum(gradients[order])[cuts]
        left_hess = np.cumsum(hessians[order])[cuts]

        right_grad = total_grad - left_grad
        right_hess = total_hess - left_hess

        left_score = node_score(left_grad, left_hess, l2_reg)
        right_score = node_score(right_grad, right_hess, l2_reg)

        gains = (left_score + right_score - parent_score) / 2
        best = np.argmax(gains)

        if gains[best] > best_gain:
            best_gain = gains[best]
            best_feature = col
            best_threshold = values[cuts[best]]

    # keep the leaf if no split improves its score
    if best_feature is None:
        return leaf

    left = X[:, best_feature] <= best_threshold
    right = ~left

    return {
        "feature": best_feature,
        "threshold": best_threshold,
        "left": build_tree(X[left], gradients[left], hessians[left], depth - 1, l2_reg),
        "right": build_tree(X[right], gradients[right], hessians[right], depth - 1, l2_reg),
    }


def tree_predictions(tree, X):
    updates = np.empty(len(X))

    for i, row in enumerate(X):
        node = tree

        # follow the branches until the project reaches a leaf
        while "value" not in node:
            if row[node["feature"]] <= node["threshold"]:
                node = node["left"]
            else:
                node = node["right"]

        updates[i] = node["value"]

    return updates


def train_model(X_train, y_train, n_trees=30, max_depth=3, learning_rate=0.1, l2_reg=1.0):
    X = np.asarray(X_train, dtype=float)
    y = np.asarray(y_train, dtype=float)

    # start with the share of training projects that were delayed
    rate = np.clip(y.mean(), 1e-6, 1 - 1e-6)
    base_score = np.log(rate / (1 - rate))

    scores = np.full(len(y), base_score)
    trees = []

    for _ in range(n_trees):
        probabilities = sigmoid(scores)

        # the gradient is the gap between the predicted probability and the actual label
        gradients = probabilities - y

        # the hessian tells us how fast the probability changes as the score changes
        hessians = probabilities * (1 - probabilities)

        tree = build_tree(X, gradients, hessians, max_depth, l2_reg)

        # add a fraction of this tree's adjustment before training the next tree
        scores += learning_rate * tree_predictions(tree, X)
        trees.append(tree)

    return {"base_score": base_score, "learning_rate": learning_rate, "trees": trees}


def predict_proba(X, model):
    scores = np.full(len(X), model["base_score"])

    for tree in model["trees"]:
        scores += model["learning_rate"] * tree_predictions(tree, X)

    return sigmoid(scores)
