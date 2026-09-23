/**
 * normalizeQuote.test.js
 *
 * Unit tests for the pure transform functions in utils/normalizeQuote.js.
 * No DOM, no React — just input → output assertions.
 */

import { normalizeQuote, normalizeHistory } from '../../utils/normalizeQuote.js';

// ---------------------------------------------------------------------------
// normalizeQuote
// ---------------------------------------------------------------------------
describe('normalizeQuote', () => {
  const raw = {
    symbol:                    'ibm',
    shortName:                 'International Business Machines',
    regularMarketPrice:        175.40,
    regularMarketChange:       1.25,
    regularMarketChangePercent: 0.718,
    regularMarketOpen:         174.15,
    regularMarketDayHigh:      176.20,
    regularMarketDayLow:       173.80,
    regularMarketVolume:       3450000,
    currency:                  'USD',
    regularMarketTime:         1700000000000,
  };

  it('normalises a well-formed raw quote', () => {
    const result = normalizeQuote(raw);

    expect(result.symbol).toBe('IBM');
    expect(result.name).toBe('International Business Machines');
    expect(result.price).toBe(175.40);
    expect(result.change).toBe(1.25);
    expect(result.changePct).toBeCloseTo(0.718);
    expect(result.open).toBe(174.15);
    expect(result.high).toBe(176.20);
    expect(result.low).toBe(173.80);
    expect(result.volume).toBe(3450000);
    expect(result.currency).toBe('USD');
    expect(result.timestamp).toBe(1700000000000);
  });

  it('uses shorthand field names when regularMarket* fields are absent', () => {
    const result = normalizeQuote({ symbol: 'MSFT', price: 400, change: -2, changePct: -0.5 });
    expect(result.price).toBe(400);
    expect(result.change).toBe(-2);
    expect(result.changePct).toBe(-0.5);
  });

  it('defaults missing numeric fields to 0', () => {
    const result = normalizeQuote({ symbol: 'XYZ' });
    expect(result.price).toBe(0);
    expect(result.change).toBe(0);
    expect(result.volume).toBe(0);
  });

  it('defaults missing currency to USD', () => {
    const result = normalizeQuote({ symbol: 'XYZ' });
    expect(result.currency).toBe('USD');
  });

  it('uppercases the symbol', () => {
    const result = normalizeQuote({ symbol: 'orcl' });
    expect(result.symbol).toBe('ORCL');
  });

  it('throws when called with a non-object', () => {
    expect(() => normalizeQuote(null)).toThrow();
    expect(() => normalizeQuote('IBM')).toThrow();
    expect(() => normalizeQuote(42)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// normalizeHistory
// ---------------------------------------------------------------------------
describe('normalizeHistory', () => {
  const rawCandles = [
    { date: '2024-03-15', close: 175.00, open: 174.00, high: 176.00, low: 173.50, volume: 2000000 },
    { date: '2024-03-14', close: 173.75, open: 172.50, high: 174.50, low: 172.00, volume: 1800000 },
    { date: '2024-03-16', close: 176.25, open: 175.50, high: 177.00, low: 175.00, volume: 2200000 },
  ];

  it('normalises and sorts candles by date ascending', () => {
    const result = normalizeHistory(rawCandles);

    expect(result).toHaveLength(3);
    expect(result[0].date).toBe('2024-03-14');
    expect(result[1].date).toBe('2024-03-15');
    expect(result[2].date).toBe('2024-03-16');
  });

  it('maps all expected fields', () => {
    const [first] = normalizeHistory([rawCandles[0]]);

    expect(first.close).toBe(175.00);
    expect(first.open).toBe(174.00);
    expect(first.high).toBe(176.00);
    expect(first.low).toBe(173.50);
    expect(first.volume).toBe(2000000);
  });

  it('accepts capitalised field names (e.g. from CSV sources)', () => {
    const result = normalizeHistory([
      { Date: '2024-01-10', Close: 100, Open: 99, High: 101, Low: 98, Volume: 500000 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].close).toBe(100);
  });

  it('filters out entries without a close price', () => {
    const withMissing = [
      ...rawCandles,
      { date: '2024-03-17', open: 177 },           // no close
      { date: '2024-03-18', close: null },          // null close
    ];
    const result = normalizeHistory(withMissing);
    expect(result).toHaveLength(3);
  });

  it('returns an empty array for non-array input', () => {
    expect(normalizeHistory(null)).toEqual([]);
    expect(normalizeHistory(undefined)).toEqual([]);
    expect(normalizeHistory('invalid')).toEqual([]);
  });
});
