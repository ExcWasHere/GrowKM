import React, { useState } from "react";
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
} from "lucide-react";
import type { UserProfile } from "../../Dashboard/types";
import type { BusinessProfile } from "../../../hooks/useUserProfile";

interface ProfilePageProps {
  user: UserProfile;
  businessProfile: BusinessProfile;
  authEmail: string;
  onSave: (updates: Partial<BusinessProfile>) => void;
}

const LEVEL_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  STARTER:     { emoji: "⭐", label: "Starter",     color: "from-gray-400 to-gray-500" },
  GROWING:     { emoji: "🌱", label: "Growing",     color: "from-green-400 to-emerald-500" },
  ESTABLISHED: { emoji: "🏢", label: "Established", color: "from-blue-400 to-blue-600" },
  PRO:         { emoji: "🏆", label: "Pro",         color: "from-amber-400 to-orange-500" },
  ENTERPRISE:  { emoji: "💎", label: "Enterprise",  color: "from-purple-400 to-purple-600" },
};

const BUSINESS_TYPES: { value: UserProfile["businessType"]; label: string }[] = [
  { value: "kuliner",            label: "Kuliner & F&B" },
  { value: "fashion_craft",      label: "Fashion & Kerajinan" },
  { value: "jasa_personal_care", label: "Jasa & Personal Care" },
  { value: "lainnya",            label: "Lainnya" },
];

const PROVINCES = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Jambi",
  "Sumatera Selatan", "Bengkulu", "Lampung", "DKI Jakarta",
  "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur",
  "Banten", "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur",
  "Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan",
  "Kalimantan Timur", "Sulawesi Utara", "Sulawesi Tengah",
  "Sulawesi Selatan", "Sulawesi Tenggara", "Maluku", "Papua",
];

interface EditableDraft {
  business_name: string;
  business_type: UserProfile["businessType"];
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
    business_name:             bp.business_name,
    business_type:             bp.business_type,
    kbli_code:                 bp.kbli_code,
    description:               bp.description,
    province:                  bp.province,
    city:                      bp.city,
    district:                  bp.district,
    production_location:       bp.production_location,
    employee_count:            bp.employee_count ? String(bp.employee_count) : "",
    monthly_revenue_estimate:  bp.monthly_revenue_estimate ? String(bp.monthly_revenue_estimate) : "",
    has_nib:                   bp.has_nib,
    has_pirt:                  bp.has_pirt,
    has_halal:                 bp.has_halal,
    has_bpom:                  bp.has_bpom,
    has_merek:                 bp.has_merek,
  };
}

function draftToBp(draft: EditableDraft): Partial<BusinessProfile> {
  return {
    business_name:             draft.business_name,
    business_type:             draft.business_type,
    kbli_code:                 draft.kbli_code,
    description:               draft.description,
    province:                  draft.province,
    city:                      draft.city,
    district:                  draft.district,
    production_location:       draft.production_location,
    employee_count:            draft.employee_count ? parseInt(draft.employee_count, 10) : 0,
    monthly_revenue_estimate:  draft.monthly_revenue_estimate ? parseInt(draft.monthly_revenue_estimate, 10) : 0,
    has_nib:                   draft.has_nib,
    has_pirt:                  draft.has_pirt,
    has_halal:                 draft.has_halal,
    has_bpom:                  draft.has_bpom,
    has_merek:                 draft.has_merek,
  };
}

function formatRevenue(val: number): string {
  if (!val) return "—";
  if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1)} M`;
  if (val >= 1_000_000)     return `Rp ${(val / 1_000_000).toFixed(0)} jt`;
  return `Rp ${val.toLocaleString("id-ID")}`;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  businessProfile,
  authEmail,
  onSave,
}) => {
  const levelCfg = LEVEL_CONFIG[user.level] ?? LEVEL_CONFIG.STARTER;
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState<EditableDraft>(() => bpToDraft(businessProfile));

  const handleEdit = () => {
    setDraft(bpToDraft(businessProfile));
    setIsEditing(true);
    setSaved(false);
  };

  const handleSave = () => {
    onSave(draftToBp(draft));
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setDraft(bpToDraft(businessProfile));
    setIsEditing(false);
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
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  );

  const formalizationCount = [
    businessProfile.has_nib,
    businessProfile.has_pirt,
    businessProfile.has_halal,
    businessProfile.has_bpom,
    businessProfile.has_merek,
  ].filter(Boolean).length;

  return (
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

            <h4 className="font-bold text-lg text-gray-800 mb-0.5">{user.name}</h4>
            <p className="text-sm text-gray-500 font-medium mb-1">
              {businessProfile.business_name || "Belum ada nama usaha"}
            </p>
            <p className="text-xs text-gray-400 mb-4">
              {authEmail}
              {businessProfile.city && ` • ${businessProfile.city}`}
            </p>

            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${levelCfg.color} text-white text-sm font-bold shadow-md mb-5`}>
              <span>{levelCfg.emoji}</span>
              <span>{levelCfg.label}</span>
            </div>

            {/* Kelengkapan profil */}
            <div className="w-full bg-amber-50 rounded-lg border border-amber-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Kelengkapan Profil</span>
                <span className="text-sm font-black text-amber-500">{completionPct}%</span>
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
            <Star size={14} />
            Ringkasan Usaha
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon="👥" label="Karyawan" value={businessProfile.employee_count ? `${businessProfile.employee_count} org` : "—"} />
            <StatCard icon="💰" label="Omzet" value={formatRevenue(businessProfile.monthly_revenue_estimate)} />
            <StatCard icon="🏷️" label="Kode KBLI" value={businessProfile.kbli_code || "—"} />
            <StatCard icon="✅" label="Formalisasi" value={`${formalizationCount}/5`} />
          </div>
        </div>

        {/* Progres Formalisasi */}
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-5">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-amber-500" />
            Progres Formalisasi
          </h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tingkat Formalisasi</span>
            <span className="font-black text-2xl text-amber-500">{user.progressPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
            <div
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${user.progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400">
            Selesaikan langkah formalisasi untuk naik level dan mendapat akses pembiayaan lebih mudah.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="lg:col-span-8 space-y-4 md:space-y-6">

        {saved && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 shadow-sm">
            <CheckCircle size={18} className="text-green-500 shrink-0" />
            <p className="text-sm font-semibold text-green-700">Profil berhasil disimpan!</p>
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
            <ReadOnlyField label="Nama Pemilik" icon={<User size={14} />} value={user.name} />
            <ReadOnlyField label="Email" icon={<Mail size={14} />} value={authEmail || "—"} />
          </div>
        </SectionCard>

        {/* INFORMASI USAHA */}
        <SectionCard
          title="Informasi Usaha"
          icon={<Building2 size={16} className="text-amber-500" />}
          action={
            !isEditing ? (
              <button onClick={handleEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors">
                <Edit3 size={13} /> Edit Profil
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleCancel} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors">
                  <X size={13} /> Batal
                </button>
                <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg shadow-sm hover:shadow-md transition-all">
                  <Save size={13} /> Simpan
                </button>
              </div>
            )
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Nama Usaha" icon={<Building2 size={14} />}
              value={draft.business_name} editing={isEditing}
              onChange={(v) => set("business_name", v)} placeholder="Nama usaha / brand"
            />
            <SelectField
              label="Jenis Usaha" icon={<Briefcase size={14} />}
              value={draft.business_type} editing={isEditing}
              onChange={(v) => set("business_type", v)}
              options={BUSINESS_TYPES}
            />
            <SelectField
              label="Provinsi" icon={<MapPin size={14} />}
              value={draft.province} editing={isEditing}
              onChange={(v) => set("province", v)}
              options={PROVINCES.map((p) => ({ value: p, label: p }))}
            />
            <Field
              label="Kota / Kabupaten" icon={<MapPin size={14} />}
              value={draft.city} editing={isEditing}
              onChange={(v) => set("city", v)} placeholder="Contoh: Malang"
            />
            <Field
              label="Kecamatan" icon={<MapPin size={14} />}
              value={draft.district} editing={isEditing}
              onChange={(v) => set("district", v)} placeholder="Contoh: Lowokwaru"
            />
            <Field
              label="Lokasi Produksi" icon={<MapPin size={14} />}
              value={draft.production_location} editing={isEditing}
              onChange={(v) => set("production_location", v)} placeholder="Contoh: Dapur rumah"
            />
            <Field
              label="Jumlah Karyawan" icon={<Users size={14} />}
              value={draft.employee_count} editing={isEditing}
              onChange={(v) => set("employee_count", v.replace(/\D/, ""))}
              placeholder="Contoh: 3" inputMode="numeric"
            />
            <Field
              label="Omzet per Bulan (Rp)" icon={<TrendingUp size={14} />}
              value={draft.monthly_revenue_estimate} editing={isEditing}
              onChange={(v) => set("monthly_revenue_estimate", v.replace(/\D/, ""))}
              placeholder="Contoh: 10000000" inputMode="numeric"
              hint={draft.monthly_revenue_estimate ? formatRevenue(parseInt(draft.monthly_revenue_estimate, 10)) : undefined}
            />
            <div className="md:col-span-2">
              <Field
                label="Deskripsi Usaha" icon={<FileText size={14} />}
                value={draft.description} editing={isEditing}
                onChange={(v) => set("description", v)}
                placeholder="Ceritakan usaha Anda secara singkat..." multiline
              />
            </div>
            <div className="md:col-span-2">
              <Field
                label="Kode KBLI" icon={<FileText size={14} />}
                value={draft.kbli_code} editing={isEditing}
                onChange={(v) => set("kbli_code", v)}
                placeholder="Gunakan AI Copilot untuk rekomendasi otomatis"
                hint={!draft.kbli_code && isEditing ? "AI Copilot bisa bantu rekomendasikan kode KBLI yang sesuai" : undefined}
              />
            </div>
          </div>
        </SectionCard>

        {/* STATUS FORMALISASI */}
        <SectionCard
          title="Status Formalisasi"
          icon={<Award size={16} className="text-amber-500" />}
          subtitle="Centang izin yang sudah kamu miliki"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(
              [
                { key: "has_nib",   label: "NIB",             desc: "Nomor Induk Berusaha",         icon: "🏛️" },
                { key: "has_pirt",  label: "SPP-IRT / PIRT",  desc: "Izin pangan rumah tangga",     icon: "🍽️" },
                { key: "has_halal", label: "Halal",           desc: "Sertifikat halal MUI / BPJPH", icon: "☪️" },
                { key: "has_bpom",  label: "BPOM",            desc: "Izin edar BPOM",               icon: "💊" },
                { key: "has_merek", label: "Merek",           desc: "Pendaftaran merek DJKI",        icon: "™️" },
              ] as { key: keyof BusinessProfile; label: string; desc: string; icon: string }[]
            ).map(({ key, label, desc, icon }) => {
              const checked = isEditing
                ? (draft[key as keyof EditableDraft] as boolean)
                : (businessProfile[key] as boolean);
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!isEditing}
                  onClick={() => isEditing && set(key as keyof EditableDraft, !checked)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                    checked
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200 opacity-70"
                  } ${isEditing ? "cursor-pointer hover:shadow-sm" : "cursor-default"}`}
                >
                  <span className="text-xl">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800">{label}</p>
                    <p className="text-[10px] text-gray-500 truncate">{desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    checked ? "bg-green-500 border-green-500" : "bg-white border-gray-300"
                  }`}>
                    {checked && <CheckCircle size={12} className="text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
          {!isEditing && (
            <p className="text-[11px] text-gray-400 mt-3">
              Klik <span className="font-semibold text-amber-600">Edit Profil</span> di atas untuk memperbarui status formalisasi.
            </p>
          )}
        </SectionCard>

      </div>
    </div>
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
          {icon}{title}
        </h2>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const StatCard: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="bg-white rounded-lg border border-amber-100 p-3 text-center shadow-sm">
    <div className="text-2xl mb-1">{icon}</div>
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
      <span className="text-amber-400">{icon}</span>{label}
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
}> = ({ label, icon, value, editing, onChange, placeholder = "", multiline = false, inputMode, hint }) => (
  <div>
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
      <span className="text-amber-400">{icon}</span>{label}
    </label>
    {editing ? (
      <>
        {multiline ? (
          <textarea
            value={value} onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder} rows={3}
            className="w-full px-3 py-2 rounded-lg border border-amber-200 text-sm text-gray-800 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300 font-medium resize-none"
          />
        ) : (
          <input
            type="text" value={value} onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder} inputMode={inputMode}
            className="w-full px-3 py-2 rounded-lg border border-amber-200 text-sm text-gray-800 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300 font-medium"
          />
        )}
        {hint && <p className="text-[10px] text-amber-600 mt-1">{hint}</p>}
      </>
    ) : (
      <div className={`px-3 py-2 rounded-lg border text-sm font-medium ${
        value ? "bg-white border-amber-100 text-gray-800" : "bg-gray-50 border-gray-100 text-gray-400 italic"
      }`}>
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
        <span className="text-amber-400">{icon}</span>{label}
      </label>
      {editing ? (
        <div className="relative">
          <select
            value={value} onChange={(e) => onChange(e.target.value)}
            className="w-full appearance-none px-3 py-2 pr-8 rounded-lg border border-amber-200 text-sm text-gray-800 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300 font-medium"
          >
            <option value="">Pilih {label}</option>
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      ) : (
        <div className={`px-3 py-2 rounded-lg border text-sm font-medium ${
          value ? "bg-white border-amber-100 text-gray-800" : "bg-gray-50 border-gray-100 text-gray-400 italic"
        }`}>
          {display || "Belum diisi"}
        </div>
      )}
    </div>
  );
};