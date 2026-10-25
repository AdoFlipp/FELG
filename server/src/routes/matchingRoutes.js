const express = require("express");

const {
  getRecommendations,
} = require("../controllers/matchingController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/recommendations",
  authenticate,
  getRecommendations
);

module.exports = router;

const express = require("express");

const {
  getJobMatch,
  getRecommendedJobs,
} = require("../controllers/matchingController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

router.use(
  authenticate,
  authorize("student", "graduate")
);

router.get(
  "/jobs/recommended",
  getRecommendedJobs
);

router.get(
  "/jobs/:jobId",
  getJobMatch
);

module.exports = router;