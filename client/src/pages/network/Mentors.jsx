import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./Mentors.css";

function Mentors() {
  const { token } = useAuth();

  const [mentors, setMentors] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const loadMentors = async (
    value = ""
  ) => {
    try {
      setLoading(true);

      const data =
        await api.getMentors(
          token,
          value
        );

      setMentors(data.mentors);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadMentors();
    }
  }, [token]);

  const handleSearch = (event) => {
    event.preventDefault();
    loadMentors(search);
  };

  return (
    <div className="network-page">

      <nav className="dashboard-nav">

        <Link
          to="/"
          className="logo"
        >
          FELG
        </Link>

        <Link to="/network">
          Network
        </Link>

      </nav>

      <main className="network-container">

        <section className="network-header">

          <p className="small-label">
            FELG MENTORS
          </p>

          <h1>
            Learn from experienced people.
          </h1>

          <p>
            Discover mentors who can help
            guide your education and career
            journey.
          </p>

        </section>

        <form
          className="education-search"
          onSubmit={handleSearch}
        >

          <input
            placeholder="Search mentors..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button type="submit">
            Search
          </button>

        </form>

        {loading ? (
          <p>
            Loading mentors...
          </p>
        ) : (

          <div className="mentor-grid">

            {mentors.map((mentor) => (

              <div
                className="mentor-card"
                key={mentor.id}
              >

                <div className="post-avatar large">
                  {mentor.first_name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <h2>
                  {mentor.first_name}{" "}
                  {mentor.last_name}
                </h2>

                <p className="institution-name">
                  {mentor.headline ||
                    "FELG Mentor"}
                </p>

                <p>
                  {mentor.country}
                  {mentor.city
                    ? ` • ${mentor.city}`
                    : ""}
                </p>

                <p className="mentor-bio">
                  {mentor.bio ||
                    "This mentor has not added a bio yet."}
                </p>

                <button>
                  Connect
                </button>

              </div>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default Mentors;