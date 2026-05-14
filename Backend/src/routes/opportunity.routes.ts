import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import * as opportunityController from '../controllers/opportunity.controller';

const opportunityRoutes = new OpenAPIHono();

// ============================================================
// ROUTE SPECS
// ============================================================

const listOpportunitiesRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Opportunities'],
    summary: 'List Opportunities with Match Status',
    description: [
        'Returns all business opportunities matched against the current user\'s profile and completed steps.',
        '',
        'Results are sorted: **eligible → almost → locked**, then by match score descending.',
        '',
        'Optionally filter by `status` (eligible/almost/locked) or `category`.',
    ].join('\n'),
    security: [{ BearerAuth: [] }],
    request: {
        query: z.object({
            status: z.enum(['eligible', 'almost', 'locked']).optional().openapi({
                description: 'Filter by match status',
                example: 'eligible',
            }),
            category: z.enum([
                'pembiayaan',
                'vendor_supply_chain',
                'marketplace',
                'program_pemerintah',
                'event_pameran',
            ]).optional().openapi({
                description: 'Filter by opportunity category',
                example: 'pembiayaan',
            }),
        }),
    },
    responses: {
        200: {
            description: 'Returns summary counts and list of opportunities with match info',
        },
    },
});

const getUnlockedRoute = createRoute({
    method: 'get',
    path: '/unlocked',
    tags: ['Opportunities'],
    summary: 'Get Newly Unlocked Opportunities',
    description: [
        'Returns opportunities that became **eligible** after the given `since` timestamp.',
        '',
        'Used by the frontend to show the celebration modal after a step is completed.',
        '',
        '`since` must be an ISO 8601 timestamp (e.g. `2026-05-11T10:00:00.000Z`).',
    ].join('\n'),
    security: [{ BearerAuth: [] }],
    request: {
        query: z.object({
            since: z.string().openapi({
                description: 'ISO 8601 timestamp — return opportunities that became eligible after this time',
                example: '2026-05-11T10:00:00.000Z',
            }),
        }),
    },
    responses: {
        200: {
            description: 'Returns list of newly unlocked opportunities',
        },
        400: {
            description: 'Missing or invalid "since" query param',
        },
    },
});

const getOpportunityDetailRoute = createRoute({
    method: 'get',
    path: '/:id',
    tags: ['Opportunities'],
    summary: 'Get Opportunity Detail',
    description: 'Returns full details of a single opportunity including the user\'s match status and missing steps.',
    security: [{ BearerAuth: [] }],
    request: {
        params: z.object({
            id: z.string().uuid().openapi({ example: '550e8400-e29b-41d4-a716-446655440000' }),
        }),
    },
    responses: {
        200: {
            description: 'Returns opportunity detail with match info',
        },
        404: {
            description: 'Opportunity not found',
        },
    },
});

const triggerMatchRoute = createRoute({
    method: 'post',
    path: '/match',
    tags: ['Opportunities'],
    summary: 'Re-trigger Matching Engine',
    description: [
        'Manually re-runs the deterministic matching engine for the current user.',
        '',
        'Normally called automatically after:',
        '- Onboarding (`POST /api/users/business-profile`)',
        '- Step completion (`PATCH /api/users/roadmap/status`)',
        '',
        'Returns match summary and list of newly unlocked opportunity IDs.',
    ].join('\n'),
    security: [{ BearerAuth: [] }],
    responses: {
        200: {
            description: 'Returns match summary with eligible/almost/locked counts and newly_unlocked IDs',
        },
        404: {
            description: 'Business profile not found — complete onboarding first',
        },
    },
});

// ============================================================
// HANDLERS
// NOTE: /unlocked must be registered before /:id to avoid path conflict
// ============================================================

opportunityRoutes.openapi(listOpportunitiesRoute, opportunityController.handleListOpportunities as any);
opportunityRoutes.openapi(getUnlockedRoute, opportunityController.handleGetUnlocked as any);
opportunityRoutes.openapi(getOpportunityDetailRoute, opportunityController.handleGetOpportunityDetail as any);
opportunityRoutes.openapi(triggerMatchRoute, opportunityController.handleTriggerMatch as any);

export default opportunityRoutes;
