import React, { useState, useEffect } from "react";
import { Sparkles, ArrowRight, X } from "lucide-react";

interface CompleteProfileBannerProps {
  userId?: string;
  onComplete: () => void;
}

export const CompleteProfileBanner: React.FC<CompleteProfileBannerProps> = ({
  userId,
  onComplete,
}) => {
  const storageKey = `growkm_complete_profile_dismissed_${userId ?? "guest"}`;
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    setDismissed(stored === "1");
  }, [storageKey]);

  if (dismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(storageKey, "1");
    setDismissed(true);
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-300 bg-gradient-to-r from-amber-400 to-orange-500 p-4 md:p-5 shadow-md text-white">
      {/* decorative blob */}
      <div className="pointer-events-none absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -right-2 bottom-0 w-16 h-16 rounded-full bg-white/10" />

      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Tutup notifikasi"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <Sparkles size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm md:text-base mb-1">
            Lengkapi Profil Usahamu Yuk!
          </h4>
          <p className="text-[11px] md:text-xs text-white/90 mb-3 leading-relaxed">
            Profil kamu masih kosong. Isi data usaha supaya rekomendasi roadmap,
            level usaha, dan fitur lainnya bisa lebih akurat sesuai kebutuhanmu.
          </p>
          <button
            onClick={onComplete}
            className="inline-flex items-center gap-1.5 bg-white text-amber-600 text-xs font-bold px-3.5 py-2 rounded-lg hover:bg-amber-50 transition-colors shadow-sm"
          >
            Lengkapi Sekarang
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};