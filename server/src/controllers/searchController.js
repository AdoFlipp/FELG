const pool = require("../config/database");

const searchJobs = async (req, res) => {
  try {
    const {
      q = "",
      country = "",
      workType = "",
      skill = "",
      sort = "relevance",
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      50
    );

    const offset = (pageNumber - 1) * limitNumber;

    const values = [];
    const conditions = [
      "j.is_active = TRUE",
    ];

    let parameterIndex = 1;

    // ----------------------------------------
    // TEXT SEARCH
    // ----------------------------------------

    if (q.trim()) {
      values.push(q.trim());

      conditions.push(`
        j.search_vector @@
        plainto_tsquery('simple', $${parameterIndex})
      `);

      parameterIndex++;
    }

    // ----------------------------------------
    // COUNTRY
    // ----------------------------------------

    if (country.trim()) {
      values.push(country.trim());

      conditions.push(`
        LOWER(j.country) = LOWER($${parameterIndex})
      `);

      parameterIndex++;
    }

    // ----------------------------------------
    // WORK TYPE
    // ----------------------------------------

    if (workType.trim()) {
      values.push(workType.trim());

      conditions.push(`
        j.work_type = $${parameterIndex}
      `);

      parameterIndex++;
    }

    // ----------------------------------------
    // SKILL FILTER
    // ----------------------------------------

    if (skill.trim()) {
      values.push(`%${skill.trim()}%`);

      conditions.push(`
        EXISTS (
          SELECT 1
          FROM job_skills js
          JOIN skills s
            ON s.id = js.skill_id
          WHERE js.job_id = j.id
          AND s.name ILIKE $${parameterIndex}
        )
      `);

      parameterIndex++;
    }

    // ----------------------------------------
    // SORTING
    // ----------------------------------------

    let orderBy = "j.created_at DESC";

    if (sort === "newest") {
      orderBy = "j.created_at DESC";
    }

    if (sort === "oldest") {
      orderBy = "j.created_at ASC";
    }

    if (sort === "relevance" && q.trim()) {
      orderBy = `
        ts_rank(
          j.search_vector,
          plainto_tsquery('simple', $1)
        ) DESC,
        j.created_at DESC
      `;
    }

    const whereClause = conditions.join(" AND ");

    // ----------------------------------------
    // RESULTS
    // ----------------------------------------

    const dataValues = [...values, limitNumber, offset];

    const result = await pool.query(
      `
      SELECT
        j.id,
        j.title,
        j.description,
        j.location,
        j.country,
        j.work_type,
        j.created_at,

        o.id AS organization_id,
        o.name AS organization_name,

        COUNT(*) OVER() AS total_count

      FROM jobs j

      LEFT JOIN organizations o
        ON o.id = j.organization_id

      WHERE ${whereClause}

      ORDER BY ${orderBy}

      LIMIT $${parameterIndex}
      OFFSET $${parameterIndex + 1}
      `,
      dataValues
    );

    const total = result.rows.length
      ? parseInt(result.rows[0].total_count, 10)
      : 0;

    const totalPages = Math.ceil(total / limitNumber);

    const jobs = result.rows.map((job) => {
      const { total_count, ...cleanJob } = job;

      return cleanJob;
    });

    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("Professional job search error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to search jobs",
    });
  }
};

module.exports = {
  searchJobs,
};

const pool = require("../config/database");

const globalSearch = async (req, res) => {
  try {
    const {
      q = "",
      country = "",
      type = "all",
    } = req.query;

    const search = q.trim();

    if (!search && !country) {
      return res.json({
        success: true,
        results: {
          people: [],
          jobs: [],
          programs: [],
          organizations: [],
          startups: [],
          mentors: [],
          opportunities: [],
        },
      });
    }

    const pattern = `%${search}%`;

    const results = {
      people: [],
      jobs: [],
      programs: [],
      organizations: [],
      startups: [],
      mentors: [],
      opportunities: [],
    };


    // ==========================================
    // PEOPLE
    // ==========================================

    if (type === "all" || type === "people") {
      const values = [pattern];

      let countryCondition = "";

      if (country) {
        values.push(country);
        countryCondition =
          `AND u.country = $${values.length}`;
      }

      const result = await pool.query(
        `
        SELECT
          u.id,
          u.first_name,
          u.last_name,
          u.role,
          u.country,
          u.city,

          p.headline,
          p.bio,
          p.profile_photo_url

        FROM users u

        LEFT JOIN profiles p
          ON p.user_id = u.id

        WHERE u.is_active = true

        AND (
          u.first_name ILIKE $1
          OR u.last_name ILIKE $1
          OR p.headline ILIKE $1
          OR p.bio ILIKE $1
        )

        ${countryCondition}

        ORDER BY u.created_at DESC

        LIMIT 20
        `,
        values
      );

      results.people = result.rows;
    }


    // ==========================================
    // JOBS
    // ==========================================

    if (type === "all" || type === "jobs") {
      const values = [pattern];

      let countryCondition = "";

      if (country) {
        values.push(country);

        countryCondition =
          `AND j.country = $${values.length}`;
      }

      const result = await pool.query(
        `
        SELECT
          j.id,
          j.title,
          j.description,
          j.country,
          j.city,
          j.work_type,

          o.name AS organization_name

        FROM jobs j

        LEFT JOIN organizations o
          ON o.id = j.organization_id

        WHERE j.is_active = true

        AND (
          j.title ILIKE $1
          OR j.description ILIKE $1
          OR o.name ILIKE $1
        )

        ${countryCondition}

        ORDER BY j.created_at DESC

        LIMIT 20
        `,
        values
      );

      results.jobs = result.rows;
    }


    // ==========================================
    // PROGRAMS
    // ==========================================

    if (type === "all" || type === "programs") {
      const values = [pattern];

      let countryCondition = "";

      if (country) {
        values.push(country);

        countryCondition =
          `AND o.country = $${values.length}`;
      }

      const result = await pool.query(
        `
        SELECT
          p.id,
          p.name,
          p.description,
          p.degree_level,
          p.duration,
          p.application_deadline,

          o.name AS organization_name,
          o.country

        FROM programs p

        JOIN organizations o
          ON o.id = p.organization_id

        WHERE
          (
            p.name ILIKE $1
            OR p.description ILIKE $1
            OR p.degree_level ILIKE $1
            OR o.name ILIKE $1
          )

        ${countryCondition}

        ORDER BY p.created_at DESC

        LIMIT 20
        `,
        values
      );

      results.programs = result.rows;
    }


    // ==========================================
    // ORGANIZATIONS
    // ==========================================

    if (
      type === "all" ||
      type === "organizations"
    ) {
      const values = [pattern];

      let countryCondition = "";

      if (country) {
        values.push(country);

        countryCondition =
          `AND o.country = $${values.length}`;
      }

      const result = await pool.query(
        `
        SELECT
          o.id,
          o.name,
          o.type,
          o.description,
          o.country,
          o.city,
          o.website,
          o.is_verified

        FROM organizations o

        WHERE o.is_active = true

        AND (
          o.name ILIKE $1
          OR o.description ILIKE $1
        )

        ${countryCondition}

        ORDER BY o.created_at DESC

        LIMIT 20
        `,
        values
      );

      results.organizations =
        result.rows;
    }


    // ==========================================
    // STARTUPS
    // ==========================================

    if (
      type === "all" ||
      type === "startups"
    ) {
      const values = [pattern];

      let countryCondition = "";

      if (country) {
        values.push(country);

        countryCondition =
          `AND s.country = $${values.length}`;
      }

      const result = await pool.query(
        `
        SELECT
          s.id,
          s.name,
          s.description,
          s.industry,
          s.stage,
          s.country,
          s.city,
          s.website,
          s.logo_url

        FROM startups s

        WHERE (
          s.name ILIKE $1
          OR s.description ILIKE $1
          OR s.industry ILIKE $1
        )

        ${countryCondition}

        ORDER BY s.created_at DESC

        LIMIT 20
        `,
        values
      );

      results.startups = result.rows;
    }


    // ==========================================
    // MENTORS
    // ==========================================

    if (
      type === "all" ||
      type === "mentors"
    ) {
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
          p.profile_photo_url

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

        ORDER BY u.created_at DESC

        LIMIT 20
        `,
        [pattern]
      );

      results.mentors =
        result.rows;
    }


    // ==========================================
    // STARTUP OPPORTUNITIES
    // ==========================================

    if (
      type === "all" ||
      type === "opportunities"
    ) {
      const result = await pool.query(
        `
        SELECT
          so.id,
          so.startup_id,
          so.title,
          so.description,
          so.opportunity_type,
          so.location,
          so.is_remote,
          so.skills,

          s.name AS startup_name,
          s.country

        FROM startup_opportunities so

        JOIN startups s
          ON s.id = so.startup_id

        WHERE so.is_active = true

        AND (
          so.title ILIKE $1
          OR so.description ILIKE $1
          OR so.skills ILIKE $1
          OR s.name ILIKE $1
        )

        ORDER BY so.created_at DESC

        LIMIT 20
        `,
        [pattern]
      );

      results.opportunities =
        result.rows;
    }


    res.json({
      success: true,
      query: search,
      results,
    });

  } catch (error) {
    console.error(
      "Global search error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Global search failed",
    });
  }
};

module.exports = {
  globalSearch,
};