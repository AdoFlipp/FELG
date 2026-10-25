const {
  createNotification,
} = require("../services/notificationService");

const pool = require("../config/database");


// GET MY JOBS
const getMyJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        j.*,
        COUNT(ja.id)::INTEGER AS applicant_count

      FROM jobs j

      JOIN users u
        ON u.organization_id = j.organization_id

      LEFT JOIN job_applications ja
        ON ja.job_id = j.id

      WHERE u.id = $1

      GROUP BY j.id

      ORDER BY j.created_at DESC
      `,
      [userId]
    );

    res.json({
      success: true,
      jobs: result.rows,
    });
  } catch (error) {
    console.error(
      "Employer jobs error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load employer jobs",
    });
  }
};


// GET APPLICANTS
const getApplicants = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const result = await pool.query(
      `
      SELECT
        ja.id AS application_id,
        ja.status,
        ja.applied_at,

        u.id AS applicant_id,
        u.first_name,
        u.last_name,
        u.email,
        u.country,
        u.city,

        p.headline,
        p.bio

      FROM job_applications ja

      JOIN jobs j
        ON j.id = ja.job_id

      JOIN users u
        ON u.id = ja.applicant_id

      LEFT JOIN profiles p
        ON p.user_id = u.id

      JOIN users employer
        ON employer.organization_id = j.organization_id

      WHERE j.id = $1
      AND employer.id = $2

      ORDER BY ja.applied_at DESC
      `,
      [jobId, userId]
    );

    res.json({
      success: true,
      applicants: result.rows,
    });
  } catch (error) {
    console.error(
      "Get applicants error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load applicants",
    });
  }
};


// UPDATE APPLICATION STATUS
const updateApplicationStatus = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;
    const { applicationId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "submitted",
      "under_review",
      "shortlisted",
      "interview",
      "accepted",
      "rejected",
      "withdrawn",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const result = await pool.query(
      `
      UPDATE job_applications ja

      SET status = $1

      FROM jobs j
      JOIN users employer
        ON employer.organization_id = j.organization_id

      WHERE ja.id = $2
      AND ja.job_id = j.id
      AND employer.id = $3

      RETURNING ja.*
      `,
      [
        status,
        applicationId,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Application not found or not owned by your organization",
      });
    }

    res.json({
      success: true,
      message:
        "Application status updated",
      application: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Update application error:",
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
  getMyJobs,
  getApplicants,
  updateApplicationStatus,
};

await createNotification({
  userId: application.applicant_id,
  type: "job_application",
  title: "Job application updated",
  message: `Your application status has been changed to ${status}.`,
  relatedId: applicationId,
});