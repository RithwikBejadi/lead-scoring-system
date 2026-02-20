/**
 * AutomationList — table of webhooks/automations.
 */

import { Badge } from "../../../shared/ui/Badge";

function rel(dateStr) {
  if (!dateStr) return "—";
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (d < 1) return "just now";
  if (d < 60) return `${d}m ago`;
  if (d < 1440) return `${Math.floor(d / 60)}h ago`;
  return `${Math.floor(d / 1440)}d ago`;
}

export default function AutomationList({ automations, onTest, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="border-b border-white/5">
            {["Name", "URL", "Trigger", "Last Run", "Status", ""].map(h => (
              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-neutral-600 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {automations.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-neutral-700">
                No automations yet. Create a webhook to get started.
              </td>
            </tr>
          ) : (
            automations.map((a) => {
              const id = a._id || a.id;
              const ok = a.successCount || 0;
              const fail = a.failureCount || 0;
              const total = ok + fail;
              const pct = total > 0 ? Math.round((ok / total) * 100) : null;

              return (
                <tr key={id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-neutral-300">{a.name || "Unnamed"}</td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <span className="text-neutral-500 truncate block">{a.url || a.endpoint || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="info">{a.trigger || a.event || "any"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{rel(a.lastExecuted || a.lastRun)}</td>
                  <td className="px-4 py-3">
                    {pct !== null ? (
                      <span className={pct >= 90 ? "text-emerald-400" : pct >= 70 ? "text-amber-400" : "text-red-400"}>
                        {pct}% ({total} runs)
                      </span>
                    ) : (
                      <span className="text-neutral-700">never run</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onTest(id)}
                        className="text-neutral-600 hover:text-emerald-400 transition-colors"
                      >
                        test
                      </button>
                      <button
                        onClick={() => onDelete(id)}
                        className="text-neutral-700 hover:text-red-400 transition-colors"
                      >
                        del
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
