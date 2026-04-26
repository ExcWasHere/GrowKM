import { Context, Next } from 'hono';
import { createSupabaseClient, createAuthClient } from '../config/supabase';
import { AppError } from './error.middleware';
import { HonoEnv } from '../types/env';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export const authMiddleware = async (c: Context<HonoEnv>, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError(401, 'Unauthorized: Missing or invalid Authorization header');
    }

    const token = authHeader.split(' ')[1];

    const supabase = createSupabaseClient(c.env);
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        throw new AppError(401, `Unauthorized: ${error?.message || 'Invalid token'}`);
    }

    const authClient = createAuthClient(c.env, token);

    c.set('userId', data.user.id);
    c.set('user', data.user);
    c.set('supabase', authClient);

    await next();
};

export const getUserId = (c: Context<HonoEnv>): string => {
    const userId = c.get('userId');
    if (!userId) throw new AppError(401, 'Unauthorized: User ID not found in context');
    return userId;
};

export const getAuthClient = (c: Context<HonoEnv>): SupabaseClient<Database> => {
    const client = c.get('supabase') as SupabaseClient<Database>;
    if (!client) throw new AppError(500, 'Supabase client not found in context');
    return client;
};
