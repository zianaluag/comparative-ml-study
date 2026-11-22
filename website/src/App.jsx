import { useEffect } from "react";
import "./App.css";
import logo from "./assets/logo.png";
import bgImage from "./assets/bg.png";
import zanderAvatar from "./assets/ian.png";
import bernardAvatar from "./assets/bernard.png";
import frannieAvatar from "./assets/frannie.png";
import desmondAvatar from "./assets/desmond.png";
import categoryChart from "./assets/category-chart.png";

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
            Transparency Portal, this project predicts whether infrastructure
            projects will finish past their contract expiry dates and uncovers
            which contract characteristics are most strongly linked to delays.
            Using custom, from-scratch implementations, we benchmark three
            fundamentally different machine learning methods—
            <span className="text-orange">Spline Logistic Regression</span>,{" "}
            <span className="text-teal">
              XGBoost-style Gradient Boosted Trees
            </span>
            , and{" "}
            <span className="text-pink">k-Nearest Neighbors</span>—to
            determine which approach most effectively ranks contracts by delay
            risk.
          </p>
        </section>

        {/* Section 2: Abstract */}
        <section id="abstract" className="section abstract-section">
          <h2 className="section-heading text-orange">Abstract</h2>
          <div className="card abstract-card">
            <p>
              Delays in public infrastructure projects inflate costs and
              postpone critical benefits for the communities they serve. To
              support proactive oversight, this study investigates the factors
              driving schedule overruns in Department of Public Works and
              Highways (DPWH) infrastructure contracts and evaluates which
              machine learning paradigm best predicts project delays. Using
              contract records from the BetterGov Open Data Portal—encompassing
              approximately 248,000 contracts with details on budget, project
              type, location, contractor, status, and actual execution
              dates—supplemented by contract expiry dates and bidding details
              collected from the DPWH Transparency Portal, we classify a project
              as delayed when its actual completion date exceeds its contract
              expiry date. Built using custom data loading and preprocessing
              pipelines written from scratch, our comparative study benchmarks
              three distinct modeling approaches:
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
                  <span className="text-teal">BetterGov Open Data Portal</span>{" "}
                  and project-level schedule and bidding records from the{" "}
                  <span className="text-teal">DPWH Transparency Portal</span>,
                  spanning <span className="text-orange">215,277 contracts</span>{" "}
                  across <span className="text-orange">19 regions</span> and{" "}
                  <span className="text-orange">
                    220 District Engineering Offices
                  </span>{" "}
                  (2016–2026).
                </p>

                <p>
                  Each entry captures pre-execution contract attributes—including
                  approved budget (median{" "}
                  <span className="text-teal">₱9.85M</span>), infrastructure
                  category (roads, buildings, flood control, bridges, and water
                  systems), contractor, funding source, geographic coordinates,
                  and contract effectivity, expiry, and actual completion dates.
                </p>

                <p>
                  Evaluating{" "}
                  <span className="text-pink">
                    188,401 completed contracts
                  </span>{" "}
                  with verified timelines,{" "}
                  <span className="text-pink">24.16% (45,514 projects)</span>{" "}
                  finished past their contract expiry dates, with regional delay
                  rates varying sharply across the archipelago.
                </p>
              </div>

              <div className="card dataset-chart-card">
                <img
                  src={categoryChart}
                  alt="Overall percentage of Delayed Projects by Category"
                  className="category-chart-img"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Three Approaches */}
        <section id="models" className="section models-section">
          <div className="models-grid">
            <div className="model-column">
              <h3 className="model-title text-orange">
                1. Spline Logistic Regression
              </h3>
              <div className="card model-card">
                <p>
                  Predicts yes/no outcomes as calibrated risk probabilities,
                  using splines to model smooth, curved feature effects instead
                  of rigid straight lines. Easy to explain and audit, serving as
                  our benchmark.
                </p>
              </div>
            </div>

            <div className="model-column">
              <h3 className="model-title text-teal">
                2. Gradient Boosted Trees
              </h3>
              <div className="card model-card">
                <p>
                  Implemented from scratch to sequentially correct errors across
                  an ensemble of decision trees, targeting high accuracy on
                  mixed tabular features.
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
                  historical projects rather than learning global rules,
                  relying on feature distance across past records to estimate
                  delay risk.
                </p>
              </div>
            </div>
          </div>

          <div className="card summary-card">
            <p>
              By comparing these three paradigms, this work aims to identify the
              contract characteristics most strongly linked to delays and
              establish an effective framework for flagging high-risk public
              works projects for closer monitoring.
            </p>
          </div>
        </section>

        {/* Section 5: Model Results & Discussion (Spline Logistic Regression vs. KNN) */}
        <section id="results" className="section results-section">
          <h2 className="section-heading text-orange">
            Preliminary Results &amp; Discussion
          </h2>

          <div className="heatmaps-row">
            {/* Heatmap 1: Spline Logistic Regression */}
            <div className="card heatmap-panel">
              <h3 className="heatmap-title text-orange">
                Spline Logistic Regression
              </h3>

              <div className="cm-grid">
                <div className="cm-row">
                  <div className="cm-cell cell-navy">
                    <span className="cm-label">TP</span>
                    <span className="cm-value">15,949</span>
                    <span className="cm-pct">37%</span>
                  </div>
                  <div className="cm-cell cell-steel">
                    <span className="cm-label">FN</span>
                    <span className="cm-value">5,933</span>
                    <span className="cm-pct">14%</span>
                  </div>
                </div>
                <div className="cm-row">
                  <div className="cm-cell cell-mid">
                    <span className="cm-label">FP</span>
                    <span className="cm-value">9,397</span>
                    <span className="cm-pct">22%</span>
                  </div>
                  <div className="cm-cell cell-royal">
                    <span className="cm-label">TN</span>
                    <span className="cm-value">11,405</span>
                    <span className="cm-pct">27%</span>
                  </div>
                </div>
              </div>

              <span className="heatmap-subtitle text-orange">
                Decision Threshold at 0.2
              </span>

              <div className="metrics-strip">
                <div className="metric-pill">
                  <span className="metric-name">Accuracy</span>
                  <span className="metric-val text-cream">64.08%</span>
                </div>
                <div className="metric-pill">
                  <span className="metric-name">Recall</span>
                  <span className="metric-val text-teal">72.89%</span>
                </div>
                <div className="metric-pill">
                  <span className="metric-name">Precision</span>
                  <span className="metric-val text-orange">62.93%</span>
                </div>
                <div className="metric-pill">
                  <span className="metric-name">F1-Score</span>
                  <span className="metric-val text-pink">0.68</span>
                </div>
              </div>
            </div>

            {/* Heatmap 2: KNN */}
            <div className="card heatmap-panel">
              <h3 className="heatmap-title text-pink">
                KNN Heatmap
              </h3>

              <div className="cm-grid">
                <div className="cm-row">
                  <div className="cm-cell cell-mid">
                    <span className="cm-label">TP</span>
                    <span className="cm-value">7,335</span>
                    <span className="cm-pct">17%</span>
                  </div>
                  <div className="cm-cell cell-royal">
                    <span className="cm-label">FN</span>
                    <span className="cm-value">14,547</span>
                    <span className="cm-pct">34%</span>
                  </div>
                </div>
                <div className="cm-row">
                  <div className="cm-cell cell-light">
                    <span className="cm-label">FP</span>
                    <span className="cm-value">2,548</span>
                    <span className="cm-pct">6%</span>
                  </div>
                  <div className="cm-cell cell-navy">
                    <span className="cm-label">TN</span>
                    <span className="cm-value">18,254</span>
                    <span className="cm-pct">43%</span>
                  </div>
                </div>
              </div>

              <span className="heatmap-subtitle text-pink">
                Distance-Based Neighbor Classification
              </span>

              <div className="metrics-strip">
                <div className="metric-pill">
                  <span className="metric-name">Accuracy</span>
                  <span className="metric-val text-cream">59.95%</span>
                </div>
                <div className="metric-pill">
                  <span className="metric-name">Recall</span>
                  <span className="metric-val text-pink">33.52%</span>
                </div>
                <div className="metric-pill">
                  <span className="metric-name">Precision</span>
                  <span className="metric-val text-teal">74.22%</span>
                </div>
                <div className="metric-pill">
                  <span className="metric-name">F1-Score</span>
                  <span className="metric-val text-orange">0.46</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comparative Analysis & Discussion */}
          <div className="card discussion-card">
            <h3 className="discussion-heading text-teal">
              Comparative Analysis &amp; Oversight Implications
            </h3>

                  
            {/* <p> WILL UPDATE TOMO
              Evaluated across the same test split of{" "}
              <span className="text-orange">42,684 contracts</span> (21,882
              delayed and 20,802 on-time),{" "}
              <span className="text-orange">Spline Logistic Regression</span>{" "}
              and <span className="text-pink">k-Nearest Neighbors (KNN)</span>{" "}
              demonstrate sharply contrasting classification behaviors and error
              trade-offs.
            </p>

            <p>
              <span className="text-pink">KNN</span> operates conservatively,
              assigning a delay label only when a contract&apos;s nearest
              historical neighbors are predominantly delayed. While this yields
              strong <span className="text-teal">precision (74.22%)</span> and{" "}
              <span className="text-teal">specificity (87.75%)</span> with a
              low false-alarm rate (6% of total predictions), it misses
              two-thirds of truly delayed projects—resulting in{" "}
              <span className="text-pink">14,547 false negatives (34%)</span>,{" "}
              <span className="text-pink">33.52% recall</span>, and an overall{" "}
              <span className="text-orange">F1-score of 0.46</span>.
            </p>

            <p>
              By contrast, lowering the decision threshold to{" "}
              <span className="text-orange">0.2</span> shifts{" "}
              <span className="text-orange">Spline Logistic Regression</span>{" "}
              toward proactive risk detection. It captures{" "}
              <span className="text-teal">72.89% of all delayed contracts</span>{" "}
              (15,949 true positives), cutting false negatives by more than half
              (down to 5,933) and boosting both{" "}
              <span className="text-teal">accuracy (64.08%)</span> and{" "}
              <span className="text-teal">F1-score (0.68)</span>. Although the
              lower threshold increases false positives to 22% (62.93%
              precision), prioritizing high recall is substantially better
              aligned with public infrastructure oversight, where missing an
              at-risk contract carries far greater financial and community cost
              than auditing an on-time project.
            </p> */}
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
                alt="Tandang, Frannieczeska U."
                className="avatar"
              />
              <span className="member-name text-cream">
                Tandang, Frannieczeska U.
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
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;