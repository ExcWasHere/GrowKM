import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "../components/Dashboard/types";
export interface BusinessProfile {
  businessName: string;
  businessType: UserProfile["businessType"];
  city: string;
  monthlyRevenue: string;
  employeeCount: number;
  phone: string;
  email: string;
  address: string;
  description: string;
  npwp: string;
  nib: string;
  progressPercent: number;
  level: UserProfile["level"];
}

const BUSINESS_PROFILE_KEY = "business_profile";
const DEFAULT_BUSINESS: BusinessProfile = {
  businessName: "",
  businessType: "lainnya",
  city: "",
  monthlyRevenue: "",
  employeeCount: 0,
  phone: "",
  email: "",
  address: "",
  description: "",
  npwp: "",
  nib: "",
  progressPercent: 0,
  level: "STARTER",
};

function computeLevelAndProgress(bp: BusinessProfile, authName: string): Pick<BusinessProfile, "level" | "progressPercent"> {
  const fields: boolean[] = [
    !!authName,
    !!bp.businessName,
    !!bp.businessType && bp.businessType !== "lainnya",
    !!bp.city,
    !!bp.phone,
    !!bp.email,
    !!bp.address,
    !!bp.description,
    !!bp.npwp,
    !!bp.nib,
  ];
  const filled = fields.filter(Boolean).length;
  const progressPercent = Math.round((filled / fields.length) * 100);

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

function getAuthName(): string {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.name || parsed?.user_metadata?.name || "";
  } catch {
    return "";
  }
}

function getAuthEmail(): string {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.email || parsed?.user_metadata?.email || "";
  } catch {
    return "";
  }
}

export function useUserProfile() {
  const [authName] = useState<string>(getAuthName);
  const [authEmail] = useState<string>(getAuthEmail);
  const [businessProfile, setBusinessProfileState] = useState<BusinessProfile>(loadBusinessProfile);
  const computed = computeLevelAndProgress(businessProfile, authName);
  const userProfile: UserProfile = {
    name: authName || "Pengguna",
    businessName: businessProfile.businessName,
    businessType: businessProfile.businessType || "lainnya",
    city: businessProfile.city,
    monthlyRevenue: businessProfile.monthlyRevenue,
    employeeCount: businessProfile.employeeCount,
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