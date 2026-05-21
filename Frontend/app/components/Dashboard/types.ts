export type BusinessType =
  | "kuliner"
  | "fashion_craft"
  | "jasa_personal_care"
  | "lainnya";

export type BusinessLevel =
  | "starter"
  | "growing"
  | "established"
  | "pro"
  | "enterprise";

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_type: BusinessType;
  kbli_code: string;
  description: string;
  province: string;
  city: string;
  district: string;
  production_location: string;
  employee_count: number;
  monthly_revenue_estimate: number;
  has_nib: boolean;
  has_pirt: boolean;
  has_halal: boolean;
  has_bpom: boolean;
  has_merek: boolean;
  nib_image?: string;
  pirt_image?: string;
  halal_image?: string;
  bpom_image?: string;
  merek_image?: string;
  level: BusinessLevel;
  score: number;
  streak_days: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export type StepType = "nib" | "spp_irt" | "halal" | "merek" | "bpom";
export type StepStatus = "locked" | "unlocked" | "in_progress" | "completed";

export interface RoadmapStep {
  id: string;
  profile_id: string;
  step_type: StepType;
  step_order: number;
  is_required: boolean;
  status: StepStatus;
  current_substep: number;
  total_substeps: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  created_at: string;
  business_profile: BusinessProfile | null;
  roadmap: RoadmapStep[];
}

export interface FormalizationStep {
  id: string;
  label: string;
  description: string;
  platform: string;
  cost: string;
  duration: string;
  status: StepStatus;
  icon: string;
}

export interface BenefitItem {
  text: string;
  unlocked: boolean;
}

export type Page =
  | "dashboard"
  | "roadmap"
  | "chat"
  | "scanner"
  | "finance"
  | "profile";