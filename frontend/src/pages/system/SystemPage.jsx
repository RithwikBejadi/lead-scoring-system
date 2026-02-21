import React, { useState, useEffect, useCallback } from "react";
import { analyticsApi } from "../../api/analytics.api.js";
import { Panel, PanelHeader, EmptyState } from "../../shared/ui/Panel.jsx";
import Badge from "../../shared/ui/Badge.jsx";
import Spinner from "../../shared/ui/Spinner.jsx";
import api from "../../shared/api/axios.js";

function ProgressBar({ value, max, color = "bg-primary" }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
      <div
        className={`${color} h-full rounded-full transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StatRow({ label, value, sub }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-google-border last:border-0">
      <div>
        <p className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark">
          {label}
        </p>
        {sub && (
          <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
            {sub}
          </p>
        )}
      </div>
      <span className="font-mono text-sm font-bold text-text-primary-light dark:text-text-primary-dark">
        {value}
      </span>
    </div>
  );
}

export default function SystemPage() {
  const [queue, setQueue] = useState(null);
  const [health, setHealth] = useState({});
  const [failed, setFailed] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [qr, hr] = await Promise.allSettled([
        analyticsApi.getQueueHealth(),
        api.get("/health"),
      ]);
      if (qr.status === "fulfilled" && qr.value?.success)
        setQueue(qr.value.data);
      if (hr.status === "fulfilled")
        setHealth(hr.value?.data?.data || hr.value?.data || {});
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

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
            System
          </h1>
          <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
            Infrastructure health, queue stats, and diagnostics
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-[11px] text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"
        >
          <span className="material-icons text-[14px]">refresh</span>
          Refresh
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "MongoDB Atlas",
              svc: "mongodb",
              detail: "Document store",
            },
            {
              label: "Upstash Redis",
              svc: "redis",
              detail: "Queue + rate limiting",
            },
            { label: "API Server", svc: "api", detail: "Express + Socket.IO" },
          ].map(({ label, svc, detail }) => {
            const ok = ping(svc);
            return (
              <Panel key={svc} className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${ok ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
                >
                  <span
                    className={`material-icons ${ok ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {svc === "mongodb"
                      ? "database"
                      : svc === "redis"
                        ? "memory"
                        : "cloud"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                    {label}
                  </p>
                  <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                    {detail}
                  </p>
                </div>
                <Badge variant={ok ? "success" : "error"} className="ml-auto">
                  {ok ? "Connected" : "Error"}
                </Badge>
              </Panel>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Queue Stats */}
          <Panel noPad>
            <PanelHeader
              title="Bull Queue (Redis)"
              subtitle="Lead scoring job queue stats"
            />
            {queue ? (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Waiting",
                      value: queue.waiting,
                      color: "bg-amber-500",
                    },
                    {
                      label: "Active",
                      value: queue.active,
                      color: "bg-blue-500",
                    },
                    {
                      label: "Completed",
                      value:
                        queue.completed >= 1000
                          ? `${(queue.completed / 1000).toFixed(1)}k`
                          : queue.completed,
                      color: "bg-emerald-500",
                    },
                    {
                      label: "Failed",
                      value: queue.failed,
                      color: queue.failed > 0 ? "bg-red-500" : "bg-emerald-500",
                    },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3"
                    >
                      <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-widest">
                        {label}
                      </p>
                      <p
                        className={`text-2xl font-bold mt-1 font-mono ${color.replace("bg-", "text-")}`}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="text-text-secondary-light dark:text-text-secondary-dark">
                      Workers
                    </span>
                    <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                      {queue.workers} / {queue.maxWorkers}
                    </span>
                  </div>
                  <ProgressBar
                    value={queue.workers}
                    max={queue.maxWorkers}
                    color="bg-emerald-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1.5">
                    <span className="text-text-secondary-light dark:text-text-secondary-dark">
                      Queue pressure
                    </span>
                    <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                      {Math.round((queue.waiting / 5000) * 100)}%
                    </span>
                  </div>
                  <ProgressBar
                    value={queue.waiting}
                    max={5000}
                    color={
                      queue.waiting > 1000 ? "bg-amber-500" : "bg-blue-500"
                    }
                  />
                </div>
                {queue.failed > 10 && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg p-3 flex items-center gap-2">
                    <span className="material-icons text-red-500 text-[16px]">
                      report_problem
                    </span>
                    <span className="text-xs font-bold text-red-700 dark:text-red-400">
                      {queue.failed} jobs in dead letter queue
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon="hourglass_empty"
                title="Queue data unavailable"
                description="Redis connection may be offline"
              />
            )}
          </Panel>

          {/* Health raw data */}
          <Panel noPad>
            <PanelHeader
              title="Health Probe (/health)"
              subtitle="Raw response from the API health endpoint"
            />
            <div className="p-5">
              <div className="bg-slate-950 rounded-lg font-mono text-[11px] text-slate-300 p-4 space-y-1 overflow-auto max-h-64">
                {Object.entries(health).length > 0 ? (
                  Object.entries(health).map(([k, v]) => (
                    <div key={k} className="flex gap-3">
                      <span className="text-blue-300 w-28 shrink-0">{k}:</span>
                      <span
                        className={
                          typeof v === "string" &&
                          (v === "connected" || v === "ready" || v === "ok")
                            ? "text-emerald-400"
                            : "text-slate-300"
                        }
                      >
                        {typeof v === "object" ? JSON.stringify(v) : String(v)}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-slate-600">No data</span>
                )}
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
