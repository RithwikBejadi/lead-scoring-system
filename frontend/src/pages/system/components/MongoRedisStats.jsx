/**
 * MongoRedisStats — connection status cards for MongoDB + Redis.
 */

export default function MongoRedisStats({ health }) {
  const mongo = health?.mongodb || "—";
  const redis = health?.redis || "—";
  const mongoOk = mongo === "connected";
  const redisOk = redis === "connected";

  const items = [
    {
      label: "MongoDB",
      status: mongo,
      ok: mongoOk,
      sub: health ? `Uptime: ${Math.floor((health.uptime || 0) / 60)}m` : null,
    },
    {
      label: "Redis",
      status: redis,
      ok: redisOk,
      sub: "Rate limiting & queues",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {items.map(item => (
        <div
          key={item.label}
          className={`rounded-lg border p-4 ${
            item.ok
              ? "border-emerald-800/30 bg-emerald-950/20"
              : "border-red-800/30 bg-red-950/20"
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2 h-2 rounded-full ${item.ok ? "bg-emerald-400" : "bg-red-400"} ${item.ok ? "animate-pulse" : ""}`}
            />
            <span className="text-xs font-semibold text-neutral-300">{item.label}</span>
          </div>
          <p className={`text-sm font-mono mt-1 ${item.ok ? "text-emerald-400" : "text-red-400"}`}>
            {item.status}
          </p>
          {item.sub && (
            <p className="text-[10px] font-mono text-neutral-700 mt-1">{item.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}
