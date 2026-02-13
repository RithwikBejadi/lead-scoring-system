import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { leadsApi } from "../api/leads.api";

function Dashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    qualified: 0,
    avgScore: 0,
    conversion: 0,
  });
  const [topLeads, setTopLeads] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open for desktop

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

      const sortedLeads = [...leads]
        .sort((a, b) => (b.currentScore || 0) - (a.currentScore || 0))
        .slice(0, 5);
      setTopLeads(sortedLeads);

      // Simulated Audit Trail (using top leads for demo)
      const mockEvents = sortedLeads.map((lead, i) => ({
        time: new Date(Date.now() - i * 1000 * 60 * 15).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        type: i % 2 === 0 ? "lead.scored" : "lead.update",
        message: `${lead.name || lead.email} reached ${lead.currentScore || 0} pts`,
        value: `+${Math.floor(Math.random() * 20) + 5}pts`,
        color: "text-success",
      }));
      setRecentEvents(mockEvents);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark antialiased font-display h-screen flex overflow-hidden">
      {/* Left Sidebar */}
      <aside
        className={`w-64 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark flex-shrink-0 flex flex-col z-20 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full fixed lg:static lg:translate-x-0"}`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-border-light dark:border-border-dark">
          <div className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <span className="material-icons">data_usage</span>
            <span>SysIntel</span>
          </div>
        </div>
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            <li>
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg"
              >
                <span className="material-icons text-xl">dashboard</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/leads"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors"
              >
                <span className="material-icons text-xl">people_alt</span>
                Leads
              </Link>
            </li>
            <li>
              <Link
                to="/events"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors"
              >
                <span className="material-icons text-xl">event_note</span>
                Events
              </Link>
            </li>
            <li>
              <Link
                to="/automation"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors"
              >
                <span className="material-icons text-xl">
                  settings_input_component
                </span>
                Automation
              </Link>
            </li>
            <li>
              <div className="my-2 border-t border-border-light dark:border-border-dark mx-3"></div>
            </li>
            <li>
              <Link
                to="/settings"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors"
              >
                <span className="material-icons text-xl">settings</span>
                Settings
              </Link>
            </li>
          </ul>
        </nav>
        {/* User Profile Snippet */}
        <div className="p-4 border-t border-border-light dark:border-border-dark">
          <div className="flex items-center gap-3">
            <img
              alt="User Profile"
              className="w-8 h-8 rounded-full"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOKsmsWYlGhvYKMy9LZfsEvv43cnzazmj1-EBjq--X81UjgbWQaDrfrIEy0udwMDAOrY1PLH5WkN9Y_HPsd_BZ3uWdB3qmjRSjLv_q0BQlAblBZ8hwprcssvi4pPVhsJc80ChGP6h46s6MAP3ObQU1VQsK922UpPYECn3Hmr3ZiS40Uc4fpNhMZTKIs09Jka9JG-1ap-2U9Blm9RI59rIs5dQ4xZWJnufyRfUy2UeTh3bDVZej7v0P1V0v3I6AFamFrFbI_YcaiCY"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">DevOps Lead</p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">
                admin@sysintel.io
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Utility Bar */}
        <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark flex items-center justify-between px-6 z-10 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              className="lg:hidden text-text-secondary-light"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <span className="material-icons">menu</span>
            </button>
            {/* Project Selector */}
            <div className="relative group">
              <button className="flex items-center gap-2 text-sm font-medium text-text-primary-light dark:text-text-primary-dark bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <span>Production-US-East</span>
                <span className="material-icons text-lg">arrow_drop_down</span>
              </button>
            </div>
            {/* Search */}
            <div className="relative max-w-xl w-full hidden md:block ml-4">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-text-secondary-light dark:text-text-secondary-dark text-lg">
                  search
                </span>
              </span>
              <input
                className="block w-full pl-10 pr-3 py-2 border border-border-light dark:border-border-dark rounded-md leading-5 bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark placeholder-text-secondary-light focus:outline-none focus:bg-surface-light dark:focus:bg-surface-dark focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition duration-150 ease-in-out"
                placeholder="Search resources, leads, logs, or documentation (/)"
                type="text"
              />
            </div>
          </div>
          {/* System Health Indicators */}
          <div className="flex items-center gap-6 ml-4">
            <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
              <div
                className="flex items-center gap-1.5"
                title="API Status: Healthy"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
                <span>API</span>
              </div>
              <div
                className="flex items-center gap-1.5"
                title="Worker Status: Processing"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
                <span>Worker</span>
              </div>
              <div
                className="flex items-center gap-1.5"
                title="Redis Status: Connected"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
                <span>Redis</span>
              </div>
            </div>
            <div className="h-6 w-px bg-border-light dark:border-border-dark hidden lg:block"></div>
            <button className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors">
              <span className="material-icons">notifications_none</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                  Dashboard
                </h1>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                  Overview of lead scoring engine performance for the last 24
                  hours.
                </p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded transition-colors">
                  <span className="material-icons text-sm">refresh</span>
                  Auto-refresh: On
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded transition-colors shadow-sm">
                  <span className="material-icons text-sm">add</span>
                  New Event Rule
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-4 shadow-card">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                    Total Leads
                  </h3>
                  <span className="text-success text-xs font-medium bg-success/10 px-1.5 py-0.5 rounded">
                    +12.5%
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                    {stats.totalLeads.toLocaleString()}
                  </span>
                  <svg
                    className="w-16 h-8 text-primary sparkline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 64 32"
                  >
                    <path
                      d="M0 28 L10 20 L20 24 L30 10 L40 18 L50 8 L64 12"
                      strokeWidth="2"
                    ></path>
                  </svg>
                </div>
              </div>

              <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-4 shadow-card">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                    Qualified Leads
                  </h3>
                  <span className="text-success text-xs font-medium bg-success/10 px-1.5 py-0.5 rounded">
                    +5.2%
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                    {stats.qualified.toLocaleString()}
                  </span>
                  <svg
                    className="w-16 h-8 text-primary sparkline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 64 32"
                  >
                    <path
                      d="M0 15 L10 18 L20 12 L30 20 L40 10 L50 15 L64 5"
                      strokeWidth="2"
                    ></path>
                  </svg>
                </div>
              </div>

              <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-4 shadow-card">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                    Conversion
                  </h3>
                  <span className="text-warning text-xs font-medium bg-warning/10 px-1.5 py-0.5 rounded">
                    -2.1%
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                    {stats.conversion}%
                  </span>
                  <svg
                    className="w-16 h-8 text-warning sparkline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 64 32"
                  >
                    <path
                      d="M0 10 L10 12 L20 25 L30 20 L40 28 L50 24 L64 26"
                      strokeWidth="2"
                    ></path>
                  </svg>
                </div>
              </div>

              <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-4 shadow-card">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                    Avg Lead Score
                  </h3>
                  <span className="text-success text-xs font-medium bg-success/10 px-1.5 py-0.5 rounded">
                    +1.8%
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                    {stats.avgScore}/100
                  </span>
                  <svg
                    className="w-16 h-8 text-primary sparkline"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 64 32"
                  >
                    <path
                      d="M0 20 L10 18 L20 16 L30 14 L40 10 L50 8 L64 5"
                      strokeWidth="2"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Middle Row: Charts & Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-80">
              {/* Main Chart */}
              <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-5 shadow-card flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                    Lead Velocity & Event Volume
                  </h3>
                  <div className="flex gap-2">
                    <button className="text-xs font-medium px-2 py-1 rounded bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-secondary-light">
                      1H
                    </button>
                    <button className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                      24H
                    </button>
                    <button className="text-xs font-medium px-2 py-1 rounded bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-secondary-light">
                      7D
                    </button>
                  </div>
                </div>
                <div className="flex-1 relative w-full h-full flex items-end gap-2 px-2 pb-2">
                  <div className="absolute inset-0 flex flex-col justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark opacity-50 pointer-events-none z-0">
                    <div className="w-full border-b border-dashed border-border-light dark:border-border-dark h-0"></div>
                    <div className="w-full border-b border-dashed border-border-light dark:border-border-dark h-0"></div>
                    <div className="w-full border-b border-dashed border-border-light dark:border-border-dark h-0"></div>
                    <div className="w-full border-b border-dashed border-border-light dark:border-border-dark h-0"></div>
                  </div>
                  <div className="flex-1 flex items-end justify-between gap-1 h-full z-10 pl-6">
                    {[30, 45, 35, 60, 50, 75, 65, 80, 55, 40, 70, 90].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm transition-all relative group"
                          style={{ height: `${h}%` }}
                        ></div>
                      ),
                    )}
                  </div>
                  <svg
                    className="absolute inset-0 w-full h-full pl-6 pointer-events-none z-20"
                    preserveAspectRatio="none"
                  >
                    <path
                      className="drop-shadow-sm"
                      d="M0 80 Q 50 120 100 90 T 200 110 T 300 60 T 400 90 T 500 40 T 600 70 T 700 30 T 800 50"
                      fill="none"
                      stroke="#2b6cee"
                      strokeWidth="2.5"
                    ></path>
                  </svg>
                </div>
              </div>

              {/* Event Queue Monitor */}
              <div className="lg:col-span-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-5 shadow-card flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                    Bull Queue Status
                  </h3>
                  <span className="flex items-center gap-1.5 text-xs text-success font-medium bg-success/10 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>{" "}
                    Live
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-6 justify-center mb-6">
                    <div
                      className="relative w-32 h-32 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          "conic-gradient(#1e8e3e 0% 70%, #f9ab00 70% 85%, #2b6cee 85% 98%, #d93025 98% 100%)",
                      }}
                    >
                      <div className="absolute w-24 h-24 bg-surface-light dark:bg-surface-dark rounded-full flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                          98%
                        </span>
                        <span className="text-[10px] uppercase text-text-secondary-light">
                          Health
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-success"></span>
                        <span className="text-text-secondary-light dark:text-text-secondary-dark">
                          Completed
                        </span>
                      </div>
                      <span className="font-medium">14,205</span>
                    </div>
                    {/* Additional Queue Stats - Static for now */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-warning"></span>
                        <span className="text-text-secondary-light dark:text-text-secondary-dark">
                          Waiting
                        </span>
                      </div>
                      <span className="font-medium">189</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Scoring Leads */}
              <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-card overflow-hidden flex flex-col h-full">
                <div className="px-5 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                  <h3 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                    Top Scoring Leads
                  </h3>
                  <Link
                    to="/leads"
                    className="text-xs font-medium text-primary hover:text-primary-dark"
                  >
                    View All
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider w-10">
                          #
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                          Lead Info
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-5 py-3 text-right text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                          Stage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-surface-light dark:bg-surface-dark divide-y divide-border-light dark:divide-border-dark">
                      {topLeads.map((lead, idx) => (
                        <tr
                          key={lead._id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="px-5 py-3 whitespace-nowrap text-sm text-text-secondary-light">
                            {idx + 1}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                                {getInitials(lead.name || lead.email)}
                              </div>
                              <div className="ml-3">
                                <Link
                                  to={`/leads/${lead._id}`}
                                  className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark hover:underline"
                                >
                                  {lead.name || lead.email}
                                </Link>
                                <div className="text-xs text-text-secondary-light">
                                  {lead.company || "No Company"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <div className="text-sm font-bold text-primary">
                              {lead.currentScore || 0}
                            </div>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap text-right">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lead.leadStage === "qualified" ? "bg-success/10 text-success border border-success/20" : "bg-blue-100 text-blue-800"}`}
                            >
                              {lead.leadStage}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {topLeads.length === 0 && !loading && (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-5 py-8 text-center text-sm text-text-secondary-light"
                          >
                            No leads found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Audit Trail (Simulated) */}
              <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-card overflow-hidden flex flex-col h-full">
                <div className="px-5 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
                  <h3 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                    Recent Audit Trail
                  </h3>
                  <div className="flex gap-2">
                    <span className="w-2 h-2 bg-success rounded-full animate-pulse mt-1"></span>
                    <span className="text-xs text-text-secondary-light">
                      Live Feed
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-0 bg-background-light dark:bg-background-dark font-mono text-xs">
                  <div className="divide-y divide-border-light dark:divide-border-dark">
                    {recentEvents.map((event, i) => (
                      <div
                        key={i}
                        className="p-3 hover:bg-white dark:hover:bg-surface-dark transition-colors flex gap-3 items-start border-l-2 border-transparent hover:border-primary"
                      >
                        <span className="text-text-secondary-light whitespace-nowrap">
                          {event.time}
                        </span>
                        <div className="flex-1">
                          <span className="text-primary font-medium">
                            {event.type}
                          </span>
                          <span className="text-text-primary-light dark:text-text-primary-dark">
                            {" "}
                            — {event.message}
                          </span>
                        </div>
                        <span className={`${event.color} font-medium`}>
                          {event.value}
                        </span>
                      </div>
                    ))}
                    {recentEvents.length === 0 && (
                      <div className="p-4 text-center text-text-secondary-light">
                        Waiting for events...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
