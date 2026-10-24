const { test, expect } = require('./fixtures');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

// The landing page links straight to the UPI practice, so it must work as a plain web page too
// (no extension, no chrome.storage).
const EXTENSION = path.resolve(__dirname, '../..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };

test('UPI practice works as a plain web page, outside the extension', async ({ browser }) => {
  const server = http.createServer((req, res) => {
    const file = path.join(EXTENSION, path.normalize(decodeURIComponent(req.url.split('?')[0])));
    if (!file.startsWith(EXTENSION) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.statusCode = 404;
      return res.end();
    }
    res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));

  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => d.dismiss());
  await page.goto(`http://127.0.0.1:${server.address().port}/sandbox/upi-practice.html`);

  await page.locator('.contact-item[data-contact="Mom"]').click();
  await page.locator('#inp-amount').fill('100');
  await page.locator('#btn-proceed-to-review').click();
  await page.locator('#btn-proceed-to-pin').click();
  for (const key of ['1', '2', '3', '4']) await page.locator(`.key-btn[data-key="${key}"]`).click();
  await page.locator('#key-submit').click();
  await expect(page.locator('.receipt-status')).toHaveText('Payment Successful!');
  await expect(page.locator('#phone-balance')).toHaveText('Play Balance: ₹2,400');

  // The play balance is remembered on reload.
  await page.reload();
  await expect(page.locator('#phone-balance')).toHaveText('Play Balance: ₹2,400');
  expect(errors).toEqual([]);

  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
});
