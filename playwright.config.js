const { defineConfig } = require('@playwright/test');

// End-to-end tests load the real unpacked extension into Chromium.
module.exports = defineConfig({
  testDir: 'SUGAM/extension/tests/e2e',
  timeout: 60000,
  workers: 1, // each test starts its own browser with the extension
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list'
});
