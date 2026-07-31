import React from "react";

export type PriorityType = "High" | "Medium" | "Low";

interface PriorityBadgeProps {
  priority: PriorityType | string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getDotColor = () => {
    switch (priority) {
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-amber-500";
      case "Low":
        return "bg-emerald-500";
      default:
        return "bg-slate-400";
    }
  };

  return (
    <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
      <span className={`w-2 h-2 rounded-full ${getDotColor()}`} />
      <span>{priority}</span>
    </div>
  );
};

export default PriorityBadge;
