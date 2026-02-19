/**
 * ThroughputGraph — events ingested over time. Uses Recharts area chart.
 */

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { eventsApi } from "../../../features/events/events.api";

const MOCK_DATA = Array.from({ length: 20 }, (_, i) => ({
  time: `${i}m`,
  events: Math.floor(Math.random() * 80) + 5,
}));

export default function ThroughputGraph() {
  const [data, setData] = useState(MOCK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsApi.getAll({ timeRange: "1h", limit: 200 })
      .then(res => {
        const arr = Array.isArray(res) ? res : (res.data || res.events || []);
        if (arr.length < 2) { setLoading(false); return; }

        // Bucket into 5-min intervals
        const buckets = {};
        arr.forEach(e => {
          const d = new Date(e.createdAt || e.timestamp);
          const key = Math.floor(d.getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000);
          buckets[key] = (buckets[key] || 0) + 1;
        });
        const chart = Object.entries(buckets)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([ts, events]) => ({
            time: new Date(Number(ts)).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
            events,
          }));
        if (chart.length >= 2) setData(chart);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="time"
          tick={{ fontSize: 10, fill: "#525252", fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#525252", fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "6px",
            fontSize: "11px",
            fontFamily: "monospace",
            color: "#a3a3a3",
          }}
          itemStyle={{ color: "#10b981" }}
          cursor={{ stroke: "rgba(255,255,255,0.05)" }}
        />
        <Area
          type="monotone"
          dataKey="events"
          stroke="#10b981"
          strokeWidth={1.5}
          fill="url(#evGrad)"
          dot={false}
          activeDot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
