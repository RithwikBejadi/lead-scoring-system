import React, { useState, useEffect } from "react";
import { analyticsApi } from "../../api/analytics.api";

const ScoreMutations = ({ onNavigateLeads }) => {
  const [mutations, setMutations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScoreMutations();
    // Refresh every 15 seconds
    const interval = setInterval(loadScoreMutations, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadScoreMutations = async () => {
    try {
      const response = await analyticsApi.getScoreMutations(10);
      if (response.success) {
        setMutations(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load score mutations:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-light dark:bg-surface-dark border border-google-border rounded-lg shadow-sm">
      <div className="p-4 border-b border-google-border flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
          Recent Score Mutations
        </h4>
        <button
          onClick={onNavigateLeads}
          className="text-primary text-[11px] font-bold hover:underline"
        >
          View All
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-text-secondary-light dark:text-text-secondary-dark font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Lead Entity</th>
              <th className="px-4 py-3">Event Type</th>
              <th className="px-4 py-3 text-center">Delta</th>
              <th className="px-4 py-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-google-border">
            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-6 text-center text-text-secondary-light dark:text-text-secondary-dark"
                >
                  Loading...
                </td>
              </tr>
            ) : mutations.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-6 text-center text-text-secondary-light dark:text-text-secondary-dark"
                >
                  No recent score mutations
                </td>
              </tr>
            ) : (
              mutations.map((mutation, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-text-primary-light dark:text-text-primary-dark">
                    {mutation.leadIdentifier}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
                      {mutation.eventType}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-center font-bold ${mutation.delta >= 0 ? "text-success" : "text-error"}`}
                  >
                    {mutation.delta >= 0
                      ? `+${mutation.delta || 5}`
                      : mutation.delta}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-text-primary-light dark:text-text-primary-dark">
                    {mutation.score}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreMutations;
