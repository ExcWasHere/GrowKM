import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { HonoEnv } from '../types/env';
import * as chatController from '../controllers/chat.controller';

const chatRoutes = new OpenAPIHono<HonoEnv>();

// ─── Shared ─────────────────────────────────────────────────────────────────

const STEP_TYPES = ['nib', 'spp_irt', 'halal', 'bpom', 'merek', 'sertifikat_standar'] as const;

const sessionIdParam = z.object({
    id: z.string().min(1).openapi({
        param: { in: 'path', name: 'id' },
        description: 'Chat session UUID',
    }),
});

// ─── Route Specs ─────────────────────────────────────────────────────────────

const chatRoute = createRoute({
    method: 'post',
    path: '/',
    tags: ['Chat'],
    summary: 'Chat with Copilot',
    description: [
        'Sends a message to the AI Compliance Copilot and returns the full AI response.',
        '',
        '**Session behaviour:**',
        '- If `session_id` is **omitted**, a new session is automatically created.',
        '- If `session_id` is **provided**, the conversation continues from where it left off.',
        '- The `session_id` is always returned in the response — store it on the client to maintain conversation context.',
        '',
        'Optionally pass `context_step_type` (first message only) to focus the AI on a specific permit flow.',
    ].join('\n'),
    security: [{ BearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        message: z.string().min(1).openapi({
                            example: 'Bagaimana cara mengurus NIB untuk usaha kuliner saya?',
                        }),
                        session_id: z.union([z.string().uuid(), z.literal('')]).optional().openapi({
                            description: 'Omit or pass empty string to start a new conversation. Pass a valid UUID to continue an existing one.',
                        }),
                        context_step_type: z.enum(STEP_TYPES).optional().openapi({
                            description: 'Narrows the AI focus to a specific permit domain (used when creating a new session).',
                            example: 'nib',
                        }),
                    }).openapi('ChatInput'),
                },
            },
        },
    },
    responses: {
        200: { description: 'AI response generated. Contains `session_id` to use for follow-up messages.' },
        403: { description: 'Forbidden — session belongs to another user' },
        404: { description: 'Session not found' },
    },
});

const getSessionsRoute = createRoute({
    method: 'get',
    path: '/sessions',
    tags: ['Chat'],
    summary: 'List Chat Sessions',
    description: 'Returns all chat sessions belonging to the authenticated user, ordered by most recent activity. Message history is excluded for performance.',
    security: [{ BearerAuth: [] }],
    responses: {
        200: { description: 'List of chat sessions (metadata only)' },
    },
});

const getSessionRoute = createRoute({
    method: 'get',
    path: '/sessions/{id}',
    tags: ['Chat'],
    summary: 'Get Chat Session',
    description: 'Returns a single session including its full message history.',
    security: [{ BearerAuth: [] }],
    request: { params: sessionIdParam },
    responses: {
        200: { description: 'Chat session with full message history' },
        403: { description: 'Forbidden — session belongs to another user' },
        404: { description: 'Session not found' },
    },
});

const deleteSessionRoute = createRoute({
    method: 'delete',
    path: '/sessions/{id}',
    tags: ['Chat'],
    summary: 'Delete Chat Session',
    description: 'Permanently deletes a chat session and its entire message history.',
    security: [{ BearerAuth: [] }],
    request: { params: sessionIdParam },
    responses: {
        200: { description: 'Session deleted' },
        403: { description: 'Forbidden' },
        404: { description: 'Session not found' },
    },
});


chatRoutes.openapi(chatRoute, chatController.handleChat as any);
chatRoutes.openapi(getSessionsRoute, chatController.handleGetSessions);
chatRoutes.openapi(getSessionRoute, chatController.handleGetSession);
chatRoutes.openapi(deleteSessionRoute, chatController.handleDeleteSession);

export default chatRoutes;
