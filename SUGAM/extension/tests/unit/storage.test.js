const test = require('node:test');
const assert = require('node:assert/strict');
const { installFakeChrome } = require('./helpers.js');
const { SugamStorage, SUGAM_DEFAULT_SETTINGS, sugamDeepMerge } = require('../../shared/storage.js');

test('API key is stored locally and never in synced settings', async () => {
  const fake = installFakeChrome();
  await SugamStorage.setApiKey('AIzaSy-test-key-1234567890');

  assert.equal(JSON.stringify(fake.storage.sync.data).includes('AIzaSy-test-key'), false);
  assert.equal(fake.storage.local.data.sugamSecrets.geminiApiKey, 'AIzaSy-test-key-1234567890');
  assert.equal((await SugamStorage.getSettings()).summariser.geminiApiKey, 'AIzaSy-test-key-1234567890');
  assert.equal(await SugamStorage.getApiKey(), 'AIzaSy-test-key-1234567890');
});

test('saving settings from a caller that holds the key keeps it out of sync', async () => {
  const fake = installFakeChrome();
  const settings = await SugamStorage.getSettings();
  settings.summariser.geminiApiKey = '  AIzaSy-another-key-1234567  ';
  settings.language = 'hi';
  await SugamStorage.saveSettings(settings);

  assert.equal(fake.storage.sync.data.sugamSettings.language, 'hi');
  assert.equal('geminiApiKey' in fake.storage.sync.data.sugamSettings.summariser, false);
  assert.equal(await SugamStorage.getApiKey(), 'AIzaSy-another-key-1234567');
});

test('clearing the key removes it from local storage', async () => {
  const fake = installFakeChrome();
  await SugamStorage.setApiKey('AIzaSy-test-key-1234567890');
  await SugamStorage.setApiKey('');
  assert.equal('sugamSecrets' in fake.storage.local.data, false);
});

test('migrates an API key and plain PIN left by an older version', async () => {
  const fake = installFakeChrome();
  const legacy = JSON.parse(JSON.stringify(SUGAM_DEFAULT_SETTINGS));
  legacy.summariser.geminiApiKey = 'AIzaSy-legacy-key-1234567';
  legacy.caregiverLock = { enabled: true, pin: '4321' };
  fake.storage.sync.data.sugamSettings = legacy;

  const settings = await SugamStorage.getSettings();
  assert.equal(settings.summariser.geminiApiKey, 'AIzaSy-legacy-key-1234567');
  assert.equal(fake.storage.local.data.sugamSecrets.geminiApiKey, 'AIzaSy-legacy-key-1234567');

  const synced = JSON.stringify(fake.storage.sync.data);
  assert.equal(synced.includes('AIzaSy-legacy-key'), false);
  assert.equal(synced.includes('4321'), false);
  assert.equal(await SugamStorage.verifyCaregiverPin('4321'), true);
  assert.equal(await SugamStorage.verifyCaregiverPin('1234'), false);
});

test('caregiver PIN is hashed, verified, and validated', async () => {
  const fake = installFakeChrome();
  await SugamStorage.setCaregiverPin('2468');

  const lock = fake.storage.sync.data.sugamSettings.caregiverLock;
  assert.equal(lock.enabled, true);
  assert.ok(lock.pinHash && lock.pinSalt);
  assert.equal(JSON.stringify(fake.storage.sync.data).includes('2468'), false);
  assert.equal(await SugamStorage.verifyCaregiverPin('2468'), true);
  assert.equal(await SugamStorage.verifyCaregiverPin('2469'), false);
  assert.equal(await SugamStorage.verifyCaregiverPin('abcd'), false);
  await assert.rejects(() => SugamStorage.setCaregiverPin('12'), /4 digits/);

  // Same PIN, new salt -> different hash
  const firstHash = lock.pinHash;
  await SugamStorage.setCaregiverPin('2468');
  assert.notEqual(fake.storage.sync.data.sugamSettings.caregiverLock.pinHash, firstHash);

  await SugamStorage.clearCaregiverPin();
  assert.equal(await SugamStorage.verifyCaregiverPin('2468'), false);
});

test('applying a preset keeps the API key, consent and unrelated values', async () => {
  installFakeChrome();
  const settings = await SugamStorage.getSettings();
  settings.summariser.geminiApiKey = 'AIzaSy-test-key-1234567890';
  settings.summariser.cloudConsent = 'yes';
  await SugamStorage.saveSettings(settings);

  const updated = await SugamStorage.applyPreset('easyread');
  assert.equal(updated.preset, 'easyread');
  assert.equal(updated.summariser.enabled, true);
  assert.equal(updated.summariser.cloudConsent, 'yes');
  assert.equal(updated.summariser.geminiApiKey, 'AIzaSy-test-key-1234567890');

  // The memory preset names only some visualComfort keys; the rest must survive.
  const memory = await SugamStorage.applyPreset('memory');
  assert.equal(memory.visualComfort.letterSpacing, updated.visualComfort.letterSpacing);
  assert.equal(memory.visualComfort.textSize, 115);
});

test('deep merge replaces arrays and merges objects without mutating inputs', () => {
  const base = { a: { b: 1, c: [1, 2] }, d: 1 };
  const out = sugamDeepMerge(base, { a: { c: [3] } });
  assert.deepEqual(out, { a: { b: 1, c: [3] }, d: 1 });
  assert.deepEqual(base, { a: { b: 1, c: [1, 2] }, d: 1 });
});
