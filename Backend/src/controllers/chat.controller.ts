import { Context } from 'hono';
import { getAuthClient, getUserId } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error.middleware';
import { successResponse } from '../utils/response.util';
import * as chatRepository from '../repositories/chat.repository';
import * as chatService from '../services/business/chat.service';
import { HonoEnv } from '../types/env';

// POST /api/chat
// Sends a message to the AI Copilot. Auto-creates a new session if session_id is not provided.
// Returns the AI response and the session_id so the client can continue the conversation.
export const handleChat = async (c: Context<HonoEnv>) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);
    const body = await c.req.json() as { message: string; session_id?: string; context_step_type?: string };

    const result = await chatService.chat(
        supabase,
        c.env,
        userId,
        body.message,
        body.session_id,
        body.context_step_type as any,
    );
    return successResponse(c, result, 'AI response generated');
};

// GET /api/chat/sessions
// Returns all chat sessions belonging to the logged-in user (metadata only, no messages)
export const handleGetSessions = async (c: Context<HonoEnv>) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);

    const sessions = await chatRepository.getSessionsByUserId(supabase, userId);
    return successResponse(c, sessions, 'Chat sessions fetched');
};

// GET /api/chat/sessions/:id
// Returns a single session with its full message history
export const handleGetSession = async (c: Context<HonoEnv>) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);
    const sessionId = c.req.param('id');
    if (!sessionId) throw new AppError(400, 'Session ID is required');

    const session = await chatRepository.getSessionById(supabase, sessionId);
    if (!session) throw new AppError(404, 'Chat session not found');
    if (session.user_id !== userId) throw new AppError(403, 'Forbidden');

    return successResponse(c, session, 'Chat session fetched');
};

// DELETE /api/chat/sessions/:id
// Permanently deletes a chat session and its message history
export const handleDeleteSession = async (c: Context<HonoEnv>) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);
    const sessionId = c.req.param('id');
    if (!sessionId) throw new AppError(400, 'Session ID is required');

    const session = await chatRepository.getSessionById(supabase, sessionId);
    if (!session) throw new AppError(404, 'Chat session not found');
    if (session.user_id !== userId) throw new AppError(403, 'Forbidden');

    await chatRepository.deleteSession(supabase, sessionId);
    return successResponse(c, null, 'Chat session deleted');
};
