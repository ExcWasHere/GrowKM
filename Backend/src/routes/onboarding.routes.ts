import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import * as onboardingController from '../controllers/onboarding.controller';
import { validateDescriptionSchema, validateDescriptionResponseSchema } from '../schemas/onboarding.schema';

const onboardingRoutes = new OpenAPIHono();

const validateDescriptionRoute = createRoute({
    method: 'post',
    path: '/validate-description',
    tags: ['Onboarding'],
    summary: 'Validate Business Description',
    description: 'Stateless AI check. Returns whether the description is specific enough for KBLI determination. If not, returns a clarification question.',
    security: [{ BearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: validateDescriptionSchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Validation result',
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.literal('success'),
                        message: z.string(),
                        data: validateDescriptionResponseSchema,
                    }),
                },
            },
        },
    },
});

onboardingRoutes.openapi(validateDescriptionRoute, onboardingController.handleValidateDescription as any);

export default onboardingRoutes;
