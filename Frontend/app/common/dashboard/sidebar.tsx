import React from "react";
import {
  Home,
  Map,
  Shield,
  MessageCircle,
  DollarSign,
  LogOut,
  X,
  User,
} from "lucide-react";
import type { Page, UserProfile } from "../../components/Dashboard/types";

interface SidebarProps {
  user: UserProfile;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

const NAV_ITEMS = [
  { page: "dashboard" as Page, label: "Home", icon: Home },
  { page: "roadmap" as Page, label: "Guide to Grow", icon: Map },
  { page: "scanner" as Page, label: "Scanner", icon: Shield },
  { page: "chat" as Page, label: "Ask Lexa", icon: MessageCircle },
  { page: "finance" as Page, label: "Financial Record", icon: DollarSign },
];

const LEVEL_LABELS: Record<string, string> = {
  STARTER: "⭐ Starter",
  GROWING: "🌱 Growing",
  ESTABLISHED: "🏢 Established",
  PRO: "🏆 Pro",
  ENTERPRISE: "💎 Enterprise",
};

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  currentPage,
  onNavigate,
  isOpen,
  onClose,
  isMobile = false,
}) => {
  const content = (
    <div
      className="h-screen flex flex-col bg-white border-r border-amber-200 p-5 w-56"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 shrink-0 rounded-xl bg-white flex items-center justify-center shadow-lg overflow-hidden">
            <img
              src="/favicon.ico"
              alt="GrowKM Logo"
              className="w-10 h-10 object-contain scale-250"
            />
          </div>
          <div>
            <h2 className="font-black text-amber-600 text-base leading-none">
              GrowKM
            </h2>
            <p className="text-[11px] text-gray-500">UMKM Berbasis AI</p>
          </div>
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-amber-50 rounded-lg"
          >
            <X size={20} className="text-gray-600" />
          </button>
        )}
      </div>

      <button
        onClick={() => {
          onNavigate("profile");
          if (isMobile) onClose();
        }}
        className="py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors mb-6 text-xs border-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white border-transparent shadow-md hover:shadow-lg"
      >
        <User size={14} />
        Profil Usaha
      </button>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
          const active = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => {
                onNavigate(page);
                if (isMobile) onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all ${
                active
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md"
                  : "text-gray-700 hover:bg-amber-50"
              }`}
            >
              <span className={active ? "text-white" : "text-amber-500"}>
                <Icon size={18} />
              </span>
              {label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="pt-4 border-t border-amber-100 space-y-1">
        <button
          onClick={() => {
            window.location.href = "/";
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-all text-red-500 hover:bg-red-50"
        >
          <LogOut size={18} /> Keluar
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />
        )}
        <div
          className={`fixed left-0 top-0 z-50 transition-transform duration-300 md:hidden ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ width: "18rem" }}
        >
          {/* wider mobile variant */}
          <div
            className="h-screen flex flex-col bg-white border-r border-amber-200 p-5 w-72"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-white flex items-center justify-center shadow-lg overflow-hidden">
                  <img
                    src="/favicon.ico"
                    alt="GrowKM Logo"
                    className="w-10 h-10 object-contain scale-250"
                  />
                </div>
                <div>
                  <h2 className="font-black text-gray-900 text-base leading-none">
                    GrowKM
                  </h2>
                  <p className="text-[11px] text-gray-500">UMKM Copilot</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-amber-50 rounded-lg"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <button
              onClick={() => {
                onNavigate("profile");
                if (isMobile) onClose();
              }}
              className="py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors mb-6 text-xs border-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white border-transparent shadow-md hover:shadow-lg"
            >
              <User size={14} />
              Profil Usaha
            </button>

            <nav className="flex-1 space-y-1">
              {NAV_ITEMS.map(({ page, label, icon: Icon }) => {
                const active = currentPage === page;
                return (
                  <button
                    key={page}
                    onClick={() => {
                      onNavigate(page);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg font-bold text-sm transition-all ${
                      active
                        ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-amber-50"
                    }`}
                  >
                    <span className={active ? "text-white" : "text-amber-500"}>
                      <Icon size={18} />
                    </span>
                    {label}
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-amber-100">
              <button
                onClick={() => {
                  window.location.href = "/";
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg font-bold text-sm text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut size={18} /> Keluar
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className={`fixed left-0 top-0 z-50 transition-transform duration-300 hidden md:block ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {content}
    </div>
  );
};