import React from "react";
import {
  CheckCircle,
  Lock,
  ChevronRight,
  ExternalLink,
  Clock,
  Wallet,
  Map,
} from "lucide-react";
import type { UserProfile } from "../../Dashboard/types";
import { KULINER_STEPS } from "../../Dashboard/constants";
import { CARD_META } from "../../../common/dashboard/featureMeta";

interface RoadmapPageProps {
  user: UserProfile;
  onOpenChat: (stepId: string) => void;
}

export const RoadmapPage: React.FC<RoadmapPageProps> = ({
  user,
  onOpenChat,
}) => {
  const completedCount = KULINER_STEPS.filter(
    (s) => s.status === "COMPLETED",
  ).length;
  const progress = (completedCount / KULINER_STEPS.length) * 100;
  const meta = CARD_META["roadmap"];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white rounded-xl p-4 md:p-6 border border-amber-200 shadow-sm">
        <div className="flex items-start gap-4">
          <div
            className={`w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-br ${meta.gradientClass} flex items-center justify-center shadow-lg`}
          >
            {React.cloneElement(
              meta.icon as React.ReactElement<{
                size?: number;
                className?: string;
              }>,
              {
                size: 36,
                className: "text-white",
              },
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-2">
              Guide to Grow
            </h1>
            <p className="text-sm md:text-base text-gray-600 mb-4">
              Kuliner • {user.businessName}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-600 font-medium">
                  Progress Formalisasi
                </span>
                <span className="text-amber-600 font-bold">
                  {completedCount}/{KULINER_STEPS.length} Step
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {Math.round(progress)}% Selesai
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="bg-white rounded-xl p-4 md:p-6 border border-amber-200 shadow-sm">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Map size={20} className="text-amber-500" />
          Roadmap Legalitas
        </h2>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-amber-100 z-0" />
          <div className="space-y-4 relative z-10">
            {KULINER_STEPS.map((step) => {
              const isCompleted = step.status === "COMPLETED";
              const isUnlocked = step.status === "UNLOCKED";
              const isLocked = step.status === "LOCKED";

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
                        step.icon
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
                        <h3
                          className={`font-bold text-sm md:text-base ${
                            isLocked ? "text-gray-400" : "text-gray-800"
                          }`}
                        >
                          {step.label}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold w-fit ${
                            isLocked
                              ? "bg-gray-100 text-gray-400"
                              : isCompleted
                                ? "bg-green-100 text-green-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {isCompleted
                            ? "✅ Selesai"
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

                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div
                          className={`flex items-center gap-1 ${isLocked ? "text-gray-400" : "text-gray-500"}`}
                        >
                          <Wallet size={13} />
                          {step.cost}
                        </div>
                        <div
                          className={`flex items-center gap-1 ${isLocked ? "text-gray-400" : "text-gray-500"}`}
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

                      {isUnlocked && (
                        <button
                          onClick={() => onOpenChat(step.id)}
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

      {/* Benefit Map Preview */}
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
    </div>
  );
};