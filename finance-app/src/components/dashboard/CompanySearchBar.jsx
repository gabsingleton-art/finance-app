/**
 * CompanySearchBar.jsx
 *
 * Purely presentational search bar for entering a user-supplied ticker symbol.
 * No data fetching — all logic lives in useCompanySearch.
 *
 * Renders:
 *   - labelled text input (Enter key triggers onSubmit)
 *   - Search button
 *   - Inline validation error message (shown when validationError is set)
 *   - Clear button (shown only when hasResult is true)
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * @param {{
 *   value:           string,
 *   onChange:        (val: string) => void,
 *   onSubmit:        () => void,
 *   onClear:         () => void,
 *   isLoading:       boolean,
 *   validationError: string | null,
 *   hasResult:       boolean
 * }} props
 */
export function CompanySearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  isLoading,
  validationError,
  hasResult,
}) {
  const inputId = 'company-search-input';
  const errorId = 'company-search-error';

  function handleKeyDown(e) {
    if (e.key === 'Enter') onSubmit();
  }

  return (
    <div className="company-search-bar">
      <div className="company-search-bar__row">
        <label className="company-search-bar__label" htmlFor={inputId}>
          Add a company
        </label>

        <div className="company-search-bar__controls">
          <input
            id={inputId}
            type="text"
            className={`company-search-bar__input${validationError ? ' company-search-bar__input--error' : ''}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ticker symbol, e.g. AAPL"
            aria-describedby={validationError ? errorId : undefined}
            aria-invalid={!!validationError}
            maxLength={10}
            disabled={isLoading}
            autoComplete="off"
            spellCheck={false}
          />

          <button
            className="btn btn--primary"
            onClick={onSubmit}
            disabled={isLoading}
            aria-label="Search for company"
          >
            {isLoading ? 'Loading…' : 'Search'}
          </button>

          {hasResult && (
            <button
              className="btn"
              onClick={onClear}
              disabled={isLoading}
              aria-label="Clear custom company"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {validationError && (
        <p id={errorId} className="company-search-bar__error" role="alert">
          {validationError}
        </p>
      )}
    </div>
  );
}

CompanySearchBar.propTypes = {
  value:           PropTypes.string.isRequired,
  onChange:        PropTypes.func.isRequired,
  onSubmit:        PropTypes.func.isRequired,
  onClear:         PropTypes.func.isRequired,
  isLoading:       PropTypes.bool,
  validationError: PropTypes.string,
  hasResult:       PropTypes.bool,
};

export default CompanySearchBar;
