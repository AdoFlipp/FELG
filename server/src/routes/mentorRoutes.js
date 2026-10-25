const express = require("express");

const {
  getMentors,
} = require("../controllers/mentorController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  getMentors
);

module.exports = router;