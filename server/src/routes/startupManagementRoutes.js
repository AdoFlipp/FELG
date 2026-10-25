const express = require("express");

const {
  getMyStartups,
  updateStartup,
  getMyOpportunities,
  updateOpportunity,
  getStartupApplicants,
  updateStartupApplicationStatus,
} = require("../controllers/startupManagementController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

// My startups
router.get(
  "/mine",
  getMyStartups
);

// Edit startup
router.patch(
  "/:startupId",
  updateStartup
);

// Startup opportunities
router.get(
  "/:startupId/opportunities",
  getMyOpportunities
);

router.patch(
  "/opportunities/:opportunityId",
  updateOpportunity
);

// Applicants
router.get(
  "/:startupId/applicants",
  getStartupApplicants
);

router.patch(
  "/:startupId/applications/:applicationId/status",
  updateStartupApplicationStatus
);

module.exports = router;