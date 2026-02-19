/**
 * AlertsPanel — shows system alerts: dead letter jobs, rate limits, etc.
 */

import { useState, useEffect } from "react";
import { systemApi } from "../../../features/system/system.api";
import { Badge } from "../../../shared/ui/Badge";

function alertVariant(type) {
  if (type?.includes("fail") || type?.includes("dead")) return "danger";
  if (type?.includes("limit")) return "warning";
  if (type?.includes("restart")) return "warning";
  return "neutral";
}

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    systemApi.getFailedJobs({ limit: 5 })
      .then(res => {
        const jobs = Array.isArray(res) ? res : (res.data || res.jobs || []);
        setAlerts(
          jobs.slice(0, 5).map(j => ({
            id: j._id,
            type: "dead_letter",
            message: `Job failed: ${j.type || j.jobType || "unknown"} — ${j.error?.slice(0, 60) || "unknown error"}`,
            ts: j.createdAt,
          }))
        );
      })
      .catch(() => {});
  }, []);

  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-3">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="text-xs font-mono text-neutral-500">No active alerts</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {alerts.map((a, i) => (
        <div
          key={a.id || i}
          className="flex items-start gap-2.5 px-4 py-2.5 border-b border-white/[0.03]"
        >
          <Badge variant={alertVariant(a.type)} className="mt-0.5 flex-shrink-0">
            {a.type.replace("_", " ")}
          </Badge>
          <p className="text-xs font-mono text-neutral-400 truncate">{a.message}</p>
        </div>
      ))}
    </div>
  );
}
