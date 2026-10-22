/**
 * SUGAM - Pictograms & Visual Concept Matcher
 * Provides open-symbol SVGs for COGA easy-read cards.
 * Indian context symbols: Rupee, UPI, QR Code, OTP, Bank, Bill, Doctor, Bus, etc.
 * Colors: Deep Plum (#59366E), Charcoal (#29252D), Lavender (#E7DDF0).
 */

const SUGAM_PICTOGRAMS = {
  rupee: {
    label: 'Money / Rupee',
    keywords: [
      'rupee',
      'rupees',
      'rs',
      '₹',
      'money',
      'cost',
      'price',
      'fee',
      'pay',
      'payment',
      'रुपये',
      'पैसे',
      'खर्च',
      'ଟଙ୍କା',
      'ପଇସା'
    ],
    svg: `<svg viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Rupee symbol" fill="none" stroke="#59366E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="24" cy="24" r="21" fill="#F3EDF7" stroke="#59366E" stroke-width="2.5"/>
      <path d="M16 14h16M16 20h14M16 14c4 0 9 1 9 6s-5 6-9 6h-1l12 12"/>
    </svg>`
  },
  upi: {
    label: 'UPI Payment',
    keywords: ['upi', 'bhim', 'gpay', 'phonepe', 'paytm', 'send money', 'यूपीआई', 'ୟୁପିଆଇ'],
    svg: `<svg viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="UPI mobile payment" fill="none" stroke="#59366E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <rect x="12" y="6" width="24" height="36" rx="4" fill="#F3EDF7" stroke="#59366E"/>
      <circle cx="24" cy="36" r="1.5" fill="#59366E"/>
      <path d="M18 16l6 6 6-6M24 22v8"/>
    </svg>`
  },
  qr: {
    label: 'QR Code',
    keywords: ['qr', 'qr code', 'scan', 'scanner', 'स्कैन', 'ସ୍ମାନ'],
    svg: `<svg viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="QR Code" fill="none" stroke="#59366E" stroke-width="2.5" stroke-linecap="round">
      <rect x="8" y="8" width="13" height="13" fill="#E7DDF0" stroke="#59366E" stroke-width="3"/>
      <rect x="12" y="12" width="5" height="5" fill="#59366E"/>
      <rect x="27" y="8" width="13" height="13" fill="#E7DDF0" stroke="#59366E" stroke-width="3"/>
      <rect x="31" y="12" width="5" height="5" fill="#59366E"/>
      <rect x="8" y="27" width="13" height="13" fill="#E7DDF0" stroke="#59366E" stroke-width="3"/>
      <rect x="12" y="31" width="5" height="5" fill="#59366E"/>
      <path d="M28 28h5v5h-5zM35 35h5v5h-5zM28 37h4M37 28v5" stroke-width="3"/>
    </svg>`
  },
  otp: {
    label: 'OTP / PIN',
    keywords: ['otp', 'pin', 'code', 'password', 'one-time', 'ओटीपी', 'पिन', 'ପିନ୍'],
    svg: `<svg viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Security PIN" fill="none" stroke="#59366E" stroke-width="3" stroke-linecap="round">
      <rect x="8" y="14" width="32" height="24" rx="4" fill="#F3EDF7" stroke="#59366E"/>
      <circle cx="16" cy="26" r="2.5" fill="#59366E"/>
      <circle cx="24" cy="26" r="2.5" fill="#59366E"/>
      <circle cx="32" cy="26" r="2.5" fill="#59366E"/>
      <path d="M16 14V10a8 8 0 0116 0v4"/>
    </svg>`
  },
  bank: {
    label: 'Bank',
    keywords: ['bank', 'account', 'branch', 'sbi', 'hdfc', 'icici', 'बैंक', 'ଖାତା', 'ବ୍ୟାଙ୍କ'],
    svg: `<svg viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Bank building" fill="none" stroke="#59366E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 16l18-9 18 9M9 16v20M39 16v20M17 19v17M24 19v17M31 19v17M6 40h36" fill="#F3EDF7"/>
    </svg>`
  },
  bill: {
    label: 'Bill / Receipt',
    keywords: ['bill', 'receipt', 'invoice', 'electricity', 'water', 'बिल', 'रसीद', 'ବିଲ୍'],
    svg: `<svg viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Bill receipt" fill="none" stroke="#59366E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 8h28v32l-5-3-5 3-4-3-5 3-5-3-4 3V8z" fill="#F3EDF7"/>
      <path d="M16 16h16M16 23h16M16 30h10"/>
    </svg>`
  },
  doctor: {
    label: 'Health / Doctor',
    keywords: ['doctor', 'health', 'hospital', 'medicine', 'clinic', 'डॉक्टर', 'दवा', 'ଡାକ୍ତର', 'ଔଷଧ'],
    svg: `<svg viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Medical health" fill="none" stroke="#59366E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="24" cy="24" r="20" fill="#F3EDF7"/>
      <path d="M24 14v20M14 24h20" stroke="#59366E" stroke-width="5"/>
    </svg>`
  },
  warning: {
    label: 'Warning / Danger / Scam',
    keywords: [
      'warning',
      'scam',
      'danger',
      'fake',
      'fraud',
      'beware',
      'alert',
      'threat',
      'सावधान',
      'धोखा',
      'ଠକାମି',
      'ସତର୍କ'
    ],
    svg: `<svg viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Warning alert" fill="none" stroke="#D32F2F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M24 7L5 39h38L24 7z" fill="#FFF3E0"/>
      <path d="M24 18v10M24 33h.02" stroke="#D32F2F" stroke-width="4"/>
    </svg>`
  },
  date: {
    label: 'Date / Time / Calendar',
    keywords: ['date', 'day', 'calendar', 'month', 'year', 'today', 'tomorrow', 'deadline', 'तारीख', 'दिन', 'ତାରିଖ'],
    svg: `<svg viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Calendar date" fill="none" stroke="#59366E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <rect x="8" y="10" width="32" height="30" rx="4" fill="#F3EDF7"/>
      <path d="M8 18h32M16 6v8M32 6v8"/>
      <circle cx="17" cy="26" r="2" fill="#59366E"/>
      <circle cx="24" cy="26" r="2" fill="#59366E"/>
      <circle cx="31" cy="26" r="2" fill="#59366E"/>
    </svg>`
  },
  person: {
    label: 'Person / Helper',
    keywords: ['person', 'friend', 'helper', 'user', 'caregiver', 'family', 'mom', 'व्यक्ति', 'दोस्त', 'ସାଙ୍ଗ', 'ଲୋକ'],
    svg: `<svg viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Person" fill="none" stroke="#59366E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="24" cy="15" r="7" fill="#F3EDF7"/>
      <path d="M10 39c0-7 6-12 14-12s14 5 14 12" fill="#F3EDF7"/>
    </svg>`
  },
  form: {
    label: 'Form / Application',
    keywords: ['form', 'apply', 'application', 'question', 'submit', 'details', 'फॉर्म', 'ଫର୍ମ'],
    svg: `<svg viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Form document" fill="none" stroke="#59366E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <rect x="10" y="8" width="28" height="32" rx="3" fill="#F3EDF7"/>
      <path d="M16 16h16M16 22h10M16 28h14"/>
      <path d="M30 30l4 4 8-8" stroke="#2E7D32" stroke-width="3"/>
    </svg>`
  },
  phone: {
    label: 'Phone / Call',
    keywords: ['phone', 'call', 'mobile', 'helpline', '1930', 'contact', 'फोन', 'କଲ୍'],
    svg: `<svg viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Phone" fill="none" stroke="#59366E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 9a3 3 0 013-3h3a3 3 0 013 2.5l1.5 5a3 3 0 01-1 3.2l-2.5 2a19 19 0 008 8l2-2.5a3 3 0 013.2-1l5 1.5A3 3 0 0139 30v3a3 3 0 01-3 3c-15 0-27-12-27-27z" fill="#F3EDF7"/>
    </svg>`
  },
  time: {
    label: 'Clock / Time / Waiting',
    keywords: ['time', 'clock', 'minute', 'hour', 'wait', 'timer', 'countdown', 'समय', 'घड़ी', 'ସମୟ'],
    svg: `<svg viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Clock" fill="none" stroke="#59366E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="24" cy="24" r="19" fill="#F3EDF7"/>
      <path d="M24 13v11l7 4"/>
    </svg>`
  },
  bus: {
    label: 'Bus / Travel',
    keywords: ['bus', 'train', 'travel', 'ticket', 'station', 'बस', 'ଯାତ୍ରା', 'ବସ୍'],
    svg: `<svg viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="Bus vehicle" fill="none" stroke="#59366E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <rect x="10" y="10" width="28" height="24" rx="4" fill="#F3EDF7"/>
      <path d="M10 20h28M16 10v10M32 10v10M10 26h28"/>
      <circle cx="16" cy="37" r="3" fill="#59366E"/>
      <circle cx="32" cy="37" r="3" fill="#59366E"/>
      <path d="M12 34v3M36 34v3"/>
    </svg>`
  }
};

const PictogramMatcher = {
  /**
   * Finds the single most relevant pictogram for a given sentence.
   * If no good match exists, returns null (never show a wrong picture).
   */
  matchSentence(sentence) {
    if (!sentence || typeof sentence !== 'string') return null;
    const lower = sentence.toLowerCase();

    // Check specific priority concepts first
    const priorityKeys = [
      'warning',
      'upi',
      'otp',
      'rupee',
      'bank',
      'bill',
      'doctor',
      'bus',
      'form',
      'date',
      'phone',
      'time',
      'person'
    ];

    for (const key of priorityKeys) {
      const pic = SUGAM_PICTOGRAMS[key];
      for (const kw of pic.keywords) {
        // match whole word or special symbol safely
        const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(
          `(^|\\s|[^a-zA-Z0-9\u0900-\u097F\u0B00-\u0B7F])${escaped}($|\\s|[^a-zA-Z0-9\u0900-\u097F\u0B00-\u0B7F])`,
          'i'
        );
        if (regex.test(lower)) {
          return { key, ...pic };
        }
      }
    }

    return null;
  }
};

if (typeof module !== 'undefined') {
  module.exports = { SUGAM_PICTOGRAMS, PictogramMatcher };
}
