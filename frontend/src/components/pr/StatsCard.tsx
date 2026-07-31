import React from "react";

interface StatsCardProps {
  icon: React.ReactNode;
  iconBg: string;
  value: string | number;
  title: string;
  subtitle: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  icon,
  iconBg,
  value,
  title,
  subtitle,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex items-start gap-4">
      <div
        className={`w-10 h-10 rounded-xl ${iconBg} text-white flex items-center justify-center shrink-0 shadow-2xs`}
      >
        {icon}
      </div>
      <div className="space-y-0.5">
        <div className="text-2xl font-extrabold text-[#0F172A] leading-tight">{value}</div>
        <div className="text-xs font-bold text-slate-800">{title}</div>
        <div className="text-[11px] text-slate-400 font-medium">{subtitle}</div>
      </div>
    </div>
  );
};

export default StatsCard;
