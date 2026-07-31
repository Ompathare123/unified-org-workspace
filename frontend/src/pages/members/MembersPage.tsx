import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { Search, UserPlus, LogOut, RefreshCw, X, Shield, History } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const MembersPage: React.FC = () => {
  const { activeOrg, user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"members" | "invitations">("members");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("SUPPORT_AGENT");

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState("");

  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  // Queries
  const { data: members,  } = useQuery({
    queryKey: ["members", activeOrg?.id],
    queryFn: async () => {
      const res = await api.get("/orgs/members");
      return res.data;
    },
    enabled: !!activeOrg,
  });

  const { data: invitations,  } = useQuery({
    queryKey: ["invitations", activeOrg?.id],
    queryFn: async () => {
      const res = await api.get("/orgs/invitations");
      return res.data;
    },
    enabled: !!activeOrg,
  });

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    return members.filter((m: any) => 
      m.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const filteredInvitations = useMemo(() => {
    if (!invitations) return [];
    return invitations.filter((i: any) => i.email.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [invitations, searchQuery]);

  // Mutations
  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      await api.post("/orgs/invitations", data);
    },
    onSuccess: () => {
      toast.success("Invitation sent");
      setIsInviteOpen(false);
      setInviteEmail("");
      queryClient.invalidateQueries({ queryKey: ["invitations", activeOrg?.id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to send invitation");
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/orgs/members/${userId}`);
    },
    onSuccess: () => {
      toast.success("Member removed");
      setSelectedMember(null);
      queryClient.invalidateQueries({ queryKey: ["members", activeOrg?.id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to remove member");
    },
  });

  const roleMutation = useMutation({
    mutationFn: async (data: { userId: string; role: string }) => {
      await api.put(`/orgs/members/${data.userId}/role`, { role: data.role });
    },
    onSuccess: () => {
      toast.success("Role updated");
      queryClient.invalidateQueries({ queryKey: ["members", activeOrg?.id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update role");
    },
  });

  const cancelInviteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/orgs/invitations/${id}`);
    },
    onSuccess: () => {
      toast.success("Invitation cancelled");
      queryClient.invalidateQueries({ queryKey: ["invitations", activeOrg?.id] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Error cancelling"),
  });

  const resendInviteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/orgs/invitations/${id}/resend`);
    },
    onSuccess: () => {
      toast.success("Invitation resent");
      queryClient.invalidateQueries({ queryKey: ["invitations", activeOrg?.id] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Error resending"),
  });

  const leaveOrgMutation = useMutation({
    mutationFn: async () => {
      await api.post("/orgs/leave");
    },
    onSuccess: () => {
      toast.success("Left organization successfully");
      window.location.href = "/";
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to leave"),
  });

  const transferMutation = useMutation({
    mutationFn: async (targetId: string) => {
      await api.post("/orgs/transfer-ownership", { toUserId: targetId });
    },
    onSuccess: () => {
      toast.success("Ownership transferred");
      setIsTransferOpen(false);
      queryClient.invalidateQueries({ queryKey: ["members", activeOrg?.id] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to transfer"),
  });

  // Current user's membership role in the active org
  const currentUserRole = members?.find((m: any) => m.userId === user?.id)?.role;
  const isOrgAdmin = currentUserRole === "ORG_ADMIN" || currentUserRole === "PLATFORM_ADMIN";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] sm:text-[26px] font-bold text-[#0F172A] tracking-tight leading-tight">
            Organization Members
          </h1>
          <p className="text-xs sm:text-[13.5px] text-[#64748B] font-normal mt-1">
            Manage members, roles, and invitations for {activeOrg?.name}.
          </p>
        </div>
        <div className="flex gap-2">
          {isOrgAdmin && (
            <button
              onClick={() => setIsInviteOpen(true)}
              className="h-10 px-4 rounded-xl bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Member</span>
            </button>
          )}
          <button
            onClick={() => leaveOrgMutation.mutate()}
            className="h-10 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Leave Organization</span>
          </button>
        </div>
      </div>

      {isOrgAdmin && (
        <div className="flex justify-end">
           <button
             onClick={() => setIsTransferOpen(true)}
             className="text-xs text-slate-500 hover:text-slate-700 underline font-medium cursor-pointer"
           >
             Transfer Ownership Before Leaving?
           </button>
        </div>
      )}

      {/* Toolbar / Search & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 rounded-2xl border border-slate-200/60 shadow-2xs gap-4">
        <div className="flex gap-2 bg-slate-100/50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("members")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "members" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            Active Members ({members?.length || 0})
          </button>
          {isOrgAdmin && (
            <button
              onClick={() => setActiveTab("invitations")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "invitations" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              Pending Invitations ({invitations?.filter((i:any) => i.status === "PENDING").length || 0})
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 h-10 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-2xs overflow-hidden">
        {activeTab === "members" && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500">Member</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500">Joined</th>
                {isOrgAdmin && <th className="px-6 py-4 text-xs font-bold text-slate-500 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m: any) => (
                <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div 
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => setSelectedMember(m)}
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                        {m.user.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[13px] font-bold text-slate-800">{m.user.fullName} {m.userId === user?.id && "(You)"}</div>
                        <div className="text-xs text-slate-500">{m.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isOrgAdmin && m.userId !== user?.id ? (
                      <select 
                        value={m.role} 
                        onChange={(e) => roleMutation.mutate({ userId: m.userId, role: e.target.value })}
                        className="text-xs border border-slate-200 rounded p-1 bg-white"
                      >
                        <option value="ORG_ADMIN">Admin</option>
                        <option value="SUPPORT_AGENT">Support Agent</option>
                        <option value="DEVELOPER">Developer</option>
                        <option value="REVIEWER">Reviewer</option>
                      </select>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-700 rounded-md">
                        {m.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(m.joinedAt).toLocaleDateString()}
                  </td>
                  {isOrgAdmin && (
                    <td className="px-6 py-4 text-right">
                      {m.userId !== user?.id && (
                        <button
                          onClick={() => removeMutation.mutate(m.userId)}
                          className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                    No active members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {activeTab === "invitations" && isOrgAdmin && (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500">Sent</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvitations.map((i: any) => (
                <tr key={i.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-[13px] font-medium text-slate-800">{i.email}</td>
                  <td className="px-6 py-4 text-xs text-slate-600">{i.role}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-md ${
                      i.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                      i.status === "EXPIRED" ? "bg-slate-100 text-slate-600" :
                      i.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {i.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(i.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-3">
                    {i.status === "PENDING" || i.status === "EXPIRED" ? (
                      <>
                        <button
                          onClick={() => resendInviteMutation.mutate(i.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> Resend
                        </button>
                        {i.status === "PENDING" && (
                          <button
                            onClick={() => cancelInviteMutation.mutate(i.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredInvitations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    No invitations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals & Drawers */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Invite Member</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm"
                  placeholder="colleague@company.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm bg-white"
                >
                  <option value="SUPPORT_AGENT">Support Agent</option>
                  <option value="DEVELOPER">Developer</option>
                  <option value="REVIEWER">Reviewer</option>
                  <option value="ORG_ADMIN">Organization Admin</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsInviteOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })}
                disabled={inviteMutation.isPending || !inviteEmail}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50"
              >
                {inviteMutation.isPending ? "Sending..." : "Send Invite"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isTransferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Transfer Ownership</h2>
            <p className="text-xs text-slate-500 mb-4">
              Select an active member to transfer admin ownership. You will be demoted to Support Agent.
            </p>
            <select
              value={transferTargetId}
              onChange={(e) => setTransferTargetId(e.target.value)}
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-sm bg-white mb-6"
            >
              <option value="">-- Select Member --</option>
              {members?.filter((m: any) => m.userId !== user?.id).map((m: any) => (
                <option key={m.userId} value={m.userId}>{m.user.fullName} ({m.user.email})</option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsTransferOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => transferMutation.mutate(transferTargetId)}
                disabled={transferMutation.isPending || !transferTargetId}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl disabled:opacity-50"
              >
                Transfer & Demote Me
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Profile Drawer */}
      {selectedMember && (
        <>
          <div className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={() => setSelectedMember(null)} />
          <div className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 border-l border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Member Profile</h2>
              <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
                  {selectedMember.user.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedMember.user.fullName}</h3>
                  <p className="text-sm text-slate-500">{selectedMember.user.email}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Organization Role</h4>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-slate-700">{selectedMember.role}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Joined Date</h4>
                  <p className="text-sm text-slate-700">{new Date(selectedMember.joinedAt).toLocaleString()}</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Audit Logs</h4>
                  <button onClick={() => {
                    navigate(`/audit?userId=${selectedMember.userId}`);
                  }} className="text-sm text-blue-600 hover:underline font-semibold flex items-center gap-1.5">
                    <History className="w-4 h-4" /> View full activity history
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MembersPage;
