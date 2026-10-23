const { test, expect } = require('./fixtures');
const { SUGAM_TRANSLATIONS } = require('../../shared/i18n.js');

for (const lang of ['hi', 'or']) {
  test(`side panel follows the chosen language (${lang})`, async ({ context, serviceWorker }) => {
    await serviceWorker.evaluate(async (language) => {
      const { sugamSettings = {} } = await chrome.storage.sync.get('sugamSettings');
      await chrome.storage.sync.set({ sugamSettings: { ...sugamSettings, language } });
    }, lang);

    const extensionId = new URL(serviceWorker.url()).host;
    const panel = await context.newPage();
    await panel.goto(`chrome-extension://${extensionId}/sidepanel/sidepanel.html`);

    const t = SUGAM_TRANSLATIONS[lang];
    await expect(panel.locator('h2')).toHaveText(t.spTitle);
    await expect(panel.locator('#btn-run-translate')).toHaveText(t.spTranslateButton);
    await expect(panel.locator('#txt-sp-disclaimer')).toHaveText(t.disclaimerComputer);
    expect(await panel.evaluate(() => document.documentElement.lang)).toBe(lang);
  });
}
