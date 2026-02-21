import React, { useState } from "react";
import EventFilters from "./components/EventFilters.jsx";
import EventStream from "./components/EventStream.jsx";
import SessionInspector from "./components/SessionInspector.jsx";

const DEFAULT_FILTERS = { timeRange: "1h" };

export default function EventsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-google-border bg-surface-light dark:bg-surface-dark shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
            Events
          </h1>
          <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
            Real-time event stream from all your sources
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Streaming live
        </span>
      </header>

      {/* Body: filters | stream | inspector */}
      <div className="flex-1 flex overflow-hidden">
        <EventFilters filters={filters} onChange={setFilters} />
        <EventStream
          filters={filters}
          selectedEvent={selectedEvent}
          onSelectEvent={setSelectedEvent}
        />
        {selectedEvent && (
          <SessionInspector
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </div>
    </div>
  );
}
