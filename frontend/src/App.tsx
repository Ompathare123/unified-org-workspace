import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/layout/AppLayout";


// Pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import TicketsPage from "@/pages/tickets/TicketsPage";
import TicketDetailPage from "@/pages/tickets/TicketDetailPage";
import PRsPage from "@/pages/prs/PRsPage";
import PRDetailPage from "@/pages/prs/PRDetailPage";
import AuditPage from "@/pages/audit/AuditPage";
import NotificationsPage from "@/pages/notifications/NotificationsPage";
import DigestPage from "@/pages/digest/DigestPage";
import ConnectionsPage from "@/pages/connections/ConnectionsPage";
import MembersPage from "@/pages/members/MembersPage";
import UserInvitationsPage from "@/pages/members/UserInvitationsPage";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-xs text-slate-500 font-medium">
        Loading workspace...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Layout & Pages */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/prs" element={<PRsPage />} />
            <Route path="/prs/:id" element={<PRDetailPage />} />
            <Route path="/audit" element={<AuditPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/digest" element={<DigestPage />} />
            <Route path="/ai-digest" element={<DigestPage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/invitations" element={<UserInvitationsPage />} />
          </Route>


          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
