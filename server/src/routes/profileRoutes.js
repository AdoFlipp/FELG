const express = require("express");
const router = express.Router();

const {
  getMyProfessionalProfile,
  updateProfessionalProfile,
  getPublicProfile,
} = require("../controllers/profileController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

router.get(
  "/",
  authenticate,
  getMyProfessionalProfile
);

router.put(
  "/",
  authenticate,
  updateProfessionalProfile
);

router.get(
  "/public/:userId",
  getPublicProfile
);

router.get(
  "/:userId",
  getPublicProfile
);

module.exports = router;