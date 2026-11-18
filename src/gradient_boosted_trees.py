import numpy as np
from spline_logreg import sigmoid


def node_score(grad_sum, hess_sum, l2_reg):
    return grad_sum ** 2 / (hess_sum + l2_reg)
