// babel.config.cjs
// Used by jest (babel-jest transformer).
// Vite uses its own esbuild-based transform and does not use this file.

module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};
