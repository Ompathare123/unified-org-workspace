import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import FilterBar from "@/components/tickets/FilterBar";
import TicketTable from "@/components/tickets/TicketTable";
import type { TicketItem } from "@/components/tickets/TicketTable";

import NewTicketButton from "@/components/tickets/NewTicketButton";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { X } from "lucide-react";

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeOrg } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [orgFilter, setOrgFilter] = useState("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createPriority, setCreatePriority] = useState("Medium");
  const [createStatus, setCreateStatus] = useState("Open");
  const [createRequesterOrg, setCreateRequesterOrg] = useState("");

  // Edit Modal State
  const [editingTicket, setEditingTicket] = useState<TicketItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStatus, setEditStatus] = useState("Open");

  // 1. Fetch Tickets from Backend API
  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ["tickets", activeOrg?.id],
    queryFn: async () => {
      const res = await api.get("/tickets");
      return res.data;
    },
  });

  // Map Backend Data or return [] if empty
  const tickets: TicketItem[] = useMemo(() => {
    if (!ticketsData || !Array.isArray(ticketsData) || ticketsData.length === 0) {
      return [];
    }

    const priorityMap: Record<string, any> = {
      LOW: "Low",
      MEDIUM: "Medium",
      HIGH: "High",
      CRITICAL: "High", // maps to High badge; extend TicketItem if needed
    };

    return ticketsData.map((t: any, index: number) => ({
      id: `TKT-${1258 - index}`,
      rawId: t.id,
      subject: t.title,
      requesterOrg: t.organization?.name || activeOrg?.name || "",
      priority: (priorityMap[t.priority] || "Medium") as any,
      assignedToId: t.assignedToId,
      status: t.status === "OPEN"
        ? "Open"
        : t.status === "IN_PROGRESS"
        ? "In Progress"
        : t.status === "RESOLVED"
        ? "Resolved"
        : "Closed",
    }));
  }, [ticketsData, activeOrg]);


  // 2. Create Ticket Mutation
  const statusApiMap: Record<string, string> = {
    Open: "OPEN",
    "In Progress": "IN_PROGRESS",
    Resolved: "RESOLVED",
    Closed: "CLOSED",
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/tickets", {
        title: createTitle,
        description: createDescription || "",
        priority: createPriority.toUpperCase(),
        status: statusApiMap[createStatus] || "OPEN",
        requesterOrg: createRequesterOrg || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket created successfully!");
      setIsCreateOpen(false);
      setCreateTitle("");
      setCreateDescription("");
      setCreatePriority("Medium");
      setCreateStatus("Open");
      setCreateRequesterOrg("");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create ticket");
    },
  });

  // 3. Edit Ticket Mutation
  const editMutation = useMutation({
    mutationFn: async () => {
      if (!editingTicket?.rawId) return;
      const statusMap: Record<string, string> = {
        Open: "OPEN",
        "In Progress": "IN_PROGRESS",
        Resolved: "RESOLVED",
        Closed: "CLOSED",
      };
      const res = await api.put(`/tickets/${editingTicket.rawId}`, {
        title: editTitle,
        status: statusMap[editStatus] || "OPEN",
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket updated successfully!");
      setEditingTicket(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update ticket");
    },
  });

  // 4. Delete Ticket Mutation
  const deleteMutation = useMutation({
    mutationFn: async (rawId: string) => {
      const res = await api.delete(`/tickets/${rawId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket deleted successfully!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete ticket");
    },
  });

  const handleClearAll = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setOrgFilter("All");
    setAssigneeFilter("All");
  };

  const handleStartEdit = (ticket: TicketItem) => {
    setEditingTicket(ticket);
    setEditTitle(ticket.subject);
    setEditStatus(ticket.status);
  };

  const handleDelete = (rawId: string) => {
    if (window.confirm("Are you sure you want to delete this ticket?")) {
      deleteMutation.mutate(rawId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] sm:text-[26px] font-bold text-[#0F172A] tracking-tight leading-tight">
            Support Hub - Dashboard
          </h1>
          <p className="text-xs sm:text-[13.5px] text-[#64748B] font-normal mt-1">
            View and manage all support tickets for your organization.
          </p>
        </div>

        <div className="self-start sm:self-auto">
          <NewTicketButton onClick={() => setIsCreateOpen(true)} />
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        orgFilter={orgFilter}
        onOrgChange={setOrgFilter}
        assigneeFilter={assigneeFilter}
        onAssigneeChange={setAssigneeFilter}
        onClearAll={handleClearAll}
      />

      {/* Ticket Table */}
      <TicketTable
        data={tickets}
        isLoading={isLoading}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        orgFilter={orgFilter}
        assigneeFilter={assigneeFilter}
        onEditTicket={handleStartEdit}
        onDeleteTicket={handleDelete}
      />

      {/* Create Ticket Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Create New Support Ticket</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="e.g. API BOLA Vulnerability Check"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF] transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF] resize-none transition-colors"
                />
              </div>

              {/* Priority & Status side-by-side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={createPriority}
                    onChange={(e) => setCreatePriority(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF] bg-white transition-colors"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={createStatus}
                    onChange={(e) => setCreateStatus(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF] bg-white transition-colors"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Requester Org */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Requester Organization</label>
                <input
                  type="text"
                  value={createRequesterOrg}
                  onChange={(e) => setCreateRequesterOrg(e.target.value)}
                  placeholder="e.g. Acme Corp, Globex..."
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF] transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!createTitle.trim() || createMutation.isPending}
                onClick={() => createMutation.mutate()}
                className="px-5 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating..." : "Create Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Ticket Modal */}
      {editingTicket && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Edit Ticket ({editingTicket.id})</h3>
              <button
                type="button"
                onClick={() => setEditingTicket(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ticket Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-[#0066FF]"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingTicket(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={editMutation.isPending}
                onClick={() => editMutation.mutate()}
                className="px-5 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold disabled:opacity-50"
              >
                {editMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
