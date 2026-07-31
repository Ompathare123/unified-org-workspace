import React from "react";

export type StatusType = "Open" | "In Progress" | "Resolved" | "Closed";

interface StatusBadgeProps {
  status: StatusType | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case "Open":
        return "bg-[#EBF3FF] text-[#0066FF] border-[#D5E5FF]";
      case "In Progress":
        return "bg-[#E6F4EA] text-[#137333] border-[#CEEAD6]";
      case "Resolved":
        return "bg-[#F1F3F4] text-[#5F6368] border-[#E8EAED]";
      case "Closed":
        return "bg-[#E8EAED] text-[#3C4043] border-[#DADCE0]";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <span
      className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-md border text-center transition-all ${getBadgeStyle()}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
