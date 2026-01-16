/**
 * FILE: components/charts/ActivitySparkline.jsx
 * PURPOSE: Mini SVG sparkline for table rows showing activity trend
 */

function ActivitySparkline({ events = 0, activityLevel = "low" }) {
  // Generate bar heights based on activity level
  const getBarPattern = () => {
    const patterns = {
      high: [20, 40, 60, 30, 80, 90, 50, 10],
      active: [10, 10, 10, 30, 40, 70, 20, 10],
      moderate: [10, 10, 10, 10, 10, 40, 30, 10],
      steady: [10, 20, 30, 10, 40, 40, 10, 10],
      inactive: [10, 10, 10, 10, 10, 10, 10, 10],
    };
    return patterns[activityLevel] || patterns.inactive;
  };

  const getActivityLabel = () => {
    const labels = {
      high: "High Activity",
      active: "Active",
      moderate: "Moderate",
      steady: "Steady",
      inactive: "Inactive",
    };
    return labels[activityLevel] || "Inactive";
  };

  const bars = getBarPattern();

  return (
    <div className="flex flex-col gap-1 w-32">
      <div className="flex justify-between text-xs text-slate-500 mb-0.5">
        <span>{getActivityLabel()}</span>
        <span className="font-medium text-slate-700">{events} Events</span>
      </div>
      <div className="flex items-end gap-0.5 h-6">
        {bars.map((height, idx) => (
          <div
            key={idx}
            className={`w-1.5 rounded-t-sm transition-all ${
              height > 50
                ? "bg-primary"
                : height > 30
                ? "bg-primary/60"
                : height > 20
                ? "bg-primary/40"
                : "bg-slate-200"
            }`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default ActivitySparkline;
