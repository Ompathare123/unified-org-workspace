import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { Check, X, Shield, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const UserInvitationsPage: React.FC = () => {
  const { user, refreshAuth } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: invitations, isLoading } = useQuery({
    queryKey: ["my-invitations"],
    queryFn: async () => {
      const res = await api.get("/users/invitations");
      return res.data;
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/users/invitations/${id}/accept`);
    },
    onSuccess: async () => {
      toast.success("Invitation accepted! Organization added to your switcher.");
      await refreshAuth();
      queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to accept invitation"),
  });

  const declineMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/users/invitations/${id}/decline`);
    },
    onSuccess: () => {
      toast.success("Invitation declined.");
      queryClient.invalidateQueries({ queryKey: ["my-invitations"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to decline invitation"),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-sm font-medium text-slate-500">Loading invitations...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-10 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Organization Invitations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and manage invitations sent to {user?.email}
          </p>
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-blue-600 font-semibold hover:underline"
        >
          Return to Dashboard
        </button>
      </div>

      <div className="bg-white border border-slate-200/60 shadow-2xs rounded-2xl overflow-hidden">
        {invitations && invitations.length > 0 ? (
          <ul className="divide-y divide-slate-100">
            {invitations.map((invite: any) => (
              <li key={invite.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    {invite.organization.name}
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">
                      New
                    </span>
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-slate-400" />
                      Invited by {invite.invitedBy.fullName}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-amber-500" />
                      Role: {invite.role}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-4 sm:mt-0">
                  <button
                    onClick={() => declineMutation.mutate(invite.id)}
                    disabled={declineMutation.isPending || acceptMutation.isPending}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" /> Decline
                  </button>
                  <button
                    onClick={() => acceptMutation.mutate(invite.id)}
                    disabled={declineMutation.isPending || acceptMutation.isPending}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0066FF] hover:bg-blue-600 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                  >
                    <Check className="w-4 h-4" /> Accept Invitation
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Pending Invitations</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              You're all caught up! You don't have any pending organization invitations at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInvitationsPage;
