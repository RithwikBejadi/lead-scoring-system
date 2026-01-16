/**
 * FILE: pages/ScoringRules.jsx
 * PURPOSE: Configure scoring rules (event types and point values)
 * DATA FLOW: Fetches /api/rules, updates via PUT /api/rules/:id
 * All buttons are functional - no dummy buttons
 */

import { useState, useEffect } from "react";
import { rulesApi } from "../api/rules.api";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { useToast } from "../context/ToastContext";

function ScoringRules() {
  const { showToast } = useToast();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [newRule, setNewRule] = useState({
    eventType: "",
    name: "",
    description: "",
    points: 10,
    active: true,
  });

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await rulesApi.getAll();
      setRules(data);
    } catch (err) {
      console.error("[ScoringRules] Load error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePointsChange = (id, newPoints) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule._id === id ? { ...rule, points: parseInt(newPoints) || 0 } : rule
      )
    );
  };

  const handleActiveToggle = (id) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule._id === id ? { ...rule, active: !rule.active } : rule
      )
    );
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      await Promise.all(
        rules.map((rule) =>
          rulesApi.update(rule._id, {
            points: rule.points,
            active: rule.active,
          })
        )
      );
      showToast("Rules saved successfully!", "success");
    } catch (err) {
      console.error("[ScoringRules] Save error:", err);
      showToast("Error saving rules: " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddRule = async () => {
    if (!newRule.eventType || !newRule.name) {
      showToast("Event type and name are required", "error");
      return;
    }

    try {
      const created = await rulesApi.create(newRule);
      setRules((prev) => [...prev, created]);
      setShowAddModal(false);
      setNewRule({
        eventType: "",
        name: "",
        description: "",
        points: 10,
        active: true,
      });
      showToast("Rule created successfully!", "success");
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to create rule", "error");
    }
  };

  const handleDeleteRule = async (id) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;

    try {
      await rulesApi.delete(id);
      setRules((prev) => prev.filter((r) => r._id !== id));
      showToast("Rule deleted", "success");
    } catch (err) {
      showToast("Failed to delete rule", "error");
    }
  };

  const handleEditRule = (rule) => {
    setEditingRule({ ...rule });
  };

  const handleSaveEdit = async () => {
    try {
      await rulesApi.update(editingRule._id, {
        name: editingRule.name,
        description: editingRule.description,
        points: editingRule.points,
        active: editingRule.active,
      });
      setRules((prev) =>
        prev.map((r) => (r._id === editingRule._id ? editingRule : r))
      );
      setEditingRule(null);
      showToast("Rule updated!", "success");
    } catch (err) {
      showToast("Failed to update rule", "error");
    }
  };

  const getEventIcon = (eventType) => {
    const icons = {
      webinar_attendance: "cast_for_education",
      pricing_page_visit: "payments",
      email_open: "mail",
      demo_request: "rocket_launch",
      form_submit: "description",
      page_view: "visibility",
      signup: "person_add",
      unsubscribe: "unsubscribe",
      contract_signed: "handshake",
      download: "download",
    };
    return icons[eventType] || "event";
  };

  const getEventColor = (points) => {
    if (points >= 50) return "bg-indigo-50 text-indigo-600";
    if (points >= 20) return "bg-green-50 text-green-600";
    if (points >= 10) return "bg-blue-50 text-blue-600";
    if (points < 0) return "bg-red-50 text-red-600";
    return "bg-slate-50 text-slate-600";
  };

  const activeRules = rules.filter((r) => r.active);
  const maxScore = activeRules
    .filter((r) => r.points > 0)
    .reduce((sum, r) => sum + r.points, 0);
  const disabledCount = rules.filter((r) => !r.active).length;

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm">Loading rules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background-light">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-red-500 mb-2">
            error
          </span>
          <p className="text-red-500">Error: {error}</p>
          <button
            onClick={loadRules}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          title="Scoring Logic Configuration"
          subtitle="Define point values for user behaviors. Changes affect lead scoring immediately."
          actions={
            <>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">
                  add
                </span>
                Add Rule
              </button>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary-dark transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">
                  save
                </span>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          }
        />

        <div className="flex-1 overflow-auto custom-scrollbar p-8">
          <div className="mx-auto max-w-6xl flex flex-col gap-6">
            {/* Mini Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Active Rules
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-1 group-hover:text-primary transition-colors">
                    {activeRules.length}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">rule</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Max Score Possible
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-1 group-hover:text-primary transition-colors">
                    {maxScore}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <span className="material-symbols-outlined">trending_up</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Rules Disabled
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {disabledCount}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500">
                  <span className="material-symbols-outlined">block</span>
                </div>
              </div>
            </div>

            {/* Configuration Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 w-1/4">
                        Event Name
                      </th>
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 w-1/3">
                        Description
                      </th>
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                        Points
                      </th>
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                        Status
                      </th>
                      <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rules.map((rule) => (
                      <tr
                        key={rule._id}
                        className={`group hover:bg-slate-50 transition-colors ${
                          !rule.active ? "opacity-60" : ""
                        } ${rule.points < 0 ? "bg-red-50/30" : ""}`}
                      >
                        <td className="py-5 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${getEventColor(
                                rule.points
                              )}`}
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                {getEventIcon(rule.eventType)}
                              </span>
                            </div>
                            <span className="font-semibold text-slate-900 text-sm">
                              {rule.name || rule.eventType}
                            </span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <p className="text-sm text-slate-500 truncate max-w-xs">
                            {rule.description || "No description"}
                          </p>
                        </td>
                        <td className="py-5 px-6 text-center">
                          <div className="relative inline-block w-24">
                            <input
                              type="number"
                              value={rule.points}
                              onChange={(e) =>
                                handlePointsChange(rule._id, e.target.value)
                              }
                              disabled={!rule.active}
                              className={`w-full px-3 py-2 text-center text-sm font-bold border rounded-lg focus:ring-2 focus:ring-primary transition-all shadow-sm ${
                                rule.points < 0
                                  ? "text-red-600 border-red-200 focus:ring-red-500"
                                  : "text-slate-900 border-slate-300"
                              } ${
                                !rule.active
                                  ? "bg-slate-50 cursor-not-allowed"
                                  : "bg-white"
                              }`}
                            />
                            <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                              <span
                                className={`text-xs font-medium ${
                                  rule.points < 0
                                    ? "text-red-300"
                                    : "text-slate-400"
                                }`}
                              >
                                pts
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-6 text-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={rule.active}
                              onChange={() => handleActiveToggle(rule._id)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleEditRule(rule)}
                              className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                              title="Edit rule"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule._id)}
                              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete rule"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                delete
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Rule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Add New Scoring Rule
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Event Type (unique key)
                </label>
                <input
                  type="text"
                  value={newRule.eventType}
                  onChange={(e) =>
                    setNewRule({
                      ...newRule,
                      eventType: e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "_"),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., webinar_signup"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) =>
                    setNewRule({ ...newRule, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., Webinar Signup"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newRule.description}
                  onChange={(e) =>
                    setNewRule({ ...newRule, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="What this event means..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Points
                </label>
                <input
                  type="number"
                  value={newRule.points}
                  onChange={(e) =>
                    setNewRule({
                      ...newRule,
                      points: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRule}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark"
              >
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Rule Modal */}
      {editingRule && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Edit Rule: {editingRule.eventType}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editingRule.name}
                  onChange={(e) =>
                    setEditingRule({ ...editingRule, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={editingRule.description || ""}
                  onChange={(e) =>
                    setEditingRule({
                      ...editingRule,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Points
                </label>
                <input
                  type="number"
                  value={editingRule.points}
                  onChange={(e) =>
                    setEditingRule({
                      ...editingRule,
                      points: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingRule(null)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScoringRules;
