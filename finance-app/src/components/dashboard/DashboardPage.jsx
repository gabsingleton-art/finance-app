/**
 * DashboardPage.jsx
 *
 * Route-level page component that owns:
 *   - the active time window (Today / 7 Days / Quarter)
 *   - data fetching via useMarketData
 *   - top-level page error state
 *   - composition of TimeWindowTabs + CompanyGrid
 *
 * No props required — all data flows from the finance service through hooks.
 */

import React, { useState, useMemo } from 'react';
import { COMPANIES, SYMBOLS }  from '../../constants/companies.js';
import { useMarketData }        from '../../hooks/useMarketData.js';
import { TimeWindowTabs }       from './TimeWindowTabs.jsx';
import { CompanyGrid }          from './CompanyGrid.jsx';

export function DashboardPage() {
  const [activeWindow, setActiveWindow] = useState('day');

  // Stabilise SYMBOLS array reference so useMarketData doesn't re-fetch on every render
  const symbols = useMemo(() => SYMBOLS, []);

  const { quotes, histories, isLoading, error, refresh } = useMarketData(symbols, activeWindow);

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
