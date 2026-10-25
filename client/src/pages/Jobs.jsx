import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../services/api";
import "./Jobs.css";

function Jobs() {
  const [jobs, setJobs] = useState([]);

  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [workType, setWorkType] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await api.getJobs({
        search,
        country,
        workType,
      });

      setJobs(data.jobs);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    loadJobs();
  };

  return (
    <div className="jobs-page">

      <nav className="dashboard-nav">

        <Link to="/" className="logo">
          FELG
        </Link>

        <div>
          <Link to="/dashboard">
            Dashboard
          </Link>
        </div>

      </nav>

      <main className="jobs-container">

        <div className="jobs-heading">

          <p className="small-label">
            FELG CAREERS
          </p>

          <h1>
            Find your next opportunity.
          </h1>

          <p>
            Discover jobs from organizations
            around the world.
          </p>

        </div>

        <form
          className="job-search"
          onSubmit={handleSearch}
        >

          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) =>
              setCountry(e.target.value)
            }
          />

          <select
            value={workType}
            onChange={(e) =>
              setWorkType(e.target.value)
            }
          >
            <option value="">
              All work types
            </option>

            <option value="remote">
              Remote
            </option>

            <option value="hybrid">
              Hybrid
            </option>

            <option value="onsite">
              On-site
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
          <p>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <div className="empty-jobs">
            <h2>No jobs found</h2>
            <p>
              Try changing your search filters.
            </p>
          </div>
        ) : (
          <div className="job-list">

            {jobs.map((job) => (

              <Link
                to={`/jobs/${job.id}`}
                className="job-card"
                key={job.id}
              >

                <div className="job-card-top">

                  <div className="company-logo">
                    {job.organization_name
                      ?.charAt(0)
                      ?.toUpperCase() || "F"}
                  </div>

                  <div>

                    <h2>
                      {job.title}
                    </h2>

                    <p className="company-name">
                      {job.organization_name ||
                        "Organization"}
                    </p>

                  </div>

                </div>

                <div className="job-meta">

                  {job.country && (
                    <span>
                      📍 {job.country}
                    </span>
                  )}

                  {job.work_type && (
                    <span>
                      💼 {job.work_type}
                    </span>
                  )}

                </div>

                <p className="job-description">
                  {job.description?.substring(
                    0,
                    180
                  )}
                  {job.description?.length > 180
                    ? "..."
                    : ""}
                </p>

              </Link>

            ))}

          </div>
        )}

      </main>

    </div>
  );
}

export default Jobs;