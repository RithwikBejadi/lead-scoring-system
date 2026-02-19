/**
 * EventsPage — core product page.
 * Layout: [Filters 220px] | [EventStream flex-1] | [SessionInspector 360px]
 */

import { useState } from "react";
import EventFilters from "./components/EventFilters";
import EventStream from "./components/EventStream";
import SessionInspector from "./components/SessionInspector";

const DEFAULT_FILTERS = {
  timeRange: "1h",
  eventTypes: [],
  identity: "",
  domain: "",
};

export default function EventsPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedEvent, setSelectedEvent] = useState(null);

  return (
    <div className="flex h-full overflow-hidden">
      <EventFilters filters={filters} onChange={setFilters} />
      <EventStream
        filters={filters}
        selectedEvent={selectedEvent}
        onSelect={setSelectedEvent}
      />
      <SessionInspector
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
