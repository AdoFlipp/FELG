const pool = require("../config/database");


// ------------------------------------
// DASHBOARD STATISTICS
// ------------------------------------

const getStatistics = async (req, res) => {
  try {
    const users = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM users
      `
    );

    const organizations =
      await pool.query(
        `
        SELECT COUNT(*)::int AS count
        FROM organizations
        `
      );

    const jobs = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM jobs
      `
    );

    const programs = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM programs
      `
    );

    const startups = await pool.query(
      `
      SELECT COUNT(*)::int AS count
      FROM startups
      `
    );

    const applications =
      await pool.query(
        `
        SELECT COUNT(*)::int AS count
        FROM job_applications
        `
      );

    const educationApplications =
      await pool.query(
        `
        SELECT COUNT(*)::int AS count
        FROM education_applications
        `
      );

    res.json({
      success: true,

      statistics: {
        users: users.rows[0].count,
        organizations:
          organizations.rows[0].count,
        jobs: jobs.rows[0].count,
        programs:
          programs.rows[0].count,
        startups:
          startups.rows[0].count,
        jobApplications:
          applications.rows[0].count,
        educationApplications:
          educationApplications.rows[0].count,
      },
    });
  } catch (error) {
    console.error(
      "Admin statistics error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load statistics",
    });
  }
};


// ------------------------------------
// USERS
// ------------------------------------

const getUsers = async (req, res) => {
  try {
    const {
      search = "",
      role = "",
    } = req.query;

    const values = [];
    const conditions = [];

    if (search) {
      values.push(`%${search}%`);

      conditions.push(`
        (
          u.email ILIKE $${values.length}
          OR u.first_name ILIKE $${values.length}
          OR u.last_name ILIKE $${values.length}
        )
      `);
    }

    if (role) {
      values.push(role);

      conditions.push(
        `u.role = $${values.length}`
      );
    }

    const whereClause =
      conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.country,
        u.city,
        u.is_active,
        u.is_verified,
        u.created_at

      FROM users u

      ${whereClause}

      ORDER BY u.created_at DESC

      LIMIT 100
      `,
      values
    );

    res.json({
      success: true,
      users: result.rows,
    });
  } catch (error) {
    console.error(
      "Admin users error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load users",
    });
  }
};


// ------------------------------------
// CHANGE USER ACTIVE STATUS
// ------------------------------------

const updateUserStatus = async (
  req,
  res
) => {
  try {
    const adminId = req.user.id;

    const { userId } = req.params;

    const {
      isActive,
    } = req.body;

    if (
      typeof isActive !==
      "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "isActive must be true or false",
      });
    }

    if (adminId === userId) {
      return res.status(400).json({
        success: false,
        message:
          "An admin cannot deactivate their own account",
      });
    }

    const result = await pool.query(
      `
      UPDATE users

      SET is_active = $1

      WHERE id = $2

      RETURNING id, email, is_active
      `,
      [isActive, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await pool.query(
      `
      INSERT INTO admin_actions
      (
        admin_id,
        action,
        target_type,
        target_id,
        details
      )
      VALUES
      ($1,$2,$3,$4,$5)
      `,
      [
        adminId,
        isActive
          ? "activate_user"
          : "deactivate_user",
        "user",
        userId,
        `Account active: ${isActive}`,
      ]
    );

    res.json({
      success: true,
      message:
        isActive
          ? "User activated"
          : "User deactivated",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Update user status error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update user",
    });
  }
};


// ------------------------------------
// VERIFY USER
// ------------------------------------

const verifyUser = async (
  req,
  res
) => {
  try {
    const adminId = req.user.id;

    const { userId } = req.params;

    const result = await pool.query(
      `
      UPDATE users

      SET is_verified = true

      WHERE id = $1

      RETURNING id, email, is_verified
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await pool.query(
      `
      INSERT INTO admin_actions
      (
        admin_id,
        action,
        target_type,
        target_id,
        details
      )
      VALUES
      ($1,$2,$3,$4,$5)
      `,
      [
        adminId,
        "verify_user",
        "user",
        userId,
        "User verified",
      ]
    );

    res.json({
      success: true,
      message: "User verified",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Verify user error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to verify user",
    });
  }
};


// ------------------------------------
// ORGANIZATIONS
// ------------------------------------

const getOrganizations =
  async (req, res) => {
    try {
      const result =
        await pool.query(
          `
          SELECT
            o.id,
            o.name,
            o.type,
            o.country,
            o.city,
            o.website,
            o.is_verified,
            o.is_active,
            o.created_at

          FROM organizations o

          ORDER BY o.created_at DESC

          LIMIT 100
          `
        );

      res.json({
        success: true,
        organizations:
          result.rows,
      });
    } catch (error) {
      console.error(
        "Admin organizations error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load organizations",
      });
    }
  };


// ------------------------------------
// VERIFY ORGANIZATION
// ------------------------------------

const verifyOrganization =
  async (req, res) => {
    try {
      const adminId = req.user.id;

      const {
        organizationId,
      } = req.params;

      const result =
        await pool.query(
          `
          UPDATE organizations

          SET is_verified = true

          WHERE id = $1

          RETURNING
            id,
            name,
            is_verified
          `,
          [organizationId]
        );

      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Organization not found",
        });
      }

      await pool.query(
        `
        INSERT INTO admin_actions
        (
          admin_id,
          action,
          target_type,
          target_id,
          details
        )
        VALUES
        ($1,$2,$3,$4,$5)
        `,
        [
          adminId,
          "verify_organization",
          "organization",
          organizationId,
          "Organization verified",
        ]
      );

      res.json({
        success: true,
        message:
          "Organization verified",
        organization:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "Verify organization error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to verify organization",
      });
    }
  };


// ------------------------------------
// ADMIN ACTION LOG
// ------------------------------------

const getAdminActions =
  async (req, res) => {
    try {
      const result =
        await pool.query(
          `
          SELECT
            aa.id,
            aa.action,
            aa.target_type,
            aa.target_id,
            aa.details,
            aa.created_at,

            u.email AS admin_email

          FROM admin_actions aa

          JOIN users u
            ON u.id = aa.admin_id

          ORDER BY aa.created_at DESC

          LIMIT 100
          `
        );

      res.json({
        success: true,
        actions:
          result.rows,
      });
    } catch (error) {
      console.error(
        "Admin actions error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load admin actions",
      });
    }
  };


module.exports = {
  getStatistics,
  getUsers,
  updateUserStatus,
  verifyUser,
  getOrganizations,
  verifyOrganization,
  getAdminActions,
};