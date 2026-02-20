/**
 * AutomationsPage — webhook/automation management.
 * Developer-first: shows reliability signals.
 */

import { useState, useEffect, useCallback } from "react";
import { automationsApi } from "../../features/automations/automations.api";
import AutomationList from "./components/AutomationList";
import WebhookPreview from "./components/WebhookPreview";
import { Panel } from "../../shared/ui/Panel";
import { Spinner } from "../../shared/ui/Spinner";

function NewWebhookModal({ onSave, onCancel, loading }) {
  const [form, setForm] = useState({ name: "", url: "", trigger: "lead.score_updated" });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#171717] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="text-sm font-medium text-white">New Webhook</h3>
          <button onClick={onCancel} className="text-neutral-600 hover:text-neutral-300">
            ✕
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">
          {[
            { label: "Name", key: "name", placeholder: "My webhook" },
            { label: "URL", key: "url", placeholder: "https://hook.example.com/lead" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-1.5 block">{f.label}</label>
              <input
                type="text"
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full bg-[#0d0d0d] border border-white/5 rounded px-3 py-2 text-sm font-mono text-neutral-300 placeholder-neutral-700 focus:outline-none focus:border-white/20"
              />
            </div>
          ))}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-600 mb-1.5 block">Trigger</label>
            <select
              value={form.trigger}
              onChange={e => setForm(p => ({ ...p, trigger: e.target.value }))}
              className="w-full bg-[#0d0d0d] border border-white/5 rounded px-3 py-2 text-sm text-neutral-400 focus:outline-none"
            >
              <option value="lead.score_updated">lead.score_updated</option>
              <option value="lead.identified">lead.identified</option>
              <option value="lead.created">lead.created</option>
              <option value="event.received">event.received</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-white/5">
          <button onClick={onCancel} className="px-4 py-1.5 text-sm text-neutral-500">Cancel</button>
          <button
            onClick={() => onSave(form)}
            disabled={loading || !form.url}
            className="px-4 py-1.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [testMsg, setTestMsg] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await automationsApi.getAll();
      const arr = Array.isArray(res) ? res : (res.data || res.webhooks || []);
      setAutomations(arr);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      await automationsApi.create(data);
      setModalOpen(false);
      await fetchAll();
    } catch {} finally { setSaving(false); }
  };

  const handleTest = async (id) => {
    setTestMsg(null);
    try {
      const res = await automationsApi.test(id);
      setTestMsg({ ok: true, msg: res.message || "Test sent successfully" });
    } catch (e) {
      setTestMsg({ ok: false, msg: e.response?.data?.error || "Test failed" });
    }
    setTimeout(() => setTestMsg(null), 4000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this webhook?")) return;
    try {
      await automationsApi.delete(id);
      setAutomations(prev => prev.filter(a => (a._id || a.id) !== id));
      if (selected?._id === id || selected?.id === id) setSelected(null);
    } catch {}
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto flex flex-col gap-6">

      {modalOpen && (
        <NewWebhookModal
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
          loading={saving}
        />
      )}

      {testMsg && (
        <div className={`fixed bottom-6 right-6 px-4 py-2.5 rounded-lg border text-xs font-mono shadow-xl z-50 ${
          testMsg.ok
            ? "bg-emerald-950 border-emerald-700 text-emerald-400"
            : "bg-red-950 border-red-700 text-red-400"
        }`}>
          {testMsg.msg}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <Panel
          title={`Webhooks (${automations.length})`}
          action={
            <button
              onClick={() => setModalOpen(true)}
              className="px-3 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
            >
              + Add Webhook
            </button>
          }
        >
          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : (
            <AutomationList
              automations={automations}
              onTest={handleTest}
              onDelete={handleDelete}
            />
          )}
        </Panel>

        <Panel title="Payload Preview">
          <WebhookPreview webhook={selected || automations[0] || null} />
        </Panel>
      </div>
    </div>
  );
}
