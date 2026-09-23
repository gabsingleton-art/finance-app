/**
 * AppShell.jsx
 *
 * Top-level application chrome: header with branding and the main content area.
 * Keeps nav concerns out of DashboardPage so the page only handles data + views.
 */

import React from 'react';
import PropTypes from 'prop-types';

export function AppShell({ children }) {
  return (
    <div className="app-shell">
      <header className="app-header" role="banner">
        <div className="app-header__inner">
          <span className="app-header__logo" aria-hidden="true">📈</span>
          <div className="app-header__title-group">
            <h1 className="app-header__title">Market Dashboard</h1>
            <p className="app-header__subtitle">IBM &amp; Competitors — Finance Analytics</p>
          </div>
        </div>
      </header>
      <main className="app-main" id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}

AppShell.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppShell;
