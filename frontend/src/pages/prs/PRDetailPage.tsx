import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, GitBranch, History, CheckCircle2, XCircle, ChevronDown, Check, Merge } from "lucide-react";
import { toast } from "sonner";
import { PRTabs } from "@/components/pr/PRTabs";
import type { PRTab } from "@/components/pr/PRTabs";
import { PRCommentThread } from "@/components/pr/PRCommentThread";
import { AuditTimeline } from "@/components/ticket-details/AuditTimeline";

const PRDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeOrg, user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<PRTab>("Overview");
  
  // Modals state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [decision, setDecision] = useState<"APPROVED" | "CHANGES_REQUESTED">("APPROVED");
  
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionTitle, setVersionTitle] = useState("");
  const [versionDescription, setVersionDescription] = useState("");
  const [diffContent, setDiffContent] = useState("");

  // Queries
  const { data: pr, isLoading } = useQuery({
    queryKey: ["pr", id],
    queryFn: async () => {
      const res = await api.get(`/prs/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const { data: commentsData } = useQuery({
    queryKey: ["prComments", id],
    queryFn: async () => {
      const res = await api.get(`/prs/${id}/comments?limit=100`);
      return res.data;
    },
    enabled: !!id,
  });

  // Version Selector State
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  useEffect(() => {
    if (pr?.versions && pr.versions.length > 0 && !selectedVersionId) {
      // Auto-select latest version
      setSelectedVersionId(pr.versions[pr.versions.length - 1].id);
    }
  }, [pr?.versions, selectedVersionId]);

  // Mutations
  const reviewMutation = useMutation({
    mutationFn: async (payload: { decision: string; comment: string }) => {
      const res = await api.post(`/prs/${id}/reviews`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Review submitted");
      setShowReviewModal(false);
      setReviewComment("");
      queryClient.invalidateQueries({ queryKey: ["pr", id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit review");
    },
  });

  const versionMutation = useMutation({
    mutationFn: async (payload: { title: string; description: string; diffContent: string }) => {
      const res = await api.post(`/prs/${id}/versions`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Version snapshot created");
      setShowVersionModal(false);
      setVersionTitle("");
      setVersionDescription("");
      setDiffContent("");
      queryClient.invalidateQueries({ queryKey: ["pr", id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create version");
    },
  });

  const mergeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/prs/${id}/merge`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Pull Request Merged Successfully!");
      queryClient.invalidateQueries({ queryKey: ["pr", id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to merge PR");
    },
  });

  if (isLoading) return <div className="p-12 text-center text-xs text-gray-500">Loading PR details...</div>;
  if (!pr) return <div className="p-12 text-center text-xs text-red-500">Pull Request not found.</div>;

  const totalComments = commentsData?.total || 0;
  const totalVersions = pr.versions?.length || 0;

  // Merge Conditions Logic
  const approvedCount = pr.reviews?.filter((r: any) => r.decision === "APPROVED").length || 0;
  const changesRequestedCount = pr.reviews?.filter((r: any) => r.decision === "CHANGES_REQUESTED").length || 0;
  
  let mergeDisabledReason = "";
  let canMerge = true;

  if (pr.status === "MERGED") {
    canMerge = false;
    mergeDisabledReason = "Already Merged";
  } else if (pr.status === "CLOSED") {
    canMerge = false;
    mergeDisabledReason = "PR is Closed";
  } else if (changesRequestedCount > 0) {
    canMerge = false;
    mergeDisabledReason = "Pending requested changes";
  } else if (approvedCount < pr.requiredApprovals) {
    canMerge = false;
    mergeDisabledReason = `Waiting for ${pr.requiredApprovals - approvedCount} more approval(s)`;
  }

  // Files Changed Data
  const selectedVersion = pr.versions?.find((v: any) => v.id === selectedVersionId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/prs")}
          className="flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Pull Requests</span>
        </button>
      </div>

      {/* PR Main Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold tracking-wider uppercase text-purple-600">PR #{pr.id.slice(0, 8)}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                pr.status === "MERGED" ? "bg-purple-100 text-purple-700 border-purple-200" :
                (pr.status === "CHANGES_REQUESTED" || pr.status === "REJECTED") ? "bg-red-50 text-red-700 border-red-200" :
                "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}>
                {pr.status === "REJECTED" ? "CLOSED" : pr.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-2">{pr.title}</h1>
            <div className="flex items-center gap-2 text-xs text-gray-600 font-mono mt-3">
              <GitBranch className="w-4 h-4 text-purple-600" />
              <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-semibold">{pr.sourceBranch}</span>
              <span className="text-gray-400">into</span>
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-semibold">{pr.targetBranch}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowVersionModal(true)}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <History className="w-4 h-4" />
              <span>New Snapshot</span>
            </button>
            <button
              onClick={() => setShowReviewModal(true)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Review</span>
            </button>
          </div>
        </div>
      </div>

      <PRTabs activeTab={activeTab} onChange={setActiveTab} commentCount={totalComments} versionCount={totalVersions} />

      <div className="min-h-[400px]">
        {/* OVERVIEW TAB */}
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Description</h3>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {pr.description || "No description provided."}
                </p>
              </div>

              {/* Approval Progress */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Approval Progress</h3>
                  <span className="text-xs font-semibold text-gray-500">
                    {approvedCount} / {pr.requiredApprovals} Required
                  </span>
                </div>
                
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mb-6">
                  <div 
                    className={`h-full ${approvedCount >= pr.requiredApprovals ? 'bg-emerald-500' : 'bg-purple-500'}`} 
                    style={{ width: `${Math.min((approvedCount / pr.requiredApprovals) * 100, 100)}%` }}
                  />
                </div>

                <div className="space-y-3">
                  {pr.reviews?.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-[10px] text-purple-700">
                          {r.reviewer?.fullName?.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-gray-900">{r.reviewer?.fullName}</span>
                      </div>
                      <div>
                        {r.decision === "APPROVED" && <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full border border-emerald-200">APPROVED</span>}
                        {r.decision === "CHANGES_REQUESTED" && <span className="px-2.5 py-1 bg-red-50 text-red-700 font-bold text-[10px] rounded-full border border-red-200">CHANGES REQUESTED</span>}
                        {r.decision === "PENDING" && <span className="px-2.5 py-1 bg-gray-100 text-gray-500 font-bold text-[10px] rounded-full border border-gray-200">PENDING</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Details</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-[11px] text-gray-400 font-semibold block">Author</span>
                    <span className="text-xs font-bold text-gray-900">{pr.createdBy?.fullName || "User"}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 font-semibold block">Created</span>
                    <span className="text-xs text-gray-700">{new Date(pr.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 font-semibold block">Updated</span>
                    <span className="text-xs text-gray-700">{new Date(pr.updatedAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => mergeMutation.mutate()}
                    disabled={!canMerge || mergeMutation.isPending}
                    className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                  >
                    <Merge className="w-4 h-4" />
                    {mergeMutation.isPending ? "Merging..." : "Merge Pull Request"}
                  </button>
                  {!canMerge && (
                    <div className="text-center mt-2 text-[10px] font-bold text-red-500">
                      🔒 {mergeDisabledReason}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FILES CHANGED TAB */}
        {activeTab === "Files Changed" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-4">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Diff Inspector</h3>
              
              <select 
                value={selectedVersionId || ""}
                onChange={(e) => setSelectedVersionId(e.target.value)}
                className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 w-full sm:w-auto"
              >
                {pr.versions?.length === 0 && <option value="">No versions available</option>}
                {pr.versions?.map((v: any) => (
                  <option key={v.id} value={v.id}>
                    Version {v.versionNumber} ({new Date(v.createdAt).toLocaleDateString()}) - {v.createdBy?.fullName}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedVersion ? (
              <div className="space-y-3">
                <div className="text-xs text-gray-500 font-semibold">
                  {selectedVersion.title} — {selectedVersion.description}
                </div>
                {selectedVersion.diffContent ? (
                  <pre className="p-4 bg-slate-950 rounded-xl text-[12px] font-mono text-emerald-400 overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
                    {selectedVersion.diffContent}
                  </pre>
                ) : (
                  <div className="text-xs text-gray-400 text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    No diff content provided for this version.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-400 text-center py-8">
                Select a version to view code changes.
              </div>
            )}
          </div>
        )}

        {/* VERSION HISTORY TAB */}
        {activeTab === "Version History" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Snapshot Timeline</h3>
            {pr.versions?.length === 0 ? (
              <div className="text-center p-12 text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
                No versions recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {pr.versions?.map((v: any) => (
                  <div key={v.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-purple-700">Version #{v.versionNumber}: {v.title}</span>
                      <span className="text-[10px] font-bold text-slate-500">{new Date(v.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-semibold">Uploaded by {v.createdBy?.fullName}</p>
                    <p className="text-xs text-slate-500">{v.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AUDIT LOG TAB */}
        {activeTab === "Audit Log" && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
             <AuditTimeline events={[]} />
          </div>
        )}

        {/* COMMENTS TAB */}
        {activeTab === "Comments" && (
          <PRCommentThread prId={id!} />
        )}

      </div>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-gray-900">Submit Code Review</h2>

            <form onSubmit={(e) => { e.preventDefault(); reviewMutation.mutate({ decision, comment: reviewComment }); }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDecision("APPROVED")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                      decision === "APPROVED"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                        : "bg-gray-50 border-gray-200 text-gray-600"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision("CHANGES_REQUESTED")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 ${
                      decision === "CHANGES_REQUESTED"
                        ? "bg-red-50 border-red-500 text-red-700"
                        : "bg-gray-50 border-gray-200 text-gray-600"
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Request Changes</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Formal Feedback (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Summarize your review decision..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Version Snapshot Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-gray-900">Create Version Snapshot</h2>

            <form onSubmit={(e) => { e.preventDefault(); versionMutation.mutate({ title: versionTitle, description: versionDescription, diffContent }); }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Added JWT validation"
                  value={versionTitle}
                  onChange={(e) => setVersionTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of changes..."
                  value={versionDescription}
                  onChange={(e) => setVersionDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Diff Snippet / Code Changes</label>
                <textarea
                  rows={6}
                  placeholder="+ added line 42&#10;- removed line 10"
                  value={diffContent}
                  onChange={(e) => setDiffContent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 text-emerald-400 font-mono rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVersionModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={versionMutation.isPending}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  {versionMutation.isPending ? "Saving..." : "Save Snapshot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PRDetailPage;
