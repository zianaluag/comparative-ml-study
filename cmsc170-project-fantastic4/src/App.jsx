import "./App.css";
import logo from "./assets/logo.png";
import bgImage from "./assets/bg.png";
import zanderAvatar from "./assets/ian.png";
import bernardAvatar from "./assets/bernard.png";
import frannieAvatar from "./assets/frannie.png";
import desmondAvatar from "./assets/desmond.png";

function App() {
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
            <a href="#models" className="nav-models">Models</a>
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

        {/* Section 3: Three Approaches */}
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

        {/* Section 4: Team */}
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