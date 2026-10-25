
function Education() {
  const programs = [
    {
      title: "University Degrees",
      description:
        "Explore undergraduate and postgraduate programs at universities.",
      category: "Higher Education",
    },
    {
      title: "Scholarships",
      description:
        "Discover scholarship opportunities that may help fund your studies.",
      category: "Financial Support",
    },
    {
      title: "College Programs",
      description:
        "Find college courses and programs to develop your knowledge and skills.",
      category: "College",
    },
  ];

  return (
    <main style={styles.container}>
      <h1>Education Opportunities</h1>
      <p>
        Discover university programs, college courses, and scholarships
        around the world with FELG.
      </p>

      <section style={styles.grid}>
        {programs.map((program) => (
          <article key={program.title} style={styles.card}>
            <small>{program.category}</small>
            <h2>{program.title}</h2>
            <p>{program.description}</p>
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

export default Education;
