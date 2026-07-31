import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value = "",
  onChange,
  placeholder = "Search tickets...",
}) => {
  return (
    <div className="relative w-full sm:w-64 md:w-72">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-3.5 pr-9 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/15 transition-all"
      />
      <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
};

export default SearchBar;
