import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function ProgramDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    user,
    token,
    isAuthenticated,
  } = useAuth();

  const [program, setProgram] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [applying, setApplying] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadProgram = async () => {
      try {
        const data =
          await api.getProgram(id);

        setProgram(data.program);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProgram();
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
        "Only students and graduates can apply."
      );

      return;
    }

    try {
      setApplying(true);
      setError("");
      setMessage("");

      await api.applyToProgram(
        token,
        id
      );

      setMessage(
        "Your application has been submitted."
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
        Loading program...
      </div>
    );
  }

  if (!program) {
    return (
      <div className="profile-loading">
        Program not found.
      </div>
    );
  }

  return (
    <div className="education-page">

      <nav className="dashboard-nav">

        <Link
          to="/"
          className="logo"
        >
          FELG
        </Link>

        <Link to="/education">
          ← Programs
        </Link>

      </nav>

      <main className="program-details">

        <section className="program-header">

          <div className="program-logo large">
            {program.institution_name
              ?.charAt(0)
              ?.toUpperCase() || "U"}
          </div>

          <div>

            <p className="institution-name">
              {program.institution_name}
            </p>

            <h1>
              {program.name}
            </h1>

            <p>
              {program.city
                ? `${program.city}, `
                : ""}
              {program.country}
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

        <section className="program-section">

          <h2>
            Program information
          </h2>

          <div className="program-information">

            <div>
              <strong>
                Degree level
              </strong>

              <p>
                {program.degree_level}
              </p>
            </div>

            <div>
              <strong>
                Duration
              </strong>

              <p>
                {program.duration ||
                  "Not specified"}
              </p>
            </div>

            <div>
              <strong>
                Application deadline
              </strong>

              <p>
                {program.application_deadline
                  ? new Date(
                      program.application_deadline
                    ).toLocaleDateString()
                  : "Not specified"}
              </p>
            </div>

          </div>

        </section>

        <section className="program-section">

          <h2>
            About this program
          </h2>

          <p className="program-description">
            {program.description ||
              "No description provided."}
          </p>

        </section>

        <button
          className="apply-button"
          onClick={handleApply}
          disabled={applying}
        >
          {applying
            ? "Submitting..."
            : "Apply to this program"}
        </button>

      </main>

    </div>
  );
}

export default ProgramDetails;