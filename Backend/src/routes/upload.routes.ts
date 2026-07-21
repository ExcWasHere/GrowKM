import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import * as uploadController from '../controllers/upload.controller';
import { z } from '@hono/zod-openapi';
import { HonoEnv } from '../types/env';
import {
    generatePresignedUrlBodySchema,
    generatePresignedUrlResponseSchema
} from '../schemas/upload.schema';

const uploadRoutes = new OpenAPIHono<HonoEnv>();

const generateUrlRoute = createRoute({
    method: 'post',
    path: '/presigned-url',
    tags: ['Upload'],
    summary: 'Generate Presigned Upload URL',
    description: 'Generates a temporary URL to upload files directly to Cloudflare R2.',
    security: [{ BearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: generatePresignedUrlBodySchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Presigned URL generated',
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.literal('success'),
                        data: generatePresignedUrlResponseSchema
                    }),
                },
            },
        },
    },
});

uploadRoutes.openapi(generateUrlRoute, uploadController.handleGeneratePresignedUrl);

export default uploadRoutes;
