import React, { useState } from "react";
import InfoRow from "./InfoRow";
import TagList from "./TagList";
import PriorityBadge from "../tickets/PriorityBadge";
import { Edit3, ChevronDown, Copy, Check, Flag } from "lucide-react";

interface TicketSidebarProps {
  ticketId?: string;
  requesterOrg?: string;
  isExternalPartner?: boolean;
  createdBy?: { name: string; date: string; initials: string; bg: string };
  assignee?: { name: string; date: string; initials: string; bg: string };
  priority?: "High" | "Medium" | "Low";
  status?: string;
  category?: string;
  source?: string;
  featureFlagName?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  members?: any[];
  onAssigneeChange?: (userId: string) => void;
  onStatusChange?: (status: string) => void;
  canAssign?: boolean;
}

export const TicketSidebar: React.FC<TicketSidebarProps> = ({
  ticketId = "TCK-1092",
  requesterOrg = "Globex",
  isExternalPartner = true,
  createdBy = { name: "Alex R. (Globex)", date: "May 24, 2025 09:21 AM", initials: "AR", bg: "bg-[#7C3AED]" },
  assignee = { name: "John S. (Admin)", date: "May 24, 2025 10:02 AM", initials: "JS", bg: "bg-[#0066FF]" },
  priority = "High",
  status = "Open",
  category = "Security",
  source = "Partner API Portal",
  featureFlagName = "High-Priority SLA: True",
  tags = ["security", "api", "external"],
  createdAt = "May 24, 2025 09:21 AM",
  updatedAt = "May 24, 2025 12:18 PM",
  members = [],
  onAssigneeChange,
  onStatusChange,
  canAssign = true,
}) => {
  const [currentStatus, setCurrentStatus] = useState(status);
  
  // Sync local state when prop changes
  React.useEffect(() => {
    if (status) {
      setCurrentStatus(status);
    }
  }, [status]);

  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-800">Ticket Details</h2>
        <button
          type="button"
          onClick={() => alert("Edit ticket dialog (UI only)")}
          className="px-3 py-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
          <span>Edit</span>
        </button>
      </div>

      {/* Requester (Organization) */}
      <InfoRow label="Requester (Organization)">
        <div className="flex items-center gap-2 mt-0.5">
          <span>{requesterOrg}</span>
          {isExternalPartner && (
            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-semibold text-[11px]">
              External Partner
            </span>
          )}
        </div>
      </InfoRow>

      {/* Created By */}
      <InfoRow label="Created By">
        <div className="flex items-center gap-2 mt-1">
          <div className={`w-7 h-7 rounded-full ${createdBy.bg} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
            {createdBy.initials}
          </div>
          <div>
            <div className="font-semibold text-slate-800 text-xs">{createdBy.name}</div>
            <div className="text-[11px] text-slate-400 font-normal">{createdBy.date}</div>
          </div>
        </div>
      </InfoRow>

      {/* Assignee */}
      <InfoRow label="Assignee">
        <div className="relative mt-0.5">
          {assignee.name ? (
            <button
              type="button"
              disabled={!canAssign}
              onClick={() => canAssign && setShowAssigneeMenu((v) => !v)}
              className={`flex items-center gap-2 p-1.5 -ml-1.5 rounded-xl transition-colors ${canAssign ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default'}`}
            >
              <div className={`w-6 h-6 rounded-full ${assignee.bg || 'bg-[#0066FF]'} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                {assignee.initials || "U"}
              </div>
              <div className="text-left">
                <div className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                  {assignee.name}
                  {canAssign && <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </div>
              </div>
            </button>
          ) : (
            <button
              type="button"
              disabled={!canAssign}
              onClick={() => canAssign && setShowAssigneeMenu((v) => !v)}
              className={`px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors ${canAssign ? 'hover:bg-slate-200 cursor-pointer' : 'cursor-default'}`}
            >
              <span>Unassigned</span>
              {canAssign && <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          {canAssign && showAssigneeMenu && members && (
            <div className="absolute left-0 mt-1 w-48 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-50 max-h-60 overflow-y-auto">
              {members.map((member: any) => (
                <button
                  key={member.user.id}
                  type="button"
                  onClick={() => {
                    onAssigneeChange?.(member.user.id);
                    setShowAssigneeMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[9px] flex items-center justify-center shrink-0">
                    {member.user.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="truncate">{member.user.fullName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </InfoRow>

      {/* Priority */}
      <InfoRow label="Priority">
        <div className="mt-0.5">
          <PriorityBadge priority={priority} />
        </div>
      </InfoRow>

      {/* Status */}
      <InfoRow label="Status">
        <div className="relative mt-0.5">
          <button
            type="button"
            onClick={() => setShowStatusMenu((v) => !v)}
            className="px-3 py-1 rounded-lg bg-[#EBF3FF] border border-[#D5E5FF] text-[#0066FF] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#DCEBFF] transition-colors cursor-pointer"
          >
            <span>{currentStatus}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#0066FF]" />
          </button>

          {showStatusMenu && (
            <div className="absolute left-0 mt-1 w-36 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-50">
              {["Open", "In Progress", "Resolved", "Closed"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setCurrentStatus(st);
                    setShowStatusMenu(false);
                    onStatusChange?.(st);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>
      </InfoRow>

      {/* Category */}
      <InfoRow label="Category">
        <span>{category}</span>
      </InfoRow>

      {/* Source */}
      <InfoRow label="Source">
        <span>{source}</span>
      </InfoRow>

      {/* Feature Flag */}
      <InfoRow label="Feature Flag">
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium mt-0.5">
          <Flag className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          <span>{featureFlagName}</span>
        </div>
      </InfoRow>

      {/* Tags */}
      <InfoRow label="Tags">
        <div className="mt-1">
          <TagList tags={tags} />
        </div>
      </InfoRow>

      <div className="pt-2 border-t border-slate-100 space-y-3">
        {/* Ticket ID */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11.5px] font-semibold text-slate-500">Ticket ID</span>
          <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
            <span>{ticketId}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Created At */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11.5px] font-semibold text-slate-500">Created At</span>
          <span className="text-slate-700">{createdAt}</span>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11.5px] font-semibold text-slate-500">Last Updated</span>
          <span className="text-slate-700">{updatedAt}</span>
        </div>
      </div>
    </div>
  );
};

export default TicketSidebar;
