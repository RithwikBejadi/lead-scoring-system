import React, { useState, useEffect, useCallback } from "react";
import { rulesApi } from "../api/rules.api";

// ── Rule Row ───────────────────────────────────────────────────────────────────
function RuleRow({ rule, onEdit, onDelete }) {
  return (
    <tr className="border-b border-google-border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-4 py-3 text-sm font-medium">{rule.name}</td>
      <td className="px-4 py-3">
        <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded">
          {rule.eventType}
        </span>
      </td>
      <td className="px-4 py-3 text-sm">{rule.condition || "always"}</td>
      <td className="px-4 py-3">
        <span
          className={`text-sm font-bold ${rule.points >= 0 ? "text-green-600" : "text-red-500"}`}
        >
          {rule.points >= 0 ? "+" : ""}
          {rule.points}
        </span>
      </td>
      <td className="px-4 py-3">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            rule.active !== false
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-slate-100 dark:bg-slate-700 text-slate-500"
          }`}
        >
          {rule.active !== false ? "active" : "inactive"}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onEdit(rule)}
          className="text-xs text-primary hover:underline mr-3"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(rule._id)}
          className="text-xs text-red-500 hover:underline"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

// ── Rule Editor Modal ──────────────────────────────────────────────────────────
function RuleModal({ rule, onClose, onSave }) {
  const [form, setForm] = useState(
    rule || { name: "", eventType: "", points: 0, condition: "", active: true },
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  const handleSave = async () => {
    if (!form.name || !form.eventType) {
      setErr("Name and event type are required.");
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      if (rule?._id) {
        await rulesApi.update(rule._id, form);
      } else {
        await rulesApi.create(form);
      }
      onSave();
    } catch (e) {
      setErr(e.response?.data?.message || e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">
            {rule?._id ? "Edit Rule" : "New Rule"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
          >
            <span className="material-icons text-lg">close</span>
          </button>
        </div>

        {err && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
            {err}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Rule Name</label>
            <input
              className="w-full border border-google-border rounded-md px-3 py-2 text-sm bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Pricing Page View"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Event Type</label>
            <input
              className="w-full border border-google-border rounded-md px-3 py-2 text-sm font-mono bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.eventType}
              onChange={(e) =>
                setForm((f) => ({ ...f, eventType: e.target.value }))
              }
              placeholder="e.g. PRICING_VIEW"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Points</label>
            <input
              type="number"
              className="w-full border border-google-border rounded-md px-3 py-2 text-sm bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.points}
              onChange={(e) =>
                setForm((f) => ({ ...f, points: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">
              Condition (optional)
            </label>
            <input
              className="w-full border border-google-border rounded-md px-3 py-2 text-sm bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.condition || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, condition: e.target.value }))
              }
              placeholder="e.g. properties.plan === 'enterprise'"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active-toggle"
              checked={form.active !== false}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="active-toggle" className="text-sm">
              Active
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm border border-google-border rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save Rule"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Simulator Panel ────────────────────────────────────────────────────────────
function SimulatorPanel({ rules }) {
  const [eventType, setEventType] = useState("");
  const [result, setResult] = useState(null);

  const simulate = () => {
    if (!eventType.trim()) return;
    const matched = rules.filter(
      (r) => r.active !== false && r.eventType === eventType.trim(),
    );
    const total = matched.reduce((sum, r) => sum + (r.points || 0), 0);
    setResult({ matched, total });
  };

  return (
    <div className="p-4 border border-google-border rounded-xl">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <span className="material-icons text-base text-primary">science</span>
        Score Simulator
      </h3>
      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-3">
        Enter an event type to see which rules fire and the total score impact.
      </p>
      <div className="flex gap-2">
        <input
          className="flex-1 border border-google-border rounded-md px-3 py-2 text-sm font-mono bg-background-light dark:bg-background-dark focus:outline-none focus:ring-2 focus:ring-primary"
          value={eventType}
          onChange={(e) => setEventType(e.target.value.toUpperCase())}
          placeholder="e.g. PRICING_VIEW"
          onKeyDown={(e) => e.key === "Enter" && simulate()}
        />
        <button
          onClick={simulate}
          className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Simulate
        </button>
      </div>

      {result && (
        <div className="mt-3 space-y-2">
          <div
            className={`text-sm font-bold ${result.total >= 0 ? "text-green-600" : "text-red-500"}`}
          >
            Score delta: {result.total >= 0 ? "+" : ""}
            {result.total} pts
          </div>
          {result.matched.length === 0 ? (
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              No active rules match this event.
            </p>
          ) : (
            <ul className="space-y-1">
              {result.matched.map((r) => (
                <li key={r._id} className="flex justify-between text-xs">
                  <span>{r.name}</span>
                  <span className="font-semibold text-green-600">
                    {r.points >= 0 ? "+" : ""}
                    {r.points}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editRule, setEditRule] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadRules = useCallback(async () => {
    try {
      setError(null);
      const res = await rulesApi.getAll();
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.rules || res || [];
      setRules(Array.isArray(list) ? list : []);
    } catch (err) {
      if (!err.response) {
        setError("Cannot reach backend. Is the API running?");
      } else {
        setError(err.response?.data?.message || err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRules();
  }, [loadRules]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this rule?")) return;
    try {
      await rulesApi.delete(id);
      showToast("Rule deleted");
      loadRules();
    } catch (e) {
      showToast(e.response?.data?.message || "Delete failed", "error");
    }
  };

  const handleSave = () => {
    setShowModal(false);
    setEditRule(null);
    showToast("Rule saved successfully");
    loadRules();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-white ${
            toast.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {showModal && (
        <RuleModal
          rule={editRule}
          onClose={() => {
            setShowModal(false);
            setEditRule(null);
          }}
          onSave={handleSave}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-google-border bg-surface-light dark:bg-surface-dark flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <span className="material-icons text-primary text-xl">rule</span>
            Scoring Rules
          </h1>
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
            {rules.length} rules configured · changes apply to all future events
          </p>
        </div>
        <button
          onClick={() => {
            setEditRule(null);
            setShowModal(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          <span className="material-icons text-sm">add</span>
          New Rule
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center h-48 gap-3 text-text-secondary-light dark:text-text-secondary-dark">
              <span className="material-icons animate-spin">sync</span>
              Loading rules…
            </div>
          )}
          {error && (
            <div className="m-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <span className="material-icons text-red-500 mt-0.5 text-lg">
                error_outline
              </span>
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                  Failed to load rules
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">
                  {error}
                </p>
                <button
                  onClick={loadRules}
                  className="mt-2 text-xs text-red-600 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          {!loading && !error && rules.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-text-secondary-light dark:text-text-secondary-dark">
              <span className="material-icons text-4xl mb-2 opacity-30">
                rule
              </span>
              <p className="text-sm font-medium">No scoring rules yet</p>
              <button
                onClick={() => {
                  setEditRule(null);
                  setShowModal(true);
                }}
                className="mt-3 text-xs text-primary underline"
              >
                Create your first rule
              </button>
            </div>
          )}
          {!loading && !error && rules.length > 0 && (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-surface-light dark:bg-surface-dark border-b border-google-border z-10">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                    Event Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                    Condition
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                    Points
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                    Status
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <RuleRow
                    key={r._id}
                    rule={r}
                    onEdit={(rule) => {
                      setEditRule(rule);
                      setShowModal(true);
                    }}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Simulator sidebar */}
        <aside className="w-72 flex-shrink-0 border-l border-google-border p-4 overflow-y-auto bg-surface-light dark:bg-surface-dark">
          <SimulatorPanel rules={rules} />
        </aside>
      </div>
    </div>
  );
}
