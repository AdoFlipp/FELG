import { Link, useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const value = formData.get("search")?.toString().trim();

    if (value) {
      navigate(`/jobs/search?q=${encodeURIComponent(value)}`);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link to="/" style={styles.logo}>
          FELG
        </Link>

        <form className="homepage-search" onSubmit={handleSearch}>
          <input
            name="search"
            placeholder="Search jobs, programs, startups..."
            aria-label="Search jobs, programs, and startups"
          />
          <button type="submit" style={styles.button}>
            Search FELG
          </button>
        </form>

        <nav style={styles.nav}>
          <Link to="/jobs" style={styles.link}>Jobs</Link>
          <Link to="/education" style={styles.link}>Education</Link>
          <Link to="/startups" style={styles.link}>Startups</Link>
          <Link to="/login" style={styles.link}>Login</Link>
          <Link to="/register" style={styles.button}>Get Started</Link>
        </nav>
      </header>


<main style={styles.hero} className="felg-hero">

  <video
    className="felg-hero-video"
    autoPlay
    muted
    loop
    playsInline
    preload="metadata"
    aria-hidden="true"
  >
    <source
      src="/videos/felg-background.mp4"
      type="video/mp4"
    />
  </video>

  <div
    className="felg-hero-overlay"
    aria-hidden="true"
  ></div>

  <div className="felg-hero-content">
    <p style={styles.tag}>
      YOUR FUTURE STARTS HERE
    </p>

    <h1>
      Connect your talent to global opportunities.
    </h1>

    <p style={styles.description}>
      Discover jobs, explore educational opportunities,
      and turn your startup ideas into reality — all in one place.
    </p>

    <div style={styles.actions}>
      <Link to="/jobs" style={styles.button}>
        Explore Jobs
      </Link>

      <Link to="/education" style={styles.secondary}>
        Find Education
      </Link>
    </div>
  </div>

</main>


      <section style={styles.section}>
        <h2>One platform. Three opportunities.</h2>

        <div style={styles.cards}>
          <Link to="/jobs" style={styles.card}>
            <h3>Find Jobs</h3>
            <p>
              Explore career opportunities and connect with employers.
            </p>
          </Link>

          <Link to="/education" style={styles.card}>
            <h3>Education</h3>
            <p>
              Discover university programs and learning opportunities.
            </p>
          </Link>

          <Link to="/startups" style={styles.card}>
            <h3>Build Startups</h3>
            <p>
              Develop ideas, find collaborators, and grow your venture.
            </p>
          </Link>
        </div>
      </section>

      <footer style={styles.footer}>
        © {new Date().getFullYear()} FELG. Build your future.
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
    color: "#172033",
    background: "#f7f9fc",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    padding: "20px 6%",
    background: "#ffffff",
    borderBottom: "1px solid #e5eaf2",
  },
  logo: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#2457d6",
    textDecoration: "none",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "18px",
  },
  link: {
    color: "#334155",
    textDecoration: "none",
  },
  button: {
    display: "inline-block",
    background: "#2457d6",
    color: "#ffffff",
    padding: "12px 20px",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer",
  },
hero: {
  padding: "45px 6%",
  background: "#101a35",
  textAlign: "center",
  width: "85%",
  maxWidth: "1200px",
  minHeight: "320px",
  margin: "30px auto",
  borderRadius: "18px",
  boxSizing: "border-box",
  position: "relative",
  overflow: "hidden",
},
  tag: {
    color: "#2457d6",
    fontWeight: "bold",
    letterSpacing: "2px",
  },
  description: {
    maxWidth: "650px",
    margin: "20px auto",
    lineHeight: 1.8,
    color: "#526078",
  },
  actions: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "14px",
    marginTop: "28px",
  },
  secondary: {
    padding: "12px 20px",
    border: "1px solid #2457d6",
    borderRadius: "8px",
    color: "#2457d6",
    textDecoration: "none",
  },
  section: {
    padding: "55px 6%",
    textAlign: "center",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginTop: "28px",
  },
  card: {
    padding: "25px",
    background: "#ffffff",
    border: "1px solid #e5eaf2",
    borderRadius: "12px",
    color: "#172033",
    textDecoration: "none",
    textAlign: "left",
  },
  footer: {
    padding: "24px",
    textAlign: "center",
    color: "#64748b",
    background: "#ffffff",
  },
};

export default Home;