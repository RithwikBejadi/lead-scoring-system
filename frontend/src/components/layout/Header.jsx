import { useLocation } from "react-router-dom";

function Header({ onToggleSidebar }) {
  return (
    <header className="h-16 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark flex items-center justify-between px-6 z-10 shadow-sm flex-shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button
          className="lg:hidden text-text-secondary-light"
          onClick={onToggleSidebar}
        >
          <span className="material-icons">menu</span>
        </button>
        {/* Project Selector */}
        <div className="relative group">
          <button className="flex items-center gap-2 text-sm font-medium text-text-primary-light dark:text-text-primary-dark bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span>Production-US-East</span>
            <span className="material-icons text-lg">arrow_drop_down</span>
          </button>
        </div>
        {/* Search */}
        <div className="relative max-w-xl w-full hidden md:block ml-4">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-icons text-text-secondary-light dark:text-text-secondary-dark text-lg">
              search
            </span>
          </span>
          <input
            className="block w-full pl-10 pr-3 py-2 border border-border-light dark:border-border-dark rounded-md leading-5 bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark placeholder-text-secondary-light focus:outline-none focus:bg-surface-light dark:focus:bg-surface-dark focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition duration-150 ease-in-out"
            placeholder="Search resources, leads, logs, or documentation (/)"
            type="text"
          />
        </div>
      </div>
      {/* System Health Indicators */}
      <div className="flex items-center gap-6 ml-4">
        <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
          <div
            className="flex items-center gap-1.5"
            title="API Status: Healthy"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
            <span>API</span>
          </div>
          <div
            className="flex items-center gap-1.5"
            title="Worker Status: Processing"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
            <span>Worker</span>
          </div>
          <div
            className="flex items-center gap-1.5"
            title="Redis Status: Connected"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
            <span>Redis</span>
          </div>
        </div>
        <div className="h-6 w-px bg-border-light dark:border-border-dark hidden lg:block"></div>
        <button className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors">
          <span className="material-icons">notifications_none</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
