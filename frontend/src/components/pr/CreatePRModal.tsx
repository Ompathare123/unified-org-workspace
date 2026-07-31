import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { GitPullRequestCreateArrow, X, Search } from "lucide-react";
import { toast } from "sonner";

interface CreatePRModalProps {
  onClose: () => void;
}

export const CreatePRModal: React.FC<CreatePRModalProps> = ({ onClose }) => {
  const { activeOrg } = useAuth();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceBranch, setSourceBranch] = useState("");
  const [targetBranch, setTargetBranch] = useState("main");
  const [requiredApprovals, setRequiredApprovals] = useState(1);
  const [draft, setDraft] = useState(false);

  // Future features marked per user request
  const [labels, setLabels] = useState<string[]>([]);
  const [priority, setPriority] = useState("Medium");

  // Reviewers Selection
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [reviewerSearch, setReviewerSearch] = useState("");

  const { data: members } = useQuery({
    queryKey: ["orgMembers", activeOrg?.id],
    queryFn: async () => {
      const res = await api.get(`/organizations/${activeOrg?.id}/members`);
      return res.data;
    },
    enabled: !!activeOrg?.id,
  });

  const availableReviewers = members?.filter((m: any) => 
    m.user?.fullName?.toLowerCase().includes(reviewerSearch.toLowerCase()) ||
    m.user?.email?.toLowerCase().includes(reviewerSearch.toLowerCase())
  ) || [];

  const createMutation = useMutation({
    mutationFn: async () => {
      if (sourceBranch === targetBranch) {
        throw new Error("Source and target branches cannot be the same.");
      }
      if (!title || !sourceBranch || !targetBranch) {
        throw new Error("Required fields are missing.");
      }
      
      const payload = {
        title,
        description,
        sourceBranch,
        targetBranch,
        requiredApprovals,
        status: draft ? "DRAFT" : "IN_REVIEW",
        reviewers: selectedReviewers,
      };

      const res = await api.post("/prs", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prs"] });
      queryClient.invalidateQueries({ queryKey: ["prStats"] });
      toast.success("Pull Request created successfully.");
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to create Pull Request");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const toggleReviewer = (userId: string) => {
    if (selectedReviewers.includes(userId)) {
      setSelectedReviewers(prev => prev.filter(id => id !== userId));
    } else {
      setSelectedReviewers(prev => [...prev, userId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800">
            <GitPullRequestCreateArrow className="w-5 h-5 text-[#0066FF]" />
            <h2 className="text-lg font-bold">Create Pull Request</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement OIDC SSO integration"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summarize the changes and any testing done..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Source Branch *</label>
              <input
                type="text"
                required
                value={sourceBranch}
                onChange={(e) => setSourceBranch(e.target.value)}
                placeholder="e.g. feature/oidc"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#0066FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Branch *</label>
              <input
                type="text"
                required
                value={targetBranch}
                onChange={(e) => setTargetBranch(e.target.value)}
                placeholder="e.g. main"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-[#0066FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Required Approvals</label>
              <input
                type="number"
                min={1}
                max={10}
                value={requiredApprovals}
                onChange={(e) => setRequiredApprovals(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#0066FF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority (Future)</label>
              <select disabled className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-400 cursor-not-allowed">
                <option>Medium</option>
              </select>
            </div>
          </div>

          {/* Reviewers */}
          <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Assign Reviewers</span>
              <span className="text-[10px] text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{selectedReviewers.length} selected</span>
            </div>
            <div className="p-2 border-b border-slate-100 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 ml-1" />
              <input
                type="text"
                placeholder="Search team members..."
                value={reviewerSearch}
                onChange={(e) => setReviewerSearch(e.target.value)}
                className="flex-1 text-xs outline-none bg-transparent"
              />
            </div>
            <div className="max-h-32 overflow-y-auto custom-scrollbar p-1">
              {availableReviewers.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">No members found</div>
              ) : (
                availableReviewers.map((m: any) => (
                  <label key={m.user.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedReviewers.includes(m.user.id)}
                      onChange={() => toggleReviewer(m.user.id)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-[#0066FF] focus:ring-[#0066FF]"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">
                        {m.user.fullName?.slice(0,2).toUpperCase()}
                      </div>
                      <span className="text-xs text-slate-700">{m.user.fullName}</span>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={draft}
                onChange={(e) => setDraft(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#0066FF] focus:ring-[#0066FF]"
              />
              <span className="text-sm font-semibold text-slate-700">Create as Draft</span>
            </label>
            <p className="text-xs text-slate-500 ml-6 mt-0.5">Draft PRs cannot be merged and don't notify reviewers immediately.</p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-transparent transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={createMutation.isPending || !title || !sourceBranch || !targetBranch}
            className="px-5 py-2 rounded-xl bg-[#0066FF] text-white text-xs font-bold hover:bg-[#0052CC] shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {createMutation.isPending ? "Creating..." : (draft ? "Create Draft PR" : "Create Pull Request")}
          </button>
        </div>
      </div>
    </div>
  );
};
