import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/pr/StatsCard";
import PRFilters from "@/components/pr/PRFilters";
import PRTable, { type PRItem } from "@/components/pr/PRTable";
import { CreatePRModal } from "@/components/pr/CreatePRModal";
import { EditPRModal } from "@/components/pr/EditPRModal";
import { useDebounce } from "@/hooks/useDebounce";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { GitBranch, Clock, CheckCircle2, GitMerge, History, Plus } from "lucide-react";

export const PRsPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeOrg } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState("All");
  const [authorFilter, setAuthorFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPrId, setEditingPrId] = useState<string | null>(null);

  const { data: statsData } = useQuery({
    queryKey: ["prStats", activeOrg?.id],
    queryFn: async () => {
      const res = await api.get("/prs/stats");
      return res.data;
    },
    enabled: !!activeOrg?.id,
  });

  const { data: prsData, isLoading: isLoadingPRs } = useQuery({
    queryKey: ["prs", activeOrg?.id, debouncedSearch, statusFilter, authorFilter, branchFilter, page, limit, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (authorFilter !== "All") params.append("author", authorFilter);
      if (branchFilter !== "All") params.append("branch", branchFilter);
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const res = await api.get(`/prs?${params.toString()}`);
      return res.data;
    },
    enabled: !!activeOrg?.id,
  });

  const prsList: PRItem[] = useMemo(() => {
    if (!prsData || !prsData.data) return [];
    
    return prsData.data.map((p: any) => {
      const approvedCount = p.reviews?.filter((r: any) => r.decision === "APPROVED").length || 0;
      
      const reviewers = p.reviews?.map((r: any) => ({
        id: r.reviewer.id,
        initials: r.reviewer.fullName.slice(0, 2).toUpperCase(),
        name: r.reviewer.fullName,
        bg: "bg-[#0066FF]",
        approved: r.decision === "APPROVED",
        changesRequested: r.decision === "CHANGES_REQUESTED",
      })) || [];

      return {
        id: `#${p.id.slice(0, 8)}`,
        rawId: p.id,
        title: p.title,
        description: p.description || "Pull request code review",
        status: p.status,
        authorId: p.authorId,
        authorName: p.createdBy?.fullName || "User",
        authorInitials: (p.createdBy?.fullName || "U").slice(0, 2).toUpperCase(),
        authorBg: "bg-[#0066FF]",
        targetBranch: p.targetBranch,
        approvedCount,
        totalRequired: p.requiredApprovals || 1,
        reviewers,
        updatedAgo: new Date(p.updatedAt).toLocaleDateString(),
      };
    });
  }, [prsData]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] sm:text-[26px] font-bold text-[#0F172A] tracking-tight leading-tight">
            PR Review & Audit
          </h1>
          <p className="text-xs sm:text-[13.5px] text-[#64748B] font-normal mt-1">
            Review code changes, track approvals, and maintain an immutable audit trail.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/audit")}
            className="h-10 px-4 rounded-xl border border-[#0066FF] bg-white hover:bg-blue-50/50 text-[#0066FF] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-2xs self-start sm:self-auto shrink-0"
          >
            <History className="w-4 h-4 text-[#0066FF]" />
            <span>Open Audit Viewer</span>
          </button>
          
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Pull Request</span>
          </button>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <PRFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        authorFilter={authorFilter}
        onAuthorChange={setAuthorFilter}
        branchFilter={branchFilter}
        onBranchChange={setBranchFilter}
      />

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={<GitBranch className="w-5 h-5 text-white" />}
          iconBg="bg-[#0066FF]"
          value={statsData?.inReview || 0}
          title="In Review"
          subtitle="Needs attention"
        />
        <StatsCard
          icon={<Clock className="w-5 h-5 text-white" />}
          iconBg="bg-[#F97316]"
          value={statsData?.waitingApproval || 0}
          title="Waiting for Approval"
          subtitle="Pending other approvals"
        />
        <StatsCard
          icon={<CheckCircle2 className="w-5 h-5 text-white" />}
          iconBg="bg-[#10B981]"
          value={statsData?.approved || 0}
          title="Approved"
          subtitle="Ready to merge"
        />
        <StatsCard
          icon={<GitMerge className="w-5 h-5 text-white" />}
          iconBg="bg-[#8B5CF6]"
          value={statsData?.merged || 0}
          title="Merged"
          subtitle="Historically merged"
        />
      </div>

      {/* Pull Request Table */}
      <PRTable
        data={prsList}
        isLoading={isLoadingPRs}
        totalItems={prsData?.total || 0}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(id, desc) => {
          setSortBy(id);
          setSortOrder(desc ? "desc" : "asc");
        }}
        onEdit={(id) => setEditingPrId(id)}
      />

      {isCreateModalOpen && (
        <CreatePRModal onClose={() => setIsCreateModalOpen(false)} />
      )}
      
      {editingPrId && (
        <EditPRModal prId={editingPrId} onClose={() => setEditingPrId(null)} />
      )}
    </div>
  );
};

export default PRsPage;
