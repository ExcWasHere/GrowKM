import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { HonoEnv } from '../types/env';
import * as chatController from '../controllers/chat.controller';

const chatRoutes = new OpenAPIHono<HonoEnv>();

const STEP_TYPES = ['nib', 'spp_irt', 'halal', 'bpom', 'merek', 'sertifikat_standar'] as const;
const SESSION_TYPES = ['onboarding', 'copilot', 'financial_parser'] as const;

const createSessionRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Chat'],
    summary: 'Create Chat Session',
    description: 'Buat sesi chat baru. Opsional: tentukan `context_step_type` untuk mengarahkan Copilot ke izin tertentu (nib, halal, dll.).',
    security: [{ BearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        session_type: z.enum(SESSION_TYPES).optional().openapi({ default: 'copilot' }),
                        context_step_type: z.enum(STEP_TYPES).optional().openapi({
                            description: 'Izin yang sedang diproses user — digunakan untuk menyaring knowledge base',
                            example: 'nib',
                        }),
                    }).openapi('CreateSessionInput'),
                },
            },
        },
    },
    responses: {
        201: { description: 'Session created successfully' },
    },
});

const getSessionsRoute = createRoute({
    method: 'get',
    path: '/',
    tags: ['Chat'],
    summary: 'List Chat Sessions',
    description: 'Ambil semua sesi chat milik user yang sedang login, diurutkan terbaru dulu.',
    security: [{ BearerAuth: [] }],
    responses: {
        200: { description: 'List of chat sessions ordered by last activity' },
    },
});

const getSessionRoute = createRoute({
    method: 'get',
    path: '/:id',
    tags: ['Chat'],
    summary: 'Get Chat Session',
    description: 'Ambil satu sesi beserta seluruh riwayat pesan (messages JSONB).',
    security: [{ BearerAuth: [] }],
    responses: {
        200: { description: 'Chat session with message history' },
        404: { description: 'Session not found' },
        403: { description: 'Forbidden — session belongs to another user' },
    },
});

const deleteSessionRoute = createRoute({
    method: 'delete',
    path: '/:id',
    tags: ['Chat'],
    summary: 'Delete Chat Session',
    description: 'Hapus sesi chat beserta semua riwayat pesannya.',
    security: [{ BearerAuth: [] }],
    responses: {
        200: { description: 'Session deleted' },
        404: { description: 'Session not found' },
    },
});

// CRUD — documented in Scalar UI
chatRoutes.openapi(createSessionRoute, chatController.handleCreateSession as any);
chatRoutes.openapi(getSessionsRoute, chatController.handleGetSessions as any);
chatRoutes.openapi(getSessionRoute, chatController.handleGetSession as any);
chatRoutes.openapi(deleteSessionRoute, chatController.handleDeleteSession as any);

// SSE streaming — plain .post() because streamSSE return type conflicts with openapi() type checker
// POST /api/chat/:id/messages  |  Accept: text/event-stream
// Events: { event: 'chunk', data: '{"content":"..."}' } | { event: 'done', data: '{"saved":true}' } | { event: 'error', data: '{"message":"..."}' }
chatRoutes.post('/:id/messages', chatController.handleSendMessage);

export default chatRoutes;
