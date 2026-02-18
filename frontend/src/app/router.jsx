/**
 * router.jsx — Application routes.
 * Public: /login, /register
 * Protected: /overview, /events, /leads, /leads/:id, /rules, /automations, /integrations, /system
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AppShell from "./layout/AppShell";
import { Spinner } from "../shared/ui/Spinner";

// Public
import Login from "../pages/Login";
import Register from "../pages/Register";
import Landing from "../pages/Landing";

// Protected pages
import OverviewPage from "../pages/overview/OverviewPage";
import EventsPage from "../pages/events/EventsPage";
import LeadsPage from "../pages/leads/LeadsPage";
import LeadDetailPage from "../pages/leads/LeadDetailPage";
import RulesPage from "../pages/rules/RulesPage";
import AutomationsPage from "../pages/automations/AutomationsPage";
import IntegrationsPage from "../pages/integrations/IntegrationsPage";
import SystemPage from "../pages/system/SystemPage";

function ProtectedLayout({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0d0d0d]">
        <Spinner />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <AppShell>{children}</AppShell>;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route
        path="/overview"
        element={<ProtectedLayout><OverviewPage /></ProtectedLayout>}
      />
      <Route
        path="/events"
        element={<ProtectedLayout><EventsPage /></ProtectedLayout>}
      />
      <Route
        path="/leads"
        element={<ProtectedLayout><LeadsPage /></ProtectedLayout>}
      />
      <Route
        path="/leads/:id"
        element={<ProtectedLayout><LeadDetailPage /></ProtectedLayout>}
      />
      <Route
        path="/rules"
        element={<ProtectedLayout><RulesPage /></ProtectedLayout>}
      />
      <Route
        path="/automations"
        element={<ProtectedLayout><AutomationsPage /></ProtectedLayout>}
      />
      <Route
        path="/integrations"
        element={<ProtectedLayout><IntegrationsPage /></ProtectedLayout>}
      />
      <Route
        path="/system"
        element={<ProtectedLayout><SystemPage /></ProtectedLayout>}
      />

      {/* Legacy redirects */}
      <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
}
