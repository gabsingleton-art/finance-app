/**
 * CustomCompanyPanel.test.jsx
 *
 * Tests for CustomCompanyPanel — the ChartCard wrapper for the user-selected company.
 * Covers loading state, error state, data rendered for each time window, and
 * the section label accessible name.
 *
 * Recharts is stubbed to null renderers (same pattern as DashboardPage.test.jsx)
 * to prevent jsdom DOM prop warnings.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomCompanyPanel } from '../../components/dashboard/CustomCompanyPanel.jsx';

jest.mock('recharts', () => {
  const nullStub = () => null;
  return {
    ResponsiveContainer: nullStub, BarChart: nullStub, LineChart: nullStub,
    AreaChart: nullStub, Bar: nullStub, Line: nullStub, Area: nullStub,
    XAxis: nullStub, YAxis: nullStub, CartesianGrid: nullStub,
    Tooltip: nullStub, Legend: nullStub,
  };
});

const MOCK_QUOTE = {
  symbol: 'AAPL', name: 'Apple Inc.', price: 195.5, change: 2.1,
  changePct: 1.08, open: 193.4, high: 196.0, low: 193.0,
  volume: 55_000_000, currency: 'USD', timestamp: Date.now(),
};
const MOCK_HISTORY = [
  { date: '2024-01-10', close: 190, open: 189, high: 191, low: 188, volume: 1000 },
  { date: '2024-01-11', close: 192, open: 190, high: 193, low: 189, volume: 1100 },
];

const baseProps = {
  symbol:    'AAPL',
  quote:     MOCK_QUOTE,
  history:   MOCK_HISTORY,
  isLoading: false,
  error:     null,
  window:    'day',
  onRetry:   jest.fn(),
};

afterEach(() => jest.clearAllMocks());

describe('CustomCompanyPanel', () => {
  it('renders the section with an accessible label containing the company name', () => {
    render(<CustomCompanyPanel {...baseProps} />);
    // Label is "Custom company: Apple Inc." when quote.name is available
    expect(screen.getByRole('region', { name: /apple inc/i })).toBeInTheDocument();
  });

  it('shows the Custom badge', () => {
    render(<CustomCompanyPanel {...baseProps} />);
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('shows the company name as the panel title when quote is present', () => {
    render(<CustomCompanyPanel {...baseProps} />);
    expect(screen.getAllByText('Apple Inc.').length).toBeGreaterThanOrEqual(1);
  });

  it('falls back to symbol as title when quote is null', () => {
    render(<CustomCompanyPanel {...baseProps} quote={null} />);
    expect(screen.getAllByText('AAPL').length).toBeGreaterThanOrEqual(1);
  });

  it('renders loading state via ChartCard skeleton', () => {
    render(<CustomCompanyPanel {...baseProps} isLoading={true} quote={null} history={null} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error state via ChartCard alert', () => {
    render(<CustomCompanyPanel {...baseProps} error="No data found for AAPL." quote={null} history={null} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    // ChartCard renders its own fixed message "Could not load <label> data."
    expect(screen.getByText(/could not load/i)).toBeInTheDocument();
  });

  it('calls onRetry when Retry button is clicked in error state', async () => {
    const onRetry = jest.fn();
    render(<CustomCompanyPanel {...baseProps} error="Network error" onRetry={onRetry} quote={null} />);
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders without error for the 7d window', () => {
    render(<CustomCompanyPanel {...baseProps} window="7d" />);
    // No error, no loading — panel renders cleanly
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders without error for the quarter window', () => {
    render(<CustomCompanyPanel {...baseProps} window="quarter" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders the price from SummaryCard in day view', () => {
    render(<CustomCompanyPanel {...baseProps} window="day" />);
    expect(screen.getByText(/195\.50/)).toBeInTheDocument();
  });
});
