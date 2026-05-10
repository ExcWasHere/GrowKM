import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

type FormalizationStepInsert = Database['public']['Tables']['formalization_steps']['Insert'];
type StepType = Database['public']['Enums']['step_type_enum'];
type StepStatus = Database['public']['Enums']['step_status_enum'];

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

// Fetch a single step by step_type for a given profile
export const getStepByType = async (
    supabase: SupabaseClient<Database>,
    profileId: string,
    stepType: StepType,
) => {
    const { data, error } = await supabase
        .from('formalization_steps')
        .select('*')
        .eq('profile_id', profileId)
        .eq('step_type', stepType)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to get step: ${error.message}`);
    }
    return data ?? null;
};

// Remove steps that no longer belong to the current roadmap (e.g. after business_type change)
export const deleteObsoleteSteps = async (
    supabase: SupabaseClient<Database>,
    profileId: string,
    validStepTypes: StepType[],
) => {
    const { error } = await supabase
        .from('formalization_steps')
        .delete()
        .eq('profile_id', profileId)
        .not('step_type', 'in', `(${validStepTypes.join(',')})`);

    if (error) throw new Error(`Failed to delete obsolete steps: ${error.message}`);
};

// Update a single step's status; sets started_at / completed_at timestamps automatically
export const updateStepStatus = async (
    supabase: SupabaseClient<Database>,
    profileId: string,
    stepType: StepType,
    newStatus: StepStatus,
) => {
    const timestamps: Partial<FormalizationStepInsert> = {};
    if (newStatus === 'in_progress') timestamps.started_at = new Date().toISOString();
    if (newStatus === 'completed') timestamps.completed_at = new Date().toISOString();

    const { data, error } = await supabase
        .from('formalization_steps')
        .update({ status: newStatus, ...timestamps })
        .eq('profile_id', profileId)
        .eq('step_type', stepType)
        .select()
        .single();

    if (error) throw new Error(`Failed to update step status: ${error.message}`);
    return data;
};
