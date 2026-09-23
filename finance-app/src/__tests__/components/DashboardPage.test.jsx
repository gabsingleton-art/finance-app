/**
 * DashboardPage.test.jsx
 *
 * Integration-level render tests for DashboardPage.
 * The finance service is mocked so no network calls occur.
 * Recharts components are fully stubbed to null renderers to prevent
 * jsdom warnings about unknown DOM props.
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardPage } from '../../components/dashboard/DashboardPage.jsx';

// Mock the entire financeService so tests are fast and deterministic
jest.mock('../../services/financeService.js', () => ({
  fetchQuotes: jest.fn(async (symbols) =>
    Object.fromEntries(
      symbols.map((sym, i) => [
        sym,
        {
          symbol:    sym,
          name:      `${sym} Corp`,
          price:     100 + i * 10,
          change:    1,
          changePct: 1,
          open:      99,
          high:      102,
          low:       98,
          volume:    1000000,
          currency:  'USD',
          timestamp: Date.now(),
        },
      ])
    )
  ),
  fetchHistories: jest.fn(async (symbols) =>
    Object.fromEntries(
      symbols.map((sym) => [
        sym,
        [
          { date: '2024-01-10', close: 100, open: 99, high: 101, low: 98, volume: 1000 },
          { date: '2024-01-11', close: 101, open: 100, high: 102, low: 99, volume: 1100 },
          { date: '2024-01-12', close: 102, open: 101, high: 103, low: 100, volume: 1200 },
        ],
      ])
    )
  ),
}));

// Stub all Recharts exports to null so no Recharts-specific props reach the DOM
jest.mock('recharts', () => {
  // Use jest.requireActual(react) is not needed — we just return null-rendering stubs
  const nullStub = () => null;
  return {
    ResponsiveContainer: nullStub,
    BarChart:            nullStub,
    LineChart:           nullStub,
    AreaChart:           nullStub,
    Bar:                 nullStub,
    Line:                nullStub,
    Area:                nullStub,
    XAxis:               nullStub,
    YAxis:               nullStub,
    CartesianGrid:       nullStub,
    Tooltip:             nullStub,
    Legend:              nullStub,
  };
});

// Helper: render and wait for async data load to settle
async function renderDashboard() {
  let result;
  await act(async () => {
    result = render(<DashboardPage />);
  });
  return result;
}

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the time window tabs', async () => {
    await renderDashboard();

    expect(screen.getByRole('tab', { name: /today/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /7 days/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /quarter/i })).toBeInTheDocument();
  });

  it('shows "Today" tab as active by default', async () => {
    await renderDashboard();

    expect(screen.getByRole('tab', { name: /today/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('renders company data cards once data loads', async () => {
    await renderDashboard();

    await waitFor(() => {
      // IBM appears in both the chart-card__symbol and chart-card__label spans
      expect(screen.getAllByText('IBM').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('switches to 7-day view when the 7 Days tab is clicked', async () => {
    await renderDashboard();

    const weekTab = screen.getByRole('tab', { name: /7 days/i });
    await act(async () => {
      await userEvent.click(weekTab);
    });

    expect(weekTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /today/i })).toHaveAttribute('aria-selected', 'false');
  });

  it('renders a refresh button', async () => {
    await renderDashboard();

    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
  });

  it('shows the quarterly tab as active after clicking Last Quarter', async () => {
    await renderDashboard();

    await act(async () => {
      await userEvent.click(screen.getByRole('tab', { name: /quarter/i }));
    });

    expect(screen.getByRole('tab', { name: /quarter/i })).toHaveAttribute('aria-selected', 'true');
  });
});
