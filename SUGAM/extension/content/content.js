/**
 * SUGAM - Content Script Engine
 * Core: settings, messages, master switch, shadow host, apply/teardown of all helpers.
 * Each helper's own code is in content/features/; page-safety helpers are in content/page-safety.js.
 * Implements all page helpers conforming to WCAG 2.2 AA and W3C COGA.
 * Strict Non-Negotiables:
 * 1. Master switch completely removes all injected nodes and styles with ZERO DOM residue.
 * 2. Sensitive fields (passwords, OTPs, PINs, cards) are NEVER read, copied, stored, or sent.
 * 3. SUGAM never submits forms or moves money.
 */

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.__SUGAM_CONTENT_INITIALIZED__) return;
  window.__SUGAM_CONTENT_INITIALIZED__ = true;

  // SUGAM Engine State
  const SugamEngine = {
    settings: null,
    isMasterOn: false,
    isSiteDisabled: false,
    activeHelpers: new Set(),
    shadowHost: null,
    shadowRoot: null,
    bionicRecords: [], // { wrapper, original } pairs so Bionic Read can be undone losslessly
    numbersRecords: [], // { wrapper, original } pairs for Numbers Helper
    speechSynthesisUtterance: null,
    isReadingAloud: false,
    readingRulerElem: null,
    calmOverlayElem: null,
    countdownInterval: null,
    hiddenDistractions: [],

    async init() {
      // Remember whether the site itself set these, so teardown can leave <html> exactly as it was.
      this.siteHadHtmlClass = document.documentElement.hasAttribute('class');
      this.siteHadHtmlStyle = document.documentElement.hasAttribute('style');

      // Check if site is disabled in sync storage
      const res = await this.getStorageData(['sugamSettings']);
      this.settings = res?.sugamSettings || {};
      SugamI18n.setLanguage(this.settings.language || 'en');

      const host = window.location.hostname;
      if (this.settings.disabledSites && this.settings.disabledSites.includes(host)) {
        this.isSiteDisabled = true;
      }

      this.isMasterOn = this.settings.masterSwitch !== false && !this.isSiteDisabled;

      // Listen for messages from popup or background
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        this.handleMessage(message, sendResponse);
        return true; // asynchronous reply
      });

      // Keyboard shortcuts
      window.addEventListener('keydown', (e) => {
        // Alt+Shift+S: Master Switch Toggle
        if (e.altKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
          e.preventDefault();
          this.toggleMasterSwitch();
        }
        // Alt+Shift+M: I need a moment (Calm screen)
        if (e.altKey && e.shiftKey && (e.key === 'M' || e.key === 'm')) {
          e.preventDefault();
          this.triggerCalmMoment();
        }
        // Esc: Close reading ruler or calm screen
        if (e.key === 'Escape') {
          if (this.calmOverlayElem) this.dismissCalmMoment();
          if (this.readingRulerElem) this.teardownRuler();
        }
      });

      // Apply initial state if master switch is ON
      if (this.isMasterOn) {
        this.applyAllHelpers();
      }
    },

    getStorageData(keys) {
      return new Promise((resolve) => {
        try {
          chrome.storage.sync.get(keys, resolve);
        } catch {
          resolve({});
        }
      });
    },

    saveStorageSettings(updated) {
      try {
        chrome.storage.sync.set({ sugamSettings: updated });
      } catch (e) {
        console.warn('Storage sync failed', e);
      }
    },

    handleMessage(msg, sendResponse) {
      if (!msg || !msg.action) return;

      switch (msg.action) {
        case 'TOGGLE_MASTER_SWITCH':
          this.toggleMasterSwitch(msg.value);
          sendResponse({ success: true, isMasterOn: this.isMasterOn });
          break;

        case 'SETTINGS_UPDATED':
          this.settings = msg.settings;
          SugamI18n.setLanguage(this.settings.language || 'en');
          if (this.isMasterOn) {
            this.teardownAllHelpers();
            this.applyAllHelpers();
          }
          sendResponse({ success: true });
          break;

        case 'TRIGGER_CALM_MOMENT':
          this.triggerCalmMoment();
          sendResponse({ success: true });
          break;

        case 'TRIGGER_READ_ALOUD':
          this.toggleReadAloud(msg.mode || 'main');
          sendResponse({ success: true });
          break;

        case 'TRIGGER_FORM_WIZARD':
          this.openFormWizard();
          sendResponse({ success: true });
          break;

        case 'EXTRACT_PAGE_CONTENT':
          sendResponse({
            content: this.extractMainContent(),
            isSensitive: isPageSensitive()
          });
          break;

        case 'TOGGLE_SITE_DISABLED':
          this.toggleSiteDisabled();
          sendResponse({ isSiteDisabled: this.isSiteDisabled });
          break;

        default:
          sendResponse({ received: true });
      }
    },

    /**
     * MASTER SWITCH:
     * One tap undoes all changes with ZERO DOM residue.
     * Tapping again restores previous state.
     */
    toggleMasterSwitch(forceValue) {
      const nextState = typeof forceValue === 'boolean' ? forceValue : !this.isMasterOn;
      this.isMasterOn = nextState;
      this.settings.masterSwitch = nextState;
      this.saveStorageSettings(this.settings);

      if (this.isMasterOn) {
        this.applyAllHelpers();
        this.announceToScreenReader('SUGAM helpers turned on');
      } else {
        this.teardownAllHelpers();
        this.announceToScreenReader('SUGAM helpers off');
        // The announcement needs a live region, so keep the host just long enough for it to be
        // spoken, then remove it so SUGAM leaves nothing behind on the page.
        setTimeout(() => {
          if (!this.isMasterOn && this.shadowHost) {
            this.shadowHost.remove();
            this.shadowHost = null;
            this.shadowRoot = null;
          }
        }, 2500);
      }
    },

    toggleSiteDisabled() {
      const host = window.location.hostname;
      const list = new Set(this.settings.disabledSites || []);
      if (list.has(host)) {
        list.delete(host);
        this.isSiteDisabled = false;
        this.isMasterOn = this.settings.masterSwitch !== false;
      } else {
        list.add(host);
        this.isSiteDisabled = true;
        this.isMasterOn = false;
      }
      this.settings.disabledSites = Array.from(list);
      this.saveStorageSettings(this.settings);

      if (this.isSiteDisabled) {
        this.teardownAllHelpers();
        this.announceToScreenReader('SUGAM disabled for this site');
      } else if (this.isMasterOn) {
        this.applyAllHelpers();
        this.announceToScreenReader('SUGAM re-enabled for this site');
      }
    },

    /**
     * Initializes the Shadow DOM container for all SUGAM UI overlays
     * so page styles cannot conflict with SUGAM.
     */
    ensureShadowHost() {
      const parent = document.body || document.documentElement;
      if (this.shadowHost && parent && parent.contains(this.shadowHost)) {
        return this.shadowRoot;
      }
      this.shadowHost = document.createElement('div');
      this.shadowHost.id = 'sugam-root';
      this.shadowHost.style.position = 'fixed';
      this.shadowHost.style.top = '0';
      this.shadowHost.style.left = '0';
      this.shadowHost.style.width = '100vw';
      this.shadowHost.style.height = '100vh';
      this.shadowHost.style.zIndex = '2147483647'; // Max z-index
      this.shadowHost.style.pointerEvents = 'none';

      this.shadowRoot = this.shadowHost.attachShadow({ mode: 'open' });

      // Inject base styles into shadow root
      const style = document.createElement('style');
      style.textContent = `
        * { box-sizing: border-box; font-family: "SUGAM Lexend", Lexend, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .pointer-all { pointer-events: auto; }
        .sugam-floating-badge {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background-color: #59366E;
          color: #FAF8F5;
          padding: 10px 16px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          gap: 12px;
          pointer-events: auto;
          cursor: pointer;
          border: 2px solid #FAF8F5;
          transition: transform 0.15s ease;
          z-index: 2147483645;
        }
        .sugam-floating-badge:hover, .sugam-floating-badge:focus-visible {
          transform: translateY(-2px);
          outline: 3px solid #FAF8F5;
          outline-offset: 2px;
        }
        .sugam-badge-btn {
          background-color: #E7DDF0;
          color: #59366E;
          border: none;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }
        .sugam-badge-btn:hover { background-color: #FFFFFF; }

        /* Floating Form Wizard Launcher Pill (Bottom Left) */
        .sugam-floating-wizard-pill {
          position: fixed;
          bottom: 24px;
          left: 24px;
          background-color: #59366E;
          color: #FAF8F5;
          padding: 12px 20px;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 700;
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          gap: 10px;
          pointer-events: auto;
          cursor: pointer;
          border: 2.5px solid #FAF8F5;
          transition: transform 0.15s ease, background-color 0.15s ease;
          z-index: 2147483645;
        }
        .sugam-floating-wizard-pill:hover, .sugam-floating-wizard-pill:focus-visible {
          transform: translateY(-2px);
          background-color: #432854;
          outline: 3px solid #FAF8F5;
          outline-offset: 2px;
        }
      `;
      this.shadowRoot.appendChild(style);

      (parent || document.documentElement).appendChild(this.shadowHost);
      return this.shadowRoot;
    },

    /**
     * Applies all active helpers based on settings.
     */
    applyAllHelpers() {
      if (!this.isMasterOn || this.isSiteDisabled) return;

      document.documentElement.classList.add('sugam-active');

      // 4.1 Visual Comfort
      if (this.settings.visualComfort?.enabled) {
        this.applyVisualComfort(this.settings.visualComfort);
      }

      // 4.4 Dyslexia Font
      if (this.settings.dyslexiaFont?.enabled) {
        this.applyDyslexiaFont(this.settings.dyslexiaFont);
      }

      // 4.5 Reading Ruler
      if (this.settings.readingRuler?.enabled) {
        this.setupRuler(this.settings.readingRuler);
      }

      // 4.6 Bionic Read
      if (this.settings.bionicRead?.enabled) {
        this.applyBionicRead(this.settings.bionicRead.strength);
      }

      // 4.3 Take Your Time (Countdowns & Form auto-draft)
      if (this.settings.timerFreeze?.enabled) {
        this.setupTimerDetection(this.settings.timerFreeze);
      }

      // 5.3 Scam Safety Guard
      if (this.settings.scamGuard?.enabled) {
        this.runScamGuard();
      }

      // 5.5 Explain this word (selection listener)
      if (this.settings.explainWord?.enabled) {
        this.setupWordExplanation();
      }

      // 4.9 Form Wizard Launcher (if enabled and forms exist)
      if (this.settings.formWizard?.enabled) {
        this.setupFormWizardLauncher();
      }

      // 5.6 Numbers Helper
      if (this.settings.numbersHelper?.enabled) {
        this.setupNumbersHelper(this.settings.numbersHelper);
      }

      // Render floating "SUGAM is on: Turn off" badge
      this.renderFloatingBadge();
    },

    /**
     * Complete teardown: Leaves ZERO trace in DOM or styles.
     */
    teardownAllHelpers() {
      // Remove class from html
      document.documentElement.classList.remove(
        'sugam-active',
        'sugam-text-scaled',
        'sugam-left-align',
        'sugam-limit-width',
        'sugam-enhanced-links',
        'sugam-stop-animations',
        'sugam-hide-popups',
        'sugam-theme-cream',
        'sugam-theme-blue',
        'sugam-theme-grey',
        'sugam-theme-dark',
        'sugam-theme-high-contrast'
      );

      // Reset CSS custom variables
      document.documentElement.style.removeProperty('--sugam-font-family');
      document.documentElement.style.removeProperty('--sugam-font-size-scale');
      document.documentElement.style.removeProperty('--sugam-line-height');
      document.documentElement.style.removeProperty('--sugam-letter-spacing');
      document.documentElement.style.removeProperty('--sugam-word-spacing');
      document.documentElement.style.removeProperty('--sugam-max-width');
      // Removing SUGAM's classes and variables can leave empty class="" / style="" behind.
      const html = document.documentElement;
      if (!this.siteHadHtmlClass && !html.getAttribute('class')) html.removeAttribute('class');
      if (!this.siteHadHtmlStyle && !html.getAttribute('style')) html.removeAttribute('style');

      // Teardown Reading Ruler
      this.teardownRuler();

      // Teardown Bionic reading (restore original DOM text)
      this.teardownBionicRead();

      // Teardown Speech synthesis
      this.teardownReadAloud();

      // Teardown Timer detection & unpause main world
      this.teardownTimerDetection();

      // Restore hidden distractions
      this.restoreHiddenDistractions();

      // Teardown Form Wizard & launcher
      this.teardownFormWizard();

      // Teardown Numbers Helper (restore original DOM text)
      this.teardownNumbersHelper();

      // Remove Calm overlay if open
      this.dismissCalmMoment();

      // Completely remove shadow root container from page
      if (this.shadowHost) {
        this.shadowHost.remove();
        this.shadowHost = null;
        this.shadowRoot = null;
      }

      // Remove speech highlights
      document.querySelectorAll('.sugam-speech-sentence-highlight, .sugam-speech-word-highlight').forEach((el) => {
        el.classList.remove('sugam-speech-sentence-highlight', 'sugam-speech-word-highlight');
      });
    },

    /**
     * Floating "SUGAM is on: Turn off" badge
     */
    renderFloatingBadge() {
      const shadow = this.ensureShadowHost();
      if (shadow.querySelector('#sugam-float-pill')) return;

      const badge = document.createElement('div');
      badge.id = 'sugam-float-pill';
      badge.className = 'sugam-floating-badge pointer-all';
      badge.setAttribute('role', 'status');
      badge.innerHTML = `
        <span>SUGAM is on</span>
        <button class="sugam-badge-btn" id="sugam-float-turnoff">Turn off</button>
      `;

      shadow.appendChild(badge);

      badge.querySelector('#sugam-float-turnoff').addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMasterSwitch(false);
      });
    },

    extractMainContent() {
      const article = document.querySelector('article, main, .post-content, #content');
      const container = article || document.body;
      return container.innerText.slice(0, 10000);
    },

    announceToScreenReader(message) {
      const shadow = this.ensureShadowHost();
      let live = shadow.querySelector('#sugam-live-announcer');
      if (!live) {
        live = document.createElement('div');
        live.id = 'sugam-live-announcer';
        live.setAttribute('aria-live', 'polite');
        live.style.cssText = 'position:absolute; width:1px; height:1px; clip:rect(0,0,0,0); overflow:hidden;';
        shadow.appendChild(live);
      }
      live.textContent = message;
    }
  };

  // Feature methods live in content/features/*.js (loaded before this file); mix them in.
  Object.values(globalThis.SugamFeatures || {}).forEach((feature) => Object.assign(SugamEngine, feature));

  // Start engine
  SugamEngine.init();
})();
