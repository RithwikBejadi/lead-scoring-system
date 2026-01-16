/**
 * FILE: components/charts/ScoreTrendChart.jsx
 * PURPOSE: Line chart showing score history over time with gradient fill
 * Uses Recharts library for clean visualizations
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

function ScoreTrendChart({ data }) {
  // Transform score history data for Recharts
  const chartData = (data || []).map((item, idx) => ({
    date: new Date(item.timestamp || item.createdAt).toLocaleDateString(
      "en-US",
      { month: "short", day: "numeric" }
    ),
    score: item.newScore || item.score || 0,
    week: `W${Math.floor(idx / 7) + 1}`,
  }));

  // If no data, generate placeholder data for demo
  const displayData =
    chartData.length > 0
      ? chartData
      : [
          { date: "W1", score: 30 },
          { date: "W2", score: 45 },
          { date: "W3", score: 55 },
          { date: "W4", score: 50 },
          { date: "Today", score: 65 },
        ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white text-xs rounded py-1 px-2 shadow-lg">
          Score: {payload[0].value}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 lg:h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={displayData}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2c5181" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#2c5181" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            style={{ fontSize: "12px", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: "12px" }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#2c5181"
            strokeWidth={3}
            fill="url(#scoreGradient)"
            dot={{ fill: "#2c5181", r: 4, strokeWidth: 0 }}
            activeDot={{
              r: 6,
              fill: "#fff",
              stroke: "#2c5181",
              strokeWidth: 3,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ScoreTrendChart;
