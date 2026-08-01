import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import DateRangePicker from "./DateRangePicker";
import AuditSearch from "./AuditSearch";
import { SlidersHorizontal, ChevronDown, Search } from "lucide-react";


interface AuditFilterPanelProps {
  onApplyFilters?: (filters: any) => void;
  onClearFilters?: () => void;
}

export const AuditFilterPanel: React.FC<AuditFilterPanelProps> = ({
  onApplyFilters,
  onClearFilters,
}) => {
  const [startDate, setStartDate] = useState("May 17, 2025");
  const [endDate, setEndDate] = useState("May 24, 2025");
  const [userFilter, setUserFilter] = useState("All Users");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [resourceTypeFilter, setResourceTypeFilter] = useState("All Types");
  const [orgFilter, setOrgFilter] = useState("All Organizations");
  const [entityIdSearch, setEntityIdSearch] = useState("");
  const [ipSearch, setIpSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("All Results");

  const { activeOrg, organizations } = useAuth();
  
  const { data: members } = useQuery({
    queryKey: ["orgMembers", activeOrg?.id],
    queryFn: async () => {
      const res = await api.get(`/orgs/members`);
      return res.data;
    },
    enabled: !!activeOrg?.id,
  });

  // Application Source Multi-select Dropdown
  const [appSourceOpen, setAppSourceOpen] = useState(false);
  const [selectedApps, setSelectedApps] = useState<string[]>([
    "Support Hub (Tickets)",
    "Review Console (PRs)",
  ]);

  const toggleApp = (app: string) => {
    if (selectedApps.includes(app)) {
      setSelectedApps(selectedApps.filter((a) => a !== app));
    } else {
      setSelectedApps([...selectedApps, app]);
    }
  };

  const handleClear = () => {
    setStartDate("");
    setEndDate("");
    setUserFilter("All Users");
    setActionFilter("All Actions");
    setResourceTypeFilter("All Types");
    setOrgFilter("All Organizations");
    setEntityIdSearch("");
    setIpSearch("");
    setResultFilter("All Results");
    setSelectedApps([]);
    onClearFilters?.();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4 mb-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span>Filters</span>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="text-xs font-semibold text-[#0066FF] hover:underline cursor-pointer"
        >
          Clear all filters
        </button>
      </div>

      {/* Grid Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Date Range Picker */}
        <div className="lg:col-span-2">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>

        {/* User */}
        <div className="space-y-1.5">
          <label className="block text-[11.5px] font-semibold text-slate-600">User</label>
          <div className="relative">
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full appearance-none h-10 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none focus:border-[#0066FF] cursor-pointer"
            >
              <option value="All Users">All Users</option>
              {members?.map((m: any) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.fullName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Action */}
        <div className="space-y-1.5">
          <label className="block text-[11.5px] font-semibold text-slate-600">Action</label>
          <div className="relative">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full appearance-none h-10 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none focus:border-[#0066FF] cursor-pointer"
            >
              <option value="All Actions">All Actions</option>
              <option value="Viewed Ticket">Viewed Ticket</option>
              <option value="Created Ticket">Created Ticket</option>
              <option value="Scoping Check Passed">Scoping Check Passed</option>
              <option value="Commented">Commented</option>
              <option value="Approved PR">Approved PR</option>
              <option value="Merged PR">Merged PR</option>
              <option value="User Login">User Login</option>
              <option value="Permission Denied">Permission Denied</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Resource Type */}
        <div className="space-y-1.5">
          <label className="block text-[11.5px] font-semibold text-slate-600">Resource Type</label>
          <div className="relative">
            <select
              value={resourceTypeFilter}
              onChange={(e) => setResourceTypeFilter(e.target.value)}
              className="w-full appearance-none h-10 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none focus:border-[#0066FF] cursor-pointer"
            >
              <option value="All Types">All Types</option>
              <option value="Ticket">Ticket</option>
              <option value="Pull Request">Pull Request</option>
              <option value="Security Check">Security Check</option>
              <option value="Comment">Comment</option>
              <option value="Auth">Auth</option>
              <option value="Audit Log">Audit Log</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Application Source (Checkbox Dropdown Popup like screenshot!) */}
        <div className="space-y-1.5 relative">
          <label className="block text-[11.5px] font-semibold text-slate-600">Application Source</label>
          <button
            type="button"
            onClick={() => setAppSourceOpen((v) => !v)}
            className="w-full h-10 px-3.5 rounded-xl border border-blue-500 bg-white text-xs font-semibold text-slate-800 flex items-center justify-between shadow-[0_0_0_2px_rgba(0,102,255,0.12)] cursor-pointer"
          >
            <span>{selectedApps.length > 0 ? `${selectedApps.length} selected` : "Select Sources"}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {appSourceOpen && (
            <div className="absolute right-0 mt-1 w-56 rounded-xl bg-white border border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Application Sources
              </div>
              {[
                "Support Hub (Tickets)",
                "Review Console (PRs)",
                "System / Auth",
                "Organization Settings",
              ].map((app) => (
                <label
                  key={app}
                  className="flex items-center gap-2.5 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={selectedApps.includes(app)}
                    onChange={() => toggleApp(app)}
                    className="w-4 h-4 rounded border-slate-300 text-[#0066FF] focus:ring-[#0066FF]"
                  />
                  <span>{app}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
        {/* Organization */}
        <div className="space-y-1.5">
          <label className="block text-[11.5px] font-semibold text-slate-600">Organization</label>
          <div className="relative">
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="w-full appearance-none h-10 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none focus:border-[#0066FF] cursor-pointer"
            >
              <option value="All Organizations">All Organizations</option>
              {organizations.map((org: any) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Resource / Entity ID */}
        <AuditSearch
          label="Resource / Entity ID"
          value={entityIdSearch}
          onChange={setEntityIdSearch}
          placeholder="Search ID..."
        />

        {/* IP Address */}
        <AuditSearch
          label="IP Address"
          value={ipSearch}
          onChange={setIpSearch}
          placeholder="Search IP..."
        />

        {/* Result */}
        <div className="space-y-1.5">
          <label className="block text-[11.5px] font-semibold text-slate-600">Result</label>
          <div className="relative">
            <select
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value)}
              className="w-full appearance-none h-10 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 outline-none focus:border-[#0066FF] cursor-pointer"
            >
              <option value="All Results">All Results</option>
              <option value="Success">Success</option>
              <option value="Denied">Denied</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* More Filters Dropdown & Apply Filters Button */}
        <div className="lg:col-span-2 flex items-end justify-end gap-3 pt-2 sm:pt-0">
          <button
            type="button"
            className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>More Filters</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => onApplyFilters?.({
              startDate,
              endDate,
              userId: userFilter === "All Users" ? undefined : userFilter,
              action: actionFilter === "All Actions" ? undefined : actionFilter,
              entityType: resourceTypeFilter === "All Types" ? undefined : resourceTypeFilter,
              entityId: entityIdSearch || undefined
            })}
            className="h-10 px-5 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold shadow-[0_2px_8px_rgba(0,102,255,0.25)] flex items-center gap-2 transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-white" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditFilterPanel;
