/**
 * SUGAM - Bionic Read
 * Bolds the first part of each Latin word. Works on text nodes only, so links,
 * emphasis and other markup inside a paragraph are never lost, and page text is
 * never re-parsed as HTML. Fully reversible: every change is a wrapper element
 * that is swapped back for the original text node.
 */

const SugamBionic = {
  WRAPPER_CLASS: 'sugam-bionic',
  BOLD_CLASS: 'sugam-bionic-bold',
  SKIP_SELECTOR: 'nav, header, footer, button, [role="button"], code, pre, script, style, textarea',
  NON_LATIN: /[\u0900-\u097F\u0B00-\u0B7F]/, // Hindi (Devanagari) and Odia stay untouched

  ratioFor(strength) {
    return strength === 'light' ? 0.3 : strength === 'strong' ? 0.6 : 0.45;
  },

  /**
   * Applies bionic formatting under `root` and returns records for restore().
   */
  apply(root, ratio) {
    const doc = root.ownerDocument || root;
    const records = [];

    root.querySelectorAll('p').forEach((p) => {
      if (p.closest(this.SKIP_SELECTOR)) return;
      if (this.NON_LATIN.test(p.textContent)) return;

      const textNodes = [];
      const walker = doc.createTreeWalker(p, 4 /* NodeFilter.SHOW_TEXT */);
      while (walker.nextNode()) textNodes.push(walker.currentNode);

      textNodes.forEach((node) => {
        const parent = node.parentElement;
        if (!parent || !node.nodeValue.trim()) return;
        if (parent.closest(`.${this.WRAPPER_CLASS}, ${this.SKIP_SELECTOR}`)) return;

        const wrapper = doc.createElement('span');
        wrapper.className = this.WRAPPER_CLASS;
        node.nodeValue.split(/(\s+)/).forEach((chunk) => {
          if (chunk.length <= 1) {
            wrapper.appendChild(doc.createTextNode(chunk));
            return;
          }
          const boldCount = Math.max(1, Math.round(chunk.length * ratio));
          const bold = doc.createElement('b');
          bold.className = this.BOLD_CLASS;
          bold.textContent = chunk.slice(0, boldCount);
          wrapper.append(bold, doc.createTextNode(chunk.slice(boldCount)));
        });

        node.replaceWith(wrapper);
        records.push({ wrapper, original: node });
      });
    });

    return records;
  },

  /**
   * Puts every original text node back. Safe to call more than once.
   */
  restore(records) {
    records.forEach(({ wrapper, original }) => {
      if (wrapper.isConnected) wrapper.replaceWith(original);
    });
    records.length = 0;
  }
};

if (typeof module !== 'undefined') {
  module.exports = { SugamBionic };
}
