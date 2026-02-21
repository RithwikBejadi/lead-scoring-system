import React from "react";

const AuditTrail = () => {
  return (
    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-card overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
        <h3 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
          Recent Audit Trail
        </h3>
        <div className="flex gap-2">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse mt-1"></span>
          <span className="text-xs text-text-secondary-light">Live Feed</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-0 bg-background-light dark:bg-background-dark font-mono text-xs">
        <div className="divide-y divide-border-light dark:divide-border-dark">
          <div className="p-3 hover:bg-white dark:hover:bg-surface-dark transition-colors flex gap-3 items-start border-l-2 border-transparent hover:border-primary">
            <span className="text-text-secondary-light whitespace-nowrap">
              10:42:05
            </span>
            <div className="flex-1">
              <span className="text-primary font-medium">lead.scored</span>
              <span className="text-text-primary-light dark:text-text-primary-dark">
                {" "}
                — John Doe reached 98 pts
              </span>
            </div>
            <span className="text-success font-medium">+20pts</span>
          </div>
          <div className="p-3 hover:bg-white dark:hover:bg-surface-dark transition-colors flex gap-3 items-start border-l-2 border-transparent hover:border-primary">
            <span className="text-text-secondary-light whitespace-nowrap">
              10:41:58
            </span>
            <div className="flex-1">
              <span className="text-blue-500 font-medium">event.ingest</span>
              <span className="text-text-primary-light dark:text-text-primary-dark">
                {" "}
                — page_view: /pricing
              </span>
            </div>
            <span className="text-text-secondary-light">RAW</span>
          </div>
          <div className="p-3 hover:bg-white dark:hover:bg-surface-dark transition-colors flex gap-3 items-start border-l-2 border-transparent hover:border-primary">
            <span className="text-text-secondary-light whitespace-nowrap">
              10:41:45
            </span>
            <div className="flex-1">
              <span className="text-warning font-medium">
                automation.trigger
              </span>
              <span className="text-text-primary-light dark:text-text-primary-dark">
                {" "}
                — Email: "Enterprise Welcome"
              </span>
            </div>
            <span className="text-text-secondary-light">Sent</span>
          </div>
          <div className="p-3 hover:bg-white dark:hover:bg-surface-dark transition-colors flex gap-3 items-start border-l-2 border-transparent hover:border-primary">
            <span className="text-text-secondary-light whitespace-nowrap">
              10:41:12
            </span>
            <div className="flex-1">
              <span className="text-primary font-medium">lead.update</span>
              <span className="text-text-primary-light dark:text-text-primary-dark">
                {" "}
                — Sarah Miller profile enriched
              </span>
            </div>
            <span className="text-success font-medium">+5pts</span>
          </div>
          <div className="p-3 hover:bg-white dark:hover:bg-surface-dark transition-colors flex gap-3 items-start border-l-2 border-transparent hover:border-primary">
            <span className="text-text-secondary-light whitespace-nowrap">
              10:40:55
            </span>
            <div className="flex-1">
              <span className="text-error font-medium">worker.fail</span>
              <span className="text-text-primary-light dark:text-text-primary-dark">
                {" "}
                — Job #45920 failed (timeout)
              </span>
            </div>
            <span className="text-error">Retry</span>
          </div>
          <div className="p-3 hover:bg-white dark:hover:bg-surface-dark transition-colors flex gap-3 items-start border-l-2 border-transparent hover:border-primary">
            <span className="text-text-secondary-light whitespace-nowrap">
              10:40:30
            </span>
            <div className="flex-1">
              <span className="text-blue-500 font-medium">event.ingest</span>
              <span className="text-text-primary-light dark:text-text-primary-dark">
                {" "}
                — webinar_signup: "Q3 Roadmap"
              </span>
            </div>
            <span className="text-text-secondary-light">RAW</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTrail;
