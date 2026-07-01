import React, { useState, useRef, useEffect } from "react";
import {
  Award, Check, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  CheckCircle, X, ZoomIn,
} from "lucide-react";
import type { UserProfile, BusinessProfile, Page } from "../../Dashboard/types";
import { getBadges, LEVEL_CONFIG, formatBusinessType } from "../../Dashboard/constants";
import { FeatureGrid } from "../../../common/dashboard/FeatureGrid";
import { CompleteProfileBanner } from "../../../common/dashboard/CompleteProfileBanner";
import { OnboardingWizard } from "../../../common/dashboard/OnBoardingWizard";

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
}) => {
  const level = businessProfile.level ?? "starter";
  const levelCfg = LEVEL_CONFIG[level];
  const certFlags = [
    businessProfile.has_nib,
    businessProfile.has_pirt,
    businessProfile.has_halal,
    businessProfile.has_bpom,
    businessProfile.has_merek,
  ];
  const progressPercent = Math.round(
    (certFlags.filter(Boolean).length / certFlags.length) * 100
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
      <div className="lg:col-span-8 space-y-4 md:space-y-6">

       {/* Notif lengkapi profil */}
      {progressPercent === 0 && (
        <CompleteProfileBanner
          userId={user.id}
          onComplete={() => onNavigate("profile")}
        />
      )}
      {progressPercent === 0 && (
        <OnboardingWizard
          open
          onFinish={() => onNavigate("profile")}
        />
      )}

        {/* Level Banner */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Level Usaha</p>
              <h3 className="font-bold text-gray-800 text-base md:text-lg">
                {levelCfg.label}
              </h3>
              <p className="text-xs text-gray-500">
                {/* FIX */}
                {formatBusinessType(businessProfile.business_type)} • {businessProfile.city}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Formalisasi</p>
              <p className="font-black text-2xl text-amber-500">
                {progressPercent}%
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Profile Card mobile */}
        <ProfileCard user={user} businessProfile={businessProfile} className="lg:hidden" />

        {/* Feature Grid */}
        <FeatureGrid onNavigate={onNavigate} />

        {/* Formalization Slider */}
        <FormalizationSlider businessProfile={businessProfile} />

        {/* Badges mobile */}
        <BadgesCard businessProfile={businessProfile} className="lg:hidden" />
      </div>

      {/* Sidebar */}
      <div className="hidden lg:flex lg:col-span-4 flex-col gap-6">
        <ProfileCard user={user} businessProfile={businessProfile} />
        <BadgesCard businessProfile={businessProfile} />
      </div>
    </div>
  );
};

const ProfileCard: React.FC<{
  user: UserProfile;
  businessProfile: BusinessProfile;
  className?: string;
}> = ({ user, businessProfile, className = "" }) => {
  const level = businessProfile.level ?? "starter";
  const levelCfg = LEVEL_CONFIG[level];

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
        {businessProfile.business_name}
      </p>
      <p className="text-gray-400 text-xs font-medium mb-4 md:mb-6">
        {/* FIX */}
        {formatBusinessType(businessProfile.business_type)} • {businessProfile.city}
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
          <><ChevronUp size={14} /> Sembunyikan</>
        ) : (
          <><ChevronDown size={14} /> Lihat {badges.length - 3} lainnya</>
        )}
      </button>
    </div>
  );
};

const CERT_LIST = [
  { key: "has_nib",   label: "NIB",            desc: "Nomor Induk Berusaha"          },
  { key: "has_pirt",  label: "SPP-IRT / PIRT", desc: "Izin pangan rumah tangga"      },
  { key: "has_halal", label: "Halal",           desc: "Sertifikat Halal MUI / BPJPH" },
  { key: "has_bpom",  label: "BPOM",            desc: "Izin edar BPOM"               },
  { key: "has_merek", label: "Merek",           desc: "Pendaftaran merek DJKI"        },
] as const;

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

  const totalPages = Math.ceil(CERT_LIST.length / perPage);
  const safePage = Math.min(page, totalPages - 1);
  const slice = CERT_LIST.slice(safePage * perPage, safePage * perPage + perPage);

  const earnedCount = CERT_LIST.filter((c) => businessProfile[c.key]).length;

  return (
    <div
      ref={containerRef}
      className={`bg-white rounded-xl p-4 md:p-5 border border-amber-200 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
          <CheckCircle size={14} className="text-green-500" />
          Status Formalisasi
        </span>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
          {earnedCount}/5 selesai
        </span>
      </div>

      <div
        className="grid gap-3 mb-4"
        style={{ gridTemplateColumns: `repeat(${perPage}, minmax(0, 1fr))` }}
      >
        {slice.map(({ key, label, desc }) => {
          const earned = businessProfile[key];
          return earned ? (
            <div
              key={key}
              className="relative rounded-xl overflow-hidden border border-green-200 bg-green-50 flex flex-col items-center justify-center gap-2 p-3 text-center"
              style={{ aspectRatio: "1 / 1.1" }}
            >
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle size={12} className="text-white" />
              </div>
              <p className="text-[11px] font-bold text-green-800 leading-tight">{label}</p>
              <p className="text-[9px] text-green-600 leading-tight">{desc}</p>
            </div>
          ) : (
            <div
              key={key}
              className="rounded-xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 p-3 text-center"
              style={{ aspectRatio: "1 / 1.1" }}
            >
              <p className="text-[11px] font-bold text-gray-700 leading-tight">{label}</p>
              <p className="text-[9px] text-gray-400 leading-tight">{desc}</p>
              <span className="text-[9px] text-gray-400 border border-dashed border-gray-300 rounded-full px-2 py-0.5 mt-0.5">
                Belum selesai
              </span>
            </div>
          );
        })}
      </div>

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
        </div>
      </div>
    </div>
  );
};