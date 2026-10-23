/**
 * Writes docs/translations-for-review.csv: one row per sentence with English, Hindi and Odia
 * side by side, plus empty columns for native-speaker reviewers. Opens directly in Excel or
 * Google Sheets (UTF-8 with BOM so Devanagari and Odia display correctly).
 *
 * Usage: npm run translations:export
 */
const fs = require('node:fs');
const path = require('node:path');
const { SUGAM_TRANSLATIONS } = require('../SUGAM/extension/shared/i18n.js');

const OUT = path.join(__dirname, '..', 'docs', 'translations-for-review.csv');

// Where each group of keys appears, in review priority: safety-critical text first.
const AREAS = [
  [/^scam/, '1. Scam warning (on websites)'],
  [/^(calm|breathe|timer|iNeedAMoment|returnToPage|callHelper|messageHelper|cyberHelpline)/, '2. Calm screen / timer'],
  [/^(wz|wizard)/, '3. Form Wizard (on websites)'],
  [/^upi/, '4. UPI practice sandbox'],
  [/^disclaimer/, '5. Disclaimers'],
  [/^sp/, '6. Side panel'],
  [/^help/, '7. Popup: help'],
  [/^tile/, '8. Popup: helper tiles'],
  [/.*/, '9. Popup: general']
];

const csvCell = (value) => `"${String(value).replace(/"/g, '""')}"`;
const plain = (text) => text.replace(/<[^>]+>/g, ''); // reviewers read the words, not the markup

const header = [
  'Key',
  'Where it appears',
  'English',
  'Hindi',
  'Hindi OK? (yes / fix)',
  'Odia',
  'Odia OK? (yes / fix)',
  'Comments'
];
const rows = Object.keys(SUGAM_TRANSLATIONS.en).map((key) => [
  key,
  AREAS.find(([pattern]) => pattern.test(key))[1],
  plain(SUGAM_TRANSLATIONS.en[key]),
  plain(SUGAM_TRANSLATIONS.hi[key]),
  '',
  plain(SUGAM_TRANSLATIONS.or[key]),
  '',
  ''
]);
rows.sort((a, b) => a[1].localeCompare(b[1]));

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, '﻿' + [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n', 'utf8');
console.log(`Wrote ${rows.length} rows to ${path.relative(process.cwd(), OUT)}`);
