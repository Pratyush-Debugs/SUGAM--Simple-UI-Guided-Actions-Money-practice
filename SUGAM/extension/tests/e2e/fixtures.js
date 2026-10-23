/**
 * Playwright fixtures: a Chromium context with SUGAM loaded, a local server for
 * the sample pages in tests/, and helpers to talk to the content script.
 */
const { test: base, chromium, expect } = require('@playwright/test');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const EXTENSION = path.resolve(__dirname, '../..');
const PAGES = path.resolve(__dirname, '..');

const test = base.extend({
  // eslint-disable-next-line no-empty-pattern
  server: async ({}, use) => {
    const server = http.createServer((req, res) => {
      const file = path.join(PAGES, path.normalize(decodeURIComponent(req.url.split('?')[0])));
      if (!file.startsWith(PAGES) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.statusCode = 404;
        res.end();
        return;
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(fs.readFileSync(file));
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    await use(`http://127.0.0.1:${server.address().port}`);
    server.closeAllConnections(); // keep-alive sockets would otherwise hold close() open
    await new Promise((resolve) => server.close(resolve));
  },

  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      args: [`--disable-extensions-except=${EXTENSION}`, `--load-extension=${EXTENSION}`]
    });
    await use(context);
    await context.close();
  },

  serviceWorker: async ({ context }, use) => {
    let [worker] = context.serviceWorkers();
    if (!worker) worker = await context.waitForEvent('serviceworker');
    await use(worker);
  },

  /** Sends a message to SUGAM's content script in the test-page tab and returns the reply. */
  sugam: async ({ serviceWorker }, use) => {
    await use((message) =>
      serviceWorker.evaluate(async (msg) => {
        const [tab] = await chrome.tabs.query({ url: 'http://127.0.0.1/*' });
        return new Promise((resolve) =>
          chrome.tabs.sendMessage(tab.id, msg, (reply) => resolve(reply ?? chrome.runtime.lastError?.message))
        );
      }, message)
    );
  },

  /**
   * Merges `patch` into SUGAM's saved settings. Waits for the defaults written on install first,
   * otherwise they can land after the patch and overwrite it.
   */
  setSettings: async ({ serviceWorker }, use) => {
    await use(async (patch) => {
      await expect
        .poll(() =>
          serviceWorker.evaluate(async () => !!(await chrome.storage.sync.get('sugamSettings')).sugamSettings)
        )
        .toBe(true);
      await serviceWorker.evaluate(async (p) => {
        const { sugamSettings } = await chrome.storage.sync.get('sugamSettings');
        await chrome.storage.sync.set({ sugamSettings: { ...sugamSettings, ...p } });
      }, patch);
    });
  },

  /** Everything SUGAM has stored, as one JSON string (sync + local). */
  storedData: async ({ serviceWorker }, use) => {
    await use(() =>
      serviceWorker.evaluate(async () =>
        JSON.stringify({ sync: await chrome.storage.sync.get(null), local: await chrome.storage.local.get(null) })
      )
    );
  }
});

/** Waits until the content script answers messages on the current page. */
async function waitForSugam(sugam) {
  await expect.poll(async () => typeof (await sugam({ action: 'PING' })), { timeout: 10000 }).toBe('object');
}

module.exports = { test, expect, waitForSugam };
