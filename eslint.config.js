const js = require('@eslint/js');
const globals = require('globals');

// Files in shared/ are plain scripts that define globals for the other scripts on the same page.
const sharedGlobals = {
  SugamDom: 'readonly',
  SugamBionic: 'readonly',
  SugamStorage: 'readonly',
  SugamAI: 'readonly',
  SugamI18n: 'readonly',
  PictogramMatcher: 'readonly',
  SensitiveDetector: 'readonly',
  SUGAM_DEFAULT_SETTINGS: 'readonly',
  SUGAM_PRESETS: 'readonly'
};

module.exports = [
  { ignores: ['node_modules/', 'coverage/', 'dist/'] },
  js.configs.recommended,
  {
    files: ['SUGAM/extension/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.browser, ...globals.webextensions, ...globals.serviceworker, ...sharedGlobals }
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
      'no-implied-eval': 'error',
      'no-eval': 'error',
      'no-new-func': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }]
    }
  },
  {
    // Shared scripts also export for Node-based tests, and define their globals themselves.
    files: ['SUGAM/extension/shared/**/*.js'],
    languageOptions: { globals: { ...globals.node } },
    rules: { 'no-redeclare': 'off', 'no-unused-vars': 'off' }
  },
  {
    files: ['SUGAM/extension/tests/**/*.js', 'eslint.config.js', 'playwright.config.js'],
    languageOptions: { sourceType: 'commonjs', globals: { ...globals.node, ...globals.browser, chrome: 'writable' } },
    rules: { 'no-eval': 'off', 'no-new-func': 'off' }
  }
];
