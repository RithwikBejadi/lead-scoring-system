/**
 * DebugOverlay — bottom-right fixed panel showing live system state.
 * Only visible in non-production builds OR when ?debug=1 is in the URL.
 *
 * Reads from the global AppStore so values update in real-time without
 * any additional API calls.
 */

import { useState, useEffect } from "react";
import { useAppStore } from "../../store/AppStore.jsx";

const IS_DEV = import.meta.env.DEV;

function dot(connected) {
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
        connected ? "bg-emerald-400 animate-pulse" : "bg-red-500"
      }`}
    />
  );
}

function Row({ label, value, warn }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <span className="text-[10px] text-neutral-500 font-mono">{label}</span>
      <span
        className={`text-[11px] font-mono tabular-nums ${
          warn ? "text-amber-400" : "text-neutral-200"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function DebugOverlay() {
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { state } = useAppStore();

  const { ui, metrics, leads } = state;

  useEffect(() => {
    const show =
      IS_DEV || new URLSearchParams(window.location.search).get("debug") === "1";
    setVisible(show);
  }, []);

  if (!visible) return null;

  const totalLeads = leads.allIds.length;
  const { countsByStage } = metrics;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 font-mono select-none"
      style={{ minWidth: 200 }}
    >
      {/* Header / toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-2 w-full bg-[#111] border border-white/10 rounded-t-lg px-3 py-1.5 text-[10px] text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        {dot(ui.socketConnected)}
        <span className="flex-1 text-left">System Debug</span>
        <span className="material-icons text-[12px]">
          {collapsed ? "expand_less" : "expand_more"}
        </span>
      </button>

      {!collapsed && (
        <div className="bg-[#0d0d0d]/95 backdrop-blur border border-t-0 border-white/10 rounded-b-lg px-3 py-2.5 space-y-1.5">
          {/* Socket */}
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-neutral-500">Socket</span>
            <span
              className={`text-[11px] ${
                ui.socketConnected ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {ui.socketConnected ? "connected" : "disconnected"}
            </span>
          </div>

          <div className="border-t border-white/5 my-1" />

          {/* Queue */}
          <Row
            label="Queue depth"
            value={ui.queueDepth ?? 0}
            warn={ui.queueDepth > 100}
          />
          <Row
            label="Active jobs"
            value={ui.activeJobs ?? 0}
          />
          <Row
            label="Worker"
            value={ui.workerActive ? "active" : "idle"}
          />
          <Row
            label="Queue lag"
            value={
              ui.queueLag
                ? `${(ui.queueLag / 1000).toFixed(1)}s`
                : "—"
            }
            warn={ui.queueLag > 5000}
          />

          <div className="border-t border-white/5 my-1" />

          {/* Events */}
          <Row label="Events/sec" value={metrics.eventsPerSec ?? "0.0"} />

          <div className="border-t border-white/5 my-1" />

          {/* Pipeline */}
          <Row label="Leads total" value={totalLeads} />
          <Row label="Cold" value={countsByStage?.cold ?? 0} />
          <Row label="Warm" value={countsByStage?.warm ?? 0} />
          <Row label="Hot" value={countsByStage?.hot ?? 0} />
          <Row
            label="Qualified"
            value={countsByStage?.qualified ?? 0}
          />

          <div className="border-t border-white/5 my-1" />
          <p className="text-[9px] text-neutral-700 text-center">
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
