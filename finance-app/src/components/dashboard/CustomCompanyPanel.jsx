/**
 * CustomCompanyPanel.jsx
 *
 * Renders the ChartCard for the user-selected company.
 * Mirrors the layout of CompanyGrid cards: picks the correct chart leaf
 * (DayView / WeekView / QuarterView) based on the active time window, and
 * wraps it in a ChartCard that handles loading / error / data states.
 *
 * Placed visually between the search bar and the main CompanyGrid so the
 * existing dashboards are never displaced.
 *
 * All data is passed in as props — no fetching here.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ChartCard }   from '../cards/ChartCard.jsx';
import { SummaryCard } from '../cards/SummaryCard.jsx';
import { DayView }     from '../charts/DayView.jsx';
import { WeekView }    from '../charts/WeekView.jsx';
import { QuarterView } from '../charts/QuarterView.jsx';

// Accent colour for the custom card — visually distinct from the fixed set
const CUSTOM_COLOR = '#57606a';

/**
 * @param {{
 *   symbol:    string,
 *   quote:     import('../../utils/normalizeQuote.js').NormalisedQuote | null,
 *   history:   import('../../utils/normalizeQuote.js').Candle[] | null,
 *   isLoading: boolean,
 *   error:     string | null,
 *   window:    'day'|'7d'|'quarter',
 *   onRetry:   () => void
 * }} props
 */
export function CustomCompanyPanel({ symbol, quote, history, isLoading, error, window, onRetry }) {
  const label = quote?.name || symbol;
  const candles = history ?? [];

  // For the 7d view we still need the companies + histories shape that WeekView expects.
  // We render a single-company line by passing a one-element companies array.
  const companiesForWeek = [{ symbol, label, color: CUSTOM_COLOR }];
  const historiesForWeek = { [symbol]: candles };

  return (
    <section className="custom-company-panel" aria-label={`Custom company: ${label}`}>
      <div className="custom-company-panel__heading">
        <span className="custom-company-panel__badge">Custom</span>
        <span className="custom-company-panel__title">{label}</span>
      </div>

      <ChartCard
        symbol={symbol}
        label={label}
        color={CUSTOM_COLOR}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
      >
        {window === 'day' && (
          <>
            <SummaryCard quote={quote} color={CUSTOM_COLOR} />
            <DayView data={candles} color={CUSTOM_COLOR} />
          </>
        )}

        {window === '7d' && (
          <WeekView companies={companiesForWeek} histories={historiesForWeek} />
        )}

        {window === 'quarter' && (
          <QuarterView data={candles} color={CUSTOM_COLOR} />
        )}
      </ChartCard>
    </section>
  );
}

CustomCompanyPanel.propTypes = {
  symbol:    PropTypes.string.isRequired,
  quote:     PropTypes.object,
  history:   PropTypes.array,
  isLoading: PropTypes.bool,
  error:     PropTypes.string,
  window:    PropTypes.string.isRequired,
  onRetry:   PropTypes.func,
};

export default CustomCompanyPanel;
