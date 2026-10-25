import { useState } from "react";
import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

function CreateJob() {
  const {
    user,
    token,
    isAuthenticated,
  } = useAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    country: "",
    city: "",
    workType: "onsite",
    salaryMin: "",
    salaryMax: "",
    currency: "",
    applicationUrl: "",
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

    setError("");
    setLoading(true);

    try {
      await api.createJob(
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

      <div className="auth-card job-form-card">

        <div className="auth-header">

          <h1>
            Post a job
          </h1>

          <p>
            Find talented people through FELG.
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
              Job title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Software Developer"
              required
            />

          </div>

          <div className="form-group">

            <label>
              Job description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="8"
              required
            />

          </div>

          <div className="form-group">

            <label>
              Work type
            </label>

            <select
              name="workType"
              value={form.workType}
              onChange={handleChange}
            >

              <option value="onsite">
                On-site
              </option>

              <option value="remote">
                Remote
              </option>

              <option value="hybrid">
                Hybrid
              </option>

            </select>

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

          <div className="form-row">

            <div className="form-group">

              <label>
                Minimum salary
              </label>

              <input
                type="number"
                name="salaryMin"
                value={form.salaryMin}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>
                Maximum salary
              </label>

              <input
                type="number"
                name="salaryMax"
                value={form.salaryMax}
                onChange={handleChange}
              />

            </div>

          </div>

          <div className="form-group">

            <label>
              Currency
            </label>

            <input
              name="currency"
              value={form.currency}
              onChange={handleChange}
              placeholder="USD"
            />

          </div>

          <div className="form-group">

            <label>
              External application URL
            </label>

            <input
              type="url"
              name="applicationUrl"
              value={form.applicationUrl}
              onChange={handleChange}
              placeholder="Optional"
            />

          </div>

          <button
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Publishing..."
              : "Publish job"}
          </button>

        </form>

        <p className="auth-footer">

          <Link to="/employer">
            ← Employer dashboard
          </Link>

        </p>

      </div>

    </div>
  );
}

export default CreateJob;