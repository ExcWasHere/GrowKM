import { Context } from 'hono';
import { getAuthClient, getUserId } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error.middleware';
import { successResponse } from '../utils/response.util';
import * as opportunityService from '../services/business/opportunity.service';
import * as advisorService from '../services/business/advisor.service';
import * as userRepository from '../repositories/user.repository';
import * as roadmapRepository from '../repositories/roadmap.repository';
import * as opportunityRepository from '../repositories/opportunity.repository';
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
export const handleGetUnlocked = async (c: Context) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);
    const { since } = c.req.query() as UnlockedQuery;

    if (!since) throw new AppError(400, 'Query param "since" is required (ISO 8601 timestamp)');

    const unlocked = await opportunityService.getNewlyUnlocked(supabase, userId, since);
    return successResponse(c, { newly_unlocked: unlocked }, 'Newly unlocked opportunities fetched');
};

// GET /api/opportunities/:id

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

// GET /api/opportunities/advisor
export const handleGetAdvisorRecommendations = async (c: Context) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);
    const env = c.env;

    // 1. Get profile + completed steps
    const businessProfile = await userRepository.getBusinessProfileByUserId(supabase, userId);
    if (!businessProfile) throw new AppError(404, 'Business profile not found. Complete onboarding first.');

    const allSteps = await roadmapRepository.getFormalizationStepsByProfileId(supabase, businessProfile.id);
    const completedSteps = allSteps
        .filter(s => s.status === 'completed')
        .map(s => s.step_type as StepType);

    // 2. Build profile context
    const profileContext = advisorService.buildProfileContext(businessProfile, completedSteps);

    // 3. Get current match snapshot (for eligibility awareness)
    const matchSnapshot = await opportunityRepository.getMatchStatusSnapshot(supabase, userId);
    const matchSnapshotArray = Object.entries(matchSnapshot).map(([opportunity_id, match_status]) => {
        // Get missing_steps from user_opportunity_matches
        return { opportunity_id, match_status, missing_steps: [] as StepType[] };
    });

    // Fetch full match data to get missing_steps
    const fullMatches = await opportunityRepository.getMatchesByUserId(supabase, userId);
    const enrichedSnapshot = fullMatches.map(m => ({
        opportunity_id: m.opportunity_id,
        match_status: m.match_status,
        missing_steps: m.missing_steps as StepType[],
    }));

    // 4. Retrieve relevant knowledge chunks
    const chunks = await advisorService.retrieveRelevantChunks(supabase, profileContext, env);

    // 5. Generate recommendations via LLM
    let recommendations: advisorService.Recommendation[];
    try {
        const llmRecs = await advisorService.generateRecommendations(
            businessProfile,
            profileContext,
            enrichedSnapshot,
            chunks,
            env,
        );

        // 6. Validate against DB
        const allOpportunities = await opportunityRepository.getAllActiveOpportunities(supabase);
        recommendations = advisorService.validateRecommendations(llmRecs, allOpportunities, enrichedSnapshot);

        // 7. Fallback if < 3 valid recommendations
        if (recommendations.length < 3) {
            console.warn(`[Advisor] Only ${recommendations.length} valid recommendations, using fallback`);
            const fallback = advisorService.buildFallbackRecommendations(enrichedSnapshot, allOpportunities);
            recommendations = [...recommendations, ...fallback].slice(0, 3);
        }
    } catch (error) {
        console.error('[Advisor] LLM generation failed, using fallback:', error);
        const allOpportunities = await opportunityRepository.getAllActiveOpportunities(supabase);
        recommendations = advisorService.buildFallbackRecommendations(enrichedSnapshot, allOpportunities);
    }

    return successResponse(c, {
        user_context_summary: profileContext,
        recommendations,
        generated_at: new Date().toISOString(),
    }, 'Advisor recommendations generated successfully');
};
