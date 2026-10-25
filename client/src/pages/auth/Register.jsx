
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../services/api";
import "../../Auth.css";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role:"student",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (form.password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });

      setMessage(
        "Your account was created successfully! You can now sign in."
      );

      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
      });
    } catch (err) {
      setError(
        err.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="auth-logo" to="/">FELG</Link>

        <h1>Create your account</h1>
        <p className="auth-subtitle">
          Join a community of job seekers, learners, and founders.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={updateField}
              autoComplete="given-name"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={updateField}
              autoComplete="family-name"
              required
            />
          </div>

          <div className="auth-field">
  <label htmlFor="role">Account type</label>
  <select
    id="role"
    name="role"
    value={form.role}
    onChange={updateField}
    required
  >
    <option value="student">Student</option>
    <option value="graduate">Graduate</option>
    <option value="employer">Employer</option>
    <option value="university">University</option>
    <option value="college">College</option>
    <option value="startup">Startup</option>
    <option value="mentor">Mentor</option>
  </select>
</div>

          <div className="auth-field">
            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={updateField}
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <p className="auth-error" role="alert">{error}</p>
          )}

          {message && <p role="status">{message}</p>}

          <button
            className="auth-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
