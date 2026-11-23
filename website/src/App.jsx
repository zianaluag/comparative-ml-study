import { useEffect, useRef, useState } from "react";
import "./App.css";
import logo from "./assets/fantastic-four-logo.png";
import bgImage from "./assets/page-background.png";
import zanderAvatar from "./assets/ian-avatar.png";
import bernardAvatar from "./assets/bernard-avatar.png";
import frannieAvatar from "./assets/frannie-avatar.png";
import desmondAvatar from "./assets/desmond-avatar.png";
import categoryChart from "./assets/delay-rates-by-component-category.png";

const modelResults = [
  {
    name: "Spline Logistic Regression",
    shortName: "Spline model",
    color: "text-orange",
    setting: "Threshold 0.20",
    tp: 15949, fn: 5933, fp: 9397, tn: 11405,
  },
  {
    name: "Gradient Boosted Trees",
    shortName: "Boosted trees",
    color: "text-teal",
    setting: "Threshold 0.25",
    tp: 16040, fn: 5842, fp: 8043, tn: 12759,
  },
  {
    name: "k-Nearest Neighbors",
    shortName: "KNN",
    color: "text-pink",
    setting: "k = 5",
    tp: 7335, fn: 14547, fp: 2548, tn: 18254,
  },
].map((model) => {
  const { tp, fn, fp, tn } = model;
  const total = tp + fn + fp + tn;
  return {
    ...model,
    total,
    accuracy: (tp + tn) / total,
    precision: tp / (tp + fp),
    recall: tp / (tp + fn),
    f1: (2 * tp) / (2 * tp + fp + fn),
    falseAlarmRate: fp / (fp + tn),
  };
});

function ComparisonTable() {
  return (
    <div className="scores-card">
      <h3 className="discussion-heading" id="scores-heading">Test set scores</h3>
      <div className="scores-scroll" role="region" aria-labelledby="scores-heading" tabIndex={0}>
        <table className="scores-table" aria-labelledby="scores-heading">
          <thead>
            <tr>
              <th scope="col">Method</th>
              <th scope="col" className="setting-column">Setting</th>
              <th scope="col">Accuracy</th>
              <th scope="col">Precision</th>
              <th scope="col">Recall</th>
              <th scope="col">F1</th>
            </tr>
          </thead>
          <tbody>
            {modelResults.map((model) => (
              <tr key={model.name}>
                <th scope="row" className={model.color}>{model.name}</th>
                <td className="setting-column">{model.setting}</td>
                <td data-label="Accuracy">{(100 * model.accuracy).toFixed(2)}%</td>
                <td data-label="Precision">{(100 * model.precision).toFixed(2)}%</td>
                <td data-label="Recall">{(100 * model.recall).toFixed(2)}%</td>
                <td data-label="F1">{model.f1.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ConfusionMatrix({ name, color, tp, fn, fp, tn, total }) {
  const rows = [
    { label: "Delayed", flagged: tp, unflagged: fn, colors: ["cell-navy", "cell-steel"] },
    { label: "Within allowance", flagged: fp, unflagged: tn, colors: ["cell-mid", "cell-royal"] },
  ];

  return (
    <table className="confusion-matrix">
      <caption className={color}>{name}</caption>
      <thead>
        <tr>
          <th scope="col">Outcome</th>
          <th scope="col">Flagged</th>
          <th scope="col">Unflagged</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ label, flagged, unflagged, colors }) => (
          <tr key={label}>
            <th scope="row">{label}</th>
            {[flagged, unflagged].map((count, col) => (
              <td key={col} className={colors[col]}>
                <strong>{count.toLocaleString("en-US")}</strong>
                <span>{Math.round(100 * count / total)}%</span>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FlagChart() {
  const groups = [
    { label: "Delayed projects", rate: "recall" },
    { label: "Projects within the allowance", rate: "falseAlarmRate" },
  ];

  return (
    <figure className="flag-chart">
      <figcaption className="discussion-heading">Flags per 100 projects</figcaption>
      {groups.map(({ label, rate }) => (
        <div className="flag-group" key={rate}>
          <h4>{label}</h4>
          {modelResults.map((model) => {
            const perHundred = Math.round(100 * model[rate]);
            return (
              <div className="flag-row" key={model.name}>
                <span>{model.shortName}</span>
                <span className="flag-track" aria-hidden="true">
                  <span className={model.color} style={{ width: perHundred + "%" }} />
                </span>
                <strong>{perHundred}</strong>
              </div>
            );
          })}
        </div>
      ))}
    </figure>
  );
}

const sections = [
  ["home", "Overview"],
  ["dataset", "Dataset"],
  ["models", "Models"],
  ["results", "Results"],
  ["limitations", "Limitations"],
  ["conclusion", "Conclusion"],
  ["about", "Team"],
  ["references", "References"],
];

function SiteHeader() {
  const [currentSection, setCurrentSection] = useState("home");
  const header = useRef(null);

  useEffect(() => {
    const targets = sections.map(([id]) => document.getElementById(id));
    function updateSection() {
      const marker = header.current.offsetHeight + 24;
      const current = targets.findLast((section) => section.getBoundingClientRect().top <= marker);
      const atBottom = Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight;
      setCurrentSection(atBottom ? "references" : (current?.id ?? "home"));
    }

    if (window.location.hash && window.scrollY === 0) {
      const target = document.getElementById(window.location.hash.slice(1));
      target?.scrollIntoView({ behavior: "instant" });
    }
    updateSection();
    window.addEventListener("scroll", updateSection, { passive: true });
    window.addEventListener("resize", updateSection);
    return () => {
      window.removeEventListener("scroll", updateSection);
      window.removeEventListener("resize", updateSection);
    };
  }, []);

  function jumpToSection(event) {
    const id = event.target.value;
    if (window.location.hash === "#" + id) {
      document.getElementById(id).scrollIntoView();
    } else {
      window.location.hash = id;
    }
  }

  return (
    <header className="navbar" ref={header}>
      <div className="nav-container">
        <a href="#home" className="brand" aria-label="DPWH Project Delay Study, overview">
          <img src={logo} alt="" className="logo" />
          <span className="site-name">DPWH Project Delay Study</span>
        </a>
        <nav aria-label="Project sections">
          <div className="nav-links">
            {sections.map(([id, label]) => (
              <a key={id} href={"#" + id} aria-current={currentSection === id ? "location" : undefined}>
                {label}
              </a>
            ))}
          </div>
          <label className="section-picker">
            Jump to
            <select
              aria-label="Jump to section"
              value={currentSection}
              onChange={jumpToSection}
            >
              {sections.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </label>
        </nav>
      </div>
    </header>
  );
}

function App() {
  // Automatically resize the Datawrapper iframe height
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data["datawrapper-height"] !== undefined) {
        const iframes = document.querySelectorAll("iframe");
        for (const key in e.data["datawrapper-height"]) {
          for (let i = 0; i < iframes.length; i++) {
            if (iframes[i].contentWindow === e.source) {
              iframes[i].style.height = e.data["datawrapper-height"][key] + "px";
            }
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="page">
      <a className="skip-link" href="#main-content">Skip to study</a>
      <SiteHeader />

      <main className="content" id="main-content" tabIndex={-1}>
        <div id="home" className="study-intro" style={{ "--intro-art": `url(${bgImage})` }}>
          <div className="intro-inner">
            <section className="hero-section" aria-labelledby="study-title">
              <h1 id="study-title" className="hero-title">
                <span className="hero-number">3</span> Approaches to Predicting{" "}
                <span className="text-teal">Contract Risk</span>
              </h1>
              <p className="hero-text">
                A bridge that opens late can mean a longer trip to school or work.
                We asked whether the Department of Public Works and Highways (DPWH)
                could use the details available at contract award to decide which
                projects need an early schedule check. We compared{" "}
                <span className="text-orange">Spline Logistic Regression</span>,{" "}
                <span className="text-teal">
                  XGBoost-style Gradient Boosted Trees
                </span>
                , and{" "}
                <span className="text-pink">k-Nearest Neighbors</span> on the same
                test projects.
              </p>
            </section>

            <section id="abstract" className="abstract-section" aria-labelledby="abstract-heading">
              <h2 id="abstract-heading">Abstract</h2>
              <p>
                We compared delay rates across regions and project types, then tested
                three models on the same 42,684 contracts. Boosted trees caught about{" "}
                <strong>73 of every 100</strong> delayed projects. KNN was right most often when it
                raised a flag, though it caught only <strong>34 of every 100</strong> delays.
              </p>
              <a className="results-link" href="#results">View results</a>
            </section>
          </div>
        </div>

        {/* Section 3: Dataset */}
        <section id="dataset" className="section dataset-section">
          <h2 className="section-heading">Dataset</h2>

          <div className="dataset-grid">
            <div className="dataset-info">
              <div className="dataset-text">
                <p>
                  Our dataset integrates public infrastructure contract records
                  from the{" "}
                  <a className="text-teal" href="https://data.bettergov.ph/datasets/19/resources/406">
                    BetterGov Open Data Portal
                  </a>{" "}
                  and project-level schedule and bidding records from the{" "}
                  <a className="text-teal" href="https://transparency.dpwh.gov.ph/">
                    DPWH Transparency Portal
                  </a> (BetterGov.ph, n.d.; Department of Public Works and Highways, n.d.),
                  spanning 215,277 contracts across 19 regions with 220 location
                  labels in the province field (2016-2026).
                </p>

                <p>
                  We train on budget, infrastructure year, planned duration,
                  latitude, longitude, region, province, category, component
                  category, and contractor. The median budget in the source
                  records is ₱9.85M.
                </p>

                <p>
                  Among 188,401 completed contracts with both dates recorded,
                  24.16% (45,514 projects) finished past their recorded expiry
                  dates. This describes the raw records.
                </p>

                <p>
                  For the model comparison, we kept 213,418 labeled projects
                  through 2025. For completed contracts with a recorded completion
                  date, we counted a delay if the project finished more than 5% of
                  its planned duration past expiry or reported less than 100%
                  progress. We also counted terminated contracts and ongoing
                  contracts past expiry as delayed.
                </p>
              </div>

              <figure>
                <img
                  src={categoryChart}
                  width="716"
                  height="586"
                  alt="Percentage of projects labeled delayed by component category"
                  className="category-chart-img"
                />
                <figcaption>
                  Delay rates for selected component categories in the labeled
                  projects through 2025.
                </figcaption>
              </figure>
            </div>

            <figure className="dataset-map">
              <iframe
                title="DPWH Infrastructure Project Delay Rates Across Philippine Regions"
                id="datawrapper-chart-Qc79t"
                src="https://datawrapper.dwcdn.net/Qc79t/8/"
                scrolling="no"
                height="936"
                data-external="1"
              />
              <figcaption><a href="https://datawrapper.dwcdn.net/Qc79t/8/">Open regional map</a></figcaption>
            </figure>
          </div>
        </section>

        {/* Section 4: Three Approaches */}
        <section id="models" className="section models-section">
          <h2 className="section-heading">Models</h2>
          <div className="study-columns">
            <article>
              <h3 className="text-orange">Spline Logistic Regression</h3>
              <p>
                Estimates delay probabilities using quadratic splines. The
                splines let numerical features have curved effects, such as
                planned duration having a different effect for short and long
                contracts (James et al., 2021). We use two knots per feature and train for 200
                epochs with a learning rate of 0.1 and L2 regularization of 0.01.
              </p>
            </article>

            <article>
              <h3 className="text-teal">Gradient Boosted Trees</h3>
              <p>
                Each tree adjusts the earlier trees' predictions (Chen &amp; Guestrin, 2016;
                XGBoost Developers, n.d.). We chose the tree count, depth, and
                delay threshold by F1 on the last fifth of the training set.
                We then trained 90 trees on the full training set with a maximum
                depth of 5, a learning rate of 0.1, and L2 regularization of 1.0.
              </p>
            </article>

            <article>
              <h3 className="text-pink">k-Nearest Neighbors</h3>
              <p>
                KNN predicts a class by majority vote among nearby examples (W3Schools, n.d.).
                We measure similarity using Euclidean distance. The five closest
                training projects vote on the delay label.
              </p>
            </article>
          </div>

          <div className="study-note">
            <h3 className="discussion-heading">Shared preprocessing</h3>
            <p>
              For all three models, we pulled each category’s delay rate toward the overall
              training rate (Micci-Barreca, 2001). Keeping test labels out of these rates
              prevents data leakage (Kaufman et al., 2011). The spline model and KNN also
              scale their inputs using training statistics.
            </p>
          </div>
        </section>

        {/* Section 5: Results and Discussion */}
        <section id="results" className="section results-section">
          <h2 className="section-heading">
            Results &amp; Discussion
          </h2>

          <div className="results-setup">
            <div>
              <h3>Test split</h3>
              <p>
                We sorted contracts by infrastructure year and trained on the first
                170,734 (80%). Of the 42,684 contracts in the test set, 21,882 were
                labeled delayed and 20,802 were within the allowance. Both sets include
                contracts from 2024.
              </p>
            </div>
            <div>
              <h3>Reading the scores</h3>
              <p>
                Precision tells us how often a flag was right. Recall tells us how
                many delays we caught. We used F1 to weigh both because a missed
                delay can go unchecked and a false alarm takes staff time to review
                (Sokolova &amp; Lapalme, 2009).
              </p>
            </div>
          </div>

          <div className="results-grid">
            <ComparisonTable />
            <div className="heatmaps-card">
              <h3 className="discussion-heading">Confusion matrices</h3>
              <p>Percentages use all 42,684 test projects.</p>
              {modelResults.map((model) => (
                <ConfusionMatrix key={model.name} {...model} />
              ))}
            </div>
            <FlagChart />
          </div>

          <div className="prose-pair">
            <h3 className="discussion-heading">Why the flags differed</h3>
            <p>
              Boosted trees caught 91 more delays than spline logistic regression
              and raised 1,354 fewer false alarms. A tree can split projects by
              budget and then use a different duration cutoff in each budget group.
              Our spline model fits a separate curve for each numerical feature and
              adds their effects. Being able to combine features may have helped
              the trees. The flag thresholds also differed (0.25 for trees and 0.20
              for spline), so the scores reflect both choices.
            </p>
            <p>
              KNN needs at least three of its five closest training projects to
              have a delay before it raises a flag. About 27% of the training
              projects were labeled delayed, compared with 51% in the test set.
              A vote among older contracts could therefore favor the on-time
              label. KNN flagged just 9,883 contracts. Of those flags, 74.22%
              were correct, and 14,547 delays went unflagged.
            </p>
          </div>
        </section>
        
        {/* Limitations */}
        <section id="limitations" className="section limitations-section">
          <h2 className="section-heading">Limitations</h2>
          <div className="study-columns">
            <article>
              <h3>Which projects qualified?</h3>
              <p>
                We dropped records with missing required dates or coordinates.
                An ongoing contract could enter the comparison once it was
                overdue. One still within its schedule had no label yet.
                This affects which recent projects we can evaluate. The 5%
                allowance is our study's rule for labeling completed projects.
              </p>
            </article>

            <article>
              <h3>What the records leave out</h3>
              <p>
                The records capture a project at one point in time. They leave
                out later updates, weather disruptions, and contractor workload.
                In its 2022 aid portfolio review, the National Economic and
                Development Authority (2022, p. 68) reported that site conditions
                or availability delayed 23 projects. Examples included land
                acquisition and permits. Our data cannot tell us whether a
                particular flagged project faces either problem.
              </p>
            </article>

            <article>
              <h3>What a delay might cost</h3>
              <p>
                Budgets vary widely and some records list a zero budget. The
                dataset gives the approved budget but leaves out final project
                costs. We can count late projects, but we cannot say how many
                pesos an earlier inspection would have saved.
              </p>
            </article>
          </div>

          <div className="study-note">
            <h3 className="discussion-heading">What we would test next</h3>
            <p>
              We would use one full year of earlier contracts to choose the flag
              thresholds for trees and spline and the number of neighbors for
              KNN. Then we would test all three once on the next complete year
              of labeled contracts. This would give us a better check on how
              the models hold up when a new year of projects comes in.
            </p>
          </div>
        </section>

        <section id="conclusion" className="section">
          <h2 className="section-heading">Conclusion</h2>
          <div className="prose-pair">
            <p>
              If a DPWH district office wanted a list of schedules to check
              first, we would start with boosted trees. At the 0.25 threshold
              they had the highest F1 (0.6979) and caught 16,040 delays. A flag
              on a bridge repair could prompt an engineer to call the project
              office and ask whether the site is ready for work.
            </p>
            <p>
              Following up every flag in our test set would mean checking
              24,083 schedules. Of those projects, 8,043 finished within the
              allowance. The trees also missed 5,842 delays,
              so projects with no flag still need routine monitoring.
            </p>
          </div>
        </section>
        {/* Section 6: Team */}
        <section id="about" className="section team-section">
          <h2 className="section-heading">Team</h2>

          <div className="team-intro">
            <p>
              We are <span className="text-teal">Fantastic 4 vs. VON Doom</span>,
              a team of BS Computer Science students from the{" "}
              <span className="text-teal">
                University of the Philippines Los Baños
              </span>
              . We developed this project for our{" "}
              <span className="text-teal">
                CMSC 170: Introduction to Artificial Intelligence
              </span>{" "}
              course.
            </p>
            <p>
              <a className="text-teal" href="https://github.com/zianaluag/comparative-ml-study">
                Project repository
              </a>
            </p>
          </div>

          <div className="team-row">
            <div className="team-member">
              <img
                src={zanderAvatar}
                alt="Aluag, Zander Ian C."
                className="avatar"
              />
              <span className="member-name text-red">Aluag, Zander Ian C.</span>
            </div>

            <div className="team-member">
              <img
                src={bernardAvatar}
                alt="Caraig, Bernard Alejandro C."
                className="avatar"
              />
              <span className="member-name text-teal">
                Caraig, Bernard Alejandro C.
              </span>
            </div>

            <div className="team-member">
              <img
                src={frannieAvatar}
                alt="Tandang, Frannieczeska Erene U."
                className="avatar"
              />
              <span className="member-name text-cream">
                Tandang, Frannieczeska Erene U.
              </span>
            </div>

            <div className="team-member">
              <img
                src={desmondAvatar}
                alt="Perez, Desmond Rainier B."
                className="avatar"
              />
              <span className="member-name text-orange">
                Perez, Desmond Rainier B.
              </span>
            </div>
          </div>
        </section>
        <section id="references" className="section" aria-labelledby="references-heading">
          <h2 id="references-heading" className="section-heading">References</h2>
          <ul className="reference-list">
            <li>
              BetterGov.ph. (n.d.). [DPWH infrastructure project records]. <em>Open Data Portal</em>.{" "}
              <a className="text-teal" href="https://data.bettergov.ph/datasets/19/resources/406">https://data.bettergov.ph/datasets/19/resources/406</a>
            </li>
            <li>
              Chen, T., &amp; Guestrin, C. (2016). XGBoost: A scalable tree boosting system. In <em>Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining</em> (pp. 785–794). Association for Computing Machinery.{" "}
              <a className="text-teal" href="https://doi.org/10.1145/2939672.2939785">https://doi.org/10.1145/2939672.2939785</a>
            </li>
            <li>
              Department of Public Works and Highways. (n.d.). <em>DPWH infrastructure projects portal</em>.{" "}
              <a className="text-teal" href="https://transparency.dpwh.gov.ph/">https://transparency.dpwh.gov.ph/</a>
            </li>
            <li>
              James, G., Witten, D., Hastie, T., &amp; Tibshirani, R. (2021). <em>An introduction to statistical learning: With applications in R</em> (2nd ed.). Springer.{" "}
              <a className="text-teal" href="https://doi.org/10.1007/978-1-0716-1418-1">https://doi.org/10.1007/978-1-0716-1418-1</a>
            </li>
            <li>
              Kaufman, S., Rosset, S., &amp; Perlich, C. (2011). Leakage in data mining: Formulation, detection, and avoidance. In <em>Proceedings of the 17th ACM SIGKDD International Conference on Knowledge Discovery and Data Mining</em> (pp. 556–563). Association for Computing Machinery.{" "}
              <a className="text-teal" href="https://doi.org/10.1145/2020408.2020496">https://doi.org/10.1145/2020408.2020496</a>
            </li>
            <li>
              Micci-Barreca, D. (2001). A preprocessing scheme for high-cardinality categorical attributes in classification and prediction problems. <em>ACM SIGKDD Explorations Newsletter, 3</em>(1), 27–32.{" "}
              <a className="text-teal" href="https://doi.org/10.1145/507533.507538">https://doi.org/10.1145/507533.507538</a>
            </li>
            <li>
              National Economic and Development Authority. (2022). <em>2022 official development assistance (ODA) portfolio review report</em>.{" "}
              <a className="text-teal" href="https://depdev.gov.ph/wp-content/uploads/2023/10/2022-ODA-Portfolio-Review-Report.pdf">https://depdev.gov.ph/wp-content/uploads/2023/10/2022-ODA-Portfolio-Review-Report.pdf</a>
            </li>
            <li>
              Sokolova, M., &amp; Lapalme, G. (2009). A systematic analysis of performance measures for classification tasks. <em>Information Processing &amp; Management, 45</em>(4), 427–437.{" "}
              <a className="text-teal" href="https://doi.org/10.1016/j.ipm.2009.03.002">https://doi.org/10.1016/j.ipm.2009.03.002</a>
            </li>
            <li>
              W3Schools. (n.d.). <em>Python machine learning: K-nearest neighbors (KNN)</em>.{" "}
              <a className="text-teal" href="https://www.w3schools.com/python/python_ml_knn.asp">https://www.w3schools.com/python/python_ml_knn.asp</a>
            </li>
            <li>
              XGBoost Developers. (n.d.). <em>XGBoost documentation</em>.{" "}
              <a className="text-teal" href="https://xgboost.readthedocs.io/en/stable/">https://xgboost.readthedocs.io/en/stable/</a>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
