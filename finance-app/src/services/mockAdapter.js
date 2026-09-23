/**
 * mockAdapter.js
 *
 * Returns deterministic fixture data so the full UI can be developed and
 * tested without any network calls or a running proxy server.
 *
 * Enabled when REACT_APP_USE_MOCK=true (or when running Jest tests).
 *
 * The shapes returned here mirror exactly what yahooFinanceAdapter returns,
 * so financeService.js can use either adapter transparently.
 */

import { COMPANIES } from '../constants/companies.js';

// ---------------------------------------------------------------------------
// Fixture prices — loosely realistic, stable across runs
// ---------------------------------------------------------------------------
const BASE_PRICES = {
  IBM:  175.40,
  MSFT: 415.20,
  ORCL: 128.75,
  SAP:  195.60,
  CRM:  278.90,
};

const BASE_CHANGES = {
  IBM:   1.25,
  MSFT: -2.80,
  ORCL:  0.95,
  SAP:   3.10,
  CRM:  -1.45,
};

/**
 * Return a normaliser-ready quote object for one symbol.
 * @param {string} symbol
 * @returns {Object}
 */
export function mockQuote(symbol) {
  const key = symbol.toUpperCase();
  const company = COMPANIES.find((c) => c.symbol === key);
  const price = BASE_PRICES[key] ?? 100;
  const change = BASE_CHANGES[key] ?? 0;

  return {
    symbol:    key,
    name:      company?.label ?? key,
    price,
    change,
    changePct: (change / (price - change)) * 100,
    open:      price - change - 0.5,
    high:      price + 1.2,
    low:       price - change - 1.8,
    volume:    3_450_000 + Math.floor(Math.random() * 500_000),
    currency:  'USD',
    timestamp: Date.now(),
  };
}

/**
 * Return an array of mock candles for the requested time window.
 *
 * @param {string} symbol
 * @param {'day'|'7d'|'quarter'} window
 * @returns {Object[]}
 */
export function mockHistory(symbol, window) {
  const key = symbol.toUpperCase();
  const basePrice = BASE_PRICES[key] ?? 100;

  const days = windowToDays(window);
  const candles = [];
  const now = Date.now();

  let price = basePrice * 0.92; // start slightly below current

  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);

    // Skip weekends for multi-day windows
    if (window !== 'day') {
      const dow = date.getDay();
      if (dow === 0 || dow === 6) continue;
    }

    const movement = (Math.random() - 0.48) * (basePrice * 0.015);
    price = Math.max(price + movement, basePrice * 0.75);

    const open   = price - movement * 0.3;
    const high   = Math.max(price, open) + Math.random() * (basePrice * 0.005);
    const low    = Math.min(price, open) - Math.random() * (basePrice * 0.005);
    const volume = 2_000_000 + Math.floor(Math.random() * 1_500_000);

    // For intraday (day window) use HH:MM labels instead of dates
    const label =
      window === 'day'
        ? `${String(9 + Math.floor((days - i) * (6.5 / days))).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
        : date.toISOString().slice(0, 10);

    candles.push({ date: label, close: +price.toFixed(2), open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), volume });
  }

  return candles;
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function windowToDays(window) {
  switch (window) {
    case 'day':     return 26;  // ~26 intraday 15-min bars
    case '7d':      return 7;
    case 'quarter': return 65;
    default:        return 7;
  }
}
