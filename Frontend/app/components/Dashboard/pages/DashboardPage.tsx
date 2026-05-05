import React from "react";
import { TrendingUp, Award, Check, Clock } from "lucide-react";
import type { UserProfile } from "../../Dashboard/types";
import type { Page } from "../../Dashboard/types";
import { FEATURE_CARDS, BADGES, RECENT_ACTIONS, LEVEL_CONFIG } from "../../Dashboard/constants";

interface DashboardPageProps {
  user: UserProfile;
  onNavigate: (page: Page) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onNavigate }) => {
  const levelCfg = LEVEL_CONFIG[user.level];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
      {/* Main Content */}
      <div className="lg:col-span-8 space-y-4 md:space-y-6">
        {/* Level/Progress Banner */}
        <div className="bg-white rounded-xl p-4 md:p-6 border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Level Usaha</p>
              <h3 className="font-bold text-gray-800 text-base md:text-lg">
                {levelCfg.emoji} {levelCfg.label}
              </h3>
              <p className="text-xs text-gray-500">{user.businessType} • {user.city}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Formalisasi</p>
              <p className="font-black text-2xl text-amber-500">{user.progressPercent}%</p>
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

        {/* Profile Card - Mobile Only */}
        <ProfileCard user={user} className="lg:hidden" />

        {/* Feature Grid */}
        <div className="bg-white rounded-xl p-4 md:p-8 border border-amber-200 shadow-sm">
          <h2 className="text-gray-800 font-bold text-base md:text-lg uppercase tracking-wider mb-4 md:mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-amber-500" />
            FITUR GROWKM
          </h2>
          <div className="grid grid-cols-2 gap-3 md:gap-5">
            {FEATURE_CARDS.map((card) => (
              <div
                key={card.id}
                className="group cursor-pointer"
                onClick={() => onNavigate(card.page)}
              >
                <div
                  className={`relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br ${card.color} p-4 md:p-6 flex flex-col items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-105`}
                >
                  <div className="text-3xl md:text-5xl mb-2 md:mb-3">{card.icon}</div>
                  <h3 className="font-bold text-xs md:text-base text-center leading-tight">
                    {card.title}
                  </h3>
                  <p className="text-[10px] md:text-xs text-white/80 text-center mt-1 hidden md:block">
                    {card.description}
                  </p>
                  <div className="mt-3 md:mt-4 w-full bg-white/30 rounded-full h-1.5 md:h-2">
                    <div
                      className="bg-white h-full rounded-full transition-all"
                      style={{ width: `${Math.min((card.completed / card.total) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] md:text-xs mt-1 md:mt-2 text-white/90">
                    {card.completed}/{card.total}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges - Mobile */}
        <BadgesCard className="lg:hidden" />

        {/* Recent Activity - Mobile */}
        <RecentActivityCard className="lg:hidden" />
      </div>

      {/* Sidebar Content - Desktop Only */}
      <div className="hidden lg:block lg:col-span-4 space-y-6">
        <ProfileCard user={user} />
        <BadgesCard />
        <RecentActivityCard />
      </div>
    </div>
  );
};

const ProfileCard: React.FC<{ user: UserProfile; className?: string }> = ({ user, className = "" }) => {
  const levelCfg = LEVEL_CONFIG[user.level];
  return (
    <div className={`bg-white rounded-xl p-6 md:p-8 border border-amber-200 text-center relative overflow-hidden shadow-sm ${className}`}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
      <p className="text-amber-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-4 md:mb-6">
        Profil Usaha
      </p>
      <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 rounded-full border-4 border-amber-100 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg">
        {user.name.charAt(0)}
      </div>
      <h4 className="font-bold text-base md:text-lg text-gray-800 mb-1">{user.name}</h4>
      <p className="text-gray-500 text-xs font-medium mb-1">{user.businessName}</p>
      <p className="text-gray-400 text-xs font-medium mb-4 md:mb-6">
        {user.businessType} • {user.city}
      </p>
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 py-3 md:py-4 rounded-lg border border-amber-100">
        <p className="text-[9px] uppercase font-bold text-amber-500 mb-1">Level Usaha</p>
        <p className="font-bold text-amber-600 text-xl md:text-2xl">
          {levelCfg.emoji} {levelCfg.label}
        </p>
      </div>
    </div>
  );
};

const BadgesCard: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 md:p-6 border-2 border-amber-200 shadow-sm ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <span className="text-xs font-bold text-orange-900 uppercase tracking-wider flex items-center gap-2">
        <Award size={16} />
        Pencapaian
      </span>
    </div>
    <div className="space-y-2 md:space-y-3">
      {BADGES.map((badge, idx) => (
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
            <p className="text-xs md:text-sm font-bold text-gray-800">{badge.name}</p>
          </div>
          {badge.earned && <Check size={16} className="text-green-500" />}
        </div>
      ))}
    </div>
  </div>
);

const RecentActivityCard: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-white rounded-xl p-4 md:p-6 border border-amber-200 shadow-sm ${className}`}>
    <h3 className="font-bold text-sm text-gray-800 mb-4 uppercase tracking-wider">
      Aktivitas Terakhir
    </h3>
    <div className="space-y-3">
      {RECENT_ACTIONS.map((action, idx) => (
        <div
          key={idx}
          className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100"
        >
          <div
            className={`w-10 h-10 rounded-lg ${
              action.completed
                ? "bg-gradient-to-br from-green-400 to-green-600"
                : "bg-gradient-to-br from-amber-300 to-amber-400"
            } flex items-center justify-center text-white`}
          >
            {action.completed ? <Check size={18} /> : <Clock size={18} />}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-800">{action.label}</p>
            <p className="text-[10px] text-gray-500">{action.detail}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);