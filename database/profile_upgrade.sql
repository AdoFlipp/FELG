-- ============================================
-- FELG PROFESSIONAL PROFILE UPGRADE
-- ============================================

-- --------------------------------------------
-- EXPERIENCE
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    project_url VARCHAR(500),

    repository_url VARCHAR(500),

    technologies TEXT,

    image_url TEXT,

    start_date DATE,

    end_date DATE,

    is_featured BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS
idx_portfolio_projects_user
ON portfolio_projects(user_id);

CREATE INDEX IF NOT EXISTS
idx_portfolio_projects_featured
ON portfolio_projects(user_id, is_featured);


-- --------------------------------------------
-- CV
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS user_cvs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    file_url VARCHAR(1000),

    file_name VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id)
);


-- --------------------------------------------
-- EDUCATION EXTRA FIELDS
-- --------------------------------------------

ALTER TABLE education
ADD COLUMN IF NOT EXISTS institution_name
VARCHAR(255);

ALTER TABLE education
ADD COLUMN IF NOT EXISTS field_of_study
VARCHAR(255);

ALTER TABLE education
ADD COLUMN IF NOT EXISTS start_date DATE;

ALTER TABLE education
ADD COLUMN IF NOT EXISTS end_date DATE;

ALTER TABLE education
ADD COLUMN IF NOT EXISTS description TEXT;


-- --------------------------------------------
-- EXPERIENCE EXTRA FIELDS
-- --------------------------------------------

ALTER TABLE experience
ADD COLUMN IF NOT EXISTS company_name
VARCHAR(255);

ALTER TABLE experience
ADD COLUMN IF NOT EXISTS job_title
VARCHAR(255);

ALTER TABLE experience
ADD COLUMN IF NOT EXISTS location
VARCHAR(255);

ALTER TABLE experience
ADD COLUMN IF NOT EXISTS start_date DATE;

ALTER TABLE experience
ADD COLUMN IF NOT EXISTS end_date DATE;

ALTER TABLE experience
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE experience
ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT FALSE;


-- --------------------------------------------
-- PROFILE INDEX
-- --------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS
idx_profiles_user_unique
ON profiles(user_id);