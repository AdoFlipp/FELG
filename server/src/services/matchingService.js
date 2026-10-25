const pool = require("../config/database");

const calculateJobMatch = async (
  userId,
  jobId
) => {
  // ----------------------------------------
  // Get user's skills
  // ----------------------------------------

  const userSkillsResult = await pool.query(
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

  // ----------------------------------------
  // Get job skills
  // ----------------------------------------

  const jobSkillsResult = await pool.query(
    `
    SELECT
      s.id,
      LOWER(s.name) AS name
    FROM job_skills js
    JOIN skills s
      ON s.id = js.skill_id
    WHERE js.job_id = $1
    `,
    [jobId]
  );

  const userSkills =
    userSkillsResult.rows;

  const jobSkills =
    jobSkillsResult.rows;

  // ----------------------------------------
  // No required skills
  // ----------------------------------------

  if (jobSkills.length === 0) {
    return {
      score: 50,
      matchedSkills: [],
      missingSkills: [],
      totalJobSkills: 0,
    };
  }

  const userSkillNames =
    new Set(
      userSkills.map(
        (skill) => skill.name
      )
    );

  const matchedSkills = [];
  const missingSkills = [];

  for (const skill of jobSkills) {
    if (userSkillNames.has(skill.name)) {
      matchedSkills.push(skill.name);
    } else {
      missingSkills.push(skill.name);
    }
  }

  const skillScore =
    (matchedSkills.length /
      jobSkills.length) *
    60;

  // ----------------------------------------
  // Get user and job information
  // ----------------------------------------

  const profileResult = await pool.query(
    `
    SELECT
      u.country,
      p.bio,
      p.headline
    FROM users u
    LEFT JOIN profiles p
      ON p.user_id = u.id
    WHERE u.id = $1
    `,
    [userId]
  );

  const jobResult = await pool.query(
    `
    SELECT
      country,
      work_type
    FROM jobs
    WHERE id = $1
    `,
    [jobId]
  );

  const user =
    profileResult.rows[0];

  const job =
    jobResult.rows[0];

  if (!job) {
    throw new Error("Job not found");
  }

  // ----------------------------------------
  // Location score
  // ----------------------------------------

  let locationScore = 0;

  if (
    user?.country &&
    job.country &&
    user.country.toLowerCase() ===
      job.country.toLowerCase()
  ) {
    locationScore = 15;
  } else if (
    job.work_type === "remote"
  ) {
    locationScore = 15;
  }

  // ----------------------------------------
  // Profile completeness
  // ----------------------------------------

  let profileScore = 0;

  if (user?.headline) {
    profileScore += 5;
  }

  if (user?.bio) {
    profileScore += 5;
  }

  // ----------------------------------------
  // Experience placeholder
  // ----------------------------------------

  const experienceScore = 5;

  // ----------------------------------------
  // Final score
  // ----------------------------------------

  let score =
    skillScore +
    locationScore +
    profileScore +
    experienceScore;

  score = Math.round(
    Math.min(score, 100)
  );

  return {
    score,
    matchedSkills,
    missingSkills,
    totalJobSkills:
      jobSkills.length,
  };
};

module.exports = {
  calculateJobMatch,
};