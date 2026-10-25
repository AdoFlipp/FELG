import { Link } from "react-router-dom";


<Link
  to="/profile"
  className="dashboard-card"
>

  <span>👤</span>

  <h2>My Profile</h2>

  <p>
    Manage your professional profile,
    skills, education and experience.
  </p>
</Link>
function Dashboard() {
  return (
    <main style={{ padding: "32px", color: "#222" }}>
      <h1>Welcome to FELG</h1>
      <p>Your opportunities, career, and education in one place.</p>
    </main>
  );
}

<Link
  to="/recommendations"
  className="dashboard-card"
>
  <h3>
    🧠 My Recommendations
  </h3>

  <p>
    Discover jobs, programs,
    startups and mentors matched
    to your profile.
  </p>
</Link>



export default Dashboard;
<div>
   <Link to="/employer/ats">Applicant Tracking</Link>
   <Link to="/startups">Startups</Link>
</div>
