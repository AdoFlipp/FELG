const express = require("express");
const router = express.Router();

const {
  globalSearch,
  searchJobs,
} = require("../controllers/searchController");

router.get("/", globalSearch);
router.get("/jobs", searchJobs);

module.exports = router;