import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header({ title, subtitle }) {
  const location = useLocation();
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-google-border bg-surface-light dark:bg-surface-dark shrink-0">
      <div className="flex items-center gap-3">
        <div>
          {title && (
            <h1 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          Live
        </span>
      </div>
    </header>
  );
}
