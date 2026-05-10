import { Context } from 'hono';
import { getAuthClient, getUserId } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error.middleware';
import * as userService from '../services/business/user.service';
import * as userRepository from '../repositories/user.repository';
import { successResponse } from '../utils/response.util';
import { UpsertBusinessProfileInput } from '../schemas/user.schema';
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

// PATCH /api/users/business-profile/kbli
// Confirms and saves the KBLI code chosen by the user after reviewing AI recommendation (Condition A)
export const handleConfirmKbli = async (c: Context) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);

    const validData = (await c.req.json()) as { kbli_code: string };

    const profile = await userRepository.confirmKbliCode(supabase, userId, validData.kbli_code);
    return successResponse(c, { business_profile: profile }, 'KBLI confirmed and saved successfully', 200);
};
