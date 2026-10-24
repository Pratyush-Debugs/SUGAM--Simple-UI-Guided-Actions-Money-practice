const test = require('node:test');
const assert = require('node:assert/strict');
const { SugamAI } = require('../../shared/gemini.js');

const KEY = 'AIzaSy-test-key-1234567890';
const LONG_TEXT = 'The scheme gives ₹500 every month to eligible people. Apply before October 24. '.repeat(3);

function mockFetch(handler) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return handler(url, init);
  };
  return calls;
}

const okJson = (text) => ({
  ok: true,
  status: 200,
  json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] })
});

test('the API key is sent in a header, never in the URL', async () => {
  const calls = mockFetch(() => okJson('["Pay **₹500** soon."]'));
  const result = await SugamAI.summarise(LONG_TEXT, { apiKey: KEY, cloudAllowed: true });

  assert.equal(result.source, 'gemini');
  assert.deepEqual(result.sentences, ['Pay **₹500** soon.']);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url.includes(KEY), false);
  assert.equal(calls[0].url.includes('key='), false);
  assert.equal(calls[0].init.headers['x-goog-api-key'], KEY);
  assert.ok(calls[0].init.signal, 'request has an abort signal for the timeout');
});

test('sensitive pages never reach the network', async () => {
  const calls = mockFetch(() => okJson('[]'));
  await assert.rejects(
    () => SugamAI.summarise(LONG_TEXT, { apiKey: KEY, isSensitive: true, cloudAllowed: true }),
    /sensitive/i
  );
  await assert.rejects(() => SugamAI.translate('hello', 'hi', KEY, true, true), /sensitive/i);
  assert.equal(calls.length, 0);
});

test('falls back to the on-device summary when Gemini fails or returns junk', async () => {
  for (const handler of [
    () => ({ ok: false, status: 500, text: async () => 'boom' }),
    () => okJson('{"not":"an array"}'),
    () => okJson('[1, 2, null]'),
    () => okJson('not json at all')
  ]) {
    mockFetch(handler);
    const result = await SugamAI.summarise(LONG_TEXT, { apiKey: KEY, cloudAllowed: true });
    assert.equal(result.source, 'local');
    assert.ok(result.sentences.length > 0);
  }
});

test('errors do not leak the response body or key', async () => {
  mockFetch(() => ({ ok: false, status: 403, text: async () => `denied for ${KEY}` }));
  await assert.rejects(
    () => SugamAI._generate('hi', KEY, {}),
    (err) => err.message === 'Gemini API error (403)' && !err.message.includes(KEY)
  );
});

test('no key means no network call', async () => {
  const calls = mockFetch(() => okJson('[]'));
  const result = await SugamAI.summarise(LONG_TEXT, { apiKey: '' });
  assert.equal(result.source, 'local');
  assert.equal(calls.length, 0);
});

test('translate returns the original text when Gemini fails', async () => {
  mockFetch(() => ({ ok: false, status: 500, text: async () => '' }));
  assert.equal(await SugamAI.translate('Hello', 'hi', KEY, false, true), 'Hello');
});

test('without consent nothing is sent, even with a key', async () => {
  const calls = mockFetch(() => okJson('["Sent!"]'));
  const result = await SugamAI.summarise(LONG_TEXT, { apiKey: KEY });
  assert.equal(result.source, 'local');
  assert.equal(await SugamAI.translate('Hello', 'hi', KEY), 'Hello');
  assert.equal(await SugamAI.translate('Hello', 'hi', KEY, false, 'yes'), 'Hello', 'only the boolean true counts');
  assert.equal(calls.length, 0);
});
