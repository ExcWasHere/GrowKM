import React from "react";
import { Home, Map, Shield, MessageCircle, DollarSign, BarChart2 } from "lucide-react";
import type { Page } from "../../components/Dashboard/types";

interface MobileBottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const TABS = [
  { page: "dashboard" as Page, label: "Home", icon: Home },
  { page: "roadmap" as Page, label: "Guide to Grow", icon: Map },
  { page: "scanner" as Page, label: "KBLI Matcher", icon: Shield },
  { page: "chat" as Page, label: "Lexa AI", icon: MessageCircle },
  { page: "finance" as Page, label: "Snap Cash", icon: DollarSign },
  { page: "market" as Page, label: "Market Gate", icon: BarChart2 },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPage,
  onNavigate,
}) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-200 md:hidden z-30 shadow-lg">
    <div className="grid grid-cols-6 gap-0.5 p-1.5">
      {TABS.map(({ page, label, icon: Icon }) => {
        const active = currentPage === page;
        return (
          <button
            key={page}
            data-tour={page}
            onClick={() => onNavigate(page)}
            className={`flex flex-col items-center gap-0.5 py-1.5 px-0.5 rounded-lg transition-all ${
              active
                ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                : "text-gray-600"
            }`}
          >
            <Icon size={17} />
            <span className="text-[8px] font-bold leading-none">{label}</span>
          </button>
        );
      })}
    </div>
  </div>
);