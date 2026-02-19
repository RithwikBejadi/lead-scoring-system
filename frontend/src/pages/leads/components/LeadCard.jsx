/**
 * LeadCard — compact card shown in the leads list.
 */

import { useNavigate } from "react-router-dom";
import { Badge } from "../../../shared/ui/Badge";

function scoreColor(score) {
  if (score >= 70) return "text-emerald-400";
  if (score >= 30) return "text-amber-400";
  return "text-neutral-400";
}

function rel(dateStr) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function LeadCard({ lead }) {
  const navigate = useNavigate();
  const id = lead._id || lead.id;

  return (
    <div
      onClick={() => navigate(`/leads/${id}`)}
      className="p-4 bg-[#171717] border border-white/5 rounded-lg cursor-pointer hover:border-white/10 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {lead.email || lead.anonymousId || "Anonymous"}
          </p>
          {lead.name && (
            <p className="text-xs text-neutral-500 truncate">{lead.name}</p>
          )}
        </div>
        <span className={`text-xl font-mono font-semibold tabular-nums flex-shrink-0 ml-3 ${scoreColor(lead.score || 0)}`}>
          {lead.score ?? 0}
        </span>
      </div>

      <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-600">
        <span>{lead.totalEvents ?? 0} events</span>
        <span>·</span>
        <span>{lead.sessions ?? 0} sessions</span>
        <span>·</span>
        <span>{rel(lead.lastSeen || lead.updatedAt)}</span>
      </div>

      {lead.source && (
        <div className="mt-2">
          <Badge variant="neutral">{lead.source}</Badge>
        </div>
      )}
    </div>
  );
}
