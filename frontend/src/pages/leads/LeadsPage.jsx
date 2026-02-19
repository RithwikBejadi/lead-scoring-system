/**
 * LeadsPage — identity resolution + scoring results.
 * Not a CRM. Focuses on data trust.
 */

import { useState, useEffect, useCallback } from "react";
import { leadsApi } from "../../features/leads/leads.api";
import LeadCard from "./components/LeadCard";
import { Spinner } from "../../shared/ui/Spinner";

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-score");
  const [error, setError] = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leadsApi.getAll({ sort, limit: 100 });
      const arr = Array.isArray(res) ? res : (res.data || res.leads || []);
      setLeads(arr);
      setError(null);
    } catch (e) {
      setError(e.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const filtered = leads.filter(l => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      l.email?.toLowerCase().includes(s) ||
      l.name?.toLowerCase().includes(s) ||
      l.anonymousId?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by email, name, or ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 max-w-sm bg-[#171717] border border-white/5 rounded px-3 py-2 text-sm font-mono text-neutral-300 placeholder-neutral-600 focus:outline-none focus:border-white/15"
        />
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="bg-[#171717] border border-white/5 rounded px-3 py-2 text-sm text-neutral-400 focus:outline-none focus:border-white/15"
        >
          <option value="-score">Score ↓</option>
          <option value="score">Score ↑</option>
          <option value="-updatedAt">Recent</option>
          <option value="-totalEvents">Most Events</option>
        </select>
        <span className="text-xs font-mono text-neutral-600">
          {filtered.length} leads
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <p className="text-sm text-neutral-500">{error}</p>
          <button
            onClick={fetchLeads}
            className="text-xs text-emerald-400 hover:underline"
          >
            Retry
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20">
          <p className="text-sm text-neutral-600">No leads found</p>
          <p className="text-xs text-neutral-700">
            Send events with an email to start tracking leads
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(lead => (
            <LeadCard key={lead._id || lead.id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}
