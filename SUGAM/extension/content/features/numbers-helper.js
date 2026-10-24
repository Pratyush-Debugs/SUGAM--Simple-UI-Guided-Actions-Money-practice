/**
 * SUGAM - Numbers Helper (5.6)
 * Methods are mixed into SugamEngine by content/content.js, so `this` is the engine.
 *
 * Capabilities:
 * 1. Spells out Indian currency amounts in plain words (e.g. ₹1,50,000 -> 1 lakh 50 thousand rupees).
 * 2. Works both when currency symbol (₹, Rs.) is in the same text node or a preceding element (common in e-commerce).
 * 3. Chunks long digit sequences (10-digit phone, 12-digit Aadhaar/account, 16-digit cards) with readable spaces.
 * 4. Supports English, Hindi, and Odia vocabulary for Indian numbering units (crore, lakh, thousand, rupees).
 * 5. Strict Non-Negotiable: Never touches sensitive fields (PINs, passwords, OTPs, CVV).
 * 6. 100% Lossless Teardown with ZERO DOM residue.
 */

globalThis.SugamFeatures = globalThis.SugamFeatures || {};
const SugamFeatures = globalThis.SugamFeatures;

SugamFeatures.numbersHelper = {
  setupNumbersHelper(options = {}) {
    this.teardownNumbersHelper();
    this.numbersRecords = [];

    const showWords = options.showWords !== false;
    const chunkDigits = options.chunkDigits !== false;

    if (!showWords && !chunkDigits) return;

    // Elements that must NEVER have numbers modified
    const skipSelector =
      'nav, header, footer, script, style, textarea, input, select, option, code, pre, svg, [role="button"], button, [contenteditable="true"], #sugam-root, .sugam-number-helper-wrapper';

    const lang = this.settings?.language || 'en';

    // Words lookup for Indian numbering system
    const wordsMap = {
      en: { crore: 'crore', lakh: 'lakh', thousand: 'thousand', rupees: 'rupees' },
      hi: { crore: 'करोड़', lakh: 'लाख', thousand: 'हज़ार', rupees: 'रुपये' },
      or: { crore: 'କୋଟି', lakh: 'ଲକ୍ଷ', thousand: 'ହଜାର', rupees: 'ଟଙ୍କା' }
    };
    const vocab = wordsMap[lang] || wordsMap.en;

    function formatAmountInWords(num) {
      num = Math.round(num);
      if (num === 0) return `0 ${vocab.rupees}`;
      const parts = [];
      const crore = Math.floor(num / 10000000);
      num %= 10000000;
      const lakh = Math.floor(num / 100000);
      num %= 100000;
      const thousand = Math.floor(num / 1000);
      num %= 1000;
      const rest = num;

      if (crore > 0) parts.push(`${crore} ${vocab.crore}`);
      if (lakh > 0) parts.push(`${lakh} ${vocab.lakh}`);
      if (thousand > 0) parts.push(`${thousand} ${vocab.thousand}`);
      if (rest > 0) parts.push(`${rest}`);

      return `${parts.join(' ')} ${vocab.rupees}`;
    }

    // Currency regex matching ₹ 1,50,000 or Rs. 2500 or INR 50000
    const currencyRegex = /(₹|Rs\.?|INR)\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)/gi;
    // Pure Indian formatted number with commas (e.g. 1,50,000 or 25,00,000)
    const indianCommaRegex = /\b([0-9]{1,2}(?:,[0-9]{2})+,[0-9]{3}(?:\.[0-9]{1,2})?)\b/g;

    const candidates = document.querySelectorAll(
      'p, li, td, th, h1, h2, h3, h4, h5, h6, span, div, b, strong, em, dt, dd'
    );

    const doc = document;

    candidates.forEach((el) => {
      if (el.closest(skipSelector)) return;

      for (const node of Array.from(el.childNodes)) {
        if (node.nodeType !== 3 /* Node.TEXT_NODE */) continue;
        const text = node.nodeValue;
        if (!text || !/\d/.test(text)) continue;

        let hasChanges = false;
        let transformedText = text;

        // Check if preceding sibling or parent container indicates a currency
        let isPrecededByCurrency = false;
        let prev = node.previousSibling;
        while (prev && prev.nodeType === 3 && !prev.nodeValue.trim()) {
          prev = prev.previousSibling;
        }
        if (prev) {
          const pTxt = (prev.textContent || '').trim();
          if (/(?:₹|Rs\.?|INR)$/i.test(pTxt)) {
            isPrecededByCurrency = true;
          }
        }

        // 1. Currency to words
        if (showWords) {
          // Case A: Currency symbol in same text node (₹ 1,50,000)
          currencyRegex.lastIndex = 0;
          if (currencyRegex.test(transformedText)) {
            currencyRegex.lastIndex = 0;
            transformedText = transformedText.replace(currencyRegex, (match, prefix, numStr) => {
              const rawNum = parseFloat(numStr.replace(/,/g, ''));
              if (isNaN(rawNum) || rawNum < 1) return match;
              hasChanges = true;
              return `${match} (${formatAmountInWords(rawNum)})`;
            });
          }

          // Case B: Preceded by currency symbol in previous sibling (<span>₹</span><span>1,50,000</span>)
          if (isPrecededByCurrency && !transformedText.includes('(')) {
            const numMatch = transformedText.match(/^\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{1,2})?)/);
            if (numMatch) {
              const rawNum = parseFloat(numMatch[1].replace(/,/g, ''));
              if (!isNaN(rawNum) && rawNum >= 1) {
                hasChanges = true;
                transformedText = transformedText.replace(numMatch[1], `${numMatch[1]} (${formatAmountInWords(rawNum)})`);
              }
            }
          }

          // Case C: Indian comma formatted large numbers (e.g. 1,50,000 or 12,50,000)
          indianCommaRegex.lastIndex = 0;
          if (indianCommaRegex.test(transformedText)) {
            indianCommaRegex.lastIndex = 0;
            transformedText = transformedText.replace(indianCommaRegex, (match, numStr) => {
              // Avoid duplicating if already annotated
              if (transformedText.includes(`(${formatAmountInWords(parseFloat(numStr.replace(/,/g, '')))}`)) {
                return match;
              }
              const rawNum = parseFloat(numStr.replace(/,/g, ''));
              if (isNaN(rawNum) || rawNum < 1000) return match;
              hasChanges = true;
              return `${match} (${formatAmountInWords(rawNum)})`;
            });
          }
        }

        // 2. Chunk long digits (10-digit phone, 12-digit Aadhaar/account, 16-digit card/order ID)
        if (chunkDigits) {
          const chunked = transformedText
            .replace(/\b(\d{10})\b/g, (m, p1) => {
              hasChanges = true;
              return `${p1.slice(0, 5)} ${p1.slice(5)}`;
            })
            .replace(/\b(\d{12})\b/g, (m, p1) => {
              hasChanges = true;
              return `${p1.slice(0, 4)} ${p1.slice(4, 8)} ${p1.slice(8)}`;
            })
            .replace(/\b(\d{16})\b/g, (m, p1) => {
              hasChanges = true;
              return `${p1.slice(0, 4)} ${p1.slice(4, 8)} ${p1.slice(8, 12)} ${p1.slice(12)}`;
            });

          if (chunked !== transformedText) {
            transformedText = chunked;
            hasChanges = true;
          }
        }

        if (hasChanges && transformedText !== text) {
          const wrapper = doc.createElement('span');
          wrapper.className = 'sugam-number-helper-wrapper';
          wrapper.textContent = transformedText;
          node.replaceWith(wrapper);
          this.numbersRecords.push({ wrapper, original: node });
        }
      }
    });
  },

  teardownNumbersHelper() {
    if (this.numbersRecords && this.numbersRecords.length > 0) {
      for (const record of this.numbersRecords) {
        if (record.wrapper && record.wrapper.parentNode) {
          record.wrapper.replaceWith(record.original);
        }
      }
    }
    this.numbersRecords = [];
  }
};

if (typeof module !== 'undefined') {
  module.exports = { SugamNumbersHelper: SugamFeatures.numbersHelper };
}

