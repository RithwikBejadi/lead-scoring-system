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
const OverviewPage = lazy(() => import("./pages/overview/OverviewPage.jsx"));
const EventsPage = lazy(() => import("./pages/events/EventsPage.jsx"));
const LeadsPage = lazy(() => import("./pages/leads/LeadsPage.jsx"));
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
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/overview" element={<OverviewPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/automations" element={<AutomationsPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/system" element={<SystemPage />} />
            {/* Legacy redirects */}
            <Route
              path="/dashboard"
              element={<Navigate to="/overview" replace />}
            />
            <Route
              path="/simulator"
              element={<Navigate to="/integrations" replace />}
            />
            <Route
              path="/settings"
              element={<Navigate to="/integrations" replace />}
            />
            <Route path="*" element={<Navigate to="/overview" replace />} />
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
          isAuthenticated ? <Navigate to="/overview" replace /> : <SignIn />
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? <Navigate to="/overview" replace /> : <SignUp />
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
