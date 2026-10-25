import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../services/api";

function Scholarships() {
  const [scholarships, setScholarships] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [country, setCountry] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const loadScholarships = async () => {
    try {
      setLoading(true);

      const data =
        await api.getScholarships({
          search,
          country,
        });

      setScholarships(
        data.scholarships
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScholarships();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    loadScholarships();
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

        <div>
          <Link to="/education">
            Programs
          </Link>

          {" | "}

          <Link to="/education/scholarships">
            Scholarships
          </Link>
        </div>

      </nav>

      <main className="education-container">

        <div className="education-heading">

          <p className="small-label">
            FELG SCHOLARSHIPS
          </p>

          <h1>
            Find funding for your education.
          </h1>

          <p>
            Discover scholarship opportunities
            published by institutions.
          </p>

        </div>

        <form
          className="education-search"
          onSubmit={handleSearch}
        >

          <input
            placeholder="Search scholarships..."
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

          <button type="submit">
            Search
          </button>

        </form>

        {loading ? (
          <p>
            Loading scholarships...
          </p>
        ) : scholarships.length === 0 ? (

          <div className="empty-jobs">
            <h2>
              No scholarships found
            </h2>

            <p>
              Try a different search.
            </p>
          </div>

        ) : (

          <div className="program-list">

            {scholarships.map(
              (scholarship) => (

                <div
                  className="program-card"
                  key={scholarship.id}
                >

                  <div className="program-logo">
                    $
                  </div>

                  <div className="program-content">

                    <p className="institution-name">
                      {scholarship.institution_name}
                    </p>

                    <h2>
                      {scholarship.name}
                    </h2>

                    <p>
                      {scholarship.description}
                    </p>

                    {scholarship.amount && (
                      <p className="deadline">
                        Award:{" "}
                        {scholarship.currency}{" "}
                        {scholarship.amount}
                      </p>
                    )}

                    {scholarship.deadline && (
                      <p className="deadline">
                        Deadline:{" "}
                        {new Date(
                          scholarship.deadline
                        ).toLocaleDateString()}
                      </p>
                    )}

                    {scholarship.eligibility && (
                      <p>
                        Eligibility:{" "}
                        {scholarship.eligibility}
                      </p>
                    )}

                    {scholarship.application_url && (
                      <a
                        href={
                          scholarship.application_url
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        Application website →
                      </a>
                    )}

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </main>

    </div>
  );
}

export default Scholarships;