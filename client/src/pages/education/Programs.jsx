import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../services/api";

function Programs() {
  const [programs, setPrograms] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [country, setCountry] =
    useState("");

  const [degreeLevel, setDegreeLevel] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await api.getPrograms({
          search,
          country,
          degreeLevel,
        });

      setPrograms(data.programs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    loadPrograms();
  };

  return (
    <div className="education-page">

      <nav className="dashboard-nav">

        <Link
          to="/"
          className="logo"
        >
          FELG
        </Link>

        <Link to="/dashboard">
          Dashboard
        </Link>

      </nav>

      <main className="education-container">

        <div className="education-heading">

          <p className="small-label">
            FELG EDUCATION
          </p>

          <h1>
            Find your next program.
          </h1>

          <p>
            Discover universities, colleges
            and degree programs around the world.
          </p>

        </div>

        <form
          className="education-search"
          onSubmit={handleSearch}
        >

          <input
            placeholder="Search programs or institutions..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <input
            placeholder="Country"
            value={country}
            onChange={(e) =>
              setCountry(e.target.value)
            }
          />

          <select
            value={degreeLevel}
            onChange={(e) =>
              setDegreeLevel(
                e.target.value
              )
            }
          >

            <option value="">
              All degree levels
            </option>

            <option value="certificate">
              Certificate
            </option>

            <option value="diploma">
              Diploma
            </option>

            <option value="bachelor">
              Bachelor's
            </option>

            <option value="master">
              Master's
            </option>

            <option value="doctorate">
              Doctorate
            </option>

          </select>

          <button type="submit">
            Search
          </button>

        </form>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading ? (
          <p>Loading programs...</p>
        ) : programs.length === 0 ? (
          <div className="empty-jobs">

            <h2>
              No programs found
            </h2>

            <p>
              Try changing your search.
            </p>

          </div>
        ) : (
          <div className="program-list">

            {programs.map(
              (program) => (

                <Link
                  key={program.id}
                  to={`/education/programs/${program.id}`}
                  className="program-card"
                >

                  <div className="program-logo">
                    {program.institution_name
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      "U"}
                  </div>

                  <div className="program-content">

                    <p className="institution-name">
                      {program.institution_name}
                    </p>

                    <h2>
                      {program.name}
                    </h2>

                    <div className="program-meta">

                      <span>
                        🎓{" "}
                        {program.degree_level}
                      </span>

                      {program.country && (
                        <span>
                          🌍 {program.country}
                        </span>
                      )}

                      {program.duration && (
                        <span>
                          ⏱️{" "}
                          {program.duration}
                        </span>
                      )}

                    </div>

                    {program.application_deadline && (
                      <p className="deadline">
                        Deadline:{" "}
                        {new Date(
                          program.application_deadline
                        ).toLocaleDateString()}
                      </p>
                    )}

                  </div>

                </Link>

              )
            )}

          </div>
        )}

      </main>

    </div>
  );
}

export default Programs;