import React from "react";
import { Clock, Check, GitMerge, XCircle, FileText } from "lucide-react";

export type PRStatusType = "In Review" | "Waiting" | "Approved" | "Merged" | "Rejected" | "Draft";

interface PRStatusBadgeProps {
  status: PRStatusType | string;
}

export const PRStatusBadge: React.FC<PRStatusBadgeProps> = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case "In Review":
        return {
          style: "bg-[#EBF3FF] text-[#0066FF] border-[#D5E5FF]",
          icon: <Clock className="w-3 h-3 text-[#0066FF]" />,
        };
      case "Waiting":
        return {
          style: "bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]",
          icon: <Clock className="w-3 h-3 text-[#EA580C]" />,
        };
      case "Approved":
        return {
          style: "bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]",
          icon: <Check className="w-3 h-3 text-[#16A34A] stroke-[2.5]" />,
        };
      case "Merged":
        return {
          style: "bg-[#ECFDF5] text-[#059669] border-[#D1FAE5]",
          icon: <GitMerge className="w-3 h-3 text-[#059669]" />,
        };
      case "Rejected":
      case "REJECTED":
        return {
          style: "bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]",
          icon: <XCircle className="w-3 h-3 text-[#DC2626]" />,
          label: "Changes Requested",
        };
      case "Draft":
        return {
          style: "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]",
          icon: <FileText className="w-3 h-3 text-[#64748B]" />,
        };
      default:
        return {
          style: "bg-slate-100 text-slate-700 border-slate-200",
          icon: null,
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11.5px] font-semibold whitespace-nowrap ${config.style}`}
    >
      {config.icon}
      <span>{config.label || status}</span>
    </span>
  );
};

export default PRStatusBadge;
