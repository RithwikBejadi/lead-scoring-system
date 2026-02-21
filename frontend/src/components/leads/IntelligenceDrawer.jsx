import React, { useState, useEffect } from "react";
import { leadsApi } from "../../api/leads.api";

const EVENT_ICONS = {
  page_view: "visibility",
  demo_request: "mail",
  pricing_view: "attach_money",
  signup: "person_add",
  login: "login",
  identity_resolved: "fingerprint",
  click: "ads_click",
  form_submit: "assignment_turned_in",
  default: "bolt",
};

const getEventIcon = (eventType = "") => {
  const key = eventType.toLowerCase();
  return EVENT_ICONS[key] || EVENT_ICONS.default;
};

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const getInitials = (lead) => {
  if (lead?.name) {
    const parts = lead.name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return lead.name.substring(0, 2).toUpperCase();
  }
  if (lead?.email) return lead.email.substring(0, 2).toUpperCase();
  return "??";
};

const getStageLabel = (score) => {
  if (score >= 85)
    return { label: "Qualified", color: "bg-indigo-600 text-white" };
  if (score >= 70) return { label: "Hot", color: "bg-primary text-white" };
  if (score >= 40) return { label: "Warm", color: "bg-blue-100 text-blue-700" };
  return { label: "Cold", color: "bg-slate-100 text-slate-500" };
};

const IntelligenceDrawer = ({ open, lead, onClose }) => {
  const [timeline, setTimeline] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    if (!open || !lead?._id) {
      setTimeline(null);
      return;
    }
    let cancelled = false;
    setTimelineLoading(true);

    leadsApi
      .getTimeline(lead._id)
      .then((data) => {
        if (!cancelled) setTimeline(data);
      })
      .catch((err) => {
        console.error("Failed to load timeline:", err);
      })
      .finally(() => {
        if (!cancelled) setTimelineLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lead?._id, open]);

  const handleRecalculate = async () => {
    if (!lead?._id) return;
    setRecalculating(true);
    try {
      // Re-fetch the timeline which reflects the latest score state
      const data = await leadsApi.getTimeline(lead._id);
      setTimeline(data);
      alert(
        `Score for ${lead.name || lead.email || "this lead"} is: ${lead.currentScore}`,
      );
    } catch (err) {
      console.error(err);
    } finally {
      setRecalculating(false);
    }
  };

  if (!open || !lead) return null;

  const score = lead.currentScore || 0;
  const stageConfig = getStageLabel(score);
  const initials = getInitials(lead);

  // Flatten all events from timeline sessions
  const events = timeline?.sessions
    ? timeline.sessions
        .flatMap((s) => s.events)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    : [];

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] border-l border-border-light dark:border-slate-800 bg-surface-light dark:bg-surface-dark flex flex-col z-50 shadow-xl">
      {/* Drawer Header */}
      <div className="p-6 border-b border-border-light dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-widest">
            Lead Intelligence Profile
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <span className="material-icons text-lg">close</span>
          </button>
        </div>

        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xl text-slate-500 dark:text-slate-300 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark leading-tight truncate">
              {lead.name ||
                lead.email ||
                `Anonymous (${(lead.anonymousId || "").substring(0, 8)})`}
            </h2>
            {lead.email && (
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-2 truncate">
                {lead.email}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-1">
              {/* Score badge */}
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${stageConfig.color}`}
              >
                {stageConfig.label} · {score}
              </span>
              {lead.company && (
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded text-slate-600 dark:text-slate-300 font-medium">
                  {lead.company}
                </span>
              )}
              {lead.velocityScore > 0 && (
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] rounded text-slate-600 dark:text-slate-300 font-medium">
                  Velocity: {(lead.velocityScore / 10).toFixed(1)}/10
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Quick stats */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
              {timeline?.totalEvents ?? "—"}
            </div>
            <div className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
              Total Events
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
              {timeline?.sessions?.length ?? "—"}
            </div>
            <div className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
              Sessions
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
              {score}
            </div>
            <div className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
              Current Score
            </div>
          </div>
        </section>

        {/* Activity Timeline */}
        <section>
          <h3 className="text-sm font-bold mb-4 text-text-primary-light dark:text-text-primary-dark flex items-center justify-between">
            Activity Timeline
            <span className="text-[10px] text-primary font-bold">
              {events.length > 0 ? `${events.length} EVENTS` : ""}
            </span>
          </h3>

          {timelineLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="material-icons animate-spin text-text-secondary-light mr-2">
                sync
              </span>
              <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Loading timeline...
              </span>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-text-secondary-light dark:text-text-secondary-dark text-sm">
              <span className="material-icons text-3xl mb-2 block">
                history
              </span>
              No events recorded yet
            </div>
          ) : (
            <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
              {events.slice(0, 15).map((evt, idx) => (
                <div key={idx} className="relative pl-8">
                  <div
                    className={`absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 z-10 ${
                      idx === 0
                        ? "bg-primary text-white"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <span className="material-icons text-xs">
                      {getEventIcon(evt.event)}
                    </span>
                  </div>
                  <div className="text-xs">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-text-primary-light dark:text-text-primary-dark font-mono">
                        {evt.event}
                      </span>
                      <span className="text-slate-400 ml-2 shrink-0">
                        {formatTime(evt.timestamp)}
                      </span>
                    </div>
                    {evt.delta !== 0 && (
                      <span
                        className={`inline-block mt-1 text-[10px] font-bold ${evt.delta > 0 ? "text-green-600" : "text-red-500"}`}
                      >
                        {evt.delta > 0 ? `+${evt.delta}` : evt.delta} pts
                      </span>
                    )}
                    {evt.properties &&
                      Object.keys(evt.properties).length > 0 && (
                        <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1 truncate">
                          {Object.entries(evt.properties)
                            .slice(0, 2)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ")}
                        </p>
                      )}
                  </div>
                </div>
              ))}
              {events.length > 15 && (
                <p className="text-xs text-center text-text-secondary-light dark:text-text-secondary-dark pt-2">
                  +{events.length - 15} more events
                </p>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Drawer Footer Actions */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-border-light dark:border-slate-800 flex flex-col gap-2">
        <button
          onClick={handleRecalculate}
          disabled={recalculating}
          className="w-full py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span
            className={`material-icons text-sm ${recalculating ? "animate-spin" : ""}`}
          >
            {recalculating ? "sync" : "refresh"}
          </span>
          {recalculating ? "Re-fetching..." : "Refresh Timeline"}
        </button>
        <button
          onClick={() => {
            if (lead.email) {
              window.open(`mailto:${lead.email}`, "_blank");
            }
          }}
          disabled={!lead.email}
          className="w-full py-2.5 bg-surface-light dark:bg-slate-900 border border-border-light dark:border-slate-700 text-text-primary-light dark:text-text-primary-dark text-sm font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="material-icons text-sm">mail</span>
          {lead.email ? "Email Lead" : "No Email on Record"}
        </button>
      </div>
    </div>
  );
};

export default IntelligenceDrawer;
