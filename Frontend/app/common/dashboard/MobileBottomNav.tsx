import React from "react";
import { Home, Map, Shield, MessageCircle, DollarSign } from "lucide-react";
import type { Page } from "../../components/Dashboard/types";

interface MobileBottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const TABS = [
  { page: "dashboard" as Page, label: "Beranda", icon: Home },
  { page: "roadmap" as Page, label: "Roadmap", icon: Map },
  { page: "scanner" as Page, label: "Scanner", icon: Shield },
  { page: "chat" as Page, label: "Chat AI", icon: MessageCircle },
  { page: "finance" as Page, label: "Keuangan", icon: DollarSign },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPage,
  onNavigate,
}) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-200 md:hidden z-30 shadow-lg">
    <div className="grid grid-cols-5 gap-0.5 p-2">
      {TABS.map(({ page, label, icon: Icon }) => {
        const active = currentPage === page;
        return (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all ${
              active
                ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                : "text-gray-600"
            }`}
          >
            <Icon size={20} />
            <span className="text-[9px] font-bold leading-none">{label}</span>
          </button>
        );
      })}
    </div>
  </div>
);