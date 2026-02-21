import React from "react";

const QueueMonitor = () => {
  return (
    <div className="lg:col-span-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-5 shadow-card flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
          Bull Queue Status
        </h3>
        <span className="flex items-center gap-1.5 text-xs text-success font-medium bg-success/10 px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></span>{" "}
          Live
        </span>
      </div>
      {/* Donut Chart & Legend */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-6 justify-center mb-6">
          {/* CSS Conic Gradient for Donut */}
          <div
            className="relative w-32 h-32 rounded-full flex items-center justify-center"
            style={{
              background:
                "conic-gradient(#1e8e3e 0% 70%, #f9ab00 70% 85%, #2b6cee 85% 98%, #d93025 98% 100%)",
            }}
          >
            <div className="absolute w-24 h-24 bg-surface-light dark:bg-surface-dark rounded-full flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                98%
              </span>
              <span className="text-[10px] uppercase text-text-secondary-light">
                Health
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Completed
              </span>
            </div>
            <span className="font-medium">14,205</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Active
              </span>
            </div>
            <span className="font-medium">42</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-warning"></span>
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Waiting
              </span>
            </div>
            <span className="font-medium">189</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-error"></span>
              <span className="text-text-secondary-light dark:text-text-secondary-dark">
                Failed
              </span>
            </div>
            <span className="font-medium text-error">12</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueMonitor;
