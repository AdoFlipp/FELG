const pool = require("../config/database");

// GET PROFILE
const getMyProfessionalProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await pool.query(
      `SELECT
        id,
        email,
        role,
        first_name,
        last_name,
        country,
        city,
        is_verified
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profileResult = await pool.query(
      `SELECT *
       FROM profiles
       WHERE user_id = $1`,
      [userId]
    );

    const skillsResult = await pool.query(
      `SELECT
        s.id,
        s.name,
        us.level
       FROM user_skills us
       JOIN skills s ON s.id = us.skill_id
       WHERE us.user_id = $1
       ORDER BY s.name`,
      [userId]
    );

    const educationResult = await pool.query(
      `SELECT *
       FROM education
       WHERE user_id = $1
       ORDER BY start_date DESC NULLS LAST`,
      [userId]
    );

    const experienceResult = await pool.query(
      `SELECT *
       FROM experience
       WHERE user_id = $1
       ORDER BY start_date DESC NULLS LAST`,
      [userId]
    );

    res.json({
      success: true,
      profile: profileResult.rows[0] || null,
      user: userResult.rows[0],
      skills: skillsResult.rows,
      education: educationResult.rows,
      experience: experienceResult.rows,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load profile",
    });
  }
};


// UPDATE PROFILE
const updateProfessionalProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      headline,
      bio,
      phone,
      website,
      linkedinUrl,
      githubUrl,
      dateOfBirth,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO profiles
       (
         user_id,
         headline,
         bio,
         phone,
         website,
         linkedin_url,
         github_url,
         date_of_birth
       )
       VALUES
       ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (user_id)
       DO UPDATE SET
         headline = EXCLUDED.headline,
         bio = EXCLUDED.bio,
         phone = EXCLUDED.phone,
         website = EXCLUDED.website,
         linkedin_url = EXCLUDED.linkedin_url,
         github_url = EXCLUDED.github_url,
         date_of_birth = EXCLUDED.date_of_birth,
         updated_at = NOW()
       RETURNING *`,
      [
        userId,
        headline || null,
        bio || null,
        phone || null,
        website || null,
        linkedinUrl || null,
        githubUrl || null,
        dateOfBirth || null,
      ]
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

const getPublicProfile = async (
  req,
  res
) => {
  try {
    const userResult =
      await pool.query(
        `
        SELECT
          u.id,
          u.country,
          p.headline,
          p.bio,
          p.website,
          p.linkedin_url,
          p.github_url,
          p.profile_photo_url
        FROM users u
        LEFT JOIN profiles p
          ON p.user_id = u.id
        WHERE u.id = $1
          AND u.is_active = TRUE
        `,
        [req.params.userId]
      );

    if (!userResult.rows.length) {
      return res.status(404).json({
        success: false,
        message:
          "Profile not found",
      });
    }

    const skills =
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
        [req.params.userId]
      );

    const projects =
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
        [req.params.userId]
      );

    res.json({
      success: true,
      data: {
        profile:
          userResult.rows[0],
        skills: skills.rows,
        projects: projects.rows,
      },
    });
  } catch (error) {
    console.error(
      "Get public profile error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load public profile",
    });
  }
};

module.exports = {
  getMyProfessionalProfile,
  updateProfessionalProfile,
  getPublicProfile,
};