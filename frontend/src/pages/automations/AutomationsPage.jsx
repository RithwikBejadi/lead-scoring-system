import React, { useState, useEffect } from "react";
import { analyticsApi } from "../../api/analytics.api.js";
import { Panel, PanelHeader, EmptyState } from "../../shared/ui/Panel.jsx";
import Badge from "../../shared/ui/Badge.jsx";
import Spinner from "../../shared/ui/Spinner.jsx";

function relTime(ts) {
  if (!ts) return "—";
  const d = (Date.now() - new Date(ts)) / 1000;
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  return `${Math.floor(d / 3600)}h ago`;
}

// ─── Tab 1: Webhooks ──────────────────────────────────────────────────────────

function WebhooksTab() {
  return (
    <Panel noPad>
      <PanelHeader
        title="Webhook Endpoints"
        subtitle="Triggered when leads hit score thresholds"
        actions={
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold bg-primary text-white rounded hover:bg-blue-600 transition-colors">
            <span className="material-icons text-[14px]">add</span>
            Add endpoint
          </button>
        }
      />
      <div className="p-4">
        <div className="border border-dashed border-google-border rounded-lg p-8 text-center">
          <span className="material-icons text-3xl text-slate-300 dark:text-slate-700">
            webhook
          </span>
          <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mt-2">
            No webhooks configured
          </p>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 max-w-sm mx-auto">
            Add an endpoint in the Integrations page to receive automation
            triggers when leads cross score thresholds
          </p>
        </div>
      </div>
    </Panel>
  );
}

// ─── Tab 2: Execution Timeline ────────────────────────────────────────────────

function ExecutionTimeline({ logs, loading }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <Panel>
        <EmptyState
          icon="history"
          title="No automation events"
          description="Automation executions will appear here as leads cross score thresholds"
        />
      </Panel>
    );
  }

  return (
    <Panel noPad>
      <PanelHeader
        title="Execution Timeline"
        subtitle="All automation events ordered by time"
        actions={
          <span className="flex items-center gap-1.5 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        }
      />
      <div className="divide-y divide-google-border">
        {logs.map((log, i) => {
          const ts = log.timestamp || log.createdAt || log.firedAt;
          const type = log.type || log.action || "automation";
          const message = log.message || log.description || log.lead || "";

          return (
            <div
              key={log._id || i}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              {/* Timestamp */}
              <span className="font-mono text-[11px] text-text-secondary-light dark:text-text-secondary-dark shrink-0 w-[56px]">
                {ts
                  ? new Date(ts).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
                  : "—"}
              </span>

              {/* Type badge */}
              <Badge
                variant={
                  type === "email_sent" || type === "email"
                    ? "success"
                    : type === "webhook_fired" || type === "webhook"
                      ? "primary"
                      : type === "slack" || type === "slack_alert"
                        ? "purple"
                        : "default"
                }
                size="sm"
                className="shrink-0"
              >
                {type}
              </Badge>

              {/* Message */}
              <span className="text-xs text-text-primary-light dark:text-text-primary-dark flex-1 truncate">
                {message}
              </span>

              {/* Relative time */}
              <span className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark shrink-0">
                {relTime(ts)}
              </span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AutomationsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timeline");

  useEffect(() => {
    analyticsApi
      .getAutomationLogs(100)
      .then((r) => setLogs(r?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    const t = setInterval(() => {
      analyticsApi
        .getAutomationLogs(100)
        .then((r) => setLogs(r?.data || []))
        .catch(() => {});
    }, 10000);
    return () => clearInterval(t);
  }, []);

  const tabs = [
    { key: "timeline", label: "Execution Timeline", icon: "timeline" },
    { key: "webhooks", label: "Webhooks", icon: "webhook" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="h-14 flex items-center px-6 border-b border-google-border bg-surface-light dark:bg-surface-dark shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
            Automations
          </h1>
          <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
            Webhook triggers and execution history
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-0 px-6 border-b border-google-border bg-surface-light dark:bg-surface-dark shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-[12px] font-semibold border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary-light dark:text-text-secondary-dark hover:text-primary"
            }`}
          >
            <span className="material-icons text-[14px]">{tab.icon}</span>
            {tab.label}
            {tab.key === "timeline" && !loading && logs.length > 0 && (
              <span className="ml-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">
                {logs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          {activeTab === "timeline" && (
            <ExecutionTimeline logs={logs} loading={loading} />
          )}
          {activeTab === "webhooks" && <WebhooksTab />}
        </div>
      </div>
    </div>
  );
}
