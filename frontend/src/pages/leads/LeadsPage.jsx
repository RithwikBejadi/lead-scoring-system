import React, { useState, useEffect, useCallback, useMemo } from "react";
import { leadsApi } from "../../api/leads.api.js";
import { Panel, PanelHeader, EmptyState } from "../../shared/ui/Panel.jsx";
import Badge from "../../shared/ui/Badge.jsx";
import Spinner from "../../shared/ui/Spinner.jsx";
import IntelligenceDrawer from "../../components/leads/IntelligenceDrawer.jsx";

function relTime(ts) {
  if (!ts) return "—";
  const d = (Date.now() - new Date(ts)) / 1000;
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}

function stageFor(score) {
  if (score >= 85) return { label: "Qualified", variant: "primary" };
  if (score >= 70) return { label: "Hot", variant: "warning" };
  if (score >= 40) return { label: "Warm", variant: "default" };
  return { label: "Cold", variant: "default" };
}

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("all");
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState("score"); // "score" | "activity"

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await leadsApi.getAll({ limit: 200 });
      setLeads(r?.data?.leads || r?.data || r?.leads || []);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let res = leads;
    if (query.trim()) {
      const q = query.toLowerCase();
      res = res.filter(
        (l) =>
          (l.name || "").toLowerCase().includes(q) ||
          (l.email || "").toLowerCase().includes(q) ||
          (l.anonymousId || "").toLowerCase().includes(q),
      );
    }
    if (stage !== "all") {
      res = res.filter((l) => {
        const s = l.currentScore || 0;
        if (stage === "qualified") return s >= 85;
        if (stage === "hot") return s >= 70 && s < 85;
        if (stage === "warm") return s >= 40 && s < 70;
        if (stage === "cold") return s < 40;
        return true;
      });
    }
    return [...res].sort((a, b) =>
      sortBy === "score"
        ? (b.currentScore || 0) - (a.currentScore || 0)
        : new Date(b.lastEventAt) - new Date(a.lastEventAt),
    );
  }, [leads, query, stage, sortBy]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-google-border bg-surface-light dark:bg-surface-dark shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
            Leads
          </h1>
          <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
            Identity resolution + scoring results
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-text-secondary-light dark:text-text-secondary-dark">
              search
            </span>
            <input
              type="text"
              placeholder="Search email, name, ID…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-lg border-none focus:ring-2 focus:ring-primary/50 w-56"
            />
          </div>
          <button
            onClick={load}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"
          >
            <span className="material-icons text-[16px]">refresh</span>
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-6 py-2.5 border-b border-google-border bg-surface-light dark:bg-surface-dark shrink-0">
        {["all", "qualified", "hot", "warm", "cold"].map((s) => (
          <button
            key={s}
            onClick={() => setStage(s)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors capitalize ${stage === s ? "bg-primary/10 text-primary" : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-100 dark:hover:bg-slate-800"}`}
          >
            {s}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
          Sort:
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border-none text-[11px] font-semibold text-text-primary-light dark:text-text-primary-dark focus:ring-0 cursor-pointer"
          >
            <option value="score">Score</option>
            <option value="activity">Last Active</option>
          </select>
        </div>
        <span className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
          {filtered.length} leads
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Spinner />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="people"
            title="No leads"
            description="Events must be ingested before leads appear"
          />
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-text-secondary-light dark:text-text-secondary-dark text-[10px] uppercase tracking-widest font-semibold sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3">Identity</th>
                <th className="px-6 py-3">Score</th>
                <th className="px-6 py-3">Stage</th>
                <th className="px-6 py-3">Events</th>
                <th className="px-6 py-3">First Seen</th>
                <th className="px-6 py-3">Last Active</th>
                <th className="px-6 py-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-google-border">
              {filtered.map((lead) => {
                const stage = stageFor(lead.currentScore || 0);
                const name =
                  lead.name ||
                  lead.email ||
                  `anon_${(lead.anonymousId || "").substring(0, 8)}`;
                const initials = name.substring(0, 2).toUpperCase();
                return (
                  <tr
                    key={lead._id}
                    onClick={() => setSelected(lead)}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group transition-colors ${selected?._id === lead._id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[11px] text-slate-500 shrink-0">
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary-light dark:text-text-primary-dark">
                            {name}
                          </p>
                          {lead.email && (
                            <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
                              {lead.email}
                            </p>
                          )}
                        </div>
                        {lead.email && (
                          <span
                            className="material-icons text-[12px] text-primary"
                            title="Identity resolved"
                          >
                            link
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 font-bold text-text-primary-light dark:text-text-primary-dark">
                      {lead.currentScore || 0}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={stage.variant} size="sm">
                        {stage.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-text-secondary-light dark:text-text-secondary-dark">
                      {lead.eventsCount || lead.totalEvents || "—"}
                    </td>
                    <td className="px-6 py-3 text-text-secondary-light dark:text-text-secondary-dark">
                      {relTime(lead.createdAt || lead.firstSeenAt)}
                    </td>
                    <td className="px-6 py-3 text-text-secondary-light dark:text-text-secondary-dark">
                      {relTime(lead.lastEventAt)}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="material-icons text-slate-300 dark:text-slate-700 text-sm group-hover:text-primary transition-colors">
                        chevron_right
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Intelligence Drawer (reuse existing) */}
      <IntelligenceDrawer
        open={!!selected}
        lead={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
