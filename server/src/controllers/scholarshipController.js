const pool = require("../config/database");

const getScholarships = async (req, res) => {
  try {
    const {
      search = "",
      country = "",
    } = req.query;

    const values = [];
    const conditions = [];

    if (search) {
      values.push(`%${search}%`);

      conditions.push(`
        (
          s.name ILIKE $${values.length}
          OR s.description ILIKE $${values.length}
          OR s.eligibility ILIKE $${values.length}
        )
      `);
    }

    if (country) {
      values.push(country);

      conditions.push(
        `o.country = $${values.length}`
      );
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const result = await pool.query(
      `
      SELECT
        s.id,
        s.name,
        s.description,
        s.amount,
        s.currency,
        s.eligibility,
        s.deadline,
        s.application_url,

        o.id AS organization_id,
        o.name AS institution_name,
        o.country,
        o.city

      FROM scholarships s

      JOIN organizations o
        ON o.id = s.organization_id

      ${whereClause}

      ORDER BY s.deadline ASC NULLS LAST
      `,
      values
    );

    res.json({
      success: true,
      scholarships: result.rows,
    });
  } catch (error) {
    console.error(
      "Get scholarships error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load scholarships",
    });
  }
};

module.exports = {
  getScholarships,
};