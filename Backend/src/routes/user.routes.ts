import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import * as userController from '../controllers/user.controller';
import {
    upsertBusinessProfileSchema,
    kbliRecommendationResponseSchema,
    kbliValidationResponseSchema,
    confirmKbliSchema
} from '../schemas/user.schema';
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
    description: 'Saves the UMKM business profile. Does NOT trigger AI — use /kbli/recommend or /kbli/validate endpoints separately.',
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
            description: 'Business profile saved successfully.',
        },
    },
});

const recommendKBLIRoute = createRoute({
    method: 'post',
    path: '/business-profile/kbli/recommend',
    tags: ['Users'],
    summary: 'Get KBLI Recommendation',
    description: 'AI recommends KBLI code based on business description. Requires business_description to be set and kbli_code to be empty.',
    security: [{ BearerAuth: [] }],
    responses: {
        200: {
            description: 'KBLI recommendation generated successfully',
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.literal('success'),
                        message: z.string(),
                        data: kbliRecommendationResponseSchema,
                    }),
                },
            },
        },
        400: {
            description: 'Business description missing or KBLI already exists',
        },
        404: {
            description: 'Business profile not found',
        },
    },
});

const validateKBLIRoute = createRoute({
    method: 'post',
    path: '/business-profile/kbli/validate',
    tags: ['Users'],
    summary: 'Validate Existing KBLI',
    description: 'AI validates whether the existing KBLI code matches the business description. Requires both kbli_code and business_description to be set.',
    security: [{ BearerAuth: [] }],
    responses: {
        200: {
            description: 'KBLI validation completed successfully',
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.literal('success'),
                        message: z.string(),
                        data: kbliValidationResponseSchema,
                    }),
                },
            },
        },
        400: {
            description: 'Business description or KBLI code missing',
        },
        404: {
            description: 'Business profile not found',
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
    description: 'Saves the KBLI code chosen by the user (after recommendation or manual input). Triggers roadmap regeneration.',
    security: [{ BearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: confirmKbliSchema,
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
userRoutes.openapi(recommendKBLIRoute, userController.handleRecommendKBLI);
userRoutes.openapi(validateKBLIRoute, userController.handleValidateKBLI);
userRoutes.openapi(confirmKbliRoute, userController.handleConfirmKBLI);
userRoutes.openapi(updateStepStatusRoute, userController.handleUpdateStepStatus as any);

export default userRoutes;
