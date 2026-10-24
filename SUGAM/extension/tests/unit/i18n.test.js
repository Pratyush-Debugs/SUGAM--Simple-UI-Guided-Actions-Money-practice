const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const { SugamI18n, SUGAM_TRANSLATIONS } = require('../../shared/i18n.js');

const ROOT = path.resolve(__dirname, '../..');
const LANGS = ['en', 'hi', 'or'];
const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

test('English, Hindi and Odia have exactly the same keys', () => {
  const en = Object.keys(SUGAM_TRANSLATIONS.en).sort();
  for (const lang of LANGS) assert.deepEqual(Object.keys(SUGAM_TRANSLATIONS[lang]).sort(), en, lang);
});

test('every translation is non-empty and keeps the same {placeholders}', () => {
  for (const [key, english] of Object.entries(SUGAM_TRANSLATIONS.en)) {
    for (const lang of LANGS) {
      const text = SUGAM_TRANSLATIONS[lang][key];
      assert.ok(typeof text === 'string' && text.trim(), `${lang}.${key} is empty`);
      assert.deepEqual(placeholders(text), placeholders(english), `${lang}.${key} placeholders differ`);
    }
  }
});

test('every data-i18n key used in an extension page exists', () => {
  const pages = ['popup/popup.html', 'sidepanel/sidepanel.html', 'sandbox/upi-practice.html'];
  for (const page of pages) {
    const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
    for (const [, key] of html.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)) {
      assert.ok(key in SUGAM_TRANSLATIONS.en, `${page} uses unknown key "${key}"`);
    }
  }
});

test('translatePage fills text and attributes in the chosen language', () => {
  const { document } = new JSDOM(
    '<html><body><h2 data-i18n="spTitle">x</h2><div data-i18n-aria-label="spTabsLabel"></div></body></html>'
  ).window;
  SugamI18n.setLanguage('or');
  SugamI18n.translatePage(document);
  assert.equal(document.querySelector('h2').textContent, SUGAM_TRANSLATIONS.or.spTitle);
  assert.equal(document.querySelector('div').getAttribute('aria-label'), SUGAM_TRANSLATIONS.or.spTabsLabel);
  assert.equal(document.documentElement.lang, 'or');
  SugamI18n.setLanguage('en');
});

test('get fills placeholders and falls back to English, then to the key', () => {
  SugamI18n.setLanguage('hi');
  assert.equal(SugamI18n.get('spListenCard', { n: 2 }), 'कार्ड 2 सुनें');
  assert.equal(SugamI18n.get('no-such-key'), 'no-such-key');
  SugamI18n.setLanguage('xx'); // unknown language is ignored
  assert.equal(SugamI18n.currentLang, 'hi');
  SugamI18n.setLanguage('en');
});
