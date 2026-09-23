/**
 * QuarterView.jsx
 *
 * ~65-day area chart for a single company.
 * Each company gets its own card, making per-company quarterly trends easy to read
 * without the visual noise of overlapping 5 area fills.
 *
 * Uses Recharts <AreaChart> — the filled area under the line adds visual weight
 * that suits a longer "trend direction" story.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export function QuarterView({ data = [], color = '#3b82d4' }) {
  if (!data.length) {
    return <p className="chart-empty">No quarterly data available.</p>;
  }

  const closes = data.map((d) => d.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const padding = (max - min) * 0.1 || 1;
  const domain = [+(min - padding).toFixed(2), +(max + padding).toFixed(2)];

  // Show only ~6 evenly-spaced x-axis labels to avoid crowding
  const tickCount = 6;
  const step = Math.max(1, Math.floor(data.length / tickCount));
  const ticks = data
    .filter((_, i) => i % step === 0 || i === data.length - 1)
    .map((d) => d.date);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`fill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="date"
          ticks={ticks}
          tick={{ fontSize: 10, fill: '#57606a' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={domain}
          tick={{ fontSize: 10, fill: '#57606a' }}
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={(v) => `$${v.toFixed(0)}`}
        />
        <Tooltip
          formatter={(value) => [`$${value.toFixed(2)}`, 'Close']}
          contentStyle={{ fontSize: 12, borderRadius: 6 }}
        />
        <Area
          type="monotone"
          dataKey="close"
          stroke={color}
          strokeWidth={2}
          fill={`url(#fill-${color.replace('#', '')})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

QuarterView.propTypes = {
  data:  PropTypes.arrayOf(PropTypes.object),
  color: PropTypes.string,
};

export default QuarterView;
