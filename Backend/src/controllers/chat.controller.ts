import { Context } from 'hono';
import { getAuthClient, getUserId } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error.middleware';
import { successResponse } from '../utils/response.util';
import * as chatRepository from '../repositories/chat.repository';
import * as chatService from '../services/business/chat.service';
import { HonoEnv } from '../types/env';
import { Database } from '../types/database.types';

type StepType = Database['public']['Enums']['step_type_enum'];

interface ChatRequestBody {
    message: string;
    session_id?: string;
    context_step_type?: StepType;
}

// POST /api/chat
export const handleChat = async (c: Context<HonoEnv>) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);

    const body = await c.req.json() as ChatRequestBody;
    if (!body?.message || typeof body.message !== 'string' || body.message.trim() === '') {
        throw new AppError(400, '"message" is required and must be a non-empty string');
    }

    const result = await chatService.chat(
        supabase,
        c.env,
        userId,
        body.message.trim(),
        body.session_id || undefined,
        body.context_step_type,
    );
    return successResponse(c, result, 'AI response generated');
};

// GET /api/chat/sessions
export const handleGetSessions = async (c: Context<HonoEnv>) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);

    const sessions = await chatRepository.getSessionsByUserId(supabase, userId);
    return successResponse(c, sessions, 'Chat sessions fetched');
};

// GET /api/chat/sessions/:id
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
