# Predicting Delays in DPWH Infrastructure Projects with Machine Learning

CMSC 170: Introduction to Artificial Intelligence, 1st Semester 2026-2027, UP Los Baños

## Research objective

We’re using past DPWH contracts to see whether we can spot a likely delay when a new contract is awarded. At that point, we already know who the contractor is, where the project will be built, how much is budgeted, and how long the work is supposed to take. If those details can give an early warning, they could help DPWH decide which projects to check on more closely.

We look at how often projects ran late across regions, provinces, project categories, and contractors. We also want to see which of our three models does the best job on newer contracts after training on older ones. For that comparison, we’ll look at both the delays each model misses and the on-time projects it flags.

## Data

We use `datasets/dpwh_data.csv`. The project records come from the [BetterGov Open Data Portal](https://data.bettergov.ph/datasets/19/resources/406). The contract dates come from the [DPWH Transparency Portal](https://transparency.dpwh.gov.ph/).

We sort the records by infrastructure year. The first 80% go into the training set and the last 20% go into the test set. We use the training set to work out category frequencies and scale the features.

## What counts as delayed?

`src/preprocessing.py` assigns each project a label using its status, reported progress, and completion date. The planned duration is the number of days from the contract effectivity date to the recorded expiry date.

- A **terminated** project gets `1` (delayed).
- A project marked **completed** with progress below 100% also gets `1`, even if its completion date falls before expiry.
- For a **completed** project with at least 100% progress, we check how many days it finished past expiry. If that exceeds 5% of the planned duration, it gets `1`. Otherwise, it gets `0` (within the allowance).
- Statuses such as **for procurement** or **not yet started** are left unlabeled (`None`). The XGBoost script drops unlabeled rows from each set after the split.

For example, take a 100-day contract marked 100% complete. Finishing five days past expiry gives it `0`. Finishing six days past expiry gives it `1`.

There’s also an unfinished check for **ongoing** projects. The intended rule is to mark them delayed once their expiry date passes and leave them unlabeled until then. With the current `datetime` import, the call to `datetime.now()` raises an error if an ongoing record with an expiry date reaches that check. The loader requires a completion date, and only completed and terminated records pass it in the current CSV.

## Methods so far

- **Spline logistic regression** (`src/spline_logreg.py`) has training and prediction functions. It uses quadratic splines for budget, year, and planned duration. This lets an extra month on a short contract affect the estimated risk differently from an extra month on a long one.
- **Extreme Gradient Boosting (XGBoost) decision trees** (`src/gradient_boosted_trees.py`). We wrote a simplified version in NumPy. Each tree adjusts the scores from the earlier trees. The script runs from the CSV through evaluation and predicts `1` when the estimated probability of delay is at least `0.5` by default.
- **k-nearest neighbors** (`src/knn.py`) checks the Euclidean distance to every training project and takes the most common label among the closest `k`. The faster HNSW search mentioned in our proposal is still on the to-do list.

We still need to run spline logistic regression and KNN on the same split as the XGBoost model to finish the comparison.

## Running the code

From the repo root, install NumPy with `python -m pip install numpy`. You can then run either script.

```bash
# check the data split and past delay rates
python src/preprocessing.py

# train and evaluate the XGBoost decision trees
python src/gradient_boosted_trees.py
```

## Members

- Aluag, Zander Ian C. ([zianaluag](https://github.com/zianaluag))
- Caraig, Bernard Alejandro C. ([herio-nn](https://github.com/herio-nn))
- Perez, Desmond Rainier B. ([desmondperez](https://github.com/desmondperez))
- Tandang, Frannieczeska Erene U. ([ririlinn](https://github.com/ririlinn))