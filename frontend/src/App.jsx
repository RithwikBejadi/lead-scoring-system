/**
 * FILE: App.jsx
 * PURPOSE: Main application router with sidebar state management
 * Contains all page routes and global drawers
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { ToastProvider } from "./context/ToastContext";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";
import LeadActivity from "./pages/LeadActivity";
import ScoringRules from "./pages/ScoringRules";
import Leaderboard from "./pages/Leaderboard";
import ManualEventDrawer from "./components/drawers/ManualEventDrawer";
import BatchUploadDrawer from "./components/drawers/BatchUploadDrawer";

function App() {
  const [isEventDrawerOpen, setIsEventDrawerOpen] = useState(false);
  const [isBatchDrawerOpen, setIsBatchDrawerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/leads" replace />} />
          <Route
            path="/leads"
            element={
              <Leads
                onOpenDrawer={() => setIsEventDrawerOpen(true)}
                onOpenBatchUpload={() => setIsBatchDrawerOpen(true)}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                onCloseSidebar={() => setIsSidebarOpen(false)}
              />
            }
          />
          <Route
            path="/leads/:id"
            element={
              <LeadDetail
                onOpenDrawer={() => setIsEventDrawerOpen(true)}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                onCloseSidebar={() => setIsSidebarOpen(false)}
              />
            }
          />
          <Route
            path="/leads/:id/activity"
            element={
              <LeadActivity
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                onCloseSidebar={() => setIsSidebarOpen(false)}
              />
            }
          />
          <Route
            path="/rules"
            element={
              <ScoringRules
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                onCloseSidebar={() => setIsSidebarOpen(false)}
              />
            }
          />
          <Route
            path="/leaderboard"
            element={
              <Leaderboard
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                onCloseSidebar={() => setIsSidebarOpen(false)}
              />
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
  );
}

export default App;
