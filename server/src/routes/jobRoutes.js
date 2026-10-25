const express = require("express");

const {
  getJobs,
  getJob,
  createJob,
  applyForJob,
  getMyApplications,
} = require("../controllers/jobController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();


// Public job browsing
router.get("/", getJobs);


// Employer job posting
router.post(
  "/",
  authenticate,
  authorize(
    "employer",
    "university",
    "college",
    "startup"
  ),
  createJob
);


// Student/graduate applications
router.post(
  "/:id/apply",
  authenticate,
  authorize(
    "student",
    "graduate"
  ),
  applyForJob
);


// Applicant's applications
router.get(
  "/applications/me",
  authenticate,
  authorize(
    "student",
    "graduate"
  ),
  getMyApplications
);

router.get("/:id", getJob);

module.exports = router;