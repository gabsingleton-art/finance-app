/**
 * CompanySearchBar.test.jsx
 *
 * Tests for CompanySearchBar — purely presentational component.
 * Covers: render, input changes, Enter key submit, validation error display,
 * Clear button visibility and click, loading state disabling.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompanySearchBar } from '../../components/dashboard/CompanySearchBar.jsx';

const defaults = {
  value:           '',
  onChange:        jest.fn(),
  onSubmit:        jest.fn(),
  onClear:         jest.fn(),
  isLoading:       false,
  validationError: null,
  hasResult:       false,
};

function renderBar(overrides = {}) {
  return render(<CompanySearchBar {...defaults} {...overrides} />);
}

afterEach(() => jest.clearAllMocks());

describe('CompanySearchBar', () => {
  it('renders the input and Search button', () => {
    renderBar();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('does NOT render the Clear button when hasResult is false', () => {
    renderBar({ hasResult: false });
    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
  });

  it('renders the Clear button when hasResult is true', () => {
    renderBar({ hasResult: true });
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('calls onChange when the user types', async () => {
    const onChange = jest.fn();
    renderBar({ onChange });
    await userEvent.type(screen.getByRole('textbox'), 'A');
    expect(onChange).toHaveBeenCalled();
  });

  it('calls onSubmit when Search button is clicked', async () => {
    const onSubmit = jest.fn();
    renderBar({ onSubmit });
    await userEvent.click(screen.getByRole('button', { name: /search/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit when Enter is pressed in the input', async () => {
    const onSubmit = jest.fn();
    renderBar({ onSubmit });
    await userEvent.type(screen.getByRole('textbox'), '{Enter}');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onClear when Clear button is clicked', async () => {
    const onClear = jest.fn();
    renderBar({ hasResult: true, onClear });
    await userEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('shows the validation error message', () => {
    renderBar({ validationError: 'Please enter a ticker symbol.' });
    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a ticker symbol.');
  });

  it('marks the input as aria-invalid when there is a validation error', () => {
    renderBar({ validationError: 'Bad symbol.' });
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not show an alert when validationError is null', () => {
    renderBar({ validationError: null });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('disables the input and buttons while isLoading', () => {
    renderBar({ isLoading: true, hasResult: true });
    expect(screen.getByRole('textbox')).toBeDisabled();
    // Button has aria-label="Search for company" — query by that label
    expect(screen.getByRole('button', { name: /search for company/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /clear/i })).toBeDisabled();
  });

  it('shows "Loading…" text on the Search button while isLoading', () => {
    renderBar({ isLoading: true });
    // The button text changes to "Loading…" but aria-label stays "Search for company"
    expect(screen.getByRole('button', { name: /search for company/i })).toHaveTextContent('Loading…');
  });
});
