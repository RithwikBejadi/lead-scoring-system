/**
 * EventRow — single row in the event stream.
 * Click to select and open session inspector.
 */

import { EventTypeBadge } from "../../../shared/ui/Badge";

function ts(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function identity(event) {
  if (event.email) return event.email;
  if (event.properties?.email) return event.properties.email;
  if (event.anonymousId) return event.anonymousId;
  if (event.leadId?.email) return event.leadId.email;
  return "anonymous";
}

function shortProp(event) {
  const p = event.properties || {};
  if (p.page) return p.page;
  if (p.url) return p.url;
  if (p.element) return p.element;
  if (p.form) return p.form;
  const keys = Object.keys(p);
  if (keys.length === 0) return "";
  return `${keys[0]}=${String(p[keys[0]]).slice(0, 24)}`;
}

export default function EventRow({ event, selected, onClick }) {
  return (
    <div
      onClick={() => onClick(event)}
      className={`group flex items-center gap-3 px-4 py-2 border-b border-white/[0.03] cursor-pointer transition-colors hover:bg-white/[0.03] ${
        selected ? "bg-white/[0.05] border-l-2 border-l-emerald-500" : "border-l-2 border-l-transparent"
      }`}
    >
      {/* Timestamp */}
      <span className="text-[11px] font-mono text-neutral-600 w-[70px] flex-shrink-0 tabular-nums">
        {ts(event.createdAt || event.timestamp)}
      </span>

      {/* Event type */}
      <div className="w-[110px] flex-shrink-0">
        <EventTypeBadge type={event.type || event.eventType || "unknown"} />
      </div>

      {/* Identity */}
      <span className="text-[11px] font-mono text-neutral-400 w-[180px] flex-shrink-0 truncate">
        {identity(event)}
      </span>

      {/* Short property */}
      <span className="text-[11px] font-mono text-neutral-600 flex-1 truncate">
        {shortProp(event)}
      </span>

      {/* Score delta */}
      {(event.scoreDelta != null || event.score_delta != null) && (
        <span
          className={`text-[11px] font-mono flex-shrink-0 tabular-nums ${
            (event.scoreDelta || event.score_delta) > 0
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          {(event.scoreDelta || event.score_delta) > 0 ? "+" : ""}
          {event.scoreDelta ?? event.score_delta}
        </span>
      )}
    </div>
  );
}
