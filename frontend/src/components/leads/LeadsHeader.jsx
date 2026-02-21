import React, { useState } from "react";
import { leadsApi } from "../../api/leads.api";

const LeadsHeader = ({ onRefresh, searchQuery, onSearch }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await leadsApi.exportCSV();
    } catch (error) {
      console.error("Failed to export leads:", error);
      alert("Failed to export leads. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="border-b border-border-light dark:border-slate-800 bg-surface-light dark:bg-surface-dark sticky top-0 z-30">
      <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col">
          <nav className="flex items-center space-x-2 text-sm text-text-secondary-light dark:text-text-secondary-dark mb-1">
            <span className="hover:text-primary cursor-pointer">Analytics</span>
            <span className="material-icons text-xs">chevron_right</span>
            <span className="text-text-primary-light dark:text-text-primary-dark font-medium">
              Leads Management
            </span>
          </nav>
          <h1 className="text-xl font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark">
            Lead Intelligence
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light dark:text-text-secondary-dark text-sm">
              search
            </span>
            <input
              className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary/50 transition-all placeholder-text-secondary-light"
              placeholder="Search leads, emails, or IDs..."
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => onSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary-light hover:text-text-primary-light"
              >
                <span className="material-icons text-sm">close</span>
              </button>
            )}
          </div>

          {/* Refresh */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary-light dark:text-text-primary-dark bg-surface-light dark:bg-slate-800 border border-border-light dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              title="Refresh leads"
            >
              <span className="material-icons text-sm">sync</span>
            </button>
          )}

          {/* Export */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary-light dark:text-text-primary-dark bg-surface-light dark:bg-slate-800 border border-border-light dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-icons text-sm">
              {isExporting ? "hourglass_empty" : "download"}
            </span>
            {isExporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>
    </header>
  );
};

export default LeadsHeader;
