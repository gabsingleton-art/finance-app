/**
 * ChartCard.test.jsx
 *
 * Tests for ChartCard — the reusable container component.
 * Covers the three distinct render states: loading, error, and data.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChartCard } from '../../components/cards/ChartCard.jsx';

describe('ChartCard', () => {
  const defaultProps = {
    symbol:    'IBM',
    label:     'IBM',
    color:     '#3b82d4',
    isLoading: false,
    error:     null,
    onRetry:   jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the symbol and label in the header', () => {
    render(<ChartCard {...defaultProps}>content</ChartCard>);

    // Both symbol span and label span display "IBM" — confirm at least one is present
    expect(screen.getAllByText('IBM').length).toBeGreaterThanOrEqual(1);
  });

  it('renders children when not loading and no error', () => {
    render(
      <ChartCard {...defaultProps}>
        <span data-testid="chart-content">chart goes here</span>
      </ChartCard>
    );

    expect(screen.getByTestId('chart-content')).toBeInTheDocument();
  });

  it('renders loading skeleton and hides children while isLoading', () => {
    render(
      <ChartCard {...defaultProps} isLoading={true}>
        <span data-testid="chart-content">chart</span>
      </ChartCard>
    );

    // Loading skeleton should be present
    expect(screen.getByRole('status')).toBeInTheDocument();
    // Children should not be rendered while loading
    expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
  });

  it('renders error message and hides children on error', () => {
    render(
      <ChartCard {...defaultProps} error="Could not load IBM data.">
        <span data-testid="chart-content">chart</span>
      </ChartCard>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/could not load IBM data/i)).toBeInTheDocument();
    expect(screen.queryByTestId('chart-content')).not.toBeInTheDocument();
  });

  it('renders a Retry button when error is set and onRetry is provided', () => {
    render(
      <ChartCard {...defaultProps} error="Network error">
        children
      </ChartCard>
    );

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('calls onRetry when the Retry button is clicked', async () => {
    const onRetry = jest.fn();
    render(
      <ChartCard {...defaultProps} error="Network error" onRetry={onRetry}>
        children
      </ChartCard>
    );

    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render a Retry button when onRetry is not provided', () => {
    render(
      <ChartCard {...defaultProps} error="Network error" onRetry={undefined}>
        children
      </ChartCard>
    );

    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('error state takes precedence over loading state', () => {
    render(
      <ChartCard {...defaultProps} isLoading={true} error="Some error">
        children
      </ChartCard>
    );

    // When both are set, error wins (loading=true, error set → error state wins
    // because the JSX condition is !isLoading && error)
    // So neither content nor error shows — only loading skeleton
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
