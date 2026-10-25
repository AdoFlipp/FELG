const pool = require("../config/database");
const { createNotification } =
  require("../services/notificationService");

// ============================================
// GET STARTUPS
// ============================================

const getStartups = async (req, res) => {
  try {
    const {
      search = "",
      country = "",
      industry = "",
      stage = "",
    } = req.query;

    const values = [];
    const conditions = [
      "s.is_active = TRUE",
    ];

    let index = 1;

    if (search.trim()) {
      values.push(`%${search.trim()}%`);

      conditions.push(`
        (
          s.name ILIKE $${index}
          OR s.description ILIKE $${index}
          OR s.industry ILIKE $${index}
        )
      `);

      index++;
    }

    if (country.trim()) {
      values.push(country.trim());

      conditions.push(`
        LOWER(s.country) = LOWER($${index})
      `);

      index++;
    }

    if (industry.trim()) {
      values.push(`%${industry.trim()}%`);

      conditions.push(`
        s.industry ILIKE $${index}
      `);

      index++;
    }

    if (stage.trim()) {
      values.push(stage.trim());

      conditions.push(`
        LOWER(s.stage) = LOWER($${index})
      `);

      index++;
    }

    const result = await pool.query(
      `
      SELECT
        s.*,

        COUNT(
          DISTINCT sm.user_id
        ) AS member_count,

        COUNT(
          DISTINCT so.id
        ) FILTER (
          WHERE so.is_active = TRUE
        ) AS opportunity_count

      FROM startups s

      LEFT JOIN startup_members sm
        ON sm.startup_id = s.id

      LEFT JOIN startup_opportunities so
        ON so.startup_id = s.id

      WHERE ${conditions.join(" AND ")}

      GROUP BY s.id

      ORDER BY s.created_at DESC
      `,
      values
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(
      "Get startups error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load startups",
    });
  }
};

// ============================================
// GET STARTUP
// ============================================

const getStartup = async (req, res) => {
  try {
    const startupResult =
      await pool.query(
        `
        SELECT *
        FROM startups
        WHERE id = $1
          AND is_active = TRUE
        `,
        [req.params.id]
      );

    if (!startupResult.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Startup not found",
      });
    }

    const startup =
      startupResult.rows[0];

    const membersResult =
      await pool.query(
        `
        SELECT
          sm.*,
          u.email,
          p.headline,
          p.profile_photo_url
        FROM startup_members sm
        JOIN users u
          ON u.id = sm.user_id
        LEFT JOIN profiles p
          ON p.user_id = u.id
        WHERE sm.startup_id = $1
        ORDER BY sm.joined_at ASC
        `,
        [req.params.id]
      );

    const opportunitiesResult =
      await pool.query(
        `
        SELECT *
        FROM startup_opportunities
        WHERE startup_id = $1
          AND is_active = TRUE
        ORDER BY created_at DESC
        `,
        [req.params.id]
      );

    res.json({
      success: true,
      data: {
        startup,
        members: membersResult.rows,
        opportunities:
          opportunitiesResult.rows,
      },
    });
  } catch (error) {
    console.error(
      "Get startup error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load startup",
    });
  }
};

// ============================================
// CREATE STARTUP
// ============================================

const createStartup = async (req, res) => {
  try {
    const {
      name,
      description = "",
      industry = "",
      country = "",
      city = "",
      website = "",
      logoUrl = "",
      stage = "",
      foundedYear = null,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Startup name is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO startups
      (
        owner_user_id,
        name,
        description,
        industry,
        country,
        city,
        website,
        logo_url,
        stage,
        founded_year
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        req.user.id,
        name.trim(),
        description,
        industry,
        country,
        city,
        website,
        logoUrl,
        stage,
        foundedYear,
      ]
    );

    const startup =
      result.rows[0];

    // Add creator as founder.
    await pool.query(
      `
      INSERT INTO startup_members
      (
        startup_id,
        user_id,
        role
      )
      VALUES ($1,$2,$3)
      ON CONFLICT DO NOTHING
      `,
      [
        startup.id,
        req.user.id,
        "Founder",
      ]
    );

    res.status(201).json({
      success: true,
      data: startup,
    });
  } catch (error) {
    console.error(
      "Create startup error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create startup",
    });
  }
};

// ============================================
// CREATE OPPORTUNITY
// ============================================

const createOpportunity = async (
  req,
  res
) => {
  try {
    const {
      title,
      opportunityType,
      description = "",
      location = "",
      country = "",
      workType = null,
      compensation = "",
      applicationUrl = "",
      deadline = null,
    } = req.body;

    if (
      !title ||
      !title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Opportunity title is required",
      });
    }

    const startupResult =
      await pool.query(
        `
        SELECT id
        FROM startups
        WHERE id = $1
          AND owner_user_id = $2
        `,
        [
          req.params.startupId,
          req.user.id,
        ]
      );

    if (!startupResult.rows.length) {
      return res.status(403).json({
        success: false,
        message:
          "You do not control this startup",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO startup_opportunities
      (
        startup_id,
        title,
        opportunity_type,
        description,
        location,
        country,
        work_type,
        compensation,
        application_url,
        deadline
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        req.params.startupId,
        title.trim(),
        opportunityType || "project",
        description,
        location,
        country,
        workType,
        compensation,
        applicationUrl,
        deadline,
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Create startup opportunity error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to create opportunity",
    });
  }
};

// ============================================
// APPLY
// ============================================

const applyToOpportunity = async (
  req,
  res
) => {
  try {
    const opportunityResult =
      await pool.query(
        `
        SELECT
          so.*,
          s.name AS startup_name
        FROM startup_opportunities so
        JOIN startups s
          ON s.id = so.startup_id
        WHERE so.id = $1
          AND so.is_active = TRUE
        `,
        [req.params.opportunityId]
      );

    if (
      !opportunityResult.rows.length
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Opportunity not found",
      });
    }

    const opportunity =
      opportunityResult.rows[0];

    const result = await pool.query(
      `
      INSERT INTO
      startup_opportunity_applications
      (
        opportunity_id,
        applicant_id,
        message
      )
      VALUES ($1,$2,$3)
      ON CONFLICT
      (
        opportunity_id,
        applicant_id
      )
      DO NOTHING
      RETURNING *
      `,
      [
        req.params.opportunityId,
        req.user.id,
        req.body.message || "",
      ]
    );

    if (!result.rows.length) {
      return res.status(409).json({
        success: false,
        message:
          "You already applied",
      });
    }

    // Notify startup owner.
    const ownerResult =
      await pool.query(
        `
        SELECT owner_user_id
        FROM startups
        WHERE id = $1
        `,
        [opportunity.startup_id]
      );

    if (
      ownerResult.rows[0]
        ?.owner_user_id
    ) {
      await createNotification({
        userId:
          ownerResult.rows[0]
            .owner_user_id,

        type:
          "startup_application",

        title:
          "New startup opportunity application",

        message:
          `Someone applied for "${opportunity.title}" at ${opportunity.startup_name}.`,

        relatedId:
          opportunity.id,
      });
    }

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Apply to startup opportunity error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to apply",
    });
  }
};

// ============================================
// REQUEST STARTUP INTEREST
// ============================================

const requestStartupInterest =
  async (req, res) => {
    try {
      const startupResult =
        await pool.query(
          `
          SELECT *
          FROM startups
          WHERE id = $1
            AND is_active = TRUE
          `,
          [req.params.startupId]
        );

      if (
        !startupResult.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Startup not found",
        });
      }

      const result =
        await pool.query(
          `
          INSERT INTO
          startup_interest_requests
          (
            startup_id,
            user_id,
            message
          )
          VALUES ($1,$2,$3)
          ON CONFLICT
          (
            startup_id,
            user_id
          )
          DO NOTHING
          RETURNING *
          `,
          [
            req.params.startupId,
            req.user.id,
            req.body.message || "",
          ]
        );

      if (!result.rows.length) {
        return res.status(409).json({
          success: false,
          message:
            "Interest request already exists",
        });
      }

      const startup =
        startupResult.rows[0];

      if (startup.owner_user_id) {
        await createNotification({
          userId:
            startup.owner_user_id,

          type:
            "startup_interest",

          title:
            "New startup interest",

          message:
            `Someone expressed interest in ${startup.name}.`,

          relatedId:
            startup.id,
        });
      }

      res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Startup interest error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to send interest request",
      });
    }
  };

module.exports = {
  getStartups,
  getStartup,
  createStartup,
  createOpportunity,
  applyToOpportunity,
  requestStartupInterest,
};