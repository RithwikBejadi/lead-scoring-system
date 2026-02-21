/**
 * FILE: pages/DashboardWrapper.jsx
 * PURPOSE: Wrapper for dashboard that connects to real API data
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import MetricCard from "../components/dashboard/MetricCard";
import ThroughputChart from "../components/dashboard/ThroughputChart";
import QueueHealth from "../components/dashboard/QueueHealth";
import ScoreMutations from "../components/dashboard/ScoreMutations";
import AutomationLog from "../components/dashboard/AutomationLog";
import { leaderboardApi } from "../api/leaderboard.api";
import { initSocket, subscribeToLeadUpdates } from "../sockets/socket";

// Fallback metrics for when API is loading or unavailable
const defaultMetrics = [
  {
    title: "Total Intelligence Events",
    value: "---",
    change: "--",
    changeType: "success",
    subtext: "Loading...",
    bars: [
      { h: "12px", color: "bg-primary/30" },
      { h: "16px", color: "bg-primary/30" },
      { h: "24px", color: "bg-primary/50" },
      { h: "20px", color: "bg-primary/30" },
      { h: "32px", color: "bg-primary" },
      { h: "28px", color: "bg-primary/80" },
    ],
  },
  {
    title: "Identity Resolutions",
    value: "---",
    change: "--",
    changeType: "success",
    subtext: "Loading...",
    bars: [
      { h: "8px", color: "bg-primary/20" },
      { h: "20px", color: "bg-primary/40" },
      { h: "16px", color: "bg-primary/30" },
      { h: "24px", color: "bg-primary/60" },
      { h: "20px", color: "bg-primary/40" },
      { h: "32px", color: "bg-primary" },
    ],
  },
  {
    title: "Processing Velocity",
    value: "---",
    change: "--",
    changeType: "success",
    subtext: "Loading...",
    bars: [
      { h: "32px", color: "bg-primary" },
      { h: "28px", color: "bg-primary/70" },
      { h: "20px", color: "bg-primary/50" },
      { h: "16px", color: "bg-primary/40" },
      { h: "12px", color: "bg-primary/30" },
      { h: "12px", color: "bg-primary/20" },
    ],
  },
  {
    title: "Active Qualified Leads",
    value: "---",
    change: "--",
    changeType: "success",
    subtext: "Loading...",
    bars: [
      { h: "20px", color: "bg-primary/30" },
      { h: "24px", color: "bg-primary/50" },
      { h: "28px", color: "bg-primary/70" },
      { h: "20px", color: "bg-primary/50" },
      { h: "16px", color: "bg-primary/40" },
      { h: "16px", color: "bg-primary/20" },
    ],
  },
];

function DashboardWrapper() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(defaultMetrics);
  const [loading, setLoading] = useState(true);

  // Initialize Socket.IO on mount
  useEffect(() => {
    const socket = initSocket();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToLeadUpdates((data) => {
      console.log("Lead updated:", data);
      // Refresh metrics when lead updates occur
      loadDashboardData();
    });

    // Load initial data
    loadDashboardData();

    return () => {
      unsubscribe();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      // This endpoint may not exist yet, but we'll try
      // If it fails, we'll use default metrics
      const response = await leaderboardApi.getDashboardStats();

      if (response.success && response.data) {
        // Map API data to metrics format
        setMetrics([
          {
            ...defaultMetrics[0],
            value: response.data.totalEvents?.toLocaleString() || "0",
            subtext: "Last 24 hours",
          },
          {
            ...defaultMetrics[1],
            value: response.data.identityResolutions?.toLocaleString() || "0",
            subtext: "Profiles merged successfully",
          },
          {
            ...defaultMetrics[2],
            value: response.data.avgLatency
              ? `${response.data.avgLatency}ms`
              : "---",
            subtext: "Avg latency (Event → Score)",
          },
          {
            ...defaultMetrics[3],
            value: response.data.qualifiedLeads?.toString() || "0",
            subtext: "Score > 85 threshold",
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
      // Keep using default metrics
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark antialiased font-display h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 no-scrollbar">
          <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.map((m, i) => (
                <MetricCard key={i} {...m} />
              ))}
            </div>

            {/* Throughput & Queue */}
            <div className="grid grid-cols-12 gap-6">
              <ThroughputChart />
              <QueueHealth />
            </div>

            {/* Bottom Row: Tables & Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ScoreMutations />
              <AutomationLog />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardWrapper;
