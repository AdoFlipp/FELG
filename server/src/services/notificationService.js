const pool = require("../config/database");

const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedId = null,
}) => {
  try {
    const result = await pool.query(
      `
      INSERT INTO notifications
      (
        user_id,
        type,
        title,
        message,
        related_id
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        userId,
        type,
        title,
        message,
        relatedId,
      ]
    );

    return result.rows[0];
  } catch (error) {
    console.error(
      "Create notification error:",
      error
    );

    return null;
  }
};

module.exports = {
  createNotification,
};