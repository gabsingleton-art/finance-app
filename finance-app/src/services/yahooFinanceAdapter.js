/**
 * yahooFinanceAdapter.js
 *
 * Fetches data from the local Express proxy server (server/proxy.js),
 * which in turn calls the yahoo-finance2 Node.js library.
 *
 * Why a proxy?  yahoo-finance2 is a Node.js package — it cannot run in the
 * browser due to CORS restrictions on Yahoo's endpoints.  The proxy keeps
 * the browser bundle clean and separates the API key / credential surface.
 *
 * Proxy base URL is configurable via REACT_APP_PROXY_URL (defaults to
 * http://localhost:3001 for local development).
 *
 * Returns raw objects whose field names are mapped by normalizeQuote /
 * normalizeHistory before being used in the UI.
 */

// In Vite: import.meta.env.VITE_PROXY_URL  — but since this module is only
// ever called from the live (non-mock) path it is always running in the browser
// bundle where import.meta is available.  Jest never imports this file directly
// because financeService.js is mocked at the test boundary.
const PROXY_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PROXY_URL) ||
  'http://localhost:3001';

/**
 * Fetch a current quote for a single symbol.
 *
 * @param {string} symbol - Ticker symbol, e.g. "IBM"
 * @returns {Promise<Object>} Raw quote object ready for normalizeQuote()
 */
export async function fetchQuoteFromYahoo(symbol) {
  const url = `${PROXY_BASE}/api/quote?symbol=${encodeURIComponent(symbol)}`;
  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Yahoo Finance proxy error for ${symbol}: ${response.status} ${body}`.trim()
    );
  }

  return response.json();
}

/**
 * Fetch historical candles for a single symbol and time window.
 *
 * @param {string} symbol
 * @param {'day'|'7d'|'quarter'} window
 * @returns {Promise<Object[]>} Array of raw candle objects ready for normalizeHistory()
 */
export async function fetchHistoryFromYahoo(symbol, window) {
  const url = `${PROXY_BASE}/api/history?symbol=${encodeURIComponent(symbol)}&window=${encodeURIComponent(window)}`;
  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Yahoo Finance proxy error for ${symbol} history: ${response.status} ${body}`.trim()
    );
  }

  return response.json();
}
