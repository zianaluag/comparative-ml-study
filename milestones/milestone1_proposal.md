# CMSC 170 Project, Milestone 1: Proposal and Setup

**Group Name:** Fantastic 4 vs. VON Doom

**Group Members:**

* Aluag, Zander Ian C. (zianaluag)
* Caraig, Bernard Alejandro C. (herio-nn)
* Perez, Desmond Rainier B. (desmondperez)
* Tandang, Frannieczeska Erene U. (ririlinn)

**Repository:** https://github.com/zianaluag/comparative-ml-study

## Dataset

We are using DPWH infrastructure project data from the BetterGov Open Data Portal (https://data.bettergov.ph/datasets/19) and the DPWH Transparency Portal (https://transparency.dpwh.gov.ph/). The main file has about 248,000 contracts, with budget, project type, location, contractor, status, and actual start and completion dates.

The main file does not have each contract’s planned end date. We collect it from the Transparency Portal’s project pages, along with some bidding details, for a sample of completed contracts (sample size is still under finalization).

## Problem statement

We want to predict whether a DPWH project will be delayed. A project is delayed if it finished after its contract expiry date:

`delay_days = actual completion date − contract expiry date`

We call a project delayed if delay_days is greater than 0. We may use a larger cutoff after looking at the data (tolerance may still vary after the succeeding weeks).

Delayed public projects cost more and take longer to benefit the people who need them. If we can show which kinds of contracts tend to be late, they can be watched more closely.

**Research question (subject to change):** Which contract characteristics are linked to delays, and which method predicts them best?

## Methods

1. Spline logistic regression. Logistic regression is a standard method for yes/no predictions and gives a probability, so we can rank contracts by risk. Splines let each feature have a curved effect instead of a straight line. It is easy to explain, so it might become our baseline.
2. XGBoost-style gradient boosted trees (written from scratch). It builds many small decision trees, where each one fixes the mistakes of the earlier ones. It works well on table data with mixed feature types and is usually accurate.
3. k-Nearest Neighbors with HNSW. It predicts from the most similar past contracts, which is a very different idea from the other two. HNSW is used to speed up the search for neighbors.

## Progress so far

* Repository created, with a basic README and the DPWH data added.
* Found the portal data that contains the planned end date and bidding details, and tested it on sample contracts.
* Defined what “delayed” means and chose the three methods.

## Problems so far

* The main data file has no planned dates, so we collect them from the portal one contract at a time. We will use a sample instead of all contracts.
* We still need to check whether the expiry date on the portal is the original date or one updated after time extensions.
* The data file is in parquet format, so we convert it to CSV once, because pandas is not allowed.

## Plans for Milestone 2

* Data loading and preprocessing code, written from scratch.
* Train/test split plan and evaluation metrics.
* At least two methods working, with first results.