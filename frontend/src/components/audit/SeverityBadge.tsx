import React from "react";

export type SeverityType = "Critical" | "High" | "Medium" | "Low";

interface SeverityBadgeProps {
  severity: SeverityType | string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => {
  const getStyle = () => {
    switch (severity) {
      case "Critical":
        return "bg-[#FEF2F2] text-[#DC2626] border-[#FEE2E2]";
      case "High":
        return "bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]";
      case "Medium":
        return "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]";
      case "Low":
        return "bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <span
      className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md border text-center ${getStyle()}`}
    >
      {severity}
    </span>
  );
};

export default SeverityBadge;
