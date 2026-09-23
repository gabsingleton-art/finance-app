/**
 * DayView.jsx
 *
 * Intraday bar chart for a single company.
 * Receives an array of {date, close} candles representing 15-minute intervals
 * across the trading session.
 *
 * Uses Recharts <BarChart> — simple and readable for a "current day" snapshot.
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export function DayView({ data = [], color = '#3b82d4' }) {
  if (!data.length) {
    return <p className="chart-empty">No intraday data available.</p>;
  }

  // Y-axis domain: tight range around actual data to amplify movement
  const closes = data.map((d) => d.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const padding = (max - min) * 0.2 || 1;
  const domain = [+(min - padding).toFixed(2), +(max + padding).toFixed(2)];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="date"
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
          formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
          contentStyle={{ fontSize: 12, borderRadius: 6 }}
        />
        <Bar dataKey="close" fill={color} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

DayView.propTypes = {
  data:  PropTypes.arrayOf(PropTypes.object),
  color: PropTypes.string,
};

export default DayView;
