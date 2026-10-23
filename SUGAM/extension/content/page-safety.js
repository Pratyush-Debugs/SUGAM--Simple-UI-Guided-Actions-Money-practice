/**
 * SUGAM - Page safety helpers shared by the content script and its features.
 * One source of truth: the bank/payment domain list and field rules live in shared/sensitive-detector.js.
 */

/** True on banking/payment/government pages, or any page with password, OTP, PIN or card fields. */
function isPageSensitive() {
  try {
    return SensitiveDetector.isSensitivePage().isSensitive;
  } catch {
    return true; // if in doubt, treat the page as sensitive
  }
}

/** True for password, OTP, PIN, CVV and card-number inputs. */
function isFieldSensitive(input) {
  return SensitiveDetector.isSensitiveField(input);
}

/** Text in the user's chosen language (English, Hindi or Odia). */
function t(key, values) {
  return SugamI18n.get(key, values);
}

/** Page-controlled text (labels, placeholders, option text, typed answers) must never be parsed as HTML. */
function esc(value) {
  return SugamDom.escapeHtml(value);
}
