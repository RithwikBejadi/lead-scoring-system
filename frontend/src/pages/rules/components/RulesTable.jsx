/**
 * RulesTable — sortable list of scoring rules.
 */

import { Badge } from "../../../shared/ui/Badge";

export default function RulesTable({ rules, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="border-b border-white/5">
            {["Event Name", "Score Delta", "Conditions", "Project", ""].map(h => (
              <th
                key={h}
                className="px-4 py-2.5 text-left text-[10px] font-semibold text-neutral-600 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rules.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-neutral-700">
                No rules yet. Add a rule to start scoring.
              </td>
            </tr>
          ) : (
            rules.map((rule) => (
              <tr
                key={rule._id || rule.id}
                className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-2.5">
                  <span className="text-emerald-400">{rule.eventName || rule.name || "—"}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`font-mono font-semibold ${
                      (rule.scoreChange || rule.delta || 0) > 0
                        ? "text-emerald-400"
                        : (rule.scoreChange || rule.delta || 0) < 0
                        ? "text-red-400"
                        : "text-neutral-500"
                    }`}
                  >
                    {(rule.scoreChange || rule.delta || 0) > 0 ? "+" : ""}
                    {rule.scoreChange ?? rule.delta ?? 0}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  {rule.conditions && Object.keys(rule.conditions).length > 0 ? (
                    <span className="text-neutral-500">
                      {Object.entries(rule.conditions)
                        .map(([k, v]) => `${k}=${v}`)
                        .join(", ")}
                    </span>
                  ) : (
                    <span className="text-neutral-700">any</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-neutral-600">
                    {rule.projectId || rule.project || "global"}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(rule)}
                      className="text-neutral-600 hover:text-neutral-300 transition-colors"
                    >
                      edit
                    </button>
                    <button
                      onClick={() => onDelete(rule._id || rule.id)}
                      className="text-neutral-700 hover:text-red-400 transition-colors"
                    >
                      del
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
