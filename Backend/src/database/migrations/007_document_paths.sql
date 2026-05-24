ALTER TABLE public.business_profiles
    ADD COLUMN IF NOT EXISTS nib_image_path   TEXT,
    ADD COLUMN IF NOT EXISTS pirt_image_path  TEXT,
    ADD COLUMN IF NOT EXISTS halal_image_path TEXT,
    ADD COLUMN IF NOT EXISTS bpom_image_path  TEXT,
    ADD COLUMN IF NOT EXISTS merek_image_path TEXT;
