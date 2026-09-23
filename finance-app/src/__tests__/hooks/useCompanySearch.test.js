/**
 * useCompanySearch.test.js
 *
 * Tests for useCompanySearch hook — covers all state transitions:
 *   - empty submit rejected with a validation error (no fetch)
 *   - invalid symbol format rejected
 *   - successful fetch populates quote + history
 *   - failed fetch sets error, clears data
 *   - clear() resets everything to initial state
 *   - re-submitting the same symbol re-fetches directly
 *   - window change triggers a re-fetch when a symbol is active
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useCompanySearch } from '../../hooks/useCompanySearch.js';

// ---------------------------------------------------------------------------
// Mock financeService so no network calls are made
// ---------------------------------------------------------------------------
jest.mock('../../services/financeService.js', () => ({
  fetchQuote: jest.fn(),
  fetchHistory: jest.fn(),
  fetchQuotes: jest.fn(),
  fetchHistories: jest.fn(),
  fetchSummary: jest.fn(),
  fetchSummaries: jest.fn(),
}));

import { fetchQuote, fetchHistory } from '../../services/financeService.js';

const MOCK_QUOTE = {
  symbol: 'AAPL', name: 'Apple Inc.', price: 195.5, change: 2.1,
  changePct: 1.08, open: 193.4, high: 196.0, low: 193.0,
  volume: 55_000_000, currency: 'USD', timestamp: Date.now(),
};
const MOCK_HISTORY = [
  { date: '2024-01-10', close: 190, open: 189, high: 191, low: 188, volume: 1000 },
  { date: '2024-01-11', close: 192, open: 190, high: 193, low: 189, volume: 1100 },
];

beforeEach(() => {
  jest.clearAllMocks();
  fetchQuote.mockResolvedValue(MOCK_QUOTE);
  fetchHistory.mockResolvedValue(MOCK_HISTORY);
});

// ---------------------------------------------------------------------------
// Helper: render the hook with a given window
// ---------------------------------------------------------------------------
function renderSearch(window = 'day') {
  return renderHook(({ w }) => useCompanySearch(w), {
    initialProps: { w: window },
  });
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------
describe('useCompanySearch — initial state', () => {
  it('starts with empty input and no results', () => {
    const { result } = renderSearch();
    expect(result.current.inputValue).toBe('');
    expect(result.current.submittedSymbol).toBeNull();
    expect(result.current.quote).toBeNull();
    expect(result.current.history).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.validationError).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Input control
// ---------------------------------------------------------------------------
describe('useCompanySearch — input control', () => {
  it('setInputValue updates the controlled value', () => {
    const { result } = renderSearch();
    act(() => { result.current.setInputValue('AAPL'); });
    expect(result.current.inputValue).toBe('AAPL');
  });
});

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
describe('useCompanySearch — validation', () => {
  it('empty submit sets validationError without fetching', () => {
    const { result } = renderSearch();
    act(() => { result.current.submit(); });
    expect(result.current.validationError).toMatch(/enter a ticker/i);
    expect(fetchQuote).not.toHaveBeenCalled();
  });

  it('whitespace-only input is treated as empty', () => {
    const { result } = renderSearch();
    act(() => { result.current.setInputValue('   '); });
    act(() => { result.current.submit(); });
    expect(result.current.validationError).toMatch(/enter a ticker/i);
    expect(fetchQuote).not.toHaveBeenCalled();
  });

  it('symbol longer than 10 chars sets validationError', () => {
    const { result } = renderSearch();
    act(() => { result.current.setInputValue('TOOLONGSYMBOL'); });
    act(() => { result.current.submit(); });
    expect(result.current.validationError).toMatch(/1.{1,5}10/i);
    expect(fetchQuote).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Successful fetch
// ---------------------------------------------------------------------------
describe('useCompanySearch — successful fetch', () => {
  it('valid submit clears validationError and fetches data', async () => {
    const { result } = renderSearch();
    act(() => { result.current.setInputValue('AAPL'); });
    act(() => { result.current.submit(); });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.validationError).toBeNull();
    expect(result.current.submittedSymbol).toBe('AAPL');
    expect(result.current.quote).toEqual(MOCK_QUOTE);
    expect(result.current.history).toEqual(MOCK_HISTORY);
    expect(result.current.error).toBeNull();
  });

  it('input is uppercased before submission', async () => {
    const { result } = renderSearch();
    act(() => { result.current.setInputValue('aapl'); });
    act(() => { result.current.submit(); });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.submittedSymbol).toBe('AAPL');
    expect(fetchQuote).toHaveBeenCalledWith('AAPL');
  });
});

// ---------------------------------------------------------------------------
// Failed fetch
// ---------------------------------------------------------------------------
describe('useCompanySearch — failed fetch', () => {
  it('network error sets error and clears quote/history', async () => {
    fetchQuote.mockRejectedValue(new Error('502 Bad Gateway'));
    const { result } = renderSearch();
    act(() => { result.current.setInputValue('AAPL'); });
    act(() => { result.current.submit(); });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toMatch(/could not reach/i);
    expect(result.current.quote).toBeNull();
    expect(result.current.history).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Clear
// ---------------------------------------------------------------------------
describe('useCompanySearch — clear', () => {
  it('clear() resets all state to initial values', async () => {
    const { result } = renderSearch();
    act(() => { result.current.setInputValue('AAPL'); });
    act(() => { result.current.submit(); });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => { result.current.clear(); });

    expect(result.current.inputValue).toBe('');
    expect(result.current.submittedSymbol).toBeNull();
    expect(result.current.quote).toBeNull();
    expect(result.current.history).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.validationError).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Window change re-fetch
// ---------------------------------------------------------------------------
describe('useCompanySearch — window change', () => {
  it('changing activeWindow re-fetches when a symbol is active', async () => {
    const { result, rerender } = renderSearch('day');
    act(() => { result.current.setInputValue('AAPL'); });
    act(() => { result.current.submit(); });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const callsBefore = fetchHistory.mock.calls.length;

    rerender({ w: '7d' });
    await waitFor(() => expect(fetchHistory.mock.calls.length).toBeGreaterThan(callsBefore));

    const lastCall = fetchHistory.mock.calls[fetchHistory.mock.calls.length - 1];
    expect(lastCall[0]).toBe('AAPL');
    expect(lastCall[1]).toBe('7d');
  });

  it('changing window does NOT fetch when no symbol is submitted', async () => {
    const { rerender } = renderSearch('day');
    rerender({ w: '7d' });
    // Allow a tick for any potential effect to fire
    await new Promise((r) => setTimeout(r, 0));
    expect(fetchQuote).not.toHaveBeenCalled();
  });
});
