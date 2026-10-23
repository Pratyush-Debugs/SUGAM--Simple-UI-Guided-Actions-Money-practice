/**
 * SUGAM - Content script injection
 *
 * SUGAM has no standing access to websites. It runs on a page in two ways only:
 * 1. On demand: when the user opens the popup, uses a shortcut or the right-click menu,
 *    Chrome grants temporary access to that one tab (the "activeTab" permission) and
 *    SugamInjector.ensure() injects the content scripts.
 * 2. Automatically: only after the user turns on "Use SUGAM on every website" and accepts
 *    Chrome's permission prompt. syncRegistration() then registers the content scripts
 *    for the granted sites, so scam warnings appear without opening the popup.
 */

// The content script files, in load order. content/content.js must stay last.
const SUGAM_CONTENT_SCRIPTS = [
  'shared/dom-safe.js',
  'shared/bionic.js',
  'shared/sensitive-detector.js',
  'shared/i18n.js',
  'content/page-safety.js',
  'content/features/visual-comfort.js',
  'content/features/reading-ruler.js',
  'content/features/bionic-read.js',
  'content/features/take-your-time.js',
  'content/features/read-aloud.js',
  'content/features/form-wizard.js',
  'content/features/scam-guard.js',
  'content/content.js'
];
const SUGAM_CONTENT_CSS = ['content/content.css'];

// The only site SUGAM may always reach (for Gemini, and only with the user's consent).
const SUGAM_GEMINI_ORIGIN = 'https://generativelanguage.googleapis.com/*';
const SUGAM_ALL_SITES = ['<all_urls>'];
const SUGAM_REGISTRATION_ID = 'sugam-auto';

const SugamInjector = {
  /** Pages Chrome never lets extensions run on. */
  canRunOn(url) {
    return /^(https?|file):/.test(url || '');
  },

  async isInjected(tabId) {
    try {
      return !!(await chrome.tabs.sendMessage(tabId, { action: 'PING' }));
    } catch {
      return false;
    }
  },

  /** Injects SUGAM into the tab if it is not there yet. Returns true when SUGAM is running. */
  async ensure(tabId) {
    if (await this.isInjected(tabId)) return true;
    try {
      await chrome.scripting.insertCSS({ target: { tabId }, files: SUGAM_CONTENT_CSS });
      await chrome.scripting.executeScript({ target: { tabId }, files: SUGAM_CONTENT_SCRIPTS });
      return true;
    } catch {
      return false; // no access to this tab (e.g. a browser page, or the user has not opened SUGAM here)
    }
  },

  /** Sends a message to SUGAM in the tab, injecting it first if needed. */
  async send(tabId, message) {
    if (!(await this.ensure(tabId))) return undefined;
    try {
      return await chrome.tabs.sendMessage(tabId, message);
    } catch {
      return undefined;
    }
  },

  /** True when the user has allowed SUGAM on every website. */
  async hasAllSites() {
    return chrome.permissions.contains({ origins: SUGAM_ALL_SITES });
  },

  /** Asks Chrome for access to every website. Must run from a click. */
  async requestAllSites() {
    return chrome.permissions.request({ origins: SUGAM_ALL_SITES });
  },

  async removeAllSites() {
    return chrome.permissions.remove({ origins: SUGAM_ALL_SITES });
  },

  /** Registers automatic injection for exactly the sites the user has granted (service worker). */
  async syncRegistration() {
    const { origins = [] } = await chrome.permissions.getAll();
    const sites = origins.filter((origin) => origin !== SUGAM_GEMINI_ORIGIN);

    const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [SUGAM_REGISTRATION_ID] });
    if (existing.length) await chrome.scripting.unregisterContentScripts({ ids: [SUGAM_REGISTRATION_ID] });
    if (!sites.length) return;

    await chrome.scripting.registerContentScripts([
      {
        id: SUGAM_REGISTRATION_ID,
        matches: sites,
        js: SUGAM_CONTENT_SCRIPTS,
        css: SUGAM_CONTENT_CSS,
        runAt: 'document_idle',
        persistAcrossSessions: true
      }
    ]);
  }
};

if (typeof module !== 'undefined') {
  module.exports = { SugamInjector, SUGAM_CONTENT_SCRIPTS, SUGAM_CONTENT_CSS, SUGAM_GEMINI_ORIGIN };
}
