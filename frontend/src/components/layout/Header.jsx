/**
 * FILE: components/layout/Header.jsx
 * PURPOSE: Top header bar (reusable across pages)
 */

function Header({ title, subtitle, actions }) {
  return (
    <header className="h-auto bg-white border-b border-slate-200 px-6 py-5 shrink-0">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
          {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}

export default Header;
