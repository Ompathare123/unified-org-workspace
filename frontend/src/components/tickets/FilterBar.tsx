import React from "react";
import SearchBar from "./SearchBar";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  priorityFilter: string;
  onPriorityChange: (priority: string) => void;
  orgFilter: string;
  onOrgChange: (org: string) => void;
  assigneeFilter: string;
  onAssigneeChange: (assignee: string) => void;
  onClearAll: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  orgFilter,
  onOrgChange,
  assigneeFilter,
  onAssigneeChange,
  onClearAll,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 my-6">
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        {/* Search Input */}
        <SearchBar value={searchQuery} onChange={onSearchChange} />

        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="appearance-none h-10 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none focus:border-[#0066FF] cursor-pointer"
          >
            <option value="All">Status: All</option>
            <option value="Open">Status: Open</option>
            <option value="In Progress">Status: In Progress</option>
            <option value="Resolved">Status: Resolved</option>
            <option value="Closed">Status: Closed</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Priority Dropdown */}
        <div className="relative">
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="appearance-none h-10 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none focus:border-[#0066FF] cursor-pointer"
          >
            <option value="All">Priority: All</option>
            <option value="High">Priority: High</option>
            <option value="Medium">Priority: Medium</option>
            <option value="Low">Priority: Low</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Requester Org Dropdown */}
        <div className="relative">
          <select
            value={orgFilter}
            onChange={(e) => onOrgChange(e.target.value)}
            className="appearance-none h-10 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none focus:border-[#0066FF] cursor-pointer"
          >
            <option value="Acme Corp">Requester Org: Acme Corp</option>
            <option value="Stark Industries">Requester Org: Stark Industries</option>
            <option value="Wayne Enterprises">Requester Org: Wayne Enterprises</option>
            <option value="All">Requester Org: All</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Assignee Filter Dropdown */}
        <div className="relative">
          <select
            value={assigneeFilter}
            onChange={(e) => onAssigneeChange(e.target.value)}
            className="appearance-none h-10 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none focus:border-[#0066FF] cursor-pointer"
          >
            <option value="All">Assignee: All</option>
            <option value="Me">Assignee: Assigned to Me</option>
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

        {/* Clear All Link */}
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-semibold text-[#0066FF] hover:underline px-1 py-1 cursor-pointer"
        >
          Clear all
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
