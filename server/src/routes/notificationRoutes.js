const express = require("express");

const {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require("../controllers/notificationController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  authenticate,
  getMyNotifications
);

router.patch(
  "/read-all",
  authenticate,
  markAllNotificationsRead
);

router.patch(
  "/:notificationId/read",
  authenticate,
  markNotificationRead
);

module.exports = router;