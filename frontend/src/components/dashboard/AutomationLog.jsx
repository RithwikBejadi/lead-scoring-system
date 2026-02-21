import React, { useState, useEffect } from "react";
import { analyticsApi } from "../../api/analytics.api";

const AutomationLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAutomationLogs();
    // Refresh every 10 seconds
    const interval = setInterval(loadAutomationLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadAutomationLogs = async () => {
    try {
      const response = await analyticsApi.getAutomationLogs(15);
      if (response.success) {
        setLogs(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load automation logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour12: false });
  };

  return (
    <div className="bg-surface-light dark:bg-surface-dark border border-google-border rounded-lg shadow-sm flex flex-col">
      <div className="p-4 border-b border-google-border flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
          Live Automation Log
        </h4>
        <div className="flex space-x-2">
          <span className="flex items-center text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse mr-1.5 display-inline-block"></span>{" "}
            {loading ? "Loading" : "Streaming"}
          </span>
        </div>
      </div>
      <div className="flex-1 p-4 font-mono text-[11px] space-y-2 overflow-y-auto max-h-[300px]">
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <span className="text-text-secondary-light dark:text-text-secondary-dark">
              Loading automation logs...
            </span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex justify-center items-center py-4">
            <span className="text-text-secondary-light dark:text-text-secondary-dark">
              No automation events yet
            </span>
          </div>
        ) : (
          logs.map((log, idx) => (
            <div
              key={idx}
              className="flex space-x-2 border-l-2 border-primary pl-2 bg-primary/5 py-0.5"
            >
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                [{formatTime(log.timestamp)}]
              </span>
              <span className="text-primary font-bold">{log.type}:</span>
              <span className="text-text-primary-light dark:text-text-primary-dark">
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AutomationLog;
