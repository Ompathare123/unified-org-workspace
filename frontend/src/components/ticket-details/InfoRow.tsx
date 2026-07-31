import React from "react";

interface InfoRowProps {
  label: string;
  children: React.ReactNode;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, children }) => {
  return (
    <div className="space-y-1">
      <span className="block text-[11.5px] font-semibold text-slate-500">{label}</span>
      <div className="text-xs font-medium text-slate-800">{children}</div>
    </div>
  );
};

export default InfoRow;
