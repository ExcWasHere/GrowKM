import type { FormalizationStep, UserProfile, BusinessProfile, BusinessLevel } from "./types";
import type { Page } from "./types";

export const SAMPLE_USER: UserProfile = {
  id: "",
  email: "demo@example.com",
  name: "Bu Rina",
  created_at: "",
  business_profile: {
    id: "",
    user_id: "",
    business_name: "Warung Nasi Bu Rina",
    business_type: "kuliner",
    kbli_code: "",
    description: "",
    province: "Jawa Timur",
    city: "Malang",
    district: "",
    production_location: "",
    employee_count: 2,
    monthly_revenue_estimate: 10000000,
    has_nib: false,
    has_pirt: false,
    has_halal: false,
    has_bpom: false,
    has_merek: false,
    level: "growing",
    score: 0,
    streak_days: 0,
    onboarding_completed: false,
    created_at: "",
    updated_at: "",
  },
  roadmap: [],
};

export const KULINER_STEPS: FormalizationStep[] = [
  {
    id: "nib",
    label: "NIB",
    description: "Nomor Induk Berusaha — identitas resmi pelaku usaha",
    platform: "oss.go.id",
    cost: "Gratis",
    duration: "1 hari",
    status: "completed",
    icon: "🏛️",
  },
  {
    id: "spp_irt",
    label: "SPP-IRT",
    description: "Izin produksi pangan rumah tangga dari Dinkes",
    platform: "Dinas Kesehatan Kab/Kota",
    cost: "Rp 0–200rb",
    duration: "2–4 minggu",
    status: "unlocked",
    icon: "🍽️",
  },
  {
    id: "halal",
    label: "Sertifikat Halal",
    description: "Jaminan produk halal via program SEHATI",
    platform: "ptsp.halal.go.id",
    cost: "Gratis (SEHATI)",
    duration: "2–6 minggu",
    status: "locked",
    icon: "☪️",
  },
  {
    id: "merek",
    label: "Pendaftaran Merek",
    description: "Perlindungan nama & logo usaha di DJKI",
    platform: "dgip.go.id",
    cost: "Rp 500rb (tarif UMK)",
    duration: "6–9 bulan",
    status: "locked",
    icon: "™️",
  },
];

// Key sekarang lowercase sesuai BusinessLevel dari types.ts
export const LEVEL_CONFIG: Record<BusinessLevel, { label: string; color: string; range: string }> = {
  starter: {
    label: "Starter",
    color: "from-gray-400 to-gray-500",
    range: "0–25%",
  },
  growing: {
    label: "Growing",
    color: "from-amber-400 to-orange-500",
    range: "25–50%",
  },
  established: {
    label: "Established",
    color: "from-orange-500 to-red-500",
    range: "50–75%",
  },
  pro: {
    label: "Pro",
    color: "from-amber-500 to-yellow-400",
    range: "75–100%",
  },
  enterprise: {
    label: "Enterprise",
    color: "from-yellow-400 to-amber-300",
    range: "100%",
  },
};

export const FEATURE_CARDS = [
  {
    id: "roadmap",
    icon: "🗺️",
    title: "Guide to Grow",
    subtitle: "AI Compliance Copilot",
    description: "Panduan legalitas step-by-step personal untuk usahamu",
    color: "from-amber-400 to-orange-500",
    page: "roadmap" as Page,
    completed: 1,
    total: 4,
  },
  {
    id: "scanner",
    icon: "🛡️",
    title: "Compliance Scanner",
    subtitle: "Smart KBLI Matcher",
    description: "Cek apakah izin yang kamu punya sudah benar & sesuai",
    color: "from-orange-500 to-red-500",
    page: "scanner" as Page,
    completed: 0,
    total: 1,
  },
  {
    id: "finance",
    icon: "💰",
    title: "Financial Record",
    subtitle: "Catat via Chat",
    description: "Catat keuangan lewat chat, auto-generate laporan bank",
    color: "from-yellow-400 to-amber-500",
    page: "finance" as Page,
    completed: 12,
    total: 30,
  },
  {
    id: "chat",
    icon: "🤖",
    title: "Tanya Lexa AI",
    subtitle: "Regulasi & Perizinan",
    description: "Tanya apa saja soal proses perizinan usahamu",
    color: "from-amber-500 to-orange-400",
    page: "chat" as Page,
    completed: 3,
    total: 5,
  },
];

// Sekarang pakai has_nib, has_pirt dll — sesuai BusinessProfile baru
export function getBadges(bp: BusinessProfile) {
  return [
    { icon: "🏛️", name: "Punya NIB",       earned: bp.has_nib   },
    { icon: "🍽️", name: "SPP-IRT / PIRT",  earned: bp.has_pirt  },
    { icon: "☪️", name: "Sertifikat Halal", earned: bp.has_halal },
    { icon: "💊", name: "Izin BPOM",        earned: bp.has_bpom  },
    { icon: "™️", name: "Merek Terdaftar",  earned: bp.has_merek },
  ];
}

export const RECENT_ACTIONS = [
  { label: "Guide to Grow",      detail: "NIB selesai ✅",    completed: true  },
  { label: "Compliance Scanner", detail: "KBLI dicek",        completed: true  },
  { label: "SPP-IRT",            detail: "Sedang diproses",   completed: false },
];