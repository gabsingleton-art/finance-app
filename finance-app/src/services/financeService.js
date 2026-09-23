/**
 * financeService.js
 *
 * Public data API for the application.  All hooks and components import from
 * here — never directly from an adapter.
 *
 * Adapter selection:
 *   REACT_APP_USE_MOCK=true  → mockAdapter (no network, safe for CI + tests)
 *   REACT_APP_USE_MOCK=false → yahooFinanceAdapter (requires proxy server)
 *
 * Exported functions return normalised domain objects (NormalisedQuote /
 * Candle[]) as defined in utils/normalizeQuote.js.
 */

import { normalizeQuote, normalizeHistory } from '../utils/normalizeQuote.js';
import { mockQuote, mockHistory }           from './mockAdapter.js';
import { fetchQuoteFromYahoo, fetchHistoryFromYahoo } from './yahooFinanceAdapter.js';

// USE_MOCK is injected at build time by Vite (see vite.config.js define block)
// and falls back to the process.env value used by Jest.
// Defaults to true — mock mode is active unless explicitly set to 'false'.
const USE_MOCK = (typeof __VITE_USE_MOCK__ !== 'undefined'
  ? __VITE_USE_MOCK__
  : process.env.VITE_USE_MOCK) !== 'false';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch and normalise the current quote for a single symbol.
 *
 * @param {string} symbol - Ticker symbol, e.g. "IBM"
 * @returns {Promise<import('../utils/normalizeQuote.js').NormalisedQuote>}
 */
export async function fetchQuote(symbol) {
  const raw = USE_MOCK
    ? mockQuote(symbol)
    : await fetchQuoteFromYahoo(symbol);

  return normalizeQuote(raw);
}

/**
 * Fetch and normalise historical candles for a symbol + time window.
 *
 * @param {string} symbol
 * @param {'day'|'7d'|'quarter'} window
 * @returns {Promise<import('../utils/normalizeQuote.js').Candle[]>}
 */
export async function fetchHistory(symbol, window) {
  const raw = USE_MOCK
    ? mockHistory(symbol, window)
    : await fetchHistoryFromYahoo(symbol, window);

  return normalizeHistory(raw);
}

/**
 * Fetch a pre-formatted summary of the key display metrics for one symbol.
 * Combines the normalised quote with derived display fields (formatted strings)
 * so components can render without any further arithmetic.
 *
 * @param {string} symbol
 * @returns {Promise<import('../utils/normalizeQuote.js').QuoteSummary>}
 */
export async function fetchSummary(symbol) {
  const quote = await fetchQuote(symbol);
  return buildSummary(quote);
}

/**
 * Fetch summaries for multiple symbols in parallel.
 * Per-symbol errors are caught and returned as null.
 *
 * @param {string[]} symbols
 * @returns {Promise<Record<string, import('../utils/normalizeQuote.js').QuoteSummary|null>>}
 */
export async function fetchSummaries(symbols) {
  const entries = await Promise.all(
    symbols.map(async (sym) => {
      try {
        return [sym, await fetchSummary(sym)];
      } catch {
        return [sym, null];
      }
    })
  );
  return Object.fromEntries(entries);
}

/**
 * Convenience: fetch quotes for multiple symbols in parallel.
 * Errors for individual symbols are caught and returned as null — the UI
 * handles per-card error states rather than failing the whole page.
 *
 * @param {string[]} symbols
 * @returns {Promise<Record<string, import('../utils/normalizeQuote.js').NormalisedQuote|null>>}
 */
export async function fetchQuotes(symbols) {
  const entries = await Promise.all(
    symbols.map(async (sym) => {
      try {
        return [sym, await fetchQuote(sym)];
      } catch {
        return [sym, null];
      }
    })
  );
  return Object.fromEntries(entries);
}

/**
 * Convenience: fetch history for multiple symbols in parallel.
 *
 * @param {string[]} symbols
 * @param {'day'|'7d'|'quarter'} window
 * @returns {Promise<Record<string, import('../utils/normalizeQuote.js').Candle[]|null>>}
 */
export async function fetchHistories(symbols, window) {
  const entries = await Promise.all(
    symbols.map(async (sym) => {
      try {
        return [sym, await fetchHistory(sym, window)];
      } catch {
        return [sym, null];
      }
    })
  );
  return Object.fromEntries(entries);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Derive a QuoteSummary from a NormalisedQuote.
 * All formatting lives here so the UI receives ready-to-render strings.
 *
 * @param {import('../utils/normalizeQuote.js').NormalisedQuote} quote
 * @returns {import('../utils/normalizeQuote.js').QuoteSummary}
 */
function buildSummary(quote) {
  const isUp = quote.change >= 0;
  const sign = isUp ? '+' : '';
  return {
    ...quote,
    // Pre-formatted display strings
    priceDisplay:     `${quote.currency} ${quote.price.toFixed(2)}`,
    changeDisplay:    `${sign}${quote.change.toFixed(2)}`,
    changePctDisplay: `${sign}${quote.changePct.toFixed(2)}%`,
    direction:        isUp ? 'up' : 'down',
    volumeDisplay:    formatVolume(quote.volume),
  };
}

function formatVolume(vol) {
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000)     return `${(vol / 1_000).toFixed(0)}K`;
  return String(vol);
}
