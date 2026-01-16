/**
 * FILE: pages/Leaderboard.jsx
 * PURPOSE: Top leads leaderboard with real-time ranking and podium
 * DATA FLOW: Fetches /api/leads/leaderboard?limit=20
 * REAL-TIME: Reorders on score_updated socket events
 * All buttons are functional - no dummy buttons
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { leaderboardApi } from "../api/leaderboard.api";
import { leadsApi } from "../api/leads.api";
import { scoreSocket } from "../sockets/score.socket";
import { useToast } from "../context/ToastContext";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";

export default function Leaderboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadLeaderboard();

    // Real-time updates
    scoreSocket.connect();
    scoreSocket.onScoreUpdate((data) => {
      setLeads((prev) => {
        const updated = prev.map((lead) =>
          lead._id === data.leadId ? { ...lead, score: data.newScore } : lead
        );
        // Re-sort by score
        return updated.sort((a, b) => (b.score || 0) - (a.score || 0));
      });
    });

    return () => scoreSocket.offScoreUpdate();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await leaderboardApi.getTopLeads(20);
      setLeads(data);
    } catch (err) {
      console.error("[Leaderboard] Error:", err);
      showToast("Failed to load leaderboard", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await leadsApi.exportCSV();
      showToast("Leaderboard exported!", "success");
    } catch (err) {
      showToast("Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  // Filter leads by search term
  const filteredLeads = leads.filter((lead) => {
    const search = searchTerm.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(search) ||
      lead.email?.toLowerCase().includes(search) ||
      lead.company?.toLowerCase().includes(search)
    );
  });

  const getStageColor = (stage) => {
    const colors = {
      qualified: "bg-emerald-50 text-emerald-700 border-emerald-100",
      hot: "bg-red-50 text-red-700 border-red-100",
      warm: "bg-orange-50 text-orange-700 border-orange-100",
      cold: "bg-slate-100 text-slate-600 border-slate-200",
    };
    return colors[stage?.toLowerCase()] || colors.cold;
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    const colors = [
      "bg-indigo-100 text-indigo-600",
      "bg-blue-100 text-blue-600",
      "bg-purple-100 text-purple-600",
      "bg-green-100 text-green-600",
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header
          title="Top Lead Leaderboard"
          subtitle={
            <div className="flex items-center gap-2 mt-1">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </div>
              <span className="text-sm font-medium text-slate-500">
                Live Scoring • Updated:{" "}
                <span className="text-slate-700 font-bold">Just now</span>
              </span>
            </div>
          }
          actions={
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {exporting ? "hourglass_empty" : "download"}
              </span>
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
          }
        />

        <div className="flex-1 overflow-auto custom-scrollbar p-4 md:p-8">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
            {/* Search */}
            <div className="flex items-center justify-end">
              <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
                <span className="material-symbols-outlined text-slate-400 px-2 text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none text-sm w-48 focus:ring-0 text-slate-900 placeholder:text-slate-400"
                  placeholder="Search leads..."
                />
              </div>
            </div>

            {/* Podium (Top 3) */}
            {filteredLeads.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                {/* Rank 2 */}
                <div className="order-2 md:order-1 relative group">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-600 text-xs font-bold px-3 py-1 rounded-full border border-white shadow-sm z-10">
                    #2
                  </div>
                  <div
                    onClick={() => navigate(`/leads/${filteredLeads[1]?._id}`)}
                    className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all flex flex-col gap-4 h-[280px] cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm ${getAvatarColor(
                            filteredLeads[1]?.name
                          )}`}
                        >
                          {getInitials(filteredLeads[1]?.name)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg leading-tight">
                            {filteredLeads[1]?.name}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {filteredLeads[1]?.company || "N/A"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border ${getStageColor(
                          filteredLeads[1]?.stage
                        )}`}
                      >
                        {filteredLeads[1]?.stage || "Cold"}
                      </span>
                    </div>
                    <div className="mt-auto">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-4xl font-black text-slate-900 tracking-tight">
                          {filteredLeads[1]?.score || 0}
                        </span>
                        <span className="text-sm text-slate-500">pts</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {filteredLeads[1]?.email || ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rank 1 */}
                <div className="order-1 md:order-2 relative group z-10">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-sm font-black px-4 py-1.5 rounded-full border-2 border-white shadow-md flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">
                      emoji_events
                    </span>
                    #1
                  </div>
                  <div
                    onClick={() => navigate(`/leads/${filteredLeads[0]?._id}`)}
                    className="bg-white rounded-xl p-6 border-2 border-primary/20 shadow-lg flex flex-col gap-4 h-[320px] transform md:-translate-y-4 cursor-pointer hover:shadow-xl transition-all"
                  >
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1 ${getStageColor(
                          filteredLeads[0]?.stage
                        )}`}
                      >
                        {filteredLeads[0]?.stage || "Hot"}
                      </span>
                    </div>
                    <div className="flex flex-col items-center text-center mt-6">
                      <div
                        className={`h-20 w-20 rounded-full flex items-center justify-center font-bold text-2xl border-4 border-primary/10 mb-3 ${getAvatarColor(
                          filteredLeads[0]?.name
                        )}`}
                      >
                        {getInitials(filteredLeads[0]?.name)}
                      </div>
                      <h3 className="font-bold text-slate-900 text-xl">
                        {filteredLeads[0]?.name}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">
                        {filteredLeads[0]?.company || "N/A"}
                      </p>
                    </div>
                    <div className="mt-auto text-center">
                      <span className="text-5xl font-black text-primary tracking-tighter">
                        {filteredLeads[0]?.score || 0}
                      </span>
                      <span className="text-lg text-slate-500 ml-1">pts</span>
                    </div>
                  </div>
                </div>

                {/* Rank 3 */}
                <div className="order-3 md:order-3 relative group">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-200 text-orange-700 text-xs font-bold px-3 py-1 rounded-full border border-white shadow-sm z-10">
                    #3
                  </div>
                  <div
                    onClick={() => navigate(`/leads/${filteredLeads[2]?._id}`)}
                    className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all flex flex-col gap-4 h-[280px] cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm ${getAvatarColor(
                            filteredLeads[2]?.name
                          )}`}
                        >
                          {getInitials(filteredLeads[2]?.name)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg leading-tight">
                            {filteredLeads[2]?.name}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {filteredLeads[2]?.company || "N/A"}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border ${getStageColor(
                          filteredLeads[2]?.stage
                        )}`}
                      >
                        {filteredLeads[2]?.stage || "Cold"}
                      </span>
                    </div>
                    <div className="mt-auto">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-4xl font-black text-slate-900 tracking-tight">
                          {filteredLeads[2]?.score || 0}
                        </span>
                        <span className="text-sm text-slate-500">pts</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {filteredLeads[2]?.email || ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard Table */}
            {filteredLeads.length > 3 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-800">Other Top Leads</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <th className="px-6 py-4 w-16 text-center">Rank</th>
                        <th className="px-6 py-4 min-w-[240px]">Lead Name</th>
                        <th className="px-6 py-4">Company</th>
                        <th className="px-6 py-4 w-24">Score</th>
                        <th className="px-6 py-4">Stage</th>
                        <th className="px-6 py-4 w-32 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredLeads.slice(3).map((lead, idx) => (
                        <tr
                          key={lead._id}
                          className="group hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/leads/${lead._id}`)}
                        >
                          <td className="px-6 py-4 text-center font-bold text-slate-400">
                            {idx + 4}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarColor(
                                  lead.name
                                )}`}
                              >
                                {getInitials(lead.name)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900 text-sm">
                                  {lead.name}
                                </span>
                                <span className="text-xs text-slate-500">
                                  {lead.email?.split("@")[0] || "Contact"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {lead.company || "N/A"}
                          </td>
                          <td className="px-6 py-4 text-sm font-black text-slate-800">
                            {lead.score || 0}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStageColor(
                                lead.stage
                              )}`}
                            >
                              {lead.stage || "Cold"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <a
                              href={lead.email ? `mailto:${lead.email}` : "#"}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!lead.email) e.preventDefault();
                              }}
                              className={`p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex ${
                                !lead.email
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                mail
                              </span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredLeads.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">
                  leaderboard
                </span>
                <h3 className="text-lg font-bold text-slate-700 mb-2">
                  No Leads Found
                </h3>
                <p className="text-slate-500">
                  Create some leads and events to see the leaderboard.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
