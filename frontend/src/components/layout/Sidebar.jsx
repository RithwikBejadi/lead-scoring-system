/**
 * FILE: components/layout/Sidebar.jsx
 * PURPOSE: Left navigation sidebar with mobile responsiveness
 * FEATURES: Collapsible on mobile, hamburger menu toggle, overlay backdrop
 */

import { Link, useLocation } from "react-router-dom";

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/leads") {
      return (
        location.pathname === "/leads" ||
        location.pathname.startsWith("/leads/")
      );
    }
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const navItems = [
    { path: "/overview", icon: "pie_chart", label: "Overview" },
    { path: "/leads", icon: "group", label: "Leads" },
    { path: "/rules", icon: "rule", label: "Scoring Rules" },
    { path: "/leaderboard", icon: "bar_chart", label: "Leaderboard" },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 flex-shrink-0 border-r border-slate-200 bg-white 
          flex flex-col justify-between
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo Area */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <span className="material-symbols-outlined text-primary">
                  hub
                </span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-slate-900 text-base font-bold leading-none tracking-tight">
                  LeadScorer
                </h1>
                <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider mt-0.5">
                  Enterprise
                </span>
              </div>
            </div>

            {/* Close button on mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 p-3 mt-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path === "/overview" ? "/leads" : item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                  isActive(item.path)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[22px] ${
                    isActive(item.path) ? "fill-1" : "group-hover:text-primary"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Profile / Bottom */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <div
              className="h-8 w-8 rounded-full bg-slate-200 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/a/default-user')",
              }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800">
                Alex Morgan
              </span>
              <span className="text-xs text-slate-500">Sales Manager</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
