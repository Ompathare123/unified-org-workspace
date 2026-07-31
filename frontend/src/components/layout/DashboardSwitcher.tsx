import React, { useState } from "react";
import { MessageSquareText, Code2 } from "lucide-react";

export type DashboardMode = "tickets" | "prs";

interface DashboardSwitcherProps {
  currentMode?: DashboardMode;
  onModeChange?: (mode: DashboardMode) => void;
}

export const DashboardSwitcher: React.FC<DashboardSwitcherProps> = ({
  currentMode = "tickets",
  onModeChange,
}) => {
  const [activeMode, setActiveMode] = useState<DashboardMode>(currentMode);

  const handleSelect = (mode: DashboardMode) => {
    setActiveMode(mode);
    if (onModeChange) {
      onModeChange(mode);
    }
  };

  return (
    <div className="inline-flex items-center p-1 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-2xs">
      {/* Support Hub (Tickets) Button */}
      <button
        type="button"
        onClick={() => handleSelect("tickets")}
        className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
          activeMode === "tickets"
            ? "bg-[#0066FF] text-white shadow-[0_2px_8px_rgba(0,102,255,0.25)]"
            : "text-[#475569] hover:text-[#0F172A] hover:bg-slate-200/50"
        }`}
      >
        <span
          className={`flex items-center justify-center rounded-lg w-5 h-5 ${
            activeMode === "tickets" ? "bg-white/20 text-white" : "text-[#475569]"
          }`}
        >
          <MessageSquareText className="w-3.5 h-3.5" />
        </span>
        <span>Support Hub (Tickets)</span>
      </button>

      {/* Review & Audit Console (PRs) Button */}
      <button
        type="button"
        onClick={() => handleSelect("prs")}
        className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
          activeMode === "prs"
            ? "bg-[#0066FF] text-white shadow-[0_2px_8px_rgba(0,102,255,0.25)]"
            : "text-[#475569] hover:text-[#0F172A] hover:bg-slate-200/50"
        }`}
      >
        <Code2
          className={`w-4 h-4 ${
            activeMode === "prs" ? "text-white" : "text-[#475569]"
          }`}
        />
        <span>Review & Audit Console (PRs)</span>
      </button>
    </div>
  );
};

export default DashboardSwitcher;
