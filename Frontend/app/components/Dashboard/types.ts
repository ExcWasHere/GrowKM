export interface UserProfile {
  name: string;
  businessName: string;
  businessType: "kuliner" | "fashion_craft" | "jasa_personal_care" | "lainnya";
  city: string;
  monthlyRevenue: string;
  employeeCount: number;
  level: "STARTER" | "GROWING" | "ESTABLISHED" | "PRO" | "ENTERPRISE";
  progressPercent: number;
}
export type StepStatus = "COMPLETED" | "UNLOCKED" | "LOCKED";
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

export type Page = "dashboard" | "roadmap" | "chat" | "scanner" | "finance";