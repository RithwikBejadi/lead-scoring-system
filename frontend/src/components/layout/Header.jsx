/**
 * FILE: components/layout/Header.jsx
 * PURPOSE: Top header bar with breadcrumbs, title, and actions
 * DESIGN: Clean header with only functional elements - no dummy buttons
 */

import { useLocation } from "react-router-dom";

function Header({ title, subtitle, actions, breadcrumbs }) {
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

  const crumbs = breadcrumbs || defaultBreadcrumbs();

  return (
    <header className="h-auto bg-white border-b border-slate-200 px-6 py-5 shrink-0 z-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm mb-2">
            {crumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-2">
                <span
                  className={
                    crumb.isLast
                      ? "text-slate-800 font-semibold"
                      : "text-slate-500 font-medium"
                  }
                >
                  {crumb.label}
                </span>
                {idx < crumbs.length - 1 && (
                  <span className="text-slate-300">/</span>
                )}
              </span>
            ))}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {title}
          </h2>
          {subtitle &&
            (typeof subtitle === "string" ? (
              <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
            ) : (
              <div className="mt-1">{subtitle}</div>
            ))}
        </div>

        {/* Right Actions - only custom actions passed as props */}
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}

export default Header;
