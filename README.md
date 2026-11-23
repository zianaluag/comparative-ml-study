# Predicting Delays in DPWH Infrastructure Projects with Machine Learning

## Members

- Aluag, Zander Ian C. ([zianaluag](https://github.com/zianaluag))
- Caraig, Bernard Alejandro C. ([herio-nn](https://github.com/herio-nn))
- Perez, Desmond Rainier B. ([desmondperez](https://github.com/desmondperez))
- Tandang, Frannieczeska Erene U. ([ririlinn](https://github.com/ririlinn))

## Research objective

We’re using past DPWH contracts to see whether we can spot a likely delay when a new contract is awarded. At that point, we already know who the contractor is, where the project will be built, how much is budgeted, and how long the work is supposed to take. If those details can give an early warning, they could help DPWH decide which projects to check on more closely.

Right-of-way acquisition has delayed Philippine infrastructure projects (National Economic and Development Authority, 2022). We look at how often projects ran late across regions, provinces, project categories, and contractors. We trained three models on older contracts and compared them on newer ones. For a district office deciding which schedules to check first, we counted missed delays and false alarms.

## Data

We use `datasets/dpwh_infrastructure_contracts.csv`. The project records come from the [BetterGov Open Data Portal](https://data.bettergov.ph/datasets/19/resources/406) (BetterGov.ph, n.d.). The contract dates come from the [DPWH Transparency Portal](https://transparency.dpwh.gov.ph/) (Department of Public Works and Highways, n.d.).

The loader skips duplicate contract IDs and rows with invalid or missing required values. Before splitting the data, we keep projects through infrastructure year 2025 that have a label and a nonnegative planned duration. This gives us 213,418 projects for the comparison. We sort them by infrastructure year and use the first 80% for training (170,734 projects) and the last 20% for testing (42,684 projects). Projects within each year keep their CSV order. Both sets contain 2024 projects.

All three methods start with the same 10 inputs. The numerical features are budget, infrastructure year, planned duration, latitude, and longitude. The categorical features are region, province, category, component category, and contractor.

We represent each category with a delay rate pulled toward the overall training rate (Micci-Barreca, 2001). We divide the training set into five groups and use the other four groups to calculate the rates for each group. For test rows, we use rates from the entire training set. Unseen categories get the overall training delay rate. Keeping test labels out of these calculations prevents data leakage (Kaufman et al., 2011).

## What counts as delayed?

`src/preprocessing.py` assigns each project a label using its status, reported progress, and completion date. The planned duration is the number of days from the contract effectivity date to the recorded expiry date.

- A **terminated** project gets `1` (delayed).
- A project marked **completed** with a recorded completion date and progress below 100% also gets `1`, even if its completion date falls before expiry.
- For a **completed** project with at least 100% progress and a recorded completion date, we check how many days it finished past expiry. If that exceeds 5% of the planned duration, it gets `1`. Otherwise, it gets `0` (within the allowance).
- An **ongoing** project gets `1` if its expiry date has passed when the script runs. Otherwise, it is left unlabeled (`None`).
- A **completed** project with a missing completion date is left unlabeled. Projects marked **for procurement** or **not yet started** also stay unlabeled.

For example, take a 100-day contract marked 100% complete. Finishing five days past expiry gives it `0`. Finishing six days past expiry gives it `1`.

Rerunning the comparison after an ongoing project passes its expiry date can change its label and the split counts.

## Methods

We implemented all three methods from scratch in Python using NumPy.

- **Spline logistic regression** (`src/spline_logistic_regression.py`) uses quadratic splines for all five numerical features. This lets an extra month on a short contract affect the estimated risk differently from an extra month on a long one (James et al., 2021). We fit two knots per feature on the training data and scale the expanded features using training statistics. We train for 200 epochs with a learning rate of 0.1 and L2 regularization of 0.01.
- **XGBoost-style gradient boosted trees** (`src/gradient_boosted_trees.py`) builds a series of small decision trees. Each tree adjusts the scores from the earlier trees (Chen & Guestrin, 2016; XGBoost Developers, n.d.). For the reported comparison, we used 90 trees with a maximum depth of 5, a learning rate of 0.1, L2 regularization of 1.0, and a delay threshold of 0.25. We chose the tree count, depth, and threshold by F1 on the last 20% of the year-sorted training set, then refit on all the training projects.
- **k-nearest neighbors** (`src/knn.py`) uses features scaled with training statistics. KNN predicts the most common label among nearby examples (W3Schools, n.d.). Our implementation checks the Euclidean distance to every training project and uses the five closest projects.

## Results

All three methods report accuracy, precision, recall, F1, and a confusion matrix on the same test split. These metrics summarize correct predictions, missed delays, and false alarms (Sokolova & Lapalme, 2009). The 42,684 test projects include 21,882 delayed projects and 20,802 within the allowance. We ran the comparison with Python 3.12.14 and NumPy 2.3.5.

| Method | Setting | Accuracy | Precision | Recall | F1 |
| --- | --- | ---: | ---: | ---: | ---: |
| Spline logistic regression | Threshold 0.20 | 64.08% | 62.93% | 72.89% | 0.6754 |
| Gradient boosted trees | Threshold 0.25 | 67.47% | 66.60% | 73.30% | 0.6979 |
| k-nearest neighbors | `k = 5` | 59.95% | 74.22% | 33.52% | 0.4618 |

Boosted trees caught 91 more delays than spline logistic regression and raised 1,354 fewer false alarms. A tree can use different duration cutoffs for projects in different budget ranges. Our spline model fits a separate curve for each numerical input and adds their effects. That difference may help explain the gap. The two models also used different thresholds, which affects how often they raised a flag.

KNN needed at least three of the five closest training projects to be delayed before it flagged a contract. Delays made up 26.75% of the training set (45,665 of 170,734) and 51.27% of the test set (21,882 of 42,684). Voting among older contracts may have made delays harder to catch in the test set. KNN flagged 9,883 contracts and got 74.22% of those flags right. It missed 14,547 delays.

Both sets include 2024 projects. In a follow-up experiment, we would choose the thresholds and the number of neighbors using a full year of earlier contracts, then evaluate the models once on the next complete year with known outcomes.

The [project page source](website/) includes the regional delay map, delay rates by component category, the three confusion matrices, and a chart comparing flags per 100 projects.

## Conclusion

Boosted trees gave the best balance for early monitoring on this split (F1 = 0.6979). A DPWH district engineer could use a flag to decide which project office to call first about site access or an upcoming milestone. At the 0.25 threshold, the model flagged 24,083 contracts. Of those, 16,040 were delayed and 8,043 finished within the allowance. A flag is a reason to check the schedule. The 5,842 delays the model missed are also a reason to keep routine inspections in place.

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

## References

BetterGov.ph. (n.d.). [DPWH infrastructure project records]. *Open Data Portal*. <https://data.bettergov.ph/datasets/19/resources/406>

Chen, T., & Guestrin, C. (2016). XGBoost: A scalable tree boosting system. In *Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining* (pp. 785–794). Association for Computing Machinery. <https://doi.org/10.1145/2939672.2939785>

Department of Public Works and Highways. (n.d.). *DPWH infrastructure projects portal*. <https://transparency.dpwh.gov.ph/>

James, G., Witten, D., Hastie, T., & Tibshirani, R. (2021). *An introduction to statistical learning: With applications in R* (2nd ed.). Springer. <https://doi.org/10.1007/978-1-0716-1418-1>

Kaufman, S., Rosset, S., & Perlich, C. (2011). Leakage in data mining: Formulation, detection, and avoidance. In *Proceedings of the 17th ACM SIGKDD International Conference on Knowledge Discovery and Data Mining* (pp. 556–563). Association for Computing Machinery. <https://doi.org/10.1145/2020408.2020496>

Micci-Barreca, D. (2001). A preprocessing scheme for high-cardinality categorical attributes in classification and prediction problems. *ACM SIGKDD Explorations Newsletter, 3*(1), 27–32. <https://doi.org/10.1145/507533.507538>

National Economic and Development Authority. (2022). *2022 official development assistance (ODA) portfolio review report*. <https://depdev.gov.ph/wp-content/uploads/2023/10/2022-ODA-Portfolio-Review-Report.pdf>

Sokolova, M., & Lapalme, G. (2009). A systematic analysis of performance measures for classification tasks. *Information Processing & Management, 45*(4), 427–437. <https://doi.org/10.1016/j.ipm.2009.03.002>

W3Schools. (n.d.). *Python machine learning: K-nearest neighbors (KNN)*. <https://www.w3schools.com/python/python_ml_knn.asp>

XGBoost Developers. (n.d.). *XGBoost documentation*. <https://xgboost.readthedocs.io/en/stable/>
