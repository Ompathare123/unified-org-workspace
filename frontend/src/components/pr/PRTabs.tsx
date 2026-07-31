import React from "react";
import { LayoutDashboard, FileCode2, History, ListChecks, MessageSquareText } from "lucide-react";

export type PRTab = "Overview" | "Files Changed" | "Version History" | "Audit Log" | "Comments";

interface PRTabsProps {
  activeTab: PRTab;
  onChange: (tab: PRTab) => void;
  commentCount?: number;
  versionCount?: number;
}

export const PRTabs: React.FC<PRTabsProps> = ({ activeTab, onChange, commentCount = 0, versionCount = 0 }) => {
  const tabs: { id: PRTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "Overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "Files Changed", label: "Files Changed", icon: <FileCode2 className="w-4 h-4" /> },
    { id: "Version History", label: "Version History", icon: <History className="w-4 h-4" />, badge: versionCount },
    { id: "Audit Log", label: "Audit Log", icon: <ListChecks className="w-4 h-4" /> },
    { id: "Comments", label: "Comments", icon: <MessageSquareText className="w-4 h-4" />, badge: commentCount },
  ];

  return (
    <div className="flex space-x-1 border-b border-gray-200 overflow-x-auto custom-scrollbar no-scrollbar-print bg-white px-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex items-center gap-2 px-4 py-3 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-all shrink-0
            ${activeTab === tab.id 
              ? "border-purple-600 text-purple-700 bg-purple-50/50" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }
          `}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.id ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
