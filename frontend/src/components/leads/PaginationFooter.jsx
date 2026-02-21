import React from "react";

const PaginationFooter = ({ totalLeads = 0, page = 1, limit = 15 }) => {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, totalLeads);

  return (
    <footer className="fixed bottom-0 left-64 right-0 h-10 bg-surface-light dark:bg-surface-dark border-t border-border-gray dark:border-border-dark flex items-center justify-between px-6 z-10 hidden md:flex">
      <div className="flex items-center gap-4 text-[11px] font-medium text-text-secondary-light dark:text-text-secondary-dark">
        <div className="flex items-center gap-1">
          <span>Rows per page:</span>
          <select className="bg-transparent border-none focus:ring-0 text-[11px] py-0 pl-1 pr-6 cursor-pointer text-text-primary-light dark:text-text-primary-dark">
            <option>50</option>
            <option>100</option>
            <option>250</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-6 text-text-primary-light dark:text-text-primary-dark">
        <span className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark font-medium">
          {totalLeads > 0 ? `${start}-${end} of ${totalLeads}` : "0 leads"}
        </span>
        <div className="flex items-center gap-1">
          <button
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"
            disabled
          >
            <span className="material-icons-outlined text-sm">first_page</span>
          </button>
          <button
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 transition-colors"
            disabled
          >
            <span className="material-icons-outlined text-sm">
              chevron_left
            </span>
          </button>
          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
            <span className="material-icons-outlined text-sm">
              chevron_right
            </span>
          </button>
          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
            <span className="material-icons-outlined text-sm">last_page</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default PaginationFooter;
