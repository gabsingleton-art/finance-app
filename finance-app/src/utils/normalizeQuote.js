/**
 * normalizeQuote.js
 *
 * Pure transformation functions that convert raw API or mock responses
 * into the domain shapes used by every component in this application.
 *
 * Keeping transformations here (rather than inside hooks or components) means:
 *   - they are trivially unit-testable with plain Jest
 *   - the UI layer never sees raw API shapes
 *   - swapping the data source only requires updating the adapter, not these functions
 *
 * Domain types (JSDoc for editor support):
 *
 * @typedef {Object} NormalisedQuote
 * @property {string}  symbol        - Ticker symbol, e.g. "IBM"
 * @property {string}  name          - Company display name
 * @property {number}  price         - Current / closing price
 * @property {number}  change        - Absolute price change vs. previous close
 * @property {number}  changePct     - Percentage change vs. previous close
 * @property {number}  open          - Opening price for the session
 * @property {number}  high          - Day high
 * @property {number}  low           - Day low
 * @property {number}  volume        - Trading volume
 * @property {string}  currency      - ISO currency code, e.g. "USD"
 * @property {number}  timestamp     - Unix epoch ms of the quote
 *
 * @typedef {Object} Candle
 * @property {string}  date          - ISO date string, e.g. "2024-01-15"
 * @property {number}  close         - Closing price
 * @property {number}  open          - Opening price
 * @property {number}  high          - Day high
 * @property {number}  low           - Day low
 * @property {number}  volume        - Volume
 */

/**
 * Normalise a raw Yahoo Finance quote result into a NormalisedQuote.
 * Handles missing / null fields gracefully by defaulting to 0 / empty string.
 *
 * @param {Object} raw - Raw object from yahooFinanceAdapter or mockAdapter
 * @returns {NormalisedQuote}
 */
export function normalizeQuote(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('normalizeQuote: expected a non-null object');
  }

  return {
    symbol:    String(raw.symbol    ?? '').toUpperCase(),
    name:      String(raw.name      ?? raw.shortName ?? raw.longName ?? ''),
    price:     toNumber(raw.price   ?? raw.regularMarketPrice),
    change:    toNumber(raw.change  ?? raw.regularMarketChange),
    changePct: toNumber(raw.changePct ?? raw.regularMarketChangePercent),
    open:      toNumber(raw.open    ?? raw.regularMarketOpen),
    high:      toNumber(raw.high    ?? raw.regularMarketDayHigh),
    low:       toNumber(raw.low     ?? raw.regularMarketDayLow),
    volume:    toNumber(raw.volume  ?? raw.regularMarketVolume),
    currency:  String(raw.currency  ?? 'USD'),
    timestamp: toNumber(raw.timestamp ?? raw.regularMarketTime ?? Date.now()),
  };
}

/**
 * Normalise an array of raw historical candles into Candle objects.
 * Filters out any entries that do not have a valid date or close price.
 *
 * @param {Object[]} rawCandles - Array of raw candle-like objects
 * @returns {Candle[]}
 */
export function normalizeHistory(rawCandles) {
  if (!Array.isArray(rawCandles)) return [];

  return rawCandles
    .filter((c) => c && (c.date || c.Date) && (c.close ?? c.Close) != null)
    .map((c) => ({
      date:   toDateString(c.date ?? c.Date),
      close:  toNumber(c.close  ?? c.Close),
      open:   toNumber(c.open   ?? c.Open),
      high:   toNumber(c.high   ?? c.High),
      low:    toNumber(c.low    ?? c.Low),
      volume: toNumber(c.volume ?? c.Volume),
    }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function toNumber(val) {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

function toDateString(val) {
  if (!val) return '';
  const d = val instanceof Date ? val : new Date(val);
  return isNaN(d.getTime()) ? String(val) : d.toISOString().slice(0, 10);
}
