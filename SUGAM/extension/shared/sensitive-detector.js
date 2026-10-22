/**
 * SUGAM - Sensitive Page & Field Detector
 * Enforces non-negotiable security & privacy rules:
 * - Detects banking, payment, and sensitive authentication domains.
 * - Detects password, OTP, PIN, CVV, and credit card fields.
 * - Ensures SUGAM NEVER stores, logs, sends, or auto-fills sensitive values.
 */

const SUGAM_SENSITIVE_DOMAINS = [
  // Major Indian Banks
  'onlinesbi.sbi',
  'sbi.co.in',
  'hdfcbank.com',
  'icicibank.com',
  'axisbank.com',
  'kotak.com',
  'pnbindia.in',
  'bankofbaroda.in',
  'canarabank.com',
  'unionbankofindia.co.in',
  'indusind.com',
  'yesbank.in',
  'idbibank.in',
  'idfcfirstbank.com',
  'federalbank.co.in',
  'rblbank.com',
  'centralbankofindia.co.in',
  'bankofindia.co.in',
  'indianbank.in',

  // Payment Gateways & UPI Apps
  'paytm.com',
  'phonepe.com',
  'pay.google.com',
  'bhimupi.org.in',
  'razorpay.com',
  'billdesk.com',
  'ccavenue.com',
  'cashfree.com',
  'payu.in',
  'cred.club',
  'mobikwik.com',
  'freecharge.in',
  'airtel.in/bank',
  'npci.org.in',

  // Government Tax & Identity Portals
  'incometax.gov.in',
  'uidai.gov.in',
  'myaadhaar.uidai.gov.in',
  'epfindia.gov.in'
];

const SensitiveDetector = {
  /**
   * Checks if a given URL or hostname belongs to a known banking/financial service.
   */
  isSensitiveDomain(urlOrHostname) {
    if (!urlOrHostname) return false;
    let hostname = urlOrHostname;
    try {
      if (urlOrHostname.includes('://')) {
        hostname = new URL(urlOrHostname).hostname;
      }
    } catch {
      // keep as string
    }

    hostname = hostname.toLowerCase();
    return SUGAM_SENSITIVE_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );
  },

  /**
   * Checks if a DOM input element is sensitive (password, OTP, PIN, card, CVV).
   */
  isSensitiveField(element) {
    if (!element) return false;
    if (typeof HTMLElement !== 'undefined' && !(element instanceof HTMLElement)) return false;

    const tag = (element.tagName || '').toLowerCase();
    if (tag !== 'input' && tag !== 'textarea') return false;

    const type = (element.getAttribute('type') || 'text').toLowerCase();
    if (type === 'password') return true;

    const autocomplete = (element.getAttribute('autocomplete') || '').toLowerCase();
    const sensitiveAutocompletes = [
      'current-password',
      'new-password',
      'one-time-code',
      'cc-number',
      'cc-csc',
      'cc-exp',
      'cc-exp-month',
      'cc-exp-year'
    ];
    if (sensitiveAutocompletes.some(val => autocomplete.includes(val))) {
      return true;
    }

    // Inspect name, id, placeholder, and aria-label
    const checkString = [
      element.getAttribute('name') || '',
      element.getAttribute('id') || '',
      element.getAttribute('placeholder') || '',
      element.getAttribute('aria-label') || ''
    ].join(' ').toLowerCase();

    const sensitiveKeywords = [
      'otp',
      'one-time',
      'onetime',
      'pin',
      'cvv',
      'cvc',
      'password',
      'passwd',
      'cardnumber',
      'card-number',
      'card_num',
      'secret',
      'security-code'
    ];

    return sensitiveKeywords.some(keyword => {
      // Avoid false matches like "shopping" matching "pin"
      const regex = new RegExp(`(^|[^a-z])${keyword}([^a-z]|$)`, 'i');
      return regex.test(checkString);
    });
  },

  /**
   * Checks if the current document is sensitive.
   * Returns { isSensitive: boolean, reason: string }
   */
  isSensitivePage() {
    if (typeof window === 'undefined' || !window.location) {
      return { isSensitive: false, reason: '' };
    }

    if (this.isSensitiveDomain(window.location.hostname)) {
      return {
        isSensitive: true,
        reason: 'Financial, banking, or government payment domain.'
      };
    }

    // Check if there are password or OTP fields in the page
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    if (passwordInputs.length > 0) {
      return {
        isSensitive: true,
        reason: 'Page contains password fields.'
      };
    }

    const allInputs = document.querySelectorAll('input');
    for (const input of allInputs) {
      if (this.isSensitiveField(input)) {
        return {
          isSensitive: true,
          reason: 'Page contains sensitive authentication or payment fields.'
        };
      }
    }

    return { isSensitive: false, reason: '' };
  }
};

if (typeof module !== 'undefined') {
  module.exports = { SensitiveDetector, SUGAM_SENSITIVE_DOMAINS };
}

