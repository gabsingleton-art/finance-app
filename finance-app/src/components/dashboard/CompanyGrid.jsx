/**
 * CompanyGrid.jsx
 *
 * Maps the companies list to ChartCard + chart-leaf combinations.
 * Renders different layouts depending on the active time window:
 *
 *   day     — one SummaryCard + DayView per company (5 separate cards)
 *   7d      — one shared WeekView (all companies on one chart) + summary header row
 *   quarter — one QuarterView per company (5 separate cards)
 *
 * All data is passed in as props — this component does no fetching.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ChartCard }    from '../cards/ChartCard.jsx';
import { SummaryCard }  from '../cards/SummaryCard.jsx';
import { DayView }      from '../charts/DayView.jsx';
import { WeekView }     from '../charts/WeekView.jsx';
import { QuarterView }  from '../charts/QuarterView.jsx';

export function CompanyGrid({ companies, window, quotes, histories, isLoading, onRetry }) {
  if (window === '7d') {
    return (
      <section className="company-grid company-grid--single" aria-label="Last 7 days comparison">
        <ChartCard
          symbol="ALL"
          label="7-Day Comparison — All Companies"
          color="#3b82d4"
          isLoading={isLoading}
          error={null}
          onRetry={onRetry}
        >
          <WeekView companies={companies} histories={histories} />
        </ChartCard>
      </section>
    );
  }

  return (
    <section className="company-grid" aria-label={window === 'day' ? 'Today\'s snapshot' : 'Last quarter trends'}>
      {companies.map(({ symbol, label, color }) => {
        const quote   = quotes[symbol] ?? null;
        const history = histories[symbol] ?? [];
        const hasError = !isLoading && quote === null && history.length === 0;

        return (
          <ChartCard
            key={symbol}
            symbol={symbol}
            label={label}
            color={color}
            isLoading={isLoading}
            error={hasError ? `No data returned for ${symbol}.` : null}
            onRetry={onRetry}
          >
            {window === 'day' && (
              <>
                <SummaryCard quote={quote} color={color} />
                <DayView data={history} color={color} />
              </>
            )}
            {window === 'quarter' && (
              <QuarterView data={history} color={color} />
            )}
          </ChartCard>
        );
      })}
    </section>
  );
}

CompanyGrid.propTypes = {
  companies: PropTypes.arrayOf(PropTypes.shape({
    symbol: PropTypes.string.isRequired,
    label:  PropTypes.string.isRequired,
    color:  PropTypes.string.isRequired,
  })).isRequired,
  window:    PropTypes.string.isRequired,
  quotes:    PropTypes.object.isRequired,
  histories: PropTypes.object.isRequired,
  isLoading: PropTypes.bool,
  onRetry:   PropTypes.func,
};

export default CompanyGrid;
