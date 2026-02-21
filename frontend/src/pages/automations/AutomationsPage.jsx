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

export default function AutomationsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi
      .getAutomationLogs(50)
      .then((r) => setLogs(r?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    const t = setInterval(() => {
      analyticsApi
        .getAutomationLogs(50)
        .then((r) => setLogs(r?.data || []))
        .catch(() => {});
    }, 10000);
    return () => clearInterval(t);
  }, []);

  // Mock webhook entries (real ones come from backend webhooks feature)
  const webhooks = [
    { url: "—", status: "No webhooks configured", test: false },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="h-14 flex items-center px-6 border-b border-google-border bg-surface-light dark:bg-surface-dark shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
            Automations
          </h1>
          <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
            Webhook triggers and automation execution log
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* Webhooks panel */}
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
            <div className="border border-dashed border-google-border rounded-lg p-6 text-center">
              <span className="material-icons text-3xl text-slate-300 dark:text-slate-700">
                webhook
              </span>
              <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mt-2">
                No webhooks configured
              </p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                Add an endpoint in the Integrations page to receive automation
                triggers
              </p>
            </div>
          </div>
        </Panel>

        {/* Execution log */}
        <Panel noPad>
          <PanelHeader
            title="Execution Log"
            subtitle="Recent automation trigger history"
            actions={
              <span className="flex items-center gap-1.5 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            }
          />
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : logs.length === 0 ? (
            <EmptyState
              icon="history"
              title="No automation events"
              description="Automations fire when leads hit configured score thresholds"
            />
          ) : (
            <div className="divide-y divide-google-border">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <span className="font-mono text-[11px] text-text-secondary-light dark:text-text-secondary-dark shrink-0 w-[80px]">
                    {log.timestamp
                      ? new Date(log.timestamp).toLocaleTimeString("en-US", {
                          hour12: false,
                        })
                      : "—"}
                  </span>
                  <Badge
                    variant={
                      log.type === "email_sent"
                        ? "success"
                        : log.type === "webhook_fired"
                          ? "primary"
                          : "default"
                    }
                    size="sm"
                    className="shrink-0"
                  >
                    {log.type || "automation"}
                  </Badge>
                  <span className="text-xs text-text-primary-light dark:text-text-primary-dark flex-1">
                    {log.message}
                  </span>
                  <span className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark shrink-0">
                    {relTime(log.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
