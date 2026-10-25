const pool = require("../config/database");

// GET ALL JOBS
const getJobs = async (req, res) => {
  try {
    const {
      search = "",
      country = "",
      workType = "",
    } = req.query;

    const values = [];
    const conditions = ["j.is_active = TRUE"];

    if (search) {
      values.push(`%${search}%`);

      conditions.push(`
        (
          j.title ILIKE $${values.length}
          OR j.description ILIKE $${values.length}
        )
      `);
    }

    if (country) {
      values.push(country);

      conditions.push(
        `j.country = $${values.length}`
      );
    }

    if (workType) {
      values.push(workType);

      conditions.push(
        `j.work_type = $${values.length}`
      );
    }

    const query = `
      SELECT
        j.id,
        j.title,
        j.description,
        j.country,
        j.city,
        j.work_type,
        j.salary_min,
        j.salary_max,
        j.currency,
        j.created_at,

        o.id AS organization_id,
        o.name AS organization_name,
        o.logo_url AS organization_logo

      FROM jobs j

      LEFT JOIN organizations o
        ON o.id = j.organization_id

      WHERE ${conditions.join(" AND ")}

      ORDER BY j.created_at DESC
    `;

    const result = await pool.query(
      query,
      values
    );

    res.json({
      success: true,
      jobs: result.rows,
    });

  } catch (error) {
    console.error("Get jobs error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load jobs",
    });
  }
};


// GET ONE JOB
const getJob = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        j.*,
        o.name AS organization_name,
        o.description AS organization_description,
        o.logo_url AS organization_logo

      FROM jobs j

      LEFT JOIN organizations o
        ON o.id = j.organization_id

      WHERE j.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.json({
      success: true,
      job: result.rows[0],
    });

  } catch (error) {
    console.error("Get job error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load job",
    });
  }
};


// CREATE JOB
const createJob = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      title,
      description,
      country,
      city,
      workType,
      salaryMin,
      salaryMax,
      currency,
      applicationUrl,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Title and description are required",
      });
    }

    const organizationResult =
      await pool.query(
        `
        SELECT organization_id
        FROM users
        WHERE id = $1
        `,
        [userId]
      );

    if (
      organizationResult.rows.length === 0 ||
      !organizationResult.rows[0].organization_id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Create an organization before posting a job",
      });
    }

    const organizationId =
      organizationResult.rows[0].organization_id;

    const result = await pool.query(
      `
      INSERT INTO jobs
      (
        organization_id,
        title,
        description,
        country,
        city,
        work_type,
        salary_min,
        salary_max,
        currency,
        application_url,
        is_active
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,TRUE)
      RETURNING *
      `,
      [
        organizationId,
        title,
        description,
        country || null,
        city || null,
        workType || "onsite",
        salaryMin || null,
        salaryMax || null,
        currency || null,
        applicationUrl || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      job: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Create job error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create job",
    });
  }
};


// APPLY FOR JOB
const applyForJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: jobId } = req.params;

    const existing = await pool.query(
      `
      SELECT id
      FROM job_applications
      WHERE job_id = $1
      AND applicant_id = $2
      `,
      [jobId, userId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "You already applied for this job",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO job_applications
      (
        job_id,
        applicant_id,
        status
      )

      VALUES
      ($1,$2,'submitted')

      RETURNING *
      `,
      [jobId, userId]
    );

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application: result.rows[0],
    });

  } catch (error) {
    console.error("Apply error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to submit application",
    });
  }
};


// MY APPLICATIONS
const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        ja.id,
        ja.status,
        ja.applied_at,
        j.id AS job_id,
        j.title,
        o.name AS organization_name

      FROM job_applications ja

      JOIN jobs j
        ON j.id = ja.job_id

      LEFT JOIN organizations o
        ON o.id = j.organization_id

      WHERE ja.applicant_id = $1

      ORDER BY ja.applied_at DESC
      `,
      [userId]
    );

    res.json({
      success: true,
      applications: result.rows,
    });

  } catch (error) {
    console.error(
      "Applications error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load applications",
    });
  }
};


module.exports = {
  getJobs,
  getJob,
  createJob,
  applyForJob,
  getMyApplications,
};