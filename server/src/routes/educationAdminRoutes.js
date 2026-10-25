const express = require("express");

const {
  createProgram,
  createScholarship,
  getInstitutionApplications,
  updateApplicationStatus,
} = require("../controllers/educationAdminController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

const institutionRoles = [
  "university",
  "college",
];

router.post(
  "/programs",
  authenticate,
  authorize(...institutionRoles),
  createProgram
);

router.post(
  "/scholarships",
  authenticate,
  authorize(...institutionRoles),
  createScholarship
);

router.get(
  "/applications",
  authenticate,
  authorize(...institutionRoles),
  getInstitutionApplications
);

router.patch(
  "/applications/:applicationId/status",
  authenticate,
  authorize(...institutionRoles),
  updateApplicationStatus
);

module.exports = router;