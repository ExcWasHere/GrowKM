import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';
import { EnvBindings } from '../../types/env';
import * as userRepository from '../../repositories/user.repository';
import * as roadmapRepository from '../../repositories/roadmap.repository';
import { generateRoadmap } from './roadmap.service';
import { matchKBLI } from './kbli.service';
import { runMatchingAndSave } from './opportunity.service';
import { UpsertBusinessProfileInput } from '../../schemas/user.schema';

import { AppError } from '../../middlewares/error.middleware';
import { GetMeResponse, UpsertBusinessProfileResponse, UpdateStepStatusResponse } from '../../types/responses';
import { StepType, StepStatus } from './roadmap.service';

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

    const roadmapSteps = generateRoadmap(businessProfile);
    const roadmap = await roadmapRepository.upsertFormalizationSteps(
        supabase,
        businessProfile.id,
        roadmapSteps,
    );
    await roadmapRepository.deleteObsoleteSteps(
        supabase,
        businessProfile.id,
        roadmapSteps.map(s => s.step_type),
    );

    const completedSteps = roadmapSteps
        .filter(s => s.status === 'completed')
        .map(s => s.step_type);
    runMatchingAndSave(supabase, userId, businessProfile, completedSteps).catch(err =>
        console.error('[MatchingEngine] Failed during onboarding:', err),
    );

    return {
        business_profile: businessProfile,
        roadmap,
    };
};

export const recommendKBLI = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    env: Partial<EnvBindings>,
) => {
    const businessProfile = await userRepository.getBusinessProfileByUserId(supabase, userId);
    if (!businessProfile) throw new AppError(404, 'Business profile not found');
    if (!businessProfile.description) {
        throw new AppError(400, 'Business description is required. Please update your business profile first.');
    }
    if (businessProfile.kbli_code) {
        throw new AppError(400, 'KBLI code already exists. Use /validate endpoint instead.');
    }

    const result = await matchKBLI(supabase, env, businessProfile.description, businessProfile.business_type);
    return result;
};

export const validateKBLI = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    env: Partial<EnvBindings>,
) => {
    const businessProfile = await userRepository.getBusinessProfileByUserId(supabase, userId);
    if (!businessProfile) throw new AppError(404, 'Business profile not found');
    if (!businessProfile.description) {
        throw new AppError(400, 'Business description is required. Please update your business profile first.');
    }
    if (!businessProfile.kbli_code) {
        throw new AppError(400, 'KBLI code not found. Use /recommend endpoint instead.');
    }

    const result = await matchKBLI(supabase, env, businessProfile.description, businessProfile.business_type, businessProfile.kbli_code);
    return result;
};

export const confirmKBLI = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    kbliCode: string,
    env: Partial<EnvBindings>,
) => {
    const businessProfile = await userRepository.getBusinessProfileByUserId(supabase, userId);
    if (!businessProfile) throw new AppError(404, 'Business profile not found');

    // Update kbli_code
    const updated = await userRepository.updateKbliCode(supabase, userId, kbliCode);

    // Regenerate roadmap
    const roadmapSteps = generateRoadmap(updated);
    const roadmap = await roadmapRepository.upsertFormalizationSteps(supabase, updated.id, roadmapSteps);
    await roadmapRepository.deleteObsoleteSteps(supabase, updated.id, roadmapSteps.map(s => s.step_type));

    // Re-run matching engine
    const completedSteps = roadmapSteps
        .filter(s => s.status === 'completed')
        .map(s => s.step_type);
    runMatchingAndSave(supabase, userId, updated, completedSteps).catch(err =>
        console.error('[MatchingEngine] Failed after KBLI confirmation:', err),
    );

    return {
        business_profile: updated,
        roadmap,
    };
};


const STEP_FLAG_MAP: Partial<Record<StepType, 'has_nib' | 'has_pirt' | 'has_halal' | 'has_bpom' | 'has_merek'>> = {
    nib:     'has_nib',
    spp_irt: 'has_pirt',
    halal:   'has_halal',
    bpom:    'has_bpom',
    merek:   'has_merek',
    // sertifikat_standar has no dedicated flag — update step row only
};

export const updateStepStatus = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    stepType: StepType,
    newStatus: StepStatus,
): Promise<UpdateStepStatusResponse> => {
    const businessProfile = await userRepository.getBusinessProfileByUserId(supabase, userId);
    if (!businessProfile) throw new AppError(404, 'Business profile not found');

    const profileId = businessProfile.id;

    const currentStep = await roadmapRepository.getStepByType(supabase, profileId, stepType);
    if (!currentStep) throw new AppError(404, `Step '${stepType}' tidak ditemukan di roadmap kamu`);
    if (currentStep.status === 'locked') {
        throw new AppError(400, `Step '${stepType}' masih terkunci. Selesaikan langkah sebelumnya terlebih dahulu`);
    }

    const flagKey = STEP_FLAG_MAP[stepType];

    if (newStatus === 'completed' && flagKey) {
        // Update has_* flag → re-fetch profile → regenerate full roadmap
        await userRepository.updateBusinessProfileFlag(supabase, userId, flagKey, true);
        const updatedProfile = await userRepository.getBusinessProfileByUserId(supabase, userId);
        const roadmapSteps = generateRoadmap(updatedProfile!);
        const allSteps = await roadmapRepository.upsertFormalizationSteps(supabase, profileId, roadmapSteps);
        await roadmapRepository.deleteObsoleteSteps(supabase, profileId, roadmapSteps.map(s => s.step_type));
        const completedCount = allSteps.filter(s => s.status === 'completed').length;

        // Re-run matching engine with updated completed steps (fire-and-forget)
        const completedSteps = allSteps
            .filter(s => s.status === 'completed')
            .map(s => s.step_type);
        runMatchingAndSave(supabase, userId, updatedProfile!, completedSteps).catch(err =>
            console.error('[MatchingEngine] Failed after step completion:', err),
        );

        return {
            steps: allSteps,
            progress_percentage: Math.round((completedCount / allSteps.length) * 100),
        };
    }

    // For in_progress, or completed on sertifikat_standar (no flag) — update just the one step
    await roadmapRepository.updateStepStatus(supabase, profileId, stepType, newStatus);
    const allSteps = await roadmapRepository.getFormalizationStepsByProfileId(supabase, profileId);
    const completedCount = allSteps.filter(s => s.status === 'completed').length;
    return {
        steps: allSteps,
        progress_percentage: Math.round((completedCount / allSteps.length) * 100),
    };
};
