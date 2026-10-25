const pool = require("../config/database");

const getMentors = async (req, res) => {
  try {
    const {
      search = "",
    } = req.query;

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.country,
        u.city,

        p.headline,
        p.bio,
        p.profile_photo_url,

        (
          SELECT COUNT(*)
          FROM connections c
          WHERE
            (
              c.requester_id = u.id
              OR c.receiver_id = u.id
            )
            AND c.status = 'accepted'
        ) AS connection_count

      FROM users u

      LEFT JOIN profiles p
        ON p.user_id = u.id

      WHERE u.role = 'mentor'
      AND u.is_active = true

      AND (
        u.first_name ILIKE $1
        OR u.last_name ILIKE $1
        OR p.headline ILIKE $1
        OR p.bio ILIKE $1
      )

      ORDER BY u.first_name
      LIMIT 50
      `,
      [`%${search}%`]
    );

    res.json({
      success: true,
      mentors: result.rows,
    });
  } catch (error) {
    console.error(
      "Get mentors error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load mentors",
    });
  }
};

module.exports = {
  getMentors,
};