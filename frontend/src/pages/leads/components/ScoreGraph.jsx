/**
 * ScoreGraph — score evolution line chart for lead detail.
 */

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export default function ScoreGraph({ history = [] }) {
  const data = history.map(h => ({
    time: new Date(h.createdAt || h.timestamp).toLocaleDateString(),
    score: h.score ?? h.newScore ?? 0,
    delta: h.delta ?? h.change ?? 0,
  }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-xs text-neutral-700">
        No score history yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
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
          cursor={{ stroke: "rgba(255,255,255,0.05)" }}
        />
        <ReferenceLine y={0} stroke="rgba(255,255,255,0.05)" />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#10b981"
          strokeWidth={1.5}
          dot={{ r: 2, fill: "#10b981", strokeWidth: 0 }}
          activeDot={{ r: 3, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
