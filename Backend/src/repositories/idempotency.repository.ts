import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export const getIdempotencyKey = async (
    supabase: SupabaseClient<Database>,
    key: string,
    profileId: string
) => {
    const { data, error } = await supabase
        .from('idempotency_keys')
        .select('*')
        .eq('idempotency_key', key)
        .eq('profile_id', profileId)
        .single();
        
    if (error && error.code !== 'PGRST116') {
        throw error;
    }
    
    return data;
};

export const lockIdempotencyKey = async (
    supabase: SupabaseClient<Database>,
    key: string,
    profileId: string
) => {
    const { data, error } = await supabase
        .from('idempotency_keys')
        .upsert({
            idempotency_key: key,
            profile_id: profileId,
            status: 'processing',
            updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
    if (error) throw error;
    return data;
};

export const updateIdempotencyKey = async (
    supabase: SupabaseClient<Database>,
    key: string,
    profileId: string,
    status: 'completed' | 'failed',
    responseBody?: any
) => {
    const { error } = await supabase
        .from('idempotency_keys')
        .update({
            status,
            response_body: responseBody || null,
            updated_at: new Date().toISOString()
        })
        .eq('idempotency_key', key)
        .eq('profile_id', profileId);

    if (error) throw error;
};