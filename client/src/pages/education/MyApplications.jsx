import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
} from "react-router-dom";

import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function MyApplications() {
  const {
    user,
    token,
    isAuthenticated,
  } = useAuth();

  const [applications, setApplications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!token) return;

    const loadApplications =
      async () => {
        try {
          const data =
            await api.getMyEducationApplications(
              token
            );

          setApplications(
            data.applications
          );
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

    loadApplications();
  }, [token]);

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    user.role !== "student" &&
    user.role !== "graduate"
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
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
          Find programs
        </Link>

      </nav>

      <main className="education-container">

        <div className="education-heading">

          <p className="small-label">
            FELG APPLICATIONS
          </p>

          <h1>
            My education applications
          </h1>

          <p>
            Track your university and college
            applications in one place.
          </p>

        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading ? (
          <p>
            Loading applications...
          </p>
        ) : applications.length === 0 ? (

          <div className="empty-jobs">

            <h2>
              No applications yet
            </h2>

            <p>
              Find a program and start
              your application.
            </p>

            <Link to="/education">
              Browse programs
            </Link>

          </div>

        ) : (

          <div className="application-list">

            {applications.map(
              (application) => (

                <div
                  className="application-card"
                  key={application.id}
                >

                  <div>

                    <p className="institution-name">
                      {application.institution_name}
                    </p>

                    <h2>
                      {application.program_name}
                    </h2>

                    <p>
                      {application.country}
                      {application.city
                        ? ` • ${application.city}`
                        : ""}
                    </p>

                  </div>

                  <div className="application-status">

                    <span
                      className={`status ${application.status}`}
                    >
                      {application.status}
                    </span>

                    <p>
                      Applied{" "}
                      {new Date(
                        application.applied_at
                      ).toLocaleDateString()}
                    </p>

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

export default MyApplications;