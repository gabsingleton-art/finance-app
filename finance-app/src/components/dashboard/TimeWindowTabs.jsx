/**
 * TimeWindowTabs.jsx
 *
 * Tab bar for switching between the three time windows.
 * Purely presentational — receives the active window and an onChange handler.
 *
 * The `windows` definition lives here so the labels and values are co-located.
 */

import React from 'react';
import PropTypes from 'prop-types';

export const TIME_WINDOWS = [
  { value: 'day',     label: 'Today'       },
  { value: '7d',      label: 'Last 7 Days' },
  { value: 'quarter', label: 'Last Quarter' },
];

/**
 * @param {{
 *   activeWindow: 'day'|'7d'|'quarter',
 *   onChange: (window: string) => void
 * }} props
 */
export function TimeWindowTabs({ activeWindow, onChange }) {
  return (
    <nav className="time-window-tabs" aria-label="Time window" role="tablist">
      {TIME_WINDOWS.map(({ value, label }) => (
        <button
          key={value}
          role="tab"
          aria-selected={activeWindow === value}
          className={`time-window-tabs__tab ${activeWindow === value ? 'time-window-tabs__tab--active' : ''}`}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

TimeWindowTabs.propTypes = {
  activeWindow: PropTypes.string.isRequired,
  onChange:     PropTypes.func.isRequired,
};

export default TimeWindowTabs;
