import React from "react";
import { TrendingUp, Map, } from "lucide-react";
import type { Page } from "../../components/Dashboard/types";
import { FEATURE_CARDS } from "../../components/Dashboard/constants";
import { CARD_META } from "./featureMeta";

interface FeatureGridProps {
  onNavigate: (page: Page) => void;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white rounded-xl p-4 md:p-8 border border-amber-200 shadow-sm">
      {/* Section Header */}
      <h2 className="flex items-center gap-3 text-amber-800 font-bold text-sm uppercase tracking-widest mb-5 md:mb-6">
        <TrendingUp size={16} className="text-orange-500" />
        Fitur GrowKM
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {FEATURE_CARDS.map((card) => {
          const meta = CARD_META[card.id] ?? {
            icon: <Map size={20} />,
            badge: card.title,
            badgeClass: "bg-amber-100 text-amber-800",
            iconClass: "bg-amber-100 text-amber-700",
            desc: card.description,
          };

          const pct = card.total > 0
            ? Math.min((card.completed / card.total) * 100, 100)
            : 0;

          return (
            <button
              key={card.id}
              onClick={() => onNavigate(card.page)}
              className="group text-left bg-amber-50 hover:bg-white border border-amber-200 hover:border-amber-400 rounded-2xl p-4 md:p-5 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-amber-100"
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.iconClass}`}
                >
                  {meta.icon}
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${meta.badgeClass}`}
                >
                  {meta.badge}
                </span>
              </div>

              {/* Title */}
              <div>
                <p className="font-bold text-sm md:text-base text-gray-900 leading-tight mb-1">
                  {card.title}
                </p>
                <p className="text-xs text-amber-700 leading-relaxed hidden md:block">
                  {meta.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};