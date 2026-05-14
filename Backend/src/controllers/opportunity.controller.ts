import { Context } from 'hono';
import { getAuthClient, getUserId } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error.middleware';
import { successResponse } from '../utils/response.util';
import * as opportunityService from '../services/business/opportunity.service';
import * as userRepository from '../repositories/user.repository';
import * as roadmapRepository from '../repositories/roadmap.repository';
import { ListOpportunitiesQuery, UnlockedQuery } from '../schemas/opportunity.schema';
import { Database } from '../types/database.types';

type MatchStatus = Database['public']['Enums']['match_status_enum'];
type StepType = Database['public']['Enums']['step_type_enum'];

// GET /api/opportunities
// Returns all opportunities with match status for the current user
export const handleListOpportunities = async (c: Context) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);
    const { status, category } = c.req.query() as ListOpportunitiesQuery;

    const result = await opportunityService.getOpportunitiesForUser(
        supabase,
        userId,
        status as MatchStatus | undefined,
    );

    // Apply category filter in-memory 
    if (category) {
        result.opportunities = result.opportunities.filter(o => o.category === category);
    }

    return successResponse(c, result, 'Opportunities fetched successfully');
};

// GET /api/opportunities/unlocked
// Returns newly unlocked opportunities since a given timestamp (for celebration modal)
// NOTE: This route must be registered BEFORE /api/opportunities/:id to avoid path conflict
export const handleGetUnlocked = async (c: Context) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);
    const { since } = c.req.query() as UnlockedQuery;

    if (!since) throw new AppError(400, 'Query param "since" is required (ISO 8601 timestamp)');

    const unlocked = await opportunityService.getNewlyUnlocked(supabase, userId, since);
    return successResponse(c, { newly_unlocked: unlocked }, 'Newly unlocked opportunities fetched');
};

// GET /api/opportunities/:id
// Returns a single opportunity with match status and action steps
export const handleGetOpportunityDetail = async (c: Context) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);
    const { id } = c.req.param();

    const detail = await opportunityService.getOpportunityDetail(supabase, userId, id);
    if (!detail) throw new AppError(404, 'Opportunity not found');

    return successResponse(c, { opportunity: detail }, 'Opportunity detail fetched successfully');
};

// POST /api/opportunities/match
// Re-triggers the matching engine for the current user
export const handleTriggerMatch = async (c: Context) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);

    const businessProfile = await userRepository.getBusinessProfileByUserId(supabase, userId);
    if (!businessProfile) throw new AppError(404, 'Business profile not found. Complete onboarding first.');

    // Get completed steps from roadmap
    const allSteps = await roadmapRepository.getFormalizationStepsByProfileId(supabase, businessProfile.id);
    const completedSteps = allSteps
        .filter(s => s.status === 'completed')
        .map(s => s.step_type as StepType);

    const result = await opportunityService.runMatchingAndSave(
        supabase,
        userId,
        businessProfile,
        completedSteps,
    );

    return successResponse(c, result, 'Matching engine re-triggered successfully');
};
