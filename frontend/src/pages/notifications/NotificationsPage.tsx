import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bell,
  Search,
  CheckCircle2,
  Sparkles,
  Ticket,
  GitPullRequest,
  ShieldCheck,
  Check,
  RotateCcw,
  Inbox,
  Trash2,
} from "lucide-react";

import type { NotificationItem } from "@/components/layout/NotificationBell";
import api from "@/lib/api";

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");

  // 1. Fetch Notifications with 15s poll
  const { data: notificationsData } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      try {
        const res = await api.get("/notifications");
        return res.data;
      } catch {
        return [];
      }
    },
    refetchInterval: 15000,
  });

  const notificationsList: NotificationItem[] = useMemo(() => {
    if (!notificationsData || !Array.isArray(notificationsData) || notificationsData.length === 0) {
      return [];
    }
    return notificationsData.map((n: any) => ({
      id: n.id,
      title: n.title,
      description: n.message || n.description,
      category: n.type === "SYSTEM" ? "Tickets" : n.type === "SECURITY" ? "Audit" : "AI Digest",
      timestamp: new Date(n.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isRead: n.read || n.isRead || false,
      link: n.metadata?.ticketId ? `/tickets/${n.metadata.ticketId}` : "/notifications",
    }));
  }, [notificationsData]);

  // 2. Mark All Read Mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read!");
    },
  });

  // 3. Mark Read Mutation
  const toggleReadMutation = useMutation({
    mutationFn: async ({ id, isRead }: { id: string; isRead: boolean }) => {
      if (!isRead) {
        await api.patch(`/notifications/${id}/read`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  // 4. Delete Notification Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification deleted!");
    },
  });

  const filteredNotifications = useMemo(() => {
    return notificationsList.filter((n) => {
      const matchesSearch =
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.description.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesFilter = true;
      if (activeFilter === "Unread") {
        matchesFilter = !n.isRead;
      } else if (activeFilter !== "All") {
        matchesFilter = n.category === activeFilter;
      }

      return matchesSearch && matchesFilter;
    });
  }, [notificationsList, searchQuery, activeFilter]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "AI Digest":
        return <Sparkles className="w-4 h-4 text-[#0066FF]" />;
      case "Tickets":
        return <Ticket className="w-4 h-4 text-[#7C3AED]" />;
      case "Pull Requests":
        return <GitPullRequest className="w-4 h-4 text-[#10B981]" />;
      case "Audit":
        return <ShieldCheck className="w-4 h-4 text-[#F97316]" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const unreadCount = notificationsList.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] sm:text-[26px] font-bold text-[#0F172A] tracking-tight leading-tight">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#0066FF] text-xs font-bold">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs sm:text-[13.5px] text-[#64748B] font-normal mt-1">
            Stay updated with real-time ticket alerts, PR reviews, audit logs, and AI digests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => markAllReadMutation.mutate()}
          className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-2 transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <CheckCircle2 className="w-4 h-4 text-[#0066FF]" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Toolbar & Category Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full h-10 pl-3.5 pr-9 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/15 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {["All", "Unread", "Tickets", "Pull Requests", "Audit", "AI Digest"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeFilter === tab
                    ? "bg-[#0066FF] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100">
        {filteredNotifications.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No notifications found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no notifications matching your selected filters or search query.
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => navigate(n.link)}
              className={`p-4 sm:p-5 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-start justify-between gap-4 ${
                !n.isRead ? "bg-blue-50/20" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Category Icon */}
                <div className="p-2.5 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                  {getCategoryIcon(n.category)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={`text-sm ${
                        !n.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-700"
                      }`}
                    >
                      {n.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                      {n.category}
                    </span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#0066FF] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {n.description}
                  </p>
                  <div className="text-[11px] text-slate-400 font-medium pt-0.5">
                    {n.timestamp}
                  </div>
                </div>
              </div>

              {/* Mark Read/Unread & Delete Action */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleReadMutation.mutate({ id: n.id, isRead: n.isRead });
                  }}
                  title={n.isRead ? "Mark as unread" : "Mark as read"}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {n.isRead ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                      <span className="hidden sm:inline">Unread</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#0066FF]" />
                      <span className="hidden sm:inline">Mark Read</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMutation.mutate(n.id);
                  }}
                  title="Delete notification"
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
