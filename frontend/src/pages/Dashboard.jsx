import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { leadsApi } from "../api/leads.api";
import { leaderboardApi } from "../api/leaderboard.api";

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
      
      // Fetch all leads
      const leadsData = await leadsApi.getAll();
      const leads = Array.isArray(leadsData) ? leadsData : [];
      
      // Calculate stats
      const totalLeads = leads.length;
      const qualified = leads.filter(l => l.leadStage === 'qualified').length;
      const avgScore = leads.length > 0 
        ? Math.round(leads.reduce((sum, l) => sum + (l.currentScore || 0), 0) / leads.length)
        : 0;
      const conversion = totalLeads > 0 
        ? ((qualified / totalLeads) * 100).toFixed(1)
        : 0;

      setStats({ totalLeads, qualified, avgScore, conversion });

      // Calculate score distribution
      const distribution = [
        { range: '0-20', count: 0, percentage: 0 },
        { range: '21-40', count: 0, percentage: 0 },
        { range: '41-60', count: 0, percentage: 0 },
        { range: '61-80', count: 0, percentage: 0 },
        { range: '81-100', count: 0, percentage: 0 },
      ];

      leads.forEach(lead => {
        const score = lead.currentScore || 0;
        if (score <= 20) distribution[0].count++;
        else if (score <= 40) distribution[1].count++;
        else if (score <= 60) distribution[2].count++;
        else if (score <= 80) distribution[3].count++;
        else distribution[4].count++;
      });

      const maxCount = Math.max(...distribution.map(d => d.count), 1);
      distribution.forEach(d => {
        d.percentage = (d.count / maxCount) * 100;
      });

      setScoreDistribution(distribution);

      // Get top 5 leads
      const sortedLeads = [...leads]
        .sort((a, b) => (b.currentScore || 0) - (a.currentScore || 0))
        .slice(0, 5);
      setTopLeads(sortedLeads);

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStageLabel = (stage) => {
    const labels = {
      cold: 'NURTURE',
      warm: 'WARM',
      hot: 'HOT',
      qualified: 'HOT'
    };
    return labels[stage] || 'NURTURE';
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'N/A';
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-black">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <Sidebar isOpen={isSidebarOpen} onClose={onCloseSidebar} />
      
      <main className="flex-1 flex flex-col h-full bg-white overflow-hidden">
        <Header onToggleSidebar={onToggleSidebar} />
        
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            
            {/* Header */}
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-2xl font-normal text-black tracking-tight mb-1">Dashboard</h1>
                <p className="text-sm text-black">Performance overview for the last 30 days.</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-black hover:bg-black hover:text-white bg-white text-sm font-medium transition-colors">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  Last 30 Days
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 text-sm font-medium transition-colors border border-black">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Export Report
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 border border-black bg-white flex flex-col justify-between h-40 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-black uppercase tracking-wider">Total Leads</span>
                  <span className="material-symbols-outlined text-black">groups</span>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-normal tracking-tight text-black">{stats.totalLeads.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm text-black font-medium">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    <span>+5%</span>
                    <span className="text-black font-normal ml-1 opacity-60">vs last month</span>
                  </div>
                </div>
              </div>

              <div className="p-6 border border-black bg-white flex flex-col justify-between h-40 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-black uppercase tracking-wider">Qualified</span>
                  <span className="material-symbols-outlined text-black">check_circle</span>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-normal tracking-tight text-black">{stats.qualified.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm text-black font-medium">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    <span>+12%</span>
                    <span className="text-black font-normal ml-1 opacity-60">vs last month</span>
                  </div>
                </div>
              </div>

              <div className="p-6 border border-black bg-white flex flex-col justify-between h-40 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-black uppercase tracking-wider">Avg Score</span>
                  <span className="material-symbols-outlined text-black">speed</span>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-normal tracking-tight text-black">{stats.avgScore}</span>
                    <span className="text-lg text-black font-normal opacity-60">/100</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm text-black font-medium">
                    <span className="material-symbols-outlined text-[16px]">trending_down</span>
                    <span>-2%</span>
                    <span className="text-black font-normal ml-1 opacity-60">vs last month</span>
                  </div>
                </div>
              </div>

              <div className="p-6 border border-black bg-white flex flex-col justify-between h-40 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-black uppercase tracking-wider">Conversion</span>
                  <span className="material-symbols-outlined text-black">percent</span>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-normal tracking-tight text-black">{stats.conversion}%</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm text-black font-medium">
                    <span className="material-symbols-outlined text-[16px]">trending_up</span>
                    <span>+0.8%</span>
                    <span className="text-black font-normal ml-1 opacity-60">vs last month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Score Distribution */}
              <div className="lg:col-span-1 border border-black p-6 bg-white flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-base font-semibold text-black">Score Distribution</h3>
                  <button className="text-black hover:bg-gray-100 p-1 border border-transparent hover:border-black">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </div>
                
                <div className="flex-1 flex items-end justify-between gap-4 h-64 px-2 pb-2">
                  {scoreDistribution.map((bucket, idx) => (
                    <div key={bucket.range} className="flex flex-col items-center gap-2 flex-1 group">
                      <div 
                        className="w-full bg-gray-200 relative group-hover:bg-black transition-all border border-black"
                        style={{ height: `${bucket.percentage}%` }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 pointer-events-none transition-opacity whitespace-nowrap z-10 border border-black">
                          {bucket.count} Leads
                        </div>
                      </div>
                      <span className="text-xs font-mono text-black">{bucket.range}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-black flex justify-between text-xs text-black">
                  <span>Total Volume: {stats.totalLeads}</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-black"></span> Active Leads
                  </span>
                </div>
              </div>

              {/* Top Performing Leads */}
              <div className="lg:col-span-2 border border-black bg-white flex flex-col">
                <div className="p-6 border-b border-black flex justify-between items-center">
                  <h3 className="text-base font-semibold text-black">Top Performing Leads</h3>
                  <Link to="/leads" className="text-sm font-medium text-black hover:underline flex items-center gap-1 group">
                    View All <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                  </Link>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-black bg-white">
                        <th className="p-4 pl-6 text-xs font-semibold text-black uppercase tracking-wider w-16">Rank</th>
                        <th className="p-4 text-xs font-semibold text-black uppercase tracking-wider">Company</th>
                        <th className="p-4 text-xs font-semibold text-black uppercase tracking-wider">Contact</th>
                        <th className="p-4 text-xs font-semibold text-black uppercase tracking-wider">Score</th>
                        <th className="p-4 text-xs font-semibold text-black uppercase tracking-wider">Status</th>
                        <th className="p-4 pr-6 text-xs font-semibold text-black uppercase tracking-wider text-right">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {topLeads.map((lead, idx) => (
                        <tr key={lead._id} className="border-b border-gray-200 group hover:bg-gray-50 transition-colors">
                          <td className="p-4 pl-6 font-mono font-medium text-black">{String(idx + 1).padStart(2, '0')}</td>
                          <td className="p-4 font-semibold text-black">
                            <Link to={`/leads/${lead._id}`} className="hover:underline">
                              {lead.company || lead.email || 'Unknown'}
                            </Link>
                          </td>
                          <td className="p-4 text-black">{lead.name || lead.email || 'N/A'}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-black">{lead.currentScore || 0}</span>
                              <div className="h-2 w-16 bg-white border border-black overflow-hidden p-px">
                                <div 
                                  className="h-full bg-black" 
                                  style={{ width: `${Math.min((lead.currentScore || 0), 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2 py-0.5 border border-black bg-white text-black text-xs font-bold uppercase tracking-wide">
                              {getStageLabel(lead.leadStage)}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right font-mono text-black">
                            {formatTimeAgo(lead.lastEventAt || lead.updatedAt)}
                          </td>
                        </tr>
                      ))}
                      
                      {topLeads.length === 0 && (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-black">
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
