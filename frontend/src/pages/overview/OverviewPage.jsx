/**
 * OverviewPage — "Is my pipeline alive?"
 * Shows: system stats, throughput graph, live event feed, alerts.
 */

import SystemStats from "./components/SystemStats";
import ThroughputGraph from "./components/ThroughputGraph";
import EventFeed from "./components/EventFeed";
import AlertsPanel from "./components/AlertsPanel";
import { Panel } from "../../shared/ui/Panel";
import { useNavigate } from "react-router-dom";

export default function OverviewPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 flex flex-col gap-6 max-w-[1400px] mx-auto">

      {/* Stats row */}
      <SystemStats />

      {/* Throughput + Feed row */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-4">

        {/* Throughput graph */}
        <Panel
          title="Event Throughput"
          action={
            <span className="text-[10px] font-mono text-neutral-600">last 1h · 5m buckets</span>
          }
        >
          <div className="p-4">
            <ThroughputGraph />
          </div>
        </Panel>

        {/* Alerts */}
        <Panel title="System Alerts">
          <AlertsPanel />
          <div className="px-4 pb-3 pt-1">
            <button
              onClick={() => navigate("/system")}
              className="text-[11px] font-mono text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              View system →
            </button>
          </div>
        </Panel>
      </div>

      {/* Live event feed */}
      <Panel
        title="Live Event Feed"
        action={
          <button
            onClick={() => navigate("/events")}
            className="text-[11px] font-mono text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            Open full stream →
          </button>
        }
      >
        <div className="h-[280px] overflow-hidden">
          <EventFeed />
        </div>
      </Panel>

    </div>
  );
}
