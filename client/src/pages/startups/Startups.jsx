import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../services/api";

function Startups() {
  const [startups, setStartups] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [country, setCountry] =
    useState("");

  const [industry, setIndustry] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const loadStartups = async () => {
    try {
      setLoading(true);

      const data =
        await api.getStartups({
          search,
          country,
          industry,
        });

      setStartups(data.startups);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStartups();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    loadStartups();
  };

  return (
    <div className="startup-page">

      <nav className="dashboard-nav">

        <Link
          to="/"
          className="logo"
        >
          FELG
        </Link>

        <div>
          <Link to="/network">
            Network
          </Link>
          {" | "}
          <Link to="/jobs">
            Jobs
          </Link>
        </div>

      </nav>

      <main className="startup-container">

        <section className="startup-heading">

          <p className="small-label">
            FELG STARTUPS
          </p>

          <h1>
            Discover the next generation
            of companies.
          </h1>

          <p>
            Explore startups, meet founders
            and discover opportunities.
          </p>

        </section>

        <form
          className="startup-search"
          onSubmit={handleSearch}
        >

          <input
            placeholder="Search startups..."
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

          <input
            placeholder="Industry"
            value={industry}
            onChange={(e) =>
              setIndustry(e.target.value)
            }
          />

          <button type="submit">
            Search
          </button>

        </form>

        {loading ? (
          <p>
            Loading startups...
          </p>
        ) : startups.length === 0 ? (

          <div className="empty-jobs">

            <h2>
              No startups found
            </h2>

            <p>
              Try another search.
            </p>

          </div>

        ) : (

          <div className="startup-grid">

            {startups.map(
              (startup) => (

                <Link
                  key={startup.id}
                  to={`/startups/${startup.id}`}
                  className="startup-card"
                >

                  <div className="startup-logo">
                    {startup.name
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </div>

                  <p className="startup-industry">
                    {startup.industry ||
                      "Technology"}
                  </p>

                  <h2>
                    {startup.name}
                  </h2>

                  <p>
                    {startup.description ||
                      "No description available."}
                  </p>

                  <div className="startup-meta">

                    <span>
                      🚀{" "}
                      {startup.stage ||
                        "Early stage"}
                    </span>

                    <span>
                      🌍{" "}
                      {startup.country ||
                        "Global"}
                    </span>

                  </div>

                  <small>
                    {startup.member_count}{" "}
                    team members
                  </small>

                </Link>

              )
            )}

          </div>

        )}

      </main>

    </div>
  );
}

import {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { api } from "../../services/api";

function Startups() {
  const [startups, setStartups] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [country, setCountry] =
    useState("");

  const [industry, setIndustry] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const searchStartups = async () => {
    try {
      setLoading(true);

      const response =
        await api.getStartups({
          search,
          country,
          industry,
        });

      setStartups(
        response.data || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchStartups();
  }, []);

  return (
    <div className="startups-page">
      <div className="startups-container">

        <header className="startups-header">
          <h1>
            Discover Startups
          </h1>

          <p>
            Explore founders, teams,
            companies and startup
            opportunities.
          </p>
        </header>

        <form
          className="startup-search-form"
          onSubmit={(event) => {
            event.preventDefault();
            searchStartups();
          }}
        >
          <input
            placeholder="Search startups..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          <input
            placeholder="Country"
            value={country}
            onChange={(event) =>
              setCountry(
                event.target.value
              )
            }
          />

          <input
            placeholder="Industry"
            value={industry}
            onChange={(event) =>
              setIndustry(
                event.target.value
              )
            }
          />

          <button type="submit">
            Search
          </button>
        </form>

        {loading ? (
          <div className="search-message">
            Loading startups...
          </div>
        ) : (
          <div className="startup-grid">

            {startups.length === 0 ? (
              <div className="search-empty">
                No startups found.
              </div>
            ) : (
              startups.map(
                (startup) => (
                  <article
                    className="startup-card"
                    key={startup.id}
                  >
                    <div className="startup-card-image">
                      {startup.logo_url ? (
                        <img
                          src={
                            startup.logo_url
                          }
                          alt={
                            startup.name
                          }
                        />
                      ) : (
                        <span>
                          {startup.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <h2>
                      <Link
                        to={`/startups/${startup.id}`}
                      >
                        {startup.name}
                      </Link>
                    </h2>

                    {startup.industry && (
                      <p>
                        {startup.industry}
                      </p>
                    )}

                    {startup.country && (
                      <p>
                        {startup.country}
                      </p>
                    )}

                    <p>
                      👥{" "}
                      {startup.member_count ||
                        0} members
                    </p>

                    <p>
                      🚀{" "}
                      {startup.opportunity_count ||
                        0} opportunities
                    </p>
                  </article>
                )
              )
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default Startups;