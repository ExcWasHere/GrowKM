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

// KBLI Recommendation Response Schema
export const kbliRecommendationResponseSchema = z.object({
    kbli_code: z.string().openapi({ example: '10791' }),
    kbli_title: z.string().openapi({ example: 'Industri Makanan Lainnya' }),
    confidence: z.number().openapi({ example: 0.92 }),
    explanation: z.string().openapi({ example: 'Berdasarkan deskripsi usaha katering nasi kotak, KBLI 10791 paling sesuai.' })
}).openapi('KBLIRecommendationResponse');

export type KBLIRecommendationResponse = z.infer<typeof kbliRecommendationResponseSchema>;

// KBLI Validation Response Schema
export const kbliValidationResponseSchema = z.object({
    is_valid: z.boolean().openapi({ example: true }),
    mismatch_alert: z.boolean().openapi({ example: false }),
    explanation: z.string().openapi({ example: 'KBLI 10791 sudah sesuai dengan deskripsi usaha Anda.' }),
    suggested_kbli: z.string().optional().openapi({ example: '10791', description: 'Muncul jika mismatch_alert = true' })
}).openapi('KBLIValidationResponse');

export type KBLIValidationResponse = z.infer<typeof kbliValidationResponseSchema>;

// KBLI Confirm Input Schema
export const confirmKbliSchema = z.object({
    kbli_code: z.string().min(5).openapi({ example: '10791' })
}).openapi('ConfirmKBLI');

export type ConfirmKBLIInput = z.infer<typeof confirmKbliSchema>;
