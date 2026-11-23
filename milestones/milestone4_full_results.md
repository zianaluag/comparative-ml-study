# CMSC 170 Project, Milestone 4: Full Results

**Group Name:** Fantastic 4 vs. VON Doom

**Group Members:**

* Aluag, Zander Ian C. (zianaluag)
* Caraig, Bernard Alejandro C. (herio-nn)
* Perez, Desmond Rainier B. (desmondperez)
* Tandang, Frannieczeska Erene U. (ririlinn)

**Repository:** https://github.com/zianaluag/comparative-ml-study

## Final settings and results

For boosted trees, we used F1 on the last fifth of the training set to choose the tree count, depth, and flag threshold. We then trained 90 trees with a maximum depth of five on the full training set. The spline script reported results at thresholds of 0.50, 0.40, 0.30, and 0.20. We used 0.20 for the comparison. KNN used five neighbors.

| Method | Setting | Delays caught | Delays missed | False alarms | F1 |
| --- | --- | ---: | ---: | ---: | ---: |
| Spline logistic regression | Threshold 0.20 | 15,949 | 5,933 | 9,397 | 0.6754 |
| Gradient boosted trees | Threshold 0.25 | 16,040 | 5,842 | 8,043 | 0.6979 |
| KNN | Five neighbors | 7,335 | 14,547 | 2,548 | 0.4618 |

The [README](../README.md#results) has the full score table. The [project page](https://zianaluag.github.io/comparative-ml-study/#results) also shows the three confusion matrices and the number of flags per 100 projects.

We would start with boosted trees if a district engineer needed a list of schedules to check first. Out of 24,083 flagged contracts, 16,040 were delayed and 8,043 finished within the allowance. The trees also missed 5,842 delays, so projects without a flag would still need routine checks.

## Progress so far

* Ian - Finished the results write-up, set up GitHub Pages, and worked on the slides.
* Bernard - Wrote the data checks and delay-rate code used in the final runs.
* Desmond - Wrote the limitations section on missing records, site conditions, and project costs.
* Frannie - Added the regional map, the chart by project type, and the first two confusion matrices to the webpage.

## Problems so far

* Both sets contain contracts from 2024. Testing on a whole later year would give us a better idea of how the models work on new contracts.
* The data gives us the approved budget but leaves out final costs. We can count late projects, but we can’t say how many pesos an earlier inspection would save.

## Plans for presentation day

* Add the slides link to the project page.
* Pick one missed delay and one false alarm to walk through during Q&A. Each member should be ready to explain how we split the data and scored a prediction.
