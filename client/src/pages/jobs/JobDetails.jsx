import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  AuthContext,
} from "../../context/AuthContext";

function JobDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [job, setJob] = useState(null);

  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const {
  user,
  token,
} = useContext(AuthContext);

const [
  match,
  setMatch,
] = useState(null);

useEffect(() => {
  if (
    token &&
    user &&
    (user.role === "student" ||
      user.role === "graduate")
  ) {
    api.getJobMatch(
      token,
      id
    )
      .then((response) => {
        setMatch(response.data);
      })
      .catch((error) => {
        console.error(
          "Match error:",
          error
        );
      });
  }
}, [
  token,
  user,
  id,
]);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const data = await api.getJob(id);

        setJob(data.job);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (
      user.role !== "student" &&
      user.role !== "graduate"
    ) {
      setError(
        "Only students and graduates can apply for jobs."
      );

      return;
    }

    try {
      setApplying(true);
      setError("");
      setMessage("");

      await api.applyForJob(token, id);

      setMessage(
        "Your application was submitted successfully!"
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        Loading job...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="profile-loading">
        Job not found.
      </div>
    );
  }

  return (
    <div className="jobs-page">

      <nav className="dashboard-nav">

        <Link to="/" className="logo">
          FELG
        </Link>

        <Link to="/jobs">
          ← Back to jobs
        </Link>

      </nav>

      <main className="job-details">

        <section className="job-details-header">

          <div className="company-logo large">
            {job.organization_name
              ?.charAt(0)
              ?.toUpperCase() || "F"}
          </div>

          <div>

            <h1>
              {job.title}
            </h1>

            <h2>
              {job.organization_name ||
                "Organization"}
            </h2>

            <p>
              {job.city
                ? `${job.city}, `
                : ""}
              {job.country || "Location not specified"}
            </p>

          </div>

        </section>

        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <section className="job-details-section">

          <h2>Job information</h2>

          <div className="job-information">

            {match && (
  <section className="job-match-panel">

    <h3>
      Your FELG Match
    </h3>

    <div className="match-score-large">
      {match.score}%
    </div>

    <p>
      Based on your profile,
      skills and this job's requirements.
    </p>

    {match.matchedSkills.length >
      0 && (
      <div>
        <strong>
          Matching skills:
        </strong>

        <div>
          {match.matchedSkills.map(
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

    {match.missingSkills.length >
      0 && (
      <div>
        <strong>
          Skills you may want to develop:
        </strong>

        <div>
          {match.missingSkills.map(
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

  </section>
)}

            <div>
              <strong>Work type</strong>
              <p>{job.work_type}</p>
            </div>

            <div>
              <strong>Country</strong>
              <p>{job.country || "Not specified"}</p>
            </div>

            <div>
              <strong>Salary</strong>
              <p>
                {job.salary_min ||
                job.salary_max
                  ? `${job.salary_min || "—"} - ${
                      job.salary_max || "—"
                    } ${job.currency || ""}`
                  : "Not specified"}
              </p>
            </div>

          </div>

        </section>

        <section className="job-details-section">

          <h2>About the role</h2>

          <p className="full-description">
            {job.description}
          </p>

        </section>

        <button
          className="apply-button"
          onClick={handleApply}
          disabled={applying}
        >
          {applying
            ? "Submitting..."
            : "Apply for this job"}
        </button>

      </main>

    </div>
  );
}

export default JobDetails;