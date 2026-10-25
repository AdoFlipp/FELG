import {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  AuthContext,
} from "../../context/AuthContext";

import{ api } from "../../services/api";

function StartupDashboard() {
  const { token } =
    useContext(AuthContext);

  const [startups, setStartups] =
    useState([]);

  const [selectedStartup, setSelectedStartup] =
    useState(null);

  const [opportunities, setOpportunities] =
    useState([]);

  const [applicants, setApplicants] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");

  const loadStartups = async () => {
    try {
      const response =
        await api.getMyStartups(token);

      const data =
        response.data || [];

      setStartups(data);

      if (data.length > 0) {
        setSelectedStartup(data[0]);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadManagementData =
    async (startupId) => {
      try {
        const [
          opportunityResponse,
          applicantResponse,
        ] = await Promise.all([
          api.getMyStartupOpportunities(
            token,
            startupId
          ),
          api.getStartupApplicants(
            token,
            startupId
          ),
        ]);

        setOpportunities(
          opportunityResponse.data || []
        );

        setApplicants(
          applicantResponse.data || []
        );
      } catch (error) {
        setMessage(error.message);
      }
    };

  useEffect(() => {
    if (token) {
      loadStartups();
    }
  }, [token]);

  useEffect(() => {
    if (token && selectedStartup) {
      loadManagementData(
        selectedStartup.id
      );
    }
  }, [
    token,
    selectedStartup,
  ]);

  const updateStatus = async (
    applicationId,
    status
  ) => {
    try {
      await api.updateStartupApplicationStatus(
        token,
        selectedStartup.id,
        applicationId,
        status
      );

      setApplicants(
        (current) =>
          current.map((item) =>
            item.id === applicationId
              ? {
                  ...item,
                  status,
                }
              : item
          )
      );
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        Loading startup dashboard...
      </div>
    );
  }

  return (
    <div className="startup-dashboard-page">
      <div className="startup-dashboard-container">

        <header>
          <h1>
            Startup Dashboard
          </h1>

          <p>
            Manage your startups,
            opportunities and applicants.
          </p>
        </header>

        {message && (
          <div className="search-error">
            {message}
          </div>
        )}

        {startups.length === 0 ? (
          <section className="dashboard-empty">
            <h2>
              You haven't created a startup yet.
            </h2>

            <p>
              Create your startup profile
              to begin building your team
              and publishing opportunities.
            </p>
          </section>
        ) : (
          <>
            <section className="startup-selector">

              <label>
                Your startup
              </label>

              <select
                value={
                  selectedStartup?.id || ""
                }
                onChange={(event) => {
                  const startup =
                    startups.find(
                      (item) =>
                        item.id ===
                        event.target.value
                    );

                  setSelectedStartup(
                    startup
                  );
                }}
              >
                {startups.map(
                  (startup) => (
                    <option
                      key={startup.id}
                      value={startup.id}
                    >
                      {startup.name}
                    </option>
                  )
                )}
              </select>

            </section>

            {selectedStartup && (
              <>
                <section className="dashboard-stats">

                  <div className="dashboard-stat">
                    <strong>
                      {selectedStartup.active_opportunities ||
                        0}
                    </strong>

                    <span>
                      Active opportunities
                    </span>
                  </div>

                  <div className="dashboard-stat">
                    <strong>
                      {selectedStartup.total_applications ||
                        0}
                    </strong>

                    <span>
                      Applications
                    </span>
                  </div>

                  <div className="dashboard-stat">
                    <strong>
                      {applicants.length}
                    </strong>

                    <span>
                      Applicants
                    </span>
                  </div>

                </section>

                <section className="dashboard-section">

                  <div className="dashboard-section-header">
                    <h2>
                      Opportunities
                    </h2>
                  </div>

                  {opportunities.length === 0 ? (
                    <p>
                      No opportunities yet.
                    </p>
                  ) : (
                    <div className="dashboard-list">

                      {opportunities.map(
                        (opportunity) => (
                          <article
                            className="dashboard-card"
                            key={
                              opportunity.id
                            }
                          >
                            <h3>
                              {
                                opportunity.title
                              }
                            </h3>

                            <p>
                              Type:{" "}
                              {
                                opportunity.opportunity_type
                              }
                            </p>

                            <p>
                              Applications:{" "}
                              {
                                opportunity.application_count
                              }
                            </p>

                            <p>
                              Status:{" "}
                              {opportunity.is_active
                                ? "Active"
                                : "Inactive"}
                            </p>
                          </article>
                        )
                      )}

                    </div>
                  )}

                </section>

                <section className="dashboard-section">

                  <div className="dashboard-section-header">
                    <h2>
                      Applicants
                    </h2>

                    <span>
                      {applicants.length}
                    </span>
                  </div>

                  {applicants.length === 0 ? (
                    <p>
                      No applications yet.
                    </p>
                  ) : (
                    <div className="dashboard-list">

                      {applicants.map(
                        (applicant) => (
                          <article
                            className="applicant-card"
                            key={
                              applicant.id
                            }
                          >
                            <div>
                              <h3>
                                {
                                  applicant.headline ||
                                  applicant.applicant_email
                                }
                              </h3>

                              <p>
                                {
                                  applicant.applicant_email
                                }
                              </p>

                              <p>
                                Opportunity:{" "}
                                {
                                  applicant.opportunity_title
                                }
                              </p>

                              {applicant.message && (
                                <p>
                                  Message:{" "}
                                  {applicant.message}
                                </p>
                              )}
                            </div>

                            <div className="applicant-actions">

                              <span>
                                {applicant.status.replace(
                                  "_",
                                  " "
                                )}
                              </span>

                              <select
                                value={
                                  applicant.status
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateStatus(
                                    applicant.id,
                                    event.target.value
                                  )
                                }
                              >
                                <option value="submitted">
                                  Submitted
                                </option>

                                <option value="under_review">
                                  Under review
                                </option>

                                <option value="shortlisted">
                                  Shortlisted
                                </option>

                                <option value="interview">
                                  Interview
                                </option>

                                <option value="accepted">
                                  Accepted
                                </option>

                                <option value="rejected">
                                  Rejected
                                </option>

                                <option value="withdrawn">
                                  Withdrawn
                                </option>
                              </select>

                            </div>
                          </article>
                        )
                      )}

                    </div>
                  )}

                </section>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default StartupDashboard;