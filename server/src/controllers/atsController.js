const pool = require("../config/database");
const { createNotification } =
  require("../services/notificationService");

// ============================================
// GET EMPLOYER APPLICATIONS
// ============================================

const getEmployerApplications = async (
  req,
  res
) => {
  try {
    const {
      status = "",
      jobId = "",
    } = req.query;

    const values = [req.user.id];

    const conditions = [
      `
      j.organization_id = (
        SELECT organization_id
        FROM users
        WHERE id = $1
      )
      `,
    ];

    let index = 2;

    if (status.trim()) {
      values.push(status.trim());

      conditions.push(
        `ja.status = $${index}`
      );

      index++;
    }

    if (jobId.trim()) {
      values.push(jobId.trim());

      conditions.push(
        `ja.job_id = $${index}`
      );

      index++;
    }

    const result = await pool.query(
      `
      SELECT
        ja.id AS application_id,
        ja.status AS application_status,
        ja.created_at AS applied_at,

        j.id AS job_id,
        j.title AS job_title,

        u.id AS applicant_id,
        u.email AS applicant_email,
        u.country AS applicant_country,

        p.headline,
        p.bio,
        p.profile_photo_url,

        organization.name AS organization_name

      FROM job_applications ja

      JOIN jobs j
        ON j.id = ja.job_id

      JOIN users u
        ON u.id = ja.applicant_id

      LEFT JOIN profiles p
        ON p.user_id = u.id

      JOIN organizations organization
        ON organization.id = j.organization_id

      WHERE ${conditions.join(" AND ")}

      ORDER BY ja.created_at DESC
      `,
      values
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error(
      "Get employer applications error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load applications",
    });
  }
};


// ============================================
// GET COMPLETE APPLICANT
// ============================================

const getApplicantDetails = async (
  req,
  res
) => {
  try {
    const applicationResult =
      await pool.query(
        `
        SELECT
          ja.id AS application_id,
          ja.status,
          ja.created_at AS applied_at,

          j.id AS job_id,
          j.title AS job_title,

          u.id AS applicant_id,
          u.email,
          u.country,

          p.*

        FROM job_applications ja

        JOIN jobs j
          ON j.id = ja.job_id

        JOIN users u
          ON u.id = ja.applicant_id

        LEFT JOIN profiles p
          ON p.user_id = u.id

        WHERE
          ja.id = $1
          AND j.organization_id = (
            SELECT organization_id
            FROM users
            WHERE id = $2
          )
        `,
        [
          req.params.applicationId,
          req.user.id,
        ]
      );

    if (
      !applicationResult.rows.length
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Application not found",
      });
    }

    const application =
      applicationResult.rows[0];

    const applicantId =
      application.applicant_id;

    // Skills
    const skillsResult =
      await pool.query(
        `
        SELECT
          s.id,
          s.name
        FROM user_skills us
        JOIN skills s
          ON s.id = us.skill_id
        WHERE us.user_id = $1
        ORDER BY s.name
        `,
        [applicantId]
      );

    // Education
    const educationResult =
      await pool.query(
        `
        SELECT *
        FROM education
        WHERE user_id = $1
        ORDER BY
          COALESCE(
            end_date,
            CURRENT_DATE
          ) DESC
        `,
        [applicantId]
      );

    // Experience
    const experienceResult =
      await pool.query(
        `
        SELECT *
        FROM experience
        WHERE user_id = $1
        ORDER BY
          is_current DESC,
          COALESCE(
            end_date,
            CURRENT_DATE
          ) DESC
        `,
        [applicantId]
      );

    // Portfolio
    const projectsResult =
      await pool.query(
        `
        SELECT
          id,
          title,
          description,
          project_url,
          repository_url,
          technologies,
          image_url,
          is_featured
        FROM portfolio_projects
        WHERE user_id = $1
        ORDER BY
          is_featured DESC,
          created_at DESC
        `,
        [applicantId]
      );

    // CV
    const cvResult =
      await pool.query(
        `
        SELECT
          id,
          file_name,
          file_url,
          created_at,
          updated_at
        FROM user_cvs
        WHERE user_id = $1
        `,
        [applicantId]
      );

    res.json({
      success: true,

      data: {
        application,

        skills:
          skillsResult.rows,

        education:
          educationResult.rows,

        experience:
          experienceResult.rows,

        projects:
          projectsResult.rows,

        cv:
          cvResult.rows[0] || null,
      },
    });
  } catch (error) {
    console.error(
      "Get applicant details error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load applicant",
    });
  }
};


// ============================================
// UPDATE JOB APPLICATION STATUS
// ============================================

const updateJobApplicationStatus =
  async (req, res) => {
    try {
      const {
        status,
      } = req.body;

      const validStatuses = [
        "submitted",
        "under_review",
        "shortlisted",
        "interview",
        "accepted",
        "rejected",
        "withdrawn",
      ];

      if (
        !validStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid application status",
        });
      }

      const result = await pool.query(
        `
        UPDATE job_applications ja

        SET
          status = $1

        FROM jobs j

        WHERE
          ja.id = $2
          AND ja.job_id = j.id
          AND j.organization_id = (
            SELECT organization_id
            FROM users
            WHERE id = $3
          )

        RETURNING
          ja.*,
          j.title AS job_title
        `,
        [
          status,
          req.params.applicationId,
          req.user.id,
        ]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Application not found or not controlled by your organization",
        });
      }

      const application =
        result.rows[0];

      await createNotification({
        userId:
          application.applicant_id,

        type:
          "job_application_status",

        title:
          "Job application updated",

        message:
          `Your application for "${application.job_title}" is now ${status.replaceAll(
            "_",
            " "
          )}.`,

        relatedId:
          application.job_id,
      });

      res.json({
        success: true,
        data: application,
      });
    } catch (error) {
      console.error(
        "Update job application status error:",
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
  getEmployerApplications,
  getApplicantDetails,
  updateJobApplicationStatus,
};

const getAtsStatistics = async (
  req,
  res
) => {
  try {
    const result = await pool.query(
      `
      SELECT
        COUNT(*)::int AS total,

        COUNT(*) FILTER (
          WHERE ja.status = 'submitted'
        )::int AS submitted,

        COUNT(*) FILTER (
          WHERE ja.status = 'under_review'
        )::int AS under_review,

        COUNT(*) FILTER (
          WHERE ja.status = 'shortlisted'
        )::int AS shortlisted,

        COUNT(*) FILTER (
          WHERE ja.status = 'interview'
        )::int AS interview,

        COUNT(*) FILTER (
          WHERE ja.status = 'accepted'
        )::int AS accepted,

        COUNT(*) FILTER (
          WHERE ja.status = 'rejected'
        )::int AS rejected

      FROM job_applications ja

      JOIN jobs j
        ON j.id = ja.job_id

      WHERE j.organization_id = (
        SELECT organization_id
        FROM users
        WHERE id = $1
      )
      `,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "ATS statistics error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load ATS statistics",
    });
  }
};

module.exports = {
  getEmployerApplications,
  getApplicantDetails,
  updateJobApplicationStatus,
  getAtsStatistics,
};