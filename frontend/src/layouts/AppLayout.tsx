import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Ticket,
  GitPullRequest,
  ShieldAlert,
  Bell,
  Sparkles,
  Network,
  LogOut,
  Building2,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import Logo from "@/components/common/Logo";
import { useAuth } from "@/context/AuthContext";


const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Tickets", path: "/tickets", icon: Ticket },
  { label: "Pull Requests", path: "/prs", icon: GitPullRequest },
  { label: "Audit Console", path: "/audit", icon: ShieldAlert },
  { label: "Notifications", path: "/notifications", icon: Bell },
  { label: "AI Progress Digest", path: "/digest", icon: Sparkles },
  { label: "Cross-Org Connections", path: "/connections", icon: Network },
];

export const AppLayout: React.FC = () => {
  const { user, organizations, activeOrg, setActiveOrg, logout } = useAuth();
  const location = useLocation();


  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header / Logo */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800">
          <Logo size={36} />
          <div>
            <div className="font-bold text-sm text-white tracking-tight">Unified Workspace</div>
            <div className="text-[11px] text-blue-400 font-medium">Enterprise Hub</div>
          </div>
        </div>

        {/* Organization Switcher */}
        <div className="px-4 py-3 border-b border-slate-800 relative">
          <label className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider block mb-1.5 px-2">
            Active Organization
          </label>
          <button
            onClick={() => setOrgDropdownOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 hover:bg-slate-700/80 rounded-lg text-xs text-white transition-colors border border-slate-700"
          >
            <div className="flex items-center gap-2 truncate">
              <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="font-medium truncate">{activeOrg?.name || "Select Org"}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {orgDropdownOpen && (
            <div className="absolute left-4 right-4 top-16 z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 text-xs">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    setActiveOrg(org);
                    setOrgDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-700 ${
                    org.id === activeOrg?.id ? "text-blue-400 font-semibold bg-slate-750" : "text-slate-300"
                  }`}
                >
                  <span className="truncate">{org.name}</span>
                  {org.role && (
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                      {org.role}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/30 font-semibold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="truncate">
              <div className="text-xs font-medium text-white truncate">{user?.fullName}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between">
          <button onClick={() => setMobileMenuOpen((v) => !v)} className="p-1.5 text-gray-600">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="font-bold text-sm text-gray-900">{activeOrg?.name}</div>
          <div className="w-6" />
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
