import React, { useState } from "react";
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Briefcase,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Camera,
  Award,
  TrendingUp,
  Star,
} from "lucide-react";
import type { UserProfile } from "../../Dashboard/types";

interface ProfilePageProps {
  user: UserProfile;
}

// Edit the fields to match your UserProfile type
interface EditableProfile {
  name: string;
  businessName: string;
  businessType: string;
  city: string;
  phone: string;
  email: string;
  address: string;
  description: string;
  npwp: string;
  nib: string;
}

const LEVEL_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  STARTER: { emoji: "⭐", label: "Starter", color: "from-gray-400 to-gray-500" },
  GROWING: { emoji: "", label: "Growing", color: "from-green-400 to-emerald-500" },
  ESTABLISHED: { emoji: "🏢", label: "Established", color: "from-blue-400 to-blue-600" },
  PRO: { emoji: "🏆", label: "Pro", color: "from-amber-400 to-orange-500" },
  ENTERPRISE: { emoji: "💎", label: "Enterprise", color: "from-purple-400 to-purple-600" },
};

const BUSINESS_TYPES = [
  "Kuliner & F&B",
  "Retail & Perdagangan",
  "Jasa & Layanan",
  "Fashion & Kerajinan",
  "Teknologi & Digital",
  "Pertanian & Perkebunan",
  "Kesehatan & Kecantikan",
  "Pendidikan & Pelatihan",
  "Lainnya",
];

const CITIES = [
  "Jakarta",
  "Surabaya",
  "Bandung",
  "Medan",
  "Semarang",
  "Makassar",
  "Malang",
  "Denpasar",
  "Yogyakarta",
  "Palembang",
];

const STATS = [
  { label: "Hari Bergabung", value: "128", icon: "📅" },
  { label: "Langkah Selesai", value: "14", icon: "✅" },
  { label: "Dokumen Legal", value: "3", icon: "📋" },
  { label: "Poin Reward", value: "850", icon: "💰" },
];

export const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  const levelCfg = LEVEL_CONFIG[user.level] ?? LEVEL_CONFIG.STARTER;

  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<EditableProfile>({
    name: user.name,
    businessName: user.businessName,
    businessType: user.businessType,
    city: user.city,
    phone: "",
    email: "",
    address: "",
    description: "",
    npwp: "",
    nib: "",
  });
  const [draft, setDraft] = useState<EditableProfile>(profile);

  const handleEdit = () => {
    setDraft(profile);
    setIsEditing(true);
    setSaved(false);
  };

  const handleSave = () => {
    setProfile(draft);
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setDraft(profile);
    setIsEditing(false);
  };

  const handleChange = (field: keyof EditableProfile, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const completionFields: (keyof EditableProfile)[] = [
    "name",
    "businessName",
    "businessType",
    "city",
    "phone",
    "email",
    "address",
    "description",
    "npwp",
    "nib",
  ];
  const filled = completionFields.filter((f) => !!profile[f]).length;
  const completionPct = Math.round((filled / completionFields.length) * 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
      {/* ── LEFT COLUMN ── */}
      <div className="lg:col-span-4 space-y-4 md:space-y-6">
        {/* Avatar Card */}
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
          <div className="p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full border-4 border-amber-100 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-amber-300 flex items-center justify-center shadow-md hover:bg-amber-50 transition-colors">
                <Camera size={14} className="text-amber-500" />
              </button>
            </div>

            <h4 className="font-bold text-lg text-gray-800 mb-0.5">{profile.name}</h4>
            <p className="text-sm text-gray-500 font-medium mb-1">{profile.businessName || "—"}</p>
            <p className="text-xs text-gray-400 mb-4">
              {profile.businessType} • {profile.city}
            </p>

            {/* Level badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${levelCfg.color} text-white text-sm font-bold shadow-md mb-4`}
            >
              <span>{levelCfg.emoji}</span>
              <span>{levelCfg.label}</span>
            </div>

            {/* Progress completion */}
            <div className="w-full bg-amber-50 rounded-lg border border-amber-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                  Kelengkapan Profil
                </span>
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

        {/* Stats Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-sm p-5">
          <h3 className="text-xs font-bold text-orange-900 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Star size={14} />
            Statistik Usaha
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-lg border border-amber-100 p-3 text-center shadow-sm"
              >
                <div className="text-2xl mb-1">{s.icon}</div>
                <p className="text-lg font-black text-gray-800">{s.value}</p>
                <p className="text-[10px] text-gray-500 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Formalisasi progress */}
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

      {/* ── RIGHT COLUMN ── */}
      <div className="lg:col-span-8 space-y-4 md:space-y-6">
        {/* Save notification */}
        {saved && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 shadow-sm">
            <CheckCircle size={18} className="text-green-500 shrink-0" />
            <p className="text-sm font-semibold text-green-700">
              Profil berhasil disimpan!
            </p>
          </div>
        )}

        {/* Info Dasar */}
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100">
            <h2 className="font-bold text-base text-gray-800 flex items-center gap-2">
              <User size={16} className="text-amber-500" />
              Informasi Dasar
            </h2>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
              >
                <Edit3 size={13} />
                Edit Profil
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                >
                  <X size={13} />
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg shadow-sm hover:shadow-md transition-all"
                >
                  <Save size={13} />
                  Simpan
                </button>
              </div>
            )}
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Nama Pemilik"
              icon={<User size={14} />}
              value={draft.name}
              editing={isEditing}
              onChange={(v) => handleChange("name", v)}
              placeholder="Nama lengkap pemilik"
            />
            <Field
              label="Nama Usaha"
              icon={<Building2 size={14} />}
              value={draft.businessName}
              editing={isEditing}
              onChange={(v) => handleChange("businessName", v)}
              placeholder="Nama usaha / brand"
            />
            <Field
              label="Jenis Usaha"
              icon={<Briefcase size={14} />}
              value={draft.businessType}
              editing={isEditing}
              onChange={(v) => handleChange("businessType", v)}
              type="select"
              options={BUSINESS_TYPES}
            />
            <Field
              label="Kota"
              icon={<MapPin size={14} />}
              value={draft.city}
              editing={isEditing}
              onChange={(v) => handleChange("city", v)}
              type="select"
              options={CITIES}
            />
            <Field
              label="Nomor Telepon"
              icon={<Phone size={14} />}
              value={draft.phone}
              editing={isEditing}
              onChange={(v) => handleChange("phone", v)}
              placeholder="08xx-xxxx-xxxx"
            />
            <Field
              label="Email"
              icon={<Mail size={14} />}
              value={draft.email}
              editing={isEditing}
              onChange={(v) => handleChange("email", v)}
              placeholder="email@usaha.com"
            />
            <div className="md:col-span-2">
              <Field
                label="Alamat Usaha"
                icon={<MapPin size={14} />}
                value={draft.address}
                editing={isEditing}
                onChange={(v) => handleChange("address", v)}
                placeholder="Alamat lengkap usaha"
                multiline
              />
            </div>
            <div className="md:col-span-2">
              <Field
                label="Deskripsi Usaha"
                icon={<FileText size={14} />}
                value={draft.description}
                editing={isEditing}
                onChange={(v) => handleChange("description", v)}
                placeholder="Ceritakan usaha Anda secara singkat..."
                multiline
              />
            </div>
          </div>
        </div>

        {/* Dokumen Legal */}
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-amber-100">
            <h2 className="font-bold text-base text-gray-800 flex items-center gap-2">
              <FileText size={16} className="text-amber-500" />
              Dokumen Legal
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Lengkapi nomor dokumen legalitas usaha Anda.
            </p>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <LegalField
              label="NPWP"
              value={draft.npwp}
              editing={isEditing}
              onChange={(v) => handleChange("npwp", v)}
              placeholder="XX.XXX.XXX.X-XXX.XXX"
              hint="Nomor Pokok Wajib Pajak"
            />
            <LegalField
              label="NIB"
              value={draft.nib}
              editing={isEditing}
              onChange={(v) => handleChange("nib", v)}
              placeholder="Nomor Induk Berusaha"
              hint="Dari sistem OSS"
            />
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 shadow-sm p-5">
          <h3 className="text-xs font-bold text-orange-900 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Award size={14} />
            Pencapaian Terbaru
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { icon: "🏅", title: "Profil Pertama", desc: "Buat profil usaha", done: true },
              { icon: "📋", title: "NIB Terdaftar", desc: "Lengkapi NIB usaha", done: false },
              { icon: "💼", title: "Pembiayaan Ready", desc: "Siap ajukan kredit", done: false },
            ].map((a) => (
              <div
                key={a.title}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  a.done
                    ? "bg-white border-amber-200"
                    : "bg-gray-50 border-gray-200 opacity-60"
                }`}
              >
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <p className="text-xs font-bold text-gray-800">{a.title}</p>
                  <p className="text-[10px] text-gray-500">{a.desc}</p>
                </div>
                {a.done && <CheckCircle size={14} className="text-green-500 ml-auto shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Helper sub-components ──

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "select";
  options?: string[];
  multiline?: boolean;
}

const Field: React.FC<FieldProps> = ({
  label,
  icon,
  value,
  editing,
  onChange,
  placeholder = "",
  type = "text",
  options = [],
  multiline = false,
}) => (
  <div>
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
      <span className="text-amber-400">{icon}</span>
      {label}
    </label>
    {editing ? (
      type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-amber-200 text-sm text-gray-800 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300 font-medium"
        >
          <option value="">Pilih {label}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : multiline ? (
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
          className="w-full px-3 py-2 rounded-lg border border-amber-200 text-sm text-gray-800 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300 font-medium"
        />
      )
    ) : (
      <div
        className={`px-3 py-2 rounded-lg border text-sm font-medium ${
          value
            ? "bg-white border-amber-100 text-gray-800"
            : "bg-gray-50 border-gray-100 text-gray-400 italic"
        }`}
      >
        {value || `Belum diisi`}
      </div>
    )}
  </div>
);

interface LegalFieldProps {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  placeholder: string;
  hint: string;
}

const LegalField: React.FC<LegalFieldProps> = ({
  label,
  value,
  editing,
  onChange,
  placeholder,
  hint,
}) => (
  <div className="bg-white rounded-lg border border-amber-100 p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-black text-gray-700 uppercase tracking-wider">{label}</span>
      {value ? (
        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
          <CheckCircle size={10} /> Terisi
        </span>
      ) : (
        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
          <AlertCircle size={10} /> Kosong
        </span>
      )}
    </div>
    <p className="text-[10px] text-gray-400 mb-2">{hint}</p>
    {editing ? (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-amber-200 text-sm text-gray-800 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300 font-medium"
      />
    ) : (
      <div
        className={`px-3 py-2 rounded-lg text-sm font-mono font-semibold ${
          value ? "text-gray-800" : "text-gray-400 italic text-xs font-sans font-medium"
        }`}
      >
        {value || "Belum diisi"}
      </div>
    )}
  </div>
);