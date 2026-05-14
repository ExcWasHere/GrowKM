-- Migration 006: Market Gate — Opportunity Matching Engine
-- Creates tables for storing curated business opportunities and user-specific match results.

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE opportunity_category_enum AS ENUM (
    'pembiayaan',
    'vendor_supply_chain',
    'marketplace',
    'program_pemerintah',
    'event_pameran'
);

CREATE TYPE match_status_enum AS ENUM (
    'eligible',
    'almost',
    'locked'
);

-- ============================================================
-- TABLE: opportunities
-- Admin-curated list of real business opportunities available to UMKM.
-- Seed data is inserted via the seed-opportunities.ts script.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.opportunities (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Basic info
    title                   VARCHAR(200) NOT NULL,
    category                opportunity_category_enum NOT NULL,
    provider                VARCHAR(200) NOT NULL,
    description             TEXT,

    -- Value proposition
    estimated_value         VARCHAR(150),               -- e.g. "Hingga Rp 100.000.000"
    value_description       TEXT,                       -- detail: tenor, bunga, cara apply, dll

    -- Targeting
    region                  VARCHAR(100) NOT NULL DEFAULT 'nasional',  -- 'nasional' | 'jawa_timur' | 'malang' dll
    business_types          business_type_enum[] NOT NULL DEFAULT '{}',
    min_annual_revenue      BIGINT NOT NULL DEFAULT 0,
    max_annual_revenue      BIGINT NOT NULL DEFAULT 999999999999,

    -- Requirements — KUNCI MATCHING ENGINE
    required_steps          step_type_enum[] NOT NULL DEFAULT '{}',    -- WAJIB dipenuhi
    nice_to_have_steps      step_type_enum[] NOT NULL DEFAULT '{}',    -- Opsional, mempengaruhi score
    additional_requirements TEXT[] NOT NULL DEFAULT '{}',              -- Syarat non-step (teks informatif)

    -- Metadata
    deadline                DATE,                       -- NULL = ongoing / tidak ada deadline
    source_url              TEXT,
    last_verified           DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active               BOOLEAN NOT NULL DEFAULT true,

    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes untuk query yang sering
CREATE INDEX IF NOT EXISTS idx_opportunities_active
    ON public.opportunities(is_active)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_opportunities_category
    ON public.opportunities(category);

CREATE INDEX IF NOT EXISTS idx_opportunities_region
    ON public.opportunities(region);

-- ============================================================
-- TABLE: user_opportunity_matches
-- Stores the result of the deterministic matching engine per user.
-- Auto-generated/updated when a step is completed or onboarding is done.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_opportunity_matches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    opportunity_id  UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,

    -- Match result (computed by matching engine, not AI)
    match_status    match_status_enum NOT NULL,
    missing_steps   step_type_enum[] NOT NULL DEFAULT '{}',  -- Steps yang masih kurang
    match_score     FLOAT NOT NULL DEFAULT 0,                -- 0.0 – 1.0 untuk sorting

    -- User interaction tracking
    seen_at         TIMESTAMPTZ,
    clicked_at      TIMESTAMPTZ,

    -- Timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Satu user hanya boleh punya satu match record per opportunity
    UNIQUE(user_id, opportunity_id)
);

-- Indexes untuk query yang sering
CREATE INDEX IF NOT EXISTS idx_uom_user_status
    ON public.user_opportunity_matches(user_id, match_status);

CREATE INDEX IF NOT EXISTS idx_uom_user_score
    ON public.user_opportunity_matches(user_id, match_score DESC);

CREATE INDEX IF NOT EXISTS idx_uom_updated
    ON public.user_opportunity_matches(user_id, updated_at DESC);

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- opportunities: siapa pun bisa baca opportunity yang aktif (public data)
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active opportunities"
    ON public.opportunities
    FOR SELECT
    USING (is_active = true);

-- Backend service role bisa manage semua opportunities (untuk seed script)
CREATE POLICY "Service role can manage opportunities"
    ON public.opportunities
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- user_opportunity_matches: user hanya bisa lihat match milik sendiri
ALTER TABLE public.user_opportunity_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches"
    ON public.user_opportunity_matches
    FOR SELECT
    USING (auth.uid() = user_id);

-- Backend service role bisa manage semua matches (untuk matching engine)
CREATE POLICY "Service role can manage matches"
    ON public.user_opportunity_matches
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER opportunities_updated_at
    BEFORE UPDATE ON public.opportunities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER user_opportunity_matches_updated_at
    BEFORE UPDATE ON public.user_opportunity_matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
