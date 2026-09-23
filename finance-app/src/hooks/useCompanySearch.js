/**
 * useCompanySearch.js
 *
 * Manages the full lifecycle of a user-submitted ticker symbol search:
 *   - controlled input value
 *   - client-side validation (empty symbol rejected before any fetch)
 *   - async fetch of quote + history for the submitted symbol
 *   - loading / error / data states isolated from useMarketData
 *   - clear action that resets everything back to the initial state
 *   - automatic re-fetch when activeWindow changes (keeps the card in sync
 *     with the tab bar without any extra wiring in DashboardPage)
 *
 * The hook calls fetchQuote / fetchHistory from financeService — the same
 * functions used by useMarketData — so both mock and live adapters work
 * transparently.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchQuote, fetchHistory } from '../services/financeService.js';

const SYMBOL_REGEX = /^[A-Z0-9.^-]{1,10}$/i;

/**
 * @param {'day'|'7d'|'quarter'} activeWindow - current time-window selection
 */
export function useCompanySearch(activeWindow) {
  const [inputValue,      setInputValue]      = useState('');
  const [submittedSymbol, setSubmittedSymbol] = useState(null);
  const [quote,           setQuote]           = useState(null);
  const [history,         setHistory]         = useState(null);
  const [isLoading,       setIsLoading]       = useState(false);
  const [error,           setError]           = useState(null);
  const [validationError, setValidationError] = useState(null);

  // Stale-request guard — same pattern as useMarketData
  const fetchIdRef = useRef(0);

  // ---------------------------------------------------------------------------
  // Internal fetch — runs whenever submittedSymbol or activeWindow changes
  // ---------------------------------------------------------------------------
  const loadSymbol = useCallback(async (symbol, window) => {
    if (!symbol) return;

    const id = ++fetchIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const [q, h] = await Promise.all([
        fetchQuote(symbol),
        fetchHistory(symbol, window),
      ]);

      if (fetchIdRef.current !== id) return; // stale — discard

      // Treat a result where both price and history are empty as "not found"
      if (q.price === 0 && (!h || h.length === 0)) {
        setError(`No data found for "${symbol}". Check the symbol and try again.`);
        setQuote(null);
        setHistory(null);
      } else {
        setQuote(q);
        setHistory(h);
      }
    } catch (err) {
      if (fetchIdRef.current !== id) return;
      setError(
        err?.message?.includes('502') || err?.message?.includes('proxy')
          ? `Could not reach the data server for "${symbol}". Try again shortly.`
          : `Failed to load data for "${symbol}": ${err?.message ?? 'unknown error'}`
      );
      setQuote(null);
      setHistory(null);
    } finally {
      if (fetchIdRef.current === id) setIsLoading(false);
    }
  }, []); // no deps — symbol and window are passed as arguments

  // Re-fetch automatically when the time window changes (if a symbol is active)
  useEffect(() => {
    if (submittedSymbol) {
      loadSymbol(submittedSymbol, activeWindow);
    }
  }, [submittedSymbol, activeWindow, loadSymbol]);

  // ---------------------------------------------------------------------------
  // Public actions
  // ---------------------------------------------------------------------------

  /**
   * Validate the current inputValue and, if valid, commit it as the
   * submittedSymbol (which triggers the useEffect above).
   */
  const submit = useCallback(() => {
    const trimmed = inputValue.trim().toUpperCase();

    if (!trimmed) {
      setValidationError('Please enter a ticker symbol.');
      return;
    }

    if (!SYMBOL_REGEX.test(trimmed)) {
      setValidationError('Symbol must be 1–10 alphanumeric characters.');
      return;
    }

    setValidationError(null);

    // If the same symbol is resubmitted, force a re-fetch by triggering loadSymbol directly
    if (trimmed === submittedSymbol) {
      loadSymbol(trimmed, activeWindow);
    } else {
      setSubmittedSymbol(trimmed);
      // Reset previous results so the card doesn't flash stale data
      setQuote(null);
      setHistory(null);
      setError(null);
    }
  }, [inputValue, submittedSymbol, activeWindow, loadSymbol]);

  /** Reset all state — returns the panel to its initial hidden state. */
  const clear = useCallback(() => {
    ++fetchIdRef.current; // cancel any in-flight fetch
    setInputValue('');
    setSubmittedSymbol(null);
    setQuote(null);
    setHistory(null);
    setIsLoading(false);
    setError(null);
    setValidationError(null);
  }, []);

  return {
    // Input control
    inputValue,
    setInputValue,
    validationError,
    // Fetch state
    submittedSymbol,
    quote,
    history,
    isLoading,
    error,
    // Actions
    submit,
    clear,
  };
}
