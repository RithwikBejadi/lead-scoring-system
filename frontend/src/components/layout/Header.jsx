/**
 * FILE: components/layout/Header.jsx
 * PURPOSE: Top header bar with breadcrumbs and hamburger menu for mobile
 */

import { useLocation } from "react-router-dom";

function Header({ title, subtitle, actions, onToggleSidebar }) {
  const location = useLocation();

  // Auto-generate breadcrumbs if not provided
  const defaultBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter(Boolean);
    if (paths.length === 0) return [{ label: "Dashboard" }];

    const crumbs = [{ label: "Dashboard", path: "/" }];
    paths.forEach((path, idx) => {
      // Skip ObjectId-like paths
      if (path.match(/^[a-f0-9]{24}$/)) {
        crumbs.push({ label: "Details", isLast: idx === paths.length - 1 });
      } else {
        const label =
          path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
        crumbs.push({
          label,
          path: "/" + paths.slice(0, idx + 1).join("/"),
          isLast: idx === paths.length - 1,
        });
      }
    });
    return crumbs;
  };

  const crumbs = defaultBreadcrumbs();

  return (
    <header className="h-16 border-b border-black flex items-center justify-between px-8 flex-shrink-0 z-10 bg-white">
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-black hover:bg-gray-100 transition-colors mr-2"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="text-black">Workspace</span>
        <span className="material-symbols-outlined text-[14px] text-black">chevron_right</span>
        <span className="font-medium text-black">{title || crumbs[crumbs.length - 1]?.label || 'Overview'}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative group hidden md:block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-black text-[18px] group-focus-within:text-black transition-colors">search</span>
          <input
            className="h-9 w-64 pl-10 pr-4 text-sm bg-white border border-black focus:border-black focus:ring-1 focus:ring-black placeholder:text-gray-500 outline-none transition-all"
            placeholder="Search leads, companies..."
            type="text"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <span className="text-[10px] font-mono border border-black px-1 text-black">⌘K</span>
          </div>
        </div>
        <button className="w-9 h-9 flex items-center justify-center border border-transparent hover:border-black hover:bg-gray-100 transition-colors text-black">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <button className="w-9 h-9 flex items-center justify-center border border-transparent hover:border-black hover:bg-gray-100 transition-colors text-black">
          <span className="material-symbols-outlined text-[20px]">help</span>
        </button>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export default Header;
