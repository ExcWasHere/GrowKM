import { Context } from 'hono';
import { getAuthClient, getUserId } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error.middleware';
import * as userService from '../services/business/user.service';
import * as userRepository from '../repositories/user.repository';
import { successResponse } from '../utils/response.util';
import { UpsertBusinessProfileInput, ConfirmKBLIInput } from '../schemas/user.schema';
import { StepType, StepStatus } from '../services/business/roadmap.service';

// GET /api/users/me
// Returns the logged-in user's basic profile and business profile
export const handleGetMe = async (c: Context) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);

    const profile = await userService.getMyProfile(supabase, userId);
    return successResponse(c, profile, 'Profile fetched successfully');
};

// POST /api/users/business-profile
// Creates or updates the business profile for the logged-in user
export const handleUpsertBusinessProfile = async (c: Context) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);

    const validData = (await c.req.json()) as UpsertBusinessProfileInput;

    const businessProfile = await userService.saveBusinessProfile(supabase, userId, validData, c.env);
    return successResponse(c, businessProfile, 'Business profile saved successfully', 200);
};

// PATCH /api/users/roadmap/:stepType/status
// Marks a formalization step as in_progress or completed; auto-unlocks the next step when completed
export const handleUpdateStepStatus = async (c: Context) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);
    const { step_type, status } = (await c.req.json()) as { step_type: StepType; status: StepStatus };

    const result = await userService.updateStepStatus(supabase, userId, step_type, status);
    return successResponse(c, result, 'Step status updated successfully');
};

// POST /api/users/business-profile/kbli/recommend
// AI recommends KBLI based on business description (requires no existing kbli_code)
export const handleRecommendKBLI = async (c: Context) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);

    const result = await userService.recommendKBLI(supabase, userId, c.env);
    return successResponse(c, result, 'KBLI recommendation generated successfully');
};

// POST /api/users/business-profile/kbli/validate
// AI validates existing KBLI against business description (requires existing kbli_code)
export const handleValidateKBLI = async (c: Context) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);

    const result = await userService.validateKBLI(supabase, userId, c.env);
    return successResponse(c, result, 'KBLI validation completed successfully');
};

// PATCH /api/users/business-profile/kbli
// Confirms and saves the KBLI code chosen by the user after reviewing AI recommendation
export const handleConfirmKBLI = async (c: Context) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);

    const validData = (await c.req.json()) as ConfirmKBLIInput;

    const result = await userService.confirmKBLI(supabase, userId, validData.kbli_code, c.env);
    return successResponse(c, result, 'KBLI confirmed and saved successfully');
};
