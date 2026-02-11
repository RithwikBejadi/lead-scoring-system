import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { leadsApi } from "../api/leads.api";

function Dashboard({ isSidebarOpen, onToggleSidebar, onCloseSidebar }) {
  const [stats, setStats] = useState({
    totalLeads: 0,
    qualified: 0,
    avgScore: 0,
    conversion: 0,
  });
  const [topLeads, setTopLeads] = useState([]);
  const [scoreDistribution, setScoreDistribution] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const leadsData = await leadsApi.getAll();
      const leads = Array.isArray(leadsData) ? leadsData : [];

      const totalLeads = leads.length;
      const qualified = leads.filter((l) => l.leadStage === "qualified").length;
      const avgScore =
        leads.length > 0
          ? Math.round(
              leads.reduce((sum, l) => sum + (l.currentScore || 0), 0) /
                leads.length,
            )
          : 0;
      const conversion =
        totalLeads > 0 ? ((qualified / totalLeads) * 100).toFixed(1) : 0;

      setStats({ totalLeads, qualified, avgScore, conversion });

      const distribution = [
        { range: "0-20", count: 0 },
        { range: "21-40", count: 0 },
        { range: "41-60", count: 0 },
        { range: "61-80", count: 0 },
        { range: "81-100", count: 0 },
      ];

      leads.forEach((lead) => {
        const score = lead.currentScore || 0;
        if (score <= 20) distribution[0].count++;
        else if (score <= 40) distribution[1].count++;
        else if (score <= 60) distribution[2].count++;
        else if (score <= 80) distribution[3].count++;
        else distribution[4].count++;
      });

      const maxCount = Math.max(...distribution.map((d) => d.count), 1);
      distribution.forEach((d) => {
        d.percentage = (d.count / maxCount) * 100;
      });

      setScoreDistribution(distribution);

      const sortedLeads = [...leads]
        .sort((a, b) => (b.currentScore || 0) - (a.currentScore || 0))
        .slice(0, 6);
      setTopLeads(sortedLeads);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStageLabel = (stage) => {
    const labels = {
      cold: "New Lead",
      warm: "Contacted",
      hot: "Negotiation",
      qualified: "Qualified",
    };
    return labels[stage] || "New Lead";
  };

  const formatTimeAgo = (date) => {
    if (!date) return "—";
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 text-sm font-medium uppercase tracking-wider">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <Sidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Header onToggleSidebar={onToggleSidebar} />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto px-8 py-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <h1 className="text-5xl font-black tracking-tighter mb-2">
                  DASHBOARD
                </h1>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                  Performance overview for the last 30 days
                </p>
              </div>
              <div className="flex gap-3">
                <button className="h-10 px-6 border border-black text-sm font-bold uppercase hover:bg-gray-100 transition-colors">
                  Last 30 Days
                </button>
                <button className="h-10 px-6 bg-black text-white border border-black text-sm font-bold uppercase hover:bg-gray-800 transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">
                    download
                  </span>
                  Export
                </button>
              </div>
            </div>

            {/* Stats Grid - Brutalist Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="border border-black p-5 flex flex-col justify-between h-28 hover:bg-gray-50 transition-colors group">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-black transition-colors">
                    Total Leads
                  </span>
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-black">
                    groups
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black">
                    {stats.totalLeads.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-green-600 mb-1">
                    +5%
                  </span>
                </div>
              </div>

              <div className="border border-black p-5 flex flex-col justify-between h-28 hover:bg-gray-50 transition-colors group">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-black transition-colors">
                    Qualified
                  </span>
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-black">
                    check_circle
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black">
                    {stats.qualified.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-green-600 mb-1">
                    +12%
                  </span>
                </div>
              </div>

              <div className="border border-black p-5 flex flex-col justify-between h-28 hover:bg-gray-50 transition-colors group">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-black transition-colors">
                    Avg Score
                  </span>
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-black">
                    insert_chart
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black">{stats.avgScore}</span>
                  <span className="text-xs font-bold text-red-600 mb-1">
                    -2%
                  </span>
                </div>
              </div>

              <div className="border border-black p-5 flex flex-col justify-between h-28 hover:bg-gray-50 transition-colors group">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-black transition-colors">
                    Conversion
                  </span>
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-black">
                    trending_up
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-black">
                    {stats.conversion}%
                  </span>
                  <span className="text-xs font-bold text-green-600 mb-1">
                    +0.8%
                  </span>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Score Distribution */}
              <div className="border border-black">
                <div className="px-5 py-4 border-b border-black flex justify-between items-center bg-black text-white">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Score Distribution
                  </span>
                  <button className="hover:bg-white/10 p-1 transition-colors">
                    <span className="material-symbols-outlined text-lg">
                      more_horiz
                    </span>
                  </button>
                </div>
                <div className="p-5">
                  <div className="flex items-end justify-between gap-2 h-40">
                    {scoreDistribution.map((bucket) => (
                      <div
                        key={bucket.range}
                        className="flex flex-col items-center gap-2 flex-1 group"
                      >
                        <div
                          className="w-full bg-black group-hover:bg-gray-700 transition-colors relative"
                          style={{
                            height: `${Math.max(bucket.percentage, 8)}%`,
                          }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-0.5 px-2 font-bold whitespace-nowrap">
                            {bucket.count}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">
                          {bucket.range}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-xs font-medium text-gray-500">
                    <span>Total: {stats.totalLeads}</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-black"></span>
                      Active Leads
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Leads Table */}
              <div className="col-span-2 border border-black">
                <div className="px-5 py-4 border-b border-black flex justify-between items-center bg-black text-white">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Top Performing Leads
                  </span>
                  <Link
                    to="/leads"
                    className="text-xs font-bold uppercase tracking-wider hover:underline flex items-center gap-1"
                  >
                    View All{" "}
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-black">
                      <tr>
                        <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-r border-gray-200">
                          #
                        </th>
                        <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-r border-gray-200">
                          Company
                        </th>
                        <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-r border-gray-200">
                          Contact
                        </th>
                        <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-r border-gray-200 text-center">
                          Score
                        </th>
                        <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-r border-gray-200">
                          Stage
                        </th>
                        <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                          Activity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {topLeads.map((lead, idx) => (
                        <tr
                          key={lead._id}
                          className="hover:bg-gray-50 transition-colors group"
                        >
                          <td className="px-5 py-3 font-mono text-gray-400 border-r border-gray-200">
                            {idx + 1}
                          </td>
                          <td className="px-5 py-3 font-bold border-r border-gray-200">
                            <Link
                              to={`/leads/${lead._id}`}
                              className="hover:underline flex items-center gap-2"
                            >
                              <div className="w-6 h-6 bg-gray-100 border border-black flex items-center justify-center text-[10px] font-bold">
                                {(lead.company || lead.email || "UN")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              {lead.company || lead.email || "—"}
                            </Link>
                          </td>
                          <td className="px-5 py-3 text-gray-600 border-r border-gray-200">
                            {lead.name || "—"}
                          </td>
                          <td className="px-5 py-3 text-center border-r border-gray-200">
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 font-black ${
                                (lead.currentScore || 0) >= 80
                                  ? "bg-black text-white"
                                  : "border border-black text-black"
                              }`}
                            >
                              {lead.currentScore || 0}
                            </span>
                          </td>
                          <td className="px-5 py-3 border-r border-gray-200">
                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                                lead.leadStage === "qualified"
                                  ? "bg-black text-white border-black"
                                  : "border-gray-300 text-gray-600"
                              }`}
                            >
                              {getStageLabel(lead.leadStage)}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-mono text-xs text-gray-500">
                            {formatTimeAgo(lead.lastEventAt || lead.updatedAt)}
                          </td>
                        </tr>
                      ))}

                      {topLeads.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-5 py-12 text-center text-gray-400 font-medium uppercase tracking-wider"
                          >
                            No leads yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
