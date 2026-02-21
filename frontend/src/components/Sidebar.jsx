import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const currentPage = location.pathname.substring(1) || "dashboard";

  const handleNavigate = (page) => {
    navigate(`/${page}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-surface-light dark:bg-surface-dark border-r border-google-border flex-shrink-0 flex flex-col z-20 hidden md:flex">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-google-border">
        <div className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="material-icons text-white text-sm">bolt</span>
          </div>
          <span>LeadPulse OS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
          Monitor
        </div>
        <button
          onClick={() => handleNavigate("dashboard")}
          className={`w-full flex items-center px-4 py-2 text-sm font-medium transition-colors ${
            currentPage === "dashboard"
              ? "bg-primary/10 text-primary border-r-4 border-primary"
              : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <span className="material-icons mr-3 text-lg">dashboard</span>
          Dashboard
        </button>
        <button
          onClick={() => handleNavigate("leads")}
          className={`w-full flex items-center px-4 py-2 mt-1 text-sm font-medium transition-colors ${
            currentPage === "leads"
              ? "bg-primary/10 text-primary border-r-4 border-primary"
              : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <span className="material-icons mr-3 text-lg">people</span>
          Leads
        </button>
        <button
          onClick={() => handleNavigate("events")}
          className={`w-full flex items-center px-4 py-2 mt-1 text-sm font-medium transition-colors ${
            currentPage === "events"
              ? "bg-primary/10 text-primary border-r-4 border-primary"
              : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <span className="material-icons mr-3 text-lg">bolt</span>
          Events
        </button>

        <div className="px-4 mt-6 mb-2 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
          Orchestration
        </div>
        <button
          onClick={() => handleNavigate("automation")}
          className={`w-full flex items-center px-4 py-2 mt-1 text-sm font-medium transition-colors ${
            currentPage === "automation"
              ? "bg-primary/10 text-primary border-r-4 border-primary"
              : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <span className="material-icons mr-3 text-lg">auto_fix_high</span>
          Automation
        </button>
        <button
          onClick={() => handleNavigate("scoring")}
          className={`w-full flex items-center px-4 py-2 mt-1 text-sm font-medium transition-colors ${
            currentPage === "scoring"
              ? "bg-primary/10 text-primary border-r-4 border-primary"
              : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <span className="material-icons mr-3 text-lg">rule</span>
          Scoring Rules
        </button>

        <div className="px-4 mt-6 mb-2 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
          Developer
        </div>
        <button
          onClick={() => handleNavigate("integrations")}
          className={`w-full flex items-center px-4 py-2 mt-1 text-sm font-medium transition-colors ${
            currentPage === "integrations"
              ? "bg-primary/10 text-primary border-r-4 border-primary"
              : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <span className="material-icons mr-3 text-lg">
            integration_instructions
          </span>
          Integrations
        </button>
        <button
          onClick={() => handleNavigate("simulator")}
          className={`w-full flex items-center px-4 py-2 mt-1 text-sm font-medium transition-colors ${
            currentPage === "simulator"
              ? "bg-primary/10 text-primary border-r-4 border-primary"
              : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <span className="material-icons mr-3 text-lg">science</span>
          Simulator
        </button>
        <button
          onClick={() => handleNavigate("system")}
          className={`w-full flex items-center px-4 py-2 mt-1 text-sm font-medium transition-colors ${
            currentPage === "system"
              ? "bg-primary/10 text-primary border-r-4 border-primary"
              : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <span className="material-icons mr-3 text-lg">monitor_heart</span>
          System
        </button>
        <button
          onClick={() => handleNavigate("settings")}
          className={`w-full flex items-center px-4 py-2 mt-1 text-sm font-medium transition-colors ${
            currentPage === "settings"
              ? "bg-primary/10 text-primary border-r-4 border-primary"
              : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <span className="material-icons mr-3 text-lg">settings</span>
          Settings
        </button>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-google-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-text-secondary-light dark:text-text-secondary-dark"
            title="Sign Out"
          >
            <span className="material-icons text-sm">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
