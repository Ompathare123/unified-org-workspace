import React from "react";
import { Search } from "lucide-react";

interface AuditSearchProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export const AuditSearch: React.FC<AuditSearchProps> = ({
  label,
  value,
  onChange,
  placeholder = "Search...",
}) => {
  return (
    <div className="space-y-1.5 w-full">
      <label className="block text-[11.5px] font-semibold text-slate-600">{label}</label>
      <div className="relative w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none focus:border-[#0066FF]"
        />
        <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
};

export default AuditSearch;
