import React, { useState, useEffect } from "react";
import { eventsApi } from "../../../features/events/events.api.js";
import Badge from "../../../shared/ui/Badge.jsx";
import JsonViewer from "../../../shared/ui/JsonViewer.jsx";
import Spinner from "../../../shared/ui/Spinner.jsx";

const TYPE_VARIANTS = {
  page_view: "default",
  click: "primary",
  identify: "purple",
  form_submit: "success",
  demo_request: "success",
  pricing_view: "warning",
  signup: "success",
  login: "primary",
};
const TYPE_ICONS = {
  page_view: "visibility",
  click: "ads_click",
  identify: "fingerprint",
  form_submit: "assignment_turned_in",
  demo_request: "mail",
  pricing_view: "attach_money",
  signup: "person_add",
  login: "login",
};

function relTime(ts) {
  const d = (Date.now() - new Date(ts)) / 1000;
  if (d < 5) return "just now";
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  return `${Math.floor(d / 3600)}h ago`;
}

function absTime(ts) {
  return ts ? new Date(ts).toLocaleString("en-US", { hour12: false }) : "—";
}

export default function SessionInspector({ event, onClose }) {
  const [timeline, setTimeline] = useState(null);
  const [tlLoading, setTlLoading] = useState(false);
  const [view, setView] = useState("timeline"); // "timeline" | "json"

  useEffect(() => {
    if (!event) {
      setTimeline(null);
      return;
    }
    if (!event.leadId && !event.lead) return;

    let cancelled = false;
    setTlLoading(true);

    eventsApi
      .getSession(event.leadId || event.lead)
      .then((data) => {
        if (!cancelled) setTimeline(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setTlLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [event?.leadId, event?.lead, event?._id]);

  if (!event) return null;

  const allEvents = timeline?.sessions?.flatMap((s) => s.events) || [];

  return (
    <aside className="w-[380px] shrink-0 border-l border-google-border bg-surface-light dark:bg-surface-dark flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-google-border flex items-center justify-between shrink-0">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark">
            Session Inspector
          </span>
          <div className="font-mono text-xs text-text-primary-light dark:text-text-primary-dark mt-0.5 truncate max-w-[260px]">
            {event.event || event.eventType}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <span className="material-icons text-[18px]">close</span>
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-google-border shrink-0">
        {["timeline", "json"].map((t) => (
          <button
            key={t}
            onClick={() => setView(t)}
            className={`flex-1 py-2.5 text-[11px] font-semibold uppercase tracking-widest transition-colors
              ${view === t ? "text-primary border-b-2 border-primary" : "text-text-secondary-light dark:text-text-secondary-dark hover:text-primary"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === "json" ? (
          <div className="p-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark mb-2">
              Raw Event Payload
            </p>
            <JsonViewer data={event} />
          </div>
        ) : (
          <div className="p-5 space-y-6">
            {/* Event metadata */}
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark mb-3">
                Event Details
              </p>
              <div className="space-y-2">
                <MetaRow label="Type">
                  <Badge
                    variant={TYPE_VARIANTS[event.event] || "default"}
                    size="sm"
                  >
                    <span className="material-icons text-[10px]">
                      {TYPE_ICONS[event.event] || "bolt"}
                    </span>
                    {event.event || event.eventType}
                  </Badge>
                </MetaRow>
                <MetaRow label="Timestamp">
                  {absTime(event.timestamp || event.createdAt)}
                </MetaRow>
                {event.email && <MetaRow label="Email">{event.email}</MetaRow>}
                {event.anonymousId && (
                  <MetaRow label="Anon ID">
                    <span className="font-mono text-[11px]">
                      {event.anonymousId}
                    </span>
                  </MetaRow>
                )}
                {event.sessionId && (
                  <MetaRow label="Session">
                    <span className="font-mono text-[11px]">
                      {event.sessionId}
                    </span>
                  </MetaRow>
                )}
                {event.scoreDelta !== undefined && (
                  <MetaRow label="Score Δ">
                    <span
                      className={`font-bold ${event.scoreDelta >= 0 ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {event.scoreDelta >= 0
                        ? `+${event.scoreDelta}`
                        : event.scoreDelta}{" "}
                      pts
                    </span>
                  </MetaRow>
                )}
              </div>
            </section>

            {/* Properties */}
            {event.properties && Object.keys(event.properties).length > 0 && (
              <section>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark mb-2">
                  Properties
                </p>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg divide-y divide-google-border overflow-hidden">
                  {Object.entries(event.properties).map(([k, v]) => (
                    <div key={k} className="flex items-start gap-3 px-3 py-2">
                      <span className="font-mono text-[11px] text-primary shrink-0 w-28 truncate">
                        {k}
                      </span>
                      <span className="text-[11px] text-text-primary-light dark:text-text-primary-dark break-all">
                        {String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Session timeline */}
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark mb-3">
                Session Timeline{" "}
                {allEvents.length > 0 && `(${allEvents.length})`}
              </p>
              {tlLoading ? (
                <div className="flex justify-center py-6">
                  <Spinner />
                </div>
              ) : allEvents.length === 0 ? (
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  No timeline data
                </p>
              ) : (
                <div className="space-y-3 relative before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-px before:bg-google-border">
                  {allEvents.slice(0, 20).map((e, i) => (
                    <div key={i} className="pl-7 relative">
                      <div
                        className={`absolute left-0 top-1 w-[22px] h-[22px] rounded-full flex items-center justify-center ring-2 ring-surface-light dark:ring-surface-dark z-10
                        ${i === 0 ? "bg-primary text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}
                      >
                        <span className="material-icons text-[11px]">
                          {TYPE_ICONS[e.event] || "bolt"}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-text-primary-light dark:text-text-primary-dark">
                            {e.event}
                          </span>
                          <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
                            {relTime(e.timestamp)}
                          </span>
                        </div>
                        {e.delta != null && e.delta !== 0 && (
                          <span
                            className={`text-[10px] font-bold ${e.delta > 0 ? "text-emerald-500" : "text-red-500"}`}
                          >
                            {e.delta > 0 ? `+${e.delta}` : e.delta} pts
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </aside>
  );
}

function MetaRow({ label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark w-24 shrink-0">
        {label}
      </span>
      <span className="text-[11px] text-text-primary-light dark:text-text-primary-dark break-all">
        {children}
      </span>
    </div>
  );
}
