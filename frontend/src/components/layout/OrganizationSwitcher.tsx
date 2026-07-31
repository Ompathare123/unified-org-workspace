import React, { useState } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  role?: string;
}

interface OrganizationSwitcherProps {
  currentOrgName?: string;
  organizations?: Organization[];
  onOrgSelect?: (org: Organization) => void;
}

export const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({
  currentOrgName = "Acme Corp",
  organizations = [
    { id: "1", name: "Acme Corp" },
    { id: "2", name: "Globex" },
    { id: "3", name: "Stark Industries" },
  ],
  onOrgSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (org: Organization) => {
    setIsOpen(false);
    if (onOrgSelect) {
      onOrgSelect(org);
    }
  };

  const activeName = currentOrgName || (organizations.length > 0 ? organizations[0].name : "Acme Corp");

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-xs sm:text-sm transition-colors cursor-pointer shadow-2xs"
      >
        <Building2 className="w-4 h-4 text-[#64748B]" />
        <span className="text-[#475569]">
          Current Org:{" "}
          <strong className="font-bold text-[#0F172A]">{activeName}</strong>
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#64748B] ml-1" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white border border-[#E2E8F0] shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
            Switch Organization
          </div>
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => handleSelect(org)}
              className="w-full text-left px-3.5 py-2 text-xs text-[#334155] hover:bg-[#F8FAFC] flex items-center justify-between transition-colors font-medium cursor-pointer"
            >
              <span>{org.name}</span>
              {activeName === org.name && (
                <Check className="w-3.5 h-3.5 text-[#0066FF]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizationSwitcher;
