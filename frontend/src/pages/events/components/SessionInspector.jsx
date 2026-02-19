/**
 * SessionInspector — right panel.
 * Opens when an event row is clicked.
 * Shows: event properties, session timeline, identity transitions, score evolution.
 */

import { useState, useEffect } from "react";
import { eventsApi } from "../../../features/events/events.api";
import { JsonViewer } from "../../../shared/ui/JsonViewer";
import { EventTypeBadge } from "../../../shared/ui/Badge";
import { Spinner } from "../../../shared/ui/Spinner";

function ts(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString();
}

function TimelineItem({ evt, isFirst }) {
  const type = evt.type || evt.eventType;
  return (
    <div className="flex gap-2.5">
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${
            type === "identify" ? "bg-emerald-400" : "bg-neutral-600"
          }`}
        />
        {!isFirst && <div className="w-px flex-1 bg-white/5 mt-1" />}
      </div>
      <div className="pb-3 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <EventTypeBadge type={type || "unknown"} />
          {evt.scoreDelta != null && (
            <span
              className={`text-[10px] font-mono ${
                evt.scoreDelta > 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {evt.scoreDelta > 0 ? "+" : ""}{evt.scoreDelta}
            </span>
          )}
        </div>
        <p className="text-[11px] font-mono text-neutral-600 truncate">
          {new Date(evt.createdAt || evt.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

export default function SessionInspector({ event, onClose }) {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [tab, setTab] = useState("event"); // "event" | "session" | "raw"

  useEffect(() => {
    if (!event) return;
    setTab("event");
    setSession(null);
    if (event.sessionId) {
      setLoadingSession(true);
      eventsApi.getSession(event.sessionId)
        .then(res => setSession(Array.isArray(res) ? res : (res.data || res.events || [])))
        .catch(() => setSession([]))
        .finally(() => setLoadingSession(false));
    }
  }, [event?._id]);

  if (!event) {
    return (
      <div className="w-[360px] flex-shrink-0 border-l border-white/5 flex flex-col items-center justify-center bg-[#131313]">
        <p className="text-xs text-neutral-700">Click an event to inspect</p>
      </div>
    );
  }

  const sessionEvents = session || [];

  return (
    <div className="w-[360px] flex-shrink-0 border-l border-white/5 flex flex-col bg-[#131313] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <EventTypeBadge type={event.type || event.eventType || "unknown"} />
          <span className="text-xs font-mono text-neutral-500 truncate max-w-[160px]">
            {event._id?.slice(-8) || "—"}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-neutral-600 hover:text-neutral-300 rounded transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 flex-shrink-0">
        {["event", "session", "raw"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-mono transition-colors ${
              tab === t
                ? "text-white border-b-2 border-emerald-500"
                : "text-neutral-600 hover:text-neutral-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === "event" && (
          <div className="flex flex-col gap-4">
            {/* Identity */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                Identity
              </p>
              <div className="flex flex-col gap-1">
                {event.email && (
                  <p className="text-xs font-mono text-neutral-300">{event.email}</p>
                )}
                {event.anonymousId && (
                  <p className="text-xs font-mono text-neutral-500">{event.anonymousId}</p>
                )}
                {event.sessionId && (
                  <p className="text-xs font-mono text-neutral-600 truncate">
                    session: {event.sessionId}
                  </p>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                Timestamp
              </p>
              <p className="text-xs font-mono text-neutral-400">
                {ts(event.createdAt || event.timestamp)}
              </p>
            </div>

            {/* Score delta */}
            {event.scoreDelta != null && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                  Score Delta
                </p>
                <p className={`text-xl font-mono font-semibold ${event.scoreDelta > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {event.scoreDelta > 0 ? "+" : ""}{event.scoreDelta}
                </p>
              </div>
            )}

            {/* Processing status */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                Processing
              </p>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono text-neutral-400">
                  {event.processed ? "processed" : "queued"}
                </span>
              </div>
            </div>

            {/* Properties */}
            {event.properties && Object.keys(event.properties).length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-2">
                  Properties
                </p>
                <div className="flex flex-col gap-1">
                  {Object.entries(event.properties).map(([k, v]) => (
                    <div key={k} className="flex gap-2 text-xs font-mono">
                      <span className="text-neutral-600 flex-shrink-0">{k}:</span>
                      <span className="text-neutral-400 truncate">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "session" && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-3">
              Session ({sessionEvents.length} events)
            </p>
            {loadingSession ? (
              <div className="flex justify-center py-6">
                <Spinner size="sm" />
              </div>
            ) : sessionEvents.length === 0 ? (
              <p className="text-xs text-neutral-700 text-center py-6">
                {event.sessionId ? "No session data" : "No session ID on this event"}
              </p>
            ) : (
              <div className="flex flex-col">
                {sessionEvents.map((e, i) => (
                  <TimelineItem
                    key={e._id || i}
                    evt={e}
                    isFirst={i === sessionEvents.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "raw" && (
          <JsonViewer data={event} collapsed={false} />
        )}
      </div>
    </div>
  );
}
