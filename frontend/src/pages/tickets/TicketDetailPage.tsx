import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import TicketHeader from "@/components/ticket-details/TicketHeader";
import PartnerBanner from "@/components/ticket-details/PartnerBanner";
import SecurityBanner from "@/components/ticket-details/SecurityBanner";
import TicketTabs from "@/components/ticket-details/TicketTabs";
import type { TicketTabType } from "@/components/ticket-details/TicketTabs";
import AuditTimeline from "@/components/ticket-details/AuditTimeline";
import TicketSidebar from "@/components/ticket-details/TicketSidebar";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MessageSquareText, Paperclip, Send, Upload, FileText, Download, Trash2, File, Edit2 } from "lucide-react";

// Using backend Attachment types

export const TicketDetailPage: React.FC = () => {
  const { id = "TCK-1092" } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user, activeOrg } = useAuth();
  const [activeTab, setActiveTab] = useState<TicketTabType>("audit");
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [localAuditLogs, setLocalAuditLogs] = useState<any[]>([]);

  // 1. Fetch Ticket Details from Backend API
  const { data: ticketData } = useQuery({

    queryKey: ["ticket", id],
    queryFn: async () => {
      try {
        const res = await api.get(`/tickets/${id}`);
        return res.data;
      } catch {
        return null;
      }
    },
  });

  // 1b. Fetch all tickets to determine the sequential ID
  const { data: allTickets } = useQuery({
    queryKey: ["tickets", activeOrg?.id],
    queryFn: async () => {
      try {
        const res = await api.get("/tickets");
        return res.data;
      } catch {
        return [];
      }
    },
  });

  const ticketIndex = Array.isArray(allTickets) ? allTickets.findIndex((t: any) => t.id === id) : -1;
  const shortTicketId = ticketIndex >= 0 ? `TKT-${1258 - ticketIndex}` : id;

  // 2. Fetch Comments
  const { data: commentsData } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      try {
        const res = await api.get(`/tickets/${id}/comments`);
        return res.data;
      } catch {
        return [];
      }
    },
  });

  // 3. Fetch Audit Events for this ticket
  const { data: auditEventsData } = useQuery({
    queryKey: ["ticket-audit", id],
    queryFn: async () => {
      try {
        const res = await api.get(`/audit-logs?resourceId=${id}`);
        return res.data;
      } catch {
        return [];
      }
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/tickets/${id}/comments`, {
        content: newComment,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      setNewComment("");
      toast.success("Comment posted!");
      setTimeout(scrollToBottom, 100);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to post comment");
    },
  });

  const { data: membersData } = useQuery({
    queryKey: ["members", activeOrg?.id],
    queryFn: async () => {
      try {
        const res = await api.get("/orgs/members");
        return res.data;
      } catch {
        return [];
      }
    },
    enabled: !!activeOrg,
  });

  const assignMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.put(`/tickets/${id}`, { assignedToId: userId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      toast.success("Assignee updated.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to assign ticket");
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const dbStatus = newStatus === "In Progress" ? "IN_PROGRESS" : newStatus.toUpperCase();
      const res = await api.put(`/tickets/${id}`, { status: dbStatus });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] }); // invalidate ticket list as well
      toast.success("Status updated");
    },
  });

  // 5. Update Comment Mutation
  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      const res = await api.put(`/comments/${commentId}`, { content });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      setEditingCommentId(null);
      setEditingContent("");
      toast.success("Comment updated.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update comment");
    },
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post(`/tickets/${id}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      setUploadProgress(null);
      toast.success("File uploaded successfully.");
    },
    onError: (err: any) => {
      setUploadProgress(null);
      toast.error(err.response?.data?.message || "Failed to upload file");
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      const res = await api.delete(`/attachments/${attachmentId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", id] });
      toast.success("File deleted successfully.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete file");
    },
  });

  // 6. Delete Comment Mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await api.delete(`/comments/${commentId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      toast.success("Comment deleted.");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete comment");
    },
  });

  // Formatted Ticket Data
  const rawTitle = ticketData?.title || "";
  const headerTitle = ticketIndex >= 0 ? `Ticket ${shortTicketId}: ${rawTitle}` : rawTitle;
  const ticketStatus = ticketData?.status === "IN_PROGRESS" ? "In Progress" : ticketData?.status === "RESOLVED" ? "Resolved" : ticketData?.status === "CLOSED" ? "Closed" : ticketData?.status === "OPEN" ? "Open" : "Open";
  const partnerOrg = ticketData?.organization?.name || "";
  const createdByName = ticketData?.createdBy?.fullName || "";
  const assigneeName = ticketData?.assignedTo?.fullName || "";

  const commentsList = Array.isArray(commentsData) && commentsData.length > 0 ? commentsData : [];

  // Map audit events from backend to AuditTimeline shape
  const backendAuditEvents = Array.isArray(auditEventsData) ? auditEventsData.map((log: any) => ({
    id: log.id,
    time: new Date(log.createdAt || Date.now()).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    }),
    timestamp: new Date(log.createdAt || Date.now()).getTime(),
    actorName: log.user?.fullName || "System",
    actorInitials: (log.user?.fullName || "SY").slice(0, 2).toUpperCase(),
    actorBg: "bg-[#0066FF]",
    action: (log.action === "COMMENT_CREATED" ? "Added a comment" :
             log.action === "COMMENT_EDITED" ? "Edited a comment" :
             log.action === "COMMENT_DELETED" ? "Deleted a comment" :
             log.action?.includes("CREATE") ? "CREATED" :
             log.action?.includes("VIEW") ? "VIEWED" :
             log.action?.includes("COMMENT") ? "COMMENTED" :
             log.action?.includes("STATUS") ? "STATUS CHANGED" :
             log.action?.includes("UPDATE") ? "UPDATED" :
             log.action?.includes("DELETE") ? "DELETED" :
             log.action) as any,
    details: log.details || log.action || "",
    source: log.source || "Support Hub",
  })) : [];

  const combinedAuditEvents = [...localAuditLogs, ...backendAuditEvents].sort((a, b) => b.timestamp - a.timestamp);

  // Note: Attachments are now handled directly in the UI using uploadAttachmentMutation and deleteAttachmentMutation

  // 7. Compute Assignment Permissions
  const isCreator = ticketData?.createdBy?.id === user?.id;
  const canAssign = 
    activeOrg?.role === "ORG_ADMIN" || 
    activeOrg?.role === "PLATFORM_ADMIN" || 
    (activeOrg?.role === "SUPPORT_AGENT" && isCreator);


  return (
    <div className="space-y-6">
      {/* Ticket Header & Title */}
      <TicketHeader
        ticketId={shortTicketId}
        title={headerTitle}
        status={ticketStatus}
        featureFlagName="High-Priority SLA: True"
      />

      {/* Information Banners */}
      <div className="space-y-4">
        <PartnerBanner partnerOrgName={partnerOrg} />
        <SecurityBanner />
      </div>

      {/* Main Content Layout: Left Content & Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Tabs & Tab Content */}
        <div className="lg:col-span-2 space-y-6">
          <TicketTabs
            commentsCount={commentsList.length}
            attachmentsCount={ticketData?.attachments?.length || 0}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* Active Tab Content */}
          {activeTab === "audit" && <AuditTimeline events={combinedAuditEvents} />}


          {/* Comments Tab */}
          {activeTab === "comments" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <MessageSquareText className="w-4 h-4 text-[#0066FF]" />
                <h3 className="text-sm font-bold text-slate-800">Comments ({commentsList.length})</h3>
              </div>

              {/* Comment Thread */}
              <div className="space-y-5 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {commentsList.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <MessageSquareText className="w-10 h-10 text-slate-200 mb-3" />
                    <p className="text-sm font-bold text-slate-700">No comments yet</p>
                    <p className="text-xs text-slate-500 mt-1">Start the discussion for this ticket.</p>
                    <button
                      type="button"
                      onClick={() => document.getElementById("comment-composer")?.focus()}
                      className="mt-4 px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Write Comment
                    </button>
                  </div>
                ) : (
                  commentsList.map((c: any) => {
                    const isOwnComment = c.userId === user?.id || c.authorId === user?.id;
                    const canModerate = activeOrg?.role === "ORG_ADMIN" || activeOrg?.role === "PLATFORM_ADMIN";
                    const canEditDelete = isOwnComment || canModerate;
                    const isDeleted = c.isDeleted;

                    return (
                      <div key={c.id} className={`flex gap-4 ${isDeleted ? 'opacity-60' : ''}`}>
                        <div className="shrink-0 pt-1">
                          <div className="w-8 h-8 rounded-full bg-[#0066FF] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                            {c.user?.fullName?.slice(0, 2).toUpperCase() || c.author?.fullName?.slice(0, 2).toUpperCase() || "U"}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="rounded-2xl bg-slate-50 border border-slate-200/70 p-4">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-800">
                                  {c.user?.fullName || c.author?.fullName || "User"}
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium">
                                  {new Date(c.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </span>
                                {c.isEdited && !isDeleted && (
                                  <span className="text-[10px] text-slate-400 font-medium italic">(edited)</span>
                                )}
                              </div>
                              
                              {!isDeleted && canEditDelete && (
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                                  <button
                                    onClick={() => {
                                      setEditingCommentId(c.id);
                                      setEditingContent(c.content || c.message);
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-[#0066FF] hover:bg-blue-50 transition-colors"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm("Are you sure you want to delete this comment?")) {
                                        deleteCommentMutation.mutate(c.id);
                                      }
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            {isDeleted ? (
                              <p className="text-xs text-slate-500 italic flex items-center gap-2">
                                <Trash2 className="w-3.5 h-3.5 text-slate-400" /> This comment was deleted.
                              </p>
                            ) : editingCommentId === c.id ? (
                              <div className="space-y-2 mt-2">
                                <textarea
                                  value={editingContent}
                                  onChange={(e) => setEditingContent(e.target.value)}
                                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-[#0066FF] min-h-[80px] resize-y bg-white"
                                />
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setEditingCommentId(null)}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-100"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => updateCommentMutation.mutate({ commentId: c.id, content: editingContent })}
                                    disabled={updateCommentMutation.isPending || !editingContent.trim()}
                                    className="px-3 py-1.5 rounded-lg bg-[#0066FF] text-white text-[11px] font-semibold hover:bg-[#0052CC] disabled:opacity-50"
                                  >
                                    Save changes
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                                {c.content || c.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={commentsEndRef} />
              </div>

              {/* Multiline Composer */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-[#EBF3FF] border border-[#BFDBFE] text-[#0066FF] font-bold text-xs flex items-center justify-center shrink-0 shadow-xs mt-1">
                    {user?.fullName?.slice(0, 2).toUpperCase() || "ME"}
                  </div>
                  <div className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-200 focus-within:border-[#0066FF] focus-within:ring-4 focus-within:ring-[#0066FF]/10 transition-all overflow-hidden relative">
                    <textarea
                      id="comment-composer"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          if (newComment.trim() && !addCommentMutation.isPending) {
                            addCommentMutation.mutate();
                          }
                        }
                      }}
                      placeholder="Write your update... (Ctrl+Enter to post)"
                      className="w-full p-4 text-xs text-slate-800 outline-none resize-none min-h-[100px] bg-transparent"
                    />
                    <div className="px-3 py-2.5 bg-slate-100/50 border-t border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button type="button" className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-colors" title="Attach file">
                          <Paperclip className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        disabled={!newComment.trim() || addCommentMutation.isPending}
                        onClick={() => addCommentMutation.mutate()}
                        className="px-4 py-1.5 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        <Send className="w-3 h-3" />
                        <span>{addCommentMutation.isPending ? "Posting..." : "Post Comment"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attachments Tab */}
          {activeTab === "attachments" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-[#0066FF]" />
                  <h3 className="text-sm font-bold text-slate-800">Attachments ({ticketData?.attachments?.length || 0} Files)</h3>
                </div>
                
                <input
                  type="file"
                  multiple
                  ref={fileInputRef}
                  onChange={(e) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;
                    Array.from(files).forEach((file) => {
                      const formData = new FormData();
                      formData.append("file", file);
                      uploadAttachmentMutation.mutate(formData);
                    });
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadAttachmentMutation.isPending}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#0066FF] text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
              </div>

              {uploadProgress !== null && (
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4 overflow-hidden border border-slate-200">
                  <div className="bg-[#0066FF] h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}

              <div className="space-y-3">
                {!ticketData?.attachments || ticketData.attachments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <p className="text-sm font-medium text-slate-500">No attachments uploaded yet.</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">Upload files to share logs, screenshots or documents.</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-[#0066FF] text-white text-xs font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                      Upload File
                    </button>
                  </div>
                ) : (
                  ticketData.attachments.map((file: any) => (
                    <div key={file.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="shrink-0">
                          {file.mimeType?.startsWith("image/") ? (
                            <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000"}${file.fileUrl}`} alt={file.fileName} className="w-10 h-10 object-cover rounded-lg border border-slate-200 shadow-sm" />
                          ) : file.mimeType === "application/pdf" ? (
                            <FileText className="w-8 h-8 text-red-500" />
                          ) : (
                            <File className="w-8 h-8 text-[#0066FF]" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 break-all">{file.fileName}</h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-slate-500 flex-wrap">
                            <span className="uppercase font-semibold">{file.fileName.split('.').pop() || "Document"}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>{file.fileSize ? `${(file.fileSize / 1024).toFixed(0)} KB` : "Unknown Size"}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>Uploaded by {file.uploadedBy?.fullName || "System"}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>{new Date(file.createdAt).toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || "http://localhost:5000"}${file.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={file.fileName}
                          className="p-2 rounded-lg text-slate-500 hover:text-[#0066FF] hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this attachment?")) {
                              deleteAttachmentMutation.mutate(file.id);
                            }
                          }}
                          className="p-2 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Column: Ticket Details Sidebar */}
        <div className="lg:col-span-1">
          <TicketSidebar
            ticketId={shortTicketId}
            requesterOrg={partnerOrg}
            isExternalPartner={true}
            createdBy={{
              name: createdByName,
              date: "May 24, 2025 09:21 AM",
              initials: "AR",
              bg: "bg-[#7C3AED]",
            }}
            assignee={{
              name: assigneeName,
              date: ticketData?.assignedTo ? "" : "",
              initials: assigneeName ? assigneeName.slice(0, 2).toUpperCase() : "",
              bg: "bg-[#0066FF]",
            }}
            members={membersData || []}
            onAssigneeChange={(userId) => assignMutation.mutate(userId)}
            onStatusChange={(status) => statusMutation.mutate(status)}
            priority={ticketData?.priority ? ticketData.priority.charAt(0) + ticketData.priority.slice(1).toLowerCase() : "High"}
            status={ticketStatus}
            category="Security"
            source="Support Hub"
            featureFlagName="Standard SLA"
            tags={[]}
            createdAt={new Date(ticketData?.createdAt || Date.now()).toLocaleDateString()}
            updatedAt={new Date(ticketData?.updatedAt || Date.now()).toLocaleDateString()}
            canAssign={canAssign}
          />
        </div>
      </div>
    </div>
  );
};

export default TicketDetailPage;
