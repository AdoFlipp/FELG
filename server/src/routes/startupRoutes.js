const express = require("express");

const {
  getStartups,
  getStartup,
  createStartup,
  createOpportunity,
  applyToOpportunity,
  requestStartupInterest,
} = require("../controllers/startupController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public discovery
router.get("/", getStartups);
router.get("/:id", getStartup);

// Create startup
router.post(
  "/",
  authenticate,
  authorize(
    "startup",
    "student",
    "graduate"
  ),
  createStartup
);

// Startup opportunities
router.post(
  "/:startupId/opportunities",
  authenticate,
  authorize("startup"),
  createOpportunity
);

// Apply
router.post(
  "/opportunities/:opportunityId/apply",
  authenticate,
authorize(
  "startup",
  "student",
  "graduate"
)
);

// Express interest
router.post(
  "/:startupId/interest",
  authenticate,
  requestStartupInterest
);

router.post(
  "/",
  authenticate,
  authorize(
    "startup",
    "student",
    "graduate"
  ),
  createStartup
);

module.exports = router;