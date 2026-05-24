import { z } from '@hono/zod-openapi';

const MATCH_STATUSES = ['eligible', 'almost', 'locked'] as const;
const OPPORTUNITY_CATEGORIES = [
    'pembiayaan',
    'vendor_supply_chain',
    'marketplace',
    'program_pemerintah',
    'event_pameran',
] as const;

const STEP_TYPES = ['nib', 'spp_irt', 'halal', 'bpom', 'merek', 'sertifikat_standar'] as const;

// Query params for GET /api/opportunities
export const listOpportunitiesQuerySchema = z.object({
    status: z.enum(MATCH_STATUSES).optional().openapi({
        description: 'Filter by match status',
        example: 'eligible',
    }),
    category: z.enum(OPPORTUNITY_CATEGORIES).optional().openapi({
        description: 'Filter by opportunity category',
        example: 'pembiayaan',
    }),
}).openapi('ListOpportunitiesQuery');

// Body for POST /api/opportunities/match
export const triggerMatchSchema = z.object({
    profile_id: z.string().uuid().optional().openapi({
        description: 'Profile ID to re-match. Defaults to the authenticated user\'s profile.',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
}).openapi('TriggerMatchInput');

// Query params for GET /api/opportunities/unlocked
export const unlockedQuerySchema = z.object({
    since: z.string().datetime().openapi({
        description: 'ISO 8601 timestamp — return opportunities that became eligible after this time',
        example: '2026-05-11T10:00:00.000Z',
    }),
}).openapi('UnlockedQuery');

// Response schema for GET /api/opportunities/advisor
export const advisorRecommendationSchema = z.object({
    opportunity_id: z.string().uuid().openapi({
        description: 'Opportunity ID from database',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    title: z.string().openapi({
        description: 'Opportunity title',
        example: 'KUR Super Mikro',
    }),
    priority_rank: z.number().int().min(1).max(3).openapi({
        description: 'Priority rank (1 = highest)',
        example: 1,
    }),
    match_status: z.enum(MATCH_STATUSES).nullable().openapi({
        description: 'Current match status from matching engine',
        example: 'almost',
    }),
    missing_steps: z.array(z.enum(STEP_TYPES)).openapi({
        description: 'Steps that are still required',
        example: ['nib'],
    }),
    why_this_fits: z.string().openapi({
        description: 'AI-generated reasoning based on user profile',
        example: 'Cocok karena omzet kamu masih di bawah Rp 5jt/bulan dan KUR Super Mikro tidak butuh syarat usaha 6 bulan.',
    }),
    why_now: z.string().openapi({
        description: 'Timing/urgency explanation',
        example: 'Setelah NIB kelar, kamu bisa langsung ajukan via BRImo.',
    }),
    next_step: z.string().openapi({
        description: 'Concrete action to take',
        example: 'Selesaikan NIB terlebih dahulu, lalu download aplikasi BRImo untuk pengajuan.',
    }),
    caveats: z.string().nullable().openapi({
        description: 'Optional warnings or notes',
        example: 'Konfirmasi bunga terkini langsung ke bank.',
    }),
    source_url: z.string().url().nullable().openapi({
        description: 'Official source URL',
        example: 'https://ekon.go.id/publikasi/detail/6678/',
    }),
}).openapi('AdvisorRecommendation');

export const advisorResponseSchema = z.object({
    user_context_summary: z.string().openapi({
        description: 'Summary of user profile used for recommendations',
        example: 'Pemilik usaha kuliner di Malang. Omzet: Rp 3.0jt/bulan. Belum punya NIB.',
    }),
    recommendations: z.array(advisorRecommendationSchema).openapi({
        description: 'Top 3 personalized recommendations',
    }),
    generated_at: z.string().datetime().openapi({
        description: 'Timestamp when recommendations were generated',
        example: '2026-05-24T07:00:00.000Z',
    }),
}).openapi('AdvisorResponse');

export type ListOpportunitiesQuery = z.infer<typeof listOpportunitiesQuerySchema>;
export type TriggerMatchInput = z.infer<typeof triggerMatchSchema>;
export type UnlockedQuery = z.infer<typeof unlockedQuerySchema>;
export type AdvisorRecommendation = z.infer<typeof advisorRecommendationSchema>;
export type AdvisorResponse = z.infer<typeof advisorResponseSchema>;
