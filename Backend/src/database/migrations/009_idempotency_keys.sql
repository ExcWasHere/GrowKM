-- Create idempotency_keys table
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
    idempotency_key UUID PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
    response_body JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_idempotency_key ON public.idempotency_keys(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_idempotency_profile ON public.idempotency_keys(profile_id);

-- Enable RLS
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. Users can insert their own idempotency keys
CREATE POLICY "Users can create their own idempotency keys"
ON public.idempotency_keys FOR INSERT
WITH CHECK (
    profile_id IN (
        SELECT id FROM public.business_profiles WHERE user_id = auth.uid()
    )
);

-- 2. Users can view their own idempotency keys
CREATE POLICY "Users can view their own idempotency keys"
ON public.idempotency_keys FOR SELECT
USING (
    profile_id IN (
        SELECT id FROM public.business_profiles WHERE user_id = auth.uid()
    )
);

-- 3. Users can update their own idempotency keys
CREATE POLICY "Users can update their own idempotency keys"
ON public.idempotency_keys FOR UPDATE
USING (
    profile_id IN (
        SELECT id FROM public.business_profiles WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    profile_id IN (
        SELECT id FROM public.business_profiles WHERE user_id = auth.uid()
    )
);
