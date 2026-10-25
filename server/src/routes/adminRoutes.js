const express = require("express");

const {
  getStatistics,
  getUsers,
  updateUserStatus,
  verifyUser,
  getOrganizations,
  verifyOrganization,
  getAdminActions,
} = require("../controllers/adminController");

const {
  authenticate,
  authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();


// Every route below requires admin
router.use(
  authenticate,
  authorize("admin")
);


// Dashboard
router.get(
  "/statistics",
  getStatistics
);


// Users
router.get(
  "/users",
  getUsers
);

router.patch(
  "/users/:userId/status",
  updateUserStatus
);

router.patch(
  "/users/:userId/verify",
  verifyUser
);


// Organizations
router.get(
  "/organizations",
  getOrganizations
);

router.patch(
  "/organizations/:organizationId/verify",
  verifyOrganization
);


// Audit log
router.get(
  "/actions",
  getAdminActions
);


module.exports = router;