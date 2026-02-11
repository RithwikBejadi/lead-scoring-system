/**
 * Header - Brutalist Professional Style
 * Zero curves, high contrast, bold typography
 */

import { useLocation } from "react-router-dom";

function Header({ title, actions, onToggleSidebar }) {
  const location = useLocation();

  const getPageTitle = () => {
    const paths = location.pathname.split("/").filter(Boolean);
    if (paths.length === 0) return "Dashboard";
    const last = paths[paths.length - 1];
    if (last.match(/^[a-f0-9]{24}$/)) return "Details";
    return last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ");
  };

  return (
    <header className="h-16 border-b border-black flex items-center justify-between px-6 flex-shrink-0 bg-white">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="flex items-center text-sm font-medium">
          <span className="text-gray-500">Workspace</span>
          <span className="material-symbols-outlined text-sm text-gray-300 mx-2">
            chevron_right
          </span>
          <span className="text-black font-bold uppercase tracking-wide">
            {title || getPageTitle()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-lg">
            search
          </span>
          <input
            className="h-10 w-64 pl-10 pr-4 text-sm bg-white border border-black focus:outline-none focus:ring-0 placeholder:text-gray-400 font-medium"
            placeholder="Search leads, companies..."
            type="text"
          />
        </div>

        <div className="flex items-center gap-1 pl-4 border-l border-black ml-2">
          <button className="w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="w-8 h-8 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
        {actions && (
          <div className="flex items-center gap-2 ml-2">{actions}</div>
        )}
      </div>
    </header>
  );
}

export default Header;
