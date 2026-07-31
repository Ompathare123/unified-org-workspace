import React, { useState } from "react";

export type TicketTabType = "comments" | "attachments" | "audit";

interface TicketTabsProps {
  commentsCount?: number;
  attachmentsCount?: number;
  activeTab?: TicketTabType;
  onTabChange?: (tab: TicketTabType) => void;
}

export const TicketTabs: React.FC<TicketTabsProps> = ({
  commentsCount = 3,
  attachmentsCount = 2,
  activeTab = "audit",
  onTabChange,
}) => {
  const [selectedTab, setSelectedTab] = useState<TicketTabType>(activeTab);

  const handleSelect = (tab: TicketTabType) => {
    setSelectedTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="border-b border-slate-200">
      <div className="flex items-center gap-8">
        {/* Comments Tab */}
        <button
          type="button"
          onClick={() => handleSelect("comments")}
          className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all relative cursor-pointer ${
            selectedTab === "comments"
              ? "text-[#0066FF] border-b-2 border-[#0066FF]"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Comments</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              selectedTab === "comments"
                ? "bg-[#EBF3FF] text-[#0066FF]"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {commentsCount}
          </span>
        </button>

        {/* Attachments Tab */}
        <button
          type="button"
          onClick={() => handleSelect("attachments")}
          className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all relative cursor-pointer ${
            selectedTab === "attachments"
              ? "text-[#0066FF] border-b-2 border-[#0066FF]"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Attachments</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              selectedTab === "attachments"
                ? "bg-[#EBF3FF] text-[#0066FF]"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {attachmentsCount}
          </span>
        </button>

        {/* Audit Log (Append-Only) Tab */}
        <button
          type="button"
          onClick={() => handleSelect("audit")}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all relative cursor-pointer ${
            selectedTab === "audit"
              ? "text-[#0066FF] border-b-2 border-[#0066FF]"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Audit Log (Append-Only)</span>
        </button>
      </div>
    </div>
  );
};

export default TicketTabs;
