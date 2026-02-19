/**
 * LeadDetailPage — deep dive into a single lead.
 * Shows: identity map, score graph, session timeline, raw events.
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { leadsApi } from "../../features/leads/leads.api";
import { eventsApi } from "../../features/events/events.api";
import { Panel } from "../../shared/ui/Panel";
import { Spinner } from "../../shared/ui/Spinner";
import { JsonViewer } from "../../shared/ui/JsonViewer";
import IdentityMap from "./components/IdentityMap";
import ScoreGraph from "./components/ScoreGraph";
import LeadTimeline from "./components/LeadTimeline";

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [events, setEvents] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("timeline"); // "timeline" | "raw"

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      leadsApi.getById(id),
      eventsApi.getByLead(id, { limit: 100 }),
      leadsApi.getScoreHistory(id),
    ])
      .then(([leadRes, eventsRes, historyRes]) => {
        setLead(leadRes.data || leadRes);
        const ev = Array.isArray(eventsRes) ? eventsRes : (eventsRes.data || eventsRes.events || []);
        setEvents(ev);
        const hist = Array.isArray(historyRes) ? historyRes : (historyRes.data || historyRes.history || []);
        setHistory(hist);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-sm text-neutral-500">Lead not found</p>
        <button onClick={() => navigate("/leads")} className="text-xs text-emerald-400 hover:underline">
          ← Back to leads
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto flex flex-col gap-5">
      {/* Back */}
      <button
        onClick={() => navigate("/leads")}
        className="text-xs font-mono text-neutral-600 hover:text-neutral-400 transition-colors w-fit"
      >
        ← leads
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-medium text-white">
            {lead.email || lead.anonymousId || "Anonymous"}
          </h2>
          {lead.name && <p className="text-sm text-neutral-500">{lead.name}</p>}
        </div>
        <div className="text-right">
          <p className="text-3xl font-mono font-bold text-emerald-400">
            {lead.score ?? 0}
          </p>
          <p className="text-[10px] text-neutral-600 uppercase tracking-wider">Score</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Events", val: events.length },
          { label: "Sessions", val: lead.sessions ?? "—" },
          { label: "First Seen", val: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "—" },
        ].map(m => (
          <div key={m.label} className="bg-[#171717] border border-white/5 rounded-lg p-3">
            <p className="text-[10px] text-neutral-600 uppercase tracking-wider mb-1">{m.label}</p>
            <p className="text-lg font-mono text-white">{m.val}</p>
          </div>
        ))}
      </div>

      {/* Identity map */}
      <Panel title="Identity Map">
        <div className="p-4">
          <IdentityMap lead={lead} />
        </div>
      </Panel>

      {/* Score graph */}
      <Panel title="Score Evolution">
        <div className="p-4">
          <ScoreGraph history={history} />
        </div>
      </Panel>

      {/* Events */}
      <Panel
        title="Events"
        action={
          <div className="flex gap-1">
            {["timeline", "raw"].map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                  tab === t
                    ? "bg-white/10 text-neutral-200"
                    : "text-neutral-600 hover:text-neutral-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        }
      >
        <div className="p-4">
          {tab === "timeline" ? (
            <LeadTimeline events={events} />
          ) : (
            <JsonViewer data={events} collapsed={false} />
          )}
        </div>
      </Panel>
    </div>
  );
}
