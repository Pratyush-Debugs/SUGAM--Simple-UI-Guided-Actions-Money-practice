/**
 * SUGAM - Safe DOM helpers
 * Text from web pages, forms, storage and cloud AI is untrusted. Use these
 * helpers instead of putting such text into innerHTML.
 */

const SugamDom = {
  /**
   * Escapes text so it can be placed inside an HTML text node or a quoted attribute.
   */
  escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /**
   * Returns a normalised http(s) URL, or '' for anything else
   * (javascript:, data:, chrome:, malformed input, ...).
   */
  safeHttpUrl(url) {
    try {
      const parsed = new URL(String(url));
      return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.href : '';
    } catch {
      return '';
    }
  },

  /**
   * Splits "Pay **₹500** by **5 days**" into [{ text, bold }] parts.
   * Pure function: no DOM needed.
   */
  parseEmphasis(text) {
    const parts = [];
    const pattern = /\*\*(.+?)\*\*/g;
    const source = String(text ?? '');
    let last = 0;
    let match;
    while ((match = pattern.exec(source)) !== null) {
      if (match.index > last) parts.push({ text: source.slice(last, match.index), bold: false });
      parts.push({ text: match[1], bold: true });
      last = pattern.lastIndex;
    }
    if (last < source.length) parts.push({ text: source.slice(last), bold: false });
    return parts;
  },

  /**
   * Appends text to `parent`, turning **double-star** parts into <strong>.
   * Everything is added through text nodes, so markup in `text` stays inert.
   */
  appendEmphasis(parent, text) {
    const doc = parent.ownerDocument;
    for (const part of this.parseEmphasis(text)) {
      if (part.bold) {
        const strong = doc.createElement('strong');
        strong.textContent = part.text;
        parent.appendChild(strong);
      } else {
        parent.appendChild(doc.createTextNode(part.text));
      }
    }
    return parent;
  }
};

if (typeof module !== 'undefined') {
  module.exports = { SugamDom };
}
