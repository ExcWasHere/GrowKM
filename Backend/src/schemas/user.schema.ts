import { z } from 'zod';


const BUSINESS_TYPES = ['kuliner_rumahan', 'kuliner_kemasan', 'jasa_personal_care', 'fashion_craft', 'lainnya'] as const;

export const upsertBusinessProfileSchema = z.object({
    business_name:              z.string().min(2).optional(),
    business_type:              z.enum(BUSINESS_TYPES),
    kbli_code:                  z.string().optional(),
    description:                z.string().optional(),
    province:                   z.string().optional(),
    city:                       z.string().optional(),
    district:                   z.string().optional(),
    production_location:        z.string().optional(),
    employee_count:             z.number().int().min(1).optional(),
    monthly_revenue_estimate:   z.number().int().min(0).optional(),
    // Formalization flags — bisa diupdate satu per satu seiring progres UMKM
    has_nib:                    z.boolean().optional(),
    has_pirt:                   z.boolean().optional(),
    has_halal:                  z.boolean().optional(),
    has_bpom:                   z.boolean().optional(),
    has_merek:                  z.boolean().optional(),
    // Onboarding complete flag
    onboarding_completed:       z.boolean().optional(),
});

export type UpsertBusinessProfileInput = z.infer<typeof upsertBusinessProfileSchema>;
