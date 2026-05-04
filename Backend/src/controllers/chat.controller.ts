import { Context } from 'hono';
import { streamSSE } from 'hono/streaming';
import { getAuthClient, getUserId } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error.middleware';
import * as chatRepository from '../repositories/chat.repository';
import * as chatService from '../services/business/chat.service';
import { successResponse } from '../utils/response.util';
import { HonoEnv } from '../types/env';

export const handleCreateSession = async (c: Context<HonoEnv>) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);
    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;

    const session = await chatRepository.createSession(
        supabase,
        userId,
        (body.session_type as any) ?? 'copilot',
        body.context_step_type as any,
    );
    return successResponse(c, session, 'Chat session created', 201);
};

export const handleGetSessions = async (c: Context<HonoEnv>) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);

    const sessions = await chatRepository.getSessionsByUserId(supabase, userId);
    return successResponse(c, sessions, 'Chat sessions fetched');
};

export const handleGetSession = async (c: Context<HonoEnv>) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);
    const sessionId = c.req.param('id');

    const session = await chatRepository.getSessionById(supabase, sessionId);
    if (!session) throw new AppError(404, 'Chat session not found');
    if (session.user_id !== userId) throw new AppError(403, 'Forbidden');

    return successResponse(c, session, 'Chat session fetched');
};

export const handleDeleteSession = async (c: Context<HonoEnv>) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);
    const sessionId = c.req.param('id');

    const session = await chatRepository.getSessionById(supabase, sessionId);
    if (!session) throw new AppError(404, 'Chat session not found');
    if (session.user_id !== userId) throw new AppError(403, 'Forbidden');

    await chatRepository.deleteSession(supabase, sessionId);
    return successResponse(c, null, 'Chat session deleted');
};

// Returns a streaming SSE response. Uses plain .post() in routes (not .openapi())
// because streamSSE return type is incompatible with the openapi() handler type checker.
export const handleSendMessage = async (c: Context<HonoEnv>) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);
    const sessionId = c.req.param('id');

    const body = await c.req.json().catch(() => ({})) as Record<string, unknown>;
    const message = body.message;
    if (!message || typeof message !== 'string' || !message.trim()) {
        throw new AppError(400, '"message" is required and must be a non-empty string');
    }

    return streamSSE(c, async (stream) => {
        try {
            await chatService.streamResponse(
                supabase,
                c.env,
                sessionId,
                userId,
                message.trim(),
                async (token) => {
                    await stream.writeSSE({ data: JSON.stringify({ content: token }), event: 'chunk' });
                },
                async () => {
                    await stream.writeSSE({ data: JSON.stringify({ saved: true }), event: 'done' });
                },
            );
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Streaming error';
            await stream.writeSSE({ data: JSON.stringify({ message: msg }), event: 'error' });
        }
    });
};
