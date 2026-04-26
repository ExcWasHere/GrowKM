-- Migration 001: Initial Schema
CREATE EXTENSION IF NOT EXISTS vector;

-- ENUMS
CREATE TYPE business_type_enum AS ENUM (
    'kuliner_rumahan',
    'kuliner_kemasan',
    'jasa_personal_care',
    'fashion_craft',
    'lainnya'
);

CREATE TYPE level_enum AS ENUM (
    'starter',
    'growing',
    'established',
    'pro',
    'enterprise'
);

CREATE TYPE step_status_enum AS ENUM (
    'locked',
    'unlocked',
    'in_progress',
    'completed'
);

CREATE TYPE step_type_enum AS ENUM (
    'nib',
    'spp_irt',
    'halal',
    'bpom',
    'merek'
);

CREATE TYPE financial_type_enum AS ENUM (
    'income',
    'expense'
);

CREATE TYPE session_type_enum AS ENUM (
    'onboarding',
    'copilot',
    'financial_parser'
);

-- TABLES
CREATE TABLE IF NOT EXISTS public.users (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL CHECK (char_length(name) >= 2),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.business_profiles (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    business_name               TEXT,
    business_type               business_type_enum NOT NULL,
    kbli_code                   TEXT,
    description                 TEXT,
    province                    TEXT,
    city                        TEXT,
    district                    TEXT,
    production_location         TEXT,
    employee_count              INT NOT NULL DEFAULT 1 CHECK (employee_count >= 1),
    monthly_revenue_estimate    BIGINT CHECK (monthly_revenue_estimate >= 0),
    has_nib                     BOOLEAN NOT NULL DEFAULT FALSE,
    has_pirt                    BOOLEAN NOT NULL DEFAULT FALSE,
    has_halal                   BOOLEAN NOT NULL DEFAULT FALSE,
    has_bpom                    BOOLEAN NOT NULL DEFAULT FALSE,
    has_merek                   BOOLEAN NOT NULL DEFAULT FALSE,
    level                       level_enum NOT NULL DEFAULT 'starter',
    score                       INT NOT NULL DEFAULT 0 CHECK (score >= 0),
    streak_days                 INT NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
    onboarding_completed        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.formalization_steps (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id      UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    step_type       step_type_enum NOT NULL,
    step_order      INT NOT NULL CHECK (step_order >= 1),
    is_required     BOOLEAN NOT NULL DEFAULT TRUE,
    status          step_status_enum NOT NULL DEFAULT 'locked',
    current_substep INT NOT NULL DEFAULT 0 CHECK (current_substep >= 0),
    total_substeps  INT CHECK (total_substeps >= 0),
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (profile_id, step_type)
);

CREATE TABLE IF NOT EXISTS public.financial_records (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id      UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    record_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    type            financial_type_enum NOT NULL,
    category        TEXT,
    product_name    TEXT,
    amount          BIGINT NOT NULL CHECK (amount > 0),
    quantity        INT CHECK (quantity > 0),
    unit_price      BIGINT CHECK (unit_price > 0),
    raw_input       TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    session_type        session_type_enum NOT NULL,
    context_step_type   step_type_enum,
    messages            JSONB NOT NULL DEFAULT '[]',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.domain_knowledge (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain      TEXT NOT NULL,
    category    TEXT NOT NULL,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL CHECK (char_length(content) > 0),
    metadata    JSONB NOT NULL DEFAULT '{}',
    embedding   VECTOR(1536),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TRIGGERS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_business_profiles
    BEFORE UPDATE ON public.business_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_chat_sessions
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_knowledge_embedding
    ON public.domain_knowledge USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS idx_knowledge_domain
    ON public.domain_knowledge(domain);

CREATE INDEX IF NOT EXISTS idx_finance_profile
    ON public.financial_records(profile_id, record_date);

CREATE INDEX IF NOT EXISTS idx_finance_product
    ON public.financial_records(profile_id, product_name);

CREATE INDEX IF NOT EXISTS idx_steps_profile
    ON public.formalization_steps(profile_id, step_order);

-- FUNCTIONS
CREATE OR REPLACE FUNCTION match_knowledge(
    query_embedding  VECTOR(1536),
    match_domain     TEXT DEFAULT NULL,
    match_count      INT DEFAULT 5,
    match_threshold  FLOAT DEFAULT 0.5
) RETURNS TABLE (
    id          UUID,
    domain      TEXT,
    category    TEXT,
    title       TEXT,
    content     TEXT,
    similarity  FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT
        dk.id,
        dk.domain,
        dk.category,
        dk.title,
        dk.content,
        1 - (dk.embedding <=> query_embedding) AS similarity
    FROM public.domain_knowledge dk
    WHERE (match_domain IS NULL OR dk.domain = match_domain)
      AND 1 - (dk.embedding <=> query_embedding) > match_threshold
    ORDER BY dk.embedding <=> query_embedding
    LIMIT match_count;
END; $$;
