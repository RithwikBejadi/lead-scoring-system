import React, { useState, useEffect } from "react";
import { analyticsApi } from "../../api/analytics.api";

const ThroughputChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThroughputData();
    // Refresh every 30 seconds
    const interval = setInterval(loadThroughputData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadThroughputData = async () => {
    try {
      const response = await analyticsApi.getThroughputData(24);
      if (response.success) {
        setData(response.data || []);
      }
    } catch (error) {
      console.error("Failed to load throughput data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate max value for scaling
  const maxEvents = Math.max(...data.map((d) => d.events || 0), 1);
  const maxMutations = Math.max(...data.map((d) => d.mutations || 0), 1);
  const maxValue = Math.max(maxEvents, maxMutations);

  return (
    <div className="col-span-12 lg:col-span-8 bg-surface-light dark:bg-surface-dark border border-google-border rounded-lg shadow-sm flex flex-col">
      <div className="p-4 border-b border-google-border flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
          Event Throughput & Score Trends
        </h4>
        <div className="flex items-center space-x-2">
          <span className="flex items-center text-[10px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
            <span className="w-3 h-3 bg-primary rounded-sm mr-1.5"></span>{" "}
            Throughput (events)
          </span>
          <span className="flex items-center text-[10px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
            <span className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded-sm mr-1.5"></span>{" "}
            Score Mutations
          </span>
        </div>
      </div>
      <div className="flex-1 p-4 min-h-[320px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
              Loading...
            </span>
          </div>
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
              No data available
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-end px-8 pb-10 space-x-2">
            {data.slice(-12).map((item, i) => {
              const eventsHeight = (item.events / maxValue) * 250;
              const mutationsHeight = (item.mutations / maxValue) * 250;
              return (
                <div key={i} className="relative flex-1 group">
                  <div
                    className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-sm"
                    style={{ height: `${mutationsHeight}px` }}
                    title={`${item.mutations} mutations`}
                  ></div>
                  <div
                    className="absolute bottom-0 w-full bg-primary/20 border-t-2 border-primary rounded-t-sm"
                    style={{ height: `${eventsHeight}px` }}
                    title={`${item.events} events`}
                  ></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThroughputChart;
