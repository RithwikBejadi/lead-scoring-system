/**
 * FILE: pages/Leads.jsx
 * PURPOSE: Lead management dashboard - main table view
 * DATA FLOW: Fetches /api/leads, displays sortable/filterable table
 * REAL-TIME: Subscribes to score_updated socket events
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadsApi } from '../api/leads.api';
import { scoreSocket } from '../sockets/score.socket';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

function Leads() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch leads on mount
  useEffect(() => {
    loadLeads();
    
    // Subscribe to real-time score updates
    scoreSocket.connect();
    scoreSocket.onScoreUpdate((data) => {
      console.log('[Leads] Score update:', data);
      setLeads(prev => prev.map(lead => 
        lead._id === data.leadId 
          ? { ...lead, score: data.newScore, delta: data.delta }
          : lead
      ));
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
      console.error('[Leads] Load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort leads
  const filteredLeads = leads
    .filter(lead => {
      const search = searchTerm.toLowerCase();
      return (
        lead.name?.toLowerCase().includes(search) ||
        lead.email?.toLowerCase().includes(search) ||
        lead.company?.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

  const getStageColor = (stage) => {
    const colors = {
      qualified: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      hot: 'bg-blue-50 text-blue-700 border-blue-100',
      warm: 'bg-orange-50 text-orange-700 border-orange-100',
      cold: 'bg-slate-100 text-slate-600 border-slate-200'
    };
    return colors[stage?.toLowerCase()] || colors.cold;
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f6f7f8]">
      <Sidebar currentPage="leads" />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Header title="Lead Management" subtitle="Track and prioritize incoming prospects in real-time." />
        
        <div className="flex-1 overflow-auto p-6">
          {/* Search & Filters */}
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email or company..."
                className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2c5181]"
              />
              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-[20px]">search</span>
            </div>
            
            <button onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} 
                    className="px-4 py-2 bg-white border rounded-lg text-sm font-medium flex items-center gap-2">
              Score {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Lead Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Company & Email</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase cursor-pointer" onClick={() => setSortBy('score')}>
                    Score {sortBy === 'score' && <span className="material-symbols-outlined inline text-[16px]">arrow_downward</span>}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Stage</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredLeads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => navigate(`/leads/${lead._id}`)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm border border-indigo-200">
                          {lead.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-slate-900 group-hover:text-[#2c5181]">{lead.name || 'Unknown'}</div>
                          <div className="text-xs text-slate-500">Added {new Date(lead.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{lead.company || 'N/A'}</div>
                      <div className="text-xs text-slate-500">{lead.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-emerald-600">{lead.score || 0}</span>
                        {lead.delta > 0 && <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getStageColor(lead.stage)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {lead.stage || 'Cold'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-slate-400 hover:text-[#2c5181] p-1 rounded">
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-slate-500 text-center">
            Showing {filteredLeads.length} of {leads.length} leads
          </div>
        </div>
      </main>
    </div>
  );
}

export default Leads;
