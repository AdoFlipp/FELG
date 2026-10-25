const express = require("express");

const {
  createOrganization,
  getMyOrganization,
} = require("../controllers/organizationController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize(
    "employer",
    "university",
    "college",
    "startup"
  ),
  createOrganization
);

router.get(
  "/me",
  authenticate,
  authorize(
    "employer",
    "university",
    "college",
    "startup"
  ),
  getMyOrganization
);

module.exports = router;