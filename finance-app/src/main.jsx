/**
 * main.jsx
 *
 * React entry point.  Mounts <App /> into the #root DOM node.
 * React 18 createRoot API — enables concurrent features.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found. Check public/index.html.');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
