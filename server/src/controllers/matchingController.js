const pool = require("../config/database");

const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // -----------------------------------
    // 1. GET USER INFORMATION
    // -----------------------------------

    const userResult = await pool.query(
      `
      SELECT
        u.id,
        u.country,
        u.city,

        p.headline,
        p.bio

      FROM users u

      LEFT JOIN profiles p
        ON p.user_id = u.id

      WHERE u.id = $1
      `,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = userResult.rows[0];

    // -----------------------------------
    // 2. GET USER SKILLS
    // -----------------------------------

    const skillsResult = await pool.query(
      `
      SELECT
        s.id,
        LOWER(s.name) AS name

      FROM user_skills us

      JOIN skills s
        ON s.id = us.skill_id

      WHERE us.user_id = $1
      `,
      [userId]
    );

    const userSkills =
      skillsResult.rows.map(
        (skill) => skill.name
      );

    // -----------------------------------
    // 3. JOB RECOMMENDATIONS
    // -----------------------------------

    const jobsResult = await pool.query(
      `
      SELECT
        j.id,
        j.title,
        j.description,
        j.country,
        j.city,
        j.work_type,
        j.created_at,

        o.name AS organization_name,

        COUNT(DISTINCT js.skill_id)::int
          AS total_skills,

        COUNT(
          DISTINCT
          CASE
            WHEN LOWER(s.name) = ANY($1)
            THEN js.skill_id
          END
        )::int AS matching_skills

      FROM jobs j

      LEFT JOIN organizations o
        ON o.id = j.organization_id

      LEFT JOIN job_skills js
        ON js.job_id = j.id

      LEFT JOIN skills s
        ON s.id = js.skill_id

      WHERE j.is_active = true

      GROUP BY
        j.id,
        o.name

      ORDER BY
        matching_skills DESC,
        j.created_at DESC

      LIMIT 10
      `,
      [userSkills]
    );

    const jobs = jobsResult.rows.map(
      (job) => {
        const total =
          Number(job.total_skills) || 0;

        const matching =
          Number(job.matching_skills) || 0;

        let score = 40;

        if (total > 0) {
          score =
            40 +
            Math.round(
              (matching / total) * 60
            );
        }

        if (
          user.country &&
          job.country &&
          user.country.toLowerCase() ===
            job.country.toLowerCase()
        ) {
          score = Math.min(
            100,
            score + 10
          );
        }

        return {
          ...job,
          match_score: Math.min(
            100,
            score
          ),
        };
      }
    );

    // -----------------------------------
    // 4. STARTUP OPPORTUNITIES
    // -----------------------------------

    const startupResult = await pool.query(
      `
      SELECT
        so.id,
        so.title,
        so.description,
        so.opportunity_type,
        so.location,
        so.is_remote,

        s.name AS startup_name,
        s.industry,
        s.stage,
        s.country

      FROM startup_opportunities so

      JOIN startups s
        ON s.id = so.startup_id

      WHERE so.is_active = true

      ORDER BY so.created_at DESC

      LIMIT 20
      `
    );

    const startupOpportunities =
      startupResult.rows.map(
        (opportunity) => {

          const text = `
            ${opportunity.title || ""}
            ${opportunity.description || ""}
            ${opportunity.industry || ""}
          `.toLowerCase();

          const matchingSkills =
            userSkills.filter(
              (skill) =>
                text.includes(skill)
            );

          let score = 40;

          if (userSkills.length > 0) {
            score += Math.round(
              (matchingSkills.length /
                userSkills.length) *
                50
            );
          }

          if (
            user.country &&
            opportunity.country &&
            user.country.toLowerCase() ===
              opportunity.country.toLowerCase()
          ) {
            score += 10;
          }

          return {
            ...opportunity,
            match_score: Math.min(
              100,
              score
            ),
          };
        }
      );

    startupOpportunities.sort(
      (a, b) =>
        b.match_score -
        a.match_score
    );

    // -----------------------------------
    // 5. PROGRAM RECOMMENDATIONS
    // -----------------------------------

    const programsResult = await pool.query(
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

      ORDER BY
        p.created_at DESC

      LIMIT 30
      `
    );

    const programs =
      programsResult.rows.map(
        (program) => {

          const text = `
            ${program.name || ""}
            ${program.description || ""}
            ${program.degree_level || ""}
          `.toLowerCase();

          const matchingSkills =
            userSkills.filter(
              (skill) =>
                text.includes(skill)
            );

          let score = 50;

          if (
            userSkills.length > 0
          ) {
            score += Math.round(
              (matchingSkills.length /
                userSkills.length) *
                40
            );
          }

          if (
            user.country &&
            program.country &&
            user.country.toLowerCase() ===
              program.country.toLowerCase()
          ) {
            score += 10;
          }

          return {
            ...program,
            match_score: Math.min(
              100,
              score
            ),
          };
        }
      );

    programs.sort(
      (a, b) =>
        b.match_score -
        a.match_score
    );

    // -----------------------------------
    // 6. MENTOR RECOMMENDATIONS
    // -----------------------------------

    const mentorsResult = await pool.query(
      `
      SELECT
        u.id,
        u.first_name,
        u.last_name,

        p.headline,
        p.bio,
        p.profile_photo_url

      FROM users u

      LEFT JOIN profiles p
        ON p.user_id = u.id

      WHERE u.role = 'mentor'
      AND u.is_active = true

      LIMIT 30
      `
    );

    const mentors =
      mentorsResult.rows.map(
        (mentor) => {

          const text = `
            ${mentor.headline || ""}
            ${mentor.bio || ""}
          `.toLowerCase();

          const matchingSkills =
            userSkills.filter(
              (skill) =>
                text.includes(skill)
            );

          let score = 50;

          if (
            userSkills.length > 0
          ) {
            score += Math.round(
              (matchingSkills.length /
                userSkills.length) *
                50
            );
          }

          return {
            ...mentor,
            match_score: Math.min(
              100,
              score
            ),
          };
        }
      );

    mentors.sort(
      (a, b) =>
        b.match_score -
        a.match_score
    );

    // -----------------------------------
    // 7. RETURN EVERYTHING
    // -----------------------------------

    res.json({
      success: true,

      user: {
        id: user.id,
        country: user.country,
        skills: userSkills,
      },

      recommendations: {
        jobs: jobs.slice(0, 10),

        programs:
          programs.slice(0, 10),

        startups:
          startupOpportunities.slice(
            0,
            10
          ),

        mentors:
          mentors.slice(0, 10),
      },
    });

  } catch (error) {
    console.error(
      "Recommendation engine error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to generate recommendations",
    });
  }
};

module.exports = {
  getRecommendations,
};

const pool = require("../config/database");

const {
  calculateJobMatch,
} = require("../services/matchingService");

const getJobMatch = async (
  req,
  res
) => {
  try {
    const result =
      await calculateJobMatch(
        req.user.id,
        req.params.jobId
      );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "Get job match error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to calculate job match",
    });
  }
};

const getRecommendedJobs = async (
  req,
  res
) => {
  try {
    const limit = Math.min(
      Math.max(
        parseInt(req.query.limit, 10) ||
          10,
        1
      ),
      30
    );

    const jobsResult = await pool.query(
      `
      SELECT
        j.id,
        j.title,
        j.description,
        j.location,
        j.country,
        j.work_type,
        o.name AS organization_name
      FROM jobs j
      LEFT JOIN organizations o
        ON o.id = j.organization_id
      WHERE j.is_active = TRUE
      ORDER BY j.created_at DESC
      LIMIT 100
      `
    );

    const recommendations = [];

    for (const job of jobsResult.rows) {
      const match =
        await calculateJobMatch(
          req.user.id,
          job.id
        );

      recommendations.push({
        ...job,
        matchScore: match.score,
        matchedSkills:
          match.matchedSkills,
        missingSkills:
          match.missingSkills,
      });
    }

    recommendations.sort(
      (a, b) =>
        b.matchScore -
        a.matchScore
    );

    res.json({
      success: true,
      data: recommendations.slice(
        0,
        limit
      ),
    });
  } catch (error) {
    console.error(
      "Recommended jobs error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to generate recommendations",
    });
  }
};

module.exports = {
  getJobMatch,
  getRecommendedJobs,
};