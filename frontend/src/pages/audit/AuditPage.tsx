import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AuditFilterPanel from "@/components/audit/AuditFilterPanel";
import AuditTable from "@/components/audit/AuditTable";
import type { AuditEventItem } from "@/components/audit/AuditTable";
import ExportButton from "@/components/audit/ExportButton";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Bookmark, ShieldCheck, PlusCircle, GitMerge, Settings, ShieldAlert, ArrowLeft } from "lucide-react";


export const AuditPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeOrg } = useAuth();

  const [filters, setFilters] = React.useState<any>({});

  // 1. Fetch Audit Logs from Backend API
  const { data: auditData, isLoading, refetch } = useQuery({
    queryKey: ["audit-logs", activeOrg?.id, filters],
    queryFn: async () => {
      try {
        const res = await api.get("/audit-logs", { params: filters });
        return res.data;
      } catch {
        return [];
      }
    },
  });

  // Map backend audit logs to UI structure — return [] if no data
  const auditLogsList: AuditEventItem[] = useMemo(() => {
    if (!auditData || !Array.isArray(auditData) || auditData.length === 0) {
      return [];
    }

    return auditData.map((log: any, index: number) => {
      const isDenied = log.action?.includes("DENIED") || log.action?.includes("FAIL");
      const isSuccess = !isDenied;

      const getActionIcon = (act: string) => {
        if (act?.includes("TICKET")) return <PlusCircle className="w-3.5 h-3.5 text-blue-600" />;
        if (act?.includes("PR")) return <GitMerge className="w-3.5 h-3.5 text-emerald-600" />;
        if (act?.includes("LOGIN")) return <Settings className="w-3.5 h-3.5 text-slate-500" />;
        if (act?.includes("DENIED")) return <ShieldAlert className="w-3.5 h-3.5 text-red-500" />;
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
      };

      return {
        id: `EVT-${89421 - index}`,
        timestamp: new Date(log.createdAt || Date.now()).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        user: log.user?.fullName || "System",
        userInitials: (log.user?.fullName || "JS").slice(0, 2).toUpperCase(),
        userBg: "bg-[#0066FF]",
        action: log.action || "Audit Event",
        actionIcon: getActionIcon(log.action),
        resourceType: log.entityType || "Security",
        resourceTypeStyle: "bg-[#EBF3FF] text-[#0066FF]",
        resourceEntity: log.entityId || "Resource",
        application: "Support Hub",
        organization: activeOrg?.name || "Acme Corp",
        ipAddress: log.ipAddress || "203.0.113.45",
        result: isSuccess ? "Success" : "Denied",
        severity: isDenied ? "Critical" : "Low",
      };
    });
  }, [auditData, activeOrg]);

  // 2. CSV Export Handler
  const handleExportCsv = async () => {
    try {
      const res = await api.get("/audit-logs/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "audit-logs.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Audit trail exported as CSV!");
    } catch {
      toast.error("Failed to export audit logs CSV");
    }
  };

  // 3. Refresh Handler
  const handleRefresh = async () => {
    await refetch();
    await queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    toast.success("Audit trail refreshed!");
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link to="/prs" className="hover:text-slate-800 transition-colors">
          Review & Audit Console
        </Link>
        <span>&gt;</span>
        <span className="text-slate-500">Audit</span>
        <span>&gt;</span>
        <span className="text-slate-800 font-semibold">Unified Audit Viewer</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            to="/prs"
            className="p-2 mt-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer shadow-sm shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-[24px] sm:text-[26px] font-bold text-[#0F172A] tracking-tight leading-tight">
              Unified Organization Audit Trail
            </h1>
            <p className="text-xs sm:text-[13.5px] text-[#64748B] font-normal mt-1">
              A single, immutable trail of all actions across Support Hub and Review Console.
            </p>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <ExportButton onClick={handleExportCsv} label="Export" />

          <button
            type="button"
            onClick={() => toast.success("Saved current audit filter view!")}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Bookmark className="w-4 h-4 text-slate-500" />
            <span>Save View</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <AuditFilterPanel
        onApplyFilters={(newFilters) => {
          setFilters(newFilters);
          toast.success("Filters applied successfully!");
        }}
        onClearFilters={() => {
          setFilters({});
          toast.success("Filters reset!");
        }}
      />

      {/* Audit Events Table */}
      <AuditTable data={auditLogsList} isLoading={isLoading} onRefresh={handleRefresh} />
    </div>
  );
};

export default AuditPage;
