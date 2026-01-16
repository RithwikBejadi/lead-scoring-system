/**
 * FILE: pages/LeadDetail.jsx
 * PURPOSE: Individual lead profile with score trend chart and event timeline
 * DATA FLOW: Fetches /api/leads/:id, /api/leads/:id/history, /api/events?leadId=
 * REAL-TIME: Updates score on socket.io score_updated events
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { leadsApi } from "../api/leads.api";
import { eventsApi } from "../api/events.api";
import { scoreSocket } from "../sockets/score.socket";
import Sidebar from "../components/layout/Sidebar";
import ScoreTrendChart from "../components/charts/ScoreTrendChart";
import EventTimeline from "../components/timeline/EventTimeline";

export default function LeadDetail({ onOpenDrawer }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState("30D");

  useEffect(() => {
    loadData();

    // Subscribe to real-time updates
    scoreSocket.connect();
    scoreSocket.onScoreUpdate((data) => {
      if (data.leadId === id) {
        setLead((prev) => (prev ? { ...prev, score: data.newScore } : null));
      }
    });

    return () => {
      scoreSocket.offScoreUpdate();
    };
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leadData, historyData, eventsData] = await Promise.all([
        leadsApi.getById(id),
        leadsApi.getScoreHistory(id).catch(() => []),
        eventsApi.getByLead(id).catch(() => []),
      ]);
      setLead(leadData);
      setScoreHistory(historyData);
      setEvents(eventsData);
    } catch (err) {
      console.error("[LeadDetail] Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage) => {
    const colors = {
      qualified: "bg-emerald-50 text-emerald-700 border-emerald-100",
      hot: "bg-red-50 text-red-700 border-red-100",
      warm: "bg-orange-50 text-orange-700 border-orange-100",
      cold: "bg-slate-100 text-slate-600 border-slate-200",
    };
    return colors[stage?.toLowerCase()] || colors.cold;
  };

  const getEngagementLevel = (score) => {
    if (score >= 80) return "High";
    if (score >= 50) return "Medium";
    return "Low";
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

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Loading lead details...</p>
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
            onClick={() => navigate("/leads")}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Back to Leads
          </button>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">
            person_off
          </span>
          <p className="text-slate-500">Lead not found</p>
          <button
            onClick={() => navigate("/leads")}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Back to Leads
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 bg-white border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
          <div className="font-bold text-lg text-primary">LeadScorer</div>
          <button className="p-2 text-slate-600">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Back Button */}
          <button
            onClick={() => navigate("/leads")}
            className="flex items-center gap-2 text-slate-500 hover:text-primary mb-4 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              arrow_back
            </span>
            Back to Leads
          </button>

          {/* Profile Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-5 w-full md:w-auto">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl border-4 border-white shadow-sm">
                    {getInitials(lead.name)}
                  </div>
                  <div
                    className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1.5 border-4 border-white"
                    title="Active"
                  >
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                      {lead.name}
                    </h1>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStageColor(
                        lead.stage
                      )}`}
                    >
                      {lead.stage || "Cold"}
                    </span>
                  </div>
                  <p className="text-slate-500 text-base font-medium mt-1">
                    {lead.company || "No company"}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">
                        mail
                      </span>
                      {lead.email || "No email"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">
                        business
                      </span>
                      {lead.company || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Score Badge & Actions */}
              <div className="flex flex-row md:flex-col items-center md:items-end gap-4 w-full md:w-auto justify-between md:justify-center">
                {/* Score Badge */}
                <div className="flex items-center gap-3 bg-gradient-to-br from-primary to-primary-dark text-white pl-4 pr-5 py-2 rounded-lg shadow-md cursor-default group">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        className="text-white/20"
                        cx="24"
                        cy="24"
                        fill="transparent"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <circle
                        className="text-white"
                        cx="24"
                        cy="24"
                        fill="transparent"
                        r="20"
                        stroke="currentColor"
                        strokeDasharray="125.6"
                        strokeDashoffset={
                          125.6 - (125.6 * (lead.score || 0)) / 100
                        }
                        strokeWidth="4"
                      ></circle>
                    </svg>
                    <span className="absolute text-sm font-bold">
                      {lead.score || 0}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-white/80 uppercase tracking-wider">
                      Lead Score
                    </span>
                    <span className="text-lg font-bold">
                      {lead.stage || "Cold"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <a
                    href={lead.email ? `mailto:${lead.email}` : "#"}
                    className={`flex-1 sm:flex-none h-10 px-4 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 ${
                      !lead.email ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={(e) => !lead.email && e.preventDefault()}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      mail
                    </span>
                    {lead.email ? "Send Email" : "No Email"}
                  </a>
                  <button
                    onClick={onOpenDrawer}
                    className="flex-1 sm:flex-none h-10 px-4 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 shadow-sm shadow-primary/30"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      edit_note
                    </span>
                    Log Activity
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:border-primary/30 transition-colors group">
              <div className="flex justify-between items-start">
                <p className="text-slate-500 text-sm font-medium">
                  Engagement Level
                </p>
                <span className="material-symbols-outlined text-green-500 bg-green-50 p-1 rounded-md">
                  trending_up
                </span>
              </div>
              <p className="text-slate-900 text-2xl font-bold mt-2 group-hover:text-primary transition-colors">
                {getEngagementLevel(lead.score || 0)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:border-primary/30 transition-colors group">
              <div className="flex justify-between items-start">
                <p className="text-slate-500 text-sm font-medium">
                  Total Events
                </p>
                <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-1 rounded-md">
                  touch_app
                </span>
              </div>
              <p className="text-slate-900 text-2xl font-bold mt-2 group-hover:text-primary transition-colors">
                {events.length}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:border-primary/30 transition-colors group">
              <div className="flex justify-between items-start">
                <p className="text-slate-500 text-sm font-medium">
                  Last Active
                </p>
                <span className="material-symbols-outlined text-orange-500 bg-orange-50 p-1 rounded-md">
                  history
                </span>
              </div>
              <p className="text-slate-900 text-2xl font-bold mt-2 group-hover:text-primary transition-colors">
                {lead.lastActivity
                  ? new Date(lead.lastActivity).toLocaleDateString()
                  : "Today"}
              </p>
            </div>
          </div>

          {/* Split View: Chart & Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Score Trend
                  </h3>
                  <p className="text-sm text-slate-500">
                    Last 30 Days Activity
                  </p>
                </div>
                <div className="bg-slate-100 rounded-lg p-1 flex">
                  <button
                    className={`px-3 py-1 text-xs font-bold rounded ${
                      timePeriod === "30D"
                        ? "bg-white shadow-sm text-slate-900"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                    onClick={() => setTimePeriod("30D")}
                  >
                    30D
                  </button>
                  <button
                    className={`px-3 py-1 text-xs font-bold rounded ${
                      timePeriod === "90D"
                        ? "bg-white shadow-sm text-slate-900"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                    onClick={() => setTimePeriod("90D")}
                  >
                    90D
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-[256px]">
                <ScoreTrendChart data={scoreHistory} />
              </div>
            </div>

            {/* Timeline Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900">
                  Activity Timeline
                </h3>
                <button className="text-primary text-sm font-bold hover:underline">
                  View All
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <EventTimeline events={events} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
