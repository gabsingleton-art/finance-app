# Finance App — IBM Market Dashboard

A React-based finance analytics application built as part of the IBM Bob GitHub SDLC Lab.

Tracks **IBM** and up to four competitors using Yahoo Finance data, with three time-window views: **Today**, **Last 7 Days**, and **Last Quarter**.

---

## Quick Start

```bash
# Install dependencies
npm install

# Copy env config
cp .env.example .env

# Start the app in mock mode (no Yahoo Finance proxy needed)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (port 3000) |
| `npm run build` | Production build → `build/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | ESLint — exits non-zero on any warning |
| `npm test` | Run Jest test suite |
| `npm run test:ci` | Jest in CI mode (no watch, fail-fast) |
| `npm run server` | Start Express proxy for live Yahoo Finance data |

---

## Project Structure

```
src/
├── services/          # Data layer: financeService, yahooFinanceAdapter, mockAdapter
├── hooks/             # useMarketData — data fetching + state
├── components/
│   ├── layout/        # AppShell, ErrorBoundary
│   ├── dashboard/     # DashboardPage, TimeWindowTabs, CompanyGrid
│   ├── cards/         # ChartCard (loading/error/data), SummaryCard
│   └── charts/        # DayView, WeekView, QuarterView (Recharts leaves)
├── constants/         # companies.js — single source of truth for tracked tickers
├── utils/             # normalizeQuote.js — pure transforms, fully unit-tested
├── styles/            # index.css — design tokens + component styles
└── __tests__/         # Mirror of src/ — unit, component, integration tests
server/
└── proxy.js           # Express proxy for yahoo-finance2 (Node.js only)
```

---

## Data Modes

### Mock mode (default — `REACT_APP_USE_MOCK=true`)
Uses deterministic fixture data from `src/services/mockAdapter.js`.  
No network calls, no proxy server required. Safe for CI and offline development.

### Live mode (`REACT_APP_USE_MOCK=false`)
Fetches real data from Yahoo Finance via the local Express proxy.

```bash
# Terminal 1 — start the proxy
npm run server

# Terminal 2 — start the React dev server
REACT_APP_USE_MOCK=false npm run dev
```

---

## Adding a Company

Edit [`src/constants/companies.js`](src/constants/companies.js):

```js
export const COMPANIES = [
  { symbol: 'IBM',  label: 'IBM',        color: '#3b82d4' },
  // Add a new entry here:
  { symbol: 'GOOGL', label: 'Alphabet',  color: '#4285f4' },
];
```

No other file needs to change for the new company to appear in all three views.

---

## Validation

Run the full local check suite (mirrors CI):

```bash
npm install
npm run lint
npm test -- --watchAll=false
npm run build
```

All three commands must exit with code 0 before committing.

---

## CI

The GitHub Actions workflow at [`.github/workflows/finance-app-ci.yml`](../.github/workflows/finance-app-ci.yml) runs `npm install → lint → test → build` on every push to `main`, `feature/**`, and `bob/**` branches.

---

## Companies Tracked

| Symbol | Company |
|---|---|
| IBM | IBM |
| MSFT | Microsoft |
| ORCL | Oracle |
| SAP | SAP |
| CRM | Salesforce |

---

## Part of the IBM Bob GitHub SDLC Lab

See [`WORKSHOP-part1-BUILD.md`](../WORKSHOP-part1-BUILD.md) and [`WORKSHOP-part2-GITHUB-AUTOMATION.md`](../WORKSHOP-part2-GITHUB-AUTOMATION.md) for the full workshop guide.
