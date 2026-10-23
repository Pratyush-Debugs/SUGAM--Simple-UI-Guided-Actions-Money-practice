/**
 * Playwright fixtures: a Chromium context with SUGAM loaded, a local server for
 * the sample pages in tests/, and helpers to talk to the content script.
 */
const { test: base, chromium, expect } = require('@playwright/test');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const os = require('node:os');

const EXTENSION = path.resolve(__dirname, '../..');

/**
 * SUGAM only runs automatically on sites the user has granted. Tests use a copy of the extension
 * that is granted the local test server, which exercises the same path as "Use SUGAM on every
 * website" (SugamInjector.syncRegistration) without needing a click on Chrome's permission prompt.
 */
function grantedCopy() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sugam-ext-'));
  fs.cpSync(EXTENSION, dir, { recursive: true, filter: (src) => !src.includes(`${path.sep}tests${path.sep}`) });
  const manifestPath = path.join(dir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.host_permissions = [...manifest.host_permissions, 'http://127.0.0.1/*'];
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return dir;
}
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

  // Set to false (test.use({ grantTestSite: false })) to load SUGAM exactly as shipped, with no site access.
  grantTestSite: [true, { option: true }],

  context: async ({ grantTestSite }, use) => {
    const extension = grantTestSite ? grantedCopy() : EXTENSION;
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`]
    });
    await use(context);
    await context.close();
    if (extension !== EXTENSION) fs.rmSync(extension, { recursive: true, force: true });
  },

  serviceWorker: async ({ context, grantTestSite }, use) => {
    let [worker] = context.serviceWorkers();
    if (!worker) worker = await context.waitForEvent('serviceworker');
    if (grantTestSite) {
      // On first install SUGAM registers itself for granted sites; wait so the first page load gets it.
      await expect
        .poll(() => worker.evaluate(async () => (await chrome.scripting.getRegisteredContentScripts()).length))
        .toBe(1);
    }
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
