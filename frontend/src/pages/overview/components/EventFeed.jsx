/**
 * EventFeed — scrollable live event stream for overview page.
 * Log-style lines.
 */

import { useState, useEffect, useRef } from "react";
import { eventsApi } from "../../../features/events/events.api";
import { useSocket } from "../../../app/providers/SocketProvider";

function ts(dateStr) {
  if (!dateStr) return "??:??:??";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour12: false });
}

function identity(evt) {
  if (evt.email) return evt.email;
  if (evt.properties?.email) return evt.properties.email;
  const a = evt.anonymousId;
  if (a) return `anon_${String(a).slice(-6)}`;
  return "anonymous";
}

function shortProp(evt) {
  const p = evt.properties || {};
  return p.page || p.url || p.element || p.form || "";
}

export default function EventFeed() {
  const [events, setEvents] = useState([]);
  const bottomRef = useRef(null);
  const { socket } = useSocket();

  useEffect(() => {
    eventsApi.getRecent(30)
      .then(res => {
        const arr = Array.isArray(res) ? res : (res.data || res.events || []);
        setEvents(arr.slice(0, 30));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (evt) => {
      setEvents(prev => [evt, ...prev.slice(0, 49)]);
    };
    socket.on("event:created", handler);
    socket.on("eventReceived", handler);
    return () => {
      socket.off("event:created", handler);
      socket.off("eventReceived", handler);
    };
  }, [socket]);

  return (
    <div className="flex flex-col h-full overflow-y-auto font-mono text-xs">
      {events.length === 0 ? (
        <p className="text-neutral-700 p-4 text-center">Waiting for events…</p>
      ) : (
        events.map((evt, i) => (
          <div
            key={evt._id || i}
            className="flex items-center gap-3 px-3 py-1 hover:bg-white/[0.02] border-b border-white/[0.02]"
          >
            <span className="text-neutral-600 flex-shrink-0 tabular-nums">
              [{ts(evt.createdAt || evt.timestamp)}]
            </span>
            <span className="text-emerald-400 flex-shrink-0 w-[100px] truncate">
              {evt.type || evt.eventType || "event"}
            </span>
            <span className="text-neutral-500 flex-shrink-0 w-[140px] truncate">
              {identity(evt)}
            </span>
            <span className="text-neutral-700 truncate">{shortProp(evt)}</span>
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}
