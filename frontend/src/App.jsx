import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Sidebar from "./app/layout/Sidebar.jsx";
import Spinner, { FullPageSpinner } from "./shared/ui/Spinner.jsx";

// ── Auth pages (small, eager-load) ───────────────────────────────────────────
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import Landing from "./pages/Landing.jsx";

// ── App pages (lazy for code-splitting) ─────────────────────────────────────
const CommandCenterPage = lazy(() => import("./pages/command/CommandCenterPage.jsx"));
const PipelinePage = lazy(() => import("./pages/pipeline/PipelinePage.jsx"));
const ActivityPage = lazy(() => import("./pages/activity/ActivityPage.jsx"));
const LeadsPage = lazy(() => import("./pages/leads/LeadsPage.jsx"));
const LeadDetailPage = lazy(() => import("./pages/leads/LeadDetailPage.jsx"));
const RulesPage = lazy(() => import("./pages/rules/RulesPage.jsx"));
const AutomationsPage = lazy(
  () => import("./pages/automations/AutomationsPage.jsx"),
);
const IntegrationsPage = lazy(
  () => import("./pages/integrations/IntegrationsPage.jsx"),
);
const SystemPage = lazy(() => import("./pages/system/SystemPage.jsx"));

// ── Guards ────────────────────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

// ── App shell ─────────────────────────────────────────────────────────────────
function AppShell() {
  return (
    <div className="h-screen flex overflow-hidden bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark antialiased font-display">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Suspense fallback={<FullPageSpinner />}>
          <Routes>
            <Route path="/" element={<Navigate to="/command" replace />} />
            <Route path="/command" element={<CommandCenterPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/leads/:id" element={<LeadDetailPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/automations" element={<AutomationsPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/system" element={<SystemPage />} />
            {/* Legacy redirects */}
            <Route path="/overview" element={<Navigate to="/command" replace />} />
            <Route path="/events" element={<Navigate to="/activity" replace />} />
            <Route path="/dashboard" element={<Navigate to="/command" replace />} />
            <Route path="/simulator" element={<Navigate to="/integrations" replace />} />
            <Route path="/settings" element={<Navigate to="/integrations" replace />} />
            <Route path="*" element={<Navigate to="/command" replace />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <FullPageSpinner />;

  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/command" replace /> : <SignIn />
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? <Navigate to="/command" replace /> : <SignUp />
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
