import { useState, useCallback, useEffect } from "react";
import { apiFetch } from "../lib/api";
import type { UserProfile } from "../components/Dashboard/types";

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

export type StepType = "nib" | "spp_irt" | "halal" | "bpom" | "merek";
export type StepStatus = "locked" | "unlocked" | "in_progress" | "completed";

export interface RoadmapStepRaw {
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

export interface RoadmapStep extends RoadmapStepRaw {
  label: string;
  description: string;
  cost: string;
  duration: string;
  platform: string;
  icon: string;
}

export type ProfileLoadState = "idle" | "loading" | "success" | "error";
const STEP_META: Record<StepType, Omit<RoadmapStep, keyof RoadmapStepRaw>> = {
  nib: {
    label: "NIB (Nomor Induk Berusaha)",
    description:
      "Daftarkan usahamu secara legal melalui OSS. NIB adalah syarat utama untuk semua izin usaha lainnya.",
    cost: "Gratis",
    duration: "1–3 hari kerja",
    platform: "oss.go.id",
    icon: "🏛️",
  },
  spp_irt: {
    label: "SPP-IRT / PIRT",
    description:
      "Izin produksi pangan skala rumah tangga dari Dinas Kesehatan setempat. Wajib untuk produk makanan & minuman.",
    cost: "Rp 0 – Rp 300rb",
    duration: "14–30 hari kerja",
    platform: "Dinas Kesehatan Kota/Kab",
    icon: "🍽️",
  },
  halal: {
    label: "Sertifikasi Halal",
    description:
      "Sertifikat halal dari BPJPH/MUI untuk meningkatkan kepercayaan konsumen muslim.",
    cost: "Gratis (self-declare) / Rp 650rb+",
    duration: "14–90 hari",
    platform: "ptsp.halal.go.id",
    icon: "☪️",
  },
  bpom: {
    label: "Izin Edar BPOM",
    description:
      "Nomor izin edar dari BPOM untuk produk olahan yang dijual lintas provinsi atau di ritel modern.",
    cost: "Rp 100rb – Rp 500rb",
    duration: "30–90 hari",
    platform: "e-reg.pom.go.id",
    icon: "💊",
  },
  merek: {
    label: "Pendaftaran Merek",
    description:
      "Lindungi brand usahamu secara hukum melalui DJKI Kemenkumham.",
    cost: "Rp 500rb – Rp 2jt",
    duration: "12–24 bulan",
    platform: "merek.dgip.go.id",
    icon: "™️",
  },
};

function enrichStep(raw: RoadmapStepRaw): RoadmapStep {
  const meta = STEP_META[raw.step_type] ?? {
    label: raw.step_type,
    description: "",
    cost: "—",
    duration: "—",
    platform: "—",
    icon: "📋",
  };
  return { ...raw, ...meta };
}

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
  onboarding_completed: false,
};

function getNameFromLocalStorage(): string {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return (
      parsed?.user_metadata?.name ||
      parsed?.user_metadata?.full_name ||
      parsed?.name ||
      ""
    );
  } catch {
    return "";
  }
}

function getEmailFromLocalStorage(): string {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return "";
    const parsed = JSON.parse(raw);
    return parsed?.email || parsed?.user_metadata?.email || "";
  } catch {
    return "";
  }
}

function computeLevelAndProgress(
  bp: BusinessProfile,
  authName: string,
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
  const profileScore =
    profileFields.filter(Boolean).length / profileFields.length;
  const formalizationScore =
    [bp.has_nib, bp.has_pirt, bp.has_halal, bp.has_bpom, bp.has_merek].filter(
      Boolean,
    ).length / 5;
  const progressPercent = Math.round(
    (profileScore * 0.5 + formalizationScore * 0.5) * 100,
  );

  let level: UserProfile["level"] = "STARTER";
  if (progressPercent >= 80) level = "ENTERPRISE";
  else if (progressPercent >= 60) level = "PRO";
  else if (progressPercent >= 40) level = "ESTABLISHED";
  else if (progressPercent >= 20) level = "GROWING";

  return { level, progressPercent };
}

interface GetMeResponse {
  status: string;
  message: string;
  data: {
    user: {
      id: string;
      email: string | null;
      name: string | null;
      created_at: string;
    };
    business_profile: Partial<BusinessProfile> | null;
    roadmap: RoadmapStepRaw[] | null;
  };
}

interface RoadmapStatusResponse {
  status: string;
  message: string;
  data: {
    steps: RoadmapStepRaw[];
    progress_percentage: number;
  };
}

export function useUserProfile() {
  const [authName, setAuthName]               = useState<string>(getNameFromLocalStorage);
  const [authEmail, setAuthEmail]             = useState<string>(getEmailFromLocalStorage);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(DEFAULT_BUSINESS);
  const [roadmapSteps, setRoadmapSteps]       = useState<RoadmapStep[]>([]);
  const [roadmapProgress, setRoadmapProgress] = useState(0);
  const [loadState, setLoadState]             = useState<ProfileLoadState>("idle");
  const [saveState, setSaveState]             = useState<ProfileLoadState>("idle");
  const [error, setError]                     = useState<string | null>(null);
  const fetchAll = useCallback(async () => {
    setLoadState("loading");
    setError(null);
    try {
      const res = await apiFetch("/api/users/me");
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`API ${res.status}: ${text}`);
      }
      const json: GetMeResponse = await res.json();
      const { user, business_profile, roadmap } = json.data;

      setAuthName(user.name?.trim() || getNameFromLocalStorage());
      setAuthEmail(user.email?.trim() || getEmailFromLocalStorage());
      setBusinessProfile({ ...DEFAULT_BUSINESS, ...(business_profile ?? {}) });

      if (roadmap && roadmap.length > 0) {
        const enriched = roadmap
          .slice()
          .sort((a, b) => a.step_order - b.step_order)
          .map(enrichStep);
        setRoadmapSteps(enriched);
        const completed = roadmap.filter((s) => s.status === "completed").length;
        setRoadmapProgress(Math.round((completed / roadmap.length) * 100));
      } else {
        setRoadmapSteps([]);
        setRoadmapProgress(0);
      }

      setLoadState("success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat profil";
      setError(msg);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  const computed = computeLevelAndProgress(businessProfile, authName);
  const userProfile: UserProfile = {
    name:            authName || "Pengguna",
    businessName:    businessProfile.business_name,
    businessType:    businessProfile.business_type,
    city:            businessProfile.city,
    monthlyRevenue:  businessProfile.monthly_revenue_estimate
      ? `${(businessProfile.monthly_revenue_estimate / 1_000_000).toFixed(0)}jt`
      : "",
    employeeCount:   businessProfile.employee_count,
    level:           computed.level,
    progressPercent: computed.progressPercent,
  };

  const updateBusinessProfile = useCallback(
    async (updates: Partial<BusinessProfile>): Promise<void> => {
      setSaveState("loading");
      setError(null);
      const prev = businessProfile;
      const next = { ...prev, ...updates };
      setBusinessProfile(next); // optimistic

      try {
        const res = await apiFetch("/api/users/business-profile", {
          method: "POST",
          body: JSON.stringify({
            business_name:            next.business_name            || undefined,
            business_type:            next.business_type,
            kbli_code:                next.kbli_code                || undefined,
            description:              next.description              || undefined,
            province:                 next.province                 || undefined,
            city:                     next.city                     || undefined,
            district:                 next.district                 || undefined,
            production_location:      next.production_location      || undefined,
            employee_count:           next.employee_count           || undefined,
            monthly_revenue_estimate: next.monthly_revenue_estimate || undefined,
            has_nib:                  next.has_nib,
            has_pirt:                 next.has_pirt,
            has_halal:                next.has_halal,
            has_bpom:                 next.has_bpom,
            has_merek:                next.has_merek,
            onboarding_completed:     next.onboarding_completed,
          }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => res.statusText);
          throw new Error(`API ${res.status}: ${text}`);
        }

        setSaveState("success");
      } catch (err) {
        setBusinessProfile(prev);
        const msg = err instanceof Error ? err.message : "Gagal menyimpan profil";
        setError(msg);
        setSaveState("error");
        throw err;
      }
    },
    [businessProfile],
  );

  const updateStepStatus = useCallback(
    async (stepType: StepType, status: "in_progress" | "completed") => {
      const res = await apiFetch("/api/users/roadmap/status", {
        method: "PATCH",
        body: JSON.stringify({ step_type: stepType, status }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`API ${res.status}: ${text}`);
      }
      const json: RoadmapStatusResponse = await res.json();
      const enriched = json.data.steps
        .slice()
        .sort((a, b) => a.step_order - b.step_order)
        .map(enrichStep);
      setRoadmapSteps(enriched);
      setRoadmapProgress(json.data.progress_percentage);
    },
    [],
  );

  return {
    userProfile,
    businessProfile,
    authName,
    authEmail,
    loadState,
    saveState,
    error,
    updateBusinessProfile,
    roadmapSteps,
    roadmapProgress,
    updateStepStatus,
    refetch: fetchAll,
  };
}