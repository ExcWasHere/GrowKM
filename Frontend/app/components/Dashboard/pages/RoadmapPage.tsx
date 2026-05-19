import React from "react";
import {
  CheckCircle,
  Lock,
  ChevronRight,
  ExternalLink,
  Clock,
  Wallet,
  Map,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import type { UserProfile } from "../../Dashboard/types";
import { CARD_META } from "../../../common/dashboard/featureMeta";
import type { RoadmapStep } from "../../../hooks/useUserProfile";

interface RoadmapPageProps {
  user: UserProfile;
  steps: RoadmapStep[];
  progressPercent: number;
  loadState: "idle" | "loading" | "success" | "error";
  error: string | null;
  onOpenChat: (stepType: string) => void;
  onRefetch: () => void;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({
  user,
  steps,
  progressPercent,
  loadState,
  error,
  onOpenChat,
  onRefetch,
}) => {
  const meta = CARD_META["roadmap"];
  const completedCount = steps.filter((s) => s.status === "completed").length;

  if (loadState === "idle" || loadState === "loading") {
    return (
      <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm flex items-center justify-center gap-3 min-h-[200px]">
        <Loader2 size={24} className="animate-spin text-amber-500" />
        <span className="text-sm font-semibold text-gray-500">
          Memuat roadmap legalitas...
        </span>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="bg-white rounded-xl p-6 border border-red-200 shadow-sm flex flex-col items-center justify-center gap-4 min-h-[200px]">
        <AlertCircle size={28} className="text-red-400" />
        <div className="text-center">
          <p className="text-sm font-bold text-red-700 mb-1">Gagal memuat roadmap</p>
          <p className="text-xs text-red-500">{error}</p>
        </div>
        <button
          onClick={onRefetch}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
        >
          <RefreshCw size={14} />
          Coba lagi
        </button>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 border border-amber-200 shadow-sm flex flex-col items-center justify-center gap-4 min-h-[200px] text-center">
        <span className="text-4xl">🗺️</span>
        <div>
          <p className="text-sm font-bold text-gray-700 mb-1">
            Roadmap belum tersedia
          </p>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Lengkapi profil usaha & konfirmasi kode KBLI terlebih dahulu agar
            AI bisa menyiapkan roadmap legalitas yang sesuai.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="bg-white rounded-xl p-4 md:p-6 border border-amber-200 shadow-sm">
        <div className="flex items-start gap-4">
          <div
            className={`w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br ${meta.gradientClass} flex items-center justify-center shadow-lg flex-shrink-0`}
          >
            {React.cloneElement(
              meta.icon as React.ReactElement<{ size?: number; className?: string }>,
              { size: 36, className: "text-white" },
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-2">
              Guide to Grow
            </h1>
            <p className="text-sm md:text-base text-gray-600 mb-4">
              Kuliner • {user.businessName || "Usaha Saya"}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-600 font-medium">Progress Formalisasi</span>
                <span className="text-amber-600 font-bold">
                  {completedCount}/{steps.length} Step
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{progressPercent}% Selesai</p>
            </div>
          </div>
        </div>
      </div>

      {/* Steps list */}
      <div className="bg-white rounded-xl p-4 md:p-6 border border-amber-200 shadow-sm">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Map size={20} className="text-amber-500" />
          Roadmap Legalitas
        </h2>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-amber-100 z-0" />
          <div className="space-y-4 relative z-10">
            {steps.map((step) => {
              const isCompleted  = step.status === "completed";
              const isInProgress = step.status === "in_progress";
              const isUnlocked   = step.status === "unlocked" || isInProgress;
              const isLocked     = step.status === "locked";

              return (
                <div
                  key={step.id}
                  className={`border rounded-xl p-4 md:p-5 transition-all ${
                    isLocked
                      ? "bg-gray-50 border-gray-200 opacity-60"
                      : isCompleted
                        ? "bg-green-50 border-green-200"
                        : "bg-white border-amber-200 hover:shadow-md hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                        isLocked
                          ? "bg-gray-200 text-gray-400"
                          : isCompleted
                            ? "bg-gradient-to-br from-green-400 to-green-600 text-white"
                            : "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                      }`}
                    >
                      {isLocked ? (
                        <Lock size={18} />
                      ) : isCompleted ? (
                        <CheckCircle size={20} />
                      ) : (
                        <span>{step.icon}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title + badge */}
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
                        <h3
                          className={`font-bold text-sm md:text-base ${
                            isLocked ? "text-gray-400" : "text-gray-800"
                          }`}
                        >
                          {step.label}
                          {!step.is_required && (
                            <span className="ml-2 text-[10px] font-semibold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                              Opsional
                            </span>
                          )}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold w-fit ${
                            isLocked
                              ? "bg-gray-100 text-gray-400"
                              : isCompleted
                                ? "bg-green-100 text-green-700"
                                : isInProgress
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {isCompleted
                            ? "✅ Selesai"
                            : isInProgress
                              ? "⏳ Sedang Proses"
                              : isUnlocked
                                ? "→ Mulai Sekarang"
                                : "🔒 Terkunci"}
                        </span>
                      </div>

                      <p
                        className={`text-xs md:text-sm mb-3 ${
                          isLocked ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {step.description}
                      </p>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div
                          className={`flex items-center gap-1 ${
                            isLocked ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          <Wallet size={13} />
                          {step.cost}
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            isLocked ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          <Clock size={13} />
                          {step.duration}
                        </div>
                        {!isLocked && (
                          <div className="flex items-center gap-1 text-amber-500">
                            <ExternalLink size={12} />
                            {step.platform}
                          </div>
                        )}
                      </div>

                      {/* Substep progress bar */}
                      {isInProgress &&
                        step.total_substeps &&
                        step.total_substeps > 0 && (
                          <div className="mt-3">
                            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                              <span>Sub-langkah</span>
                              <span>
                                {step.current_substep}/{step.total_substeps}
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div
                                className="bg-blue-400 h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${
                                    (step.current_substep / step.total_substeps) * 100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                      {/* Tanya Lexa CTA */}
                      {isUnlocked && (
                        <button
                          onClick={() => onOpenChat(step.step_type)}
                          className="mt-3 text-xs md:text-sm font-bold text-amber-600 hover:text-orange-600 flex items-center gap-1"
                        >
                          Tanya Lexa AI
                          <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Benefit hint */}
      {steps.find((s) => s.step_type === "nib" && s.status === "completed") &&
        steps.find(
          (s) =>
            s.step_type === "spp_irt" &&
            (s.status === "unlocked" || s.status === "in_progress"),
        ) && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 md:p-6 border-2 border-amber-200">
            <h3 className="font-bold text-sm md:text-base text-amber-900 mb-3 flex items-center gap-2">
              🔓 Setelah SPP-IRT selesai, kamu bisa:
            </h3>
            <ul className="space-y-2 text-xs md:text-sm text-amber-800">
              {[
                "Terima pesanan katering kantor",
                "Jual produk di supermarket lokal",
                "Daftar di platform katering online",
              ].map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">+</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
};