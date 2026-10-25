const fs = require("fs");
const path = require("path");

const pool = require("../config/database");

const downloadApplicantCv = async (
  req,
  res
) => {
  try {
    const result = await pool.query(
      `
      SELECT
        c.file_url,
        c.file_name

      FROM user_cvs c

      WHERE c.user_id = $1

        AND EXISTS (
          SELECT 1
          FROM job_applications ja
          JOIN jobs j
            ON j.id = ja.job_id
          WHERE ja.applicant_id = c.user_id
            AND ja.id = $2
            AND j.organization_id = (
              SELECT organization_id
              FROM users
              WHERE id = $3
            )
        )
      `,
      [
        req.params.userId,
        req.params.applicationId,
        req.user.id,
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message:
          "CV not found or access is not permitted",
      });
    }

    const cv = result.rows[0];

    const filename =
      path.basename(
        cv.file_url
      );

    const filePath = path.join(
      __dirname,
      "../../uploads/cv",
      filename
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message:
          "CV file is missing",
      });
    }

    res.download(
      filePath,
      cv.file_name
    );
  } catch (error) {
    console.error(
      "Secure applicant CV error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to access CV",
    });
  }
};

module.exports = {
  downloadApplicantCv,
};