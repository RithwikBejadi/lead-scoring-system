/**
 * FILE: pages/LeadDetail.jsx
 * PURPOSE: Individual lead profile with score trend chart and event timeline
 * DATA FLOW: Fetches /api/leads/:id, /api/scores/history/:id, /api/events?leadId=
 * REAL-TIME: Updates score on socket.io score_updated events
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leadsApi } from '../api/leads.api';
import { eventsApi } from '../api/events.api';
import { scoreSocket } from '../sockets/score.socket';
import Sidebar from '../components/layout/Sidebar';
import ScoreTrendChart from '../components/charts/ScoreTrendChart';
import EventTimeline from '../components/timeline/EventTimeline';

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadData, historyData, eventsData] = await Promise.all([
        leadsApi.getById(id),
        leadsApi.getScoreHistory(id),
        eventsApi.getByLead(id)
      ]);
      setLead(leadData);
      setScoreHistory(historyData);
      setEvents(eventsData);
      
      // Subscribe to real-time updates
      scoreSocket.connect();
      scoreSocket.onScoreUpdate((data) => {
        if (data.leadId === id) {
          setLead(prev => prev ? { ...prev, score: data.newScore } : null);
        }
      });
    } catch (err) {
      console.error('[LeadDetail] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>;
  if (!lead) return <div className="flex items-center justify-center h-screen">Lead not found</div>;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f6f7f8]">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-5">
          <button onClick={() => navigate('/leads')} className="flex items-center gap-2 text-slate-500 hover:text-[#2c5181] mb-3">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            Back to Leads
          </button>
          <h2 className="text-2xl font-bold text-slate-900">{lead.name || 'Lead Profile'}</h2>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {/* Profile Card */}
            <div className="bg-white rounded-xl border p-6 mb-6 shadow-sm">
              <div className="flex gap-6 items-start justify-between">
                <div className="flex gap-5">
                  <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl">
                    {lead.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">{lead.name}</h1>
                    <p className="text-slate-500 mt-1">{lead.email} • {lead.company}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#2c5181] to-[#1a3b63] text-white px-5 py-3 rounded-lg">
                  <div className="text-xs uppercase">Score</div>
                  <div className="text-3xl font-bold">{lead.score || 0}</div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl border p-5">
                <p className="text-sm text-slate-500">Total Events</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
              <div className="bg-white rounded-xl border p-5">
                <p className="text-sm text-slate-500">Stage</p>
                <p className="text-2xl font-bold">{lead.stage || 'Cold'}</p>
              </div>
              <div className="bg-white rounded-xl border p-5">
                <p className="text-sm text-slate-500">Last Activity</p>
                <p className="text-2xl font-bold">{lead.lastActivity ? new Date(lead.lastActivity).toLocaleDateString() : 'Never'}</p>
              </div>
            </div>

            {/* Chart & Timeline */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border p-6">
                <h3 className="text-lg font-bold mb-4">Score Trend</h3>
                <ScoreTrendChart data={scoreHistory} />
              </div>
              <div className="bg-white rounded-xl border p-6">
                <h3 className="text-lg font-bold mb-4">Activity Timeline</h3>
                <EventTimeline events={events} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
