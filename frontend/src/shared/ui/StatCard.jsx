/**
 * StatCard — metric tile used in Overview and System pages.
 */

export function StatCard({ label, value, sub, trend, variant = "default" }) {
  const trendColor =
    trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-neutral-500";

  return (
    <div className="bg-[#171717] border border-white/5 rounded-lg p-4">
      <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <p className="text-2xl font-mono font-semibold text-white leading-none mb-1">
        {value ?? "—"}
      </p>
      {sub && (
        <p className={`text-xs font-mono mt-1 ${trendColor}`}>{sub}</p>
      )}
    </div>
  );
}
