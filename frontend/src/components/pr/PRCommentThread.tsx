import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MessageSquare, MoreVertical, Edit2, Trash2, CornerDownRight } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface PRComment {
  id: string;
  pullRequestId: string;
  userId: string;
  content: string;
  isEdited: boolean;
  isDeleted: boolean;
  parentId: string | null;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    avatar: string;
  };
}

interface PRCommentThreadProps {
  prId: string;
}

export const PRCommentThread: React.FC<PRCommentThreadProps> = ({ prId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: commentsData, isLoading } = useQuery({
    queryKey: ["prComments", prId],
    queryFn: async () => {
      const res = await api.get(`/prs/${prId}/comments?limit=100`);
      return res.data;
    },
  });

  const comments: PRComment[] = commentsData?.data || [];
  const rootComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  // Optimistic Add
  const addMutation = useMutation({
    mutationFn: async (payload: { content: string; parentId?: string }) => {
      const res = await api.post(`/prs/${prId}/comments`, payload);
      return res.data;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["prComments", prId] });
      const previousComments = queryClient.getQueryData(["prComments", prId]);
      queryClient.setQueryData(["prComments", prId], (old: any) => {
        if (!old) return old;
        const optimisticComment = {
          id: `temp-${Date.now()}`,
          pullRequestId: prId,
          userId: user?.id,
          content: payload.content,
          isEdited: false,
          isDeleted: false,
          parentId: payload.parentId || null,
          createdAt: new Date().toISOString(),
          user: {
            id: user?.id,
            fullName: user?.fullName,
            avatar: null,
          },
        };
        return { ...old, data: [...old.data, optimisticComment] };
      });
      return { previousComments };
    },
    onError: (err, payload, context) => {
      queryClient.setQueryData(["prComments", prId], context?.previousComments);
      toast.error("Failed to post comment");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["prComments", prId] });
    },
  });

  // Optimistic Edit
  const editMutation = useMutation({
    mutationFn: async (payload: { id: string; content: string }) => {
      const res = await api.put(`/prs/${prId}/comments/${payload.id}`, { content: payload.content });
      return res.data;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["prComments", prId] });
      const previousComments = queryClient.getQueryData(["prComments", prId]);
      queryClient.setQueryData(["prComments", prId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((c: PRComment) =>
            c.id === payload.id ? { ...c, content: payload.content, isEdited: true } : c
          ),
        };
      });
      return { previousComments };
    },
    onError: (err, payload, context) => {
      queryClient.setQueryData(["prComments", prId], context?.previousComments);
      toast.error("Failed to edit comment");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["prComments", prId] });
    },
  });

  // Optimistic Delete
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/prs/${prId}/comments/${id}`);
      return res.data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["prComments", prId] });
      const previousComments = queryClient.getQueryData(["prComments", prId]);
      queryClient.setQueryData(["prComments", prId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((c: PRComment) =>
            c.id === id ? { ...c, content: "This comment was deleted.", isDeleted: true } : c
          ),
        };
      });
      return { previousComments };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["prComments", prId], context?.previousComments);
      toast.error("Failed to delete comment");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["prComments", prId] });
    },
  });

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addMutation.mutate({ content: newComment });
    setNewComment("");
  };

  const handlePostReply = (parentId: string, content: string) => {
    if (!content.trim()) return;
    addMutation.mutate({ content, parentId });
    setReplyingTo(null);
  };

  const CommentNode = ({ comment, isReply = false }: { comment: PRComment; isReply?: boolean }) => {
    const isOwner = comment.user.id === user?.id;
    const [replyText, setReplyText] = useState("");

    return (
      <div className={`flex gap-4 p-4 ${isReply ? "ml-12 border-l-2 border-purple-100 pl-4" : "border border-gray-100 rounded-2xl bg-white shadow-sm"}`}>
        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
          {comment.user.fullName.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 space-y-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-gray-900">{comment.user.fullName}</span>
              <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
              {comment.isEdited && !comment.isDeleted && <span className="text-[10px] text-gray-400">(edited)</span>}
            </div>
            
            {!comment.isDeleted && isOwner && (
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }} className="p-1 hover:bg-gray-100 rounded text-gray-400 transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { if(confirm("Delete this comment?")) deleteMutation.mutate(comment.id); }} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className={`text-xs text-gray-700 prose prose-sm prose-purple max-w-none ${comment.isDeleted ? "italic text-gray-400" : ""}`}>
            {editingId === comment.id ? (
              <div className="space-y-2 mt-2">
                <textarea
                  className="w-full text-xs p-2 border border-purple-200 rounded-lg focus:ring-1 focus:ring-purple-500 bg-gray-50"
                  rows={3}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button onClick={() => { editMutation.mutate({ id: comment.id, content: editContent }); setEditingId(null); }} className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg">Save</button>
                </div>
              </div>
            ) : (
              <ReactMarkdown>{comment.content}</ReactMarkdown>
            )}
          </div>

          {!comment.isDeleted && !isReply && (
            <div className="pt-2">
              <button 
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-[11px] font-bold text-gray-500 hover:text-purple-600 flex items-center gap-1 transition-colors"
              >
                <CornerDownRight className="w-3.5 h-3.5" /> Reply
              </button>
            </div>
          )}

          {replyingTo === comment.id && (
            <div className="mt-3 flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0">
                {user?.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  className="w-full text-xs p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-purple-500 bg-white"
                  rows={2}
                  placeholder="Write a reply... (Markdown supported)"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setReplyingTo(null)} className="px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button onClick={() => handlePostReply(comment.id, replyText)} className="px-3 py-1 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm">Reply</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handlePostComment} className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm space-y-3">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-600" /> Start a discussion
        </label>
        <textarea
          className="w-full text-xs p-3 border border-gray-200 rounded-xl focus:ring-1 focus:ring-purple-500 focus:outline-none bg-gray-50"
          rows={3}
          placeholder="Leave a comment... (Markdown is supported)"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-gray-400">Styling with Markdown is supported</span>
          <button
            type="submit"
            disabled={!newComment.trim() || addMutation.isPending}
            className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl shadow-sm transition-colors"
          >
            {addMutation.isPending ? "Posting..." : "Comment"}
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="text-center p-8 text-xs text-gray-500">Loading comments...</div>
      ) : rootComments.length === 0 ? (
        <div className="text-center p-12 text-xs text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          No comments yet. Start the conversation!
        </div>
      ) : (
        <div className="space-y-4">
          {rootComments.map((comment) => (
            <div key={comment.id} className="space-y-2">
              <CommentNode comment={comment} />
              {getReplies(comment.id).map((reply) => (
                <CommentNode key={reply.id} comment={reply} isReply />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
