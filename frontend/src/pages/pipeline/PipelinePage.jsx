/**
 * PipelinePage — Kanban-style stage board.
 * Shows leads grouped by stage: Cold | Warm | Hot | Qualified
 */

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/AppStore.jsx";
import Badge from "../../shared/ui/Badge.jsx";
import Spinner from "../../shared/ui/Spinner.jsx";

// ─── helpers ──────────────────────────────────────────────────────────────────

function relTime(ts) {
  if (!ts) return "—";
  const d = (Date.now() - new Date(ts)) / 1000;
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
  if (v > 60) return { label: "High", icon: "trending_up", color: "text-emerald-500" };
  if (v > 30) return { label: "Med", icon: "trending_flat", color: "text-amber-500" };
  return { label: "Low", icon: "trending_down", color: "text-slate-400" };
}

// ─── Lead Card — memoized so socket updates only re-render changed cards ───────

const LeadCard = React.memo(function LeadCard({ lead, navigate }) {
  const score = lead.currentScore || 0;
  const vel = velocityLabel(lead);
  const lastSeen = relTime(lead.lastEventAt);

  return (
    <div
      onClick={() => navigate(`/leads/${lead._id}`)}
      className="group cursor-pointer rounded-lg border border-google-border bg-surface-light dark:bg-surface-dark p-3 hover:border-primary/40 hover:shadow-sm transition-all"
    >
      {/* Name + score */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-text-primary-light dark:text-text-primary-dark truncate group-hover:text-primary transition-colors">
            {lead.name || lead.email || lead.anonymousId?.substring(0, 16) || "Anonymous"}
          </p>
          {lead.email && lead.name && (
            <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark truncate mt-0.5">
              {lead.email}
            </p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <span className="font-mono text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
            {score}
          </span>
        </div>
      </div>

      {/* Velocity + trend + last seen */}
      <div className="flex items-center gap-2 text-[10px]">
        <span className={`flex items-center gap-0.5 ${vel.color}`}>
          <span className="material-icons text-[12px]">{vel.icon}</span>
          {vel.label}
        </span>
        <span className="text-text-secondary-light dark:text-text-secondary-dark">·</span>
        <span className="text-text-secondary-light dark:text-text-secondary-dark">
          {lastSeen}
        </span>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/leads/${lead._id}`); }}
          className="flex-1 text-[10px] font-semibold text-primary border border-primary/30 rounded py-1 hover:bg-primary/5 transition-colors"
        >
          View Detail
        </button>
      </div>
    </div>
  );
});  // React.memo: avoids re-render unless this lead's data changed

// ─── Stage Column ────────────────────────────────────────────────────────────

const STAGES = [
  {
    key: "Cold",
    label: "Cold",
    icon: "ac_unit",
    color: "text-slate-400",
    headerBg: "bg-slate-50 dark:bg-slate-900/60",
    borderColor: "border-slate-200 dark:border-slate-700",
    badge: "default",
    range: [0, 39],
  },
  {
    key: "Warm",
    label: "Warm",
    icon: "wb_sunny",
    color: "text-amber-500",
    headerBg: "bg-amber-50 dark:bg-amber-900/10",
    borderColor: "border-amber-200 dark:border-amber-800/40",
    badge: "warning",
    range: [40, 69],
  },
  {
    key: "Hot",
    label: "Hot",
    icon: "local_fire_department",
    color: "text-orange-500",
    headerBg: "bg-orange-50 dark:bg-orange-900/10",
    borderColor: "border-orange-200 dark:border-orange-800/40",
    badge: "warning",
    range: [70, 84],
  },
  {
    key: "Qualified",
    label: "Qualified",
    icon: "verified",
    color: "text-emerald-500",
    headerBg: "bg-emerald-50 dark:bg-emerald-900/10",
    borderColor: "border-emerald-200 dark:border-emerald-800/40",
    badge: "success",
    range: [85, 100],
  },
];

function StageColumn({ stage, leads, navigate }) {
  return (
    <div className={`flex flex-col rounded-xl border ${stage.borderColor} overflow-hidden`}>
      {/* Header */}
      <div className={`${stage.headerBg} px-4 py-3 flex items-center gap-2 shrink-0`}>
        <span className={`material-icons text-[16px] ${stage.color}`}>
          {stage.icon}
        </span>
        <span className={`text-xs font-bold uppercase tracking-wide ${stage.color}`}>
          {stage.label}
        </span>
        <Badge variant={stage.badge} size="xs" className="ml-auto">
          {leads.length}
        </Badge>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-background-light dark:bg-background-dark">
        {leads.length === 0 && (
          <div className="text-center py-10 text-xs text-text-secondary-light dark:text-text-secondary-dark">
            No leads in this stage
          </div>
        )}
        {leads.map((lead) => (
          <LeadCard key={lead._id} lead={lead} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function PipelinePage() {
  const navigate = useNavigate();
  const { state } = useAppStore();
  const { leads: leadsStore, pipeline, ui } = state;

  const [search, setSearch] = useState("");

  // ── Re-hydrate is handled by AppStore; pipeline updates come via socket ──
  const loading = !ui.hydrated;

  // Build per-stage lead arrays from normalized store
  // store.pipeline uses lowercase keys; STAGES uses title-case keys
  const byStage = useMemo(() => {
    const stageMap = { Cold: "cold", Warm: "warm", Hot: "hot", Qualified: "qualified" };
    const q = search.trim().toLowerCase();
    const map = {};

    STAGES.forEach((s) => {
      const storeKey = stageMap[s.key];
      const ids = pipeline[storeKey] ?? [];
      let leads = ids.map((id) => leadsStore.byId[id]).filter(Boolean);

      if (q) {
        leads = leads.filter(
          (l) =>
            (l.name ?? "").toLowerCase().includes(q) ||
            (l.email ?? "").toLowerCase().includes(q),
        );
      }

      // Sort by score descending within each stage
      leads.sort((a, b) => (b.currentScore ?? 0) - (a.currentScore ?? 0));
      map[s.key] = leads;
    });

    return map;
  }, [pipeline, leadsStore.byId, search]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-google-border bg-surface-light dark:bg-surface-dark shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
            Pipeline
          </h1>
          <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
            Lead stages · {leadsStore.allIds.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-text-secondary-light dark:text-text-secondary-dark">
              search
            </span>
            <input
              type="text"
              placeholder="Filter leads…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg border-none focus:ring-2 focus:ring-primary/50 w-48"
            />
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1 px-3 py-1.5 text-[11px] text-text-secondary-light dark:text-text-secondary-dark hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <span className="material-icons text-[14px]">refresh</span>
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden p-5">
          <div className="grid grid-cols-4 gap-4 h-full">
            {STAGES.map((stage) => (
              <StageColumn
                key={stage.key}
                stage={stage}
                leads={byStage[stage.key] || []}
                navigate={navigate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
