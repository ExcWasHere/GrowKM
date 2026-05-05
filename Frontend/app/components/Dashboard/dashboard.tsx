import React, { useState } from "react";
import { Menu } from "lucide-react";
import type { Page } from "./types";
import { SAMPLE_USER } from "./constants";
import { Sidebar } from "../../common/dashboard/sidebar";
import { MobileBottomNav } from "../../common/dashboard/MobileBottomNav";
import { DashboardPage } from "../../components/Dashboard/pages/DashboardPage";
import { RoadmapPage } from "../../components/Dashboard/pages/RoadmapPage";
import { ChatPage } from "../../components/Dashboard/pages/ChatPage";
import { ScannerPage } from "../../components/Dashboard/pages/ScannerPage";
import { FinancePage } from "../../components/Dashboard/pages/FinancePage";

const PAGE_TITLES: Record<Page, string> = {
  dashboard: "Beranda GrowKM",
  roadmap: "Guide to Grow",
  chat: "Tanya AI Copilot",
  scanner: "Compliance Scanner",
  finance: "Financial Record",
};

export default function GrowKMDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [chatContext, setChatContext] = useState<string | undefined>(undefined);
  const user = SAMPLE_USER;

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
        return <DashboardPage user={user} onNavigate={handleNavigate} />;
      case "roadmap":
        return <RoadmapPage user={user} onOpenChat={handleOpenChat} />;
      case "chat":
        return <ChatPage user={user} initialContext={chatContext} />;
      case "scanner":
        return <ScannerPage user={user} />;
      case "finance":
        return <FinancePage user={user} />;
    }
  };

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
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          user={user}
          isOpen={isSidebarOpen}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sidebar
        user={user}
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
        {/* Header */}
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

        {/* Page Content */}
        {renderPage()}
      </main>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
}