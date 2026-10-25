-- ==========================================
-- FELG DATABASE
-- Future Employment & Launch Gateway
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- ENUM TYPES
-- ==========================================

CREATE TYPE user_role AS ENUM (
    'student',
    'graduate',
    'employer',
    'university',
    'college',
    'startup',
    'mentor',
    'admin'
);

CREATE TYPE application_status AS ENUM (
    'draft',
    'submitted',
    'under_review',
    'shortlisted',
    'interview',
    'accepted',
    'rejected',
    'withdrawn'
);

CREATE TYPE work_type AS ENUM (
    'onsite',
    'remote',
    'hybrid'
);

CREATE TYPE organization_type AS ENUM (
    'university',
    'college',
    'company',
    'startup'
);

-- ==========================================
-- USERS
-- ==========================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    role user_role NOT NULL,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    phone VARCHAR(50),

    country VARCHAR(100),
    city VARCHAR(100),

    profile_image_url TEXT,

    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- PROFESSIONAL PROFILES
-- ==========================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE
        REFERENCES users(id) ON DELETE CASCADE,

    headline VARCHAR(255),

    bio TEXT,

    date_of_birth DATE,

    nationality VARCHAR(100),

    phone VARCHAR(50),

    website TEXT,

    linkedin_url TEXT,

    github_url TEXT,

    portfolio_url TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SKILLS
-- ==========================================

CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL UNIQUE,

    category VARCHAR(100),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_skills (
    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    skill_id UUID NOT NULL
        REFERENCES skills(id) ON DELETE CASCADE,

    proficiency VARCHAR(50),

    years_experience NUMERIC(4,1),

    PRIMARY KEY (user_id, skill_id)
);

-- ==========================================
-- EDUCATION
-- ==========================================

CREATE TABLE education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    institution_name VARCHAR(255) NOT NULL,

    degree VARCHAR(255),

    field_of_study VARCHAR(255),

    start_date DATE,

    end_date DATE,

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- WORK EXPERIENCE
-- ==========================================

CREATE TABLE experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    organization_name VARCHAR(255) NOT NULL,

    job_title VARCHAR(255) NOT NULL,

    location VARCHAR(255),

    start_date DATE,

    end_date DATE,

    is_current BOOLEAN NOT NULL DEFAULT FALSE,

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- COMPANIES / STARTUPS / INSTITUTIONS
-- ==========================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    owner_id UUID
        REFERENCES users(id) ON DELETE SET NULL,

    name VARCHAR(255) NOT NULL,

    type organization_type NOT NULL,

    description TEXT,

    website_url TEXT,

    logo_url TEXT,

    country VARCHAR(100),

    city VARCHAR(100),

    founded_year INTEGER,

    verified BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- UNIVERSITY / COLLEGE PROGRAMS
-- ==========================================

CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL
        REFERENCES organizations(id) ON DELETE CASCADE,

    name VARCHAR(255) NOT NULL,

    degree_level VARCHAR(100),

    field_of_study VARCHAR(255),

    description TEXT,

    duration_years NUMERIC(3,1),

    tuition_amount NUMERIC(12,2),

    currency VARCHAR(10),

    application_deadline DATE,

    application_url TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- SCHOLARSHIPS
-- ==========================================

CREATE TABLE scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID
        REFERENCES organizations(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    amount NUMERIC(12,2),

    currency VARCHAR(10),

    deadline DATE,

    eligibility TEXT,

    application_url TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- JOBS
-- ==========================================

CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL
        REFERENCES organizations(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,

    description TEXT NOT NULL,

    employment_type VARCHAR(100),

    work_type work_type,

    country VARCHAR(100),

    city VARCHAR(100),

    salary_min NUMERIC(12,2),

    salary_max NUMERIC(12,2),

    currency VARCHAR(10),

    experience_level VARCHAR(100),

    application_deadline DATE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- JOB SKILLS
-- ==========================================

CREATE TABLE job_skills (
    job_id UUID NOT NULL
        REFERENCES jobs(id) ON DELETE CASCADE,

    skill_id UUID NOT NULL
        REFERENCES skills(id) ON DELETE CASCADE,

    is_required BOOLEAN NOT NULL DEFAULT TRUE,

    PRIMARY KEY (job_id, skill_id)
);

-- ==========================================
-- JOB APPLICATIONS
-- ==========================================

CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    job_id UUID NOT NULL
        REFERENCES jobs(id) ON DELETE CASCADE,

    applicant_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    cover_letter TEXT,

    cv_url TEXT,

    status application_status NOT NULL DEFAULT 'submitted',

    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(job_id, applicant_id)
);

-- ==========================================
-- EDUCATION APPLICATIONS
-- ==========================================

CREATE TABLE education_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    program_id UUID NOT NULL
        REFERENCES programs(id) ON DELETE CASCADE,

    applicant_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    personal_statement TEXT,

    document_url TEXT,

    status application_status NOT NULL DEFAULT 'submitted',

    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(program_id, applicant_id)
);

-- ==========================================
-- STARTUP INFORMATION
-- ==========================================

CREATE TABLE startups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    organization_id UUID NOT NULL UNIQUE
        REFERENCES organizations(id) ON DELETE CASCADE,

    industry VARCHAR(150),

    funding_stage VARCHAR(100),

    funding_amount NUMERIC(15,2),

    currency VARCHAR(10),

    mission TEXT,

    product_description TEXT,

    team_size INTEGER,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- STARTUP MEMBERS
-- ==========================================

CREATE TABLE startup_members (
    startup_id UUID NOT NULL
        REFERENCES startups(id) ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    position VARCHAR(150),

    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (startup_id, user_id)
);

-- ==========================================
-- SAVED JOBS
-- ==========================================

CREATE TABLE saved_jobs (
    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    job_id UUID NOT NULL
        REFERENCES jobs(id) ON DELETE CASCADE,

    saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, job_id)
);

-- ==========================================
-- CONNECTIONS
-- ==========================================

CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    requester_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    receiver_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    status VARCHAR(30) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(requester_id, receiver_id),

    CHECK(requester_id <> receiver_id)
);

-- ==========================================
-- POSTS
-- ==========================================

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    author_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    content TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- COMMENTS
-- ==========================================

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    post_id UUID NOT NULL
        REFERENCES posts(id) ON DELETE CASCADE,

    author_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    content TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- NOTIFICATIONS
-- ==========================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,

    message TEXT NOT NULL,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- INDEXES
-- ==========================================

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_users_country
ON users(country);

CREATE INDEX idx_jobs_title
ON jobs(title);

CREATE INDEX idx_jobs_country
ON jobs(country);

CREATE INDEX idx_jobs_active
ON jobs(is_active);

CREATE INDEX idx_programs_name
ON programs(name);

CREATE INDEX idx_programs_deadline
ON programs(application_deadline);

CREATE INDEX idx_job_applications_applicant
ON job_applications(applicant_id);

CREATE INDEX idx_education_applications_applicant
ON education_applications(applicant_id);

CREATE INDEX idx_notifications_user
ON notifications(user_id);

-- ==========================================
-- END FELG SCHEMA
-- ==========================================