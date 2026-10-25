import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Recommendations() {
  const { token } = useAuth();

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadRecommendations =
      async () => {
        try {
          const result =
            await api.getRecommendations(
              token
            );

          setData(result);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };

    if (token) {
      loadRecommendations();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="recommendation-page">
        <h2>
          FELG is finding your
          opportunities...
        </h2>

        <p>
          Matching your skills with
          jobs, programs, startups and
          mentors.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="recommendation-page">
        <h2>
          We couldn't load your
          recommendations.
        </h2>
      </div>
    );
  }

  const {
    jobs,
    programs,
    startups,
    mentors,
  } = data.recommendations;

  return (
    <div className="recommendation-page">

      <header className="recommendation-header">

        <div>
          <p className="small-label">
            FELG INTELLIGENCE
          </p>

          <h1>
            Your opportunities
          </h1>

          <p>
            Personalized recommendations
            based on your FELG profile.
          </p>
        </div>

        <Link
          to="/profile"
          className="recommendation-profile"
        >
          Improve my profile
        </Link>

      </header>

      <section className="recommendation-section">

        <div className="section-heading">
          <div>
            <p className="small-label">
              CAREER
            </p>

            <h2>
              Jobs for you
            </h2>
          </div>

          <Link to="/jobs">
            View all →
          </Link>
        </div>

        <div className="recommendation-grid">

          {jobs.map((job) => (

            <Link
              key={job.id}
              to={`/jobs/${job.id}`}
              className="recommendation-card"
            >

              <div className="match-score">
                {job.match_score}%
                <span>
                  match
                </span>
              </div>

              <h3>
                {job.title}
              </h3>

              <p>
                {job.organization_name}
              </p>

              <small>
                {job.work_type}
                {" • "}
                {job.country ||
                  "International"}
              </small>

            </Link>

          ))}

        </div>

      </section>

      <section className="recommendation-section">

        <div className="section-heading">

          <div>
            <p className="small-label">
              EDUCATION
            </p>

            <h2>
              Programs for you
            </h2>
          </div>

          <Link to="/education">
            View all →
          </Link>

        </div>

        <div className="recommendation-grid">

          {programs.map(
            (program) => (

              <Link
                key={program.id}
                to={`/education/programs/${program.id}`}
                className="recommendation-card"
              >

                <div className="match-score">
                  {program.match_score}%
                  <span>
                    match
                  </span>
                </div>

                <h3>
                  {program.name}
                </h3>

                <p>
                  {program.organization_name}
                </p>

                <small>
                  {program.degree_level}
                </small>

              </Link>

            )
          )}

        </div>

      </section>

      <section className="recommendation-section">

        <div className="section-heading">

          <div>
            <p className="small-label">
              STARTUPS
            </p>

            <h2>
              Startup opportunities
            </h2>
          </div>

          <Link to="/startups">
            Explore startups →
          </Link>

        </div>

        <div className="recommendation-grid">

          {startups.map(
            (opportunity) => (

              <Link
                key={opportunity.id}
                to={`/startups/${opportunity.startup_id}`}
                className="recommendation-card"
              >

                <div className="match-score">
                  {opportunity.match_score}%
                  <span>
                    match
                  </span>
                </div>

                <h3>
                  {opportunity.title}
                </h3>

                <p>
                  {opportunity.startup_name}
                </p>

                <small>
                  {opportunity.opportunity_type}
                  {opportunity.is_remote
                    ? " • Remote"
                    : ""}
                </small>

              </Link>

            )
          )}

        </div>

      </section>

      <section className="recommendation-section">

        <div className="section-heading">

          <div>
            <p className="small-label">
              NETWORK
            </p>

            <h2>
              Mentors you may like
            </h2>
          </div>

          <Link to="/network/mentors">
            View mentors →
          </Link>

        </div>

        <div className="recommendation-grid">

          {mentors.map(
            (mentor) => (

              <div
                key={mentor.id}
                className="recommendation-card"
              >

                <div className="match-score">
                  {mentor.match_score}%
                  <span>
                    match
                  </span>
                </div>

                <h3>
                  {mentor.first_name}{" "}
                  {mentor.last_name}
                </h3>

                <p>
                  {mentor.headline ||
                    "FELG Mentor"}
                </p>

                <small>
                  Professional
                  mentorship
                </small>

              </div>

            )
          )}

        </div>

      </section>

    </div>
  );
}

export default Recommendations;