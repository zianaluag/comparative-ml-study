# Predicting Delays in DPWH Infrastructure Projects with Machine Learning

## Members

- Aluag, Zander Ian C. ([zianaluag](https://github.com/zianaluag))
- Caraig, Bernard Alejandro C. ([herio-nn](https://github.com/herio-nn))
- Perez, Desmond Rainier B. ([desmondperez](https://github.com/desmondperez))
- Tandang, Frannieczeska Erene U. ([ririlinn](https://github.com/ririlinn))

## Research objective

We’re using past DPWH contracts to see whether we can spot a likely delay when a new contract is awarded. At that point, we already know who the contractor is, where the project will be built, how much is budgeted, and how long the work is supposed to take. If those details can give an early warning, they could help DPWH decide which projects to check on more closely.

We look at how often projects ran late across regions, provinces, project categories, and contractors. We also want to see which of our three models does the best job on newer contracts after training on older ones. For that comparison, we’ll look at both the delays each model misses and the on-time projects it flags.

## Data

We use `datasets/dpwh_infrastructure_contracts.csv`. The project records come from the [BetterGov Open Data Portal](https://data.bettergov.ph/datasets/19/resources/406). The contract dates come from the [DPWH Transparency Portal](https://transparency.dpwh.gov.ph/).

The loader skips duplicate contract IDs and rows with invalid or missing required values. Before splitting the data, we keep projects through infrastructure year 2025 that have a label and a nonnegative planned duration. This gives us 213,418 projects for the comparison. We sort them by infrastructure year and use the first 80% for training (170,734 projects) and the last 20% for testing (42,684 projects). Projects within each year keep their CSV order. Both sets contain 2024 projects.

All three methods start with the same 10 inputs. The numerical features are budget, infrastructure year, planned duration, latitude, and longitude. The categorical features are region, province, category, component category, and contractor.

We represent each category with a delay rate pulled toward the overall training rate. We divide the training set into five groups and use the other four groups to calculate the rates for each group. For test rows, we use rates from the entire training set. Unseen categories get the overall training delay rate.

## What counts as delayed?

`src/preprocessing.py` assigns each project a label using its status, reported progress, and completion date. The planned duration is the number of days from the contract effectivity date to the recorded expiry date.

- A **terminated** project gets `1` (delayed).
- A project marked **completed** with a recorded completion date and progress below 100% also gets `1`, even if its completion date falls before expiry.
- For a **completed** project with at least 100% progress and a recorded completion date, we check how many days it finished past expiry. If that exceeds 5% of the planned duration, it gets `1`. Otherwise, it gets `0` (within the allowance).
- An **ongoing** project gets `1` if its expiry date has passed when the script runs. Otherwise, it is left unlabeled (`None`).
- A **completed** project with a missing completion date is left unlabeled. Projects marked **for procurement** or **not yet started** also stay unlabeled.

For example, take a 100-day contract marked 100% complete. Finishing five days past expiry gives it `0`. Finishing six days past expiry gives it `1`.

Rerunning the comparison after an ongoing project passes its expiry date can change its label and the split counts.

## Methods so far

We implemented all three methods from scratch in Python using NumPy.

- **Spline logistic regression** (`src/spline_logistic_regression.py`) uses quadratic splines for all five numerical features. This lets an extra month on a short contract affect the estimated risk differently from an extra month on a long one. We fit two knots per feature on the training data and scale the expanded features using training statistics. We train for 200 epochs with a learning rate of 0.1 and L2 regularization of 0.01.
- **XGBoost-style gradient boosted trees** (`src/gradient_boosted_trees.py`) builds a series of small decision trees. Each tree adjusts the scores from the earlier trees. For the current run, we use 90 trees with a maximum depth of 5, a learning rate of 0.1, L2 regularization of 1.0, and a delay threshold of 0.25. We chose the tree count, depth, and threshold by F1 on the last 20% of the year-sorted training set, then refit on all the training projects.
- **k-nearest neighbors** (`src/knn.py`) uses features scaled with training statistics. It checks the Euclidean distance to every training project and predicts the most common label among the five closest projects.

## Results so far

All three methods report accuracy, precision, recall, F1, and a confusion matrix on the same test split. The 42,684 test projects include 21,882 delayed projects and 20,802 within the allowance. We ran the comparison with Python 3.12.14 and NumPy 2.3.5.

| Method | Setting | Accuracy | Precision | Recall | F1 |
| --- | --- | ---: | ---: | ---: | ---: |
| Spline logistic regression | Threshold 0.20 | 64.08% | 62.93% | 72.89% | 0.6754 |
| Gradient boosted trees | Threshold 0.25 | 67.47% | 66.60% | 73.30% | 0.6979 |
| k-nearest neighbors | `k = 5` | 59.95% | 74.22% | 33.52% | 0.4618 |

On this split, gradient boosted trees had the highest F1 and caught 16,040 of the 21,882 delayed projects. KNN had the highest precision and flagged 2,548 projects that were within the allowance. The spline row uses the 0.20 threshold shown on the project page.

The [project page source](website/) includes the dataset overview, a regional delay map, a delay chart by component category, and preliminary results for all three models.

## Running the code

From the repo root, install the NumPy version used for the comparison and run the model menu.

```bash
python -m pip install numpy==2.3.5
python src/run_experiments.py
```

The menu prints the data split and historical delay rates before asking which method to run.

- Enter `1` for k-nearest neighbors. A full run can take several minutes because it checks every training project for each test project.
- Enter `2` for spline logistic regression. It reports results at thresholds 0.50, 0.40, 0.30, and 0.20.
- Enter `3` for gradient boosted trees.

You can also run gradient boosted trees directly.

```bash
python src/gradient_boosted_trees.py
```
