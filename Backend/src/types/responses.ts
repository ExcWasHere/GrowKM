import { Database } from './database.types';
import { KBLIMatchResult } from '../services/business/kbli.service';
import { RoadmapStep } from '../services/business/roadmap.service';

type FormalizationStepRow = Database['public']['Tables']['formalization_steps']['Row'];

type UserRow = Database['public']['Tables']['users']['Row'];
type BusinessProfileRow = Database['public']['Tables']['business_profiles']['Row'];

/**
 * Response for GET /api/users/me
 */
export interface GetMeResponse {
    user: UserRow | null;
    business_profile: BusinessProfileRow | null;
    roadmap: RoadmapStep[] | null;
}

/**
 * Response for POST /api/users/business-profile
 */
export interface UpsertBusinessProfileResponse {
    business_profile: BusinessProfileRow;
    kbli_recommendation: KBLIMatchResult | null;
    roadmap: RoadmapStep[];
}

/**
 * Response for PATCH /api/users/roadmap/:stepType/status
 */
export interface UpdateStepStatusResponse {
    steps: FormalizationStepRow[];
    progress_percentage: number;
}
