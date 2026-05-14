import { z } from '@hono/zod-openapi';

const MATCH_STATUSES = ['eligible', 'almost', 'locked'] as const;
const OPPORTUNITY_CATEGORIES = [
    'pembiayaan',
    'vendor_supply_chain',
    'marketplace',
    'program_pemerintah',
    'event_pameran',
] as const;

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

export type ListOpportunitiesQuery = z.infer<typeof listOpportunitiesQuerySchema>;
export type TriggerMatchInput = z.infer<typeof triggerMatchSchema>;
export type UnlockedQuery = z.infer<typeof unlockedQuerySchema>;
