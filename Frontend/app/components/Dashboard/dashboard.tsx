import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Menu, Loader2, AlertCircle } from "lucide-react";
import type { Page } from "./types";
import { useUserProfile } from "../../hooks/useUserProfile";
import { supabase } from "../../lib/supabase";
import { Sidebar } from "../../common/dashboard/sidebar";
import { MobileBottomNav } from "../../common/dashboard/MobileBottomNav";
import { DashboardPage } from "../../components/Dashboard/pages/DashboardPage";
import { RoadmapPage } from "../../components/Dashboard/pages/RoadmapPage";
import { ChatPage } from "../../components/Dashboard/pages/ChatPage";
import { ScannerPage } from "../../components/Dashboard/pages/ScannerPage";
import { FinancePage } from "../../components/Dashboard/pages/FinancePage";
import { ProfilePage } from "../../components/Dashboard/pages/ProfilePage";

const PAGE_TITLES: Record<Page, string> = {
  dashboard: "Beranda GrowKM",
  roadmap:   "Guide to Grow",
  chat:      "Tanya Lexa AI",
  scanner:   "KBLI Matcher",
  finance:   "Financial Record",
  profile:   "Business Profile",
};

export default function GrowKMDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage]     = useState<Page>("dashboard");
  const [chatContext, setChatContext]      = useState<string | undefined>(undefined);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const {
    userProfile,
    businessProfile,
    authEmail,
    loadState,
    error,
    updateBusinessProfile,
    roadmapSteps,
    roadmapProgress,
    refetch,
  } = useUserProfile();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        const currentPath = window.location.pathname;
        navigate(`/sign-in?redirect=${encodeURIComponent(currentPath)}`, { replace: true });
        return;
      }

      setIsCheckingAuth(false);
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        const currentPath = window.location.pathname;
        navigate(`/sign-in?redirect=${encodeURIComponent(currentPath)}`, { replace: true });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Memuat...</p>
        </div>
      </div>
    );
  }

  const handleOpenChat = (stepId: string) => {
    setChatContext(stepId);
    setCurrentPage("chat");
  };

  const handleNavigate = (page: Page) => {
    if (page !== "chat") setChatContext(undefined);
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage
            user={userProfile}
            businessProfile={businessProfile}
            onNavigate={handleNavigate}
          />
        );
      case "roadmap":
        return (
          <RoadmapPage
            user={userProfile}
            steps={roadmapSteps}
            progressPercent={roadmapProgress}
            loadState={loadState}
            error={error}
            onOpenChat={handleOpenChat}
            onRefetch={refetch}
          />
        );
      case "chat":
        return <ChatPage user={userProfile} initialContext={chatContext} />;
      case "scanner":
        return <ScannerPage user={userProfile} />;
      case "finance":
        return <FinancePage user={userProfile} />;
      case "profile":
        return (
          <ProfilePage
            user={userProfile}
            businessProfile={businessProfile}
            authEmail={authEmail}
            onSave={updateBusinessProfile}
            onRoadmapRefresh={refetch}
          />
        );
    }
  };

  if (loadState === "idle" || loadState === "loading") {
    return (
      <div
        className="flex items-center justify-center min-h-screen gap-3"
        style={{ backgroundImage: 'url("/latar-belakang.svg")', backgroundSize: "cover" }}
      >
        <Loader2 size={28} className="animate-spin text-amber-500" />
        <span className="text-sm font-semibold text-gray-500">Memuat profil...</span>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ backgroundImage: 'url("/latar-belakang.svg")', backgroundSize: "cover" }}
      >
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 shadow-sm max-w-sm">
          <AlertCircle size={20} className="text-red-500 shrink-0" />
          <div>
            <p className="text-sm font-bold text-red-700">Gagal memuat data</p>
            <p className="text-xs text-red-500 mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-xs font-semibold text-amber-600 hover:text-amber-700 underline underline-offset-2"
            >
              Coba lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen"
      style={{
        fontFamily: "Inter, sans-serif",
        backgroundImage: 'url("/latar-belakang.svg")',
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="hidden md:block">
        <Sidebar
          user={userProfile}
          isOpen={isSidebarOpen}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      <Sidebar
        user={userProfile}
        isOpen={isSidebarOpen}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onClose={() => setIsSidebarOpen(false)}
        isMobile
      />

      <main
        className={`flex-1 transition-all duration-300 ease-in-out p-4 md:p-6 lg:p-10 pb-20 md:pb-10 ${
          isSidebarOpen ? "md:ml-56" : "md:ml-0"
        }`}
      >
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 md:p-2.5 bg-white rounded-lg border border-amber-200 hover:bg-amber-50 transition-all group shadow-sm"
          >
            <Menu size={20} className="text-amber-500 group-hover:text-orange-500" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent uppercase">
              {PAGE_TITLES[currentPage]}
            </h1>
            <p className="text-xs md:text-sm text-gray-600 font-medium">
              Solusi Digital untuk UMKM Indonesia
            </p>
          </div>
        </div>

        {renderPage()}
      </main>

      <MobileBottomNav currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
}