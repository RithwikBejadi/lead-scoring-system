/**
 * WorkerHealth — worker/queue health tiles.
 */

import { StatCard } from "../../../shared/ui/StatCard";

export default function WorkerHealth({ queueStats }) {
  const q = queueStats || {};

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
      <StatCard
        label="Queue Depth"
        value={q.waiting ?? "—"}
        sub={q.active != null ? `${q.active} active` : undefined}
        trend={q.waiting > 100 ? "down" : "up"}
      />
      <StatCard
        label="Completed"
        value={q.completed ?? "—"}
        sub="total processed"
      />
      <StatCard
        label="Failed"
        value={q.failed ?? "—"}
        sub="dead letter jobs"
        trend={(q.failed || 0) > 0 ? "down" : "up"}
      />
      <StatCard
        label="Delayed"
        value={q.delayed ?? "—"}
        sub="scheduled/retry"
      />
    </div>
  );
}
