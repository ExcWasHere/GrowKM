import React, { useState, useRef, useEffect } from "react";
import {
  Award,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  X,
  ZoomIn,
} from "lucide-react";
import type { UserProfile } from "../../Dashboard/types";
import type { Page } from "../../Dashboard/types";
import { getBadges, LEVEL_CONFIG } from "../../Dashboard/constants";
import type { BusinessProfile } from "../../../hooks/useUserProfile";
import { FeatureGrid } from "../../../common/dashboard/FeatureGrid";

interface DashboardPageProps {
  user: UserProfile;
  businessProfile: BusinessProfile;
  onNavigate: (page: Page) => void;
  onUpdateBusinessProfile?: (updates: Partial<BusinessProfile>) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  businessProfile,
  onNavigate,
  onUpdateBusinessProfile,
}) => {
  const levelCfg = LEVEL_CONFIG[user.level];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
      {/* ── Main Content (kiri) ── */}
      <div className="lg:col-span-8 space-y-4 md:space-y-6">
        {/* Level/Progress Banner */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Level Usaha</p>
              <h3 className="font-bold text-gray-800 text-base md:text-lg">
                {levelCfg.label}
              </h3>
              <p className="text-xs text-gray-500">
                {user.businessType} • {user.city}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Formalisasi</p>
              <p className="font-black text-2xl text-amber-500">
                {user.progressPercent}%
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${user.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Profile Card — mobile only */}
        <ProfileCard user={user} className="lg:hidden" />

        {/* Feature Grid */}
        <FeatureGrid onNavigate={onNavigate} />

        {/* Formalization Slider */}
        <FormalizationSlider businessProfile={businessProfile} />

        {/* Badges — mobile only */}
        <BadgesCard businessProfile={businessProfile} className="lg:hidden" />
      </div>

      {/* ── Sidebar (kanan, desktop only) ── */}
      <div className="hidden lg:flex lg:col-span-4 flex-col gap-6">
        <ProfileCard user={user} />
        <BadgesCard businessProfile={businessProfile} />
      </div>
    </div>
  );
};

// ─── Profile Card ────────────────────────────────────────────────────────────

const ProfileCard: React.FC<{ user: UserProfile; className?: string }> = ({
  user,
  className = "",
}) => {
  const levelCfg = LEVEL_CONFIG[user.level];
  return (
    <div
      className={`bg-white rounded-xl p-6 md:p-8 border border-amber-200 text-center relative overflow-hidden shadow-sm ${className}`}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
      <p className="text-amber-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-4 md:mb-6">
        Profil Usaha
      </p>
      <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-full border-4 border-amber-100 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg">
        {user.name.charAt(0)}
      </div>
      <h4 className="font-bold text-base md:text-lg text-gray-800 mb-1">
        {user.name}
      </h4>
      <p className="text-gray-500 text-xs font-medium mb-1">
        {user.businessName}
      </p>
      <p className="text-gray-400 text-xs font-medium mb-4 md:mb-6">
        {user.businessType} • {user.city}
      </p>
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 py-3 md:py-4 rounded-lg border border-amber-100">
        <p className="text-[9px] uppercase font-bold text-amber-500 mb-1">
          Level Usaha
        </p>
        <p className="font-bold text-amber-600 text-xl md:text-2xl">
          {levelCfg.label}
        </p>
      </div>
    </div>
  );
};

// ─── Badges Card ─────────────────────────────────────────────────────────────

const BadgesCard: React.FC<{
  businessProfile: BusinessProfile;
  className?: string;
}> = ({ businessProfile, className = "" }) => {
  const badges = getBadges(businessProfile);
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? badges : badges.slice(0, 3);

  return (
    <div
      className={`bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 md:p-6 border-2 border-amber-200 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-orange-900 uppercase tracking-wider flex items-center gap-2">
          <Award size={16} />
          Pencapaian
        </span>
      </div>
      <div className="space-y-2 md:space-y-3">
        {visible.map((badge, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              badge.earned
                ? "bg-white border border-amber-200"
                : "bg-gray-100 border border-gray-200 opacity-50"
            }`}
          >
            <div className="text-xl md:text-2xl">{badge.icon}</div>
            <div className="flex-1">
              <p className="text-xs md:text-sm font-bold text-gray-800">
                {badge.name}
              </p>
            </div>
            {badge.earned && <Check size={16} className="text-green-500" />}
          </div>
        ))}
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 w-full flex items-center justify-center gap-1 text-xs font-bold text-amber-600 hover:text-orange-500 transition-colors"
      >
        {expanded ? (
          <>
            <ChevronUp size={14} /> Sembunyikan
          </>
        ) : (
          <>
            <ChevronDown size={14} /> Lihat {badges.length - 3} lainnya
          </>
        )}
      </button>
    </div>
  );
};

// ─── Formalization Slider ─────────────────────────────────────────────────────

const CERT_LIST = [
  {
    key: "has_nib",
    label: "NIB",
    desc: "Nomor Induk Berusaha",
    icon: "🏛️",
    imageKey: "nib_image",
  },
  {
    key: "has_pirt",
    label: "SPP-IRT / PIRT",
    desc: "Izin pangan rumah tangga",
    icon: "🍽️",
    imageKey: "pirt_image",
  },
  {
    key: "has_halal",
    label: "Halal",
    desc: "Sertifikat Halal MUI / BPJPH",
    icon: "☪️",
    imageKey: "halal_image",
  },
  {
    key: "has_bpom",
    label: "BPOM",
    desc: "Izin edar BPOM",
    icon: "💊",
    imageKey: "bpom_image",
  },
  {
    key: "has_merek",
    label: "Merek",
    desc: "Pendaftaran merek DJKI",
    icon: "™️",
    imageKey: "merek_image",
  },
] as const;

type CertKey = (typeof CERT_LIST)[number]["key"];
type CertImageKey = (typeof CERT_LIST)[number]["imageKey"];

interface FormalizationSliderProps {
  businessProfile: BusinessProfile;
  className?: string;
}

export const FormalizationSlider: React.FC<FormalizationSliderProps> = ({
  businessProfile,
  className = "",
}) => {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setPerPage(entry.contentRect.width < 500 ? 2 : 3);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const imageValueMap: Record<CertImageKey, string | undefined> = {
    nib_image: businessProfile.nib_image,
    pirt_image: businessProfile.pirt_image,
    halal_image: businessProfile.halal_image,
    bpom_image: businessProfile.bpom_image,
    merek_image: businessProfile.merek_image,
  };

  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    label: string;
    desc: string;
  } | null>(null);
  const uploadedCount = CERT_LIST.filter(
    (c) => !!imageValueMap[c.imageKey],
  ).length;
  const totalPages = Math.ceil(CERT_LIST.length / perPage);
  const safePage = Math.min(page, totalPages - 1);
  const slice = CERT_LIST.slice(
    safePage * perPage,
    safePage * perPage + perPage,
  );

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-xl p-4 md:p-5 border border-amber-200 shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle size={14} className="text-green-500" />
          Status Formalisasi
        </span>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
          {uploadedCount}/5 diunggah
        </span>
      </div>

      {/* Gallery Grid */}
      <div
        className="grid gap-3 mb-4"
        style={{ gridTemplateColumns: `repeat(${perPage}, minmax(0, 1fr))` }}
      >
        {slice.map(({ label, desc, icon, imageKey }) => {
          const imageData = imageValueMap[imageKey];

          return imageData ? (
            <div
              onClick={() => setSelectedImage({ src: imageData, label, desc })}
              key={imageKey}
              className="relative rounded-xl overflow-hidden border border-green-200 bg-green-50 cursor-pointer group"
              style={{ aspectRatio: "1 / 1.1" }}
            >
              <img
                src={imageData}
                alt={`Sertifikat ${label}`}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay bawah */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/55 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 rounded-full p-2">
                  <ZoomIn size={18} className="text-gray-700" />
                </div>
              </div>
              {/* Check badge */}
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle size={12} className="text-white" />
              </div>
              {/* Label bawah */}
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <p className="text-[11px] font-bold text-white leading-tight">
                  {label}
                </p>
                <p className="text-[9px] text-white/75 leading-tight mt-0.5">
                  {desc}
                </p>
              </div>
            </div>
          ) : (
            <div
              key={imageKey}
              className="rounded-xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 p-3 text-center"
              style={{ aspectRatio: "1 / 1.1" }}
            >
              <span className="text-2xl opacity-40">{icon}</span>
              <p className="text-[11px] font-bold text-gray-700 leading-tight">
                {label}
              </p>
              <p className="text-[9px] text-gray-400 leading-tight">{desc}</p>
              <span className="text-[9px] text-gray-400 border border-dashed border-gray-300 rounded-full px-2 py-0.5 mt-0.5">
                Belum diunggah
              </span>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 items-center">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === safePage ? "w-5 bg-amber-500" : "w-1.5 bg-gray-300"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage === totalPages - 1}
            className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-amber-50 hover:border-amber-300 disabled:opacity-30 transition-all"
          >
            <ChevronRight size={14} />
          </button>
          {selectedImage && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
              onClick={() => setSelectedImage(null)}
            >
              <div
                className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <div>
                    <p className="font-bold text-sm text-gray-800">
                      {selectedImage.label}
                    </p>
                    <p className="text-xs text-gray-400">
                      {selectedImage.desc}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                {/* Image */}
                <img
                  src={selectedImage.src}
                  alt={selectedImage.label}
                  className="w-full object-contain max-h-[70vh]"
                />
                {/* Footer badge */}
                <div className="px-4 py-3 bg-green-50 border-t border-green-100 flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-xs font-semibold text-green-700">
                    Sertifikat telah diunggah
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};