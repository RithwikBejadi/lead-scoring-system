import React from "react";

const StatCard = ({ title, value, change, changeType, sparklineData }) => {
  // Determine color based on changeType
  const changeColorClass =
    changeType === "success"
      ? "text-success bg-success/10"
      : changeType === "warning"
        ? "text-warning bg-warning/10"
        : "text-error bg-error/10";

  // Determine sparkline color based on changeType (usually matches unless overridden)
  const sparklineColorClass =
    changeType === "success"
      ? "text-primary"
      : changeType === "warning"
        ? "text-warning"
        : "text-error";

  return (
    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-4 shadow-card">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
          {title}
        </h3>
        <span
          className={`${changeColorClass} text-xs font-medium px-1.5 py-0.5 rounded`}
        >
          {change}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold text-text-primary-light dark:text-text-primary-dark">
          {value}
        </span>
        <svg
          className={`w-16 h-8 ${sparklineColorClass} sparkline`}
          viewBox="0 0 64 32"
          fill="none"
          stroke="currentColor"
        >
          <path d={sparklineData} strokeWidth="2"></path>
        </svg>
      </div>
    </div>
  );
};

export default StatCard;
