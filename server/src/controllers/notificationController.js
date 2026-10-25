const pool = require("../config/database");

const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        id,
        type,
        title,
        message,
        related_id,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
      `,
      [userId]
    );

    res.json({
      success: true,
      notifications: result.rows,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load notifications",
    });
  }
};


const markNotificationRead = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const { notificationId } =
      req.params;

    const result = await pool.query(
      `
      UPDATE notifications
      SET is_read = true
      WHERE id = $1
      AND user_id = $2
      RETURNING *
      `,
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      notification: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Mark notification error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update notification",
    });
  }
};


const markAllNotificationsRead =
  async (req, res) => {
    try {
      await pool.query(
        `
        UPDATE notifications
        SET is_read = true
        WHERE user_id = $1
        `,
        [req.user.id]
      );

      res.json({
        success: true,
        message:
          "All notifications marked as read",
      });
    } catch (error) {
      console.error(
        "Mark all notifications error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update notifications",
      });
    }
  };


module.exports = {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};