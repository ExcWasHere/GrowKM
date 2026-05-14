import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';
import * as opportunityRepository from '../../repositories/opportunity.repository';

type OpportunityRow = Database['public']['Tables']['opportunities']['Row'];
type MatchInsert = Database['public']['Tables']['user_opportunity_matches']['Insert'];
type MatchStatus = Database['public']['Enums']['match_status_enum'];
type StepType = Database['public']['Enums']['step_type_enum'];
type BusinessProfile = Database['public']['Tables']['business_profiles']['Row'];

// ============================================================
// MATCHING ENGINE (Deterministic — no AI)
// ============================================================

interface MatchResult {
    opportunity_id: string;
    match_status: MatchStatus;
    missing_steps: StepType[];
    match_score: number;
}

/**
 * Core matching function.
 * Filters opportunities by profile attributes, then calculates match status
 * based on which required_steps the user has already completed.
 */
export function computeMatches(
    profile: BusinessProfile,
    completedSteps: StepType[],
    opportunities: OpportunityRow[],
): MatchResult[] {
    const userSteps = new Set(completedSteps);
    const annualRevenue = (profile.monthly_revenue_estimate ?? 0) * 12;
    const results: MatchResult[] = [];

    for (const opp of opportunities) {
        // Filter 1: Business type must match
        if (!opp.business_types.includes(profile.business_type)) continue;

        // Filter 2: Region — 'nasional' matches everyone; specific region must match city
        if (opp.region !== 'nasional' && opp.region !== (profile.city ?? '').toLowerCase()) continue;

        // Filter 3: Revenue range
        if (annualRevenue < opp.min_annual_revenue || annualRevenue > opp.max_annual_revenue) continue;

        // Calculate step completion
        const requiredSteps = opp.required_steps as StepType[];
        const missingSteps = requiredSteps.filter(s => !userSteps.has(s));
        const completedRequired = requiredSteps.length - missingSteps.length;

        let matchStatus: MatchStatus;
        let matchScore: number;

        if (missingSteps.length === 0) {
            matchStatus = 'eligible';
            matchScore = 1.0;
        } else if (missingSteps.length <= 2) {
            matchStatus = 'almost';
            matchScore = requiredSteps.length > 0
                ? completedRequired / requiredSteps.length
                : 0;
        } else {
            matchStatus = 'locked';
            matchScore = requiredSteps.length > 0
                ? completedRequired / requiredSteps.length
                : 0;
        }

        results.push({
            opportunity_id: opp.id,
            match_status: matchStatus,
            missing_steps: missingSteps,
            match_score: matchScore,
        });
    }

    // Sort: eligible → almost → locked, then by score desc within each group
    const statusOrder: Record<MatchStatus, number> = { eligible: 0, almost: 1, locked: 2 };
    return results.sort((a, b) => {
        const statusDiff = statusOrder[a.match_status] - statusOrder[b.match_status];
        if (statusDiff !== 0) return statusDiff;
        return b.match_score - a.match_score;
    });
}

// ============================================================
// SERVICE FUNCTIONS
// ============================================================

/**
 * Run matching engine and persist results to DB.
 * Returns a summary and the list of newly unlocked opportunity IDs.
 */
export const runMatchingAndSave = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    profile: BusinessProfile,
    completedSteps: StepType[],
): Promise<{
    eligible: number;
    almost: number;
    locked: number;
    total: number;
    newly_unlocked: string[];
}> => {
    // 1. Snapshot current statuses before re-matching (for diff)
    const snapshotBefore = await opportunityRepository.getMatchStatusSnapshot(supabase, userId);

    // 2. Fetch all active opportunities
    const opportunities = await opportunityRepository.getAllActiveOpportunities(supabase);

    // 3. Run deterministic matching
    const results = computeMatches(profile, completedSteps, opportunities);

    // 4. Prepare upsert payload
    const matchInserts: MatchInsert[] = results.map(r => ({
        user_id: userId,
        opportunity_id: r.opportunity_id,
        match_status: r.match_status,
        missing_steps: r.missing_steps,
        match_score: r.match_score,
    }));

    // 5. Bulk upsert
    await opportunityRepository.upsertMatches(supabase, matchInserts);

    // 6. Detect newly unlocked (was not 'eligible' before, now 'eligible')
    const newlyUnlocked = results
        .filter(r =>
            r.match_status === 'eligible' &&
            snapshotBefore[r.opportunity_id] !== 'eligible',
        )
        .map(r => r.opportunity_id);

    // 7. Build summary
    const eligible = results.filter(r => r.match_status === 'eligible').length;
    const almost = results.filter(r => r.match_status === 'almost').length;
    const locked = results.filter(r => r.match_status === 'locked').length;

    return { eligible, almost, locked, total: results.length, newly_unlocked: newlyUnlocked };
};

/**
 * Get all opportunities with match status for a user.
 * Optionally filter by match status.
 */
export const getOpportunitiesForUser = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    statusFilter?: MatchStatus,
) => {
    const matches = await opportunityRepository.getMatchesByUserId(supabase, userId, statusFilter);

    const summary = {
        eligible_count: matches.filter(m => m.match_status === 'eligible').length,
        almost_count: matches.filter(m => m.match_status === 'almost').length,
        locked_count: matches.filter(m => m.match_status === 'locked').length,
    };

    const opportunities = matches.map(m => ({
        id: m.opportunity.id,
        title: m.opportunity.title,
        category: m.opportunity.category,
        provider: m.opportunity.provider,
        description: m.opportunity.description,
        estimated_value: m.opportunity.estimated_value,
        value_description: m.opportunity.value_description,
        region: m.opportunity.region,
        required_steps: m.opportunity.required_steps,
        nice_to_have_steps: m.opportunity.nice_to_have_steps,
        additional_requirements: m.opportunity.additional_requirements,
        deadline: m.opportunity.deadline,
        source_url: m.opportunity.source_url,
        // Match info
        match_status: m.match_status,
        missing_steps: m.missing_steps,
        match_score: m.match_score,
        seen_at: m.seen_at,
        clicked_at: m.clicked_at,
    }));

    return { summary, opportunities };
};

/**
 * Get a single opportunity with match status for a user.
 */
export const getOpportunityDetail = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    opportunityId: string,
) => {
    const opp = await opportunityRepository.getOpportunityById(supabase, opportunityId);
    if (!opp) return null;

    // Get match info for this user
    const matches = await opportunityRepository.getMatchesByUserId(supabase, userId);
    const match = matches.find(m => m.opportunity_id === opportunityId);

    return {
        ...opp,
        match_status: match?.match_status ?? null,
        missing_steps: match?.missing_steps ?? [],
        match_score: match?.match_score ?? 0,
    };
};

/**
 * Get newly unlocked opportunities since a given timestamp.
 * Used for the celebration modal after a step is completed.
 */
export const getNewlyUnlocked = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    since: string,
) => {
    const rows = await opportunityRepository.getNewlyUnlockedSince(supabase, userId, since);

    return rows.map(r => ({
        id: r.opportunity.id,
        title: r.opportunity.title,
        category: r.opportunity.category,
        provider: r.opportunity.provider,
        estimated_value: r.opportunity.estimated_value,
        missing_steps: r.missing_steps,
        unlocked_at: r.updated_at,
    }));
};
