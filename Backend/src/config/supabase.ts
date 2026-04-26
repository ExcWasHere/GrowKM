import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { EnvBindings } from '../types/env';


const get = (env: Partial<EnvBindings>, key: keyof EnvBindings): string =>
    env[key] ?? (process.env[key] as string) ?? '';


export const createSupabaseClient = (env: Partial<EnvBindings> = {}) =>
    createClient<Database>(get(env, 'SUPABASE_URL'), get(env, 'SUPABASE_ANON_KEY'));


export const createAdminClient = (env: Partial<EnvBindings> = {}) =>
    createClient<Database>(get(env, 'SUPABASE_URL'), get(env, 'SUPABASE_SERVICE_ROLE_KEY'));


export const createAuthClient = (env: Partial<EnvBindings> = {}, token: string) =>
    createClient<Database>(get(env, 'SUPABASE_URL'), get(env, 'SUPABASE_ANON_KEY'), {
        global: {
            headers: { Authorization: `Bearer ${token}` },
        },
    });
