const { test, expect, waitForSugam } = require('./fixtures');

// The page as the site rendered it, ignoring nothing: SUGAM promises zero residue.
const snapshot = () => document.documentElement.outerHTML;

const ALL_HELPERS = {
  masterSwitch: true,
  visualComfort: {
    enabled: true,
    textSize: 130,
    lineSpacing: 1.8,
    letterSpacing: 0.08,
    wordSpacing: 0.12,
    leftAlign: true,
    maxLineLength: 60,
    colorTheme: 'dark',
    pauseMedia: true,
    stopAnimations: true,
    hidePopups: true
  },
  dyslexiaFont: { enabled: true, fontFamily: 'OpenDyslexic', applySpacing: true },
  readingRuler: { enabled: true, height: 70, dimmingStrength: 0.45 },
  bionicRead: { enabled: true, strength: 'medium' },
  timerFreeze: { enabled: true, level: 1 },
  scamGuard: { enabled: true }
};

test('turning SUGAM off leaves the page exactly as the site rendered it', async ({ page, server, sugam }) => {
  await page.goto(`${server}/sample-article.html`);
  await waitForSugam(sugam);

  // Baseline: SUGAM is on by default, so switch it off (the choice is saved) and reload,
  // giving the page exactly as the site renders it with no SUGAM changes at all.
  await sugam({ action: 'TOGGLE_MASTER_SWITCH', value: false });
  await page.reload();
  await waitForSugam(sugam);
  const before = await page.evaluate(snapshot);
  expect(before).not.toContain('sugam');

  await sugam({ action: 'TOGGLE_MASTER_SWITCH', value: true });
  await sugam({ action: 'SETTINGS_UPDATED', settings: ALL_HELPERS });

  // The helpers really did change the page...
  await expect.poll(() => page.locator('b.sugam-bionic-bold').count()).toBeGreaterThan(10);
  expect(await page.evaluate(snapshot)).not.toBe(before);

  // ...and switching off removes every trace, including SUGAM's own shadow host.
  const reply = await sugam({ action: 'TOGGLE_MASTER_SWITCH', value: false });
  expect(reply.isMasterOn).toBe(false);
  await expect.poll(() => page.evaluate(() => !!document.querySelector('#sugam-root'))).toBe(false);
  expect(await page.evaluate(snapshot)).toBe(before);
});

test('Bionic Read keeps the page text identical and does not run on Hindi or Odia', async ({ page, server, sugam }) => {
  await page.goto(`${server}/sample-article.html`);
  await waitForSugam(sugam);
  const textBefore = await page.evaluate(() => document.body.innerText);

  await sugam({ action: 'TOGGLE_MASTER_SWITCH', value: true });
  await sugam({ action: 'SETTINGS_UPDATED', settings: { masterSwitch: true, bionicRead: { enabled: true } } });
  await expect.poll(() => page.locator('b.sugam-bionic-bold').count()).toBeGreaterThan(0);

  expect(await page.evaluate(() => document.body.innerText)).toBe(textBefore);
  const nonLatinBolded = await page.evaluate(
    () =>
      [...document.querySelectorAll('p')].filter(
        (p) => /[ऀ-ॿ଀-୿]/.test(p.textContent) && p.querySelector('.sugam-bionic-bold')
      ).length
  );
  expect(nonLatinBolded).toBe(0);
});
