import { Link } from "react-router-dom";

const sections = [
  {
    title: "Find Jobs",
    description: "Explore career opportunities and recommended jobs.",
    path: "/jobs",
  },
  {
    title: "Education",
    description: "Explore universities, colleges, and scholarships.",
    path: "/education",
  },
  {
    title: "Startups",
    description: "Discover startups and entrepreneurial opportunities.",
    path: "/startups",
  },
  {
    title: "Professional Profile",
    description: "Manage your professional profile and portfolio.",
    path: "/profile/professional",
  },
  {
    title: "Mentors",
    description: "Explore professional networking and mentorship.",
    path: "/network/mentors",
  },
  {
    title: "Notifications",
    description: "Check your latest notifications.",
    path: "/notifications",
  },
];

export default function Dashboard() {
  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <Link to="/" style={styles.logo}>
          FELG
        </Link>

        <nav style={styles.nav}>
          <Link to="/">Home</Link>
          <Link to="/jobs">Jobs</Link>
          <Link to="/education">Education</Link>
          <Link to="/startups">Startups</Link>
        </nav>
      </header>

      <section style={styles.hero}>
        <p style={styles.label}>YOUR FELG WORKSPACE</p>
        <h1>Welcome to your dashboard</h1>
        <p>
          Discover opportunities, build your professional future, and connect
          with the global community.
        </p>
      </section>

      <section style={styles.grid}>
        {sections.map((section) => (
          <article key={section.path} style={styles.card}>
            <h2>{section.title}</h2>
            <p>{section.description}</p>
            <Link to={section.path} style={styles.button}>
              Explore →
            </Link>
          </article>
        ))}
      </section>

      <footer style={styles.footer}>
        FELG — Connecting people with global opportunities.
      </footer>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    color: "#172033",
    fontFamily: "Arial, sans-serif",
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
    color: "#2457d6",
    fontSize: "28px",
    fontWeight: "bold",
    textDecoration: "none",
  },
  nav: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
  },
  hero: {
    padding: "55px 6% 35px",
  },
  label: {
    color: "#2457d6",
    fontWeight: "bold",
    letterSpacing: "2px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "20px",
    padding: "0 6% 50px",
  },
  card: {
    padding: "24px",
    background: "#ffffff",
    border: "1px solid #e5eaf2",
    borderRadius: "14px",
    boxShadow: "0 4px 15px rgba(20, 40, 80, 0.05)",
  },
  button: {
    display: "inline-block",
    marginTop: "10px",
    padding: "10px 15px",
    background: "#2457d6",
    color: "#ffffff",
    borderRadius: "7px",
    textDecoration: "none",
  },
  footer: {
    padding: "24px",
    textAlign: "center",
    background: "#ffffff",
    borderTop: "1px solid #e5eaf2",
  },
};