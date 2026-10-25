const pool = require("../config/database");

const calculateProfileCompletion =
  async (userId) => {
    const userResult =
      await pool.query(
        `
        SELECT
          email,
          country
        FROM users
        WHERE id = $1
        `,
        [userId]
      );

    const profileResult =
      await pool.query(
        `
        SELECT *
        FROM profiles
        WHERE user_id = $1
        `,
        [userId]
      );

    const skillsResult =
      await pool.query(
        `
        SELECT COUNT(*)::int AS count
        FROM user_skills
        WHERE user_id = $1
        `,
        [userId]
      );

    const educationResult =
      await pool.query(
        `
        SELECT COUNT(*)::int AS count
        FROM education
        WHERE user_id = $1
        `,
        [userId]
      );

    const experienceResult =
      await pool.query(
        `
        SELECT COUNT(*)::int AS count
        FROM experience
        WHERE user_id = $1
        `,
        [userId]
      );

    const projectsResult =
      await pool.query(
        `
        SELECT COUNT(*)::int AS count
        FROM portfolio_projects
        WHERE user_id = $1
        `,
        [userId]
      );

    const cvResult =
      await pool.query(
        `
        SELECT COUNT(*)::int AS count
        FROM user_cvs
        WHERE user_id = $1
        `,
        [userId]
      );

    const user =
      userResult.rows[0];

    const profile =
      profileResult.rows[0];

    const checks = [
      {
        key: "account",
        label: "Account",
        complete: Boolean(user),
        weight: 5,
      },

      {
        key: "country",
        label: "Country",
        complete: Boolean(
          user?.country
        ),
        weight: 5,
      },

      {
        key: "headline",
        label: "Professional headline",
        complete: Boolean(
          profile?.headline
        ),
        weight: 10,
      },

      {
        key: "bio",
        label: "Bio",
        complete: Boolean(
          profile?.bio
        ),
        weight: 10,
      },

      {
        key: "photo",
        label: "Profile photo",
        complete: Boolean(
          profile?.profile_photo_url
        ),
        weight: 10,
      },

      {
        key: "skills",
        label: "Skills",
        complete:
          skillsResult.rows[0].count >= 3,
        weight: 15,
      },

      {
        key: "education",
        label: "Education",
        complete:
          educationResult.rows[0].count > 0,
        weight: 15,
      },

      {
        key: "experience",
        label: "Experience",
        complete:
          experienceResult.rows[0].count > 0,
        weight: 10,
      },

      {
        key: "projects",
        label: "Portfolio",
        complete:
          projectsResult.rows[0].count > 0,
        weight: 10,
      },

      {
        key: "cv",
        label: "CV",
        complete:
          cvResult.rows[0].count > 0,
        weight: 10,
      },
    ];

    const score = checks.reduce(
      (total, item) =>
        total +
        (item.complete
          ? item.weight
          : 0),
      0
    );

    return {
      score,
      checks,
    };
  };

module.exports = {
  calculateProfileCompletion,
};