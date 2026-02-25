/**
 * LeadDetailPage — Four-panel intelligence view for a single lead.
 * Panels:
 *   1. Score Timeline (top) — score vs time with event markers
 *   2. Causal Chain — why score changed
 *   3. Intelligence Panel — velocity, risk, trend, next action
 *   4. Session/Event Timeline — grouped by visit
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { leadsApi } from "../../api/leads.api.js";
import { eventsApi } from "../../features/events/events.api.js";
import { Panel, PanelHeader } from "../../shared/ui/Panel.jsx";
import Badge from "../../shared/ui/Badge.jsx";
import Spinner from "../../shared/ui/Spinner.jsx";

// ─── helpers ──────────────────────────────────────────────────────────────────

function relTime(ts) {
  if (!ts) return "—";
  const d = (Date.now() - new Date(ts)) / 1000;
  if (d < 5) return "just now";
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

function stageFor(score) {
  if (score >= 85) return { label: "Qualified", variant: "primary", color: "text-emerald-500" };
  if (score >= 70) return { label: "Hot", variant: "warning", color: "text-orange-500" };
  if (score >= 40) return { label: "Warm", variant: "default", color: "text-amber-500" };
  return { label: "Cold", variant: "default", color: "text-slate-400" };
}

// ─── 1. Score Timeline ─────────────────────────────────────────────────────────

function ScoreTimeline({ history }) {
  const data = history.map((h) => ({
    time: new Date(h.createdAt || h.timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    score: h.score ?? h.newScore ?? 0,
    event: h.eventType || h.reason,
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-xs text-text-secondary-light dark:text-text-secondary-dark">
        No score history yet
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-[11px] font-mono">
        <p className="text-white/60 mb-1">{label}</p>
        <p className="text-blue-400 font-bold">Score: {d.score}</p>
        {d.event && <p className="text-white/40 mt-0.5">{d.event}</p>}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 9, fill: "#94a3b8", fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 9, fill: "#94a3b8", fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={85} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.4} />
        <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.4} />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── 2. Causal Chain ───────────────────────────────────────────────────────────

function CausalChain({ history, currentScore }) {
  const mutations = history
    .filter((h) => (h.delta ?? h.change ?? 0) !== 0)
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.timestamp) -
        new Date(a.createdAt || a.timestamp),
    )
    .slice(0, 8);

  if (mutations.length === 0) {
    return (
      <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark py-6 text-center">
        No score changes recorded yet
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {mutations.map((h, i) => {
        const delta = h.delta ?? h.change ?? 0;
        const label = h.eventType || h.reason || h.event || "Score change";
        return (
          <div
            key={i}
            className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
          >
            <span
              className={`font-mono text-sm font-bold w-12 shrink-0 ${
                delta > 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {delta > 0 ? `+${delta}` : delta}
            </span>
            <span className="text-xs text-text-primary-light dark:text-text-primary-dark flex-1 truncate">
              {label}
            </span>
            <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark shrink-0">
              {relTime(h.createdAt || h.timestamp)}
            </span>
          </div>
        );
      })}
      <div className="border-t border-google-border mt-2 pt-2 flex items-center justify-between px-2">
        <span className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
          Current Score
        </span>
        <span className="font-mono text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
          {currentScore}
        </span>
      </div>
    </div>
  );
}

// ─── 3. Intelligence Panel ─────────────────────────────────────────────────────

function IntelligencePanel({ lead, history }) {
  const score = lead.currentScore || lead.score || 0;
  const velNum = lead.velocity || lead.velocityScore || 0;
  const daysSince = lead.lastEventAt
    ? (Date.now() - new Date(lead.lastEventAt)) / 86400000
    : Infinity;

  const velocity =
    velNum > 60
      ? { label: "High", color: "text-emerald-500", icon: "trending_up" }
      : velNum > 30
        ? { label: "Medium", color: "text-amber-500", icon: "trending_flat" }
        : { label: "Low", color: "text-slate-400", icon: "trending_down" };

  const risk =
    daysSince > 14
      ? { label: "High", color: "text-red-500", icon: "warning" }
      : daysSince > 7
        ? { label: "Medium", color: "text-amber-500", icon: "schedule" }
        : { label: "Low", color: "text-emerald-500", icon: "check_circle" };

  const recent = [...history]
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.timestamp) -
        new Date(a.createdAt || a.timestamp),
    )
    .slice(0, 3);
  const trend =
    recent.length >= 2
      ? (recent[0].score ?? recent[0].newScore ?? 0) >
        (recent[recent.length - 1].score ?? recent[recent.length - 1].newScore ?? 0)
        ? { label: "Accelerating", color: "text-emerald-500", icon: "rocket_launch" }
        : { label: "Decelerating", color: "text-amber-500", icon: "arrow_downward" }
      : { label: "Stable", color: "text-slate-400", icon: "remove" };

  const nextAction =
    score >= 85
      ? "Close deal — lead is qualified"
      : score >= 70
        ? "Schedule call — lead is hot"
        : score >= 40
          ? "Send personalized outreach"
          : daysSince > 7
            ? "Re-engage — lead is going cold"
            : "Monitor — engagement building";

  const metrics = [
    { label: "Velocity", value: velocity.label, icon: velocity.icon, color: velocity.color },
    { label: "Risk", value: risk.label, icon: risk.icon, color: risk.color },
    { label: "Trend", value: trend.label, icon: trend.icon, color: trend.color },
    {
      label: "Last Active",
      value: relTime(lead.lastEventAt),
      icon: "schedule",
      color: "text-text-secondary-light dark:text-text-secondary-dark",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-lg border border-google-border bg-slate-50 dark:bg-slate-800/40 p-3"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`material-icons text-[14px] ${m.color}`}>{m.icon}</span>
              <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider font-semibold">
                {m.label}
              </span>
            </div>
            <p className={`text-sm font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-icons text-[14px] text-primary">tips_and_updates</span>
          <span className="text-[10px] text-primary uppercase tracking-wider font-semibold">
            Recommended Action
          </span>
        </div>
        <p className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark">
          {nextAction}
        </p>
      </div>
    </div>
  );
}

// ─── 4. Session Timeline ───────────────────────────────────────────────────────

function SessionTimeline({ events }) {
  if (events.length === 0) {
    return (
      <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark py-6 text-center">
        No events recorded
      </div>
    );
  }

  const grouped = {};
  const order = [];
  events.forEach((e) => {
    const s = e.sessionId || e.session || "no_session";
    if (!grouped[s]) {
      grouped[s] = [];
      order.push(s);
    }
    grouped[s].push(e);
  });

  return (
    <div className="space-y-6">
      {order.map((sessionId, si) => {
        const sessionEvents = grouped[sessionId];
        const firstTs = sessionEvents[0]?.createdAt || sessionEvents[0]?.timestamp;
        return (
          <div key={sessionId}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-widest">
                Session {si + 1}
              </span>
              {firstTs && (
                <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
                  · {new Date(firstTs).toLocaleString()}
                </span>
              )}
              <Badge variant="default" size="xs" className="ml-auto">
                {sessionEvents.length} events
              </Badge>
            </div>
            <div className="border-l-2 border-google-border ml-2 pl-4 space-y-2">
              {sessionEvents.map((e, i) => {
                const delta = e.scoreDelta ?? e.delta ?? null;
                return (
                  <div key={e._id || i} className="flex items-start gap-3">
                    <span className="material-icons text-[12px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5 shrink-0">
                      radio_button_unchecked
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark">
                          {e.type || e.eventType || "event"}
                        </span>
                        {delta != null && delta !== 0 && (
                          <span
                            className={`text-[10px] font-bold ${
                              delta > 0 ? "text-emerald-500" : "text-red-500"
                            }`}
                          >
                            {delta > 0 ? `+${delta}` : delta}
                          </span>
                        )}
                      </div>
                      {(e.properties?.page || e.properties?.url) && (
                        <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark truncate font-mono">
                          {e.properties.page || e.properties.url}
                        </p>
                      )}
                      <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
                        {relTime(e.createdAt || e.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [events, setEvents] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.allSettled([
      leadsApi.getById(id),
      eventsApi.getSession(id),
      leadsApi.getScoreHistory(id),
    ]).then(([leadRes, eventsRes, historyRes]) => {
      if (leadRes.status === "fulfilled") {
        const d = leadRes.value;
        setLead(d?.data?.lead || d?.data || d?.lead || d);
      }
      if (eventsRes.status === "fulfilled") {
        const d = eventsRes.value;
        setEvents(Array.isArray(d) ? d : d?.data || d?.events || d?.timeline || []);
      }
      if (historyRes.status === "fulfilled") {
        const d = historyRes.value;
        setHistory(Array.isArray(d) ? d : d?.data || d?.history || []);
      }
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          Lead not found
        </p>
        <button
          onClick={() => navigate("/leads")}
          className="text-xs text-primary hover:underline"
        >
          ← Back to leads
        </button>
      </div>
    );
  }

  const score = lead.currentScore || lead.score || 0;
  const stage = stageFor(score);

  // Count unique sessions
  const sessionCount = Object.keys(
    events.reduce((acc, e) => {
      acc[e.sessionId || e.session || "no_session"] = 1;
      return acc;
    }, {}),
  ).length;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="h-14 flex items-center gap-4 px-6 border-b border-google-border bg-surface-light dark:bg-surface-dark shrink-0">
        <button
          onClick={() => navigate("/leads")}
          className="flex items-center gap-1 text-[11px] text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"
        >
          <span className="material-icons text-[14px]">arrow_back</span>
          Leads
        </button>
        <div className="h-4 w-px bg-google-border" />
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark truncate">
            {lead.name || lead.email || lead.anonymousId}
          </h1>
          {lead.email && lead.name && (
            <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
              {lead.email}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Badge variant={stage.variant} size="sm">
            {stage.label}
          </Badge>
          <div className="text-right">
            <span className={`font-mono text-2xl font-bold ${stage.color}`}>{score}</span>
            <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
              score
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-5">

          {/* Panel 1 — Score Timeline */}
          <Panel noPad>
            <PanelHeader
              title="Score Timeline"
              subtitle={`${history.length} score events · ${events.length} total events`}
            />
            <div className="px-4 pt-2 pb-4">
              <ScoreTimeline history={history} />
              <div className="flex items-center gap-4 mt-2 text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-px bg-emerald-500 inline-block opacity-60" style={{ borderTop: "2px dashed" }} />
                  Qualified (85+)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-px bg-amber-500 inline-block opacity-60" style={{ borderTop: "2px dashed" }} />
                  Hot (70+)
                </span>
              </div>
            </div>
          </Panel>

          {/* Panels 2 + 3 side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Panel noPad>
              <PanelHeader
                title="Why score changed"
                subtitle="Causal chain of recent mutations"
              />
              <div className="p-4">
                <CausalChain history={history} currentScore={score} />
              </div>
            </Panel>

            <Panel noPad>
              <PanelHeader
                title="Intelligence"
                subtitle="Derived signals and recommended action"
              />
              <div className="p-4">
                <IntelligencePanel lead={lead} history={history} />
              </div>
            </Panel>
          </div>

          {/* Panel 4 — Session Timeline */}
          <Panel noPad>
            <PanelHeader
              title="Session Timeline"
              subtitle={`${events.length} events across ${sessionCount} session${sessionCount !== 1 ? "s" : ""}`}
            />
            <div className="p-4">
              <SessionTimeline events={events} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

