/**
 * useMarketData.js
 *
 * Custom hook that orchestrates all data fetching for the dashboard.
 *
 * Returns:
 *   quotes    — Record<symbol, NormalisedQuote | null>
 *   histories — Record<symbol, Candle[] | null>
 *   isLoading — true while any fetch is in flight
 *   error     — first top-level error string (if the fetch itself throws)
 *   refresh   — call to manually re-trigger the fetch
 *
 * Per-company errors (e.g. bad symbol) are returned as null in quotes/histories
 * rather than bubbling up here, so each ChartCard can show its own error state.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchQuotes, fetchHistories } from '../services/financeService.js';

/**
 * @param {string[]} symbols - Array of ticker symbols to fetch
 * @param {'day'|'7d'|'quarter'} window - Time window for history data
 */
export function useMarketData(symbols, window) {
  const [quotes,    setQuotes]    = useState({});
  const [histories, setHistories] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);

  // Track the most recent fetch so we can ignore stale responses
  const fetchIdRef = useRef(0);

  const load = useCallback(async () => {
    if (!symbols || symbols.length === 0) return;

    const id = ++fetchIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const [quotesResult, historiesResult] = await Promise.all([
        fetchQuotes(symbols),
        fetchHistories(symbols, window),
      ]);

      if (fetchIdRef.current !== id) return; // stale — discard

      setQuotes(quotesResult);
      setHistories(historiesResult);
    } catch (err) {
      if (fetchIdRef.current !== id) return;
      setError(err?.message ?? 'Failed to load market data.');
    } finally {
      if (fetchIdRef.current === id) setIsLoading(false);
    }
  }, [symbols, window]);
  // Note: symbols is an array — callers should stabilise it with useMemo if
  // they construct it inline to avoid infinite re-fetch loops.

  useEffect(() => {
    load();
  }, [load]);

  return { quotes, histories, isLoading, error, refresh: load };
}
