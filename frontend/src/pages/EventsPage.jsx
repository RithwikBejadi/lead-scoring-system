import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../api/axios.config";
import { getSocket } from "../sockets/socket";

// ── Helpers ───────────────────────────────────────────────────────────────────
const STAGE_COLORS = {
  PAGE_VIEW: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  PRICING_VIEW:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  REQUEST_DEMO:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  WEBINAR_SIGNUP:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  IDENTIFY:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};
const badgeClass = (type) =>
  STAGE_COLORS[type] ||
  "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300";

function EventRow({ event, selected, onClick }) {
  const ts = new Date(event.timestamp || event.createdAt);
  return (
    <tr
      onClick={onClick}
      className={`cursor-pointer border-b border-google-border transition-colors ${
        selected
          ? "bg-primary/10"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
      }`}
    >
      <td className="px-4 py-3 text-xs text-text-secondary-light dark:text-text-secondary-dark whitespace-nowrap">
        {ts.toLocaleTimeString()}
      </td>
      <td className="px-4 py-3">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass(event.eventType)}`}
        >
          {event.eventType}
        </span>
      </td>
      <td className="px-4 py-3 text-xs font-mono text-text-secondary-light dark:text-text-secondary-dark truncate max-w-[180px]">
        {event.anonymousId}
      </td>
      <td className="px-4 py-3 text-xs text-text-secondary-light dark:text-text-secondary-dark truncate max-w-[140px]">
        {event.sessionId ? event.sessionId.slice(0, 12) + "…" : "—"}
      </td>
      <td className="px-4 py-3">
        <span
          className={`w-2 h-2 rounded-full inline-block ${event._live ? "bg-green-500 animate-pulse" : "bg-slate-400"}`}
        />
      </td>
    </tr>
  );
}

function Inspector({ event, onClose }) {
  if (!event) return null;
  const ts = new Date(event.timestamp || event.createdAt);
  return (
    <aside className="w-96 flex-shrink-0 border-l border-google-border bg-surface-light dark:bg-surface-dark flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-google-border">
        <h3 className="text-sm font-semibold">Event Inspector</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
        >
          <span className="material-icons text-lg">close</span>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Identity */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-2">
            Identity
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Anonymous ID
              </span>
              <span className="font-mono text-xs truncate max-w-[180px]">
                {event.anonymousId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Session
              </span>
              <span className="font-mono text-xs">
                {event.sessionId ? event.sessionId.slice(0, 16) + "…" : "—"}
              </span>
            </div>
          </div>
        </section>
        {/* Event Info */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-2">
            Event
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Type
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass(event.eventType)}`}
              >
                {event.eventType}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Time
              </span>
              <span className="text-xs">{ts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Status
              </span>
              <span className="text-xs text-green-600 font-medium">
                {event.status || (event.processed ? "processed" : "queued")}
              </span>
            </div>
          </div>
        </section>
        {/* Raw Payload */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-2">
            Raw Payload
          </p>
          <pre className="bg-black text-green-400 text-[11px] font-mono p-3 rounded-lg overflow-auto max-h-60 whitespace-pre-wrap break-all">
            {JSON.stringify(event.properties || {}, null, 2)}
          </pre>
        </section>
        {/* Live badge */}
        {event._live && (
          <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Received via live socket
          </div>
        )}
      </div>
    </aside>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [liveCount, setLiveCount] = useState(0);
  const didMount = useRef(false);

  const loadEvents = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get("/events", { params: { limit: 100 } });
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : data.events || [];
      setEvents(list.map((e) => ({ ...e, _live: false })));
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Unauthorized — please log in again.");
      } else if (!err.response) {
        setError("Cannot reach backend. Is the API server running?");
      } else {
        setError(`API error: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (didMount.current) return;
    didMount.current = true;
    loadEvents();
  }, [loadEvents]);

  // Socket live-push
  useEffect(() => {
    let sock;
    try {
      sock = getSocket();
      sock.on("newEvent", (payload) => {
        setLiveCount((c) => c + 1);
        setEvents((prev) =>
          [
            { ...payload, _live: true, _id: `live-${Date.now()}` },
            ...prev,
          ].slice(0, 200),
        );
      });
    } catch {
      // socket unavailable — fallback polling
      const t = setInterval(loadEvents, 10000);
      return () => clearInterval(t);
    }
    return () => {
      if (sock) sock.off("newEvent");
    };
  }, [loadEvents]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-google-border bg-surface-light dark:bg-surface-dark flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <span className="material-icons text-primary text-xl">bolt</span>
            Event Stream
          </h1>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
            Live ingestion feed · {events.length} events
            {liveCount > 0 && (
              <span className="ml-2 text-green-600 font-semibold">
                +{liveCount} live
              </span>
            )}
          </p>
        </div>
        <button
          onClick={loadEvents}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          <span className="material-icons text-sm">refresh</span>
          Refresh
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-48 gap-3 text-text-secondary-light dark:text-text-secondary-dark">
              <span className="material-icons animate-spin">sync</span>
              Loading events…
            </div>
          )}
          {error && (
            <div className="m-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <span className="material-icons text-red-500 mt-0.5 text-lg">
                error_outline
              </span>
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                  Failed to load events
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">
                  {error}
                </p>
                <button
                  onClick={loadEvents}
                  className="mt-2 text-xs text-red-600 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          {!loading && !error && events.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-text-secondary-light dark:text-text-secondary-dark">
              <span className="material-icons text-4xl mb-2 opacity-30">
                bolt
              </span>
              <p className="text-sm font-medium">No events yet</p>
              <p className="text-xs mt-1 opacity-70">
                Ingest your first event using the Simulator or SDK
              </p>
            </div>
          )}
          {!loading && !error && events.length > 0 && (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-light dark:bg-surface-dark border-b border-google-border z-10">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                    Time
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                    Event Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                    Anonymous ID
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                    Session
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                    Live
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev, i) => (
                  <EventRow
                    key={ev._id || ev.eventId || i}
                    event={ev}
                    selected={
                      selected?._id === ev._id ||
                      selected?.eventId === ev.eventId
                    }
                    onClick={() => setSelected(ev)}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Inspector panel */}
        {selected && (
          <Inspector event={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  );
}
