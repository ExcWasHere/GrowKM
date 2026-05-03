import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';
import { EnvBindings } from '../../types/env';
import * as userRepository from '../../repositories/user.repository';
import * as roadmapRepository from '../../repositories/roadmap.repository';
import { generateRoadmap } from './roadmap.service';
import { matchKBLI } from './kbli.service';
import { UpsertBusinessProfileInput } from '../../schemas/user.schema';

import { GetMeResponse, UpsertBusinessProfileResponse } from '../../types/responses';

export const getMyProfile = async (supabase: SupabaseClient<Database>, userId: string): Promise<GetMeResponse> => {
    const [user, businessProfile] = await Promise.all([
        userRepository.getUserProfileById(supabase, userId),
        userRepository.getBusinessProfileByUserId(supabase, userId),
    ]);

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
    input: UpsertBusinessProfileInput,
    env: Partial<EnvBindings>,
): Promise<UpsertBusinessProfileResponse> => {
    const businessProfile = await userRepository.upsertBusinessProfile(supabase, userId, input);

    let kbliResult = null;

    if (input.description) {
        try {
            if (input.kbli_code) {
                // Condition B: user already has a kbli_code — it's already saved via upsert above.
                // Run AI with existingKbliCode so it can detect and return a mismatch_alert if needed.
                kbliResult = await matchKBLI(supabase, env, input.description, businessProfile.business_type, input.kbli_code);
            } else {
                // Condition A: user doesn't know their KBLI — AI recommends only, do NOT save yet.
                // Frontend shows the recommendation; user confirms via PATCH /users/business-profile/kbli.
                kbliResult = await matchKBLI(supabase, env, input.description, businessProfile.business_type);
            }
        } catch (err) {
            console.error('[matchKBLI] failed:', err);
        }
    }

    const roadmapSteps = generateRoadmap(businessProfile);
    const roadmap = await roadmapRepository.upsertFormalizationSteps(
        supabase,
        businessProfile.id,
        roadmapSteps,
    );

    return {
        business_profile: businessProfile,
        kbli_recommendation: kbliResult,
        roadmap,
    };
};
