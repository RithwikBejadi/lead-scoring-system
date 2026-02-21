import React, { useState, useEffect, useRef, useCallback } from "react";
import { eventsApi } from "../../../features/events/events.api.js";
import { initSocket } from "../../../sockets/socket.js";
import { EmptyState } from "../../../shared/ui/Panel.jsx";
import Spinner from "../../../shared/ui/Spinner.jsx";
import EventRow from "./EventRow.jsx";

export default function EventStream({ filters, selectedEvent, onSelectEvent }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(0);
  const bottomRef = useRef(null);
  const autoScrollRef = useRef(true);

  const load = useCallback(async () => {
    try {
      const params = {};
      if (filters.eventType) params.eventType = filters.eventType;
      if (filters.email) params.email = filters.email;
      if (filters.anonymousId) params.anonymousId = filters.anonymousId;
      if (filters.timeRange) params.timeRange = filters.timeRange;
      params.limit = 100;

      const r = await eventsApi.list(params);
      const items = r?.data?.events || r?.data || r?.events || [];
      setEvents(items);
    } catch {
      // silently fail on filter refreshes — keep existing data
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial load + filter changes
  useEffect(() => {
    load();
  }, [load]);

  // Live socket stream — push new events to top
  useEffect(() => {
    let sock;
    try {
      sock = initSocket();
      const handler = (evt) => {
        setEvents((prev) => [evt, ...prev].slice(0, 200));
        setLiveCount((c) => c + 1);
        if (autoScrollRef.current && bottomRef.current) {
          // don't auto-scroll — log goes top-down newest first
        }
      };
      sock.on("eventReceived", handler);
      sock.on("leadUpdated", handler);
      return () => {
        sock.off("eventReceived", handler);
        sock.off("leadUpdated", handler);
      };
    } catch {
      /* socket not connected */
    }
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="md" className="mx-auto mb-3" />
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
            Loading event stream...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Stream header */}
      <div className="px-5 py-2.5 border-b border-google-border flex items-center gap-3 shrink-0 bg-surface-light dark:bg-surface-dark">
        <div className="flex items-center gap-1.5 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Live stream
        </div>
        <span className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
          {events.length} events
        </span>
        {liveCount > 0 && (
          <span className="text-[11px] font-semibold text-primary">
            +{liveCount} new
          </span>
        )}
        <button
          onClick={load}
          className="ml-auto text-[11px] text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors flex items-center gap-1"
        >
          <span className="material-icons text-[14px]">refresh</span>
          Refresh
        </button>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-4 px-5 py-2 border-b border-google-border bg-slate-50 dark:bg-slate-800/50 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark">
        <span className="w-[68px]">Time</span>
        <span className="w-[148px]">Event</span>
        <span className="w-[160px]">Identity</span>
        <span className="flex-1">Context</span>
        <span className="w-12 text-right">Score Δ</span>
        <span className="w-16 text-right">When</span>
        <span className="w-5" />
      </div>

      {/* Event rows */}
      <div className="flex-1 overflow-y-auto">
        {events.length === 0 ? (
          <EmptyState
            icon="bolt"
            title="No events yet"
            description="Send your first event using the SDK or Integrations page"
          />
        ) : (
          events.map((evt, i) => (
            <EventRow
              key={evt._id || evt.id || i}
              event={evt}
              selected={selectedEvent?._id === evt._id}
              onClick={() => onSelectEvent(evt)}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
