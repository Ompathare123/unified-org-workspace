import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { GitPullRequestCreateArrow, X, Search } from "lucide-react";
import { toast } from "sonner";

interface EditPRModalProps {
  prId: string;
  onClose: () => void;
}

export const EditPRModal: React.FC<EditPRModalProps> = ({ prId, onClose }) => {
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

  const { data: prData } = useQuery({
    queryKey: ["pr", prId],
    queryFn: async () => {
      const res = await api.get(`/prs/${prId}`);
      return res.data;
    },
    enabled: !!prId,
  });

  useEffect(() => {
    if (prData) {
      setTitle(prData.title || "");
      setDescription(prData.description || "");
      setSourceBranch(prData.sourceBranch || "");
      setTargetBranch(prData.targetBranch || "");
      setRequiredApprovals(prData.requiredApprovals || 1);
    }
  }, [prData]);

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

  const editMutation = useMutation({
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
      };

      const res = await api.put(`/prs/${prId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prs"] });
      queryClient.invalidateQueries({ queryKey: ["pr", prId] });
      toast.success("Pull Request updated successfully.");
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to update Pull Request");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editMutation.mutate();
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
            <h2 className="text-lg font-bold">Edit Pull Request</h2>
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

          {/* Reviewers are disabled in edit mode as they are mapped via reviews logic */}
          <div className="opacity-50 pointer-events-none">
            <div className="border border-slate-200 rounded-xl overflow-hidden flex flex-col">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Assign Reviewers (Disabled)</span>
              </div>
            </div>
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
            disabled={editMutation.isPending || !title || !sourceBranch || !targetBranch}
            className="px-5 py-2 rounded-xl bg-[#0066FF] text-white text-xs font-bold hover:bg-[#0052CC] shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {editMutation.isPending ? "Updating..." : "Update Pull Request"}
          </button>
        </div>
      </div>
    </div>
  );
};
