const pool = require("../config/database");
const { createNotification } = require("../services/notificationService");

// ============================================
// GET MY STARTUPS
// ============================================

const getMyStartups = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        s.*,

        COUNT(DISTINCT so.id)
          FILTER (
            WHERE so.is_active = TRUE
          ) AS active_opportunities,

        COUNT(DISTINCT soa.id)
          AS total_applications

      FROM startups s

      LEFT JOIN startup_opportunities so
        ON so.startup_id = s.id

      LEFT JOIN startup_opportunity_applications soa
        ON soa.opportunity_id = so.id

      WHERE s.owner_user_id = $1

      GROUP BY s.id

      ORDER BY s.created_at DESC
      `,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get my startups error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load your startups",
    });
  }
};

// ============================================
// UPDATE STARTUP
// ============================================

const updateStartup = async (req, res) => {
  try {
    const {
      name,
      description,
      industry,
      country,
      city,
      website,
      logoUrl,
      stage,
      foundedYear,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE startups
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        industry = COALESCE($3, industry),
        country = COALESCE($4, country),
        city = COALESCE($5, city),
        website = COALESCE($6, website),
        logo_url = COALESCE($7, logo_url),
        stage = COALESCE($8, stage),
        founded_year = COALESCE($9, founded_year),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
        AND owner_user_id = $11
      RETURNING *
      `,
      [
        name,
        description,
        industry,
        country,
        city,
        website,
        logoUrl,
        stage,
        foundedYear,
        req.params.startupId,
        req.user.id,
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message:
          "Startup not found or you are not the owner",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update startup error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update startup",
    });
  }
};

// ============================================
// GET MY OPPORTUNITIES
// ============================================

const getMyOpportunities = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        so.*,
        COUNT(soa.id) AS application_count

      FROM startup_opportunities so

      JOIN startups s
        ON s.id = so.startup_id

      LEFT JOIN startup_opportunity_applications soa
        ON soa.opportunity_id = so.id

      WHERE s.id = $1
        AND s.owner_user_id = $2

      GROUP BY so.id

      ORDER BY so.created_at DESC
      `,
      [
        req.params.startupId,
        req.user.id,
      ]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(
      "Get startup opportunities error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load opportunities",
    });
  }
};

// ============================================
// UPDATE OPPORTUNITY
// ============================================

const updateOpportunity = async (req, res) => {
  try {
    const {
      title,
      opportunityType,
      description,
      location,
      country,
      workType,
      compensation,
      applicationUrl,
      deadline,
      isActive,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE startup_opportunities so
      SET
        title =
          COALESCE($1, so.title),

        opportunity_type =
          COALESCE(
            $2,
            so.opportunity_type
          ),

        description =
          COALESCE(
            $3,
            so.description
          ),

        location =
          COALESCE($4, so.location),

        country =
          COALESCE($5, so.country),

        work_type =
          COALESCE($6, so.work_type),

        compensation =
          COALESCE(
            $7,
            so.compensation
          ),

        application_url =
          COALESCE(
            $8,
            so.application_url
          ),

        deadline =
          COALESCE($9, so.deadline),

        is_active =
          COALESCE(
            $10,
            so.is_active
          ),

        updated_at =
          CURRENT_TIMESTAMP

      FROM startups s

      WHERE so.id = $11
        AND so.startup_id = s.id
        AND s.owner_user_id = $12

      RETURNING so.*
      `,
      [
        title,
        opportunityType,
        description,
        location,
        country,
        workType,
        compensation,
        applicationUrl,
        deadline,
        isActive,
        req.params.opportunityId,
        req.user.id,
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message:
          "Opportunity not found or not owned by you",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Update startup opportunity error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update opportunity",
    });
  }
};

// ============================================
// GET APPLICANTS
// ============================================

const getStartupApplicants = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        soa.id,
        soa.status,
        soa.message,
        soa.created_at,
        soa.updated_at,

        so.id AS opportunity_id,
        so.title AS opportunity_title,

        u.id AS applicant_id,
        u.email AS applicant_email,

        p.headline,
        p.bio,
        p.profile_photo_url

      FROM startup_opportunity_applications soa

      JOIN startup_opportunities so
        ON so.id = soa.opportunity_id

      JOIN startups s
        ON s.id = so.startup_id

      JOIN users u
        ON u.id = soa.applicant_id

      LEFT JOIN profiles p
        ON p.user_id = u.id

      WHERE s.id = $1
        AND s.owner_user_id = $2

      ORDER BY soa.created_at DESC
      `,
      [
        req.params.startupId,
        req.user.id,
      ]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(
      "Get startup applicants error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load applicants",
    });
  }
};

// ============================================
// UPDATE APPLICATION STATUS
// ============================================

const updateStartupApplicationStatus =
  async (req, res) => {
    try {
      const {
        status,
      } = req.body;

      const allowedStatuses = [
        "submitted",
        "under_review",
        "shortlisted",
        "interview",
        "accepted",
        "rejected",
        "withdrawn",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid application status",
        });
      }

      const result = await pool.query(
        `
        UPDATE
          startup_opportunity_applications soa

        SET
          status = $1,
          updated_at = CURRENT_TIMESTAMP

        FROM startup_opportunities so
        JOIN startups s
          ON s.id = so.startup_id

        WHERE soa.id = $2
          AND soa.opportunity_id = so.id
          AND s.id = $3
          AND s.owner_user_id = $4

        RETURNING
          soa.*,
          so.title AS opportunity_title
        `,
        [
          status,
          req.params.applicationId,
          req.params.startupId,
          req.user.id,
        ]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Application not found or not controlled by you",
        });
      }

      const application =
        result.rows[0];

      await createNotification({
        userId:
          application.applicant_id,

        type:
          "startup_application_status",

        title:
          "Startup application updated",

        message:
          `Your application for "${application.opportunity_title}" is now ${status.replace("_", " ")}.`,

        relatedId:
          application.opportunity_id,
      });

      res.json({
        success: true,
        data: application,
      });
    } catch (error) {
      console.error(
        "Update startup application status error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update application",
      });
    }
  };

module.exports = {
  getMyStartups,
  updateStartup,
  getMyOpportunities,
  updateOpportunity,
  getStartupApplicants,
  updateStartupApplicationStatus,
};