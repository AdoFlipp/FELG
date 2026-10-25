const pool = require("../config/database");

const institutionRoles = [
  "university",
  "college",
];


// CREATE PROGRAM
const createProgram = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      description,
      degreeLevel,
      duration,
      applicationDeadline,
    } = req.body;

    if (!name || !degreeLevel) {
      return res.status(400).json({
        success: false,
        message:
          "Program name and degree level are required",
      });
    }

    const userResult = await pool.query(
      `
      SELECT organization_id
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    const organizationId =
      userResult.rows[0]?.organization_id;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message:
          "Create an institution profile first",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO programs
      (
        organization_id,
        name,
        description,
        degree_level,
        duration,
        application_deadline
      )
      VALUES
      ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        organizationId,
        name,
        description || null,
        degreeLevel,
        duration || null,
        applicationDeadline || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Program published",
      program: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Create program error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create program",
    });
  }
};


// CREATE SCHOLARSHIP
const createScholarship =
  async (req, res) => {
    try {
      const userId = req.user.id;

      const {
        name,
        description,
        amount,
        currency,
        eligibility,
        deadline,
        applicationUrl,
      } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message:
            "Scholarship name is required",
        });
      }

      const userResult =
        await pool.query(
          `
          SELECT organization_id
          FROM users
          WHERE id = $1
          `,
          [userId]
        );

      const organizationId =
        userResult.rows[0]?.organization_id;

      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message:
            "Create an institution profile first",
        });
      }

      const result =
        await pool.query(
          `
          INSERT INTO scholarships
          (
            organization_id,
            name,
            description,
            amount,
            currency,
            eligibility,
            deadline,
            application_url
          )
          VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8)
          RETURNING *
          `,
          [
            organizationId,
            name,
            description || null,
            amount || null,
            currency || null,
            eligibility || null,
            deadline || null,
            applicationUrl || null,
          ]
        );

      res.status(201).json({
        success: true,
        message:
          "Scholarship published",
        scholarship:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "Create scholarship error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to create scholarship",
      });
    }
  };


// GET APPLICATIONS
const getInstitutionApplications =
  async (req, res) => {
    try {
      const userId = req.user.id;

      const result = await pool.query(
        `
        SELECT
          ea.id,
          ea.status,
          ea.applied_at,

          p.name AS program_name,

          u.id AS applicant_id,
          u.first_name,
          u.last_name,
          u.email,

          pr.headline

        FROM education_applications ea

        JOIN programs p
          ON p.id = ea.program_id

        JOIN users u
          ON u.id = ea.applicant_id

        LEFT JOIN profiles pr
          ON pr.user_id = u.id

        JOIN users owner
          ON owner.organization_id =
             p.organization_id

        WHERE owner.id = $1

        ORDER BY ea.applied_at DESC
        `,
        [userId]
      );

      res.json({
        success: true,
        applications:
          result.rows,
      });
    } catch (error) {
      console.error(
        "Institution applications error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load applications",
      });
    }
  };


// UPDATE APPLICATION STATUS
const updateApplicationStatus =
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { applicationId } =
        req.params;

      const {
        status,
      } = req.body;

      const allowedStatuses = [
        "submitted",
        "under_review",
        "accepted",
        "rejected",
        "withdrawn",
      ];

      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid application status",
        });
      }

      const result = await pool.query(
        `
        UPDATE education_applications ea

        SET
          status = $1,
          updated_at = CURRENT_TIMESTAMP

        WHERE ea.id = $2

        AND EXISTS (
          SELECT 1
          FROM programs p
          JOIN users u
            ON u.organization_id =
               p.organization_id
          WHERE p.id = ea.program_id
          AND u.id = $3
        )

        RETURNING ea.*;
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
            "Application not found",
        });
      }

const application = result.rows[0];

await createNotification({
  userId: application.applicant_id,
  type: "education_application",
  title: "Education application updated",
  message: `Your education application status is now ${status}.`,
  relatedId: applicationId,
});


      res.json({
        success: true,
        message:
          "Application status updated",
        application:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "Update education application error:",
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
  createProgram,
  createScholarship,
  getInstitutionApplications,
  updateApplicationStatus,
};

const {
  createNotification,
} = require("../services/notificationService");