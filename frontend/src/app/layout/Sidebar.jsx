import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const nav = [
  {
    group: null,
    items: [{ path: "/overview", icon: "dashboard", label: "Overview" }],
  },
  {
    group: "Data",
    items: [
      { path: "/events", icon: "bolt", label: "Events" },
      { path: "/leads", icon: "people", label: "Leads" },
    ],
  },
  {
    group: "Configure",
    items: [
      { path: "/rules", icon: "rule", label: "Rules" },
      { path: "/automations", icon: "auto_fix_high", label: "Automations" },
    ],
  },
  {
    group: "Developer",
    items: [
      {
        path: "/integrations",
        icon: "integration_instructions",
        label: "Integrations",
      },
      { path: "/system", icon: "monitor_heart", label: "System" },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) =>
    pathname === path || (path !== "/overview" && pathname.startsWith(path));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-60 bg-[#0d0d0f] border-r border-white/8 flex-shrink-0 flex flex-col z-20 hidden md:flex">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-white/8 gap-2.5">
        <div className="w-7 h-7 bg-blue-500 rounded-md flex items-center justify-center">
          <span className="material-icons text-white text-sm">bolt</span>
        </div>
        <span className="font-bold text-white tracking-tight text-sm">
          LeadPulse
        </span>
        <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 bg-white/10 text-white/50 rounded">
          OS
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto scrollbar-none">
        {nav.map(({ group, items }) => (
          <div key={group || "__root"} className="mb-1">
            {group && (
              <div className="px-4 pt-4 pb-1.5 text-[10px] font-semibold text-white/30 uppercase tracking-widest">
                {group}
              </div>
            )}
            {items.map(({ path, icon, label }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors rounded-none relative
                  ${
                    isActive(path)
                      ? "text-white bg-white/8 border-r-2 border-blue-500"
                      : "text-white/45 hover:text-white/80 hover:bg-white/5"
                  }`}
              >
                <span
                  className={`material-icons text-[18px] ${isActive(path) ? "text-blue-400" : ""}`}
                >
                  {icon}
                </span>
                {label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/8">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/80 truncate">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] text-white/35 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/30 hover:text-white/70 transition-colors"
            title="Sign out"
          >
            <span className="material-icons text-[16px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
