import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: {
      react:        reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        process:          'readonly',
        __VITE_USE_MOCK__: 'readonly',
      },
      parserOptions: {
        ecmaVersion:   2021,
        sourceType:    'module',
        ecmaFeatures:  { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope':   'off', // Not needed with React 17+ JSX transform
      'react/prop-types':           'warn',
      'no-unused-vars':             ['warn', { argsIgnorePattern: '^_' }],
      'no-console':                 ['warn', { allow: ['error', 'warn'] }],
    },
  },
  {
    // Relax rules for test files
    files: ['src/__tests__/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.jest },
    },
    rules: {
      'no-unused-vars': 'off',
    },
  },
];
