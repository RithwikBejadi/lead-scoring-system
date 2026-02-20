/**
 * RulesPage — scoring rule configuration center.
 * Shows rule list, editor modal, and live simulator.
 */

import { useState, useEffect, useCallback } from "react";
import { rulesApi } from "../../features/rules/rules.api";
import RulesTable from "./components/RulesTable";
import RuleEditor from "./components/RuleEditor";
import RuleSimulator from "./components/RuleSimulator";
import { Panel } from "../../shared/ui/Panel";
import { Spinner } from "../../shared/ui/Spinner";

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [error, setError] = useState(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await rulesApi.getAll();
      const arr = Array.isArray(res) ? res : (res.data || res.rules || []);
      setRules(arr);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      if (editingRule) {
        await rulesApi.update(editingRule._id || editingRule.id, data);
      } else {
        await rulesApi.create(data);
      }
      setEditorOpen(false);
      setEditingRule(null);
      await fetchRules();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this rule?")) return;
    try {
      await rulesApi.delete(id);
      setRules(prev => prev.filter(r => (r._id || r.id) !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  const openEdit = (rule) => {
    setEditingRule(rule);
    setEditorOpen(true);
  };

  const openNew = () => {
    setEditingRule(null);
    setEditorOpen(true);
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto flex flex-col gap-6">

      {editorOpen && (
        <RuleEditor
          rule={editingRule}
          onSave={handleSave}
          onCancel={() => { setEditorOpen(false); setEditingRule(null); }}
          loading={saving}
        />
      )}

      {/* Rules list */}
      <Panel
        title={`Scoring Rules (${rules.length})`}
        action={
          <button
            onClick={openNew}
            className="px-3 py-1 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
          >
            + Add Rule
          </button>
        }
      >
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : (
          <RulesTable rules={rules} onEdit={openEdit} onDelete={handleDelete} />
        )}
        {error && (
          <p className="px-4 py-2 text-xs font-mono text-red-400">{error}</p>
        )}
      </Panel>

      {/* Simulator */}
      <Panel title="Rule Simulator">
        <div className="p-4">
          <p className="text-xs text-neutral-600 mb-4">
            Paste a sample event and see which rules match and what score delta would be applied.
          </p>
          <RuleSimulator />
        </div>
      </Panel>

    </div>
  );
}
