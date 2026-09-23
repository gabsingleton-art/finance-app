/**
 * DashboardPage.jsx
 *
 * Route-level page component that owns:
 *   - the active time window (Today / 7 Days / Quarter)
 *   - data fetching via useMarketData (fixed five companies)
 *   - user-selected company search via useCompanySearch
 *   - top-level page error state
 *   - composition of TimeWindowTabs, CompanySearchBar,
 *     CustomCompanyPanel, and CompanyGrid
 *
 * No props required — all data flows from the finance service through hooks.
 */

import React, { useState, useMemo } from 'react';
import { COMPANIES, SYMBOLS }    from '../../constants/companies.js';
import { useMarketData }          from '../../hooks/useMarketData.js';
import { useCompanySearch }       from '../../hooks/useCompanySearch.js';
import { TimeWindowTabs }         from './TimeWindowTabs.jsx';
import { CompanyGrid }            from './CompanyGrid.jsx';
import { CompanySearchBar }       from './CompanySearchBar.jsx';
import { CustomCompanyPanel }     from './CustomCompanyPanel.jsx';

export function DashboardPage() {
  const [activeWindow, setActiveWindow] = useState('day');

  // Stabilise SYMBOLS array reference so useMarketData doesn't re-fetch on every render
  const symbols = useMemo(() => SYMBOLS, []);

  // Fixed five-company data — unchanged by the search feature
  const { quotes, histories, isLoading, error, refresh } = useMarketData(symbols, activeWindow);

  // User-selected company search — completely isolated state
  const search = useCompanySearch(activeWindow);

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__controls">
        <TimeWindowTabs activeWindow={activeWindow} onChange={setActiveWindow} />

        <button
          className="btn btn--icon"
          onClick={refresh}
          disabled={isLoading}
          title="Refresh data"
          aria-label="Refresh market data"
        >
          ↻
        </button>
      </div>

      {/* User-selected company search bar */}
      <CompanySearchBar
        value={search.inputValue}
        onChange={search.setInputValue}
        onSubmit={search.submit}
        onClear={search.clear}
        isLoading={search.isLoading}
        validationError={search.validationError}
        hasResult={!!search.submittedSymbol}
      />

      {/* Custom company panel — only shown after a successful search */}
      {search.submittedSymbol && (
        <CustomCompanyPanel
          symbol={search.submittedSymbol}
          quote={search.quote}
          history={search.history}
          isLoading={search.isLoading}
          error={search.error}
          window={activeWindow}
          onRetry={search.submit}
        />
      )}

      {/* Fixed five-company comparison dashboards — never affected by search */}
      {error && (
        <div className="dashboard-page__error" role="alert">
          <p>{error}</p>
          <button className="btn btn--primary" onClick={refresh}>Try again</button>
        </div>
      )}

      <CompanyGrid
        companies={COMPANIES}
        window={activeWindow}
        quotes={quotes}
        histories={histories}
        isLoading={isLoading}
        onRetry={refresh}
      />
    </div>
  );
}

export default DashboardPage;
