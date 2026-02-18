/**
 * Sidebar — developer-first navigation.
 * Ordered: Overview → Events → Leads → Rules → Automations → Integrations → System
 */

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const NAV_ITEMS = [
  {
    label: "Overview",
    to: "/overview",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    label: "Events",
    to: "/events",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polyline points="1,11 4,6 7,9 10,4 13,7 15,5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    badge: "live",
  },
  {
    label: "Leads",
    to: "/leads",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Rules",
    to: "/rules",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 4h10M3 8h7M3 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Automations",
    to: "/automations",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 2v3M8 11v3M2 8h3M11 8h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    label: "Integrations",
    to: "/integrations",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 8h6M10 5l3 3-3 3M6 5L3 8l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: "System",
    to: "/system",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive
      ? "bg-white/10 text-white"
      : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5"
  }`;

export default function Sidebar({ collapsed, onToggle }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={`flex flex-col h-full border-r border-white/5 bg-[#111111] transition-all duration-200 ${
        collapsed ? "w-14" : "w-56"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-white/5 flex-shrink-0">
        <div className="w-5 h-5 bg-emerald-500 rounded flex-shrink-0" />
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight text-white truncate">
            LeadScore
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 p-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={navLinkClass}>
            <span className="flex-shrink-0">{item.icon}</span>
            {!collapsed && (
              <span className="flex-1 truncate">{item.label}</span>
            )}
            {!collapsed && item.badge === "live" && (
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-white/5 flex-shrink-0">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5M9.5 10l3-3-3-3M12.5 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
