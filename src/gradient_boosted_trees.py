import numpy as np
from spline_logreg import sigmoid


def node_score(grad_sum, hess_sum, l2_reg):
    return grad_sum ** 2 / (hess_sum + l2_reg)


def build_tree(X, gradients, hessians, depth, l2_reg):
    total_grad = gradients.sum()
    total_hess = hessians.sum()

    # every project in this leaf gets the same adjustment
    leaf = {"value": -total_grad / (total_hess + l2_reg)}

    return leaf
