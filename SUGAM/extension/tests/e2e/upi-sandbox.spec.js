const { test, expect } = require('./fixtures');
const { SUGAM_TRANSLATIONS } = require('../../shared/i18n.js');

async function openSandbox(context, serviceWorker, setSettings, language) {
  await setSettings({ language });
  const page = await context.newPage();
  page.on('dialog', (dialog) => dialog.dismiss());
  await page.goto(`chrome-extension://${new URL(serviceWorker.url()).host}/sandbox/upi-practice.html`);
  return page;
}

for (const lang of ['en', 'or']) {
  test(`practice payment works end to end (${lang})`, async ({ context, serviceWorker, setSettings }) => {
    const t = SUGAM_TRANSLATIONS[lang];
    const page = await openSandbox(context, serviceWorker, setSettings, lang);

    await expect(page.locator('h1')).toHaveText(t.upiTitle);
    await expect(page.locator('#phone-balance')).toHaveText(t.upiPlayBalance.replace('{amount}', '2,500'));

    await page.locator('.contact-item[data-contact="Mom"]').click();
    await page.locator('#inp-amount').fill('150');
    if (lang === 'en') await expect(page.locator('#txt-amount-words')).toHaveText('One hundred fifty rupees');
    else await expect(page.locator('#txt-amount-words')).toHaveText(t.upiRupees.replace('{amount}', '150'));

    await page.locator('#btn-proceed-to-review').click();
    await expect(page.locator('#rev-amount')).toHaveText('₹150');
    await page.locator('#btn-proceed-to-pin').click();

    // A wrong PIN is refused kindly; the practice PIN works.
    for (const key of ['9', '9', '9', '9']) await page.locator(`.key-btn[data-key="${key}"]`).click();
    await page.locator('#key-submit').click();
    await expect(page.locator('#txt-pin-error')).toBeVisible();
    await page.locator('#key-clear').click();
    for (const key of ['1', '2', '3', '4']) await page.locator(`.key-btn[data-key="${key}"]`).click();
    await page.locator('#key-submit').click();

    await expect(page.locator('.receipt-status')).toHaveText(t.upiPaymentSuccessful);
    await expect(page.locator('#phone-balance')).toHaveText(t.upiPlayBalance.replace('{amount}', '2,350'));
  });
}

test('scam spotter teaches the PIN rule in Hindi', async ({ context, serviceWorker, setSettings }) => {
  const t = SUGAM_TRANSLATIONS.hi;
  const page = await openSandbox(context, serviceWorker, setSettings, 'hi');

  await page.locator('.activity-btn[data-flow="scam-refund"]').click();
  await expect(page.locator('#scam-box .step-title')).toHaveText(t.upiScam1Title);
  await page.locator('#scam-opt-correct-1').click();
  await expect(page.locator('#coach-text')).toContainText('शाबाश!');
  await expect(page.locator('#coach-text strong').first()).toHaveText('शाबाश!');
});
