/**
 * FILE: pages/ScoringRules.jsx
 * PURPOSE: Configure scoring rules (event types and point values)
 * DATA FLOW: Fetches /api/rules, updates via PUT /api/rules/:id
 */

import { useState, useEffect } from 'react';
import { rulesApi } from '../api/rules.api';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

function ScoringRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await rulesApi.getAll();
      setRules(data);
    } catch (err) {
      console.error('[ScoringRules] Load error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePointsChange = (id, newPoints) => {
    setRules(prev => prev.map(rule => 
      rule._id === id ? { ...rule, points: parseInt(newPoints) || 0 } : rule
    ));
  };

  const handleActiveToggle = (id) => {
    setRules(prev => prev.map(rule => 
      rule._id === id ? { ...rule, active: !rule.active } : rule
    ));
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      // Update all rules
      await Promise.all(
        rules.map(rule => rulesApi.update(rule._id, { points: rule.points, active: rule.active }))
      );
      alert('Rules saved successfully!');
    } catch (err) {
      console.error('[ScoringRules] Save error:', err);
      alert('Error saving rules: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getEventIcon = (eventType) => {
    const icons = {
      webinar_attendance: 'cast_for_education',
      pricing_page_visit: 'payments',
      email_open: 'mail',
      demo_request: 'rocket_launch',
      form_submit: 'description',
      page_view: 'visibility',
      signup: 'person_add'
    };
    return icons[eventType] || 'event';
  };

  const getEventColor = (points) => {
    if (points >= 50) return 'bg-indigo-50 text-indigo-600';
    if (points >= 20) return 'bg-green-50 text-green-600';
    if (points >= 10) return 'bg-blue-50 text-blue-600';
    if (points < 0) return 'bg-red-50 text-red-600';
    return 'bg-slate-50 text-slate-600';
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading rules...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f6f7f8]">
      <Sidebar />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <Header 
          title="Scoring Logic Configuration"
          subtitle="Define point values for user behaviors. Changes affect lead scoring immediately."
          actions={
            <button 
              onClick={handleSaveAll} 
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[#2c5181] rounded-lg hover:bg-[#234168] shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">save</span>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          }
        />

        <div className="flex-1 overflow-auto p-8">
          <div className="mx-auto max-w-6xl">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Total Active Rules</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{rules.filter(r => r.active).length}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Max Score Possible</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {rules.filter(r => r.active && r.points > 0).reduce((sum, r) => sum + r.points, 0)}
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-sm font-medium text-slate-500">Rules Disabled</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{rules.filter(r => !r.active).length}</p>
              </div>
            </div>

            {/* Rules Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">Event Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">Description</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-slate-500">Points</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rules.map((rule) => (
                    <tr key={rule._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getEventColor(rule.points)}`}>
                            <span className="material-symbols-outlined text-[20px]">{getEventIcon(rule.eventType)}</span>
                          </div>
                          <span className="font-semibold text-slate-900 text-sm">{rule.name || rule.eventType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-slate-500 max-w-xs">{rule.description || 'No description'}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <input
                          type="number"
                          value={rule.points}
                          onChange={(e) => handlePointsChange(rule._id, e.target.value)}
                          className={`w-24 px-3 py-2 text-center text-sm font-bold border rounded-lg focus:ring-2 focus:ring-[#2c5181] ${rule.points < 0 ? 'text-red-600 border-red-200' : 'text-slate-900 border-slate-300'}`}
                        />
                      </td>
                      <td className="px-6 py-5 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rule.active}
                            onChange={() => handleActiveToggle(rule._id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2c5181]"></div>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ScoringRules;
