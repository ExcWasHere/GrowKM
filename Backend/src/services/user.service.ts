import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import * as userRepository from '../repositories/user.repository';
import * as roadmapRepository from '../repositories/roadmap.repository';
import { generateRoadmap } from './roadmap.service';
import { UpsertBusinessProfileInput } from '../schemas/user.schema';

export const getMyProfile = async (supabase: SupabaseClient<Database>, userId: string) => {
    const [user, businessProfile] = await Promise.all([
        userRepository.getUserProfileById(supabase, userId),
        userRepository.getBusinessProfileByUserId(supabase, userId),
    ]);

    // If a business profile exists, include its roadmap as well
    let roadmap = null;
    if (businessProfile) {
        roadmap = await roadmapRepository.getFormalizationStepsByProfileId(supabase, businessProfile.id);
    }

    return {
        user,
        business_profile: businessProfile ?? null,
        roadmap,
    };
};

export const saveBusinessProfile = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    input: UpsertBusinessProfileInput
) => {
    // 1. Save business profile
    const businessProfile = await userRepository.upsertBusinessProfile(supabase, userId, input);

    // 2. Generate roadmap deterministically based on the profile
    const roadmapSteps = generateRoadmap(businessProfile);

    // 3. Save steps to DB (upsert — safe to call multiple times)
    const roadmap = await roadmapRepository.upsertFormalizationSteps(
        supabase,
        businessProfile.id,
        roadmapSteps
    );

    return {
        business_profile: businessProfile,
        roadmap,
    };
};
