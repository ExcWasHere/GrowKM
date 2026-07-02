import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  User,
  Building2,
  MapPin,
  Mail,
  FileText,
  Briefcase,
  Edit3,
  Save,
  X,
  CheckCircle,
  Users,
  TrendingUp,
  Star,
  Award,
  ChevronDown,
  Upload,
  AlertCircle,
  Loader2,
  Tag,
  ShieldCheck,
  Sparkles,
  Search,
  Check,
} from "lucide-react";
import type { UserProfile, StepType } from "../../Dashboard/types";
import type { BusinessProfile } from "../../../hooks/useUserProfile";
import { apiFetch } from "../../../lib/api";

interface ProfilePageProps {
  user: UserProfile;
  businessProfile: BusinessProfile;
  authEmail: string;
  saveState?: "idle" | "loading" | "success" | "error";
  onSave: (updates: Partial<BusinessProfile>) => Promise<void>;
  onRoadmapRefresh?: () => void;
  roadmapProgress: number;
  onUploadDocument: (
    stepType: StepType,
    file: File,
  ) => Promise<{ path: string; signed_url: string }>;
  onGetDocumentSignedUrl: (stepType: StepType) => Promise<string | null>;
}

const LEVEL_CONFIG: Record<string, { label: string; color: string }> = {
  STARTER: { label: "Starter", color: "from-gray-400 to-gray-500" },
  GROWING: { label: "Growing", color: "from-green-400 to-emerald-500" },
  ESTABLISHED: { label: "Established", color: "from-blue-400 to-blue-600" },
  PRO: { label: "Pro", color: "from-amber-400 to-orange-500" },
  ENTERPRISE: { label: "Enterprise", color: "from-purple-400 to-purple-600" },
};

const BUSINESS_TYPES: { value: BusinessProfile["business_type"]; label: string }[] =
  [
    { value: "kuliner", label: "Kuliner & F&B" },
    { value: "fashion_craft", label: "Fashion & Kerajinan" },
    { value: "jasa_personal_care", label: "Jasa & Personal Care" },
    { value: "lainnya", label: "Lainnya" },
  ];
const WILAYAH_API_BASE = "https://emsifa.github.io/api-wilayah-indonesia/api";

interface WilayahOption {
  id: string;
  name: string;
}

function titleCase(raw: string): string {
  return raw
    .toLowerCase()
    .split(" ")
    .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function useWilayahList(url: string | null): {
  data: WilayahOption[];
  loading: boolean;
  error: boolean;
} {
  const [data, setData] = useState<WilayahOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) {
      setData([]);
      setError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`Gagal memuat data (${res.status})`);
        return res.json();
      })
      .then((json: { id: string; name: string }[]) => {
        if (cancelled) return;
        const normalized = json
          .map((item) => ({ id: item.id, name: titleCase(item.name) }))
          .sort((a, b) => a.name.localeCompare(b.name, "id"));
        setData(normalized);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setData([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, loading, error };
}

interface EditableDraft {
  business_name: string;
  business_type: BusinessProfile["business_type"];
  kbli_code: string;
  description: string;
  province: string;
  city: string;
  district: string;
  production_location: string;
  employee_count: string;
  monthly_revenue_estimate: string;
  has_nib: boolean;
  has_pirt: boolean;
  has_halal: boolean;
  has_bpom: boolean;
  has_merek: boolean;
}

function bpToDraft(bp: BusinessProfile): EditableDraft {
  return {
    business_name: bp.business_name,
    business_type: bp.business_type,
    kbli_code: bp.kbli_code,
    description: bp.description,
    province: bp.province,
    city: bp.city,
    district: bp.district,
    production_location: bp.production_location,
    employee_count: bp.employee_count ? String(bp.employee_count) : "",
    monthly_revenue_estimate: bp.monthly_revenue_estimate
      ? String(bp.monthly_revenue_estimate)
      : "",
    has_nib: bp.has_nib,
    has_pirt: bp.has_pirt,
    has_halal: bp.has_halal,
    has_bpom: bp.has_bpom,
    has_merek: bp.has_merek,
  };
}

function draftToBp(draft: EditableDraft): Partial<BusinessProfile> {
  return {
    business_name: draft.business_name,
    business_type: draft.business_type,
    kbli_code: draft.kbli_code,
    description: draft.description,
    province: draft.province,
    city: draft.city,
    district: draft.district,
    production_location: draft.production_location,
    employee_count: draft.employee_count ? parseInt(draft.employee_count, 10) : 0,
    monthly_revenue_estimate: draft.monthly_revenue_estimate
      ? parseInt(draft.monthly_revenue_estimate, 10)
      : 0,
    has_nib: draft.has_nib,
    has_pirt: draft.has_pirt,
    has_halal: draft.has_halal,
    has_bpom: draft.has_bpom,
    has_merek: draft.has_merek,
  };
}

function formatRevenue(val: number): string {
  if (!val) return "—";
  if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1)} M`;
  if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(0)} jt`;
  return `Rp ${val.toLocaleString("id-ID")}`;
}

interface KbliModalProps {
  kbliCode: string;
  onConfirm: () => Promise<void>;
  onSkip: () => void;
}

interface DocumentPreviewModalProps {
  url: string;
  label: string;
  onClose: () => void;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  url,
  label,
  onClose,
}) => {
  const isPdf = url.toLowerCase().includes(".pdf") || url.includes("application/pdf");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-amber-300" />
          <span className="font-bold text-sm">Bukti {label}</span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
          >
            Buka di tab baru
          </a>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
            aria-label="Tutup preview"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className="relative max-w-5xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {isPdf ? (
          <iframe
            src={url}
            title={`Preview ${label}`}
            className="w-full h-[85vh] rounded-lg bg-white shadow-2xl"
          />
        ) : (
          <img
            src={url}
            alt={`Bukti ${label}`}
            className="max-w-full max-h-[85vh] mx-auto rounded-lg shadow-2xl object-contain"
          />
        )}
      </div>
    </div>
  );
};

const KbliConfirmModal: React.FC<KbliModalProps> = ({
  kbliCode,
  onConfirm,
  onSkip,
}) => {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm();
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-500" />

        <div className="p-6">
          {/* Icon + title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-base leading-tight">
                Kode KBLI Ditemukan
              </h3>
              <p className="text-xs text-gray-500">dari AI berdasarkan deskripsi usahamu</p>
            </div>
          </div>

          {/* KBLI badge */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-center">
            <p className="text-xs text-amber-600 font-semibold uppercase tracking-widest mb-1">
              Kode KBLI
            </p>
            <p className="text-4xl font-black text-amber-500 tracking-widest">
              {kbliCode}
            </p>
          </div>

          <p className="text-xs text-gray-500 mb-5 text-center leading-relaxed">
            Konfirmasi kode ini untuk mengaktifkan roadmap legalitas yang sesuai dengan jenis usahamu.
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onSkip}
              disabled={confirming}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Lewati
            </button>
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-70"
            >
              {confirming ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  Konfirmasi
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  businessProfile,
  authEmail,
  saveState = "idle",
  onSave,
  onRoadmapRefresh,
  roadmapProgress,
  onUploadDocument,
  onGetDocumentSignedUrl,
}) => {
  const levelCfg = LEVEL_CONFIG[businessProfile.level?.toUpperCase() as keyof typeof LEVEL_CONFIG] ?? LEVEL_CONFIG.STARTER;
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingKbli, setPendingKbli] = useState<string | null>(null);
  const [kbliConfirmed, setKbliConfirmed] = useState(false);
  const [draft, setDraft] = useState<EditableDraft>(() =>
    bpToDraft(businessProfile),
  );
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [signedUrls, setSignedUrls] = useState<Partial<Record<StepType, string>>>({});
  const [uploadingStep, setUploadingStep] = useState<StepType | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState<string>("");

  const prevBp = useRef(businessProfile);
  if (prevBp.current !== businessProfile && !isEditing) {
    prevBp.current = businessProfile;
    setDraft(bpToDraft(businessProfile));
  }

  const { data: provinces, loading: loadingProvinces } = useWilayahList(
    `${WILAYAH_API_BASE}/provinces.json`,
  );

  const selectedProvinceId = useMemo(() => {
    const q = draft.province.trim().toLowerCase();
    if (!q) return null;
    return provinces.find((p) => p.name.toLowerCase() === q)?.id ?? null;
  }, [provinces, draft.province]);

  const { data: regencies, loading: loadingRegencies } = useWilayahList(
    selectedProvinceId
      ? `${WILAYAH_API_BASE}/regencies/${selectedProvinceId}.json`
      : null,
  );

  const selectedRegencyId = useMemo(() => {
    const q = draft.city.trim().toLowerCase();
    if (!q) return null;
    return regencies.find((r) => r.name.toLowerCase() === q)?.id ?? null;
  }, [regencies, draft.city]);

  const { data: districts, loading: loadingDistricts } = useWilayahList(
    selectedRegencyId
      ? `${WILAYAH_API_BASE}/districts/${selectedRegencyId}.json`
      : null,
  );

  const handleProvinceSelect = (name: string) => {
    setDraft((prev) => ({ ...prev, province: name, city: "", district: "" }));
  };
  const handleCitySelect = (name: string) => {
    setDraft((prev) => ({ ...prev, city: name, district: "" }));
  };
  const handleDistrictSelect = (name: string) => {
    setDraft((prev) => ({ ...prev, district: name }));
  };

  useEffect(() => {
    const pairs: [StepType, string | null | undefined][] = [
      ["nib", businessProfile.nib_image_path],
      ["spp_irt", businessProfile.pirt_image_path],
      ["halal", businessProfile.halal_image_path],
      ["bpom", businessProfile.bpom_image_path],
      ["merek", businessProfile.merek_image_path],
    ];
    pairs.forEach(async ([step, path]) => {
      if (path && !signedUrls[step]) {
        const url = await onGetDocumentSignedUrl(step);
        if (url) setSignedUrls((prev) => ({ ...prev, [step]: url }));
      }
    });
  }, [
    businessProfile.nib_image_path,
    businessProfile.pirt_image_path,
    businessProfile.halal_image_path,
    businessProfile.bpom_image_path,
    businessProfile.merek_image_path,
    onGetDocumentSignedUrl,
    signedUrls,
  ]);

  const handleEdit = () => {
    setDraft(bpToDraft(businessProfile));
    setIsEditing(true);
    setSaved(false);
    setSaveError(null);
    setKbliConfirmed(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave(draftToBp(draft));
      const res = await apiFetch("/api/users/me");
      if (res.ok) {
        const freshProfile: BusinessProfile = await res.json();
        const aiKbli = freshProfile.kbli_code;
        if (aiKbli && aiKbli !== draft.kbli_code) {
          setPendingKbli(aiKbli);
          setDraft((prev) => ({ ...prev, kbli_code: aiKbli }));
        } else {
          setIsEditing(false);
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        }
      } else {
        setIsEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal menyimpan profil. Coba lagi.";
      setSaveError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(bpToDraft(businessProfile));
    setIsEditing(false);
    setSaveError(null);
    setPendingKbli(null);
  };
  const handleKbliConfirm = async () => {
    if (!pendingKbli) return;
    const res = await apiFetch("/api/users/business-profile/kbli", {
      method: "PATCH",
      body: JSON.stringify({ kbli_code: pendingKbli }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message ?? "Gagal menyimpan kode KBLI");
    }

    setPendingKbli(null);
    setKbliConfirmed(true);
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    onRoadmapRefresh?.();
  };

  const handleKbliSkip = () => {
    setPendingKbli(null);
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const set = (field: keyof EditableDraft, value: string | boolean) =>
    setDraft((prev) => ({ ...prev, [field]: value }));

  const completionFields = [
    user.name,
    authEmail,
    businessProfile.business_name,
    businessProfile.business_type !== "lainnya" ? businessProfile.business_type : "",
    businessProfile.province,
    businessProfile.city,
    businessProfile.description,
    businessProfile.employee_count ? "filled" : "",
    businessProfile.monthly_revenue_estimate ? "filled" : "",
  ];
  const completionPct = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100,
  );

  const formalizationCount = [
    businessProfile.has_nib,
    businessProfile.has_pirt,
    businessProfile.has_halal,
    businessProfile.has_bpom,
    businessProfile.has_merek,
  ].filter(Boolean).length;

  const handleCertFileChange = async (
    stepType: StepType,
    certKey: keyof EditableDraft,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingStep(stepType);
    setSaveError(null);
    try {
      const { signed_url } = await onUploadDocument(stepType, file);
      setSignedUrls((prev) => ({ ...prev, [stepType]: signed_url }));
      setDraft((prev) => ({ ...prev, [certKey]: true }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload gagal";
      setSaveError(msg);
    } finally {
      setUploadingStep(null);
      e.target.value = "";
    }
  };

  return (
    <>
      {/* KBLI Confirmation Modal */}
      {pendingKbli && (
        <KbliConfirmModal
          kbliCode={pendingKbli}
          onConfirm={handleKbliConfirm}
          onSkip={handleKbliSkip}
        />
      )}

      {/* Document Preview Lightbox */}
      {previewUrl && (
        <DocumentPreviewModal
          url={previewUrl}
          label={previewLabel}
          onClose={() => {
            setPreviewUrl(null);
            setPreviewLabel("");
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 space-y-4 md:space-y-6">
          {/* Avatar + Level */}
          <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
            <div className="p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full border-4 border-amber-100 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h4 className="font-bold text-lg text-gray-800 mb-0.5">
                {user.name}
              </h4>
              <p className="text-sm text-gray-500 font-medium mb-1">
                {businessProfile.business_name || "Belum ada nama usaha"}
              </p>
              <p className="text-xs text-gray-400 mb-4">
                {authEmail}
                {businessProfile.city && ` • ${businessProfile.city}`}
              </p>

              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${levelCfg.color} text-white text-sm font-bold shadow-md mb-5`}
              >
                <span>{levelCfg.label}</span>
              </div>

              {/* Kelengkapan profil */}
              <div className="w-full bg-amber-50 rounded-lg border border-amber-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                    Kelengkapan Profil
                  </span>
                  <span className="text-sm font-black text-amber-500">
                    {completionPct}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
                {completionPct < 100 && (
                  <p className="text-[10px] text-gray-400 mt-2">
                    Lengkapi profil untuk meningkatkan kepercayaan mitra bisnis.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Statistik ringkas */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-sm p-5">
            <h3 className="text-xs font-bold text-orange-900 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Star size={14} /> Ringkasan Usaha
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={<Users size={24} className="text-amber-500" />}
                label="Karyawan"
                value={
                  businessProfile.employee_count
                    ? `${businessProfile.employee_count} org`
                    : "—"
                }
              />
              <StatCard
                icon={<TrendingUp size={24} className="text-amber-500" />}
                label="Omzet"
                value={formatRevenue(businessProfile.monthly_revenue_estimate)}
              />
              <StatCard
                icon={<Tag size={24} className="text-amber-500" />}
                label="Kode KBLI"
                value={businessProfile.kbli_code || "—"}
              />
              <StatCard
                icon={<ShieldCheck size={24} className="text-amber-500" />}
                label="Formalisasi"
                value={`${formalizationCount}/5`}
              />
            </div>
          </div>

          {/* Progres Formalisasi */}
          <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-5">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-amber-500" /> Progres
              Formalisasi
            </h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Tingkat Formalisasi</span>
              <span className="font-black text-2xl text-amber-500">
                {roadmapProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
              <div
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${roadmapProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              Selesaikan langkah formalisasi untuk naik level dan mendapat akses
              pembiayaan lebih mudah.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 space-y-4 md:space-y-6">
          {/* Success toast */}
          {saved && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 shadow-sm">
              <CheckCircle size={18} className="text-green-500 shrink-0" />
              <p className="text-sm font-semibold text-green-700">
                {kbliConfirmed
                  ? "Profil & kode KBLI berhasil disimpan! Roadmap telah diperbarui."
                  : "Profil berhasil disimpan!"}
              </p>
            </div>
          )}

          {/* Error toast */}
          {saveError && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 shadow-sm">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-sm font-semibold text-red-700">{saveError}</p>
              <button
                onClick={() => setSaveError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* INFORMASI AKUN */}
          <SectionCard
            title="Informasi Akun"
            icon={<User size={16} className="text-amber-500" />}
            action={
              <span className="text-[10px] text-gray-400 italic px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                Dikelola di pengaturan akun
              </span>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadOnlyField
                label="Nama Pemilik"
                icon={<User size={14} />}
                value={user.name}
              />
              <ReadOnlyField
                label="Email"
                icon={<Mail size={14} />}
                value={authEmail || "—"}
              />
            </div>
          </SectionCard>

          {/* INFORMASI USAHA */}
          <SectionCard
            title="Informasi Usaha"
            icon={<Building2 size={16} className="text-amber-500" />}
            action={
              !isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                >
                  <Edit3 size={13} /> Edit Profil
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X size={13} /> Batal
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-70"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />{" "}
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={13} /> Simpan
                      </>
                    )}
                  </button>
                </div>
              )
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Nama Usaha"
                icon={<Building2 size={14} />}
                value={draft.business_name}
                editing={isEditing}
                onChange={(v) => set("business_name", v)}
                placeholder="Nama usaha / brand"
              />
              <SelectField
                label="Jenis Usaha"
                icon={<Briefcase size={14} />}
                value={draft.business_type}
                editing={isEditing}
                onChange={(v) => set("business_type", v)}
                options={BUSINESS_TYPES}
              />
              <WilayahSelect
                label="Provinsi"
                icon={<MapPin size={14} />}
                value={draft.province}
                options={provinces}
                loading={loadingProvinces}
                editing={isEditing}
                placeholder="Cari provinsi..."
                onSelect={handleProvinceSelect}
              />
              <WilayahSelect
                label="Kota / Kabupaten"
                icon={<MapPin size={14} />}
                value={draft.city}
                options={regencies}
                loading={loadingRegencies}
                editing={isEditing}
                disabled={!draft.province}
                disabledHint="Pilih provinsi dulu"
                placeholder="Cari kota / kabupaten..."
                onSelect={handleCitySelect}
              />
              <WilayahSelect
                label="Kecamatan"
                icon={<MapPin size={14} />}
                value={draft.district}
                options={districts}
                loading={loadingDistricts}
                editing={isEditing}
                disabled={!draft.city}
                disabledHint="Pilih kota / kabupaten dulu"
                placeholder="Cari kecamatan..."
                onSelect={handleDistrictSelect}
              />
              <Field
                label="Lokasi Produksi"
                icon={<MapPin size={14} />}
                value={draft.production_location}
                editing={isEditing}
                onChange={(v) => set("production_location", v)}
                placeholder="Contoh: Dapur rumah"
              />
              <Field
                label="Jumlah Karyawan"
                icon={<Users size={14} />}
                value={draft.employee_count}
                editing={isEditing}
                onChange={(v) => set("employee_count", v.replace(/\D/, ""))}
                placeholder="Contoh: 3"
                inputMode="numeric"
              />
              <Field
                label="Omzet per Bulan (Rp)"
                icon={<TrendingUp size={14} />}
                value={draft.monthly_revenue_estimate}
                editing={isEditing}
                onChange={(v) =>
                  set("monthly_revenue_estimate", v.replace(/\D/, ""))
                }
                placeholder="Contoh: 10000000"
                inputMode="numeric"
                hint={
                  draft.monthly_revenue_estimate
                    ? formatRevenue(parseInt(draft.monthly_revenue_estimate, 10))
                    : undefined
                }
              />
              <div className="md:col-span-2">
                <Field
                  label="Deskripsi Usaha"
                  icon={<FileText size={14} />}
                  value={draft.description}
                  editing={isEditing}
                  onChange={(v) => set("description", v)}
                  placeholder="Ceritakan usaha Anda secara singkat..."
                  multiline
                />
              </div>
              <div className="md:col-span-2">
                <Field
                  label="Kode KBLI"
                  icon={<FileText size={14} />}
                  value={draft.kbli_code}
                  editing={isEditing}
                  onChange={(v) => set("kbli_code", v)}
                />
              </div>
            </div>
          </SectionCard>

          {/* STATUS FORMALISASI */}
          <SectionCard
            title="Status Formalisasi"
            icon={<Award size={16} className="text-amber-500" />}
            subtitle="Centang izin yang sudah kamu miliki & unggah buktinya"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(
                [
                  { key: "has_nib",   stepType: "nib",     label: "NIB",        desc: "Nomor Induk Berusaha",       icon: "🏛️" },
                  { key: "has_pirt",  stepType: "spp_irt", label: "SPP-IRT / PIRT", desc: "Izin pangan rumah tangga", icon: "🍽️" },
                  { key: "has_halal", stepType: "halal",   label: "Halal",       desc: "Sertifikat halal MUI / BPJPH", icon: "☪️" },
                  { key: "has_bpom",  stepType: "bpom",    label: "BPOM",        desc: "Izin edar BPOM",             icon: "💊" },
                  { key: "has_merek", stepType: "merek",   label: "Merek",       desc: "Pendaftaran merek DJKI",      icon: "™️" },
                ] as {
                  key: keyof BusinessProfile;
                  stepType: StepType;
                  label: string;
                  desc: string;
                  icon: string;
                }[]
              ).map(({ key, stepType, label, desc, icon }) => {
                const checked = isEditing
                  ? (draft[key as keyof EditableDraft] as boolean)
                  : (businessProfile[key] as boolean);
                const signedUrl = signedUrls[stepType];
                const isUploading = uploadingStep === stepType;
                const inputId = `file-input-${stepType}`;

                return (
                  <div
                    key={key}
                    className={`flex flex-col gap-3 p-3 rounded-lg border transition-all ${
                      checked ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <button
                      type="button"
                      disabled={!isEditing}
                      onClick={() => isEditing && set(key as keyof EditableDraft, !checked)}
                      className="flex items-center gap-3 text-left w-full"
                    >
                      <span className="text-xl">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800">{label}</p>
                        <p className="text-[10px] text-gray-500 truncate">{desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          checked ? "bg-green-500 border-green-500" : "bg-white border-gray-300"
                        }`}
                      >
                        {checked && <CheckCircle size={12} className="text-white" />}
                      </div>
                    </button>

                    {isEditing && (
                      <>
                        {isUploading ? (
                          <div className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-amber-300 rounded-lg py-3 text-xs text-amber-600 bg-amber-50">
                            <Loader2 size={16} className="animate-spin" />
                            <span>Mengunggah...</span>
                          </div>
                        ) : signedUrl ? (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewUrl(signedUrl);
                                setPreviewLabel(label);
                              }}
                              className="block w-full group/preview"
                              title="Klik untuk preview"
                            >
                              <img
                                src={signedUrl}
                                alt={`Bukti ${label}`}
                                className="w-full h-20 object-cover rounded-lg border border-green-200 group-hover/preview:border-amber-400 transition-colors"
                              />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fileInputRefs.current[stepType]?.click();
                              }}
                              className="absolute top-1 right-1 w-7 h-7 flex items-center justify-center bg-white/90 hover:bg-amber-500 hover:text-white text-amber-600 rounded-full shadow-md border border-amber-200 transition-colors"
                              title="Ganti file"
                            >
                              <Upload size={12} />
                            </button>
                            <p className="text-[10px] text-green-600 font-semibold mt-1 text-center">
                              Klik gambar untuk preview
                            </p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[stepType]?.click()}
                            className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-gray-300 rounded-lg py-3 text-xs text-gray-400 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 transition-all"
                          >
                            <Upload size={16} />
                            <span>Unggah bukti sertifikat</span>
                            <span className="text-[10px]">JPG, PNG, WEBP, PDF</span>
                          </button>
                        )}
                        <input
                          id={inputId}
                          ref={(el) => { fileInputRefs.current[stepType] = el; }}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          className="hidden"
                          onChange={(e) => handleCertFileChange(stepType, key as keyof EditableDraft, e)}
                        />
                      </>
                    )}

                    {!isEditing && signedUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(signedUrl);
                          setPreviewLabel(label);
                        }}
                        className="block w-full"
                      >
                        <img
                          src={signedUrl}
                          alt={`Bukti ${label}`}
                          className="w-full h-16 object-cover rounded-lg border border-green-200 hover:border-amber-400 transition-colors cursor-zoom-in"
                        />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {!isEditing && (
              <p className="text-[11px] text-gray-400 mt-3">
                Klik{" "}
                <span className="font-semibold text-amber-600">Edit Profil</span>{" "}
                di atas untuk memperbarui status dan unggah bukti sertifikat.
              </p>
            )}
          </SectionCard>
        </div>
      </div>
    </>
  );
};

const SectionCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ title, icon, action, subtitle, children }) => (
  <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100">
      <div>
        <h2 className="font-bold text-base text-gray-800 flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="bg-white rounded-lg border border-amber-100 p-3 text-center shadow-sm">
    <div className="flex justify-center mb-1">{icon}</div>
    <p className="text-sm font-black text-gray-800 truncate">{value}</p>
    <p className="text-[10px] text-gray-500 leading-tight">{label}</p>
  </div>
);

const ReadOnlyField: React.FC<{
  label: string;
  icon: React.ReactNode;
  value: string;
}> = ({ label, icon, value }) => (
  <div>
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
      <span className="text-amber-400">{icon}</span>
      {label}
    </label>
    <div className="px-3 py-2 rounded-lg border bg-gray-50 border-gray-100 text-sm font-medium text-gray-600">
      {value}
    </div>
  </div>
);

const Field: React.FC<{
  label: string;
  icon: React.ReactNode;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  hint?: string;
}> = ({
  label,
  icon,
  value,
  editing,
  onChange,
  placeholder = "",
  multiline = false,
  inputMode,
  hint,
}) => (
  <div>
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
      <span className="text-amber-400">{icon}</span>
      {label}
    </label>
    {editing ? (
      <>
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-amber-200 text-sm text-gray-800 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300 font-medium resize-none"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            inputMode={inputMode}
            className="w-full px-3 py-2 rounded-lg border border-amber-200 text-sm text-gray-800 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300 font-medium"
          />
        )}
        {hint && <p className="text-[10px] text-amber-600 mt-1">{hint}</p>}
      </>
    ) : (
      <div
        className={`px-3 py-2 rounded-lg border text-sm font-medium ${
          value
            ? "bg-white border-amber-100 text-gray-800"
            : "bg-gray-50 border-gray-100 text-gray-400 italic"
        }`}
      >
        {value || "Belum diisi"}
      </div>
    )}
  </div>
);

const SelectField: React.FC<{
  label: string;
  icon: React.ReactNode;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, icon, value, editing, onChange, options }) => {
  const display = options.find((o) => o.value === value)?.label || value;
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
        <span className="text-amber-400">{icon}</span>
        {label}
      </label>
      {editing ? (
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full appearance-none px-3 py-2 pr-8 rounded-lg border border-amber-200 text-sm text-gray-800 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300 font-medium"
          >
            <option value="">Pilih {label}</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        </div>
      ) : (
        <div
          className={`px-3 py-2 rounded-lg border text-sm font-medium ${
            value
              ? "bg-white border-amber-100 text-gray-800"
              : "bg-gray-50 border-gray-100 text-gray-400 italic"
          }`}
        >
          {display || "Belum diisi"}
        </div>
      )}
    </div>
  );
};

const WilayahSelect: React.FC<{
  label: string;
  icon: React.ReactNode;
  value: string;
  options: WilayahOption[];
  loading: boolean;
  editing: boolean;
  disabled?: boolean;
  disabledHint?: string;
  placeholder?: string;
  onSelect: (name: string) => void;
}> = ({
  label,
  icon,
  value,
  options,
  loading,
  editing,
  disabled = false,
  disabledHint,
  placeholder = "Cari...",
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const onClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    const t = setTimeout(() => searchRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
      clearTimeout(t);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, query]);

  if (!editing) {
    return (
      <div>
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
          <span className="text-amber-400">{icon}</span>
          {label}
        </label>
        <div
          className={`px-3 py-2 rounded-lg border text-sm font-medium ${
            value
              ? "bg-white border-amber-100 text-gray-800"
              : "bg-gray-50 border-gray-100 text-gray-400 italic"
          }`}
        >
          {value || "Belum diisi"}
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
        <span className="text-amber-400">{icon}</span>
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm font-medium text-left transition-colors ${
          disabled
            ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
            : open
            ? "bg-amber-50 border-amber-300 ring-2 ring-amber-300 text-gray-800"
            : "bg-amber-50 border-amber-200 text-gray-800 hover:border-amber-300"
        }`}
      >
        <span className={`truncate ${!value && !disabled ? "text-gray-400 italic" : ""}`}>
          {disabled ? disabledHint : value || `Pilih ${label.toLowerCase()}`}
        </span>
        {loading ? (
          <Loader2 size={14} className="animate-spin text-amber-500 shrink-0" />
        ) : (
          <ChevronDown
            size={14}
            className={`text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && !disabled && (
        <div className="absolute z-20 mt-1.5 w-full bg-white rounded-xl border border-amber-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-amber-100 bg-amber-50/50">
            <Search size={14} className="text-amber-400 shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
            />
          </div>

          <div className="max-h-56 overflow-y-auto py-1">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-xs text-gray-400">
                <Loader2 size={14} className="animate-spin" />
                Memuat data...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">
                Tidak ditemukan
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected =
                  opt.name.toLowerCase() === value.trim().toLowerCase();
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      onSelect(opt.name);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors ${
                      isSelected
                        ? "bg-amber-100 text-amber-700 font-bold"
                        : "text-gray-700 hover:bg-amber-50"
                    }`}
                  >
                    <span className="truncate">{opt.name}</span>
                    {isSelected && (
                      <Check size={14} className="text-amber-500 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};