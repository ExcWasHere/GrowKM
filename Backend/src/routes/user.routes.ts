import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import * as userController from '../controllers/user.controller';
import { upsertBusinessProfileSchema } from '../schemas/user.schema';
import { z } from '@hono/zod-openapi';

const STEP_TYPES = ['nib', 'spp_irt', 'halal', 'bpom', 'merek', 'sertifikat_standar'] as const;

const userRoutes = new OpenAPIHono();

// Route Specs
const getMeRoute = createRoute({
    method: 'get',
    path: '/me',
    tags: ['Users'],
    summary: 'Get Current Profile',
    description: 'Retrieves the authenticated user\'s basic profile, business profile, and formalization roadmap.',
    security: [{ BearerAuth: [] }],
    responses: {
        200: {
            description: 'Returns the logged-in user profile and business roadmap',
        },
    },
});

const upsertBusinessProfileRoute = createRoute({
    method: 'post',
    path: '/business-profile',
    tags: ['Users'],
    summary: 'Create/Update Business Profile',
    description: 'Saves the UMKM business profile. Automatically triggers AI Smart KBLI Matcher if a description is provided.',
    security: [{ BearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: upsertBusinessProfileSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Business profile saved successfully. Triggers Smart KBLI Matcher if description is provided.',
        },
    },
});

const updateStepStatusRoute = createRoute({
    method: 'patch',
    path: '/roadmap/status',
    tags: ['Users'],
    summary: 'Update Formalization Step Status',
    description: [
        'Marks a formalization step as `in_progress` or `completed`.',
        '',
        'When a step is set to **`completed`**:',
        '- The corresponding `has_*` flag in the business profile is updated.',
        '- The full roadmap is regenerated so the next step auto-unlocks.',
        '- Returns 400 if the step is still `locked` (previous steps not done yet).',
        '',
        'When a step is set to **`in_progress`**:',
        '- Only the step row is updated (no roadmap regeneration needed).',
    ].join('\n'),
    security: [{ BearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        step_type: z.enum(STEP_TYPES).openapi({ example: 'nib' }),
                        status: z.enum(['in_progress', 'completed']).openapi({ example: 'completed' }),
                    }).openapi('UpdateStepStatusInput'),
                },
            },
        },
    },
    responses: {
        200: { description: 'Step updated. Returns all roadmap steps and the new progress percentage.' },
        400: { description: 'Step is locked — previous steps not completed yet' },
        404: { description: 'Business profile or step not found' },
    },
});

const confirmKbliRoute = createRoute({
    method: 'patch',
    path: '/business-profile/kbli',
    tags: ['Users'],
    summary: 'Confirm KBLI Code',
    description: 'Saves the specific KBLI code chosen by the user, usually called after reviewing the AI recommendation.',
    security: [{ BearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        kbli_code: z.string().length(5).openapi({ example: '56210' }),
                    }).openapi('ConfirmKbliInput'),
                },
            },
        },
    },
    responses: {
        200: {
            description: 'KBLI confirmed and saved successfully',
        },
    },
});

// Handlers
userRoutes.openapi(getMeRoute, userController.handleGetMe);
userRoutes.openapi(upsertBusinessProfileRoute, userController.handleUpsertBusinessProfile);
userRoutes.openapi(updateStepStatusRoute, userController.handleUpdateStepStatus as any);
userRoutes.openapi(confirmKbliRoute, userController.handleConfirmKbli);

export default userRoutes;
