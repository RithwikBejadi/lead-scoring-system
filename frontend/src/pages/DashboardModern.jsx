import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { leadsApi } from "../api/leads.api";

function DashboardModern() {
  const [stats, setStats] = useState({
    totalLeads: 24592,
    totalLeadsChange: "+12.5%",
    activeEvents: "148.2k",
    activeEventsChange: "+5.2%",
    qualifiedLeads: 892,
    qualifiedLeadsChange: "-2.1%",
    avgScore: 64,
    avgScoreChange: "+1.8%",
  });

  const [timeRange, setTimeRange] = useState("24H");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [leaderboard, setLeaderboard] = useState([
    {
      id: 1,
      name: "John Doe",
      company: "Acme Corp",
      score: 98,
      stage: "qualified",
      initials: "JD",
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      id: 2,
      name: "Sarah Miller",
      company: "TechFlow Inc",
      score: 92,
      stage: "hot",
      initials: "SM",
      color: "bg-pink-100 text-pink-700",
    },
    {
      id: 3,
      name: "Mike K.",
      company: "Global Systems",
      score: 85,
      stage: "warm",
      initials: "MK",
      color: "bg-blue-100 text-blue-700",
    },
    {
      id: 4,
      name: "Emily Liu",
      company: "StartUp.io",
      score: 81,
      stage: "warm",
      initials: "EL",
      color: "bg-purple-100 text-purple-700",
    },
  ]);

  const [auditLog, setAuditLog] = useState([
    {
      time: "10:42:05",
      type: "lead.scored",
      message: "John Doe reached 98 pts",
      badge: "+20pts",
      badgeColor: "text-green-600",
      typeColor: "text-blue-600",
    },
    {
      time: "10:41:58",
      type: "event.ingest",
      message: "page_view: /pricing",
      badge: "RAW",
      badgeColor: "text-gray-600",
      typeColor: "text-blue-500",
    },
    {
      time: "10:41:45",
      type: "automation.trigger",
      message: 'Email: "Enterprise Welcome"',
      badge: "Sent",
      badgeColor: "text-gray-600",
      typeColor: "text-yellow-600",
    },
    {
      time: "10:41:12",
      type: "lead.update",
      message: "Sarah Miller profile enriched",
      badge: "+5pts",
      badgeColor: "text-green-600",
      typeColor: "text-blue-600",
    },
    {
      time: "10:40:55",
      type: "worker.fail",
      message: "Job #45920 failed (timeout)",
      badge: "Retry",
      badgeColor: "text-red-600",
      typeColor: "text-red-600",
    },
    {
      time: "10:40:30",
      type: "event.ingest",
      message: 'webinar_signup: "Q3 Roadmap"',
      badge: "RAW",
      badgeColor: "text-gray-600",
      typeColor: "text-blue-500",
    },
  ]);

  const [queueStats, setQueueStats] = useState({
    completed: 14205,
    active: 42,
    waiting: 189,
    failed: 12,
    health: 98,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const autoRefreshInterval = useRef(null);

  // Chart data based on time range
  const chartBars = timeRange === "1H" 
    ? [30, 45, 35, 60, 50, 75, 65, 80, 55, 40, 70, 90]
    : timeRange === "24H"
    ? [30, 45, 35, 60, 50, 75, 65, 80, 55, 40, 70, 90]
    : [40, 55, 45, 70, 60, 85, 75, 90, 65, 50, 80, 95];

  // Simulate live audit log updates
  const addAuditLogEntry = useCallback(() => {
    const eventTypes = [
      { type: "lead.scored", msgTemplate: (n) => `Lead ${n} updated score`, badge: "+15pts", badgeColor: "text-green-600", typeColor: "text-blue-600" },
      { type: "event.ingest", msgTemplate: () => "page_view: /dashboard", badge: "RAW", badgeColor: "text-gray-600", typeColor: "text-blue-500" },
      { type: "automation.trigger", msgTemplate: () => 'Slack: "New qualified lead"', badge: "Sent", badgeColor: "text-gray-600", typeColor: "text-yellow-600" },
    ];

    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    const newEntry = {
      time,
      type: randomEvent.type,
      message: randomEvent.msgTemplate(Math.floor(Math.random() * 1000)),
      badge: randomEvent.badge,
      badgeColor: randomEvent.badgeColor,
      typeColor: randomEvent.typeColor,
    };

    setAuditLog((prev) => [newEntry, ...prev.slice(0, 9)]);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      autoRefreshInterval.current = setInterval(() => {
        addAuditLogEntry();
        // Simulate queue stats changes
        setQueueStats((prev) => ({
          ...prev,
          completed: prev.completed + Math.floor(Math.random() * 10),
          active: Math.max(10, prev.active + Math.floor(Math.random() * 5) - 2),
          waiting: Math.max(50, prev.waiting + Math.floor(Math.random() * 20) - 10),
        }));
      }, 3000);
    } else {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    }

    return () => {
      if (autoRefreshInterval.current) {
        clearInterval(autoRefreshInterval.current);
      }
    };
  }, [autoRefresh, addAuditLogEntry]);

  // Fetch real data from API
  useEffect(() => {
    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    try {
      const leads = await leadsApi.getAll();
      if (Array.isArray(leads) && leads.length > 0) {
        const totalLeads = leads.length;
        const activeLeads = leads.filter((l) => l.leadStage !== "cold").length;
        const qualifiedLeads = leads.filter((l) => l.leadStage === "qualified").length;
        const avgScore = Math.round(
          leads.reduce((acc, l) => acc + (l.currentScore || 0), 0) / leads.length
        );

        setStats((prev) => ({
          ...prev,
          totalLeads,
          qualifiedLeads,
          avgScore,
        }));

        // Update leaderboard with real data
        const sorted = [...leads]
          .sort((a, b) => (b.currentScore || 0) - (a.currentScore || 0))
          .slice(0, 4)
          .map((lead, idx) => ({
            id: idx + 1,
            name: lead.name || "Unknown",
            company: lead.company || lead.email,
            score: lead.currentScore || 0,
            stage: lead.leadStage || "cold",
            initials: (lead.name || "U").substring(0, 2).toUpperCase(),
            color: `bg-${["indigo", "pink", "blue", "purple"][idx % 4]}-100 text-${["indigo", "pink", "blue", "purple"][idx % 4]}-700`,
          }));

        if (sorted.length > 0) {
          setLeaderboard(sorted);
        }
      }
    } catch (error) {
      console.error("Failed to fetch real data:", error);
    }
  };

  const getStageStyle = (stage) => {
    switch (stage) {
      case "qualified":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      case "hot":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
      case "warm":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
    }
  };

  const Sparkline = ({ className = "text-blue-600" }) => (
    <svg className={`w-16 h-8 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 64 32">
      <path d="M0 20 L10 18 L20 16 L30 14 L40 10 L50 8 L64 5" strokeWidth="2" />
    </svg>
  );

  return (
    <div className={`${isDark ? "dark" : ""} h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900`}>
      {/* Sidebar */}
      <aside className={`w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 flex-col z-20 ${sidebarOpen ? "flex" : "hidden"} md:flex`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <span className="material-icons">data_usage</span>
            <span>SysIntel</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            <li>
              <Link className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-lg" to="/dashboard">
                <span className="material-icons text-xl">dashboard</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg" to="/leads">
                <span className="material-icons text-xl">people_alt</span>
                Leads
              </Link>
            </li>
            <li>
              <Link className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg" to="/events">
                <span className="material-icons text-xl">event_note</span>
                Events
              </Link>
            </li>
            <li>
              <Link className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg" to="/rules">
                <span className="material-icons text-xl">settings_input_component</span>
                Automation
              </Link>
            </li>
            <li>
              <div className="my-2 border-t border-gray-200 dark:border-gray-700 mx-3"></div>
            </li>
            <li>
              <Link className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg" to="/settings">
                <span className="material-icons text-xl">settings</span>
                Settings
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              DL
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">DevOps Lead</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">admin@sysintel.io</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 z-10 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-gray-600">
              <span className="material-icons">menu</span>
            </button>
            <div className="relative">
              <button className="flex items-center gap-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600">
                <span>Production-US-East</span>
                <span className="material-icons text-lg">arrow_drop_down</span>
              </button>
            </div>
            <div className="relative max-w-xl w-full hidden md:block ml-4">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-gray-400 text-lg">search</span>
              </span>
              <input className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 text-sm" placeholder="Search resources, leads, logs, or documentation (/)" type="text" />
            </div>
          </div>
          <div className="flex items-center gap-6 ml-4">
            <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                <span>API</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                <span>Worker</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                <span>Redis</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                <span>MongoDB</span>
              </div>
            </div>
            <button onClick={() => setIsDark(!isDark)} className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
              <span className="material-icons">{isDark ? "light_mode" : "dark_mode"}</span>
            </button>
            <button className="text-gray-600 dark:text-gray-400 hover:text-blue-600">
              <span className="material-icons">notifications_none</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Overview of lead scoring engine performance for the last 24 hours.
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setAutoRefresh(!autoRefresh)} className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded ${autoRefresh ? "text-blue-600 bg-blue-50 hover:bg-blue-100" : "text-gray-600 bg-gray-100 hover:bg-gray-200"}`}>
                  <span className="material-icons text-sm">refresh</span>
                  Auto-refresh: {autoRefresh ? "On" : "Off"}
                </button>
                <Link to="/rules" className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded shadow-sm">
                  <span className="material-icons text-sm">add</span>
                  New Event Rule
                </Link>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Total Leads</h3>
                  <span className="text-green-600 text-xs font-medium bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                    {stats.totalLeadsChange}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.totalLeads.toLocaleString()}</span>
                  <Sparkline />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Active Events (24h)</h3>
                  <span className="text-green-600 text-xs font-medium bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                    {stats.activeEventsChange}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.activeEvents}</span>
                  <Sparkline />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Qualified Leads</h3>
                  <span className="text-yellow-600 text-xs font-medium bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded">
                    {stats.qualifiedLeadsChange}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.qualifiedLeads}</span>
                  <Sparkline className="text-yellow-600" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Avg Lead Score</h3>
                  <span className="text-green-600 text-xs font-medium bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                    {stats.avgScoreChange}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stats.avgScore}/100</span>
                  <Sparkline />
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Chart */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Lead Velocity & Event Volume</h3>
                  <div className="flex gap-2">
                    {["1H", "24H", "7D"].map((range) => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`text-xs font-medium px-2 py-1 rounded border ${
                          timeRange === range
                            ? "bg-blue-50 text-blue-600 border-blue-200"
                            : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600"
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-48 relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="w-full border-b border-dashed border-gray-200 dark:border-gray-700"></div>
                    <div className="w-full border-b border-dashed border-gray-200 dark:border-gray-700"></div>
                    <div className="w-full border-b border-dashed border-gray-200 dark:border-gray-700"></div>
                    <div className="w-full border-b border-dashed border-gray-200 dark:border-gray-700"></div>
                  </div>
                  
                  {/* Bars */}
                  <div className="h-full flex items-end gap-1 relative z-10">
                    {chartBars.map((height, idx) => (
                      <div key={idx} className="flex-1 bg-blue-100 dark:bg-blue-900/40 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-t transition-all group relative" style={{ height: `${height}%` }}>
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
                          {Math.round(height * 50)} Events
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Line chart overlay */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" preserveAspectRatio="none">
                    <path
                      d={`M 0 ${192 - chartBars[0] * 1.92} 
                          Q ${100/12 * 0.5} ${192 - (chartBars[0] + chartBars[1]) / 2 * 1.92}, ${100/12} ${192 - chartBars[1] * 1.92}
                          Q ${100/12 * 1.5} ${192 - (chartBars[1] + chartBars[2]) / 2 * 1.92}, ${100/12 * 2} ${192 - chartBars[2] * 1.92}
                          Q ${100/12 * 2.5} ${192 - (chartBars[2] + chartBars[3]) / 2 * 1.92}, ${100/12 * 3} ${192 - chartBars[3] * 1.92}
                          Q ${100/12 * 3.5} ${192 - (chartBars[3] + chartBars[4]) / 2 * 1.92}, ${100/12 * 4} ${192 - chartBars[4] * 1.92}
                          Q ${100/12 * 4.5} ${192 - (chartBars[4] + chartBars[5]) / 2 * 1.92}, ${100/12 * 5} ${192 - chartBars[5] * 1.92}
                          Q ${100/12 * 5.5} ${192 - (chartBars[5] + chartBars[6]) / 2 * 1.92}, ${100/12 * 6} ${192 - chartBars[6] * 1.92}
                          Q ${100/12 * 6.5} ${192 - (chartBars[6] + chartBars[7]) / 2 * 1.92}, ${100/12 * 7} ${192 - chartBars[7] * 1.92}
                          Q ${100/12 * 7.5} ${192 - (chartBars[7] + chartBars[8]) / 2 * 1.92}, ${100/12 * 8} ${192 - chartBars[8] * 1.92}
                          Q ${100/12 * 8.5} ${192 - (chartBars[8] + chartBars[9]) / 2 * 1.92}, ${100/12 * 9} ${192 - chartBars[9] * 1.92}
                          Q ${100/12 * 9.5} ${192 - (chartBars[9] + chartBars[10]) / 2 * 1.92}, ${100/12 * 10} ${192 - chartBars[10] * 1.92}
                          Q ${100/12 * 10.5} ${192 - (chartBars[10] + chartBars[11]) / 2 * 1.92}, ${100/12 * 11} ${192 - chartBars[11] * 1.92}`}
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2.5"
                      className="drop-shadow-sm"
                    />
                  </svg>
                </div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
                  <span>00:00</span>
                  <span>04:00</span>
                  <span>08:00</span>
                  <span>12:00</span>
                  <span>16:00</span>
                  <span>20:00</span>
                  <span>23:59</span>
                </div>
              </div>

              {/* Queue Status */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Bull Queue Status</h3>
                  <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full animate-pulse"></span> Live
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center mb-6">
                  <div className="relative w-32 h-32 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(#10b981 0% ${(queueStats.completed / (queueStats.completed + queueStats.active + queueStats.waiting + queueStats.failed)) * 100}%, #f59e0b ${(queueStats.completed / (queueStats.completed + queueStats.active + queueStats.waiting + queueStats.failed)) * 100}% ${((queueStats.completed + queueStats.waiting) / (queueStats.completed + queueStats.active + queueStats.waiting + queueStats.failed)) * 100}%, #2563eb ${((queueStats.completed + queueStats.waiting) / (queueStats.completed + queueStats.active + queueStats.waiting + queueStats.failed)) * 100}% ${((queueStats.completed + queueStats.waiting + queueStats.active) / (queueStats.completed + queueStats.active + queueStats.waiting + queueStats.failed)) * 100}%, #ef4444 ${((queueStats.completed + queueStats.waiting + queueStats.active) / (queueStats.completed + queueStats.active + queueStats.waiting + queueStats.failed)) * 100}% 100%)` }}>
                    <div className="absolute w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{queueStats.health}%</span>
                      <span className="text-[10px] uppercase text-gray-600 dark:text-gray-400">Health</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-600"></span>
                      <span className="text-gray-600 dark:text-gray-400">Completed</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{queueStats.completed.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span className="text-gray-600 dark:text-gray-400">Active</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{queueStats.active}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-600"></span>
                      <span className="text-gray-600 dark:text-gray-400">Waiting</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{queueStats.waiting}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      <span className="text-gray-600 dark:text-gray-400">Failed</span>
                    </div>
                    <span className="font-medium text-red-600">{queueStats.failed}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Leaderboard */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Top Scoring Leads</h3>
                  <Link to="/leaderboard" className="text-xs font-medium text-blue-600 hover:text-blue-700">View All</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">#</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Lead Info</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Score</th>
                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">Stage</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {leaderboard.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{lead.id}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center">
                              <div className={`w-8 h-8 rounded-full ${lead.color} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                                {lead.initials}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{lead.name}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">{lead.company}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="text-sm font-bold text-blue-600">{lead.score}</div>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStageStyle(lead.stage)}`}>
                              {lead.stage.charAt(0).toUpperCase() + lead.stage.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Audit Trail */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Recent Audit Trail</h3>
                  <div className="flex gap-2 items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Live Feed</span>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 font-mono text-xs max-h-96">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {auditLog.map((entry, idx) => (
                      <div key={idx} className="p-3 hover:bg-white dark:hover:bg-gray-800 transition-colors flex gap-3 items-start border-l-2 border-transparent hover:border-blue-600">
                        <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">{entry.time}</span>
                        <div className="flex-1">
                          <span className={`${entry.typeColor} font-medium`}>{entry.type}</span>
                          <span className="text-gray-900 dark:text-gray-100"> — {entry.message}</span>
                        </div>
                        <span className={`${entry.badgeColor} font-medium`}>{entry.badge}</span>
                      </div>
                    ))}
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

export default DashboardModern;
