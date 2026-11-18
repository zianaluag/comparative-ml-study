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
        values = np.unique(X[:, col])

        for threshold in values[:-1]:
            left = X[:, col] <= threshold
            left_grad = gradients[left].sum()
            left_hess = hessians[left].sum()
            right_grad = total_grad - left_grad
            right_hess = total_hess - left_hess

            left_score = node_score(left_grad, left_hess, l2_reg)
            right_score = node_score(right_grad, right_hess, l2_reg)
            gain = (left_score + right_score - parent_score) / 2

            if gain > best_gain:
                best_gain = gain
                best_feature = col
                best_threshold = threshold

    # keep the leaf if no split improves its score
    if best_feature is None:
        return leaf

    left = X[:, best_feature] <= best_threshold
    right = ~left

    return {
        "feature": best_feature,
        "threshold": best_threshold,
        "left": build_tree(X[left], gradients[left], hessians[left], 0, l2_reg),
        "right": build_tree(X[right], gradients[right], hessians[right], 0, l2_reg),
    }
