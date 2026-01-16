/**
 * FILE: pages/Leads.jsx
 * PURPOSE: Lead management dashboard - main table view with filters and sparklines
 * DATA FLOW: Fetches /api/leads, displays sortable/filterable table
 * REAL-TIME: Subscribes to score_updated socket events
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { leadsApi } from "../api/leads.api";
import { scoreSocket } from "../sockets/score.socket";
import { useToast } from "../context/ToastContext";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import ActivitySparkline from "../components/charts/ActivitySparkline";

function Leads({ onOpenDrawer, onOpenBatchUpload }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({
    stage: null,
    minScore: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false);
  const perPage = 10;

  // Fetch leads on mount
  useEffect(() => {
    loadLeads();

    // Subscribe to real-time score updates
    scoreSocket.connect();
    scoreSocket.onScoreUpdate((data) => {
      console.log("[Leads] Score update:", data);
      setLeads((prev) =>
        prev.map((lead) =>
          lead._id === data.leadId
            ? { ...lead, currentScore: data.newScore, delta: data.delta }
            : lead
        )
      );
    });

    return () => {
      scoreSocket.offScoreUpdate();
    };
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const data = await leadsApi.getAll();
      setLeads(data);
    } catch (err) {
      console.error("[Leads] Load error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Export leads as CSV
  const handleExport = async () => {
    try {
      setExporting(true);
      await leadsApi.exportCSV();
      showToast("Leads exported successfully!", "success");
    } catch (err) {
      console.error("[Leads] Export error:", err);
      showToast("Failed to export leads", "error");
    } finally {
      setExporting(false);
    }
  };

  // Filter and sort leads - use currentScore field from backend
  const filteredLeads = leads
    .filter((lead) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        lead.name?.toLowerCase().includes(search) ||
        lead.email?.toLowerCase().includes(search) ||
        lead.company?.toLowerCase().includes(search);

      const leadStage = (lead.leadStage || lead.status || "cold").toLowerCase();
      const matchesStage = !filters.stage || leadStage === filters.stage;
      const matchesScore = (lead.currentScore || 0) >= filters.minScore;

      return matchesSearch && matchesStage && matchesScore;
    })
    .sort((a, b) => {
      let aVal, bVal;
      if (sortBy === "score") {
        aVal = a.currentScore || 0;
        bVal = b.currentScore || 0;
      } else {
        aVal = a[sortBy] || 0;
        bVal = b[sortBy] || 0;
      }
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / perPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const getStageColor = (stage) => {
    const colors = {
      qualified: "bg-emerald-50 text-emerald-700 border-emerald-100",
      hot: "bg-red-50 text-red-700 border-red-100",
      warm: "bg-orange-50 text-orange-700 border-orange-100",
      cold: "bg-slate-100 text-slate-600 border-slate-200",
    };
    return colors[stage?.toLowerCase()] || colors.cold;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-slate-600";
    return "text-slate-400";
  };

  const getActivityLevel = (score) => {
    if (score >= 80) return "high";
    if (score >= 60) return "active";
    if (score >= 40) return "moderate";
    if (score >= 20) return "steady";
    return "inactive";
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
      "bg-indigo-100 text-indigo-600 border-indigo-200",
      "bg-blue-100 text-blue-600 border-blue-200",
      "bg-orange-100 text-orange-600 border-orange-200",
      "bg-purple-100 text-purple-600 border-purple-200",
      "bg-green-100 text-green-600 border-green-200",
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  const clearFilters = () => {
    setFilters({ stage: null, minScore: 0 });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const setStageFilter = (stage) => {
    setFilters({ ...filters, stage });
    setStageDropdownOpen(false);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Loading leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-red-500 mb-2">
            error
          </span>
          <p className="text-red-500">Error: {error}</p>
          <button
            onClick={loadLeads}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header
          title="Lead Management"
          subtitle="Track and prioritize incoming prospects in real-time."
          actions={
            <>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {exporting ? "hourglass_empty" : "download"}
                </span>
                {exporting ? "Exporting..." : "Export CSV"}
              </button>
              <button
                onClick={onOpenBatchUpload}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">
                  upload_file
                </span>
                Upload CSV
              </button>
              <button
                onClick={onOpenDrawer}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark transition-all shadow-sm hover:shadow-md"
              >
                <span className="material-symbols-outlined text-[20px]">
                  add
                </span>
                Log Event
              </button>
            </>
          }
        />

        <div className="flex-1 overflow-auto custom-scrollbar p-6">
          {/* Filters & Search Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 p-1">
            {/* Search */}
            <div className="relative w-full max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">
                  search
                </span>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, email or company..."
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm shadow-sm transition-all"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1">
                Filters:
              </span>

              {/* Stage Filter with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setStageDropdownOpen(!stageDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors shadow-sm whitespace-nowrap ${
                    filters.stage
                      ? "bg-primary/10 border border-primary/20 text-primary"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-primary/50"
                  }`}
                >
                  Stage:{" "}
                  {filters.stage
                    ? filters.stage.charAt(0).toUpperCase() +
                      filters.stage.slice(1)
                    : "All"}
                  <span className="material-symbols-outlined text-[16px]">
                    expand_more
                  </span>
                </button>

                {stageDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 z-20 min-w-[120px]">
                    <button
                      onClick={() => setStageFilter(null)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 rounded-t-lg"
                    >
                      All
                    </button>
                    <button
                      onClick={() => setStageFilter("hot")}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                    >
                      Hot
                    </button>
                    <button
                      onClick={() => setStageFilter("warm")}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                    >
                      Warm
                    </button>
                    <button
                      onClick={() => setStageFilter("cold")}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                    >
                      Cold
                    </button>
                    <button
                      onClick={() => setStageFilter("qualified")}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 rounded-b-lg"
                    >
                      Qualified
                    </button>
                  </div>
                )}
              </div>

              {/* Score Filter */}
              {filters.minScore > 0 ? (
                <button
                  onClick={() => {
                    setFilters({ ...filters, minScore: 0 });
                    setCurrentPage(1);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 border border-primary/20 text-primary shadow-sm"
                >
                  Score &gt; {filters.minScore}
                  <span className="material-symbols-outlined text-[16px] hover:text-red-500">
                    close
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setFilters({ ...filters, minScore: 50 });
                    setCurrentPage(1);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-200 text-slate-600 hover:border-primary/50 shadow-sm"
                >
                  Score &gt; 50
                  <span className="material-symbols-outlined text-[16px]">
                    expand_more
                  </span>
                </button>
              )}

              {(filters.minScore > 0 || filters.stage || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2 py-1.5 text-slate-400 hover:text-primary text-xs font-medium transition-colors whitespace-nowrap ml-1"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-4 text-left" scope="col">
                      <div className="flex items-center gap-1 cursor-pointer group">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-primary transition-colors">
                          Lead Name
                        </span>
                        <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-primary">
                          unfold_more
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left" scope="col">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Company & Email
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left" scope="col">
                      <div
                        className="flex items-center gap-1 cursor-pointer group"
                        onClick={() => {
                          if (sortBy === "score") {
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                          } else {
                            setSortBy("score");
                            setSortOrder("desc");
                          }
                        }}
                      >
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-primary transition-colors">
                          Score
                        </span>
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          {sortBy === "score"
                            ? sortOrder === "desc"
                              ? "arrow_downward"
                              : "arrow_upward"
                            : "unfold_more"}
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left" scope="col">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Stage
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left" scope="col">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Activity
                      </span>
                    </th>
                    <th className="px-6 py-4 text-right" scope="col">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {paginatedLeads.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-12 text-center text-slate-400"
                      >
                        <span className="material-symbols-outlined text-4xl mb-2">
                          person_off
                        </span>
                        <p>No leads found</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedLeads.map((lead) => (
                      <tr
                        key={lead._id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/leads/${lead._id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className={`h-9 w-9 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm border ${getAvatarColor(
                                lead.name
                              )}`}
                            >
                              {getInitials(lead.name)}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">
                                {lead.name || "Unknown"}
                              </div>
                              <div className="text-xs text-slate-500">
                                Added{" "}
                                {new Date(lead.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">
                            {lead.company || "N/A"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {lead.email || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-base font-bold ${getScoreColor(
                                lead.currentScore || 0
                              )}`}
                            >
                              {lead.currentScore || 0}
                            </span>
                            {lead.delta > 0 && (
                              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getStageColor(
                              lead.leadStage || lead.status
                            )}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                            {lead.leadStage || lead.status || "Cold"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <ActivitySparkline
                            events={lead.eventsLast24h || 0}
                            activityLevel={getActivityLevel(
                              lead.currentScore || 0
                            )}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-slate-400 hover:text-primary transition-colors p-1 rounded hover:bg-slate-100">
                            <span className="material-symbols-outlined text-[20px]">
                              chevron_right
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-900">
                  {filteredLeads.length === 0
                    ? 0
                    : (currentPage - 1) * perPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-slate-900">
                  {Math.min(currentPage * perPage, filteredLeads.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-900">
                  {filteredLeads.length}
                </span>{" "}
                results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-700 hover:bg-slate-50 transition-colors disabled:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage >= totalPages}
                  className="px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-700 hover:bg-slate-50 transition-colors disabled:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Leads;
