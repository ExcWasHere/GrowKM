import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

type FormalizationStepInsert = Database['public']['Tables']['formalization_steps']['Insert'];

// Upsert all roadmap steps for a given profile
// onConflict: (profile_id, step_type) — if step exists, update its status
export const upsertFormalizationSteps = async (
    supabase: SupabaseClient<Database>,
    profileId: string,
    steps: Omit<FormalizationStepInsert, 'profile_id'>[]
) => {
    const payload: FormalizationStepInsert[] = steps.map(step => ({
        ...step,
        profile_id: profileId,
    }));

    const { data, error } = await supabase
        .from('formalization_steps')
        .upsert(payload, { onConflict: 'profile_id,step_type' })
        .select();

    if (error) {
        throw new Error(`Failed to upsert formalization steps: ${error.message}`);
    }

    return data;
};

// Fetch all roadmap steps for a profile, ordered
export const getFormalizationStepsByProfileId = async (
    supabase: SupabaseClient<Database>,
    profileId: string
) => {
    const { data, error } = await supabase
        .from('formalization_steps')
        .select('*')
        .eq('profile_id', profileId)
        .order('step_order', { ascending: true });

    if (error) {
        throw new Error(`Failed to get formalization steps: ${error.message}`);
    }

    return data ?? [];
};
