import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { api } from "../../services/api";

function StartupDetails() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);

  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStartup = async () => {
      try {
        const response = await api.getStartup(id);

        // Support either a direct object or an Axios-style response.
        const data = response?.data ?? response;
        setStartup(data?.startup ? data : { startup: data });
      } catch (err) {
        setError(err.message || "Could not load startup.");
      } finally {
        setLoading(false);
      }
    };

    loadStartup();
  }, [id]);

  const sendInterest = async () => {
    if (!token) {
      alert("Please log in first.");
      return;
    }

    try {
      await api.requestStartupInterest(
        token,
        id,
        "I am interested in connecting with your startup."
      );
      alert("Interest request sent.");
    } catch (err) {
      alert(err.message || "Could not send your request.");
    }
  };

  const apply = async (opportunityId) => {
    if (!token) {
      alert("Please log in first.");
      return;
    }

    try {
      await api.applyToStartupOpportunity(token, opportunityId, "");
      alert("Application submitted.");
    } catch (err) {
      alert(err.message || "Could not submit your application.");
    }
  };

  if (loading) {
    return <div className="page-loading">Loading startup...</div>;
  }

  if (error) {
    return <div className="search-error">{error}</div>;
  }

  if (!startup) {
    return <div className="search-error">Startup not found.</div>;
  }

  const profile = startup.startup ?? startup;
  const members = startup.members ?? [];
  const opportunities = startup.opportunities ?? [];

  return (
    <div className="startup-details-page">
      <div className="startup-details-container">
        <section className="startup-profile">
          <div className="startup-logo-large">
            {profile.logo_url ? (
              <img src={profile.logo_url} alt={profile.name || "Startup"} />
            ) : (
              profile.name?.charAt(0)?.toUpperCase()
            )}
          </div>

          <h1>{profile.name || "Startup"}</h1>

          {profile.industry && <p>{profile.industry}</p>}
          {profile.description && <p>{profile.description}</p>}
          {profile.country && <p>📍 {profile.country}</p>}
          {profile.city && <p>{profile.city}</p>}
          {profile.stage && <p>Stage: {profile.stage}</p>}

          <button onClick={sendInterest}>
            Connect with Startup
          </button>
        </section>

        <section>
          <h2>Founders &amp; Team</h2>

          <div className="startup-members">
            {members.map((member, index) => (
              <article
                className="startup-member"
                key={member.user_id ?? member.id ?? index}
              >
                <strong>
                  {member.headline ||
                    [member.first_name, member.last_name]
                      .filter(Boolean)
                      .join(" ") ||
                    member.email ||
                    "Team member"}
                </strong>
                <span>{member.role || "Member"}</span>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2>Opportunities</h2>

          <div className="startup-opportunity-list">
            {opportunities.length === 0 ? (
              <p>No active opportunities.</p>
            ) : (
              opportunities.map((opportunity) => (
                <article
                  className="startup-opportunity"
                  key={opportunity.id}
                >
                  <h3>{opportunity.title}</h3>

                  <p>
                    Type: {opportunity.opportunity_type || "Not specified"}
                  </p>

                  {opportunity.description && (
                    <p>{opportunity.description}</p>
                  )}

                  {opportunity.work_type && (
                    <p>Work type: {opportunity.work_type}</p>
                  )}

                  {opportunity.location && (
                    <p>Location: {opportunity.location}</p>
                  )}

                  {opportunity.deadline && (
                    <p>Deadline: {opportunity.deadline}</p>
                  )}

                  <button onClick={() => apply(opportunity.id)}>
                    Apply
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default StartupDetails;