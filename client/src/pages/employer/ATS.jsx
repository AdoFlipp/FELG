import {
  useContext,
  useEffect,
  useState,
} from "react";

import {
  AuthContext,
} from "../../context/AuthContext";

import { api }from "../../services/api";

function ATS() {
  const {
    token,
  } = useContext(AuthContext);

  const [
    applications,
    setApplications,
  ] = useState([]);

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    selectedApplication,
    setSelectedApplication,
  ] = useState(null);

  const loadApplications =
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.getEmployerApplications(
            token,
            {
              status:
                statusFilter,
            }
          );

        setApplications(
          response.data || []
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (token) {
      loadApplications();
    }
  }, [
    token,
    statusFilter,
  ]);

const downloadApplicantCv = async () => {
  const applicationId =
    selectedApplication.application.id;

  const applicantId =
    selectedApplication.application.applicant_id;

  const response = await fetch(
    `http://localhost:5000/api/files/applications/${applicationId}/applicants/${applicantId}/cv`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const data =
      await response.json();

    throw new Error(
      data.message ||
        "Unable to download CV"
    );
  }

  const blob =
    await response.blob();

  const url =
    window.URL.createObjectURL(
      blob
    );

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    selectedApplication.cv.file_name;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  window.URL.revokeObjectURL(
    url
  );
};

  const openApplicant = async (
    applicationId
  ) => {
    try {
      const response =
        await api.getApplicantDetails(
          token,
          applicationId
        );

      setSelectedApplication(
        response.data
      );
    } catch (error) {
      alert(error.message);
    }
  };

  const updateStatus = async (
    applicationId,
    status
  ) => {
    try {
      await api.updateAtsApplicationStatus(
        token,
        applicationId,
        status
      );

      setApplications(
        (current) =>
          current.map((item) =>
            item.application_id ===
            applicationId
              ? {
                  ...item,
                  application_status:
                    status,
                }
              : item
          )
      );

      if (
        selectedApplication
          ?.application
          ?.application_id ===
        applicationId
      ) {
        setSelectedApplication(
          (current) => ({
            ...current,

            application: {
              ...current.application,
              status,
            },
          })
        );
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="ats-page">
      <div className="ats-container">

        <header className="ats-header">
          <div>
            <h1>
              Applicant Tracking
            </h1>

            <p>
              Review candidates and
              manage your recruitment
              pipeline.
            </p>
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="">
              All applications
            </option>

            <option value="submitted">
              Submitted
            </option>

            <option value="under_review">
              Under Review
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
          </select>
        </header>

        {error && (
          <div className="search-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="search-message">
            Loading applicants...
          </div>
        ) : (
          <div className="ats-layout">

            <section className="application-list">

              <div className="ats-count">
                {applications.length}
                {" "}
                application(s)
              </div>

              {applications.length ===
              0 ? (
                <div className="search-empty">
                  No applications found.
                </div>
              ) : (
                applications.map(
                  (application) => (
                    <article
                      className="application-card"
                      key={
                        application.application_id
                      }
                      onClick={() =>
                        openApplicant(
                          application.application_id
                        )
                      }
                    >
                      <div>

                        <h2>
                          {
                            application.headline ||
                            application.applicant_email
                          }
                        </h2>

                        <p>
                          {
                            application.applicant_email
                          }
                        </p>

                        <p>
                          Job:{" "}
                          {
                            application.job_title
                          }
                        </p>

                        <small>
                          Applied:{" "}
                          {new Date(
                            application.applied_at
                          ).toLocaleDateString()}
                        </small>

                      </div>

                      <select
                        value={
                          application.application_status
                        }
                        onClick={(
                          event
                        ) =>
                          event.stopPropagation()
                        }
                        onChange={(
                          event
                        ) =>
                          updateStatus(
                            application.application_id,
                            event.target.value
                          )
                        }
                      >
                        <option value="submitted">
                          Submitted
                        </option>

                        <option value="under_review">
                          Under Review
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
                    </article>
                  )
                )
              )}

            </section>

            <section className="applicant-preview">

              {!selectedApplication ? (
                <div className="preview-empty">
                  <h2>
                    Select an applicant
                  </h2>

                  <p>
                    Their professional
                    profile will appear here.
                  </p>
                </div>
              ) : (
                <div>

                  <h2>
                    {
                      selectedApplication
                        .application
                        .headline ||
                      selectedApplication
                        .application
                        .email
                    }
                  </h2>

                  <p>
                    {
                      selectedApplication
                        .application
                        .bio ||
                      "No bio provided."
                    }
                  </p>

                  <hr />

                  <h3>
                    Skills
                  </h3>

                  <div className="ats-tags">
                    {selectedApplication.skills.map(
                      (skill) => (
                        <span
                          key={skill.id}
                        >
                          {skill.name}
                        </span>
                      )
                    )}
                  </div>

                  <h3>
                    Education
                  </h3>

                  {selectedApplication
                    .education
                    .length === 0 ? (
                    <p>
                      No education entries.
                    </p>
                  ) : (
                    selectedApplication.education.map(
                      (item) => (
                        <div
                          className="ats-detail-item"
                          key={item.id}
                        >
                          <strong>
                            {
                              item.institution_name
                            }
                          </strong>

                          <p>
                            {
                              item.field_of_study
                            }
                          </p>
                        </div>
                      )
                    )
                  )}

                  <h3>
                    Experience
                  </h3>

                  {selectedApplication
                    .experience
                    .length === 0 ? (
                    <p>
                      No experience entries.
                    </p>
                  ) : (
                    selectedApplication.experience.map(
                      (item) => (
                        <div
                          className="ats-detail-item"
                          key={item.id}
                        >
                          <strong>
                            {
                              item.job_title
                            }
                          </strong>

                          <p>
                            {
                              item.company_name
                            }
                          </p>

                          <p>
                            {
                              item.description
                            }
                          </p>
                        </div>
                      )
                    )
                  )}

                  <h3>
                    Portfolio
                  </h3>

                  {selectedApplication
                    .projects
                    .length === 0 ? (
                    <p>
                      No portfolio projects.
                    </p>
                  ) : (
                    selectedApplication.projects.map(
                      (project) => (
                        <div
                          className="ats-detail-item"
                          key={project.id}
                        >
                          <strong>
                            {
                              project.title
                            }
                          </strong>

                          <p>
                            {
                              project.description
                            }
                          </p>
                        </div>
                      )
                    )
                  )}

                  
<h3>
  CV
</h3>

{selectedApplication.cv ? (
  <button
    type="button"
    onClick={async () => {
      try {
        await downloadApplicantCv();
      } catch (error) {
        alert(error.message);
      }
    }}
  >
    Download CV
  </button>
) : (
  <p>
    No CV uploaded.
  </p>
)}

                </div>
              )}

            </section>

          </div>
        )}

      </div>
    </div>
  );
}

export default ATS;