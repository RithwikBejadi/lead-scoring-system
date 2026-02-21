import React, { useState, useEffect, useCallback } from "react";
import { analyticsApi } from "../../api/analytics.api.js";
import { Panel, PanelHeader } from "../../shared/ui/Panel.jsx";
import Spinner from "../../shared/ui/Spinner.jsx";
import api from "../../shared/api/axios.js";
import { initSocket } from "../../sockets/socket.js";

function relTime(ts) {
  if (!ts) return "—";
  const d = (Date.now() - new Date(ts)) / 1000;
  if (d < 5) return "just now";
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  return `${Math.floor(d / 3600)}h ago`;
}

function StatBox({ label, value, sub, accent }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
        {label}
      </span>
      <span
        className={`text-2xl font-bold ${accent || "text-text-primary-light dark:text-text-primary-dark"}`}
      >
        {value}
      </span>
      {sub && (
        <span className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
          {sub}
        </span>
      )}
    </div>
  );
}

export default function OverviewPage() {
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState({});
  const [feed, setFeed] = useState([]);
  const [project, setProject] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      const r = await analyticsApi.getDashboardStats();
      if (r.success) setStats(r.data);
    } catch {}
  }, []);

  useEffect(() => {
    loadStats();
    const t = setInterval(loadStats, 30000);

    api
      .get("/health")
      .then((r) => setHealth(r.data?.data || r.data || {}))
      .catch(() => {});
    api
      .get("/auth/project")
      .then((r) => {
        if (r.data?.success) setProject(r.data.data.project);
      })
      .catch(() => {});

    // Live event feed via socket
    let sock;
    try {
      sock = initSocket();
      const handler = (evt) => {
        const line = `[${new Date().toLocaleTimeString("en-US", { hour12: false })}] ${evt.event || evt.eventType || "event"}  ${evt.email || evt.anonymousId?.substring(0, 12) || "anon"}  ${evt.properties?.page || ""}`;
        setFeed((prev) => [line, ...prev].slice(0, 40));
      };
      sock.on("eventReceived", handler);
      sock.on("leadUpdated", handler);
      return () => {
        clearInterval(t);
        sock.off("eventReceived", handler);
        sock.off("leadUpdated", handler);
      };
    } catch {
      return () => clearInterval(t);
    }
  }, [loadStats]);

  const ping = (svc) => {
    if (svc === "mongodb") return health.mongodb === "connected";
    if (svc === "redis")
      return health.redis === "ready" || health.redis === "connected";
    return health.status === "ok";
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="h-14 flex items-center justify-between px-6 border-b border-google-border bg-surface-light dark:bg-surface-dark shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
            {project?.name || "Overview"}
          </h1>
          <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
            System status and live event feed
          </p>
        </div>
        <div className="flex items-center gap-4">
          {["mongodb", "redis", "api"].map((svc) => (
            <div
              key={svc}
              className="flex items-center gap-1.5 text-[11px] text-text-secondary-light dark:text-text-secondary-dark"
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${ping(svc) ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
              />
              {svc}
            </div>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Ingestion stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Events",
              value: stats
                ? stats.totalEvents >= 1000
                  ? `${(stats.totalEvents / 1000).toFixed(1)}k`
                  : stats.totalEvents
                : "—",
              sub: "All time",
            },
            {
              label: "Identity Resolutions",
              value: stats ? stats.identityResolutions : "—",
              sub: "Emails merged",
            },
            {
              label: "Avg Latency",
              value: stats
                ? stats.avgLatency > 0
                  ? `${stats.avgLatency}ms`
                  : "< 1ms"
                : "—",
              sub: "Event → Score",
              accent:
                stats?.avgLatency > 200 ? "text-amber-500" : "text-emerald-500",
            },
            {
              label: "Qualified Leads",
              value: stats ? stats.qualifiedLeads : "—",
              sub: "Score ≥ 85",
              accent: "text-primary",
            },
          ].map((s) => (
            <Panel key={s.label} className="flex flex-col justify-between">
              <StatBox {...s} />
            </Panel>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Event Feed */}
          <div className="lg:col-span-2">
            <Panel noPad className="h-[420px] flex flex-col">
              <PanelHeader
                title="Live Event Feed"
                subtitle="Real-time stream of events hitting your pipeline"
                actions={
                  <span className="flex items-center gap-1.5 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Streaming
                  </span>
                }
              />
              <div className="flex-1 overflow-y-auto font-mono text-[11px] p-4 space-y-1.5 bg-slate-950 rounded-b-lg">
                {feed.length === 0 ? (
                  <p className="text-slate-600">Waiting for events...</p>
                ) : (
                  feed.map((line, i) => (
                    <div key={i} className="flex gap-2 text-slate-400">
                      <span className="text-slate-600">
                        {line.match(/\[.*?\]/)?.[0]}
                      </span>
                      <span className="text-emerald-400">
                        {line.replace(/\[.*?\]\s*/, "")}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>

          {/* System Status */}
          <div className="space-y-4">
            <Panel noPad>
              <PanelHeader title="Infrastructure" />
              <div className="divide-y divide-google-border">
                {[
                  {
                    label: "MongoDB Atlas",
                    ok: ping("mongodb"),
                    detail: "Document store",
                  },
                  {
                    label: "Upstash Redis",
                    ok: ping("redis"),
                    detail: "Queue + cache",
                  },
                  {
                    label: "API Server",
                    ok: ping("api"),
                    detail: "Express + Socket.IO",
                  },
                ].map(({ label, ok, detail }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark">
                        {label}
                      </p>
                      <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
                        {detail}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 text-[11px] font-semibold ${ok ? "text-emerald-500" : "text-red-500"}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${ok ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
                      />
                      {ok ? "Connected" : "Error"}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel noPad>
              <PanelHeader title="SDK Status" />
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">
                    Last event
                  </span>
                  <span className="font-mono text-text-primary-light dark:text-text-primary-dark">
                    {relTime(project?.lastEventAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">
                    Project
                  </span>
                  <span className="font-medium text-text-primary-light dark:text-text-primary-dark truncate max-w-[120px]">
                    {project?.name || "—"}
                  </span>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
