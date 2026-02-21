import React from "react";

const STAGES = [
  { key: "all", label: "All" },
  { key: "qualified", label: "Qualified (85+)" },
  { key: "hot", label: "Hot (70-84)" },
  { key: "warm", label: "Warm (40-69)" },
  { key: "cold", label: "Cold (<40)" },
];

const FilterBar = ({
  stageFilter,
  onStageChange,
  totalCount,
  filteredCount,
}) => {
  return (
    <div className="px-6 py-2 flex items-center gap-2 overflow-x-auto shrink-0 border-b border-border-light dark:border-slate-800 bg-surface-light dark:bg-surface-dark">
      {/* Stage filter pills */}
      {STAGES.map((stage) => (
        <button
          key={stage.key}
          onClick={() => onStageChange(stage.key)}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
            stageFilter === stage.key
              ? "bg-primary/10 border border-primary/30 text-primary"
              : "bg-surface-light dark:bg-slate-800 border border-border-light dark:border-slate-700 text-text-secondary-light dark:text-text-secondary-dark hover:border-primary/50"
          }`}
        >
          {stage.label}
          {stageFilter === stage.key && stage.key !== "all" && (
            <span
              className="material-icons text-xs ml-1 cursor-pointer hover:text-primary/70"
              onClick={(e) => {
                e.stopPropagation();
                onStageChange("all");
              }}
            >
              close
            </span>
          )}
        </button>
      ))}

      <div className="h-6 w-px bg-border-light dark:bg-slate-700 mx-2" />

      {/* Results count */}
      <div className="ml-auto shrink-0">
        <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark whitespace-nowrap">
          {filteredCount === totalCount
            ? `${totalCount} leads`
            : `${filteredCount} of ${totalCount} leads`}
        </span>
      </div>
    </div>
  );
};

export default FilterBar;
