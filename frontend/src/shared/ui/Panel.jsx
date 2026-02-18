/**
 * Panel — dark card container used across all pages.
 */
export function Panel({ children, className = "", title, action }) {
  return (
    <div className={`bg-[#171717] border border-white/5 rounded-lg overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          {title && (
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
