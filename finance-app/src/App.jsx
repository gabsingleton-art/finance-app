/**
 * App.jsx
 *
 * Application root. Assembles AppShell, ErrorBoundary, and DashboardPage.
 * Import order: layout → page. No routing needed for the initial single-page app.
 */

import React from 'react';
import { AppShell }      from './components/layout/AppShell.jsx';
import { ErrorBoundary } from './components/layout/ErrorBoundary.jsx';
import { DashboardPage } from './components/dashboard/DashboardPage.jsx';
import './styles/index.css';

export function App() {
  return (
    <AppShell>
      <ErrorBoundary>
        <DashboardPage />
      </ErrorBoundary>
    </AppShell>
  );
}

export default App;
