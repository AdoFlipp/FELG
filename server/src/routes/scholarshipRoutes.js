const express = require("express");

const {
  getScholarships,
} = require("../controllers/scholarshipController");

const router = express.Router();

router.get("/", getScholarships);

module.exports = router;