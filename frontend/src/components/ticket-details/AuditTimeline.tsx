import React from "react";
import { ShieldCheck, Download, Info } from "lucide-react";

export interface AuditEvent {
  id: string;
  time: string;
  actorName: string;
  actorInitials: string;
  actorBg: string;
  action: "CREATED" | "VIEWED" | "SCOPING CHECK" | "COMMENTED" | "STATUS CHANGED" | "Added a comment" | "Edited a comment" | "Deleted a comment" | string;
  details: string;
  source: string;
}

interface AuditTimelineProps {
  events?: AuditEvent[];
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ events = [] }) => {
  const getActionStyle = (action: string) => {
    switch (action) {
      case "CREATED":
        return "bg-[#EBF3FF] text-[#0066FF]";
      case "VIEWED":
        return "bg-[#EBF3FF] text-[#0066FF]";
      case "SCOPING CHECK":
        return "bg-[#E6F4EA] text-[#137333]";
      case "COMMENTED":
      case "Added a comment":
        return "bg-[#F3E8FF] text-[#7E22CE]";
      case "Edited a comment":
        return "bg-[#EBF3FF] text-[#0066FF]";
      case "Deleted a comment":
        return "bg-[#FEE2E2] text-[#EF4444]";
      case "STATUS CHANGED":
        return "bg-[#FEF3C7] text-[#D97706]";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const handleExport = () => {
    alert("Exporting append-only audit log CSV...");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Top Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4.5 h-4.5 text-[#0066FF]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Append-Only Audit Log</h3>
            <p className="text-[11.5px] text-slate-500 mt-0.5">
              All events are immutable and tamper-evident.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Log</span>
        </button>
      </div>

      {/* Audit Log Table with Timeline dots */}
      {events.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-400">
          No audit events recorded for this ticket yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-600">
                <th className="py-3 pl-8 pr-4">Time (UTC)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 pl-4 pr-6 flex items-center gap-1">
                  <span>Source</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 relative">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors group">

                  {/* Time + Timeline dot */}
                  <td className="py-4 pl-8 pr-4 text-xs font-mono text-slate-500 whitespace-nowrap relative">
                    {/* Vertical Timeline Line */}
                    <span className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 group-first:top-1/2 group-last:bottom-1/2" />
                    {/* Timeline Dot */}
                    <span className="absolute left-[13.5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-400 border-2 border-white ring-2 ring-slate-200" />
                    {evt.time}
                  </td>

                  {/* Actor */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full ${evt.actorBg} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}
                      >
                        {evt.actorInitials}
                      </div>
                      <span className="text-xs font-medium text-slate-800">{evt.actorName}</span>
                    </div>
                  </td>

                  {/* Action Badge */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${getActionStyle(
                        evt.action
                      )}`}
                    >
                      {evt.action}
                    </span>
                  </td>

                  {/* Details */}
                  <td className="py-4 px-4 text-xs text-slate-700 max-w-xs sm:max-w-md">
                    {evt.details}
                  </td>

                  {/* Source */}
                  <td className="py-4 pl-4 pr-6 text-xs text-slate-500 font-medium whitespace-nowrap">
                    {evt.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bottom Immutable Footer Message */}
      <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
        <span>This is an append-only log. No edits or deletions are permitted.</span>
      </div>
    </div>
  );
};

export default AuditTimeline;
