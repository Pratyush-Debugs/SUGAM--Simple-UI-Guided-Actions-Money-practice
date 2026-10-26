const { test, expect, waitForSugam } = require('./fixtures');

const PASSWORD = 'Secret#Pass-9182';
const OTP = '482913';

// Answers that pass the wizard's friendly validation, keyed by field name.
const ANSWERS = {
  fullName: 'Rahul Sharma',
  email: 'rahul@example.com',
  phone: '9876543210',
  address: '12 Temple Road',
  city: 'Bhubaneswar',
  pincode: '751001',
  comments: 'Large text please'
};

test('Form Wizard fills the form but never submits it or touches private fields', async ({
  page,
  server,
  sugam,
  storedData
}) => {
  const submits = [];
  page.on('dialog', (dialog) => {
    submits.push(dialog.message());
    dialog.dismiss();
  });

  await page.goto(`${server}/form-page.html`);
  await waitForSugam(sugam);
  await page.evaluate(() => {
    window.__submitCount = 0;
    window.__samePage = true; // disappears if anything navigates the page (e.g. form.submit())
    document.addEventListener('submit', () => window.__submitCount++, true);
  });

  // The user types their private details into the site's own boxes. With these filled the form is
  // fully valid, so a submit by SUGAM would not be blocked by the browser's own validation.
  await page.locator('#accountPassword').fill(PASSWORD);
  await page.locator('#otpCode').fill(OTP);

  await sugam({ action: 'TOGGLE_MASTER_SWITCH', value: true });
  await sugam({ action: 'TRIGGER_FORM_WIZARD' });
  await page.locator('#wz-act-start').click();

  // The wizard asks one question per form field, in page order.
  const fieldNames = await page.evaluate(() =>
    [...document.querySelectorAll('#scholarship-form input, #scholarship-form textarea, #scholarship-form select')].map(
      (el) => el.name
    )
  );

  // Walk every question. Private fields show a notice and no input box.
  for (const name of fieldNames) {
    const field = page.locator('#sugam-curr-field');

    if (await field.count()) {
      const tag = await field.evaluate((el) => el.tagName.toLowerCase());
      if (tag === 'select') {
        await field.selectOption({ index: 1 });
      } else {
        await field.fill(ANSWERS[name]);
      }
    } else {
      expect(['password', 'otp']).toContain(name);
      await expect(page.getByText('Private Password or PIN')).toBeVisible();
    }
    await page.locator('#wz-act-next').click();
  }

  // The review screen never shows private values.
  await expect(page.getByRole('heading', { name: 'Check your answers' })).toBeVisible();
  await page.locator('#wz-act-fill').click();

  // Answers landed in the real inputs; SUGAM left the private inputs exactly as the user typed them.
  await expect(page.locator('#fullName')).toHaveValue(ANSWERS.fullName);
  await expect(page.locator('#pincode')).toHaveValue(ANSWERS.pincode);
  await expect(page.locator('#accountPassword')).toHaveValue(PASSWORD);
  await expect(page.locator('#otpCode')).toHaveValue(OTP);
  await page.waitForTimeout(1000);

  // SUGAM never submitted the form (no submit event, no alert, no navigation)...
  expect(await page.evaluate(() => window.__samePage)).toBe(true);
  expect(await page.evaluate(() => window.__submitCount)).toBe(0);
  expect(submits).toEqual([]);

  // ...and never stored the password or OTP anywhere.
  const stored = await storedData();
  expect(stored).not.toContain(PASSWORD);
  expect(stored).not.toContain(OTP);
});

test('page labels that contain HTML are shown as text, not markup', async ({ page, server, sugam }) => {
  await page.goto(`${server}/form-page.html`);
  await waitForSugam(sugam);
  await page.evaluate(() => {
    document.querySelector('label[for="fullName"]').textContent = '<img src=x onerror="window.__pwned=1">Name';
  });

  await sugam({ action: 'TOGGLE_MASTER_SWITCH', value: true });
  await sugam({ action: 'TRIGGER_FORM_WIZARD' });
  await page.locator('#wz-act-start').click();

  await expect(page.locator('.sugam-wz-label').first()).toContainText('<img src=x');
  expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
});
