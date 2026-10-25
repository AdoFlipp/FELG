-- ============================================
-- FELG PROFESSIONAL SEARCH UPGRADE
-- ============================================

-- --------------------------------------------
-- JOB SEARCH COLUMNS
-- --------------------------------------------

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- --------------------------------------------
-- PROGRAM SEARCH COLUMNS
-- --------------------------------------------

ALTER TABLE programs
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- --------------------------------------------
-- ORGANIZATION SEARCH COLUMNS
-- --------------------------------------------

ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- --------------------------------------------
-- UPDATE JOB SEARCH VECTOR
-- --------------------------------------------

UPDATE jobs
SET search_vector =
    setweight(to_tsvector('simple', COALESCE(title, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(location, '')), 'C');

-- --------------------------------------------
-- UPDATE PROGRAM SEARCH VECTOR
-- --------------------------------------------

UPDATE programs
SET search_vector =
    setweight(to_tsvector('simple', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(description, '')), 'B') ||
    setweight(to_tsvector('simple', COALESCE(degree_level, '')), 'C');

-- --------------------------------------------
-- UPDATE ORGANIZATION SEARCH VECTOR
-- --------------------------------------------

UPDATE organizations
SET search_vector =
    setweight(to_tsvector('simple', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(description, '')), 'B');

-- --------------------------------------------
-- GIN INDEXES
-- --------------------------------------------

CREATE INDEX IF NOT EXISTS idx_jobs_search_vector
ON jobs USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_programs_search_vector
ON programs USING GIN(search_vector);

CREATE INDEX IF NOT EXISTS idx_organizations_search_vector
ON organizations USING GIN(search_vector);

-- --------------------------------------------
-- FILTER INDEXES
-- --------------------------------------------

CREATE INDEX IF NOT EXISTS idx_jobs_country
ON jobs(country);

CREATE INDEX IF NOT EXISTS idx_jobs_work_type
ON jobs(work_type);

CREATE INDEX IF NOT EXISTS idx_jobs_created_at
ON jobs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_jobs_active
ON jobs(is_active);

CREATE INDEX IF NOT EXISTS idx_programs_country
ON programs(country);

CREATE INDEX IF NOT EXISTS idx_programs_deadline
ON programs(application_deadline);

-- ============================================
-- SAVED SEARCHES
-- ============================================

CREATE TABLE IF NOT EXISTS saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,

    query TEXT,

    search_type VARCHAR(50) DEFAULT 'all',

    country VARCHAR(150),

    work_type VARCHAR(50),

    degree_level VARCHAR(100),

    sort_by VARCHAR(50) DEFAULT 'relevance',

    alerts_enabled BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user
ON saved_searches(user_id);

-- ============================================
-- SEARCH ALERTS
-- ============================================

CREATE TABLE IF NOT EXISTS search_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    saved_search_id UUID
        REFERENCES saved_searches(id)
        ON DELETE CASCADE,

    last_checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_search_alerts_user
ON search_alerts(user_id);

-- ============================================
-- AUTOMATIC SEARCH VECTOR UPDATES
-- ============================================

CREATE OR REPLACE FUNCTION update_job_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector =
        setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('simple', COALESCE(NEW.location, '')), 'C');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS jobs_search_vector_trigger
ON jobs;

CREATE TRIGGER jobs_search_vector_trigger
BEFORE INSERT OR UPDATE
ON jobs
FOR EACH ROW
EXECUTE FUNCTION update_job_search_vector();