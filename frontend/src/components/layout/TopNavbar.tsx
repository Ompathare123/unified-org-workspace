import React from "react";
import Logo from "./Logo";
import DashboardSwitcher from "./DashboardSwitcher";
import type { DashboardMode } from "./DashboardSwitcher";
import OrganizationSwitcher from "./OrganizationSwitcher";
import NotificationBell from "./NotificationBell";
import UserDropdown from "./UserDropdown";


interface TopNavbarProps {
  currentMode?: DashboardMode;
  onModeChange?: (mode: DashboardMode) => void;
  currentOrgName?: string;
  organizations?: any[];
  onOrgSelect?: (org: any) => void;
  userName?: string;
  role?: string;
  unreadNotifications?: number;
  onLogout?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentMode = "tickets",
  onModeChange,
  currentOrgName = "Acme Corp",
  organizations,
  onOrgSelect,
  userName = "John S.",
  role = "Admin",
  unreadNotifications = 5,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E2E8F0] shadow-xs">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
        {/* Left: Logo & Subtitle */}
        <div className="flex items-center shrink-0">
          <Logo />
        </div>

        {/* Center: Dashboard Switcher (Hidden on small mobile, visible on tablet/desktop) */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <DashboardSwitcher currentMode={currentMode} onModeChange={onModeChange} />
        </div>

        {/* Right: Organization Switcher, Notification Bell, User Dropdown */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="hidden sm:block">
            <OrganizationSwitcher
              currentOrgName={currentOrgName}
              organizations={organizations}
              onOrgSelect={onOrgSelect}
            />
          </div>
          <NotificationBell unreadCount={unreadNotifications} />
          <UserDropdown userName={userName} role={role} onLogout={onLogout} />
        </div>
      </div>


      {/* Mobile Dashboard Switcher Bar (Shown on small screens) */}
      <div className="md:hidden flex items-center justify-center pb-3 px-4 border-t border-slate-100 pt-2 bg-slate-50/50">
        <DashboardSwitcher currentMode={currentMode} onModeChange={onModeChange} />
      </div>
    </header>
  );
};

export default TopNavbar;
