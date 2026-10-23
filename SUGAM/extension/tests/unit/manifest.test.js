const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
const { SUGAM_CONTENT_SCRIPTS, SUGAM_CONTENT_CSS, SUGAM_GEMINI_ORIGIN } = require('../../shared/injector.js');

test('every file the manifest and injector point to exists', () => {
  const files = [
    manifest.action.default_popup,
    manifest.side_panel.default_path,
    manifest.background.service_worker,
    ...Object.values(manifest.icons),
    ...SUGAM_CONTENT_SCRIPTS,
    ...SUGAM_CONTENT_CSS
  ];
  for (const file of files) assert.ok(fs.existsSync(path.join(ROOT, file)), `${file} is missing`);
});

test('SUGAM has no standing access to websites', () => {
  assert.equal(manifest.content_scripts, undefined, 'content scripts are injected on demand, not declared');
  assert.deepEqual(manifest.host_permissions, [SUGAM_GEMINI_ORIGIN], 'only the Gemini API host is always allowed');
  assert.deepEqual(manifest.optional_host_permissions, ['<all_urls>'], 'every-website access is opt-in');
  assert.ok(manifest.permissions.includes('activeTab'));
  assert.ok(manifest.permissions.includes('scripting'));
});

test('content scripts load helpers and every feature first, and content.js last', () => {
  assert.equal(SUGAM_CONTENT_SCRIPTS.at(-1), 'content/content.js');
  for (const file of [
    'shared/dom-safe.js',
    'shared/sensitive-detector.js',
    'shared/i18n.js',
    'content/page-safety.js'
  ]) {
    assert.ok(SUGAM_CONTENT_SCRIPTS.includes(file), file);
  }
  const features = fs.readdirSync(path.join(ROOT, 'content/features')).map((f) => `content/features/${f}`);
  assert.ok(features.length >= 7);
  for (const feature of features) assert.ok(SUGAM_CONTENT_SCRIPTS.includes(feature), `${feature} must be injected`);
});

test('popup, side panel and service worker all inject through the shared injector', () => {
  for (const file of ['popup/popup.js', 'sidepanel/sidepanel.js', 'background/service-worker.js']) {
    const code = fs.readFileSync(path.join(ROOT, file), 'utf8');
    assert.ok(code.includes('SugamInjector.'), `${file} must use SugamInjector`);
    assert.equal(code.includes('chrome.tabs.sendMessage'), false, `${file} must not message tabs directly`);
  }
});

test('only the main-world timer script and bundled fonts are web accessible', () => {
  const resources = manifest.web_accessible_resources.flatMap((entry) => entry.resources);
  assert.deepEqual(
    resources.filter((r) => !r.startsWith('fonts/')),
    ['content/timer-pause-mainworld.js']
  );
});

test('permissions that the code does not use are not requested', () => {
  assert.equal(manifest.permissions.includes('tts'), false);
});

test('there is only one list of sensitive domains', () => {
  const content = fs.readFileSync(path.join(ROOT, 'content/content.js'), 'utf8');
  assert.equal(content.includes('SENSITIVE_DOMAINS'), false);
});

test('no code builds HTML from page, storage or AI text without escaping (sidepanel)', () => {
  const sidepanel = fs.readFileSync(path.join(ROOT, 'sidepanel/sidepanel.js'), 'utf8');
  const uses = sidepanel.split('\n').filter((line) => line.includes('innerHTML'));
  assert.deepEqual(
    uses.map((l) => l.trim()),
    ['pic.innerHTML = matchedPic.svg;']
  );
});

test('bundled font files exist, are web accessible, and are used by content.css', () => {
  const css = fs.readFileSync(path.join(ROOT, 'content/content.css'), 'utf8');
  const urls = [...css.matchAll(/__MSG_@@extension_id__\/(fonts\/[^')]+)/g)].map((m) => m[1]);
  assert.ok(urls.length >= 10, 'expected regular and bold faces for five families');
  for (const url of urls) assert.ok(fs.existsSync(path.join(ROOT, url)), `${url} is missing`);
  const resources = manifest.web_accessible_resources.flatMap((entry) => entry.resources);
  assert.ok(resources.includes('fonts/*.woff2'));
  assert.ok(fs.existsSync(path.join(ROOT, 'fonts/LICENSES.txt')), 'OFL licence text must ship with the fonts');
});

test('bundled font families are prefixed so they cannot restyle sites that use the same font name', () => {
  const css = fs.readFileSync(path.join(ROOT, 'content/content.css'), 'utf8');
  const families = [...css.matchAll(/@font-face\s*{\s*font-family:\s*'([^']+)'/g)].map((m) => m[1]);
  assert.ok(families.length >= 10);
  for (const family of families) assert.ok(family.startsWith('SUGAM '), `${family} must start with "SUGAM "`);
});
