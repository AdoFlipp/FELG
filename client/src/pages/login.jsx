import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Auth.css";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
     const result = await login({
  email: form.email.trim(),
  password: form.password,
});

const data = result.data ?? result;
      const role = data.user?.role;

const dashboardPaths = {
  student: "/dashboard",
  graduate: "/dashboard",
  employer: "/employer/ats",
  university: "/education/institution",
  college: "/education/institution",
  startup: "/startup/dashboard",
  mentor: "/network/mentors",
  admin: "/admin",
};

const destination = dashboardPaths[role] || "/jobs";

navigate(destination);
    } catch (err) {
      setError(err.message || "Login failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="auth-logo" to="/">FELG</Link>

        <h1>Welcome back</h1>
        <p className="auth-subtitle">
          Sign in to continue to your FELG account.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </section>
    </main>
  );
}
