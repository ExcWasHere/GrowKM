import { useState, useCallback, useEffect } from "react";
import { apiFetch } from "../lib/api";
import type {
  UserProfile,
  BusinessProfile,
  RoadmapStep,
  StepType,
  StepStatus,
} from "../components/Dashboard/types";

// ─── Re-export BusinessProfile so existing imports don't break ────────────────
export type { BusinessProfile };

// ─── Re-export enriched step type (UI layer) ─────────────────────────────────

export interface RoadmapStepEnriched extends RoadmapStep {
  label: string;
  description: string;
  cost: string;
  duration: string;
  platform: string;
  icon: string;
}

// ─── Local default ────────────────────────────────────────────────────────────

const DEFAULT_BUSINESS: BusinessProfile = {
  id: "",
  user_id: "",
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
  level: "starter",
  score: 0,
  streak_days: 0,
  onboarding_completed: false,
  created_at: "",
  updated_at: "",
};

// ─── Step metadata (UI enrichment) ───────────────────────────────────────────

const STEP_META: Record<
  StepType,
  Omit<RoadmapStepEnriched, keyof RoadmapStep>
> = {
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

function enrichStep(raw: RoadmapStep): RoadmapStepEnriched {
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

// ─── localStorage helpers ─────────────────────────────────────────────────────

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

// ─── API response shapes ──────────────────────────────────────────────────────

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
    roadmap: RoadmapStep[] | null;
  };
}

interface RoadmapStatusResponse {
  status: string;
  message: string;
  data: {
    steps: RoadmapStep[];
    progress_percentage: number;
  };
}

// ─── Load / save state ────────────────────────────────────────────────────────

export type ProfileLoadState = "idle" | "loading" | "success" | "error";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useUserProfile() {
  const [authName, setAuthName] = useState<string>(getNameFromLocalStorage);
  const [authEmail, setAuthEmail] = useState<string>(getEmailFromLocalStorage);
  const [businessProfile, setBusinessProfile] =
    useState<BusinessProfile>(DEFAULT_BUSINESS);
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapStepEnriched[]>([]);
  const [roadmapProgress, setRoadmapProgress] = useState(0);
  const [loadState, setLoadState] = useState<ProfileLoadState>("idle");
  const [saveState, setSaveState] = useState<ProfileLoadState>("idle");
  const [error, setError] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

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

      setLoadState("success"); // ← fix: dipindah ke luar blok if/else
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal memuat profil";
      setError(msg);
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Derived UserProfile (buat di-pass ke komponen) ─────────────────────────

  const userProfile: UserProfile = {
    id: businessProfile.user_id,
    email: authEmail,
    name: authName || "Pengguna",
    created_at: businessProfile.created_at,
    business_profile: businessProfile.id ? businessProfile : null,
    roadmap: roadmapSteps,
  };

  // ── Update business profile ────────────────────────────────────────────────

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
            business_name: next.business_name || undefined,
            business_type: next.business_type,
            kbli_code: next.kbli_code || undefined,
            description: next.description || undefined,
            province: next.province || undefined,
            city: next.city || undefined,
            district: next.district || undefined,
            production_location: next.production_location || undefined,
            employee_count: next.employee_count || undefined,
            monthly_revenue_estimate: next.monthly_revenue_estimate || undefined,
            has_nib: next.has_nib,
            has_pirt: next.has_pirt,
            has_halal: next.has_halal,
            has_bpom: next.has_bpom,
            has_merek: next.has_merek,
            onboarding_completed: next.onboarding_completed,
          }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => res.statusText);
          throw new Error(`API ${res.status}: ${text}`);
        }

        setSaveState("success");
      } catch (err) {
        setBusinessProfile(prev); // rollback
        const msg =
          err instanceof Error ? err.message : "Gagal menyimpan profil";
        setError(msg);
        setSaveState("error");
        throw err;
      }
    },
    [businessProfile],
  );

  // ── Update roadmap step status ─────────────────────────────────────────────

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