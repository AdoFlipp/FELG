-- ============================================
-- FELG MATCHING ENGINE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_skills_user
ON user_skills(user_id);

CREATE INDEX IF NOT EXISTS idx_user_skills_skill
ON user_skills(skill_id);

CREATE INDEX IF NOT EXISTS idx_job_skills_job
ON job_skills(job_id);

CREATE INDEX IF NOT EXISTS idx_job_skills_skill
ON job_skills(skill_id);

CREATE INDEX IF NOT EXISTS idx_skills_name
ON skills(name);