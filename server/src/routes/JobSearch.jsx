import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../../services/api";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function JobSearch() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const q = searchParams.get("q") || "";
  const country = searchParams.get("country") || "";
  const workType = searchParams.get("workType") || "";
  const skill = searchParams.get("skill") || "";
  const sort = searchParams.get("sort") || "relevance";
  const page = searchParams.get("page") || "1";

  const [searchText, setSearchText] = useState(q);
  const { user, token } = useContext(AuthContext);
  const saveCurrentSearch = async () => {
  if (!token) {
    alert("Please log in to save searches.");
    return;
  }

  const name = window.prompt(
    "Give this search a name:"
  );

  if (!name) {
    return;
  }

  try {
    await api.createSavedSearch(token, {
      name,
      query: q,
      searchType: "jobs",
      country,
      workType,
      sortBy: sort,
      alertsEnabled: false,
    });

    alert("Search saved successfully.");
  } catch (error) {
    alert(error.message);
  }
};

<button
  type="button"
  onClick={saveCurrentSearch}
>
  Save Search
</button>


  useEffect(() => {
    setSearchText(q);
  }, [q]);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.professionalJobSearch({
            q,
            country,
            workType,
            skill,
            sort,
            page,
            limit: 10,
          });

        setJobs(response.data || []);
        setPagination(response.pagination || {});
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [
    q,
    country,
    workType,
    skill,
    sort,
    page,
  ]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    next.set("page", "1");

    setSearchParams(next);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    updateFilter("q", searchText);
  };

  const changePage = (newPage) => {
    const next = new URLSearchParams(searchParams);

    next.set("page", String(newPage));

    setSearchParams(next);
  };

  return (
    <div className="job-search-page">
      <div className="job-search-container">

        <header className="job-search-header">
          <h1>Find Your Next Opportunity</h1>

          <p>
            Search jobs using skills, location,
            work type and more.
          </p>
        </header>

        <form
          className="professional-search-form"
          onSubmit={handleSearch}
        >
          <input
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
            }
            placeholder="Job title, skill or keyword..."
          />

          <button type="submit">
            Search
          </button>
        </form>

        <section className="job-filters">

          <input
            value={country}
            onChange={(event) =>
              updateFilter(
                "country",
                event.target.value
              )
            }
            placeholder="Country"
          />

          <select
            value={workType}
            onChange={(event) =>
              updateFilter(
                "workType",
                event.target.value
              )
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

          <input
            value={skill}
            onChange={(event) =>
              updateFilter(
                "skill",
                event.target.value
              )
            }
            placeholder="Skill e.g. JavaScript"
          />

          <select
            value={sort}
            onChange={(event) =>
              updateFilter(
                "sort",
                event.target.value
              )
            }
          >
            <option value="relevance">
              Relevance
            </option>

            <option value="newest">
              Newest
            </option>

            <option value="oldest">
              Oldest
            </option>
          </select>

        </section>

        {loading && (
          <div className="search-message">
            Searching...
          </div>
        )}

        {error && (
          <div className="search-error">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="search-results-header">
              <strong>
                {pagination.total || 0} jobs found
              </strong>

              {q && (
                <span>
                  for "{q}"
                </span>
              )}
            </div>

            <div className="job-results">

              {jobs.length === 0 ? (
                <div className="search-empty">
                  No jobs matched your search.
                </div>
              ) : (
                jobs.map((job) => (
                  <article
                    className="job-result-card"
                    key={job.id}
                  >
                    <h2>
                      <Link
                        to={`/jobs/${job.id}`}
                      >
                        {job.title}
                      </Link>
                    </h2>

                    <p>
                      {job.organization_name ||
                        "Organization"}
                    </p>

                    <p>
                      {job.location ||
                        job.country ||
                        "Location not specified"}
                    </p>

                    <span>
                      {job.work_type ||
                        "Work type not specified"}
                    </span>
                  </article>
                ))
              )}

            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">

                <button
                  disabled={
                    !pagination.hasPreviousPage
                  }
                  onClick={() =>
                    changePage(
                      Number(page) - 1
                    )
                  }
                >
                  Previous
                </button>

                <span>
                  Page {pagination.page} of{" "}
                  {pagination.totalPages}
                </span>

                <button
                  disabled={
                    !pagination.hasNextPage
                  }
                  onClick={() =>
                    changePage(
                      Number(page) + 1
                    )
                  }
                >
                  Next
                </button>

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default JobSearch;