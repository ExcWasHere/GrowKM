import { z } from '@hono/zod-openapi';


const BUSINESS_TYPES = ['kuliner', 'fashion_craft', 'jasa_personal_care', 'lainnya'] as const;

export const upsertBusinessProfileSchema = z.object({
    business_name:              z.string().min(2).optional().openapi({ example: 'Warung Bu Rina' }),
    business_type:              z.enum(BUSINESS_TYPES).openapi({ example: 'kuliner' }),
    kbli_code:                  z.string().optional().openapi({ description: 'Kosongkan jika belum tahu KBLI (AI akan memberikan rekomendasi otomatis)' }),
    description:                z.string().optional().openapi({ example: 'Jualan nasi kotak katering' }),
    province:                   z.string().optional().openapi({ example: 'Jawa Timur' }),
    city:                       z.string().optional().openapi({ example: 'Malang' }),
    district:                   z.string().optional().openapi({ example: 'Lowokwaru' }),
    production_location:        z.string().optional().openapi({ example: 'Dapur rumah' }),
    employee_count:             z.number().int().min(1).optional().openapi({ example: 2 }),
    monthly_revenue_estimate:   z.number().int().min(0).optional().openapi({ example: 10000000 }),
    // Formalization flags — can be updated one by one as UMKM progresses
    has_nib:                    z.boolean().optional().openapi({ example: false }),
    has_pirt:                   z.boolean().optional().openapi({ example: false }),
    has_halal:                  z.boolean().optional().openapi({ example: false }),
    has_bpom:                   z.boolean().optional().openapi({ example: false }),
    has_merek:                  z.boolean().optional().openapi({ example: false }),
    // Onboarding complete flag
    onboarding_completed:       z.boolean().optional().openapi({ example: false }),
}).openapi('UpsertBusinessProfile');

export type UpsertBusinessProfileInput = z.infer<typeof upsertBusinessProfileSchema>;
