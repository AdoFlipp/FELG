const express = require("express");

const {
  getEmployerApplications,
  getApplicantDetails,
  updateJobApplicationStatus,
} = require("../controllers/atsController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(
  authenticate,
  authorize(
    "employer",
    "startup",
    "university",
    "college"
  )
);

router.get(
  "/applications",
  getEmployerApplications
);

router.get(
  "/applications/:applicationId",
  getApplicantDetails
);

router.patch(
  "/applications/:applicationId/status",
  updateJobApplicationStatus
);

router.get(
  "/statistics",
  getAtsStatistics
);

module.exports = router;