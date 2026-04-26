import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import * as userRepository from '../repositories/user.repository';
import { UpsertBusinessProfileInput } from '../schemas/user.schema';

// Get the full profile of the logged-in user (basic info + business profile)
export const getMyProfile = async (supabase: SupabaseClient<Database>, userId: string) => {
    const [user, businessProfile] = await Promise.all([
        userRepository.getUserProfileById(supabase, userId),
        userRepository.getBusinessProfileByUserId(supabase, userId),
    ]);

    return {
        user,
        business_profile: businessProfile ?? null,
    };
};

// Create or update the business profile for the logged-in user
export const saveBusinessProfile = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    input: UpsertBusinessProfileInput
) => {
    const businessProfile = await userRepository.upsertBusinessProfile(supabase, userId, input);
    return businessProfile;
};
