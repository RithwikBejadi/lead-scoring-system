import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios.config";

// ── Status Tile ───────────────────────────────────────────────────────────────
function StatusTile({ label, status, detail }) {
  const ok = status === "connected" || status === "ok" || status === "healthy";
  const degraded = status === "degraded";
  return (
    <div className="border border-google-border rounded-xl p-5 bg-surface-light dark:bg-surface-dark">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark">
          {label}
        </span>
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            ok ? "bg-green-500" : degraded ? "bg-yellow-500" : "bg-red-500"
          }`}
        />
      </div>
      <p
        className={`text-base font-bold capitalize ${ok ? "text-green-600" : degraded ? "text-yellow-600" : "text-red-500"}`}
      >
        {status || "unknown"}
      </p>
      {detail && (
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
          {detail}
        </p>
      )}
    </div>
  );
}

// ── Metric Tile ────────────────────────────────────────────────────────────────
function MetricTile({ label, value, sub }) {
  return (
    <div className="border border-google-border rounded-xl p-5 bg-surface-light dark:bg-surface-dark">
      <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
        {value ?? "—"}
      </p>
      {sub && (
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
          {sub}
        </p>
      )}
    </div>
  );
}

// ── Log Row ───────────────────────────────────────────────────────────────────
function LogRow({ log }) {
  const ts = log.timestamp || log.executedAt || log.createdAt;
  return (
    <tr className="border-b border-google-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-4 py-2 text-xs text-text-secondary-light dark:text-text-secondary-dark whitespace-nowrap">
        {ts ? new Date(ts).toLocaleTimeString() : "—"}
      </td>
      <td className="px-4 py-2 text-xs font-medium">
        {log.action || log.type || "—"}
      </td>
      <td className="px-4 py-2 text-xs text-text-secondary-light dark:text-text-secondary-dark font-mono truncate max-w-[200px]">
        {log.anonymousId || log.leadId || "—"}
      </td>
      <td className="px-4 py-2 text-xs">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            log.status === "success" || log.success
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
          }`}
        >
          {log.status || (log.success ? "success" : "failed")}
        </span>
      </td>
    </tr>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SystemPage() {
  const [health, setHealth] = useState(null);
  const [queue, setQueue] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [healthRes, queueRes, logsRes] = await Promise.allSettled([
        api.get("/health"),
        api.get("/analytics/queue-health"),
        api.get("/analytics/automation-logs", { params: { limit: 20 } }),
      ]);

      if (healthRes.status === "fulfilled") setHealth(healthRes.value.data);
      if (queueRes.status === "fulfilled")
        setQueue(queueRes.value.data?.data || queueRes.value.data);
      if (logsRes.status === "fulfilled") {
        const d = logsRes.value.data?.data || logsRes.value.data;
        setLogs(Array.isArray(d) ? d : d?.logs || []);
      }
    } catch (err) {
      if (!err.response) setError("Cannot reach backend.");
      else setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const uptime = health?.uptime
    ? `${Math.floor(health.uptime / 60)}m ${Math.floor(health.uptime % 60)}s`
    : null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-google-border bg-surface-light dark:bg-surface-dark flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <span className="material-icons text-primary text-xl">
              monitor_heart
            </span>
            System Health
          </h1>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
            Real-time metrics · auto-refreshes every 30s
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          <span className="material-icons text-sm">refresh</span>
          Refresh
        </button>
      </div>

      <div className="p-6 space-y-6">
        {loading && (
          <div className="flex items-center gap-3 text-text-secondary-light dark:text-text-secondary-dark">
            <span className="material-icons animate-spin">sync</span>
            Loading system status…
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <span className="material-icons text-red-500 mt-0.5 text-lg">
              error_outline
            </span>
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                System check failed
              </p>
              <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">
                {error}
              </p>
              <button
                onClick={load}
                className="mt-2 text-xs text-red-600 underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* Infrastructure */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                Infrastructure
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatusTile label="MongoDB" status={health?.mongodb} />
                <StatusTile label="Redis" status={health?.redis} />
                <StatusTile
                  label="API Server"
                  status={health?.status || "ok"}
                  detail={uptime ? `Uptime: ${uptime}` : null}
                />
                <StatusTile
                  label="Overall"
                  status={health?.status || "unknown"}
                  detail={
                    health?.timestamp
                      ? new Date(health.timestamp).toLocaleTimeString()
                      : null
                  }
                />
              </div>
            </section>

            {/* Queue */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                Queue Metrics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricTile
                  label="Active"
                  value={queue?.active ?? queue?.activeJobs ?? "—"}
                  sub="Jobs processing now"
                />
                <MetricTile
                  label="Waiting"
                  value={
                    queue?.waiting ?? queue?.waitingJobs ?? queue?.queued ?? "—"
                  }
                  sub="Queued for processing"
                />
                <MetricTile
                  label="Completed"
                  value={queue?.completed ?? queue?.completedJobs ?? "—"}
                  sub="Total processed"
                />
                <MetricTile
                  label="Failed"
                  value={queue?.failed ?? queue?.failedJobs ?? "—"}
                  sub="Requires attention"
                />
              </div>
            </section>

            {/* Automation Log */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mb-3">
                Recent Automation Activity
              </h2>
              <div className="border border-google-border rounded-xl overflow-hidden bg-surface-light dark:bg-surface-dark">
                {logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-text-secondary-light dark:text-text-secondary-dark">
                    <span className="material-icons text-3xl mb-2 opacity-30">
                      auto_awesome
                    </span>
                    <p className="text-sm">No automation activity yet</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="border-b border-google-border bg-slate-50 dark:bg-slate-800/50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                          Time
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                          Action
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                          Lead
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, i) => (
                        <LogRow key={i} log={log} />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
