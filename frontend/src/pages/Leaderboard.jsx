/**
 * FILE: pages/Leaderboard.jsx
 * PURPOSE: Top leads leaderboard with real-time ranking
 * DATA FLOW: Fetches /api/leads/leaderboard?limit=10
 * REAL-TIME: Reorders on score_updated socket events
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaderboardApi } from '../api/leaderboard.api';
import { scoreSocket } from '../sockets/score.socket';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();

    // Real-time updates
    scoreSocket.connect();
    scoreSocket.onScoreUpdate((data) => {
      setLeads(prev => {
        const updated = prev.map(lead => 
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
      console.error('[Leaderboard] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage) => {
    const colors = {
      qualified: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      hot: 'bg-red-50 text-red-700 border-red-100',
      warm: 'bg-orange-50 text-orange-700 border-orange-100',
      cold: 'bg-slate-100 text-slate-600 border-slate-200'
    };
    return colors[stage?.toLowerCase()] || colors.cold;
  };

  const getMedalColor = (rank) => {
    if (rank === 1) return 'bg-yellow-400 text-yellow-900';
    if (rank === 2) return 'bg-slate-300 text-slate-700';
    if (rank === 3) return 'bg-orange-400 text-orange-900';
    return 'bg-slate-200 text-slate-600';
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading leaderboard...</div>;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f6f7f8]">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Header 
          title="Top Lead Leaderboard"
          subtitle={`Live Scoring • Updated: Just now`}
        />

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Top 3 Podium */}
            <div className="grid grid-cols-3 gap-6 items-end mb-8">
              {leads.slice(0, 3).map((lead, idx) => {
                const rank = idx + 1;
                return (
                  <div key={lead._id} className={`bg-white rounded-xl border border-slate-200 p-6 shadow-sm ${rank === 1 ? 'transform -translate-y-4' : ''}`}>
                    <div className={`${getMedalColor(rank)} text-sm font-bold px-4 py-1.5 rounded-full text-center mb-4`}>
                      #{rank}
                    </div>
                    <div className="text-center">
                      <div className={`${rank === 1 ? 'h-20 w-20' : 'h-16 w-16'} mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold ${rank === 1 ? 'text-2xl' : 'text-xl'} mb-3`}>
                        {lead.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <h3 className="font-bold text-lg">{lead.name}</h3>
                      <p className="text-sm text-slate-500">{lead.company}</p>
                      <div className="mt-4">
                        <div className={`text-4xl font-black ${rank === 1 ? 'text-[#2c5181]' : 'text-slate-900'}`}>
                          {lead.score || 0}
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate(`/leads/${lead._id}`)}
                        className="w-full mt-4 py-2 rounded-lg border border-[#2c5181] text-[#2c5181] hover:bg-[#2c5181] hover:text-white transition text-sm font-semibold"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Leaderboard Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-bold text-slate-800">High Potential Leads (Rank 4+)</h3>
              </div>
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr className="text-xs font-semibold text-slate-500 uppercase">
                    <th className="px-6 py-4 text-center w-16">Rank</th>
                    <th className="px-6 py-4 text-left">Lead Name</th>
                    <th className="px-6 py-4 text-left">Company</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4 text-left">Stage</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.slice(3).map((lead, idx) => (
                    <tr key={lead._id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/leads/${lead._id}`)}>
                      <td className="px-6 py-4 text-center font-bold text-slate-400">{idx + 4}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                            {lead.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="font-bold text-slate-900 text-sm">{lead.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{lead.company || 'N/A'}</td>
                      <td className="px-6 py-4 text-center text-sm font-black text-slate-800">{lead.score || 0}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStageColor(lead.stage)}`}>
                          {lead.stage || 'Cold'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-[#2c5181] rounded-lg">
                          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
