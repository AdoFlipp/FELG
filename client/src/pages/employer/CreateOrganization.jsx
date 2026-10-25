import { useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

function CreateOrganization() {
  const {
    user,
    token,
    isAuthenticated,
  } = useAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    website: "",
    country: "",
    city: "",
    organizationType: "company",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]:
        event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      await api.createOrganization(
        token,
        form
      );

      navigate("/employer");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-header">

          <h1>
            Create organization
          </h1>

          <p>
            Create the organization that
            will publish opportunities on FELG.
          </p>

        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>
              Organization name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

          </div>

          <div className="form-group">

            <label>
              Organization type
            </label>

            <select
              name="organizationType"
              value={form.organizationType}
              onChange={handleChange}
            >

              <option value="company">
                Company
              </option>

              <option value="startup">
                Startup
              </option>

              <option value="university">
                University
              </option>

              <option value="college">
                College
              </option>

            </select>

          </div>

          <div className="form-group">

            <label>
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="5"
            />

          </div>

          <div className="form-group">

            <label>
              Website
            </label>

            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://example.com"
            />

          </div>

          <div className="form-row">

            <div className="form-group">

              <label>
                Country
              </label>

              <input
                name="country"
                value={form.country}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>
                City
              </label>

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
              />

            </div>

          </div>

          <button
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "Create organization"}
          </button>

        </form>

        <p className="auth-footer">

          <Link to="/dashboard">
            ← Back to dashboard
          </Link>

        </p>

      </div>

    </div>
  );
}

export default CreateOrganization;