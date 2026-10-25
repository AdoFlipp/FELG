import {
  useContext,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  AuthContext,
} from "../../context/AuthContext";

import { api } from "../../services/api";

function RecommendedJobs() {
  const {
    token,
  } = useContext(AuthContext);

  const [
    jobs,
    setJobs,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    const loadRecommendations =
      async () => {
        try {
          setLoading(true);

          const response =
            await api.getRecommendedJobs(
              token,
              20
            );

          setJobs(
            response.data || []
          );
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

    loadRecommendations();
  }, [token]);

  if (loading) {
    return (
      <div className="page-loading">
        Finding your best opportunities...
      </div>
    );
  }

  return (
    <div className="recommended-jobs-page">
      <div className="recommended-jobs-container">

        <header>
          <h1>
            Recommended For You
          </h1>

          <p>
            FELG matched these jobs
            with your profile and skills.
          </p>
        </header>

        {error && (
          <div className="search-error">
            {error}
          </div>
        )}

        <div className="recommended-job-list">

          {jobs.length === 0 ? (
            <div className="search-empty">
              No recommendations yet.
              Add skills to your profile
              to improve your matches.
            </div>
          ) : (
            jobs.map((job) => (
              <article
                className="recommended-job-card"
                key={job.id}
              >
                <div className="job-card-main">

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

                  <p>
                    Work type:{" "}
                    {job.work_type ||
                      "Not specified"}
                  </p>

                </div>

                <div className="match-score">

                  <strong>
                    {job.matchScore}%
                  </strong>

                  <span>
                    Match
                  </span>

                </div>

                {job.matchedSkills
                  ?.length > 0 && (
                  <div className="match-skills">

                    <strong>
                      Matching skills:
                    </strong>

                    <div>
                      {job.matchedSkills.map(
                        (skill) => (
                          <span
                            className="skill-tag"
                            key={skill}
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>

                  </div>
                )}

                {job.missingSkills
                  ?.length > 0 && (
                  <div className="missing-skills">

                    <strong>
                      Skills to develop:
                    </strong>

                    <div>
                      {job.missingSkills.map(
                        (skill) => (
                          <span
                            className="skill-tag"
                            key={skill}
                          >
                            {skill}
                          </span>
                        )
                      )}
                    </div>

                  </div>
                )}

              </article>
            ))
          )}

        </div>

      </div>
    </div>
  );
}

export default RecommendedJobs;