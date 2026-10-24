const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { SugamDom } = require('../../shared/dom-safe.js');

test('escapeHtml neutralises markup and quotes', () => {
  assert.equal(
    SugamDom.escapeHtml(`<img src=x onerror="alert('1')">&`),
    '&lt;img src=x onerror=&quot;alert(&#39;1&#39;)&quot;&gt;&amp;'
  );
  assert.equal(SugamDom.escapeHtml(null), '');
  assert.equal(SugamDom.escapeHtml(42), '42');
});

test('safeHttpUrl only allows http(s)', () => {
  assert.equal(SugamDom.safeHttpUrl('https://example.com/a?b=1'), 'https://example.com/a?b=1');
  assert.equal(SugamDom.safeHttpUrl('http://example.com'), 'http://example.com/');
  assert.equal(SugamDom.safeHttpUrl('javascript:alert(1)'), '');
  assert.equal(SugamDom.safeHttpUrl('data:text/html,<script>1</script>'), '');
  assert.equal(SugamDom.safeHttpUrl('chrome://settings'), '');
  assert.equal(SugamDom.safeHttpUrl('not a url'), '');
  assert.equal(SugamDom.safeHttpUrl(undefined), '');
});

test('parseEmphasis splits bold amounts', () => {
  assert.deepEqual(SugamDom.parseEmphasis('Pay **₹500** in **5 days**.'), [
    { text: 'Pay ', bold: false },
    { text: '₹500', bold: true },
    { text: ' in ', bold: false },
    { text: '5 days', bold: true },
    { text: '.', bold: false }
  ]);
  assert.deepEqual(SugamDom.parseEmphasis('no emphasis'), [{ text: 'no emphasis', bold: false }]);
  assert.deepEqual(SugamDom.parseEmphasis(''), []);
});

test('appendEmphasis keeps markup in text inert', () => {
  const { document } = new JSDOM('<div id="t"></div>').window;
  const target = document.getElementById('t');
  SugamDom.appendEmphasis(target, '<img src=x onerror=alert(1)> costs **₹<b>5</b>**');
  assert.equal(target.querySelector('img'), null);
  assert.equal(target.querySelectorAll('b').length, 0);
  assert.equal(target.querySelectorAll('strong').length, 1);
  assert.equal(target.textContent, '<img src=x onerror=alert(1)> costs ₹<b>5</b>');
});
