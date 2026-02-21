import React from "react";

const MetricCard = ({ title, value, change, changeType, subtext, bars }) => {
  return (
    <div className="bg-surface-light dark:bg-surface-dark p-4 border border-google-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <p className="text-[11px] font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
          {title}
        </p>
        <span
          className={`${changeType === "success" ? "text-success" : "text-warning"} text-xs font-bold`}
        >
          {change}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
          {value}
        </h3>
        <div className="w-24 h-8 bg-primary/5 rounded">
          <div className="w-full h-full flex items-end px-1 pb-1 space-x-0.5">
            {bars.map((height, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-full ${height.color || "bg-primary/50"}`}
                style={{ height: height.h }}
              ></div>
            ))}
          </div>
        </div>
      </div>
      <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-1">
        {subtext}
      </p>
    </div>
  );
};

export default MetricCard;
