import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

function Profile() {
  const {
    user,
    token,
    isAuthenticated,
  } = useAuth();

  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    headline: "",
    bio: "",
    phone: "",
    website: "",
    linkedinUrl: "",
    githubUrl: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    if (!token) return;

    const loadProfile = async () => {
      try {
        const data = await api.getProfile(token);

        setProfile(data.profile);
        setSkills(data.skills);
        setEducation(data.education);
        setExperience(data.experience);

        if (data.profile) {
          setForm({
            headline: data.profile.headline || "",
            bio: data.profile.bio || "",
            phone: data.profile.phone || "",
            website: data.profile.website || "",
            linkedinUrl: data.profile.linkedin_url || "",
            githubUrl: data.profile.github_url || "",
            dateOfBirth:
              data.profile.date_of_birth
                ? data.profile.date_of_birth.substring(0, 10)
                : "",
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      const data = await api.updateProfile(
        token,
        form
      );

      setProfile(data.profile);

      setMessage(
        "Profile updated successfully."
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="profile-page">

      <nav className="dashboard-nav">

        <Link to="/dashboard" className="logo">
          FELG
        </Link>

        <Link
          to="/dashboard"
          className="back-button"
        >
          Dashboard
        </Link>

      </nav>

      <main className="profile-container">

        <section className="profile-header">

          <div className="profile-avatar">
            {user.first_name?.charAt(0)}
            {user.last_name?.charAt(0)}
          </div>

          <div>
            <h1>
              {user.first_name} {user.last_name}
            </h1>

            <p>
              {user.role}
            </p>

            <p>
              {user.city || "Location not added"}
              {user.country
                ? `, ${user.country}`
                : ""}
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

        <section className="profile-section">

          <h2>About you</h2>

          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label>
                Professional headline
              </label>

              <input
                name="headline"
                value={form.headline}
                onChange={handleChange}
                placeholder="e.g. Software Developer"
              />

            </div>

            <div className="form-group">

              <label>About</label>

              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows="6"
                placeholder="Tell people about yourself..."
              />

            </div>

            <div className="form-group">

              <label>Phone</label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>Website</label>

              <input
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://..."
              />

            </div>

            <div className="form-group">

              <label>LinkedIn</label>

              <input
                name="linkedinUrl"
                value={form.linkedinUrl}
                onChange={handleChange}
                placeholder="https://..."
              />

            </div>

            <div className="form-group">

              <label>GitHub</label>

              <input
                name="githubUrl"
                value={form.githubUrl}
                onChange={handleChange}
                placeholder="https://..."
              />

            </div>

            <button
              type="submit"
              className="auth-button"
            >
              Save profile
            </button>

          </form>

        </section>

        <section className="profile-section">

          <h2>Skills</h2>

          {skills.length === 0 ? (
            <p className="empty-state">
              No skills added yet.
            </p>
          ) : (
            <div className="skill-list">
              {skills.map((skill) => (
                <span
                  className="skill-tag"
                  key={skill.id}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          )}

        </section>

        <section className="profile-section">

          <h2>Education</h2>

          {education.length === 0 ? (
            <p className="empty-state">
              No education added yet.
            </p>
          ) : (
            education.map((item) => (
              <div
                className="timeline-item"
                key={item.id}
              >
                <h3>
                  {item.institution}
                </h3>

                <p>
                  {item.degree}
                </p>

                <p>
                  {item.field_of_study}
                </p>
              </div>
            ))
          )}

        </section>

        <section className="profile-section">

          <h2>Experience</h2>

          {experience.length === 0 ? (
            <p className="empty-state">
              No experience added yet.
            </p>
          ) : (
            experience.map((item) => (
              <div
                className="timeline-item"
                key={item.id}
              >
                <h3>
                  {item.job_title}
                </h3>

                <p>
                  {item.company_name}
                </p>

                <p>
                  {item.description}
                </p>
              </div>
            ))
          )}

        </section>

      </main>

    </div>
  );
}

export default Profile;