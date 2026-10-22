const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));

test('every file the manifest points to exists', () => {
  const files = [
    manifest.action.default_popup,
    manifest.side_panel.default_path,
    manifest.background.service_worker,
    ...Object.values(manifest.icons),
    ...manifest.content_scripts.flatMap((cs) => [...cs.js, ...cs.css])
  ];
  for (const file of files) assert.ok(fs.existsSync(path.join(ROOT, file)), `${file} is missing`);
});

test('content scripts load helpers before content.js', () => {
  const js = manifest.content_scripts[0].js;
  assert.ok(js.indexOf('shared/dom-safe.js') < js.indexOf('content/content.js'));
  assert.ok(js.indexOf('shared/bionic.js') < js.indexOf('content/content.js'));
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

test('popup fallback injection uses the same files as the manifest', () => {
  const popup = fs.readFileSync(path.join(ROOT, 'popup/popup.js'), 'utf8');
  for (const file of manifest.content_scripts[0].js) {
    assert.ok(popup.includes(`'${file}'`), `popup.js fallback injection must include ${file}`);
  }
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
