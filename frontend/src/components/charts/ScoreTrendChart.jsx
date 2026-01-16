/**
 * FILE: components/charts/ScoreTrendChart.jsx
 * PURPOSE: Line chart showing score history over time
 * Uses Recharts library for clean visualizations
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function ScoreTrendChart({ data }) {
  // Transform score history data for Recharts
  const chartData = (data || []).map(item => ({
    date: new Date(item.timestamp || item.createdAt).toLocaleDateString(),
    score: item.newScore || item.score || 0
  }));

  if (!chartData.length) {
    return <div className="h-64 flex items-center justify-center text-slate-400">No score history available</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#2c5181" 
            strokeWidth={3}
            dot={{ fill: '#2c5181', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ScoreTrendChart;
