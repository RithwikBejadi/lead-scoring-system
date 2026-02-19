/**
 * EventFilters — left panel filter controls.
 * Outputs changes via onFilterChange(filters).
 * No data fetching inside.
 */

import { useState } from "react";

const TIME_OPTIONS = [
  { label: "Last 15m", value: "15m" },
  { label: "Last 1h", value: "1h" },
  { label: "Last 6h", value: "6h" },
  { label: "Last 24h", value: "24h" },
  { label: "Last 7d", value: "7d" },
];

const EVENT_TYPES = [
  "page_view",
  "click",
  "identify",
  "form_submit",
  "signup",
  "purchase",
  "session_start",
  "session_end",
  "error",
];

function label_cls(active) {
  return `cursor-pointer px-2.5 py-1 rounded text-xs font-mono transition-colors ${
    active ? "bg-emerald-500/20 text-emerald-400 border border-emerald-700" : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
  }`;
}

export default function EventFilters({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  const toggleType = (t) => {
    const types = filters.eventTypes || [];
    const next = types.includes(t) ? types.filter(x => x !== t) : [...types, t];
    set("eventTypes", next);
  };

  return (
    <aside className="w-[220px] flex-shrink-0 border-r border-white/5 flex flex-col overflow-y-auto bg-[#131313]">
      <div className="px-4 py-3 border-b border-white/5">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
          Filters
        </h2>
      </div>

      <div className="flex flex-col gap-5 p-4">

        {/* Time range */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-2">
            Time Range
          </p>
          <div className="flex flex-col gap-1">
            {TIME_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => set("timeRange", o.value)}
                className={label_cls(filters.timeRange === o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Event types */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-2">
            Event Type
          </p>
          <div className="flex flex-wrap gap-1">
            {EVENT_TYPES.map(t => (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className={label_cls((filters.eventTypes || []).includes(t))}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Identity */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-2">
            Identity
          </p>
          <input
            type="text"
            placeholder="email or anonymousId"
            value={filters.identity || ""}
            onChange={e => set("identity", e.target.value)}
            className="w-full bg-[#0d0d0d] border border-white/5 rounded px-2.5 py-1.5 text-xs font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-white/20"
          />
        </div>

        {/* Domain */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-2">
            Domain
          </p>
          <input
            type="text"
            placeholder="app.yoursite.com"
            value={filters.domain || ""}
            onChange={e => set("domain", e.target.value)}
            className="w-full bg-[#0d0d0d] border border-white/5 rounded px-2.5 py-1.5 text-xs font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-white/20"
          />
        </div>

        {/* Reset */}
        <button
          onClick={() => onChange({ timeRange: "1h" })}
          className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors text-left"
        >
          Clear filters
        </button>
      </div>
    </aside>
  );
}
