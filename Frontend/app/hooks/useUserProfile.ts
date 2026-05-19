import { useState, useCallback, useEffect } from "react";
import type { UserProfile } from "../components/Dashboard/types";
import { supabase } from "../lib/supabase";

export interface BusinessProfile {
  business_name: string;
  business_type: UserProfile["businessType"];
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
  onboarding_completed: boolean;
}

const BUSINESS_PROFILE_KEY = "business_profile";

const DEFAULT_BUSINESS: BusinessProfile = {
  business_name: "",
  business_type: "lainnya",
  kbli_code: "",
  description: "",
  province: "",
  city: "",
  district: "",
  production_location: "",
  employee_count: 0,
  monthly_revenue_estimate: 0,
  has_nib: false,
  has_pirt: false,
  has_halal: false,
  has_bpom: false,
  has_merek: false,
  nib_image: undefined,
  pirt_image: undefined,
  halal_image: undefined,
  bpom_image: undefined,
  merek_image: undefined,
  onboarding_completed: false,
};

function countFormalizationFlags(bp: BusinessProfile): number {
  return [bp.has_nib, bp.has_pirt, bp.has_halal, bp.has_bpom, bp.has_merek].filter(Boolean).length;
}

function computeLevelAndProgress(
  bp: BusinessProfile,
  authName: string
): Pick<UserProfile, "level" | "progressPercent"> {
  const profileFields: boolean[] = [
    !!authName,
    !!bp.business_name,
    bp.business_type !== "lainnya",
    !!bp.city,
    !!bp.province,
    !!bp.description,
    !!bp.employee_count,
    !!bp.monthly_revenue_estimate,
  ];
  const profileScore = profileFields.filter(Boolean).length / profileFields.length;
  const formalizationScore = countFormalizationFlags(bp) / 5;
  const progressPercent = Math.round((profileScore * 0.5 + formalizationScore * 0.5) * 100);

  let level: UserProfile["level"] = "STARTER";
  if (progressPercent >= 80) level = "ENTERPRISE";
  else if (progressPercent >= 60) level = "PRO";
  else if (progressPercent >= 40) level = "ESTABLISHED";
  else if (progressPercent >= 20) level = "GROWING";

  return { level, progressPercent };
}

function loadBusinessProfile(): BusinessProfile {
  try {
    const raw = localStorage.getItem(BUSINESS_PROFILE_KEY);
    if (!raw) return DEFAULT_BUSINESS;
    return { ...DEFAULT_BUSINESS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_BUSINESS;
  }
}

function saveBusinessProfile(bp: BusinessProfile) {
  try {
    localStorage.setItem(BUSINESS_PROFILE_KEY, JSON.stringify(bp));
  } catch {}
}

export function useUserProfile() {
  const [authName, setAuthName] = useState<string>("");
  const [authEmail, setAuthEmail] = useState<string>("");
  const [businessProfile, setBusinessProfileState] = useState<BusinessProfile>(loadBusinessProfile);

  useEffect(() => {
    const loadAuthFromSupabase = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        setAuthName(meta.full_name || meta.name || session.user.email || "");
        setAuthEmail(session.user.email || "");
      } else {
        setAuthName("");
        setAuthEmail("");
      }
    };

    loadAuthFromSupabase();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata || {};
        setAuthName(meta.full_name || meta.name || session.user.email || "");
        setAuthEmail(session.user.email || "");
      } else {
        setAuthName("");
        setAuthEmail("");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const computed = computeLevelAndProgress(businessProfile, authName);
  const userProfile: UserProfile = {
    name: authName || "Pengguna",
    businessName: businessProfile.business_name,
    businessType: businessProfile.business_type,
    city: businessProfile.city,
    monthlyRevenue: businessProfile.monthly_revenue_estimate
      ? `${(businessProfile.monthly_revenue_estimate / 1_000_000).toFixed(0)}jt`
      : "",
    employeeCount: businessProfile.employee_count,
    level: computed.level,
    progressPercent: computed.progressPercent,
  };

  const updateBusinessProfile = useCallback((updates: Partial<BusinessProfile>) => {
    setBusinessProfileState((prev) => {
      const next = { ...prev, ...updates };
      saveBusinessProfile(next);
      return next;
    });
  }, []);

  return {
    userProfile,
    businessProfile,
    authName,
    authEmail,
    updateBusinessProfile,
  };
}