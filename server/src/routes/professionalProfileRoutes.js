const express = require("express");

const uploadCv =
  require("../middleware/cvUploadMiddleware");

const {
  getMyProfessionalProfile,
  updateProfessionalProfile,
  addPortfolioProject,
  deletePortfolioProject,
  addExperience,
  deleteExperience,
} = require("../controllers/professionalProfileController");

const {
  getMyProfessionalProfile,
  updateProfessionalProfile,
  addPortfolioProject,
  deletePortfolioProject,
  addExperience,
  deleteExperience,
  getPublicProfile,
  uploadMyCv,
  deleteMyCv,
  getProfileCompletion,
  downloadMyCv,
} = require("../controllers/professionalProfileController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

const {
  updateProfileValidation,
} = require("../validators/profileValidators");

const {
  handleValidationErrors,
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.use(authenticate);

router.get(
  "/me",
  getMyProfessionalProfile
);

router.put(
  "/me",
  updateProfileValidation,
  handleValidationErrors,
  updateProfessionalProfile
);

router.post(
  "/projects",
  addPortfolioProject
);

router.delete(
  "/projects/:projectId",
  deletePortfolioProject
);

router.post(
  "/experience",
  addExperience
);

router.delete(
  "/experience/:experienceId",
  deleteExperience
);

router.post(
  "/cv",
  uploadCv.single("cv"),
  uploadMyCv
);

router.delete(
  "/cv",
  deleteMyCv
);

router.get(
  "/completion",
  getProfileCompletion
);

router.get(
  "/cv/download",
  downloadMyCv
);

module.exports = router;