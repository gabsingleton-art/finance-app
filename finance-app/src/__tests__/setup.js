/**
 * setup.js — Jest global test setup
 *
 * Runs after the test framework is initialised (setupFilesAfterEnv).
 * Imports @testing-library/jest-dom so its custom matchers (toBeInTheDocument,
 * toHaveTextContent, etc.) are available in every test file without explicit imports.
 */

import '@testing-library/jest-dom';
