/**
 * LeadTimeline — session-grouped event timeline for lead detail.
 */

import { EventTypeBadge } from "../../../shared/ui/Badge";

function ts(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString();
}

function SessionGroup({ session, events }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-mono font-semibold text-neutral-600 uppercase tracking-wider">
          Session
        </span>
        <code className="text-[10px] font-mono text-neutral-700">
          {session?.slice(-12) || "unknown"}
        </code>
      </div>
      <div className="flex flex-col border-l border-white/5 ml-2 pl-4 gap-2">
        {events.map((e, i) => (
          <div key={e._id || i} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <EventTypeBadge type={e.type || e.eventType || "event"} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-mono text-neutral-400 truncate">
                {e.properties?.page || e.properties?.url || e.properties?.element || ""}
              </p>
              <p className="text-[10px] font-mono text-neutral-700">
                {ts(e.createdAt || e.timestamp)}
                {e.scoreDelta != null && (
                  <span className={`ml-2 ${e.scoreDelta > 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {e.scoreDelta > 0 ? "+" : ""}{e.scoreDelta}
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LeadTimeline({ events = [] }) {
  if (events.length === 0) {
    return <p className="text-xs text-neutral-700 py-4">No events yet</p>;
  }

  // Group by sessionId
  const grouped = {};
  const order = [];
  events.forEach(e => {
    const s = e.sessionId || "no_session";
    if (!grouped[s]) {
      grouped[s] = [];
      order.push(s);
    }
    grouped[s].push(e);
  });

  return (
    <div>
      {order.map(s => (
        <SessionGroup key={s} session={s === "no_session" ? null : s} events={grouped[s]} />
      ))}
    </div>
  );
}
