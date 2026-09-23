/**
 * companies.js
 *
 * Single source of truth for the tracked companies.
 * Add or remove entries here — no other file needs to change
 * to support a different company set.
 *
 * Each entry:
 *   symbol   — Yahoo Finance ticker symbol
 *   label    — Human-readable display name
 *   color    — Chart line/bar colour (used consistently across all views)
 */

export const COMPANIES = [
  { symbol: 'IBM',  label: 'IBM',        color: '#3b82d4' },
  { symbol: 'MSFT', label: 'Microsoft',  color: '#7c5cd8' },
  { symbol: 'ORCL', label: 'Oracle',     color: '#e05c3a' },
  { symbol: 'SAP',  label: 'SAP',        color: '#2da44e' },
  { symbol: 'CRM',  label: 'Salesforce', color: '#f59e0b' },
];

/** Symbols array — convenient shorthand for data-fetching calls. */
export const SYMBOLS = COMPANIES.map((c) => c.symbol);

/** Look up a company entry by symbol. Returns undefined if not found. */
export function getCompany(symbol) {
  return COMPANIES.find((c) => c.symbol === symbol.toUpperCase());
}
