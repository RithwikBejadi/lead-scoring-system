/**
 * FILE: pages/LeadsWrapper.jsx
 * PURPOSE: Wrapper for leads page that connects to real API data
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Leads from "./Leads";
import { leadsApi } from "../api/leads.api";
import { initSocket, subscribeToLeadUpdates } from "../sockets/socket";

function LeadsWrapper() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Socket.IO on mount
  useEffect(() => {
    const socket = initSocket();

    // Subscribe to real-time lead updates
    const unsubscribe = subscribeToLeadUpdates((data) => {
      console.log("Lead updated:", data);
      // Refresh leads list
      loadLeads();
    });

    // Load initial data
    loadLeads();

    return () => {
      unsubscribe();
    };
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const response = await leadsApi.getAll();

      if (response.success && response.data) {
        setLeads(response.data.leads || response.data);
      }
    } catch (err) {
      console.error("Failed to load leads:", err);
      setError(err.response?.data?.error || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark antialiased font-display h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                  Loading leads...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={loadLeads}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <Leads leads={leads} onRefresh={loadLeads} />
          )}
        </main>
      </div>
    </div>
  );
}

export default LeadsWrapper;
