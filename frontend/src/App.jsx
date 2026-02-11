/**
 * FILE: App.jsx
 * PURPOSE: Main application router with authentication and sidebar state management
 * Contains all page routes and global drawers
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protected pages
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";
import LeadActivity from "./pages/LeadActivity";
import ScoringRules from "./pages/ScoringRules";
import Leaderboard from "./pages/Leaderboard";

// Global components
import ManualEventDrawer from "./components/drawers/ManualEventDrawer";
import BatchUploadDrawer from "./components/drawers/BatchUploadDrawer";

function App() {
  const [isEventDrawerOpen, setIsEventDrawerOpen] = useState(false);
  const [isBatchDrawerOpen, setIsBatchDrawerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    onCloseSidebar={() => setIsSidebarOpen(false)}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads"
              element={
                <ProtectedRoute>
                  <Leads
                    onOpenDrawer={() => setIsEventDrawerOpen(true)}
                    onOpenBatchUpload={() => setIsBatchDrawerOpen(true)}
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    onCloseSidebar={() => setIsSidebarOpen(false)}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/:id"
              element={
                <ProtectedRoute>
                  <LeadDetail
                    onOpenDrawer={() => setIsEventDrawerOpen(true)}
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    onCloseSidebar={() => setIsSidebarOpen(false)}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/:id/activity"
              element={
                <ProtectedRoute>
                  <LeadActivity
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    onCloseSidebar={() => setIsSidebarOpen(false)}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rules"
              element={
                <ProtectedRoute>
                  <ScoringRules
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    onCloseSidebar={() => setIsSidebarOpen(false)}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    onCloseSidebar={() => setIsSidebarOpen(false)}
                  />
                </ProtectedRoute>
              }
            />
          </Routes>

          {/* Global Manual Event Drawer */}
          <ManualEventDrawer
            isOpen={isEventDrawerOpen}
            onClose={() => setIsEventDrawerOpen(false)}
          />

          {/* Global Batch Upload Drawer */}
          <BatchUploadDrawer
            isOpen={isBatchDrawerOpen}
            onClose={() => setIsBatchDrawerOpen(false)}
          />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
