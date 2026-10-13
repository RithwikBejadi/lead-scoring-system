import React from "react";

export function Panel({ children, className = "", noPad }) {
  return (
    <div
      className={`bg-surface-light dark:bg-surface-dark border border-google-border rounded-lg ${noPad ? "" : "p-4"} ${className}`}
    >
      {children}
    </div>
  );
}

export function PanelHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-google-border">
      <div>
        <h3 className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon = "inbox", title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="material-icons text-4xl text-slate-300 dark:text-slate-700 mb-3">
        {icon}
      </span>
      <h3 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 max-w-xs">
          {description}
        </p>
      )}
    </div>
  );
}
