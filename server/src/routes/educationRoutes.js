const express = require("express");

const {
  getPrograms,
  getProgram,
  applyToProgram,
  getMyEducationApplications,
} = require("../controllers/educationController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/programs",
  getPrograms
);

router.get(
  "/programs/:id",
  getProgram
);

router.post(
  "/programs/:programId/apply",
  authenticate,
  authorize(
    "student",
    "graduate"
  ),
  applyToProgram
);

router.get(
  "/applications/me",
  authenticate,
  authorize(
    "student",
    "graduate"
  ),
  getMyEducationApplications
);

module.exports = router;