/**
 * ChartCard.jsx
 *
 * Reusable container that wraps any chart or summary content with:
 *   - a company title bar (with accent colour)
 *   - a loading skeleton state
 *   - a per-card error state with a retry button
 *   - the chart/content children
 *
 * By handling these states here, each chart leaf (DayView, WeekView,
 * QuarterView) stays focused on rendering data — not on UI states.
 */

import React from 'react';
import PropTypes from 'prop-types';

export function ChartCard({ symbol, label, color = '#3b82d4', isLoading, error, onRetry, children }) {
  return (
    <article className="chart-card" aria-label={`${label} chart`}>
      <header className="chart-card__header" style={{ borderLeftColor: color }}>
        <span className="chart-card__symbol">{symbol}</span>
        <span className="chart-card__label">{label}</span>
      </header>

      <div className="chart-card__body">
        {isLoading && (
          <div className="chart-card__loading" role="status" aria-live="polite">
            <div className="skeleton skeleton--bar" />
            <div className="skeleton skeleton--bar skeleton--bar--short" />
          </div>
        )}

        {!isLoading && error && (
          <div className="chart-card__error" role="alert">
            <p className="chart-card__error-msg">Could not load {label} data.</p>
            {onRetry && (
              <button className="btn btn--small" onClick={onRetry}>
                Retry
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && children}
      </div>
    </article>
  );
}

ChartCard.propTypes = {
  symbol:    PropTypes.string.isRequired,
  label:     PropTypes.string.isRequired,
  color:     PropTypes.string,
  isLoading: PropTypes.bool,
  error:     PropTypes.string,
  onRetry:   PropTypes.func,
  children:  PropTypes.node,
};

export default ChartCard;
