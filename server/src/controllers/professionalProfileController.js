const path = require("path");

const pool = require("../config/database");

const {
  deleteFile,
} = require("../services/cvStorageService");

const {
  calculateProfileCompletion,
} = require("../services/profileCompletionService");

const getProfileCompletion = async (
  req,
  res
) => {
  try {
    const data =
      await calculateProfileCompletion(
        req.user.id
      );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "Profile completion error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to calculate profile completion",
    });
  }
};

module.exports = {
  getMyProfessionalProfile,
  updateProfessionalProfile,
  addPortfolioProject,
  deletePortfolioProject,
  addExperience,
  deleteExperience,
  getPublicProfile,
  uploadMyCv,
  deleteMyCv,
  getProfileCompletion,
};

// ============================================
// UPLOAD CV
// ============================================

const uploadMyCv = async (
  req,
  res
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a CV file.",
      });
    }

    const existingResult =
      await pool.query(
        `
        SELECT *
        FROM user_cvs
        WHERE user_id = $1
        `,
        [req.user.id]
      );

    const existingCv =
      existingResult.rows[0];

    const fileUrl =
      `/uploads/cv/${req.file.filename}`;

    const result = await pool.query(
      `
      INSERT INTO user_cvs
      (
        user_id,
        file_url,
        file_name
      )
      VALUES ($1,$2,$3)

      ON CONFLICT (user_id)
      DO UPDATE SET
        file_url = EXCLUDED.file_url,
        file_name = EXCLUDED.file_name,
        updated_at = CURRENT_TIMESTAMP

      RETURNING *
      `,
      [
        req.user.id,
        fileUrl,
        req.file.originalname,
      ]
    );

    if (existingCv?.file_url) {
      const oldFilename =
        path.basename(
          existingCv.file_url
        );

      const oldPath =
        path.join(
          __dirname,
          "../../uploads/cv",
          oldFilename
        );

      deleteFile(oldPath);
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Upload CV error:",
      error
    );

    if (req.file?.path) {
      deleteFile(req.file.path);
    }

    res.status(500).json({
      success: false,
      message:
        "Failed to upload CV",
    });
  }
};

module.exports = {
  getMyProfessionalProfile,
  updateProfessionalProfile,
  addPortfolioProject,
  deletePortfolioProject,
  addExperience,
  deleteExperience,
  getPublicProfile,
  uploadMyCv,
  deleteMyCv,
};

// ============================================
// DELETE CV
// ============================================

const deleteMyCv = async (
  req,
  res
) => {
  try {
    const result = await pool.query(
      `
      DELETE FROM user_cvs
      WHERE user_id = $1
      RETURNING *
      `,
      [req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message:
          "No CV found",
      });
    }

    const cv = result.rows[0];

    if (cv.file_url) {
      const filename =
        path.basename(
          cv.file_url
        );

      const filePath =
        path.join(
          __dirname,
          "../../uploads/cv",
          filename
        );

      deleteFile(filePath);
    }

    res.json({
      success: true,
      message:
        "CV deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete CV error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete CV",
    });
  }
};

// ============================================
// GET COMPLETE MY PROFILE
// ============================================

const getMyProfessionalProfile = async (
  req,
  res
) => {
  try {
    const userResult = await pool.query(
      `
      SELECT
        id,
        email,
        role,
        country,
        organization_id,
        is_verified,
        is_active,
        created_at
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    const profileResult = await pool.query(
      `
      SELECT *
      FROM profiles
      WHERE user_id = $1
      `,
      [req.user.id]
    );

    const skillsResult = await pool.query(
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
      [req.user.id]
    );

    const educationResult = await pool.query(
      `
      SELECT *
      FROM education
      WHERE user_id = $1
      ORDER BY
        COALESCE(end_date, CURRENT_DATE)
        DESC
      `,
      [req.user.id]
    );

    const experienceResult = await pool.query(
      `
      SELECT *
      FROM experience
      WHERE user_id = $1
      ORDER BY
        is_current DESC,
        COALESCE(end_date, CURRENT_DATE)
        DESC
      `,
      [req.user.id]
    );

    const projectsResult = await pool.query(
      `
      SELECT *
      FROM portfolio_projects
      WHERE user_id = $1
      ORDER BY
        is_featured DESC,
        created_at DESC
      `,
      [req.user.id]
    );

    const cvResult = await pool.query(
      `
      SELECT *
      FROM user_cvs
      WHERE user_id = $1
      `,
      [req.user.id]
    );

    res.json({
      success: true,

      data: {
        user: userResult.rows[0] || null,
        profile:
          profileResult.rows[0] || null,
        skills: skillsResult.rows,
        education: educationResult.rows,
        experience: experienceResult.rows,
        projects: projectsResult.rows,
        cv: cvResult.rows[0] || null,
      },
    });
  } catch (error) {
    console.error(
      "Get professional profile error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load professional profile",
    });
  }
};


// ============================================
// UPDATE PROFILE
// ============================================

const updateProfessionalProfile = async (
  req,
  res
) => {
  try {
    const {
      headline,
      bio,
      phone,
      website,
      linkedinUrl,
      githubUrl,
      dateOfBirth,
      profilePhotoUrl,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO profiles
      (
        user_id,
        headline,
        bio,
        phone,
        website,
        linkedin_url,
        github_url,
        date_of_birth,
        profile_photo_url
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,$8,$9
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        headline = EXCLUDED.headline,
        bio = EXCLUDED.bio,
        phone = EXCLUDED.phone,
        website = EXCLUDED.website,
        linkedin_url = EXCLUDED.linkedin_url,
        github_url = EXCLUDED.github_url,
        date_of_birth = EXCLUDED.date_of_birth,
        profile_photo_url =
          EXCLUDED.profile_photo_url,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
      `,
      [
        req.user.id,
        headline || null,
        bio || null,
        phone || null,
        website || null,
        linkedinUrl || null,
        githubUrl || null,
        dateOfBirth || null,
        profilePhotoUrl || null,
      ]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Update professional profile error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to update profile",
    });
  }
};


// ============================================
// ADD PORTFOLIO PROJECT
// ============================================

const addPortfolioProject = async (
  req,
  res
) => {
  try {
    const {
      title,
      description,
      projectUrl,
      repositoryUrl,
      technologies,
      imageUrl,
      startDate,
      endDate,
      isFeatured,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Project title is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO portfolio_projects
      (
        user_id,
        title,
        description,
        project_url,
        repository_url,
        technologies,
        image_url,
        start_date,
        end_date,
        is_featured
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        req.user.id,
        title.trim(),
        description || null,
        projectUrl || null,
        repositoryUrl || null,
        technologies || null,
        imageUrl || null,
        startDate || null,
        endDate || null,
        Boolean(isFeatured),
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Add portfolio project error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to add project",
    });
  }
};


// ============================================
// DELETE PORTFOLIO PROJECT
// ============================================

const deletePortfolioProject =
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        DELETE FROM portfolio_projects
        WHERE id = $1
          AND user_id = $2
        RETURNING id
        `,
        [
          req.params.projectId,
          req.user.id,
        ]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found",
        });
      }

      res.json({
        success: true,
        message:
          "Project deleted",
      });
    } catch (error) {
      console.error(
        "Delete portfolio project error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete project",
      });
    }
  };


// ============================================
// ADD EXPERIENCE
// ============================================

const addExperience = async (
  req,
  res
) => {
  try {
    const {
      companyName,
      jobTitle,
      location,
      startDate,
      endDate,
      description,
      isCurrent,
    } = req.body;

    if (
      !companyName ||
      !companyName.trim() ||
      !jobTitle ||
      !jobTitle.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Company and job title are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO experience
      (
        user_id,
        company_name,
        job_title,
        location,
        start_date,
        end_date,
        description,
        is_current
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [
        req.user.id,
        companyName.trim(),
        jobTitle.trim(),
        location || null,
        startDate || null,
        endDate || null,
        description || null,
        Boolean(isCurrent),
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Add experience error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to add experience",
    });
  }
};


// ============================================
// DELETE EXPERIENCE
// ============================================

const deleteExperience = async (
  req,
  res
) => {
  try {
    const result = await pool.query(
      `
      DELETE FROM experience
      WHERE id = $1
        AND user_id = $2
      RETURNING id
      `,
      [
        req.params.experienceId,
        req.user.id,
      ]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message:
          "Experience not found",
      });
    }

    res.json({
      success: true,
      message:
        "Experience deleted",
    });
  } catch (error) {
    console.error(
      "Delete experience error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to delete experience",
    });
  }
};

module.exports = {
  getMyProfessionalProfile,
  updateProfessionalProfile,
  addPortfolioProject,
  deletePortfolioProject,
  addExperience,
  deleteExperience,
};

const fs = require("fs");
const path = require("path");

const downloadMyCv = async (
  req,
  res
) => {
  try {
    const result = await pool.query(
      `
      SELECT
        file_url,
        file_name
      FROM user_cvs
      WHERE user_id = $1
      `,
      [req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message:
          "CV not found",
      });
    }

    const cv = result.rows[0];

    const filename = path.basename(
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
      "Download CV error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to download CV",
    });
  }
};

module.exports = {
  getMyProfessionalProfile,
  updateProfessionalProfile,
  addPortfolioProject,
  deletePortfolioProject,
  addExperience,
  deleteExperience,
  getPublicProfile,
  uploadMyCv,
  deleteMyCv,
  getProfileCompletion,
  downloadMyCv,
};