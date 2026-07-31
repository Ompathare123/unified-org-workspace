import React, { useEffect, useState } from "react";
import { Network, Plus, CheckCircle2, XCircle, Trash2, Building2, Share2, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";


export const ConnectionsPage: React.FC = () => {
  const { activeOrg } = useAuth();
  const [connections, setConnections] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [sharedItems, setSharedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Request Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [connRes, orgsRes, shareRes] = await Promise.allSettled([
        api.get("/connections"),
        api.get("/connections/organizations"),
        api.get("/share"),
      ]);

      if (connRes.status === "fulfilled") setConnections(connRes.value.data);
      if (orgsRes.status === "fulfilled") setOrgs(orgsRes.value.data);
      if (shareRes.status === "fulfilled") setSharedItems(shareRes.value.data);
    } catch (err) {
      console.error("Failed to load connections data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeOrg]);

  const handleRequestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerId) return;
    setRequesting(true);
    setError(null);
    try {
      await api.post("/connections/request", { partnerOrgId: selectedPartnerId });
      setShowRequestModal(false);
      setSelectedPartnerId("");
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to request connection.");
    } finally {
      setRequesting(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await api.post(`/connections/${id}/accept`);
      fetchData();
    } catch (err) {
      console.error("Failed to accept connection", err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.post(`/connections/${id}/reject`);
      fetchData();
    } catch (err) {
      console.error("Failed to reject connection", err);
    }
  };

  const handleRevokeConnection = async (id: string) => {
    try {
      await api.delete(`/connections/${id}`);
      fetchData();
    } catch (err) {
      console.error("Failed to revoke connection", err);
    }
  };

  const handleRevokeShare = async (shareId: string) => {
    try {
      await api.delete(`/share/${shareId}`);
      fetchData();
    } catch (err) {
      console.error("Failed to revoke share", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Cross-Org Connections</h1>
          <p className="text-xs text-gray-500 mt-1">Connect with external partner organizations and manage shared items.</p>
        </div>

        <button
          onClick={() => setShowRequestModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Request Connection</span>
        </button>
      </div>

      {/* Active & Pending Connections */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Network className="w-4 h-4 text-emerald-600" />
          <span>Organization Connections ({connections.length})</span>
        </h2>

        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading connections...</div>
        ) : connections.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            No active or pending connections. Click "Request Connection" to connect with partner orgs.
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((c) => {
              const isRequester = c.requesterOrgId === activeOrg?.id;
              const partner = isRequester ? c.partnerOrg : c.requesterOrg;

              return (
                <div
                  key={c.id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-xs text-gray-900">{partner?.name || "Partner Organization"}</span>
                      <span className="text-[10px] text-gray-400">({partner?.slug})</span>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Status: <span className="font-semibold text-gray-800">{c.status}</span>
                      {isRequester ? " (Outbound Request)" : " (Inbound Request)"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isRequester && c.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleAccept(c.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleReject(c.id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleRevokeConnection(c.id)}
                      title="Revoke / Delete Connection"
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Items Shared With Your Organization */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-indigo-600" />
          <span>Items Shared With Your Organization ({sharedItems.length})</span>
        </h2>

        {sharedItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            No items have been shared with your organization yet.
          </div>
        ) : (
          <div className="space-y-3">
            {sharedItems.map((s) => (
              <div
                key={s.id}
                className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded-md">
                      {s.type}
                    </span>
                    <span className="font-bold text-xs text-gray-900">
                      {s.ticket?.title || s.pullRequest?.title || "Shared Item"}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Shared by {s.sharedByUser?.fullName} ({s.sharedByUser?.email})
                  </div>
                </div>

                <button
                  onClick={() => handleRevokeShare(s.id)}
                  title="Revoke Access"
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Connection Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-gray-900">Request Cross-Org Connection</h2>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRequestConnection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Select Partner Organization</label>
                {orgs.length === 0 ? (
                  <input
                    type="text"
                    required
                    placeholder="Enter Partner Organization ID"
                    value={selectedPartnerId}
                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                ) : (
                  <select
                    required
                    value={selectedPartnerId}
                    onChange={(e) => setSelectedPartnerId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800"
                  >
                    <option value="">-- Choose Organization --</option>
                    {orgs.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.slug})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requesting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md"
                >
                  {requesting ? "Sending..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionsPage;
