const { test, expect } = require('./fixtures');

test.describe('as shipped, with no site access granted', () => {
  test.use({ grantTestSite: false });

  test('SUGAM does not run on websites until the user opens it there', async ({ page, server, serviceWorker }) => {
    await page.goto(`${server}/sample-article.html`);
    await page.waitForTimeout(1500);

    expect(await page.evaluate(() => !!document.querySelector('#sugam-root'))).toBe(false);
    const state = await serviceWorker.evaluate(async () => ({
      registered: await chrome.scripting.getRegisteredContentScripts(),
      origins: (await chrome.permissions.getAll()).origins,
      reachable: await chrome.tabs
        .query({ url: 'http://127.0.0.1/*' })
        .then(([tab]) => chrome.tabs.sendMessage(tab.id, { action: 'PING' }))
        .then(() => true)
        .catch(() => false)
    }));
    expect(state.registered).toEqual([]);
    expect(state.origins).toEqual(['https://generativelanguage.googleapis.com/*']);
    expect(state.reachable).toBe(false);
  });
});

test('once a site is granted, SUGAM runs there automatically', async ({ page, server, serviceWorker }) => {
  await page.goto(`${server}/sample-article.html`);
  await expect.poll(() => page.evaluate(() => !!document.querySelector('#sugam-root'))).toBe(true);
  const registered = await serviceWorker.evaluate(() => chrome.scripting.getRegisteredContentScripts());
  expect(registered.map((r) => r.matches)).toEqual([['http://127.0.0.1/*']]);

  // Bundled fonts still load when the CSS is injected this way.
  const fontLoaded = await page.evaluate(async () => {
    await document.fonts.load('16px "SUGAM Lexend"');
    return document.fonts.check('16px "SUGAM Lexend"');
  });
  expect(fontLoaded).toBe(true);
});
