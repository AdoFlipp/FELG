const express = require("express");

const {
  createSavedSearch,
  getSavedSearches,
  deleteSavedSearch,
  updateSearchAlert,
} = require("../controllers/savedSearchController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.post("/", createSavedSearch);

router.get("/", getSavedSearches);

router.delete("/:id", deleteSavedSearch);

router.patch("/:id/alert", updateSearchAlert);

module.exports = router;