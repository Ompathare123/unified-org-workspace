import React, { useState } from "react";
import { ChevronDown, User, LogOut, Settings, Shield, Users, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserDropdownProps {
  userName?: string;
  role?: string;
  avatarInitials?: string;
  onLogout?: () => void;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  userName = "John S.",
  role = "Admin",
  avatarInitials,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return "U";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = avatarInitials || getInitials(userName);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer"
      >
        {/* Avatar Circle */}
        <div className="w-8 h-8 rounded-full bg-[#0066FF] text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
          {initials}
        </div>

        {/* User Name & Role */}
        <span className="hidden sm:inline-block text-xs sm:text-sm font-semibold text-[#0F172A]">
          {userName} <span className="text-[#64748B] font-normal">({role})</span>
        </span>

        <ChevronDown className="w-3.5 h-3.5 text-[#64748B] hidden sm:inline-block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-[#E2E8F0] shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3.5 py-2 border-b border-[#F1F5F9] mb-1">
            <p className="text-xs font-bold text-[#0F172A]">{userName}</p>
            <p className="text-[11px] text-[#64748B] flex items-center gap-1 mt-0.5">
              <Shield className="w-3 h-3 text-[#0066FF]" />
              <span>Role: {role}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              navigate("/members");
            }}
            className="w-full text-left px-3.5 py-2 text-xs text-[#334155] hover:bg-[#F8FAFC] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Organization Members</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              navigate("/invitations");
            }}
            className="w-full text-left px-3.5 py-2 text-xs text-[#334155] hover:bg-[#F8FAFC] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-[#64748B]" />
            <span>My Invitations</span>
          </button>

          <button
            type="button"
            className="w-full text-left px-3.5 py-2 text-xs text-[#334155] hover:bg-[#F8FAFC] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Profile Settings</span>
          </button>

          <button
            type="button"
            className="w-full text-left px-3.5 py-2 text-xs text-[#334155] hover:bg-[#F8FAFC] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Preferences</span>
          </button>

          <div className="my-1 border-t border-[#F1F5F9]" />

          <button
            type="button"
            onClick={onLogout}
            className="w-full text-left px-3.5 py-2 text-xs text-[#EF4444] hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer font-semibold"
          >
            <LogOut className="w-3.5 h-3.5 text-[#EF4444]" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
