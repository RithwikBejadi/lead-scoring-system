/**
 * CommandCenterPage — live operational view replacing Overview.
 * Layout: Left (Live Feed) | Center (Action Required) | Right (Pipeline Snapshot)
 *
 * Reads leads + activity from the normalized AppStore (no duplicate fetches).
 * Socket is owned by StoreSocketBridge in AppShell.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../shared/api/axios.js";
import { useAppStore } from "../../store/AppStore.jsx";
import Badge from "../../shared/ui/Badge.jsx";
import Spinner from "../../shared/ui/Spinner.jsx";

// ─── helpers ──────────────────────────────────────────────────────────────────

function relTime(ts) {
  if (!ts) return "—";
  const d = (Date.now() - new Date(ts)) / 1000;
  if (d < 5) return "just now";
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

function stageFor(score) {
  if (score >= 85) return "Qualified";
  if (score >= 70) return "Hot";
  if (score >= 40) return "Warm";
  return "Cold";
}

function velocityLabel(lead) {
  const v = lead.velocity || lead.velocityScore || 0;
  if (v > 60) return "High";
  if (v > 30) return "Medium";
  return "Low";
}

function daysSince(ts) {
  if (!ts) return Infinity;
  return (Date.now() - new Date(ts)) / 86400000;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

/**
 * LEFT — Live Activity Feed (real-time socket stream grouped by lead)
 */
function LiveFeed({ entries }) {
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <h2 className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark uppercase tracking-wider">
          Live Activity
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
        {entries.length === 0 && (
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-8 text-center">
            Waiting for events…
          </p>
        )}
        {entries.map((e, i) => (
          <div
            key={i}
            className="rounded-lg bg-surface-light dark:bg-surface-dark border border-google-border p-3 space-y-0.5"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark truncate">
                {e.name}
              </span>
              <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark shrink-0">
                {e.time}
              </span>
            </div>
            {e.lines.map((l, j) => (
              <p key={j} className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark pl-1">
                → {l}
              </p>
            ))}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

/**
 * CENTER — Heating Up panel
 */
function HeatingUpPanel({ leads, navigate }) {
  const hot = [...leads]
    .filter((l) => (l.currentScore || 0) >= 40)
    .sort((a, b) => (b.scoreVelocity || b.velocityScore || 0) - (a.scoreVelocity || a.velocityScore || 0))
    .slice(0, 5);

  if (hot.length === 0)
    return (
      <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark py-4 text-center">
        No active leads yet
      </div>
    );

  return (
    <div className="space-y-2">
      {hot.map((lead) => {
        const score = lead.currentScore || 0;
        const prev = Math.max(0, score - Math.round((lead.scoreVelocity || lead.velocityScore || 0) * 0.8));
        const delta = score - prev;
        const stage = stageFor(score);

        return (
          <button
            key={lead._id}
            onClick={() => navigate(`/leads/${lead._id}`)}
            className="w-full text-left rounded-lg border border-google-border bg-surface-light dark:bg-surface-dark hover:border-primary/40 transition-colors p-3 group"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark truncate group-hover:text-primary transition-colors">
                {lead.name || lead.email || lead.anonymousId}
              </span>
              <Badge variant={stage === "Qualified" ? "primary" : stage === "Hot" ? "warning" : "default"} size="xs">
                {stage}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-[11px]">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Score{" "}
                <span className="font-mono font-bold text-text-primary-light dark:text-text-primary-dark">
                  {prev} → {score}
                </span>
                {delta > 0 && (
                  <span className="text-emerald-500 font-bold ml-1">
                    (+{delta})
                  </span>
                )}
              </span>
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Velocity:{" "}
                <span className={
                  velocityLabel(lead) === "High"
                    ? "text-emerald-500 font-semibold"
                    : velocityLabel(lead) === "Medium"
                    ? "text-amber-500 font-semibold"
                    : "text-text-secondary-light dark:text-text-secondary-dark"
                }>
                  {velocityLabel(lead)}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
                {relTime(lead.lastEventAt)}
              </span>
              <span className="ml-auto text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Call now →
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/**
 * CENTER — Newly Qualified panel
 */
function NewlyQualifiedPanel({ leads, navigate }) {
  const qualified = leads
    .filter((l) => (l.currentScore || 0) >= 85)
    .sort((a, b) => new Date(b.lastEventAt) - new Date(a.lastEventAt))
    .slice(0, 5);

  return (
    <div className="space-y-1.5">
      {qualified.length === 0 ? (
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark py-2 text-center">
          No qualified leads yet
        </p>
      ) : (
        <>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-2">
            {qualified.length} lead{qualified.length !== 1 ? "s" : ""} crossed qualified threshold
          </p>
          {qualified.map((lead) => (
            <button
              key={lead._id}
              onClick={() => navigate(`/leads/${lead._id}`)}
              className="w-full text-left flex items-center justify-between gap-2 py-1.5 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <span className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark truncate group-hover:text-primary">
                {lead.name || lead.email || lead.anonymousId}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-xs font-bold text-emerald-500">
                  {lead.currentScore}
                </span>
                <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
                  {relTime(lead.lastEventAt)}
                </span>
              </div>
            </button>
          ))}
        </>
      )}
    </div>
  );
}

/**
 * CENTER — Going Cold panel
 */
function GoingColdPanel({ leads, navigate }) {
  const cold = leads
    .filter((l) => daysSince(l.lastEventAt) >= 7)
    .sort((a, b) => daysSince(b.lastEventAt) - daysSince(a.lastEventAt))
    .slice(0, 5);

  return (
    <div className="space-y-1.5">
      {cold.length === 0 ? (
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark py-2 text-center">
          All leads are active
        </p>
      ) : (
        <>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-2">
            {cold.length} lead{cold.length !== 1 ? "s" : ""} inactive &gt; 7 days
          </p>
          {cold.map((lead) => (
            <button
              key={lead._id}
              onClick={() => navigate(`/leads/${lead._id}`)}
              className="w-full text-left flex items-center justify-between gap-2 py-1.5 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
            >
              <span className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark truncate group-hover:text-primary">
                {lead.name || lead.email || lead.anonymousId}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-amber-500 font-semibold">
                  {Math.round(daysSince(lead.lastEventAt))}d inactive
                </span>
              </div>
            </button>
          ))}
        </>
      )}
    </div>
  );
}

/**
 * Collapsible action panel card
 */
function ActionCard({ icon, title, accent, badge, badgeVariant, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-lg border border-google-border bg-surface-light dark:bg-surface-dark overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 border-b border-google-border hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
      >
        <span className={`material-icons text-[16px] ${accent}`}>{icon}</span>
        <span className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark flex-1 text-left">
          {title}
        </span>
        {badge != null && (
          <Badge variant={badgeVariant || "default"} size="xs">
            {badge}
          </Badge>
        )}
        <span className="material-icons text-[14px] text-text-secondary-light dark:text-text-secondary-dark">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

/**
 * RIGHT — Pipeline Snapshot
 */
function PipelineSnapshot({ leads }) {
  const counts = { Cold: 0, Warm: 0, Hot: 0, Qualified: 0 };
  leads.forEach((l) => {
    const s = stageFor(l.currentScore || 0);
    counts[s] = (counts[s] || 0) + 1;
  });

  const stages = [
    { label: "Cold", key: "Cold", color: "text-slate-400", bar: "bg-slate-400" },
    { label: "Warm", key: "Warm", color: "text-amber-400", bar: "bg-amber-400" },
    { label: "Hot", key: "Hot", color: "text-orange-500", bar: "bg-orange-500" },
    { label: "Qualified", key: "Qualified", color: "text-emerald-500", bar: "bg-emerald-500" },
  ];

  const total = leads.length || 1;

  return (
    <div className="space-y-3">
      {stages.map(({ label, key, color, bar }) => {
        const count = counts[key] || 0;
        const pct = Math.round((count / total) * 100);
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-semibold ${color} uppercase tracking-wide`}>
                {label}
              </span>
              <span className="font-mono text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
                {count}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`${bar} h-full rounded-full transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}

      <div className="pt-3 border-t border-google-border">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
            Total leads
          </span>
          <span className="font-mono text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
            {leads.length}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
            Conversion rate
          </span>
          <span className="font-mono text-sm font-bold text-emerald-500">
            {total > 0 ? Math.round((counts.Qualified / total) * 100) : 0}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function CommandCenterPage() {
  const navigate = useNavigate();
  const { state } = useAppStore();
  const { leads: leadsStore, metrics, activity, ui } = state;

  const [project, setProject] = useState(null);

  // ── Derive leads array from normalized store (O(n) but memoized) ──
  const leads = useMemo(
    () => leadsStore.allIds.map((id) => leadsStore.byId[id]).filter(Boolean),
    [leadsStore],
  );

  // ── Derive live feed entries from store's activity feed (newest-first) ──
  const feedEntries = useMemo(() => {
    const entries = [];
    const now = Date.now();

    // Work through activity IDs (newest first from store, reverse for display)
    [...activity.feedIds].reverse().slice(-60).forEach((id) => {
      const evt = activity.byId[id];
      if (!evt) return;
      const name =
        evt.name || evt.email || evt.anonymousId?.substring(0, 12) || "Anonymous";
      const ts = new Date(evt.timestamp || evt.createdAt || now).getTime();
      const eventLine =
        (evt.event || evt.eventType || "event") +
        (evt.properties?.page ? `  ${evt.properties.page}` : "");

      const last = entries[entries.length - 1];
      if (last?.name === name && ts - (last._ts || 0) < 30_000) {
        last.lines.push(eventLine);
        last._ts = Math.max(last._ts, ts);
      } else {
        entries.push({
          name,
          time: new Date(ts).toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          lines: [eventLine],
          _ts: ts,
        });
      }
    });

    return entries;
  }, [activity]);

  // Fetch project details once (lightweight, not in store)
  useEffect(() => {
    api
      .get("/auth/project")
      .then((r) => { if (r.data?.success) setProject(r.data.data.project); })
      .catch(() => {});
  }, []);

  const loading = !ui.hydrated;

  // These filters are O(n) but memoized; store metrics also has these IDs
  const hotLeads = useMemo(
    () => leads.filter((l) => (l.currentScore ?? 0) >= 70),
    [leads],
  );
  const qualifiedLeads = useMemo(
    () => leads.filter((l) => (l.currentScore ?? 0) >= 85),
    [leads],
  );
  const coldLeads = useMemo(
    () => leads.filter((l) => daysSince(l.lastEventAt) >= 7),
    [leads],
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-google-border bg-surface-light dark:bg-surface-dark shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
            {project?.name ? `${project.name} — Command Center` : "Command Center"}
          </h1>
          <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
            Live operational view · {leads.length} leads tracked
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-text-secondary-light dark:text-text-secondary-dark hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
        >
          <span className="material-icons text-[14px]">refresh</span>
          Refresh
        </button>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden grid grid-cols-[280px_1fr_260px] divide-x divide-google-border">
          {/* LEFT — Live Feed */}
          <div className="overflow-y-auto p-4">
            <LiveFeed entries={feedEntries} />
          </div>

          {/* CENTER — Action Required */}
          <div className="overflow-y-auto p-5 space-y-4">
            <h2 className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-1">
              Action Required
            </h2>

            <ActionCard
              icon="local_fire_department"
              title="Leads heating up now"
              accent="text-orange-500"
              badge={hotLeads.length}
              badgeVariant="warning"
            >
              <HeatingUpPanel leads={leads} navigate={navigate} />
            </ActionCard>

            <ActionCard
              icon="rocket_launch"
              title="Newly qualified"
              accent="text-emerald-500"
              badge={qualifiedLeads.length}
              badgeVariant="success"
            >
              <NewlyQualifiedPanel leads={leads} navigate={navigate} />
            </ActionCard>

            <ActionCard
              icon="ac_unit"
              title="Going cold"
              accent="text-slate-400"
              badge={coldLeads.length > 0 ? coldLeads.length : undefined}
              badgeVariant="default"
            >
              <GoingColdPanel leads={leads} navigate={navigate} />
            </ActionCard>
          </div>

          {/* RIGHT — Pipeline Snapshot */}
          <div className="overflow-y-auto p-4">
            <h2 className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider mb-4">
              Pipeline Snapshot
            </h2>
            <PipelineSnapshot leads={leads} />

            <div className="mt-6 pt-4 border-t border-google-border">
              <button
                onClick={() => navigate("/pipeline")}
                className="w-full py-2 text-xs font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
              >
                View full pipeline →
              </button>
            </div>

            <div className="mt-4">
              <button
                onClick={() => navigate("/leads")}
                className="w-full py-2 text-xs text-text-secondary-light dark:text-text-secondary-dark border border-google-border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                All leads →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
