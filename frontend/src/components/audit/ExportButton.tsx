import React from "react";
import { Download } from "lucide-react";

interface ExportButtonProps {
  onClick?: () => void;
  label?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  onClick,
  label = "Export",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
    >
      <Download className="w-4 h-4 text-slate-500" />
      <span>{label}</span>
    </button>
  );
};

export default ExportButton;
