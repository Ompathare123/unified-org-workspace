import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Bell,
  Sparkles,
  Ticket,
  GitPullRequest,
  ShieldCheck,
  ArrowRight,
  Check,
} from "lucide-react";
import api from "@/lib/api";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: "Tickets" | "Pull Requests" | "Audit" | "AI Digest";
  timestamp: string;
  isRead: boolean;
  link: string;
}


interface NotificationBellProps {
  unreadCount?: number;
}

export const NotificationBell: React.FC<NotificationBellProps> = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Notifications with automatic 15s poll
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

  const unreadCount = notificationsList.filter((n) => !n.isRead).length;

  // 2. Mark All Read Mutation
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  // 3. Mark Single Notification Read Mutation
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-[#475569] transition-colors cursor-pointer shadow-2xs"
        aria-label="Notifications"
      >
        <Bell className="w-4.5 h-4.5 text-[#475569]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-bold shadow-xs border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#0066FF]" />
              <span className="text-sm font-bold text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0066FF] text-[11px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => markAllReadMutation.mutate()}
              className="text-[11.5px] font-semibold text-[#0066FF] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              <span>Mark all read</span>
            </button>
          </div>

          {/* Notification List (Scrollable) */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notificationsList.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.isRead) markReadMutation.mutate(n.id);
                  setIsOpen(false);
                  navigate(n.link);
                }}
                className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 relative ${
                  !n.isRead ? "bg-blue-50/20" : ""
                }`}
              >
                {/* Icon Container */}
                <div className="p-2 rounded-xl bg-slate-100/80 shrink-0 mt-0.5">
                  {getCategoryIcon(n.category)}
                </div>

                {/* Content */}
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-xs truncate ${
                        !n.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-700"
                      }`}
                    >
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                      {n.timestamp}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 line-clamp-2 leading-relaxed">
                    {n.description}
                  </p>
                </div>

                {/* Unread indicator dot */}
                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-[#0066FF] shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate("/notifications");
              }}
              className="text-xs font-bold text-[#0066FF] hover:underline flex items-center justify-center gap-1.5 w-full cursor-pointer"
            >
              <span>View All Notifications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
