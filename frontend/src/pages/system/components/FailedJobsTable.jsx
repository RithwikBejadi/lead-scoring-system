/**
 * FailedJobsTable — dead letter queue viewer with retry action.
 */

import { Badge } from "../../../shared/ui/Badge";

function rel(dateStr) {
  if (!dateStr) return "—";
  const m = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

export default function FailedJobsTable({ jobs = [], onRetry }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="border-b border-white/5">
            {["Type", "Error", "Attempts", "Failed", ""].map(h => (
              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-neutral-600 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-neutral-700">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-emerald-600">✓</span>
                  <span>No failed jobs</span>
                </div>
              </td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr key={job._id || job.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="px-4 py-2.5">
                  <Badge variant="neutral">{job.type || job.jobType || "unknown"}</Badge>
                </td>
                <td className="px-4 py-2.5 max-w-[280px]">
                  <span className="text-red-400 truncate block">
                    {(job.error || job.failReason || "—").slice(0, 80)}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-neutral-600">
                  {job.attempts ?? job.retryCount ?? "—"}
                </td>
                <td className="px-4 py-2.5 text-neutral-600">
                  {rel(job.updatedAt || job.failedAt || job.createdAt)}
                </td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => onRetry(job._id || job.id)}
                    className="text-neutral-600 hover:text-emerald-400 transition-colors"
                  >
                    retry
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
