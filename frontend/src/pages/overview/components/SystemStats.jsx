/**
 * SystemStats — top-row metric tiles for the overview page.
 */

import { useState, useEffect } from "react";
import { systemApi } from "../../../features/system/system.api";
import { StatCard } from "../../../shared/ui/StatCard";

export default function SystemStats() {
  const [health, setHealth] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    systemApi.health()
      .then(setHealth)
      .catch(() => {});
    systemApi.getAnalytics()
      .then(res => setAnalytics(res.data || res))
      .catch(() => {});
  }, []);

  const mongoOk = health?.mongodb === "connected";
  const redisOk = health?.redis === "connected";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard
        label="System"
        value={health ? (health.status === "ok" ? "Healthy" : "Degraded") : "—"}
        sub={health ? `MongoDB: ${mongoOk ? "✓" : "✗"}  Redis: ${redisOk ? "✓" : "✗"}` : "Checking…"}
        trend={health?.status === "ok" ? "up" : health ? "down" : undefined}
      />
      <StatCard
        label="Total Leads"
        value={analytics?.totalLeads ?? "—"}
        sub={analytics?.newLeadsToday != null ? `+${analytics.newLeadsToday} today` : undefined}
      />
      <StatCard
        label="Events Today"
        value={analytics?.eventsToday ?? "—"}
        sub={analytics?.eventsPerMinute != null ? `${analytics.eventsPerMinute}/min avg` : undefined}
      />
      <StatCard
        label="Uptime"
        value={health ? `${Math.floor(health.uptime / 3600)}h` : "—"}
        sub={health ? `${Math.floor((health.uptime % 3600) / 60)}m ${Math.floor(health.uptime % 60)}s` : undefined}
      />
    </div>
  );
}
