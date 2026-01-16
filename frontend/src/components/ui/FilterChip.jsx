/**
 * FILE: components/ui/FilterChip.jsx
 * PURPOSE: Reusable filter chip component with active/inactive states
 */

function FilterChip({
  label,
  active = false,
  removable = false,
  onRemove,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors shadow-sm whitespace-nowrap ${
        active
          ? "bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20"
          : "bg-white border border-slate-200 text-slate-600 hover:border-primary/50"
      }`}
    >
      {label}
      {removable ? (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="material-symbols-outlined text-[16px] hover:text-red-500 cursor-pointer"
        >
          close
        </span>
      ) : (
        <span className="material-symbols-outlined text-[16px]">
          expand_more
        </span>
      )}
    </button>
  );
}

export default FilterChip;
