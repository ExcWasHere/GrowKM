import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

type BusinessProfileInsert = Database['public']['Tables']['business_profiles']['Insert'];
type BusinessProfileUpdate = Database['public']['Tables']['business_profiles']['Update'];

// Get basic user profile
export const getUserProfileById = async (supabase: SupabaseClient<Database>, id: string) => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
        
    if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to get user profile: ${error.message}`);
    }
    
    return data;
};

// Get business profile by user ID
export const getBusinessProfileByUserId = async (supabase: SupabaseClient<Database>, userId: string) => {
    const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to get business profile: ${error.message}`);
    }

    return data;
};


export const upsertBusinessProfile = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    profileData: Omit<BusinessProfileInsert, 'user_id' | 'id' | 'created_at' | 'updated_at'>
) => {
    const payload: BusinessProfileInsert = {
        ...profileData,
        user_id: userId,
    };

    const { data, error } = await supabase
        .from('business_profiles')
        .upsert(payload, { onConflict: 'user_id' })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to upsert business profile: ${error.message}`);
    }

    return data;
};
