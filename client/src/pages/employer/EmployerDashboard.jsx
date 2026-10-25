import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

function EmployerDashboard() {
  const {
    user,
    token,
    isAuthenticated,
  } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [organization, setOrganization] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!token) return;

    const loadDashboard = async () => {
      try {
        const [
          organizationData,
          jobsData,
        ] = await Promise.all([
          api.getMyOrganization(token),
          api.getMyJobs(token),
        ]);

        setOrganization(
          organizationData.organization
        );

        setJobs(jobsData.jobs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
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
    ![
      "employer",
      "university",
      "college",
      "startup",
    ].includes(user.role)
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  if (loading) {
    return (
      <div className="profile-loading">
        Loading employer dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard">

      <nav className="dashboard-nav">

        <Link
          to="/dashboard"
          className="logo"
        >
          FELG
        </Link>

        <div className="employer-nav">

          <Link to="/employer/jobs/new">
            Post a job
          </Link>

          <Link to="/dashboard">
            Dashboard
          </Link>

        </div>

      </nav>

      <main className="dashboard-content">

        <div className="welcome-card">

          <p className="small-label">
            EMPLOYER PORTAL
          </p>

          <h1>
            {organization
              ? organization.name
              : `Welcome, ${user.first_name}`}
          </h1>

          <p>
            Manage your organization,
            jobs and applicants.
          </p>

        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!organization && (
          <div className="profile-section">

            <h2>
              Create your organization
            </h2>

            <p>
              You need an organization before
              you can publish jobs.
            </p>

            <Link
              to="/employer/organization"
              className="primary-btn"
            >
              Create organization
            </Link>

          </div>
        )}

        <section className="profile-section">

          <div className="section-heading">

            <h2>Your job postings</h2>

            <Link
              to="/employer/jobs/new"
              className="primary-btn"
            >
              + Post job
            </Link>

          </div>

          {jobs.length === 0 ? (
            <div className="empty-jobs">

              <h3>
                No job postings yet
              </h3>

              <p>
                Create your first job
                opportunity.
              </p>

            </div>
          ) : (
            <div className="employer-job-list">

              {jobs.map((job) => (

                <div
                  className="employer-job"
                  key={job.id}
                >

                  <div>

                    <h3>
                      {job.title}
                    </h3>

                    <p>
                      {job.country ||
                        "Location not specified"}
                    </p>

                  </div>

                  <div className="job-actions">

                    <span>
                      {job.applicant_count} applicants
                    </span>

                    <Link
                      to={`/employer/jobs/${job.id}/applicants`}
                    >
                      View applicants
                    </Link>

                  </div>

                </div>

              ))}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default EmployerDashboard;