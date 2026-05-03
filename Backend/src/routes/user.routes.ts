import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import * as userController from '../controllers/user.controller';
import { upsertBusinessProfileSchema } from '../schemas/user.schema';
import { z } from '@hono/zod-openapi';

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
userRoutes.openapi(confirmKbliRoute, userController.handleConfirmKbli);

export default userRoutes;
