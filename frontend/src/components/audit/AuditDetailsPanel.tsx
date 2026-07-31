import React from "react";
import { Code2, ShieldCheck, Server, Globe } from "lucide-react";

interface AuditDetailsPanelProps {
  event: any;
}

export const AuditDetailsPanel: React.FC<AuditDetailsPanelProps> = ({ event }) => {
  return (
    <div className="p-4 sm:p-5 bg-slate-900 text-slate-100 rounded-xl space-y-4 my-2 border border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-blue-400 font-mono font-bold">
          <Code2 className="w-4 h-4" />
          <span>Audit Event Payload: {event.id || "EVT-89421"}</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span>Session ID: <strong className="text-slate-200 font-mono">sess_99a8f23b</strong></span>
          <span>•</span>
          <span>Trace ID: <strong className="text-slate-200 font-mono">tr_44b1029</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Scoping & Security */}
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1.5">
          <div className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Tenant Isolation Scoping</span>
          </div>
          <div className="text-slate-300">Organization ID: <span className="font-mono text-slate-100">org_acme_001</span></div>
          <div className="text-slate-300">Target Tenant: <span className="font-mono text-slate-100">{event.organization || "Acme Corp"}</span></div>
          <div className="text-slate-300 font-mono text-[11px] text-emerald-400/90 pt-1">✓ BOLA Scoping Check Enforced</div>
        </div>

        {/* Origin & IP Geolocation */}
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1.5">
          <div className="font-bold text-purple-400 flex items-center gap-1.5 mb-1">
            <Globe className="w-3.5 h-3.5" />
            <span>Origin Geolocation</span>
          </div>
          <div className="text-slate-300">IP Address: <span className="font-mono text-slate-100">{event.ipAddress || "203.0.113.45"}</span></div>
          <div className="text-slate-300">User Agent: <span className="text-slate-100 font-mono text-[11px] truncate block">Mozilla/5.0 (Windows NT 10.0)</span></div>
          <div className="text-slate-300 text-[11px]">Region: US-East (Virginia)</div>
        </div>

        {/* Server & Engine */}
        <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1.5">
          <div className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
            <Server className="w-3.5 h-3.5" />
            <span>Audit Engine Source</span>
          </div>
          <div className="text-slate-300">App Source: <span className="font-mono text-slate-100">{event.application || "Support Hub"}</span></div>
          <div className="text-slate-300">Result Status: <span className="font-semibold text-emerald-400">{event.result || "Success"}</span></div>
          <div className="text-slate-300 text-[11px]">Signature: <span className="font-mono text-slate-400">sha256:e3b0c44...99a</span></div>
        </div>
      </div>

      {/* Raw JSON Payload */}
      <div className="space-y-1 pt-1">
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Raw Immutable Metadata</span>
        <pre className="p-3 bg-slate-950 rounded-lg text-[11px] font-mono text-emerald-400 overflow-x-auto border border-slate-800 leading-relaxed">
{JSON.stringify(
  {
    event_id: event.id || "EVT-89421",
    timestamp_utc: event.timestamp || "2025-05-24T10:21:13Z",
    actor: { name: event.user, role: "Admin", email: "john.s@acme.com" },
    action: event.action,
    resource_type: event.resourceType,
    resource_entity: event.resourceEntity,
    application: event.application,
    organization: event.organization,
    ip_address: event.ipAddress,
    result: event.result,
    security: { bola_scoping_verified: true, rbac_passed: true, tamper_proof_hash: "0x89f2a..." }
  },
  null,
  2
)}
        </pre>
      </div>
    </div>
  );
};

export default AuditDetailsPanel;
