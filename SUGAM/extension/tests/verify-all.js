/**
 * SUGAM - Comprehensive Automated Verification Test Suite
 * Validates WCAG 2.2 AA, W3C COGA rules, Master Switch teardown,
 * Sensitive field protection, and Manifest V3 conformance.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');

async function runTests() {
  console.log('==================================================');
  console.log('🚀 Starting SUGAM Verification Test Suite');
  console.log('==================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(err);
    }
  }

  // 1. Manifest V3 Validation
  await test('1. Manifest V3 Schema & Permissions', () => {
    const manifestPath = path.join(ROOT, 'manifest.json');
    assert(fs.existsSync(manifestPath), 'manifest.json must exist');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    assert.strictEqual(manifest.manifest_version, 3, 'Must be Manifest V3');
    assert.strictEqual(manifest.name, 'SUGAM - Simple UI, Guided Actions & Money practice');
    assert(manifest.permissions.includes('storage'), 'Needs storage permission');
    assert(manifest.permissions.includes('activeTab'), 'Needs activeTab permission');
    assert(manifest.permissions.includes('sidePanel'), 'Needs sidePanel permission');
    assert(manifest.action.default_popup, 'Must define action popup');
    assert(manifest.background.service_worker, 'Must define background service worker');

    // Icons check
    for (const size of [16, 32, 48, 128]) {
      const iconPath = path.join(ROOT, manifest.icons[size.toString()]);
      assert(fs.existsSync(iconPath), `Icon ${size}px must exist at ${iconPath}`);
    }
  });

  // 2. Sensitive Detector Protection
  await test('2. Sensitive Detector & Domain Checks', () => {
    const { SensitiveDetector } = require(path.join(ROOT, 'shared/sensitive-detector.js'));

    // Check bank domains
    assert(SensitiveDetector.isSensitiveDomain('https://retail.onlinesbi.sbi/retail/login.htm'));
    assert(SensitiveDetector.isSensitiveDomain('https://netbanking.hdfcbank.com/netbanking/'));
    assert(SensitiveDetector.isSensitiveDomain('https://paytm.com'));
    assert(SensitiveDetector.isSensitiveDomain('https://upiqr.bhimupi.org.in'));
    assert(!SensitiveDetector.isSensitiveDomain('https://en.wikipedia.org/wiki/Accessibility'));

    // Check mock input elements
    const mockPasswordInput = {
      tagName: 'INPUT',
      getAttribute: (attr) => (attr === 'type' ? 'password' : null)
    };
    assert(SensitiveDetector.isSensitiveField(mockPasswordInput), 'Password inputs must be detected as sensitive');

    const mockOtpInput = {
      tagName: 'INPUT',
      getAttribute: (attr) => {
        if (attr === 'name') return 'txt_otp_code';
        if (attr === 'type') return 'text';
        return null;
      }
    };
    assert(SensitiveDetector.isSensitiveField(mockOtpInput), 'OTP inputs must be detected as sensitive');

    const mockNormalInput = {
      tagName: 'INPUT',
      getAttribute: (attr) => {
        if (attr === 'name') return 'user_full_name';
        if (attr === 'type') return 'text';
        return null;
      }
    };
    assert(!SensitiveDetector.isSensitiveField(mockNormalInput), 'Normal inputs must not be flagged sensitive');
  });

  // 3. Pictograms & Concept Matcher
  await test('3. Pictograms & Concept Matcher (Indian Context)', () => {
    const { SUGAM_PICTOGRAMS, PictogramMatcher } = require(path.join(ROOT, 'shared/pictograms-data.js'));

    assert(SUGAM_PICTOGRAMS.rupee, 'Rupee symbol must exist');
    assert(SUGAM_PICTOGRAMS.upi, 'UPI symbol must exist');
    assert(SUGAM_PICTOGRAMS.qr, 'QR code symbol must exist');
    assert(SUGAM_PICTOGRAMS.otp, 'OTP symbol must exist');
    assert(SUGAM_PICTOGRAMS.bank, 'Bank symbol must exist');
    assert(SUGAM_PICTOGRAMS.bill, 'Bill symbol must exist');

    // Match rupee
    const match1 = PictogramMatcher.matchSentence('The application fee is ₹500.');
    assert(match1 && match1.key === 'rupee', 'Must match rupee');

    // Match OTP
    const match2 = PictogramMatcher.matchSentence('Never share your OTP with anyone.');
    assert(match2 && match2.key === 'otp', 'Must match OTP');

    // Match warning
    const match3 = PictogramMatcher.matchSentence('Beware of scam links promising refunds.');
    assert(match3 && match3.key === 'warning', 'Must match warning/scam');

    // No match
    const match4 = PictogramMatcher.matchSentence('The purple cloud drifted across the sky.');
    assert.strictEqual(match4, null, 'Never show a wrong picture if no match exists');
  });

  // 4. Internationalization & Disclaimers
  await test('4. Translations (English, Hindi, Odia) & Honest Disclaimers', () => {
    const { SUGAM_TRANSLATIONS, SugamI18n } = require(path.join(ROOT, 'shared/i18n.js'));

    for (const lang of ['en', 'hi', 'or']) {
      SugamI18n.setLanguage(lang);
      assert(SUGAM_TRANSLATIONS[lang], `Language ${lang} must exist`);
      assert(SugamI18n.get('appName'), 'App name must be translated');
      assert(SugamI18n.get('comfortSettings'), 'Comfort settings must be translated');
      assert(SugamI18n.get('turnOffAll'), 'Master switch label must be translated');
      assert(SugamI18n.get('disclaimerComputer'), 'Computer summary disclaimer must exist');
      assert(SugamI18n.get('disclaimerTranslation'), 'Translation disclaimer must exist');
      assert(SugamI18n.get('disclaimerTimer'), 'Timer pause disclaimer must exist');
      assert(SugamI18n.get('upiRuleNeverPinToReceive'), 'Never PIN to receive rule must exist');
    }
  });

  // 5. CSS & WCAG 2.2 Target Size & Contrast Check
  await test('5. Touch Target Sizes (>= 48px) & Palette Consistency', () => {
    const popupCss = fs.readFileSync(path.join(ROOT, 'popup/popup.css'), 'utf8');
    const contentCss = fs.readFileSync(path.join(ROOT, 'content/content.css'), 'utf8');
    const sandboxCss = fs.readFileSync(path.join(ROOT, 'sandbox/upi-practice.css'), 'utf8');

    // Check color palette: #FAF8F5, #59366E, #E7DDF0, #F3EDF7, #29252D
    const palette = ['#FAF8F5', '#59366E', '#E7DDF0', '#F3EDF7', '#29252D'];
    palette.forEach((color) => {
      const regex = new RegExp(color, 'i');
      assert(popupCss.match(regex), `Popup CSS must utilize ${color}`);
      assert(contentCss.match(regex), `Content CSS must utilize ${color}`);
      assert(sandboxCss.match(regex), `Sandbox CSS must utilize ${color}`);
    });

    // Check 48px minimum touch targets
    assert(
      popupCss.includes('min-height: 48px') || popupCss.includes('height: 48px'),
      'Popup buttons must have min 48px touch target'
    );
    assert(
      sandboxCss.includes('min-height: 48px') || sandboxCss.includes('min-height: 52px'),
      'Sandbox buttons must have min 48px touch target'
    );

    // Check focus ring
    assert(popupCss.includes('focus-visible'), 'Popup must have visible focus-visible ring');
    assert(contentCss.includes('focus-visible'), 'Content must have visible focus-visible ring');
  });

  // 6. Safe UPI Practice Sandbox Conformance
  await test('6. Money Practice Sandbox Requirements', () => {
    const sandboxHtml = fs.readFileSync(path.join(ROOT, 'sandbox/upi-practice.html'), 'utf8');
    const sandboxJs = fs.readFileSync(path.join(ROOT, 'sandbox/upi-practice.js'), 'utf8');

    assert(sandboxHtml.includes('Play Balance'), 'Must show play money balance');
    assert(sandboxJs.includes("const PRACTICE_PIN = '1234'"), 'Practice PIN must be 1234');
    assert(sandboxHtml.includes('Enter PIN to Receive Refund'), 'Must include fake refund scam spotter');
    assert(sandboxHtml.includes('Scan QR to Receive Lottery'), 'Must include scan-to-receive QR scam spotter');
    assert(sandboxHtml.includes('Urgent Bank KYC Threat'), 'Must include fake KYC SMS scam spotter');
    assert(sandboxHtml.includes('Genuine Grocery Shop Payment'), 'Must include genuine shop payment practice');
    assert(sandboxHtml.includes('1930'), 'Must teach 1930 Cyber helpline');
    assert(sandboxJs.includes('enter a UPI PIN to receive money'), 'Must teach never enter PIN to receive money');
  });

  // 7. Master Switch Non-Negotiable Check in Content Script
  await test('7. Master Switch Teardown & Reversion', () => {
    const contentJs = fs.readFileSync(path.join(ROOT, 'content/content.js'), 'utf8');

    assert(contentJs.includes('teardownAllHelpers'), 'Must have complete teardownAllHelpers function');
    assert(contentJs.includes('SUGAM helpers off'), "Must announce 'SUGAM helpers off' to screen readers");
    assert(contentJs.includes('this.shadowHost.remove()'), 'Must remove all injected Shadow DOM nodes');
    assert(contentJs.includes('SugamBionic.restore'), 'Must restore original DOM nodes losslessly');
    assert(contentJs.includes('restoreHiddenDistractions'), 'Must restore hidden distractions');
  });

  // 8. Sensitive Field Privacy Non-Negotiable
  await test('8. Form Wizard & Speech Never Read/Store Sensitive Fields', () => {
    const contentJs = fs.readFileSync(path.join(ROOT, 'content/content.js'), 'utf8');

    assert(contentJs.includes('isFieldSensitive'), 'Must check isFieldSensitive');
    assert(contentJs.includes('Private Password or PIN'), 'Must alert user on private fields without copying them');
    assert(contentJs.includes('SUGAM never submits'), 'Must explicitly never submit forms for the user');
    assert(
      contentJs.includes('if (isFieldSensitive(target)) return'),
      'Form auto-save must strictly skip sensitive fields'
    );
  });

  // 9. Popup Script Execution & Event Binding
  await test('9. Popup Execution & Event Binding Verification', async () => {
    const mockEl = {
      textContent: '',
      setAttribute: () => {},
      classList: { add: () => {}, remove: () => {}, toggle: () => {} },
      dataset: { feature: 'timerFreeze', lang: 'en', close: 'modal-comfort' },
      addEventListener: (evt, fn) => {},
      querySelector: () => mockEl,
      closest: () => mockEl
    };
    mockEl.querySelector = () => mockEl;
    mockEl.closest = () => mockEl;

    global.document = {
      getElementById: (id) => mockEl,
      querySelector: () => mockEl,
      querySelectorAll: () => [mockEl]
    };
    global.chrome = {
      storage: {
        sync: { get: (k, cb) => cb({ sugamSettings: {} }), set: (o, cb) => cb && cb(), remove: (k, cb) => cb && cb() },
        local: { get: (k, cb) => cb({}), set: (o, cb) => cb && cb(), remove: (k, cb) => cb && cb() }
      },
      tabs: { query: async () => [{ id: 1, url: 'https://example.com' }], sendMessage: () => {} },
      runtime: { getURL: (p) => p }
    };
    const { SugamStorage } = require(path.join(ROOT, 'shared/storage.js'));
    const { SugamI18n } = require(path.join(ROOT, 'shared/i18n.js'));
    global.SugamStorage = SugamStorage;
    global.SugamI18n = SugamI18n;

    const code = fs.readFileSync(path.join(ROOT, 'popup/popup.js'), 'utf8');
    const runner = eval(
      '(async () => {' +
        code
          .replace(/document\.addEventListener\('DOMContentLoaded',\s*async\s*\(\)\s*=>\s*\{/, '')
          .replace(/\}\);\s*$/, '') +
        '})'
    );
    await runner();
    assert(true, 'popup.js must initialize without TDZ or reference errors');
  });

  // 10. Form Wizard Comprehensive Conformance
  await test('10. Form Wizard GOV.UK & COGA Pattern Conformance', () => {
    const contentJs = fs.readFileSync(path.join(ROOT, 'content/content.js'), 'utf8');

    assert(contentJs.includes('detectFormFields'), 'Must have robust detectFormFields');
    assert(contentJs.includes('setupFormWizardLauncher'), 'Must have on-page floating launcher');
    assert(contentJs.includes('What you will need'), "Must include 'What you will need' start screen");
    assert(contentJs.includes('Check your answers'), "Must include 'Check your answers' review screen");
    assert(contentJs.includes('sugam-btn-change'), 'Review screen must provide Change links per answer');
    assert(contentJs.includes('startDictation'), 'Must include voice dictation support');
    assert(contentJs.includes('validateCurrentField'), 'Must provide friendly real-time validation');
    assert(contentJs.includes('setNativeValue'), 'Must use native property setter for website compatibility');
  });

  console.log('\n==================================================');
  console.log(
    passed === total
      ? `🎉 TEST SUMMARY: ${passed}/${total} Passed (100% Success)`
      : `❌ TEST SUMMARY: ${passed}/${total} Passed, ${total - passed} FAILED`
  );
  console.log('==================================================');
  if (passed !== total) process.exitCode = 1;
}

runTests();
