/**
 * RuleSimulator — paste a sample event, see matching rules and score delta.
 */

import { useState } from "react";
import { rulesApi } from "../../../features/rules/rules.api";

const SAMPLE = JSON.stringify(
  {
    type: "page_view",
    anonymousId: "anon_test_001",
    properties: { page: "/pricing" },
  },
  null,
  2
);

export default function RuleSimulator() {
  const [input, setInput] = useState(SAMPLE);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setError(null);
    setResult(null);
    let parsed;
    try {
      parsed = JSON.parse(input);
    } catch {
      setError("Invalid JSON");
      return;
    }
    setLoading(true);
    try {
      const res = await rulesApi.simulate(parsed);
      setResult(res.data || res);
    } catch (e) {
      // Simulate locally if endpoint not available
      setError(e.response?.data?.error || e.message || "Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-2">
          Sample Event JSON
        </p>
        <textarea
          rows={8}
          value={input}
          onChange={e => setInput(e.target.value)}
          className="w-full bg-[#0d0d0d] border border-white/5 rounded px-3 py-2 text-xs font-mono text-neutral-300 focus:outline-none focus:border-white/20 resize-none"
        />
      </div>

      <button
        onClick={run}
        disabled={loading}
        className="self-start px-4 py-1.5 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors disabled:opacity-50"
      >
        {loading ? "Running…" : "Run Simulation →"}
      </button>

      {error && (
        <p className="text-xs font-mono text-red-400">{error}</p>
      )}

      {result && (
        <div className="bg-[#0d0d0d] border border-white/5 rounded p-4 font-mono text-xs">
          <p className="text-neutral-600 mb-3">Result</p>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-neutral-600 text-[10px] uppercase tracking-wider mb-0.5">Score Delta</p>
              <p className={`text-2xl font-semibold ${(result.scoreDelta || 0) > 0 ? "text-emerald-400" : (result.scoreDelta || 0) < 0 ? "text-red-400" : "text-neutral-500"}`}>
                {(result.scoreDelta || 0) > 0 ? "+" : ""}{result.scoreDelta ?? 0}
              </p>
            </div>
            {result.matchedRules?.length > 0 && (
              <div>
                <p className="text-neutral-600 text-[10px] uppercase tracking-wider mb-0.5">Matched Rules</p>
                <div className="flex flex-col gap-1">
                  {result.matchedRules.map((r, i) => (
                    <span key={i} className="text-emerald-400">{r.eventName || r.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
