import React, { useState, useEffect } from "react";
import { analyticsApi } from "../../api/analytics.api";

const QueueHealth = () => {
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQueueHealth();
    // Refresh every 10 seconds
    const interval = setInterval(loadQueueHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadQueueHealth = async () => {
    try {
      const response = await analyticsApi.getQueueHealth();
      if (response.success) {
        setQueueData(response.data);
      }
    } catch (error) {
      console.error("Failed to load queue health:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !queueData) {
    return (
      <div className="col-span-12 lg:col-span-4 bg-surface-light dark:bg-surface-dark border border-google-border rounded-lg shadow-sm">
        <div className="p-4 border-b border-google-border">
          <h4 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
            Queue Health (Bull/Redis)
          </h4>
        </div>
        <div className="p-6 flex items-center justify-center">
          <span className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  const { waiting, active, completed, failed, workers, maxWorkers } = queueData;
  const workerPercentage = (workers / maxWorkers) * 100;
  const waitingPercentage = Math.min((waiting / 5000) * 100, 100);

  return (
    <div className="col-span-12 lg:col-span-4 bg-surface-light dark:bg-surface-dark border border-google-border rounded-lg shadow-sm">
      <div className="p-4 border-b border-google-border">
        <h4 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
          Queue Health (Bull/Redis)
        </h4>
      </div>
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Waiting Jobs
              </span>
              <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                {waiting.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${waitingPercentage}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Active Workers
              </span>
              <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                {workers} / {maxWorkers}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div
                className="bg-success h-2 rounded-full"
                style={{ width: `${workerPercentage}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Completed (1h)
              </span>
              <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                {completed >= 1000
                  ? `${(completed / 1000).toFixed(1)}k`
                  : completed}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div
                className="bg-slate-300 dark:bg-slate-600 h-2 rounded-full"
                style={{ width: "85%" }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Failed Retries
              </span>
              <span
                className={`font-semibold ${failed > 0 ? "text-error" : "text-success"}`}
              >
                {failed}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div
                className={
                  failed > 0
                    ? "bg-error h-2 rounded-full"
                    : "bg-success h-2 rounded-full"
                }
                style={{ width: failed > 0 ? "5%" : "1%" }}
              ></div>
            </div>
          </div>
        </div>
        {failed > 10 && (
          <div className="pt-4 mt-6 border-t border-google-border">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-md p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="material-icons text-error text-lg">
                  report_problem
                </span>
                <span className="text-xs font-bold text-red-700 dark:text-red-400">
                  Dead Letter Queue
                </span>
              </div>
              <span className="px-2 py-0.5 bg-error text-white text-[10px] font-bold rounded-full">
                {failed} Alerts
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueHealth;
