import React, { useState, useEffect } from "react";
import { rulesApi } from "../../features/rules/rules.api.js";
import { leadsApi } from "../../api/leads.api.js";
import { Panel, PanelHeader, EmptyState } from "../../shared/ui/Panel.jsx";
import Badge from "../../shared/ui/Badge.jsx";
import Spinner from "../../shared/ui/Spinner.jsx";

const EVENT_TYPES = [
  "page_view",
  "click",
  "identify",
  "form_submit",
  "demo_request",
  "pricing_view",
  "signup",
  "login",
  "custom",
];

function RuleEditor({ rule, onSave, onCancel }) {
  const [form, setForm] = useState({
    eventType: rule?.eventType || "",
    points: rule?.points ?? 10,
    description: rule?.description || "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save rule");
    } finally {
      if (!error) setSaving(false); // only set to false if no error to allow fixing
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-4 space-y-3 border border-google-border">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs px-3 py-2 rounded border border-red-200 dark:border-red-800 flex items-center gap-1.5">
          <span className="material-icons text-[14px]">error_outline</span>
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark block mb-1">
            Event Type
          </label>
          <select
            value={form.eventType}
            onChange={(e) => set("eventType", e.target.value)}
            disabled={!!rule} // Disable editing eventType for existing rules
            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-google-border rounded focus:ring-2 focus:ring-primary/50 text-text-primary-light dark:text-text-primary-dark disabled:opacity-50"
          >
            <option value="">Select event...</option>
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark block mb-1">
            Score Delta
          </label>
          <input
            type="number"
            value={form.points}
            onChange={(e) => set("points", Number(e.target.value))}
            className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-google-border rounded focus:ring-2 focus:ring-primary/50 text-text-primary-light dark:text-text-primary-dark"
          />
        </div>
      </div>
      <div>
        <label className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark block mb-1">
          Description (optional)
        </label>
        <input
          type="text"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="e.g. User viewed pricing page"
          className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-google-border rounded focus:ring-2 focus:ring-primary/50 text-text-primary-light dark:text-text-primary-dark"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs text-text-secondary-light dark:text-text-secondary-dark hover:text-primary"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!form.eventType || saving}
          className="px-4 py-1.5 text-xs font-semibold bg-primary text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {saving && <Spinner size="sm" />}
          {rule ? "Update rule" : "Create rule"}
        </button>
      </div>
    </div>
  );
}

function RuleSimulator({ rules }) {
  const [eventType, setEventType] = useState("page_view");
  const [currentScore, setCurrentScore] = useState(0);
  const [result, setResult] = useState(null);

  const simulate = () => {
    const matching = rules.filter(
      (r) => r.eventType === eventType || r.event === eventType,
    );
    const delta = matching.reduce(
      (acc, r) => acc + (r.points ?? r.scoreIncrement ?? 0),
      0,
    );
    const newScore = Math.min(100, Math.max(0, currentScore + delta));
    setResult({ delta, newScore, matching });
  };

  return (
    <Panel noPad>
      <PanelHeader
        title="Rule Simulator"
        subtitle="Paste a sample event — see the score delta instantly"
      />
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark block mb-1">
              Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark block mb-1">
              Current Score
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={currentScore}
              onChange={(e) => setCurrentScore(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded"
            />
          </div>
        </div>
        <button
          onClick={simulate}
          className="w-full py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-blue-600 transition-colors"
        >
          Simulate Event
        </button>
        {result && (
          <div className="rounded-lg bg-slate-900 p-4 font-mono text-[12px] space-y-1.5">
            <p>
              <span className="text-slate-400">event: </span>
              <span className="text-blue-300">{eventType}</span>
            </p>
            <p>
              <span className="text-slate-400">delta: </span>
              <span
                className={
                  result.delta >= 0
                    ? "text-emerald-400 font-bold"
                    : "text-red-400 font-bold"
                }
              >
                {result.delta >= 0 ? `+${result.delta}` : result.delta}
              </span>
            </p>
            <p>
              <span className="text-slate-400">before: </span>
              <span className="text-white">{currentScore}</span>
            </p>
            <p>
              <span className="text-slate-400">after: </span>
              <span className="text-emerald-400 font-bold">
                {result.newScore}
              </span>
            </p>
            {result.matching.length === 0 && (
              <p className="text-amber-400 text-[11px] pt-1">
                ⚠ No matching rule — score unchanged
              </p>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
}

// ─── Impact Simulator ────────────────────────────────────────────────────────

function ImpactSimulator({ rules, leads }) {
  const [targetEvent, setTargetEvent] = useState("");
  const [newPoints, setNewPoints] = useState(0);
  const [result, setResult] = useState(null);

  const simulate = () => {
    if (!targetEvent) return;
    const rule = rules.find((r) => (r.eventType || r.event) === targetEvent);
    const currentPoints = rule?.points ?? rule?.scoreIncrement ?? 0;
    const delta = newPoints - currentPoints;

    if (delta === 0) {
      setResult({ delta: 0, message: "No change — same point value" });
      return;
    }

    // Re-score each lead with the delta and count stage changes
    const before = { Cold: 0, Warm: 0, Hot: 0, Qualified: 0 };
    const after = { Cold: 0, Warm: 0, Hot: 0, Qualified: 0 };

    const stageFor = (s) => {
      if (s >= 85) return "Qualified";
      if (s >= 70) return "Hot";
      if (s >= 40) return "Warm";
      return "Cold";
    };

    leads.forEach((lead) => {
      const score = lead.currentScore || 0;
      // Approximate events count for this type from lead data (rough)
      const eventCount = 1; // conservative: assume they have at least 1
      const newScore = Math.min(100, Math.max(0, score + delta * eventCount));
      before[stageFor(score)]++;
      after[stageFor(newScore)]++;
    });

    setResult({ before, after, delta, currentPoints, newPoints, targetEvent });
  };

  const matchingRule = rules.find((r) => (r.eventType || r.event) === targetEvent);

  return (
    <Panel noPad>
      <PanelHeader
        title="Impact Simulator"
        subtitle="See how changing a rule affects the pipeline"
      />
      <div className="p-4 space-y-3">
        <div>
          <label className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark block mb-1">
            Rule to change
          </label>
          <select
            value={targetEvent}
            onChange={(e) => {
              setTargetEvent(e.target.value);
              const r = rules.find((r) => (r.eventType || r.event) === e.target.value);
              if (r) setNewPoints(r.points ?? r.scoreIncrement ?? 0);
              setResult(null);
            }}
            className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded"
          >
            <option value="">Select rule…</option>
            {rules.map((r) => (
              <option key={r._id} value={r.eventType || r.event}>
                {r.eventType || r.event} ({r.points ?? r.scoreIncrement ?? 0} pts)
              </option>
            ))}
          </select>
        </div>
        {targetEvent && matchingRule && (
          <div>
            <label className="text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark block mb-1">
              New point value (currently {matchingRule.points ?? matchingRule.scoreIncrement ?? 0})
            </label>
            <input
              type="number"
              value={newPoints}
              onChange={(e) => { setNewPoints(Number(e.target.value)); setResult(null); }}
              className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border-none rounded"
            />
          </div>
        )}
        <button
          onClick={simulate}
          disabled={!targetEvent || leads.length === 0}
          className="w-full py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-blue-600 transition-colors disabled:opacity-40"
        >
          Simulate Impact
        </button>

        {result && !result.message && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
              Pipeline impact ({leads.length} leads)
            </p>
            {Object.keys(result.before).map((stage) => {
              const b = result.before[stage];
              const a = result.after[stage];
              const diff = a - b;
              return (
                <div key={stage} className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark w-20">
                    {stage}
                  </span>
                  <span className="font-mono text-xs text-text-primary-light dark:text-text-primary-dark">
                    {b}
                  </span>
                  <span className="material-icons text-[12px] text-text-secondary-light dark:text-text-secondary-dark">
                    arrow_forward
                  </span>
                  <span className="font-mono text-xs font-bold text-text-primary-light dark:text-text-primary-dark">
                    {a}
                  </span>
                  {diff !== 0 && (
                    <span
                      className={`text-[10px] font-bold ml-auto ${
                        diff > 0 ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {result?.message && (
          <p className="text-[11px] text-amber-500">{result.message}</p>
        )}
        {leads.length === 0 && (
          <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark text-center">
            No lead data — impact simulation unavailable
          </p>
        )}
      </div>
    </Panel>
  );
}

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [rr, lr] = await Promise.allSettled([
        rulesApi.getAll(),
        leadsApi.getAll({ limit: 500 }),
      ]);
      if (rr.status === "fulfilled") {
        const r = rr.value;
        setRules(Array.isArray(r) ? r : r?.data?.rules || r?.data || r?.rules || []);
      }
      if (lr.status === "fulfilled") {
        const l = lr.value;
        setLeads(l?.data?.leads || l?.data || l?.leads || []);
      }
    } catch {
      setRules([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (form) => {
    try {
      const formattedName = form.eventType
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      await rulesApi.create({
        eventType: form.eventType,
        name: formattedName,
        points: form.points,
        description: form.description,
      });
      setCreating(false);
      load();
    } catch (err) {
      console.error("Failed to create rule:", err);
      throw err; // Added this so RuleEditor can show the red error box
    }
  };

  const handleUpdate = async (id, form) => {
    try {
      await rulesApi.update(id, form);
      setEditingId(null);
      load();
    } catch (err) {
      console.error("Failed to update rule:", err);
      throw err; // Added this so RuleEditor can show the red error box
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await rulesApi.delete(id);
      load();
    } catch (err) {
      console.error("Failed to delete rule:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="h-14 flex items-center justify-between px-6 border-b border-google-border bg-surface-light dark:bg-surface-dark shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
            Scoring Rules
          </h1>
          <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
            Define how events affect lead scores
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-blue-600 transition-colors"
        >
          <span className="material-icons text-[14px]">add</span>
          New Rule
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Rules list */}
          <div className="xl:col-span-2 space-y-3">
            {creating && (
              <RuleEditor
                onSave={handleCreate}
                onCancel={() => setCreating(false)}
              />
            )}
            {loading ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : rules.length === 0 && !creating ? (
              <Panel>
                <EmptyState
                  icon="rule"
                  title="No rules yet"
                  description="Create your first scoring rule to start scoring leads automatically"
                />
              </Panel>
            ) : (
              <Panel noPad>
                <PanelHeader
                  title={`Rules (${rules.length})`}
                  subtitle="Events matched against these rules update lead scores in real time"
                />
                <div className="divide-y divide-google-border">
                  {rules.map((rule) => (
                    <div key={rule._id}>
                      {editingId === rule._id ? (
                        <div className="p-4">
                          <RuleEditor
                            rule={{
                              eventType: rule.eventType || rule.event,
                              points: rule.points ?? rule.scoreIncrement ?? 0,
                              description: rule.description,
                            }}
                            onSave={(form) => handleUpdate(rule._id, form)}
                            onCancel={() => setEditingId(null)}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 group">
                          {/* Event type */}
                          <span className="font-mono text-sm font-bold text-text-primary-light dark:text-text-primary-dark w-44 shrink-0">
                            {rule.eventType || rule.event}
                          </span>
                          {/* Arrow */}
                          <span className="material-icons text-[16px] text-text-secondary-light dark:text-text-secondary-dark shrink-0">
                            arrow_forward
                          </span>
                          {/* Delta */}
                          <span
                            className={`font-bold text-sm w-16 shrink-0 ${(rule.points ?? rule.scoreIncrement ?? 0) >= 0 ? "text-emerald-500" : "text-red-500"}`}
                          >
                            {(rule.points ?? rule.scoreIncrement ?? 0) >= 0
                              ? `+${rule.points ?? rule.scoreIncrement ?? 0}`
                              : (rule.points ?? rule.scoreIncrement ?? 0)}
                          </span>
                          {/* Description */}
                          <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark flex-1 truncate">
                            {rule.description || "—"}
                          </span>
                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingId(rule._id)}
                              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-text-secondary-light dark:text-text-secondary-dark hover:text-primary"
                            >
                              <span className="material-icons text-[14px]">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() => handleDelete(rule._id)}
                              disabled={deletingId === rule._id}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-text-secondary-light dark:text-text-secondary-dark hover:text-red-500"
                            >
                              {deletingId === rule._id ? (
                                <Spinner size="sm" />
                              ) : (
                                <span className="material-icons text-[14px]">
                                  delete
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </div>

          {/* Simulators */}
          <div className="space-y-4">
            <RuleSimulator rules={rules} />
            <ImpactSimulator rules={rules} leads={leads} />
          </div>
        </div>
      </div>
    </div>
  );
}
