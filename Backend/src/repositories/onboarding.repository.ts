import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export const updateAIValidation = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    qualityScore: number,
    isPending: boolean,
    clarificationQuestion: string | null,
) => {
    const { data, error } = await supabase
        .from('business_profiles')
        .update({
            description_quality_score: qualityScore,
            description_validated_at: new Date().toISOString(),
            ai_clarification_pending: isPending,
            ai_clarification_question: clarificationQuestion,
        })
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw new Error(`Failed to update AI validation: ${error.message}`);
    return data;
};
