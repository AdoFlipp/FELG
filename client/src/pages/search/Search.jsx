import { useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../services/api";

function Search() {
  const [query, setQuery] =
    useState("");

  const [country, setCountry] =
    useState("");

  const [type, setType] =
    useState("all");

  const [results, setResults] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const handleSearch =
    async (event) => {
      event.preventDefault();

      if (!query.trim()) {
        return;
      }

      try {
        setLoading(true);

        const data =
          await api.globalSearch(
            query,
            type,
            country
          );

        setResults(
          data.results
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  const totalResults =
    results
      ? Object.values(results)
          .reduce(
            (total, group) =>
              total + group.length,
            0
          )
      : 0;

  return (
    <div className="search-page">

      <nav className="dashboard-nav">

        <Link
          to="/"
          className="logo"
        >
          FELG
        </Link>

        <div>
          <Link to="/jobs">
            Jobs
          </Link>

          {" | "}

          <Link to="/education">
            Education
          </Link>

          {" | "}

          <Link to="/startups">
            Startups
          </Link>
        </div>

      </nav>


      <main className="search-container">

        <section className="search-hero">

          <p className="small-label">
            FELG GLOBAL DISCOVERY
          </p>

          <h1>
            Find your next opportunity.
          </h1>

          <p>
            Search across jobs,
            education, startups,
            organizations, people
            and mentors.
          </p>

        </section>


        <form
          className="global-search-form"
          onSubmit={handleSearch}
        >

          <input
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search FELG..."
          />

          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value)
            }
          >

            <option value="all">
              Everything
            </option>

            <option value="jobs">
              Jobs
            </option>

            <option value="programs">
              Programs
            </option>

            <option value="organizations">
              Organizations
            </option>

            <option value="startups">
              Startups
            </option>

            <option value="people">
              People
            </option>

            <option value="mentors">
              Mentors
            </option>

            <option value="opportunities">
              Startup Opportunities
            </option>

          </select>

          <input
            value={country}
            onChange={(e) =>
              setCountry(e.target.value)
            }
            placeholder="Country"
          />

          <button type="submit">
            Search
          </button>

        </form>


        {loading && (
          <div className="search-message">
            Searching FELG...
          </div>
        )}


        {!loading &&
          results && (
            <section>

              <div className="search-results-header">

                <h2>
                  Search results
                </h2>

                <span>
                  {totalResults} results
                </span>

              </div>


              {/* JOBS */}

              {results.jobs.length > 0 && (
                <SearchGroup
                  title="💼 Jobs"
                >
                  {results.jobs.map(
                    (job) => (

                      <Link
                        key={job.id}
                        to={`/jobs/${job.id}`}
                        className="search-result"
                      >

                        <div>
                          <small>
                            JOB
                          </small>

                          <h3>
                            {job.title}
                          </h3>

                          <p>
                            {job.organization_name}
                          </p>

                          <span>
                            {job.work_type}
                            {" • "}
                            {job.country ||
                              "International"}
                          </span>
                        </div>

                      </Link>

                    )
                  )}
                </SearchGroup>
              )}


              {/* PROGRAMS */}

              {results.programs.length > 0 && (
                <SearchGroup
                  title="🎓 Programs"
                >
                  {results.programs.map(
                    (program) => (

                      <Link
                        key={program.id}
                        to={`/education/programs/${program.id}`}
                        className="search-result"
                      >

                        <div>
                          <small>
                            PROGRAM
                          </small>

                          <h3>
                            {program.name}
                          </h3>

                          <p>
                            {program.organization_name}
                          </p>

                          <span>
                            {program.degree_level}
                          </span>
                        </div>

                      </Link>

                    )
                  )}
                </SearchGroup>
              )}


              {/* STARTUPS */}

              {results.startups.length > 0 && (
                <SearchGroup
                  title="🚀 Startups"
                >
                  {results.startups.map(
                    (startup) => (

                      <Link
                        key={startup.id}
                        to={`/startups/${startup.id}`}
                        className="search-result"
                      >

                        <div>
                          <small>
                            STARTUP
                          </small>

                          <h3>
                            {startup.name}
                          </h3>

                          <p>
                            {startup.description}
                          </p>

                          <span>
                            {startup.industry ||
                              "Startup"}
                            {" • "}
                            {startup.country ||
                              "Global"}
                          </span>
                        </div>

                      </Link>

                    )
                  )}
                </SearchGroup>
              )}


              {/* ORGANIZATIONS */}

              {results.organizations.length > 0 && (
                <SearchGroup
                  title="🏢 Organizations"
                >
                  {results.organizations.map(
                    (organization) => (

                      <div
                        key={
                          organization.id
                        }
                        className="search-result"
                      >

                        <div>
                          <small>
                            ORGANIZATION
                          </small>

                          <h3>
                            {organization.name}
                          </h3>

                          <p>
                            {organization.description}
                          </p>

                          <span>
                            {organization.type}
                            {" • "}
                            {organization.country ||
                              "International"}
                          </span>
                        </div>

                      </div>

                    )
                  )}
                </SearchGroup>
              )}


              {/* PEOPLE */}

              {results.people.length > 0 && (
                <SearchGroup
                  title="👤 People"
                >
                  {results.people.map(
                    (person) => (

                      <div
                        key={person.id}
                        className="search-result"
                      >

                        <div>
                          <small>
                            {person.role}
                          </small>

                          <h3>
                            {person.first_name}{" "}
                            {person.last_name}
                          </h3>

                          <p>
                            {person.headline ||
                              "FELG member"}
                          </p>

                          <span>
                            {person.country ||
                              "International"}
                          </span>
                        </div>

                      </div>

                    )
                  )}
                </SearchGroup>
              )}


              {/* MENTORS */}

              {results.mentors.length > 0 && (
                <SearchGroup
                  title="🤝 Mentors"
                >
                  {results.mentors.map(
                    (mentor) => (

                      <div
                        key={mentor.id}
                        className="search-result"
                      >

                        <div>
                          <small>
                            MENTOR
                          </small>

                          <h3>
                            {mentor.first_name}{" "}
                            {mentor.last_name}
                          </h3>

                          <p>
                            {mentor.headline ||
                              "FELG Mentor"}
                          </p>

                        </div>

                      </div>

                    )
                  )}
                </SearchGroup>
              )}


              {/* STARTUP OPPORTUNITIES */}

              {results.opportunities.length > 0 && (
                <SearchGroup
                  title="🚀 Startup Opportunities"
                >
                  {results.opportunities.map(
                    (opportunity) => (

                      <Link
                        key={
                          opportunity.id
                        }
                        to={`/startups/${opportunity.startup_id}`}
                        className="search-result"
                      >

                        <div>
                          <small>
                            OPPORTUNITY
                          </small>

                          <h3>
                            {opportunity.title}
                          </h3>

                          <p>
                            {opportunity.startup_name}
                          </p>

                          <span>
                            {
                              opportunity.opportunity_type
                            }
                            {opportunity.is_remote
                              ? " • Remote"
                              : ""}
                          </span>

                        </div>

                      </Link>

                    )
                  )}
                </SearchGroup>
              )}

            </section>
          )}


        {!loading &&
          results &&
          totalResults === 0 && (
            <div className="search-empty">

              <h2>
                Nothing found
              </h2>

              <p>
                Try a different keyword,
                category or country.
              </p>

            </div>
          )}

      </main>

    </div>
  );
}


function SearchGroup({
  title,
  children,
}) {
  return (
    <section className="search-group">

      <div className="search-group-heading">
        <h2>
          {title}
        </h2>
      </div>

      <div className="search-results-grid">
        {children}
      </div>

    </section>
  );
}


export default Search;