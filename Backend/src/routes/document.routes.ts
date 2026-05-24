import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import * as documentController from '../controllers/document.controller';
import {
    documentStepParamSchema,
    uploadDocumentResponseSchema,
    signedUrlResponseSchema,
} from '../schemas/document.schema';

const documentRoutes = new OpenAPIHono();

const uploadDocumentRoute = createRoute({
    method: 'post',
    path: '/business-profile/documents/{stepType}',
    tags: ['Documents'],
    summary: 'Upload Document Proof',
    description: 'Uploads proof of formalization document (NIB, PIRT, Halal, BPOM, Merek). Maximum 5 MB. Accepted formats: JPG, PNG, WEBP, PDF. The previous file is automatically deleted when a new one is uploaded.',
    security: [{ BearerAuth: [] }],
    request: {
        params: documentStepParamSchema,
        body: {
            content: {
                'multipart/form-data': {
                    schema: z.object({
                        file: z.any().openapi({ type: 'string', format: 'binary' }),
                    }),
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Upload successful, returns path and signed URL for preview',
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.literal('success'),
                        message: z.string(),
                        data: uploadDocumentResponseSchema,
                    }),
                },
            },
        },
        400: { description: 'File too large or unsupported format' },
        401: { description: 'Unauthorized' },
    },
});

const getDocumentUrlRoute = createRoute({
    method: 'get',
    path: '/business-profile/documents/{stepType}/url',
    tags: ['Documents'],
    summary: 'Get Signed URL for Document',
    description: 'Generates a signed URL (TTL 1 hour) for previewing an uploaded document.',
    security: [{ BearerAuth: [] }],
    request: { params: documentStepParamSchema },
    responses: {
        200: {
            description: 'Signed URL generated',
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.literal('success'),
                        message: z.string(),
                        data: signedUrlResponseSchema,
                    }),
                },
            },
        },
        404: { description: 'No document has been uploaded for this step' },
    },
});

const deleteDocumentRoute = createRoute({
    method: 'delete',
    path: '/business-profile/documents/{stepType}',
    tags: ['Documents'],
    summary: 'Delete Document Proof',
    description: 'Deletes the document from storage and clears its path on the business profile.',
    security: [{ BearerAuth: [] }],
    request: { params: documentStepParamSchema },
    responses: {
        200: { description: 'Document deleted successfully' },
    },
});

documentRoutes.openapi(uploadDocumentRoute, documentController.handleUploadDocument as any);
documentRoutes.openapi(getDocumentUrlRoute, documentController.handleGetDocumentUrl as any);
documentRoutes.openapi(deleteDocumentRoute, documentController.handleDeleteDocument as any);

export default documentRoutes;
