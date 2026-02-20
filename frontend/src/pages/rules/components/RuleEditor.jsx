/**
 * RuleEditor — modal/panel to create or edit a scoring rule.
 */

import { useState } from "react";

const EMPTY = {
  eventName: "",
  scoreChange: 10,
  conditions: "",
};

export default function RuleEditor({ rule, onSave, onCancel, loading }) {
  const [form, setForm] = useState(
    rule
      ? {
          eventName: rule.eventName || rule.name || "",
          scoreChange: rule.scoreChange ?? rule.delta ?? 10,
          conditions: rule.conditions ? JSON.stringify(rule.conditions, null, 2) : "",
        }
      : EMPTY
  );
  const [condError, setCondError] = useState(null);

  const handleSubmit = () => {
    let conditions = {};
    if (form.conditions.trim()) {
      try {
        conditions = JSON.parse(form.conditions);
        setCondError(null);
      } catch (e) {
        setCondError("Invalid JSON in conditions");
        return;
      }
    }
    onSave({
      eventName: form.eventName.trim(),
      scoreChange: Number(form.scoreChange),
      conditions,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#171717] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="text-sm font-medium text-white">
            {rule ? "Edit Rule" : "New Rule"}
          </h3>
          <button
            onClick={onCancel}
            className="text-neutral-600 hover:text-neutral-300 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-1.5 block">
              Event Name *
            </label>
            <input
              type="text"
              placeholder="page_view, signup_clicked, …"
              value={form.eventName}
              onChange={e => setForm(p => ({ ...p, eventName: e.target.value }))}
              className="w-full bg-[#0d0d0d] border border-white/5 rounded px-3 py-2 text-sm font-mono text-neutral-300 placeholder-neutral-700 focus:outline-none focus:border-white/20"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-1.5 block">
              Score Delta
            </label>
            <input
              type="number"
              value={form.scoreChange}
              onChange={e => setForm(p => ({ ...p, scoreChange: e.target.value }))}
              className="w-full bg-[#0d0d0d] border border-white/5 rounded px-3 py-2 text-sm font-mono text-neutral-300 focus:outline-none focus:border-white/20"
            />
            <p className="text-[10px] text-neutral-700 mt-1">
              Positive = add, Negative = subtract
            </p>
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-1.5 block">
              Conditions (JSON, optional)
            </label>
            <textarea
              rows={3}
              placeholder={'{"properties.page": "/pricing"}'}
              value={form.conditions}
              onChange={e => setForm(p => ({ ...p, conditions: e.target.value }))}
              className="w-full bg-[#0d0d0d] border border-white/5 rounded px-3 py-2 text-xs font-mono text-neutral-300 placeholder-neutral-700 focus:outline-none focus:border-white/20 resize-none"
            />
            {condError && (
              <p className="text-[10px] text-red-400 mt-1">{condError}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/5">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !form.eventName.trim()}
            className="px-4 py-1.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving…" : rule ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
