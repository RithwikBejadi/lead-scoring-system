/**
 * FILE: components/layout/Sidebar.jsx
 * PURPOSE: Left navigation sidebar (reusable across all pages)
 * DESIGN: Matches the HTML mockup with proper styling, navigation links, and profile section
 */

import { Link, useLocation } from "react-router-dom";

function Sidebar() {
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
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between z-20">
      {/* Logo Area */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
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
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-3 mt-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path === "/overview" ? "/leads" : item.path}
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
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC8RKT5v3TTOVlzYJbDiBM1okfQuFJ11jNJFG_Feaz7kGUGPKiDQIxJ0f9eTlDtte0sR8T7EOeDjpywnLCqeeQqS_rLomlodPCr1tciwZWPAjuRFNopP7N0qYvHncf8RqsgUtVnDPtMRuVJ0i2eVLCkMQH6via-yXSyybYwWhH4P9OvV_-GBMjIIbduggdpSda1fnAbug0YtqS1OE0W3GJ2AVs-JYbpQwm7mL6wL7y502rhTjzRT1uOoEVna-QczayL4l2q4Xk62H0')",
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
  );
}

export default Sidebar;
