# CMSC 170 Project, Milestone 2: Data Preparation and Implementation

**Group Name:** Fantastic 4 vs. VON Doom

**Group Members:**

* Aluag, Zander Ian C. (zianaluag)
* Caraig, Bernard Alejandro C. (herio-nn)
* Perez, Desmond Rainier B. (desmondperez)
* Tandang, Frannieczeska Erene U. (ririlinn)

**Repository:** https://github.com/zianaluag/comparative-ml-study

## Dataset

We used the contract effectivity and expiry dates to work out how long each project was supposed to take. Our CSV loader checked for duplicate contract IDs and missing fields. We sorted the labeled projects by infrastructure year, used the first 80% for training, and kept the last 20% for testing.

## Methods and initial results

The first two sets of results on our project page were for spline logistic regression and k-nearest neighbors (KNN). Both used the same 42,684 test projects. We looked at accuracy, precision, recall, F1, and the confusion matrix to see which delays we caught and how often we raised a false alarm.

* At a threshold of 0.20, spline regression caught 15,949 of the 21,882 delayed projects (72.89% recall).
* With five neighbors, KNN caught 7,335 delays (33.52% recall). It raised fewer flags, and 74.22% of them were correct.

## Progress so far

* Bernard - Wrote the CSV checks and used the training data to scale the numeric columns.
* Desmond - Split the data by year and set up KNN to run on the contracts.
* Frannie - Wrote the spline model and the code to score its predictions.
* Ian - Wrote the boosted tree code for choosing splits, setting leaf values, and predicting delays.

## Problems so far

* Our first loader required a completion date even for ongoing projects. We changed it so we could include contracts that were already past expiry and still under construction.
* KNN checked every training project for each prediction. This took longer on the full dataset. We used this direct search in place of the HNSW search in our proposal.

## Plans for Milestone 3

* Score boosted trees on the same split and put all three methods in one table.
* Compare missed delays and false alarms using the same evaluation function.
