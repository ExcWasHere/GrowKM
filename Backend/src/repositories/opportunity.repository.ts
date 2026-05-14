import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

type OpportunityRow = Database['public']['Tables']['opportunities']['Row'];
type MatchRow = Database['public']['Tables']['user_opportunity_matches']['Row'];
type MatchInsert = Database['public']['Tables']['user_opportunity_matches']['Insert'];
type MatchStatus = Database['public']['Enums']['match_status_enum'];

// ============================================================
// OPPORTUNITIES
// ============================================================

// Fetch all active opportunities (used by matching engine)
export const getAllActiveOpportunities = async (
    supabase: SupabaseClient<Database>,
): Promise<OpportunityRow[]> => {
    const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('is_active', true);

    if (error) throw new Error(`Failed to get opportunities: ${error.message}`);
    return data ?? [];
};

// Fetch a single opportunity by ID
export const getOpportunityById = async (
    supabase: SupabaseClient<Database>,
    id: string,
): Promise<OpportunityRow | null> => {
    const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to get opportunity: ${error.message}`);
    }
    return data ?? null;
};

// ============================================================
// USER OPPORTUNITY MATCHES
// ============================================================

// Fetch all matches for a user (with opportunity details joined)
export const getMatchesByUserId = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    statusFilter?: MatchStatus,
): Promise<(MatchRow & { opportunity: OpportunityRow })[]> => {
    let query = supabase
        .from('user_opportunity_matches')
        .select('*, opportunity:opportunities(*)')
        .eq('user_id', userId)
        .order('match_score', { ascending: false });

    if (statusFilter) {
        query = query.eq('match_status', statusFilter);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to get matches: ${error.message}`);
    return (data ?? []) as (MatchRow & { opportunity: OpportunityRow })[];
};

// Fetch current match statuses for a user (lightweight — for diff/snapshot)
export const getMatchStatusSnapshot = async (
    supabase: SupabaseClient<Database>,
    userId: string,
): Promise<Record<string, MatchStatus>> => {
    const { data, error } = await supabase
        .from('user_opportunity_matches')
        .select('opportunity_id, match_status')
        .eq('user_id', userId);

    if (error) throw new Error(`Failed to get match snapshot: ${error.message}`);

    const snapshot: Record<string, MatchStatus> = {};
    for (const row of data ?? []) {
        snapshot[row.opportunity_id] = row.match_status;
    }
    return snapshot;
};

// Bulk upsert match results (called by matching engine after each calculation)
export const upsertMatches = async (
    supabase: SupabaseClient<Database>,
    matches: MatchInsert[],
): Promise<MatchRow[]> => {
    if (matches.length === 0) return [];

    const { data, error } = await supabase
        .from('user_opportunity_matches')
        .upsert(matches, { onConflict: 'user_id,opportunity_id' })
        .select();

    if (error) throw new Error(`Failed to upsert matches: ${error.message}`);
    return data ?? [];
};

// Fetch newly unlocked opportunities since a given timestamp
export const getNewlyUnlockedSince = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    since: string,
): Promise<(MatchRow & { opportunity: OpportunityRow })[]> => {
    const { data, error } = await supabase
        .from('user_opportunity_matches')
        .select('*, opportunity:opportunities(*)')
        .eq('user_id', userId)
        .eq('match_status', 'eligible')
        .gte('updated_at', since);

    if (error) throw new Error(`Failed to get newly unlocked: ${error.message}`);
    return (data ?? []) as (MatchRow & { opportunity: OpportunityRow })[];
};

// Mark a match as seen
export const markMatchSeen = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    opportunityId: string,
): Promise<void> => {
    const { error } = await supabase
        .from('user_opportunity_matches')
        .update({ seen_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('opportunity_id', opportunityId)
        .is('seen_at', null); // only update if not already seen

    if (error) throw new Error(`Failed to mark match as seen: ${error.message}`);
};
