import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <h1>404 — Page Not Found</h1>
      <p>Sorry, the FELG page you are looking for does not exist.</p>
      <Link to="/">Return to Home</Link>
    </div>
  );
}