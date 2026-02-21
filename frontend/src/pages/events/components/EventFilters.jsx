import React from "react";

const EVENT_TYPES = [
  "page_view",
  "click",
  "identify",
  "form_submit",
  "demo_request",
  "pricing_view",
  "signup",
  "login",
  "custom",
];

const TIME_RANGES = [
  { label: "Last 15 min", value: "15m" },
  { label: "Last 1 hour", value: "1h" },
  { label: "Last 24 hours", value: "24h" },
  { label: "Last 7 days", value: "7d" },
];

export default function EventFilters({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <aside className="w-64 shrink-0 border-r border-google-border bg-surface-light dark:bg-surface-dark overflow-y-auto flex flex-col gap-1">
      <div className="px-4 py-3 border-b border-google-border">
        <h3 className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark uppercase tracking-widest">
          Filters
        </h3>
      </div>

      {/* Search by identity */}
      <div className="px-4 py-3 border-b border-google-border space-y-3">
        <div>
          <label className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark block mb-1">
            Email
          </label>
          <input
            type="text"
            placeholder="john@example.com"
            value={filters.email || ""}
            onChange={(e) => set("email", e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded border-none focus:ring-2 focus:ring-primary/50 text-text-primary-light dark:text-text-primary-dark placeholder-slate-400"
          />
        </div>
        <div>
          <label className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark block mb-1">
            Anonymous ID
          </label>
          <input
            type="text"
            placeholder="anon_xxxxxxxx"
            value={filters.anonymousId || ""}
            onChange={(e) => set("anonymousId", e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded border-none focus:ring-2 focus:ring-primary/50 text-text-primary-light dark:text-text-primary-dark placeholder-slate-400"
          />
        </div>
      </div>

      {/* Event type */}
      <div className="px-4 py-3 border-b border-google-border">
        <label className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark block mb-2">
          Event Type
        </label>
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-xs text-text-primary-light dark:text-text-primary-dark cursor-pointer">
            <input
              type="radio"
              name="type"
              value=""
              checked={!filters.eventType}
              onChange={() => set("eventType", "")}
              className="accent-primary"
            />
            All types
          </label>
          {EVENT_TYPES.map((t) => (
            <label
              key={t}
              className="flex items-center gap-2 text-xs cursor-pointer"
            >
              <input
                type="radio"
                name="type"
                value={t}
                checked={filters.eventType === t}
                onChange={() => set("eventType", t)}
                className="accent-primary"
              />
              <span
                className={`text-text-primary-light dark:text-text-primary-dark font-mono ${filters.eventType === t ? "text-primary font-bold" : ""}`}
              >
                {t}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Time range */}
      <div className="px-4 py-3">
        <label className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark block mb-2">
          Time Range
        </label>
        <div className="space-y-1">
          {TIME_RANGES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => set("timeRange", value)}
              className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors
                ${
                  filters.timeRange === value
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear */}
      {(filters.email || filters.anonymousId || filters.eventType) && (
        <div className="px-4 py-3 border-t border-google-border mt-auto">
          <button
            onClick={() => onChange({ timeRange: "1h" })}
            className="w-full text-xs text-primary font-semibold hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </aside>
  );
}
