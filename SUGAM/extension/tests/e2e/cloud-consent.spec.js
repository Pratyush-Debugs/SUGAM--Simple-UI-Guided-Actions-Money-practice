const { test, expect, waitForSugam } = require('./fixtures');
const { SUGAM_TRANSLATIONS: T } = require('../../shared/i18n.js');

const t = T.en;
const GEMINI = 'https://generativelanguage.googleapis.com/**';

/**
 * Opens the side panel as a tab, pointed at the article tab. (A real side panel sits beside the
 * page; as a tab it would otherwise "see" itself as the active page.)
 */
async function openPanelFor(context, serviceWorker, articleUrl) {
  const tab = await serviceWorker.evaluate(
    async (url) => (await chrome.tabs.query({})).find((x) => x.url === url),
    articleUrl
  );
  const panel = await context.newPage();
  await panel.addInitScript((target) => {
    chrome.tabs.query = async () => [target];
  }, tab);
  await panel.goto(`chrome-extension://${new URL(serviceWorker.url()).host}/sidepanel/sidepanel.html`);
  return panel;
}

for (const choice of ['no', 'yes']) {
  test(`with a Gemini key, SUGAM asks first and respects "${choice}"`, async ({
    context,
    page,
    server,
    sugam,
    serviceWorker,
    setSettings
  }) => {
    const geminiCalls = [];
    await context.route(GEMINI, (route) => {
      geminiCalls.push(route.request());
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ candidates: [{ content: { parts: [{ text: '["Apply before **October 24**."]' }] } }] })
      });
    });

    await serviceWorker.evaluate(() =>
      chrome.storage.local.set({ sugamSecrets: { geminiApiKey: 'AIzaSy-test-key-1234567890' } })
    );
    await setSettings({ language: 'en' });
    await page.goto(`${server}/sample-article.html`);
    await waitForSugam(sugam);

    const panel = await openPanelFor(context, serviceWorker, page.url());

    // Asked before anything is sent; "No" is focused as the safe default.
    await expect(panel.getByRole('heading', { name: t.cloudConsentTitle })).toBeVisible();
    await expect(panel.locator('#btn-cloud-no')).toBeFocused();
    expect(geminiCalls).toHaveLength(0);

    await panel.locator(choice === 'yes' ? '#btn-cloud-yes' : '#btn-cloud-no').click();

    if (choice === 'yes') {
      await expect(panel.locator('#sp-source-note')).toHaveText(t.spMadeByCloud);
      expect(geminiCalls).toHaveLength(1);
      expect(geminiCalls[0].url()).not.toContain('key=');
    } else {
      await expect(panel.locator('#sp-source-note')).toHaveText(t.spMadeOnDevice);
      expect(geminiCalls).toHaveLength(0);
    }

    // The choice is remembered: refreshing does not ask again.
    await panel.locator('#btn-refresh-summary').click();
    await expect(panel.locator('#sp-source-note')).toBeVisible();
    await expect(panel.getByRole('heading', { name: t.cloudConsentTitle })).toHaveCount(0);
    expect(geminiCalls).toHaveLength(choice === 'yes' ? 2 : 0);
  });
}
