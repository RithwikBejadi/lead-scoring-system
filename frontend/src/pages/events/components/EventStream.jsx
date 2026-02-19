/**
 * EventStream — center panel. Live scrolling event list.
 * Handles: fetch, infinite scroll, socket push, selected row.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { eventsApi } from "../../../features/events/events.api";
import { Spinner } from "../../../shared/ui/Spinner";
import EventRow from "./EventRow";
import { useSocket } from "../../../app/providers/SocketProvider";

const PAGE_SIZE = 50;

function buildParams(filters) {
  const p = {};
  if (filters.timeRange) p.timeRange = filters.timeRange;
  if (filters.identity) {
    if (filters.identity.includes("@")) p.email = filters.identity;
    else p.anonymousId = filters.identity;
  }
  if (filters.domain) p.domain = filters.domain;
  if (filters.eventTypes?.length) p.eventType = filters.eventTypes.join(",");
  p.limit = PAGE_SIZE;
  return p;
}

export default function EventStream({ filters, selectedEvent, onSelect }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const { socket } = useSocket();

  // Fetch page
  const fetchEvents = useCallback(async (pageNum = 1, replace = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const params = { ...buildParams(filters), page: pageNum };
      const res = await eventsApi.getAll(params);
      const incoming = Array.isArray(res) ? res : (res.data || res.events || []);

      setEvents(prev => replace ? incoming : [...prev, ...incoming]);
      setHasMore(incoming.length === PAGE_SIZE);
      setPage(pageNum);
      setError(null);
    } catch (e) {
      setError(e.message || "Failed to load events");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters]);

  // Refetch on filter change
  useEffect(() => {
    fetchEvents(1, true);
  }, [fetchEvents]);

  // Real-time socket push
  useEffect(() => {
    if (!socket) return;
    const handler = (event) => {
      setEvents(prev => [event, ...prev.slice(0, 499)]);
    };
    socket.on("event:created", handler);
    socket.on("eventReceived", handler);
    return () => {
      socket.off("event:created", handler);
      socket.off("eventReceived", handler);
    };
  }, [socket]);

  // Infinite scroll observer
  useEffect(() => {
    if (!bottomRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          fetchEvents(page + 1);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchEvents]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <p className="text-sm text-neutral-500">{error}</p>
        <button
          onClick={() => fetchEvents(1, true)}
          className="text-xs text-emerald-400 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Column headers */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5 bg-[#131313] flex-shrink-0">
        <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider w-[70px] flex-shrink-0">
          Time
        </span>
        <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider w-[110px] flex-shrink-0">
          Type
        </span>
        <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider w-[180px] flex-shrink-0">
          Identity
        </span>
        <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider flex-1">
          Properties
        </span>
        <span className="text-[10px] font-semibold text-neutral-600 uppercase tracking-wider flex-shrink-0">
          Δ Score
        </span>
      </div>

      {/* Stream */}
      <div className="flex-1 overflow-y-auto">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <p className="text-sm text-neutral-600">No events found</p>
            <p className="text-xs text-neutral-700">
              Try adjusting your filters or send a test event
            </p>
          </div>
        ) : (
          <>
            {events.map((evt, i) => (
              <EventRow
                key={evt._id || evt.id || i}
                event={evt}
                selected={selectedEvent?._id === evt._id}
                onClick={onSelect}
              />
            ))}

            {/* Sentinel for infinite scroll */}
            <div ref={bottomRef} className="py-4 flex justify-center">
              {loadingMore && <Spinner size="sm" />}
              {!hasMore && events.length > 0 && (
                <span className="text-[11px] text-neutral-700">
                  End of results
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/5 bg-[#131313] flex-shrink-0">
        <span className="text-[11px] font-mono text-neutral-600">
          {events.length} events
        </span>
        <button
          onClick={() => fetchEvents(1, true)}
          className="text-[11px] text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
