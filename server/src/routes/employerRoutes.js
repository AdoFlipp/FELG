const express = require("express");

const {
  getMyJobs,
  getApplicants,
  updateApplicationStatus,
} = require("../controllers/employerController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

const employerRoles = [
  "employer",
  "university",
  "college",
  "startup",
];

router.get(
  "/jobs",
  authenticate,
  authorize(...employerRoles),
  getMyJobs
);

router.get(
  "/jobs/:jobId/applicants",
  authenticate,
  authorize(...employerRoles),
  getApplicants
);

router.patch(
  "/applications/:applicationId/status",
  authenticate,
  authorize(...employerRoles),
  updateApplicationStatus
);

module.exports = router;