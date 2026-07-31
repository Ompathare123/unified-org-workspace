import React from "react";
import PRSearch from "./PRSearch";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

interface PRFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  authorFilter: string;
  onAuthorChange: (author: string) => void;
  branchFilter: string;
  onBranchChange: (branch: string) => void;
}

export const PRFilters: React.FC<PRFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  authorFilter,
  onAuthorChange,
  branchFilter,
  onBranchChange,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 my-4">
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        {/* Search Input */}
        <PRSearch value={searchQuery} onChange={onSearchChange} />

        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none h-10 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none focus:border-[#0066FF] cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="In Review">Status: In Review</option>
            <option value="Waiting">Status: Waiting</option>
            <option value="Approved">Status: Approved</option>
            <option value="Merged">Status: Merged</option>
            <option value="Rejected">Status: Rejected</option>
            <option value="Draft">Status: Draft</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Author Dropdown */}
        <div className="relative">
          <select
            value={authorFilter}
            onChange={(e) => onAuthorChange(e.target.value)}
            className="appearance-none h-10 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none focus:border-[#0066FF] cursor-pointer"
          >
            <option value="All">Author: All</option>
            <option value="Alex R. (Globex)">Author: Alex R. (Globex)</option>
            <option value="Meera K. (Acme)">Author: Meera K. (Acme)</option>
            <option value="Dev P. (Acme)">Author: Dev P. (Acme)</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Target Branch Dropdown */}
        <div className="relative">
          <select
            value={branchFilter}
            onChange={(e) => onBranchChange(e.target.value)}
            className="appearance-none h-10 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none focus:border-[#0066FF] cursor-pointer"
          >
            <option value="All">Target Branch: All</option>
            <option value="main">main</option>
            <option value="develop">develop</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filters Button */}
        <button
          type="button"
          className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span>Filters</span>
        </button>
      </div>
    </div>
  );
};

export default PRFilters;
