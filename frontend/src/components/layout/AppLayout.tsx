import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import TopNavbar from "./TopNavbar";
import type { DashboardMode } from "./DashboardSwitcher";
import { useAuth } from "@/context/AuthContext";
import type { Organization } from "@/context/AuthContext";

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, activeOrg, organizations, setActiveOrg, logout } = useAuth();

  const mode: DashboardMode = location.pathname.startsWith("/prs") ? "prs" : "tickets";

  const handleModeChange = (newMode: DashboardMode) => {
    if (newMode === "prs") {
      navigate("/prs");
    } else {
      navigate("/tickets");
    }
  };

  const handleOrgSelect = (org: Organization) => {
    try {
      setActiveOrg(org);
      queryClient.invalidateQueries();
      toast.success(`Switched organization to ${org.name}`);
    } catch {
      toast.error("Failed to switch organization");
    }
  };

  const displayName = user?.fullName || "John S.";
  const displayOrg = activeOrg?.name || "Acme Corp";

  const displayRole = activeOrg?.role === "ORG_ADMIN" 
    ? "Admin" 
    : activeOrg?.role === "SUPPORT_AGENT"
    ? "Support Agent"
    : activeOrg?.role === "PLATFORM_ADMIN"
    ? "Platform Admin"
    : activeOrg?.role === "CROSS_ORG_GUEST"
    ? "Guest"
    : activeOrg?.role
      ? activeOrg.role.charAt(0).toUpperCase() + activeOrg.role.slice(1).toLowerCase()
      : "Member";

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans antialiased text-[#0F172A]">
      {/* Top Navbar */}
      <TopNavbar
        currentMode={mode}
        onModeChange={handleModeChange}
        currentOrgName={displayOrg}
        organizations={organizations}
        onOrgSelect={handleOrgSelect}
        userName={displayName}
        role={displayRole}
        unreadNotifications={5}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
