/**
 * FILE: components/layout/Sidebar.jsx
 * PURPOSE: Left navigation sidebar (reusable across all pages)
 */

import { Link, useLocation } from 'react-router-dom';

function Sidebar({ currentPage }) {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between z-20">
      {/* Logo */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-[#2c5181]/10 p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-[#2c5181]">hub</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-slate-900 text-base font-bold leading-none tracking-tight">LeadScorer</h1>
              <span className="text-slate-500 text-[10px] uppercase font-semibold tracking-wider mt-0.5">Enterprise</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 p-3 mt-2">
          <Link to="/leads" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/leads') ? 'bg-[#2c5181]/10 text-[#2c5181] font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
            <span className={`material-symbols-outlined text-[22px] ${isActive('/leads') ? 'fill-1' : ''}`}>group</span>
            <span className="text-sm">Leads</span>
          </Link>

          <Link to="/rules" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/rules') ? 'bg-[#2c5181]/10 text-[#2c5181] font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
            <span className={`material-symbols-outlined text-[22px] ${isActive('/rules') ? 'fill-1' : ''}`}>rule</span>
            <span className="text-sm">Scoring Rules</span>
          </Link>

          <Link to="/leaderboard" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/leaderboard') ? 'bg-[#2c5181]/10 text-[#2c5181] font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
            <span className={`material-symbols-outlined text-[22px] ${isActive('/leaderboard') ? 'fill-1' : ''}`}>leaderboard</span>
            <span className="text-sm">Leaderboard</span>
          </Link>
        </nav>
      </div>

      {/* Profile */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50">
          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">AM</div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800">Alex Morgan</span>
            <span className="text-xs text-slate-500">Sales Manager</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
