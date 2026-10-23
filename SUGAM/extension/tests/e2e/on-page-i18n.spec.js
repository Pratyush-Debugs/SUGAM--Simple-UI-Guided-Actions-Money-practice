const { test, expect, waitForSugam } = require('./fixtures');
const { SUGAM_TRANSLATIONS } = require('../../shared/i18n.js');

const stripTags = (html) => html.replace(/<[^>]+>/g, '');

test('scam warning appears in Odia with the 1930 helpline', async ({ page, server, sugam, setSettings }) => {
  const t = SUGAM_TRANSLATIONS.or;
  await setSettings({ language: 'or', masterSwitch: true, scamGuard: { enabled: true } });
  await page.goto(`${server}/scam-page.html`);
  await waitForSugam(sugam);

  const alert = page.locator('.sugam-scam-alert');
  await expect(alert).toContainText(t.scamTitle);
  await expect(alert).toContainText(t.scamBody);
  await expect(alert).toContainText('1930');
  await alert.getByRole('button', { name: t.scamDismiss }).click();
  await expect(alert).toHaveCount(0);
});

test('calm screen appears in Hindi', async ({ page, server, sugam, setSettings }) => {
  const t = SUGAM_TRANSLATIONS.hi;
  await setSettings({ language: 'hi' });
  await page.goto(`${server}/sample-article.html`);
  await waitForSugam(sugam);

  await sugam({ action: 'TRIGGER_CALM_MOMENT' });
  await expect(page.locator('.sugam-calm-title')).toHaveText(t.calmTitle);
  await expect(page.getByRole('link', { name: new RegExp(t.cyberHelpline) })).toHaveAttribute('href', 'tel:1930');
  await page.locator('#sugam-resume-btn').click();
});

test('Form Wizard speaks Hindi, including the privacy and never-submit promises', async ({
  page,
  server,
  sugam,
  setSettings
}) => {
  const t = SUGAM_TRANSLATIONS.hi;
  await setSettings({ language: 'hi' });
  await page.goto(`${server}/form-page.html`);
  await waitForSugam(sugam);

  await sugam({ action: 'TOGGLE_MASTER_SWITCH', value: true });
  await sugam({ action: 'TRIGGER_FORM_WIZARD' });
  await expect(page.getByRole('heading', { name: t.wzWelcome })).toBeVisible();
  await expect(page.getByText(stripTags(t.wzPromise))).toBeVisible();
  await page.locator('#wz-act-start').click();

  // Leaving a required question empty gives the friendly message in Hindi.
  await page.locator('#wz-act-next').click();
  await expect(page.locator('#sugam-val-hint')).toHaveText(t.wzRequired);

  // Skip ahead to the password question and check the privacy notice.
  const answers = ['Rahul Sharma', 'rahul@example.com', '9876543210', '12 Temple Road', 'Bhubaneswar'];
  for (const answer of answers) {
    await page.locator('#sugam-curr-field').fill(answer);
    await page.locator('#wz-act-next').click();
  }
  await page.locator('#sugam-curr-field').selectOption({ index: 1 });
  await page.locator('#wz-act-next').click();
  await page.locator('#sugam-curr-field').fill('751001');
  await page.locator('#wz-act-next').click();
  await page.locator('#wz-act-next').click(); // comments are optional
  await expect(page.getByText(t.wzPrivateTitle)).toBeVisible();
  await expect(page.getByText(t.wzPrivateBody)).toBeVisible();
});
