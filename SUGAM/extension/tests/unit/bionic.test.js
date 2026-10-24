const test = require('node:test');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { SugamBionic } = require('../../shared/bionic.js');

function makeDoc(bodyHtml) {
  return new JSDOM(`<body>${bodyHtml}</body>`).window.document;
}

test('bolds the start of each word and restores the exact original DOM', () => {
  const doc = makeDoc('<article><p id="p">Reading <a href="/x">linked words</a> today</p></article>');
  const before = doc.body.innerHTML;

  const records = SugamBionic.apply(doc.body, 0.5);
  assert.ok(doc.querySelectorAll('b.sugam-bionic-bold').length >= 3);
  assert.equal(doc.querySelector('p').textContent, 'Reading linked words today');
  assert.ok(doc.querySelector('p a[href="/x"] b'), 'link is kept and its words are bolded');

  SugamBionic.restore(records);
  assert.equal(doc.body.innerHTML, before);
});

test('page text that looks like HTML is never turned into elements', () => {
  const doc = makeDoc('<p>&lt;img src=x onerror=alert(1)&gt; hello</p>');
  const records = SugamBionic.apply(doc.body, 0.45);
  assert.equal(doc.querySelector('img'), null);
  assert.equal(doc.querySelector('p').textContent, '<img src=x onerror=alert(1)> hello');
  SugamBionic.restore(records);
});

test('Hindi and Odia paragraphs, and code/nav content, are left alone', () => {
  const html =
    '<p id="hi">नमस्ते दुनिया</p><p id="or">ଓଡ଼ିଆ ଭାଷା</p><nav><p id="nav">menu text</p></nav><pre><p id="pre">code here</p></pre>';
  const doc = makeDoc(html);
  const records = SugamBionic.apply(doc.body, 0.5);
  assert.equal(records.length, 0);
  assert.equal(doc.body.innerHTML, html);
});

test('applying twice then restoring still returns the original', () => {
  const doc = makeDoc('<p>One more sentence here</p>');
  const before = doc.body.innerHTML;
  const first = SugamBionic.apply(doc.body, 0.45);
  const second = SugamBionic.apply(doc.body, 0.45);
  assert.equal(second.length, 0, 'already formatted text is skipped');
  SugamBionic.restore(first);
  assert.equal(doc.body.innerHTML, before);
});

test('ratioFor maps strength names', () => {
  assert.equal(SugamBionic.ratioFor('light'), 0.3);
  assert.equal(SugamBionic.ratioFor('medium'), 0.45);
  assert.equal(SugamBionic.ratioFor('strong'), 0.6);
});
