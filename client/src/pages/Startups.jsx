
function Startups() {
  const opportunities = [
    {
      title: "Discover Startups",
      description:
        "Explore emerging businesses, their ideas, and the problems they solve.",
    },
    {
      title: "Find Co-founders",
      description:
        "Connect with people who share your interests and entrepreneurial goals.",
    },
    {
      title: "Startup Resources",
      description:
        "Learn about business planning, networking, and funding opportunities.",
    },
  ];

  return (
    <main style={styles.container}>
      <h1>Startup Opportunities</h1>
      <p>
        FELG helps aspiring entrepreneurs discover ideas, build connections,
        and explore opportunities to grow their businesses.
      </p>

      <section style={styles.grid}>
        {opportunities.map((item) => (
          <article key={item.title} style={styles.card}>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: "1100px",
    margin: "40px auto",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
    color: "#172033",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginTop: "30px",
  },
  card: {
    padding: "24px",
    border: "1px solid #dce2eb",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
  },
};

export default Startups;
