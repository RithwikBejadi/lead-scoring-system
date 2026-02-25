/**
 * ActivityPage — System behavior log, replacing Events.
 * Groups events: Lead → Session → Events
 * Filter modes: all | impactful | stage changes | automation triggers
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { eventsApi } from "../../features/events/events.api.js";
import { leadsApi } from "../../api/leads.api.js";
import { initSocket } from "../../sockets/socket.js";
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

const IMPACTFUL_TYPES = new Set([
  "demo_request",
  "pricing_view",
  "signup",
  "form_submit",
  "identify",
  "purchase",
  "trial_start",
]);

function isImpactful(e) {
  return (
    IMPACTFUL_TYPES.has(e.type || e.eventType) ||
    (e.scoreDelta ?? e.delta ?? 0) >= 10
  );
}

function isStageChange(e) {
  return !!(e.stageChange || e.previousStage || e.properties?.stageChange);
}

function isAutomation(e) {
  return !!(e.automationId || e.properties?.automation || e.source === "automation");
}

function eventBadgeVariant(type) {
  if (IMPACTFUL_TYPES.has(type)) return "primary";
  if (type === "page_view") return "default";
  if (type === "click") return "default";
  return "default";
}

// ─── Single event row ─────────────────────────────────────────────────────────

function EventRow({ event }) {
  const type = event.type || event.eventType || "event";
  const delta = event.scoreDelta ?? event.delta ?? null;
  const page = event.properties?.page || event.properties?.url || "";

  return (
    <div className="flex items-start gap-3 py-2">
      <span className="material-icons text-[12px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5 shrink-0">
        radio_button_unchecked
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={eventBadgeVariant(type)} size="xs">
            {type}
          </Badge>
          {delta != null && delta !== 0 && (
            <span
              className={`text-[10px] font-bold ${
                delta > 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
          {isStageChange(event) && (
            <Badge variant="purple" size="xs">stage change</Badge>
          )}
          {isAutomation(event) && (
            <Badge variant="success" size="xs">automation</Badge>
          )}
        </div>
        {page && (
          <p className="text-[11px] font-mono text-text-secondary-light dark:text-text-secondary-dark truncate mt-0.5">
            {page}
          </p>
        )}
      </div>
      <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark shrink-0">
        {relTime(event.createdAt || event.timestamp)}
      </span>
    </div>
  );
}

// ─── Session group ─────────────────────────────────────────────────────────────

function SessionGroup({ sessionId, events, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const firstTs = events[0]?.createdAt || events[0]?.timestamp;
  const hasImpactful = events.some(isImpactful);

  return (
    <div className="ml-4 border-l border-google-border pl-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 py-1.5 w-full text-left hover:opacity-80 transition-opacity group"
      >
        <span className="material-icons text-[12px] text-text-secondary-light dark:text-text-secondary-dark">
          {open ? "expand_more" : "chevron_right"}
        </span>
        <span className="text-[10px] font-mono font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-widest">
          Session
        </span>
        <span className="text-[10px] font-mono text-text-secondary-light dark:text-text-secondary-dark opacity-60">
          {sessionId !== "no_session" ? sessionId.slice(-10) : "(no session)"}
        </span>
        <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
          ·
        </span>
        <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
          {events.length} event{events.length !== 1 ? "s" : ""}
        </span>
        {firstTs && (
          <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark ml-auto">
            {new Date(firstTs).toLocaleTimeString()}
          </span>
        )}
        {hasImpactful && (
          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" title="Has impactful events" />
        )}
      </button>
      {open && (
        <div className="ml-2 space-y-0 divide-y divide-google-border/40">
          {events.map((e, i) => (
            <EventRow key={e._id || i} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Lead group ───────────────────────────────────────────────────────────────

function LeadGroup({ leadId, leadName, leadEmail, sessions, navigate }) {
  const [open, setOpen] = useState(true);

  const displayName = leadName || leadEmail || `anon_${leadId?.substring(0, 8)}`;
  const initials = displayName.substring(0, 2).toUpperCase();
  const totalEvents = Object.values(sessions).reduce((acc, ev) => acc + ev.length, 0);
  const sessionOrder = Object.keys(sessions);

  return (
    <div className="rounded-lg border border-google-border bg-surface-light dark:bg-surface-dark overflow-hidden">
      {/* Lead header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-500 shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark truncate">
            {displayName}
          </p>
          {leadEmail && leadName && (
            <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark truncate">
              {leadEmail}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
            {totalEvents} events · {sessionOrder.length} session{sessionOrder.length !== 1 ? "s" : ""}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/leads/${leadId}`);
            }}
            className="text-[10px] font-semibold text-primary hover:underline"
          >
            View lead →
          </button>
          <span className="material-icons text-[14px] text-text-secondary-light dark:text-text-secondary-dark">
            {open ? "expand_less" : "expand_more"}
          </span>
        </div>
      </button>

      {/* Sessions */}
      {open && (
        <div className="px-4 pb-3 space-y-1">
          {sessionOrder.map((sid, i) => (
            <SessionGroup
              key={sid}
              sessionId={sid}
              events={sessions[sid]}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

const FILTERS = [
  { key: "all", label: "All" },
  { key: "impactful", label: "Impactful" },
  { key: "stage", label: "Stage Changes" },
  { key: "automation", label: "Automation" },
];

export default function ActivityPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [leads, setLeads] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [liveCount, setLiveCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Load recent events
      const evRes = await eventsApi.list({ limit: 200 });
      const rawEvents = Array.isArray(evRes)
        ? evRes
        : evRes?.data?.events || evRes?.data || evRes?.events || [];
      setEvents(rawEvents);

      // Load leads map for display names
      const lRes = await leadsApi.getAll({ limit: 200 });
      const rawLeads = lRes?.data?.leads || lRes?.data || lRes?.leads || [];
      const map = {};
      rawLeads.forEach((l) => {
        map[l._id] = l;
      });
      setLeads(map);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();

    // Live updates via socket
    let sock;
    try {
      sock = initSocket();
      const handler = (evt) => {
        setEvents((prev) => [
          {
            ...evt,
            _id: evt._id || `live_${Date.now()}`,
            createdAt: evt.createdAt || new Date().toISOString(),
          },
          ...prev.slice(0, 199),
        ]);
        setLiveCount((c) => c + 1);
      };
      sock.on("eventReceived", handler);
      return () => sock.off("eventReceived", handler);
    } catch {
      return () => {};
    }
  }, [load]);

  // Apply filter
  const filtered = useMemo(() => {
    if (filter === "all") return events;
    if (filter === "impactful") return events.filter(isImpactful);
    if (filter === "stage") return events.filter(isStageChange);
    if (filter === "automation") return events.filter(isAutomation);
    return events;
  }, [events, filter]);

  // Group: leadId → sessionId → events[]
  const grouped = useMemo(() => {
    const byLead = {};
    filtered.forEach((e) => {
      const leadId = e.leadId || e.lead || "unknown";
      const sessionId = e.sessionId || e.session || "no_session";
      if (!byLead[leadId]) byLead[leadId] = {};
      if (!byLead[leadId][sessionId]) byLead[leadId][sessionId] = [];
      byLead[leadId][sessionId].push(e);
    });
    return byLead;
  }, [filtered]);

  const leadOrder = Object.keys(grouped).sort((a, b) => {
    const aFirst = Object.values(grouped[a])[0]?.[0]?.createdAt || "";
    const bFirst = Object.values(grouped[b])[0]?.[0]?.createdAt || "";
    return bFirst.localeCompare(aFirst);
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-google-border bg-surface-light dark:bg-surface-dark shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
            Activity
          </h1>
          <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
            System behavior log · grouped by lead
          </p>
        </div>
        <div className="flex items-center gap-2">
          {liveCount > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              +{liveCount} live
            </span>
          )}
          <button
            onClick={load}
            className="flex items-center gap-1 px-3 py-1.5 text-[11px] text-text-secondary-light dark:text-text-secondary-dark hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <span className="material-icons text-[14px]">refresh</span>
            Refresh
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex items-center gap-1 px-6 py-2.5 border-b border-google-border bg-surface-light dark:bg-surface-dark shrink-0">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
              filter === f.key
                ? "bg-primary/10 text-primary"
                : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
          {filtered.length} events · {leadOrder.length} leads
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Spinner />
          </div>
        ) : leadOrder.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-icons text-4xl text-slate-300 dark:text-slate-700 mb-3">
              timeline
            </span>
            <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
              No activity yet
            </p>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
              {filter !== "all"
                ? "Try switching to 'All' to see all events"
                : "Events will appear here as they are ingested"}
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {leadOrder.map((leadId) => {
              const lead = leads[leadId];
              return (
                <LeadGroup
                  key={leadId}
                  leadId={leadId}
                  leadName={lead?.name}
                  leadEmail={lead?.email}
                  sessions={grouped[leadId]}
                  navigate={navigate}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
