import { useEffect } from "react";
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
    color: "text-orange",
    setting: "Delay threshold 0.20",
    tp: 15949, fn: 5933, fp: 9397, tn: 11405,
  },
  {
    name: "Gradient Boosted Trees",
    color: "text-teal",
    setting: "Delay threshold 0.25",
    tp: 16040, fn: 5842, fp: 8043, tn: 12759,
  },
  {
    name: "k-Nearest Neighbors",
    color: "text-pink",
    setting: "5 neighbors",
    tp: 7335, fn: 14547, fp: 2548, tn: 18254,
  },
];

function ModelResult({ name, color, setting, tp, fn, fp, tn }) {
  const total = tp + fn + fp + tn;
  const cells = [
    ["TP", tp, "cell-navy"],
    ["FN", fn, "cell-steel"],
    ["FP", fp, "cell-mid"],
    ["TN", tn, "cell-royal"],
  ];
  const metrics = [
    ["Accuracy", (100 * (tp + tn) / total).toFixed(2) + "%", "text-cream"],
    ["Recall", (100 * tp / (tp + fn)).toFixed(2) + "%", "text-teal"],
    ["Precision", (100 * tp / (tp + fp)).toFixed(2) + "%", "text-orange"],
    ["F1", (2 * tp / (2 * tp + fp + fn)).toFixed(4), "text-pink"],
  ];

  return (
    <div className="card heatmap-panel">
      <h3 className={"heatmap-title " + color}>{name}</h3>
      <div className="cm-grid">
        {cells.map(([label, count, shade]) => (
          <div className={"cm-cell " + shade} key={label}>
            <span className="cm-label">{label}</span>
            <span className="cm-value">{count.toLocaleString("en-US")}</span>
            <span className="cm-pct">{Math.round(100 * count / total)}%</span>
          </div>
        ))}
      </div>
      <span className={"heatmap-subtitle " + color}>{setting}</span>
      <div className="metrics-strip">
        {metrics.map(([label, value, shade]) => (
          <div className="metric-pill" key={label}>
            <span className="metric-name">{label}</span>
            <span className={"metric-val " + shade}>{value}</span>
          </div>
        ))}
      </div>
    </div>
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
    <div
      className="page"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Top Navigation */}
      <header className="navbar">
        <div className="nav-container">
          <a href="#home" className="logo-link">
            <img src={logo} alt="Fantastic 4 Logo" className="logo" />
          </a>
          <nav className="nav-links">
            <a href="#home" className="nav-home">Home</a>
            <a href="#dataset" className="nav-dataset">Dataset</a>
            <a href="#models" className="nav-models">Models</a>
            <a href="#results" className="nav-results">Results</a>
            <a href="#about" className="nav-about">About Us</a>
          </nav>
        </div>
      </header>

      <main className="content">
        {/* Section 1: Hero */}
        <section id="home" className="section hero-section">
          <h1 className="hero-title">
            <span className="hero-number">3</span> Approaches to
            <br />
            Predicting
            <br />
            <span className="text-teal">Contract Risk</span>
          </h1>

          <p className="hero-text">
            Public infrastructure delays drive up costs and delay essential
            community benefits. Analyzing DPWH contract records from the
            BetterGov Open Data Portal and bidding and expiry data from the DPWH
            Transparency Portal, we compare how well three models flag
            infrastructure projects at risk of delay. We implemented and tested{" "}
            <span className="text-orange">Spline Logistic Regression</span>,{" "}
            <span className="text-teal">
              XGBoost-style Gradient Boosted Trees
            </span>
            , and{" "}
            <span className="text-pink">k-Nearest Neighbors</span> on the same
            test projects.
          </p>
        </section>

        {/* Section 2: Abstract */}
        <section id="abstract" className="section abstract-section">
          <h2 className="section-heading text-orange">Abstract</h2>
          <div className="card abstract-card">
            <p>
              We study Department of Public Works and Highways (DPWH) contracts
              to see which projects could benefit from closer monitoring. We
              compare historical delay rates across project groups and use a
              shared test set to measure how often each model catches delays
              and flags projects that finish within the allowance.
            </p>
          </div>
        </section>

        {/* Section 3: Dataset */}
        <section id="dataset" className="section dataset-section">
          <h2 className="section-heading text-orange">Dataset</h2>

          <div className="dataset-row">
            <div className="dataset-map-wrapper">
              <iframe
                title="DPWH Infrastructure Project Delay Rates Across Philippine Regions"
                aria-label="Choropleth map"
                id="datawrapper-chart-Qc79t"
                src="https://datawrapper.dwcdn.net/Qc79t/8/"
                scrolling="no"
                frameBorder="0"
                style={{ width: "0", minWidth: "100%", border: "none" }}
                height="936"
                data-external="1"
              />
            </div>

            <div className="dataset-right">
              <div className="card dataset-card">
                <p>
                  Our dataset integrates public infrastructure contract records
                  from the{" "}
                  <a className="text-teal" href="https://data.bettergov.ph/datasets/19/resources/406">
                    BetterGov Open Data Portal
                  </a>{" "}
                  and project-level schedule and bidding records from the{" "}
                  <a className="text-teal" href="https://transparency.dpwh.gov.ph/">
                    DPWH Transparency Portal
                  </a>,
                  spanning <span className="text-orange">215,277 contracts</span>{" "}
                  across <span className="text-orange">19 regions</span> with{" "}
                  <span className="text-orange">
                    220 location labels
                  </span>{" "}
                  in the province field (2016-2026).
                </p>

                <p>
                  We train on budget, infrastructure year, planned duration,
                  latitude, longitude, region, province, category, component
                  category, and contractor. The median budget in the source
                  records is <span className="text-teal">₱9.85M</span>.
                </p>

                <p>
                  Among{" "}
                  <span className="text-pink">
                    188,401 completed contracts
                  </span>{" "}
                  with both dates recorded,{" "}
                  <span className="text-pink">24.16% (45,514 projects)</span>{" "}
                  finished past their recorded expiry dates. This describes the
                  raw records.
                </p>

                <p>
                  For the model comparison, we kept 213,418 labeled projects
                  through 2025. A completed project is labeled delayed if it
                  finishes past expiry by more than 5% of its planned duration
                  or reports less than 100% progress. Terminated projects and
                  ongoing projects past expiry also count as delayed.
                </p>
              </div>

              <figure className="card dataset-chart-card">
                <img
                  src={categoryChart}
                  alt="Percentage of projects labeled delayed by component category"
                  className="category-chart-img"
                />
                <figcaption>
                  Delay rates for selected component categories in the labeled
                  projects through 2025.
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Section 4: Three Approaches */}
        <section id="models" className="section models-section">
          <h2 className="section-heading text-orange">Models</h2>
          <div className="models-grid">
            <div className="model-column">
              <h3 className="model-title text-orange">
                1. Spline Logistic Regression
              </h3>
              <div className="card model-card">
                <p>
                  Estimates delay probabilities using quadratic splines. The
                  splines let numerical features have curved effects, such as
                  planned duration having a different effect for short and long
                  contracts. We use two knots per feature and train for 200
                  epochs with a learning rate of 0.1 and L2 regularization of 0.01.
                </p>
              </div>
            </div>

            <div className="model-column">
              <h3 className="model-title text-teal">
                2. Gradient Boosted Trees
              </h3>
              <div className="card model-card">
                <p>
                  Each tree adjusts the earlier trees' predictions. We use 90
                  trees with a maximum depth of 5, a learning rate of 0.1, and
                  L2 regularization of 1.0.
                </p>
              </div>
            </div>

            <div className="model-column">
              <h3 className="model-title text-pink">
                3. k-Nearest Neighbors
              </h3>
              <div className="card model-card">
                <p>
                  Evaluates new contracts by retrieving the most similar
                  historical projects using Euclidean distance. The five closest
                  training projects vote on the delay label.
                </p>
              </div>
            </div>
          </div>

          <div className="card summary-card">
            <p>
            The training set provided the category delay rates for all three
            models. The spline model and KNN also scale their inputs using
            training statistics.
            </p>
          </div>
        </section>

        {/* Section 5: Results and Discussion */}
        <section id="results" className="section results-section">
          <h2 className="section-heading text-orange">
            Preliminary Results &amp; Discussion
          </h2>

          <div className="card results-setup">
            <p>
              We sorted the projects by infrastructure year and trained on the
              first 80% (170,734 projects). The last 20% (42,684 projects) formed
              the test set. Both sets contain projects from 2024.
            </p>
            <p>
              Each percentage in the confusion matrices is a share of the full
              test set. Precision measures how often a delay flag is correct.
              Recall measures how many actual delays we catch, and F1 combines
              precision and recall.
            </p>
          </div>

          <div className="heatmaps-row">
            {modelResults.map((result) => (
              <ModelResult key={result.name} {...result} />
            ))}
          </div>

          <div className="card discussion-card">
            <h3 className="discussion-heading text-teal">
              Comparative Analysis &amp; Oversight Implications
            </h3>
            <p>
              Gradient boosted trees had the highest F1 on this split and
              caught 16,040 of the 21,882 delayed projects. At a threshold of
              0.20, spline logistic regression caught 15,949.
            </p>
            <p>
              KNN had the highest precision. It flagged 2,548 projects that
              finished within the allowance and missed 14,547 actual delays.
            </p>
          </div>
        </section>
        
        {/* Section 5: Limitations */}
        <section id="limitations" className="section limitations-section">
          <h2 className="section-heading text-orange">Limitations</h2>

          <div className="models-grid">
            <div className="model-column">
              <h3 className="model-title text-orange">
                1. Missingness &amp; Censoring Bias
              </h3>
              <div className="card model-card">
                <p>
                  Merging records across portals leaves gaps and drops entries
                  missing valid dates or{" "}
                  <span className="text-orange">latitude/longitude</span>{" "}
                  coordinates, which may underrepresent certain regions and years.
                  Excluding uncompleted ongoing contracts and using a{" "}
                  <span className="text-orange">5% grace window</span> also
                  introduces survivorship and proxy-label bias.
                </p>
              </div>
            </div>

            <div className="model-column">
              <h3 className="model-title text-teal">
                2. Static Snapshot &amp; Missing Context
              </h3>
              <div className="card model-card">
                <p>
                  Because the dataset reflects a{" "}
                  <span className="text-teal">point-in-time scrape</span>,
                  post-scrape status updates and approved time extensions are
                  absent. Public contract metadata also omits on-the-ground
                  drivers such as{" "}
                  <span className="text-teal">right-of-way disputes</span>,
                  weather disruptions, and concurrent contractor workload.
                </p>
              </div>
            </div>

              <div className="model-column">
              <h3 className="model-title text-pink">
                3. Data Skew, Cost Gaps &amp; Modeling Trade-Offs
              </h3>
              <div className="card model-card">
                <p>
                  Contract records span shifting procurement rules across years,
                  exhibit heavy{" "}
                  <span className="text-pink">budget skew</span> and zero-value
                  anomalies, and lack final{" "}
                  <span className="text-pink">actual project costs</span>, only
                  recording approved contract budgets.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Section 6: Team */}
        <section id="about" className="section team-section">
          <h2 className="section-heading text-orange">Team</h2>

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

          <div className="card team-card">
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
        </section>
      </main>
    </div>
  );
}

export default App;
