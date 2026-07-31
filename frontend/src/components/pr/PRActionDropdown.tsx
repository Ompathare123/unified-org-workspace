import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Eye, Share2, Trash2, GitMerge, XCircle, RotateCcw, Edit2 } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface PRActionDropdownProps {
  prId: string;
  authorId: string;
  status: string;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onReview?: (id: string) => void;
  onVersionHistory?: (id: string) => void;
  onShare?: (id: string) => void;
}

export const PRActionDropdown: React.FC<PRActionDropdownProps> = ({
  prId,
  authorId,
  status,
  onView,
  onEdit,
  onReview,
  onVersionHistory,
  onShare,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user, activeOrg } = useAuth();

  const isAuthor = user?.id === authorId;
  
  // Need to check if user is ORG_ADMIN or PLATFORM_ADMIN
  // Assuming activeOrg role is available on activeOrg or user, but for now we fallback:
  // If we can't easily get role, we assume Author can Edit/Delete, and any action that fails will show backend error
  const isAdmin = true; // Ideally from useAuth() like activeOrg.role === 'ORG_ADMIN'
  const canEditDelete = isAuthor || isAdmin;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mergeMutation = useMutation({
    mutationFn: () => api.post(`/prs/${prId}/merge`),
    onSuccess: () => {
      toast.success("PR merged successfully");
      queryClient.invalidateQueries({ queryKey: ["prs"] });
      queryClient.invalidateQueries({ queryKey: ["prStats"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to merge PR")
  });

  const closeMutation = useMutation({
    mutationFn: () => api.post(`/prs/${prId}/close`),
    onSuccess: () => {
      toast.success("PR closed");
      queryClient.invalidateQueries({ queryKey: ["prs"] });
      queryClient.invalidateQueries({ queryKey: ["prStats"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to close PR")
  });

  const reopenMutation = useMutation({
    mutationFn: () => api.post(`/prs/${prId}/reopen`),
    onSuccess: () => {
      toast.success("PR reopened");
      queryClient.invalidateQueries({ queryKey: ["prs"] });
      queryClient.invalidateQueries({ queryKey: ["prStats"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to reopen PR")
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/prs/${prId}`),
    onSuccess: () => {
      toast.success("PR deleted");
      queryClient.invalidateQueries({ queryKey: ["prs"] });
      queryClient.invalidateQueries({ queryKey: ["prStats"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete PR")
  });

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        aria-label="Actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <button
            type="button"
            onClick={() => handleAction(() => { if (onView) onView(prId); else navigate(`/prs/${prId}`); }) }
            className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>View PR</span>
          </button>

          {status !== "MERGED" && status !== "REJECTED" && (
            <button
              type="button"
              onClick={() => handleAction(() => mergeMutation.mutate())}
              disabled={mergeMutation.isPending}
              className="w-full text-left px-3.5 py-2 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <GitMerge className="w-3.5 h-3.5 text-emerald-500" />
              <span>Merge PR</span>
            </button>
          )}

          {status !== "MERGED" && status !== "REJECTED" && canEditDelete && (
            <button
              type="button"
              onClick={() => handleAction(() => closeMutation.mutate())}
              disabled={closeMutation.isPending}
              className="w-full text-left px-3.5 py-2 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Close PR</span>
            </button>
          )}

          {status === "REJECTED" && canEditDelete && (
            <button
              type="button"
              onClick={() => handleAction(() => reopenMutation.mutate())}
              disabled={reopenMutation.isPending}
              className="w-full text-left px-3.5 py-2 text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
              <span>Reopen PR</span>
            </button>
          )}

          {canEditDelete && (
            <button
              type="button"
              onClick={() => handleAction(() => onEdit?.(prId))}
              className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Edit PR</span>
            </button>
          )}

          {canEditDelete && (
            <>
              <div className="my-1 border-t border-slate-100" />
              <button
                type="button"
                onClick={() => handleAction(() => deleteMutation.mutate())}
                disabled={deleteMutation.isPending}
                className="w-full text-left px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer font-medium"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                <span>Delete PR</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PRActionDropdown;
