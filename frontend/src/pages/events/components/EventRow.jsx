import React from "react";
import Badge from "../../../shared/ui/Badge.jsx";

const TYPE_VARIANTS = {
  page_view: "default",
  click: "primary",
  identify: "purple",
  form_submit: "success",
  demo_request: "success",
  pricing_view: "warning",
  signup: "success",
  login: "primary",
  custom: "default",
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

function relativeTime(ts) {
  if (!ts) return "";
  const d = (Date.now() - new Date(ts)) / 1000;
  if (d < 5) return "just now";
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  return `${Math.floor(d / 3600)}h ago`;
}

function absTime(ts) {
  return ts ? new Date(ts).toLocaleTimeString("en-US", { hour12: false }) : "";
}

export default function EventRow({ event, selected, onClick }) {
  const variant = TYPE_VARIANTS[event.event] || "default";
  const icon = TYPE_ICONS[event.event] || "bolt";

  const identity = event.email || event.anonymousId?.substring(0, 12) || "—";
  const page =
    event.properties?.page ||
    event.properties?.url ||
    event.properties?.path ||
    "";

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 px-5 py-3 cursor-pointer border-b border-google-border text-xs transition-colors group
        ${
          selected
            ? "bg-primary/5 border-l-2 border-l-primary"
            : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-2 border-l-transparent"
        }`}
    >
      {/* Timestamp */}
      <span className="font-mono text-text-secondary-light dark:text-text-secondary-dark shrink-0 w-[68px]">
        {absTime(event.timestamp || event.createdAt)}
      </span>

      {/* Event type badge */}
      <div className="w-[148px] shrink-0">
        <Badge variant={variant} size="sm">
          <span className="material-icons text-[10px]">{icon}</span>
          {event.event || event.eventType || "unknown"}
        </Badge>
      </div>

      {/* Identity */}
      <span className="font-mono text-text-primary-light dark:text-text-primary-dark truncate w-[160px] shrink-0">
        {identity}
        {event.email && (
          <span className="ml-1 text-blue-500" title="Identity resolved">
            <span className="material-icons text-[10px]">link</span>
          </span>
        )}
      </span>

      {/* Page / context */}
      <span className="text-text-secondary-light dark:text-text-secondary-dark truncate flex-1">
        {page}
      </span>

      {/* Score delta */}
      {event.scoreDelta !== undefined && event.scoreDelta !== 0 && (
        <span
          className={`font-bold shrink-0 ${event.scoreDelta > 0 ? "text-emerald-500" : "text-red-500"}`}
        >
          {event.scoreDelta > 0 ? `+${event.scoreDelta}` : event.scoreDelta}
        </span>
      )}

      {/* Relative time */}
      <span className="text-text-secondary-light dark:text-text-secondary-dark shrink-0 ml-auto">
        {relativeTime(event.timestamp || event.createdAt)}
      </span>

      <span className="material-icons text-slate-300 dark:text-slate-700 text-sm shrink-0 group-hover:text-primary transition-colors">
        chevron_right
      </span>
    </div>
  );
}
