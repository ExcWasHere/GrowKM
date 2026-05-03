import { Database } from '../../types/database.types';

type BusinessProfile = Database['public']['Tables']['business_profiles']['Row'];
export type StepType = Database['public']['Tables']['formalization_steps']['Insert']['step_type'];
export type StepStatus = Database['public']['Tables']['formalization_steps']['Insert']['status'];

export type RoadmapStep = {
    step_type: StepType;
    step_order: number;
    is_required: boolean;
    status: StepStatus;
};

type CategoryMap = {
    required: StepType[];
    optional: StepType[];
    order: StepType[];
};

// Legality map per UMKM category
// required = must be completed | optional = recommended but non-blocking
const REGULATORY_MAP: Record<string, CategoryMap> = {
    kuliner: {
        required: ['nib', 'spp_irt', 'halal'],
        optional: ['merek', 'bpom'],
        order:    ['nib', 'spp_irt', 'halal', 'merek'],
    },
    fashion_craft: {
        required: ['nib'],
        optional: ['merek'],
        order:    ['nib', 'merek'],
    },
    jasa_personal_care: {
        required: ['nib', 'sertifikat_standar'],
        optional: ['merek'],
        order:    ['nib', 'sertifikat_standar', 'merek'],
    },
    lainnya: {
        required: ['nib'],
        optional: ['merek'],
        order:    ['nib', 'merek'],
    },
};

// Mapping step_type → has_* column in business_profiles
const FLAG_MAP: Partial<Record<StepType, keyof BusinessProfile>> = {
    nib:     'has_nib',
    spp_irt: 'has_pirt',
    halal:   'has_halal',
    bpom:    'has_bpom',
    merek:   'has_merek',
    // sertifikat_standar does not have its own flag — always unlocked after nib
};


// Output: array of steps ready to be INSERTed into formalization_steps
export const generateRoadmap = (profile: BusinessProfile): RoadmapStep[] => {
    const map = REGULATORY_MAP[profile.business_type] ?? REGULATORY_MAP['lainnya'];
    const steps: RoadmapStep[] = [];
    let prevCompleted = true;

    for (let i = 0; i < map.order.length; i++) {
        const stepType = map.order[i];
        const flagKey = FLAG_MAP[stepType];

        // Check if user already has this permit (via flag in profile)
        const alreadyDone = flagKey ? (profile[flagKey] as boolean) === true : false;

        let status: StepStatus;
        if (alreadyDone) {
            status = 'completed';
        } else if (prevCompleted) {
            status = 'unlocked'; // previous step is completed → allowed to start
        } else {
            status = 'locked';   // previous steps are not completed yet
        }

        steps.push({
            step_type: stepType,
            step_order: i + 1,
            is_required: map.required.includes(stepType),
            status,
        });

        if (!alreadyDone) prevCompleted = false;
    }

    return steps;
};
