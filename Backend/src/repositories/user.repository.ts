import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

type BusinessProfileInsert = Database['public']['Tables']['business_profiles']['Insert'];
type BusinessProfileUpdate = Database['public']['Tables']['business_profiles']['Update'];
type BusinessProfileFlagKey = keyof Pick<BusinessProfileUpdate, 'has_nib' | 'has_pirt' | 'has_halal' | 'has_bpom' | 'has_merek'>;

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

// Update a single has_* flag when user marks a step as completed
export const updateBusinessProfileFlag = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    flag: BusinessProfileFlagKey,
    value: boolean,
) => {
    const { data, error } = await supabase
        .from('business_profiles')
        .update({ [flag]: value } as BusinessProfileUpdate)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw new Error(`Failed to update business profile flag: ${error.message}`);
    return data;
};

// Confirm and save KBLI code after user approves the AI recommendation (Condition A)
export const confirmKbliCode = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    kbliCode: string,
) => {
    const { data, error } = await supabase
        .from('business_profiles')
        .update({ kbli_code: kbliCode })
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw new Error(`Failed to confirm KBLI code: ${error.message}`);
    return data;
};
