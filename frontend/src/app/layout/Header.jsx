/**
 * Header — top bar with page title, connection status, and user.
 */

import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const PAGE_LABELS = {
  "/overview": "Overview",
  "/events": "Events",
  "/leads": "Leads",
  "/rules": "Rules",
  "/automations": "Automations",
  "/integrations": "Integrations",
  "/system": "System",
};

export default function Header({ onToggleSidebar }) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Derive label from path
  const base = "/" + pathname.split("/")[1];
  const label = PAGE_LABELS[base] || "Dashboard";

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-white/5 bg-[#111111] flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded hover:bg-white/5 text-neutral-400 hover:text-neutral-200 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
        <h1 className="text-sm font-medium text-white">{label}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live</span>
        </div>

        {/* User avatar */}
        {user && (
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center text-neutral-300 font-medium text-[10px]">
              {(user.name || user.email || "U")[0].toUpperCase()}
            </div>
            <span className="hidden sm:inline truncate max-w-[120px]">
              {user.name || user.email}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
