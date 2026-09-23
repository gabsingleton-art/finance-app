/**
 * proxy.js — lightweight Express proxy for Yahoo Finance data
 *
 * Bridges the browser React app to yahoo-finance2, which is a Node.js-only
 * package that cannot run in the browser due to CORS restrictions.
 *
 * Usage:
 *   node server/proxy.js
 *   # or: npm run server
 *
 * The proxy listens on PORT (default 3001).
 * During development, Vite proxies /api/* → http://localhost:3001 automatically.
 */

import express from 'express';
import cors    from 'cors';
import yahooFinance from 'yahoo-finance2';

const PORT = process.env.PORT || 3001;
const app  = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// ---------------------------------------------------------------------------
// GET /api/quote?symbol=IBM
// ---------------------------------------------------------------------------
app.get('/api/quote', async (req, res) => {
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'symbol query parameter is required' });
  }

  try {
    const result = await yahooFinance.quote(symbol.toUpperCase());
    res.json({
      symbol:    result.symbol,
      name:      result.shortName ?? result.longName ?? symbol,
      price:     result.regularMarketPrice,
      change:    result.regularMarketChange,
      changePct: result.regularMarketChangePercent,
      open:      result.regularMarketOpen,
      high:      result.regularMarketDayHigh,
      low:       result.regularMarketDayLow,
      volume:    result.regularMarketVolume,
      currency:  result.currency ?? 'USD',
      timestamp: result.regularMarketTime
        ? new Date(result.regularMarketTime).getTime()
        : Date.now(),
    });
  } catch (err) {
    console.error(`[proxy] quote error for ${symbol}:`, err.message);
    res.status(502).json({ error: `Failed to fetch quote for ${symbol}: ${err.message}` });
  }
});

// ---------------------------------------------------------------------------
// GET /api/history?symbol=IBM&window=7d
// ---------------------------------------------------------------------------
app.get('/api/history', async (req, res) => {
  const { symbol, window } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'symbol query parameter is required' });
  }

  const { period1, interval } = windowToYahooParams(window ?? '7d');

  try {
    const result = await yahooFinance.historical(symbol.toUpperCase(), {
      period1,
      interval,
    });

    const candles = result.map((r) => ({
      date:   r.date instanceof Date ? r.date.toISOString().slice(0, 10) : String(r.date),
      close:  r.close,
      open:   r.open,
      high:   r.high,
      low:    r.low,
      volume: r.volume,
    }));

    res.json(candles);
  } catch (err) {
    console.error(`[proxy] history error for ${symbol}:`, err.message);
    res.status(502).json({ error: `Failed to fetch history for ${symbol}: ${err.message}` });
  }
});

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`[proxy] Finance proxy running on http://localhost:${PORT}`);
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function windowToYahooParams(window) {
  const now = new Date();
  switch (window) {
    case 'day': {
      // Intraday — use today's date with 15m interval
      const start = new Date(now);
      start.setHours(9, 30, 0, 0);
      return { period1: start.toISOString().slice(0, 10), interval: '15m' };
    }
    case '7d':
      return { period1: daysAgo(7),  interval: '1d' };
    case 'quarter':
      return { period1: daysAgo(65), interval: '1d' };
    default:
      return { period1: daysAgo(7),  interval: '1d' };
  }
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
