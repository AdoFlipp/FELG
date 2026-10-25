const express = require ("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Import routes
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const employerRoutes = require("./routes/employerRoutes");
const educationRoutes = require("./routes/educationRoutes");
const scholarshipRoutes = require("./routes/scholarshipRoutes");
const educationAdminRoutes = require("./routes/educationAdminRoutes");
const networkRoutes = require("./routes/networkRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const searchRoutes = require("./routes/searchRoutes");
const savedSearchRoutes = require("./routes/savedSearchRoutes");
const matchingRoutes = require("./routes/matchingRoutes");
const startupRoutes = require("./routes/startupRoutes");
const startupManagementRoutes = require("./routes/startupManagementRoutes");
const professionalProfileRoutes = require("./routes/professionalProfileRoutes");
const profileRoutes = require("./routes/profileRoutes");
const atsRoutes = require("./routes/atsRoutes");
const secureFileRoutes = require("./routes/secureFileRoutes");

const path = require("path");

// Middleware — configure before routes
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "same-site",
    },

    referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
    },
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(
  express.urlencoded({
    extended: false,
    limit: "100kb",
  })
);

const authLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max: 10,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many authentication attempts. Please try again later.",
    },
  });

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const {
  startSearchAlertScheduler,
} = require("./services/searchAlertScheduler");

app.use("/api", limiter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "FELG API is running",
  });
});

// Register routes
app.use("/api/jobs", jobRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/scholarships", scholarshipRoutes);
app.use("/api/education/admin", educationAdminRoutes);
app.use("/api/network", networkRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/saved-searches", savedSearchRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/startups", startupRoutes);
app.use("/api/startup-management", startupManagementRoutes);
app.use("/api/professional-profile", professionalProfileRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/ats", atsRoutes);
app.use("/api/files", secureFileRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/auth", authLimiter);

if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is required"
  );
}
// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `FELG server running on port ${PORT}`
  );

  startSearchAlertScheduler();
});
