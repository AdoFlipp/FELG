const pool = require("../config/database");

const createOrganization = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      description,
      website,
      country,
      city,
      organizationType,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Organization name is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO organizations
      (
        name,
        description,
        website,
        country,
        city,
        organization_type
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [
        name,
        description || null,
        website || null,
        country || null,
        city || null,
        organizationType || "company",
      ]
    );

    const organization = result.rows[0];

    // Link organization to the current user
    await pool.query(
      `
      UPDATE users
      SET organization_id = $1
      WHERE id = $2
      `,
      [organization.id, userId]
    );

    res.status(201).json({
      success: true,
      message: "Organization created successfully",
      organization,
    });
  } catch (error) {
    console.error(
      "Create organization error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create organization",
    });
  }
};


const getMyOrganization = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT o.*
      FROM organizations o
      JOIN users u
        ON u.organization_id = o.id
      WHERE u.id = $1
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Organization not found",
      });
    }

    res.json({
      success: true,
      organization: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Get organization error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load organization",
    });
  }
};


module.exports = {
  createOrganization,
  getMyOrganization,
};