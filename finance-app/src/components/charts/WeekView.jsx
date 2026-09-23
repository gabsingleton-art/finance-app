/**
 * WeekView.jsx
 *
 * 7-day multi-company line chart.
 * Receives data for all companies so all lines appear on a single shared chart,
 * making relative performance easy to compare.
 *
 * Props:
 *   companies — array of {symbol, label, color} from constants/companies.js
 *   histories — Record<symbol, Candle[]> from useMarketData
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { COMPANIES } from '../../constants/companies.js';

/**
 * Merge per-company history arrays into a single [{date, IBM, MSFT, ...}] array
 * aligned on the shared date axis.
 */
function mergeHistories(histories) {
  // Collect all unique dates
  const dateSet = new Set();
  Object.values(histories).forEach((candles) => {
    if (Array.isArray(candles)) candles.forEach((c) => dateSet.add(c.date));
  });

  const dates = Array.from(dateSet).sort();

  return dates.map((date) => {
    const point = { date };
    COMPANIES.forEach(({ symbol }) => {
      const candles = histories[symbol];
      const match = candles?.find((c) => c.date === date);
      point[symbol] = match ? match.close : null;
    });
    return point;
  });
}

export function WeekView({ companies = COMPANIES, histories = {} }) {
  const merged = mergeHistories(histories);

  if (!merged.length) {
    return <p className="chart-empty">No 7-day history available.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={merged} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: '#57606a' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#57606a' }}
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          formatter={(value, name) => {
            const c = companies.find((c) => c.symbol === name);
            return value != null ? [`$${value.toFixed(2)}`, c?.label ?? name] : ['—', c?.label ?? name];
          }}
          contentStyle={{ fontSize: 12, borderRadius: 6 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
        />
        {companies.map(({ symbol, color }) => (
          <Line
            key={symbol}
            type="monotone"
            dataKey={symbol}
            stroke={color}
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

WeekView.propTypes = {
  companies: PropTypes.arrayOf(PropTypes.shape({
    symbol: PropTypes.string.isRequired,
    label:  PropTypes.string.isRequired,
    color:  PropTypes.string.isRequired,
  })),
  histories: PropTypes.objectOf(PropTypes.array),
};

export default WeekView;
