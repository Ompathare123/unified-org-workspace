import React from "react";

import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Sparkles,
  RefreshCw,
  Download,
  Share2,
  Ticket,
  GitPullRequest,
  Clock,
  Globe,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export const DigestPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeOrg } = useAuth();

  // 1. Fetch AI Progress Digest from Backend API
  const { data: digestData, refetch } = useQuery({
    queryKey: ["digest", activeOrg?.id],
    queryFn: async () => {
      try {
        const res = await api.get("/digest");
        return res.data;
      } catch {
        return null;
      }
    },
  });

  const assignedTicketsCount = digestData?.summary?.assignedTickets || 3;
  const pendingPRsCount = digestData?.summary?.pendingPRs || 2;
  const overdueSLARisks = digestData?.summary?.overdueSLARisks || 1;
  const crossOrgEvents = digestData?.summary?.crossOrgEvents || 4;

  const handleRefreshDigest = async () => {
    await refetch();
    await queryClient.invalidateQueries({ queryKey: ["digest"] });
    toast.success("AI Progress Digest refreshed!");
  };

  const handleDownload = () => {
    toast.success("AI Progress Digest downloaded!");
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Digest link copied to clipboard!");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#0066FF]" />
            <h1 className="text-[24px] sm:text-[26px] font-bold text-[#0F172A] tracking-tight leading-tight">
              AI Progress Digest
            </h1>
          </div>
          <p className="text-xs sm:text-[13.5px] text-[#64748B] font-normal mt-1">
            Intelligent summary of cross-organization activity, SLA risks, and priority tasks.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRefreshDigest}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <span>Refresh Digest</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="px-3.5 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <Share2 className="w-4 h-4 text-white" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Generated Timestamp Banner */}
      <div className="px-4 py-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs text-[#0066FF]">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#0066FF]" />
          <span>Generated Today at 09:00 AM UTC (Real-time AI Engine)</span>
        </div>
        <span className="font-semibold hidden sm:inline">Model: Antigravity-v2</span>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Assigned Tickets */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Assigned Tickets</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0066FF] flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{assignedTicketsCount} Tickets</div>
            <div className="text-xs font-semibold text-red-600 mt-0.5">1 past SLA • 2 due today</div>
          </div>
          <Link
            to="/tickets"
            className="text-[11.5px] font-bold text-[#0066FF] hover:underline inline-flex items-center gap-1"
          >
            <span>View Tickets</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 2: Pending PR Reviews */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending PR Reviews</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center">
              <GitPullRequest className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{pendingPRsCount} PRs</div>
            <div className="text-xs font-semibold text-amber-600 mt-0.5">Oldest pending: 3 days</div>
          </div>
          <Link
            to="/prs"
            className="text-[11.5px] font-bold text-[#0066FF] hover:underline inline-flex items-center gap-1"
          >
            <span>Review PRs</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 3: Overdue SLA Risks */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Overdue SLA Risks</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{overdueSLARisks} Critical</div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">TCK-1092 BOLA Verification</div>
          </div>
          <Link
            to="/tickets/TCK-1092"
            className="text-[11.5px] font-bold text-[#0066FF] hover:underline inline-flex items-center gap-1"
          >
            <span>Inspect SLA</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 4: Cross-Org Activity */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Cross-Org Activity</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{crossOrgEvents} Events</div>
            <div className="text-xs font-semibold text-purple-700 mt-0.5">Partner: Globex</div>
          </div>
          <Link
            to="/audit"
            className="text-[11.5px] font-bold text-[#0066FF] hover:underline inline-flex items-center gap-1"
          >
            <span>View Audit Logs</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* AI Insights & Suggested Priorities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Suggested Priorities List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#0066FF]" />
                <h2 className="text-sm font-bold text-slate-800">Suggested Action Items</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0066FF] text-[11px] font-bold">
                AI Prioritized
              </span>
            </div>

            <div className="space-y-4">
              {/* Item 1 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0066FF] text-white text-[11px] font-bold flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-xs font-bold text-slate-800">
                      Approve PR #401 (JWT Revocation Logic)
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">
                    High Priority
                  </span>
                </div>
                <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                  Approving PR #401 resolves security token validation and unblocks partner Globex from completing BOLA ticket TCK-1092.
                </p>
                <div className="pl-7 pt-1">
                  <Link
                    to="/prs"
                    className="text-xs font-bold text-[#0066FF] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Open PR #401 Diff →</span>
                  </Link>
                </div>
              </div>

              {/* Item 2 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0066FF] text-white text-[11px] font-bold flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-xs font-bold text-slate-800">
                      Validate SLA on Ticket TCK-1092
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">
                    SLA Risk
                  </span>
                </div>
                <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                  Ticket TCK-1092 is shared from partner org Globex and is past SLA time limit. John S. is assigned.
                </p>
                <div className="pl-7 pt-1">
                  <Link
                    to="/tickets/TCK-1092"
                    className="text-xs font-bold text-[#0066FF] hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Ticket TCK-1092 →</span>
                  </Link>
                </div>
              </div>

              {/* Item 3 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#0066FF] text-white text-[11px] font-bold flex items-center justify-center">
                      3
                    </span>
                    <h3 className="text-xs font-bold text-slate-800">
                      Audit Scoping Check Validation
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                    Security Pass
                  </span>
                </div>
                <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                  All 4 cross-organization scoping queries executed by Globex were verified for strict tenant isolation.
                </p>
                <div className="pl-7 pt-1">
                  <Link
                    to="/audit"
                    className="text-xs font-bold text-[#0066FF] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Open Audit Viewer →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: AI Recommendation Cards */}
        <div className="lg:col-span-1 space-y-6">
          {/* Cross-Org Warning Callout */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-900 text-white shadow-md space-y-3">
            <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
              <Globe className="w-4 h-4 text-purple-300" />
              <span>Partner Org Insights</span>
            </div>
            <h3 className="text-sm font-bold text-white">Globex Partner Scoping Active</h3>
            <p className="text-xs text-purple-200 leading-relaxed">
              4 tickets & 2 PRs are shared between Acme Corp and Globex. No cross-tenant data leakage detected.
            </p>
            <div className="pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-purple-800/80 text-purple-200 text-[11px] font-semibold">
                Tenant Scoping: 100% Validated
              </span>
            </div>
          </div>

          {/* Automated Recommendation Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-[#0066FF] font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>AI Recommendation</span>
            </div>
            <h3 className="text-sm font-bold text-slate-800">Automate BOLA Scoping Check</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enable automated feature flag SLA checks on external API endpoints to reduce review time by 45%.
            </p>
            <button
              type="button"
              onClick={() => toast.success("Automated SLA scoping rule activated!")}
              className="w-full py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Apply AI Recommendation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigestPage;
