-- Migration 008: Onboarding AI Validation Fields

ALTER TABLE public.business_profiles
    ADD COLUMN IF NOT EXISTS description_quality_score  SMALLINT CHECK (description_quality_score BETWEEN 0 AND 100),
    ADD COLUMN IF NOT EXISTS description_validated_at   TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS ai_clarification_pending   BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS ai_clarification_question  TEXT;

CREATE INDEX IF NOT EXISTS idx_bp_onboarding_incomplete
    ON public.business_profiles(user_id)
    WHERE onboarding_completed = FALSE;
