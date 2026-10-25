const express = require("express");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const {
  downloadApplicantCv,
} = require("../controllers/secureFileController");

const router = express.Router();

router.get(
  "/applications/:applicationId/applicants/:userId/cv",
  authenticate,
  authorize(
    "employer",
    "startup",
    "university",
    "college"
  ),
  downloadApplicantCv
);

module.exports = router;