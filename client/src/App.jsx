import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/login.jsx";
import Register from "./pages/auth/Register.jsx";
import Jobs from "./pages/Jobs.jsx";
import Education from "./pages/Education.jsx";
import Startups from "./pages/Startups.jsx";

import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/notifications/Notifications";
import SavedSearches from "./pages/search/SavedSearches";
import Scholarships from "./pages/education/Scholarships";
import Mentors from "./pages/network/Mentors";
import StartupDetails from "./pages/startups/StartupDetails";
import Recommendations from "./pages/dashboard/Recommendations";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Search from "./pages/search/Search";
import JobSearch from "./pages/jobs/JobSearch";
import RecommendedJobs from "./pages/jobs/RecommendedJobs";
import StartupDashboard from "./pages/startups/StartupDashboard";
import ProfessionalProfile from "./pages/profile/ProfessionalProfile";
import PortfolioProjects from "./pages/profile/PortfolioProjects";
import ATS from "./pages/employer/ATS";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      {/* Main pages */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Jobs */}
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/search" element={<JobSearch />} />
      <Route path="/jobs/recommended" element={<RecommendedJobs />} />
      <Route path="/search" element={<Search />} />
      <Route path="/search/saved" element={<SavedSearches />} />

      {/* Education */}
      <Route path="/education" element={<Education />} />
      <Route
        path="/education/scholarships"
        element={<Scholarships />}
      />

      {/* Startups */}
      <Route path="/startups" element={<Startups />} />
      <Route path="/startups/:id" element={<StartupDetails />} />
      <Route
        path="/startup/dashboard"
        element={<StartupDashboard />}
      />

      {/* Professional profile and portfolio */}
      <Route
        path="/profile/professional"
        element={<ProfessionalProfile />}
      />
      <Route
        path="/profile/projects"
        element={<PortfolioProjects />}
      />

      {/* Employer */}
      <Route path="/employer/ats" element={<ATS />} />

      {/* Networking */}
      <Route path="/network/mentors" element={<Mentors />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route
        path="/recommendations"
        element={<Recommendations />}
      />

      <Route path="/dashboard" element={<Dashboard />} />

      {/* Administration */}
      <Route path="/admin" element={<AdminDashboard />} />

      {/* Unknown URLs */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;