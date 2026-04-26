import { Context } from 'hono';
import { getAuthClient, getUserId } from '../middlewares/auth.middleware';
import * as userService from '../services/user.service';
import { upsertBusinessProfileSchema } from '../schemas/user.schema';
import { successResponse } from '../utils/response.util';
import { AppError } from '../middlewares/error.middleware';

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

    const body = await c.req.json();
    const parsed = upsertBusinessProfileSchema.safeParse(body);

    if (!parsed.success) {
        throw new AppError(400, parsed.error.issues[0].message);
    }

    const businessProfile = await userService.saveBusinessProfile(supabase, userId, parsed.data);
    return successResponse(c, businessProfile, 'Business profile saved successfully', 200);
};
