-- ============================================
-- FELG STARTUP PLATFORM
-- ============================================

-- --------------------------------------------
-- EXTEND EXISTING STARTUPS TABLE
-- --------------------------------------------

ALTER TABLE startups
ADD COLUMN IF NOT EXISTS owner_user_id UUID
REFERENCES users(id)
ON DELETE SET NULL;

ALTER TABLE startups
ADD COLUMN IF NOT EXISTS name VARCHAR(255);

ALTER TABLE startups
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE startups
ADD COLUMN IF NOT EXISTS industry VARCHAR(150);

ALTER TABLE startups
ADD COLUMN IF NOT EXISTS country VARCHAR(150);

ALTER TABLE startups
ADD COLUMN IF NOT EXISTS city VARCHAR(150);

ALTER TABLE startups
ADD COLUMN IF NOT EXISTS website VARCHAR(500);

ALTER TABLE startups
ADD COLUMN IF NOT EXISTS logo_url TEXT;

ALTER TABLE startups
ADD COLUMN IF NOT EXISTS stage VARCHAR(100);

ALTER TABLE startups
ADD COLUMN IF NOT EXISTS founded_year INTEGER;

ALTER TABLE startups
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE startups
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE startups
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP
DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE startups
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP
DEFAULT CURRENT_TIMESTAMP;

-- --------------------------------------------
-- EXTEND STARTUP MEMBERS
-- --------------------------------------------

ALTER TABLE startup_members
ADD COLUMN IF NOT EXISTS user_id UUID
REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE startup_members
ADD COLUMN IF NOT EXISTS role VARCHAR(100);

ALTER TABLE startup_members
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP
DEFAULT CURRENT_TIMESTAMP;

-- --------------------------------------------
-- STARTUP OPPORTUNITIES
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS startup_opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    startup_id UUID NOT NULL
        REFERENCES startups(id)
        ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,

    opportunity_type VARCHAR(50) NOT NULL,

    description TEXT,

    location VARCHAR(255),

    country VARCHAR(150),

    work_type work_type,

    compensation VARCHAR(255),

    application_url VARCHAR(500),

    deadline DATE,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS
idx_startup_opportunities_startup
ON startup_opportunities(startup_id);

CREATE INDEX IF NOT EXISTS
idx_startup_opportunities_country
ON startup_opportunities(country);

CREATE INDEX IF NOT EXISTS
idx_startup_opportunities_type
ON startup_opportunities(opportunity_type);

CREATE INDEX IF NOT EXISTS
idx_startup_opportunities_active
ON startup_opportunities(is_active);

CREATE INDEX IF NOT EXISTS
idx_startup_opportunities_deadline
ON startup_opportunities(deadline);

-- --------------------------------------------
-- OPPORTUNITY APPLICATIONS
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS
startup_opportunity_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    opportunity_id UUID NOT NULL
        REFERENCES startup_opportunities(id)
        ON DELETE CASCADE,

    applicant_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    status application_status DEFAULT 'submitted',

    message TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(opportunity_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS
idx_startup_opportunity_apps_applicant
ON startup_opportunity_applications(applicant_id);

CREATE INDEX IF NOT EXISTS
idx_startup_opportunity_apps_opportunity
ON startup_opportunity_applications(opportunity_id);

-- --------------------------------------------
-- STARTUP OPPORTUNITY SKILLS
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS
startup_opportunity_skills (
    opportunity_id UUID
        REFERENCES startup_opportunities(id)
        ON DELETE CASCADE,

    skill_id UUID
        REFERENCES skills(id)
        ON DELETE CASCADE,

    PRIMARY KEY(opportunity_id, skill_id)
);

-- --------------------------------------------
-- STARTUP CONNECTION / INTEREST REQUESTS
-- --------------------------------------------

CREATE TABLE IF NOT EXISTS startup_interest_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    startup_id UUID NOT NULL
        REFERENCES startups(id)
        ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    message TEXT,

    status VARCHAR(50)
        DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(startup_id, user_id)
);

CREATE INDEX IF NOT EXISTS
idx_startup_interest_user
ON startup_interest_requests(user_id);

CREATE INDEX IF NOT EXISTS
idx_startup_interest_startup
ON startup_interest_requests(startup_id);