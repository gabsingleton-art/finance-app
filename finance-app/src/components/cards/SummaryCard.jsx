/**
 * SummaryCard.jsx
 *
 * Displays a single company's "today" snapshot:
 *   - company name + ticker
 *   - current price
 *   - absolute and percentage change vs. previous close (colour-coded)
 *
 * Purely presentational — receives a NormalisedQuote and renders it.
 */

import React from 'react';
import PropTypes from 'prop-types';

export function SummaryCard({ quote, color = '#3b82d4' }) {
  if (!quote) return null;

  const isPositive = quote.change >= 0;
  const sign       = isPositive ? '+' : '';
  const changeClass = isPositive ? 'summary-card__change--up' : 'summary-card__change--down';

  return (
    <div className="summary-card" style={{ borderTopColor: color }}>
      <div className="summary-card__header">
        <span className="summary-card__symbol">{quote.symbol}</span>
        <span className="summary-card__name">{quote.name}</span>
      </div>

      <div className="summary-card__price">
        {quote.currency} {quote.price.toFixed(2)}
      </div>

      <div className={`summary-card__change ${changeClass}`}>
        {sign}{quote.change.toFixed(2)}&nbsp;
        ({sign}{quote.changePct.toFixed(2)}%)
      </div>

      <dl className="summary-card__meta">
        <dt>Open</dt>  <dd>{quote.open.toFixed(2)}</dd>
        <dt>High</dt>  <dd>{quote.high.toFixed(2)}</dd>
        <dt>Low</dt>   <dd>{quote.low.toFixed(2)}</dd>
        <dt>Vol</dt>   <dd>{formatVolume(quote.volume)}</dd>
      </dl>
    </div>
  );
}

function formatVolume(vol) {
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000)     return `${(vol / 1_000).toFixed(0)}K`;
  return String(vol);
}

SummaryCard.propTypes = {
  quote: PropTypes.shape({
    symbol:    PropTypes.string.isRequired,
    name:      PropTypes.string.isRequired,
    price:     PropTypes.number.isRequired,
    change:    PropTypes.number.isRequired,
    changePct: PropTypes.number.isRequired,
    open:      PropTypes.number.isRequired,
    high:      PropTypes.number.isRequired,
    low:       PropTypes.number.isRequired,
    volume:    PropTypes.number.isRequired,
    currency:  PropTypes.string.isRequired,
  }),
  color: PropTypes.string,
};

export default SummaryCard;
