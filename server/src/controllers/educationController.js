const pool = require("../config/database");

// GET PROGRAMS
const getPrograms = async (req, res) => {
  try {
    const {
      search = "",
      country = "",
      degreeLevel = "",
    } = req.query;

    const values = [];
    const conditions = [];

    if (search) {
      values.push(`%${search}%`);

      conditions.push(`
        (
          p.name ILIKE $${values.length}
          OR p.description ILIKE $${values.length}
          OR o.name ILIKE $${values.length}
        )
      `);
    }

    if (country) {
      values.push(country);

      conditions.push(
        `o.country = $${values.length}`
      );
    }

    if (degreeLevel) {
      values.push(degreeLevel);

      conditions.push(
        `p.degree_level = $${values.length}`
      );
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const result = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        p.description,
        p.degree_level,
        p.duration,
        p.application_deadline,

        o.id AS organization_id,
        o.name AS institution_name,
        o.country,
        o.city,
        o.website,
        o.logo_url

      FROM programs p

      JOIN organizations o
        ON o.id = p.organization_id

      ${whereClause}

      ORDER BY p.application_deadline ASC NULLS LAST
      `,
      values
    );

    res.json({
      success: true,
      programs: result.rows,
    });
  } catch (error) {
    console.error(
      "Get programs error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load programs",
    });
  }
};


// GET SINGLE PROGRAM
const getProgram = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        p.*,

        o.name AS institution_name,
        o.description AS institution_description,
        o.country,
        o.city,
        o.website,
        o.logo_url

      FROM programs p

      JOIN organizations o
        ON o.id = p.organization_id

      WHERE p.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    res.json({
      success: true,
      program: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Get program error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load program",
    });
  }
};


// APPLY TO PROGRAM
const applyToProgram = async (req, res) => {
  try {
    const applicantId = req.user.id;
    const { programId } = req.params;

    const existing = await pool.query(
      `
      SELECT id
      FROM education_applications
      WHERE program_id = $1
      AND applicant_id = $2
      `,
      [programId, applicantId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "You already applied to this program",
      });
    }

    const program = await pool.query(
      `
      SELECT id
      FROM programs
      WHERE id = $1
      `,
      [programId]
    );

    if (program.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Program not found",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO education_applications
      (
        program_id,
        applicant_id,
        status
      )
      VALUES
      ($1, $2, 'submitted')
      RETURNING *
      `,
      [programId, applicantId]
    );

    res.status(201).json({
      success: true,
      message:
        "Education application submitted",
      application: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Education application error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to submit education application",
    });
  }
};


// MY EDUCATION APPLICATIONS
const getMyEducationApplications =
  async (req, res) => {
    try {
      const applicantId = req.user.id;

      const result = await pool.query(
        `
        SELECT
          ea.id,
          ea.status,
          ea.applied_at,

          p.id AS program_id,
          p.name AS program_name,
          p.degree_level,
          p.application_deadline,

          o.name AS institution_name,
          o.country,
          o.city

        FROM education_applications ea

        JOIN programs p
          ON p.id = ea.program_id

        JOIN organizations o
          ON o.id = p.organization_id

        WHERE ea.applicant_id = $1

        ORDER BY ea.applied_at DESC
        `,
        [applicantId]
      );

      res.json({
        success: true,
        applications: result.rows,
      });
    } catch (error) {
      console.error(
        "Education applications error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load education applications",
      });
    }
  };


module.exports = {
  getPrograms,
  getProgram,
  applyToProgram,
  getMyEducationApplications,
};