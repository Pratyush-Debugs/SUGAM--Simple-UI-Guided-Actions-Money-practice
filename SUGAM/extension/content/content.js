/**
 * SUGAM - Content Script Engine
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

  // Sensitive page detector (embedded inline to ensure independence)
  const SENSITIVE_DOMAINS = [
    'onlinesbi.sbi', 'sbi.co.in', 'hdfcbank.com', 'icicibank.com', 'axisbank.com',
    'kotak.com', 'pnbindia.in', 'bankofbaroda.in', 'canarabank.com', 'unionbankofindia.co.in',
    'paytm.com', 'phonepe.com', 'pay.google.com', 'bhimupi.org.in', 'razorpay.com',
    'billdesk.com', 'ccavenue.com', 'incometax.gov.in', 'uidai.gov.in'
  ];

  function isPageSensitive() {
    try {
      const host = window.location.hostname.toLowerCase();
      if (SENSITIVE_DOMAINS.some(d => host === d || host.endsWith('.' + d))) return true;
      if (document.querySelector('input[type="password"]')) return true;
      const inputs = document.querySelectorAll('input');
      for (const input of inputs) {
        const check = (input.name + ' ' + input.id + ' ' + (input.getAttribute('autocomplete') || '')).toLowerCase();
        if (/otp|one-time|cvv|pin|cardnumber|passwd/.test(check)) return true;
      }
    } catch (e) {
      // safe fallback
    }
    return false;
  }

  function isFieldSensitive(input) {
    if (!input) return false;
    const type = (input.type || '').toLowerCase();
    if (type === 'password') return true;
    const check = [input.name, input.id, input.placeholder, input.getAttribute('aria-label') || '', input.getAttribute('autocomplete') || ''].join(' ').toLowerCase();
    return /(^|[^a-z])(otp|one-time|pin|cvv|cvc|cardnumber|card-number|secret|security-code)($|[^a-z])/i.test(check);
  }

  // Page-controlled text (labels, placeholders, option text, typed answers) must never be parsed as HTML.
  const esc = (value) => SugamDom.escapeHtml(value);

  // SUGAM Engine State
  const SugamEngine = {
    settings: null,
    isMasterOn: false,
    isSiteDisabled: false,
    activeHelpers: new Set(),
    shadowHost: null,
    shadowRoot: null,
    bionicRecords: [], // { wrapper, original } pairs so Bionic Read can be undone losslessly
    speechSynthesisUtterance: null,
    isReadingAloud: false,
    readingRulerElem: null,
    calmOverlayElem: null,
    countdownInterval: null,
    hiddenDistractions: [],

    async init() {
      // Check if site is disabled in sync storage
      const res = await this.getStorageData(['sugamSettings']);
      this.settings = res?.sugamSettings || {};
      
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
        console.warn("Storage sync failed", e);
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
      const nextState = (typeof forceValue === 'boolean') ? forceValue : !this.isMasterOn;
      this.isMasterOn = nextState;
      this.settings.masterSwitch = nextState;
      this.saveStorageSettings(this.settings);

      if (this.isMasterOn) {
        this.applyAllHelpers();
        this.announceToScreenReader("SUGAM helpers turned on");
      } else {
        this.teardownAllHelpers();
        this.announceToScreenReader("SUGAM helpers off");
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
        this.announceToScreenReader("SUGAM disabled for this site");
      } else if (this.isMasterOn) {
        this.applyAllHelpers();
        this.announceToScreenReader("SUGAM re-enabled for this site");
      }
    },

    /**
     * Initializes the Shadow DOM container for all SUGAM UI overlays
     * so page styles cannot conflict with SUGAM.
     */
    ensureShadowHost() {
      if (this.shadowHost && document.body.contains(this.shadowHost)) {
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

      document.body.appendChild(this.shadowHost);
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

      // Remove Calm overlay if open
      this.dismissCalmMoment();

      // Completely remove shadow root container from page
      if (this.shadowHost) {
        this.shadowHost.remove();
        this.shadowHost = null;
        this.shadowRoot = null;
      }

      // Remove speech highlights
      document.querySelectorAll('.sugam-speech-sentence-highlight, .sugam-speech-word-highlight').forEach(el => {
        el.classList.remove('sugam-speech-sentence-highlight', 'sugam-speech-word-highlight');
      });
    },

    /**
     * 4.1 Visual Comfort Mode
     */
    applyVisualComfort(vc) {
      const root = document.documentElement;

      if (vc.textSize && vc.textSize !== 100) {
        root.classList.add('sugam-text-scaled');
        root.style.setProperty('--sugam-font-size-scale', (vc.textSize / 100).toString());
      }
      if (vc.lineSpacing) {
        root.style.setProperty('--sugam-line-height', vc.lineSpacing.toString());
      }
      if (vc.letterSpacing) {
        root.style.setProperty('--sugam-letter-spacing', `${vc.letterSpacing}em`);
      }
      if (vc.wordSpacing) {
        root.style.setProperty('--sugam-word-spacing', `${vc.wordSpacing}em`);
      }
      if (vc.leftAlign) {
        root.classList.add('sugam-left-align');
      }
      if (vc.maxLineLength) {
        root.classList.add('sugam-limit-width');
        root.style.setProperty('--sugam-max-width', `${vc.maxLineLength}ch`);
      }

      // Link visibility & focus
      root.classList.add('sugam-enhanced-links');

      // Theme
      if (vc.colorTheme && vc.colorTheme !== 'default') {
        root.classList.add(`sugam-theme-${vc.colorTheme}`);
      }

      // Stop animations
      if (vc.stopAnimations) {
        root.classList.add('sugam-stop-animations');
      }

      // Pause audio & video
      if (vc.pauseMedia) {
        document.querySelectorAll('video, audio').forEach(media => {
          try { media.pause(); } catch { /* some media elements refuse to pause */ }
        });
      }

      // Hide popups & floating banners (with restore note)
      if (vc.hidePopups) {
        root.classList.add('sugam-hide-popups');
        this.hideDistractions();
      }
    },

    hideDistractions() {
      // Find fixed overlays, cookie banners, chat widgets
      const selectors = [
        '[class*="cookie"]', '[id*="cookie"]',
        '[class*="newsletter"]', '[id*="newsletter"]',
        '[class*="intercom"]', '[id*="intercom"]',
        '[class*="chat-widget"]', '[id*="chat-widget"]'
      ];
      document.querySelectorAll(selectors.join(',')).forEach(el => {
        if (el.id !== 'sugam-root' && !el.classList.contains('sugam-hidden-distraction')) {
          el.classList.add('sugam-hidden-distraction');
          this.hiddenDistractions.push(el);
        }
      });
    },

    restoreHiddenDistractions() {
      this.hiddenDistractions.forEach(el => {
        el.classList.remove('sugam-hidden-distraction');
      });
      this.hiddenDistractions = [];
    },

    /**
     * 4.4 Dyslexia-Friendly Font
     */
    applyDyslexiaFont(df) {
      let fontStack = '"SUGAM Lexend", Lexend, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      if (df.fontFamily === 'Atkinson') {
        fontStack = '"SUGAM Atkinson Hyperlegible", "Atkinson Hyperlegible", "SUGAM Lexend", sans-serif';
      } else if (df.fontFamily === 'OpenDyslexic') {
        fontStack = '"SUGAM OpenDyslexic", OpenDyslexic, "SUGAM Lexend", sans-serif';
      } else if (df.fontFamily === 'System') {
        fontStack = 'Arial, Verdana, sans-serif';
      }

      // Fallback for Devanagari and Odia scripts
      fontStack += ', "SUGAM Noto Sans Devanagari", "Noto Sans Devanagari", "SUGAM Noto Sans Odia", "Noto Sans Odia", sans-serif';
      document.documentElement.style.setProperty('--sugam-font-family', fontStack);

      if (df.applySpacing) {
        document.documentElement.style.setProperty('--sugam-line-height', '1.8');
        document.documentElement.style.setProperty('--sugam-letter-spacing', '0.06em');
        document.documentElement.style.setProperty('--sugam-word-spacing', '0.12em');
      }
    },

    /**
     * 4.5 Reading Ruler
     */
    setupRuler(options) {
      this.teardownRuler();

      const shadow = this.ensureShadowHost();
      const ruler = document.createElement('div');
      ruler.id = 'sugam-ruler-container';
      ruler.setAttribute('aria-hidden', 'true');
      ruler.innerHTML = `
        <style>
          #sugam-ruler-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 2147483640;
          }
          #sugam-ruler-top, #sugam-ruler-bottom {
            position: absolute;
            left: 0;
            width: 100vw;
            background: rgba(41, 37, 45, ${options.dimmingStrength || 0.45});
            pointer-events: none;
            transition: height 0.04s linear;
          }
          #sugam-ruler-top { top: 0; }
          #sugam-ruler-bottom { bottom: 0; }
          #sugam-ruler-guide {
            position: absolute;
            left: 0;
            width: 100vw;
            height: ${options.height || 70}px;
            background: ${options.tintColor || 'rgba(231, 221, 240, 0.4)'};
            border-top: 2px solid #59366E;
            border-bottom: 2px solid #59366E;
            pointer-events: none;
            box-shadow: 0 0 12px rgba(89, 54, 110, 0.3);
          }
        </style>
        <div id="sugam-ruler-top"></div>
        <div id="sugam-ruler-guide"></div>
        <div id="sugam-ruler-bottom"></div>
      `;

      shadow.appendChild(ruler);
      this.readingRulerElem = ruler;

      const topDim = ruler.querySelector('#sugam-ruler-top');
      const guide = ruler.querySelector('#sugam-ruler-guide');
      const botDim = ruler.querySelector('#sugam-ruler-bottom');
      const rHeight = options.height || 70;

      const updatePosition = (clientY) => {
        const topH = Math.max(0, clientY - (rHeight / 2));
        topDim.style.height = `${topH}px`;
        guide.style.top = `${topH}px`;
        const botH = Math.max(0, window.innerHeight - topH - rHeight);
        botDim.style.height = `${botH}px`;
      };

      this._rulerMoveHandler = (e) => updatePosition(e.clientY);
      window.addEventListener('mousemove', this._rulerMoveHandler, { passive: true });
      updatePosition(window.innerHeight / 3);
    },

    teardownRuler() {
      if (this._rulerMoveHandler) {
        window.removeEventListener('mousemove', this._rulerMoveHandler);
        this._rulerMoveHandler = null;
      }
      if (this.readingRulerElem) {
        this.readingRulerElem.remove();
        this.readingRulerElem = null;
      }
    },

    /**
     * 4.6 Bionic Read
     */
    applyBionicRead(strength = 'medium') {
      this.teardownBionicRead();
      this.bionicRecords = SugamBionic.apply(document.body, SugamBionic.ratioFor(strength));
    },

    teardownBionicRead() {
      SugamBionic.restore(this.bionicRecords);
    },

    /**
     * 4.3 Take Your Time (Timer Freeze & Calm Button)
     */
    setupTimerDetection(options) {
      this.teardownTimerDetection();

      // Level 1: Detect visible timers
      this.countdownInterval = setInterval(() => {
        this.scanForTimers();
      }, 3000);
      this.scanForTimers();

      // Form auto-save (non-sensitive fields only)
      if (options.autoSaveForms && !isPageSensitive()) {
        this.setupFormAutoDraft();
      }

      // Level 2: Opt-in client-side timer pause for non-financial pages
      if (options.level === 2 && !isPageSensitive()) {
        this.injectLevel2TimerPause();
      }
    },

    scanForTimers() {
      if (isPageSensitive()) return; // Never intervene on financial timers

      const timerElems = document.querySelectorAll('[role="timer"], [class*="countdown"], [id*="countdown"], [class*="timer"], [id*="timer"]');
      let foundCountdown = null;

      for (const el of timerElems) {
        const text = el.textContent || '';
        const match = text.match(/\b([0-5]?\d):([0-5]\d)\b/);
        if (match) {
          foundCountdown = {
            minutes: parseInt(match[1], 10),
            seconds: parseInt(match[2], 10),
            element: el
          };
          break;
        }
      }

      if (foundCountdown && !this.timerBannerElem) {
        this.renderTimerBanner(foundCountdown);
      }
    },

    renderTimerBanner(countdown) {
      const shadow = this.ensureShadowHost();
      const banner = document.createElement('div');
      banner.className = 'sugam-timer-banner pointer-all';
      banner.innerHTML = `
        <style>
          .sugam-timer-banner {
            position: fixed;
            top: 16px;
            right: 16px;
            background-color: #FAF8F5;
            color: #29252D;
            border: 2px solid #59366E;
            border-radius: 12px;
            padding: 14px 18px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.18);
            max-width: 320px;
            z-index: 2147483645;
            font-size: 14px;
            line-height: 1.5;
          }
          .sugam-tb-title { font-weight: 700; color: #59366E; display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
          .sugam-tb-btn {
            margin-top: 8px;
            background-color: #59366E;
            color: #FAF8F5;
            border: none;
            padding: 6px 14px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
          }
        </style>
        <div class="sugam-tb-title">
          <span>⏳</span> Take Your Time
        </div>
        <div>You have about <b>${countdown.minutes} minutes</b> left on this page. Take your time.</div>
        <button class="sugam-tb-btn" id="sugam-calm-btn">I need a moment</button>
      `;

      shadow.appendChild(banner);
      this.timerBannerElem = banner;

      banner.querySelector('#sugam-calm-btn').addEventListener('click', () => {
        this.triggerCalmMoment();
      });
    },

    injectLevel2TimerPause() {
      try {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('content/timer-pause-mainworld.js');
        script.id = 'sugam-timer-script';
        (document.head || document.documentElement).appendChild(script);
        window.postMessage({ source: 'SUGAM_CONTENT_SCRIPT', action: 'PAUSE_TIMERS' }, '*');
      } catch (e) {
        console.warn("Main world pause failed", e);
      }
    },

    teardownTimerDetection() {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
      if (this.timerBannerElem) {
        this.timerBannerElem.remove();
        this.timerBannerElem = null;
      }
      window.postMessage({ source: 'SUGAM_CONTENT_SCRIPT', action: 'RESTORE_NATIVE_TIMERS' }, '*');
      const script = document.getElementById('sugam-timer-script');
      if (script) script.remove();
    },

    /**
     * Calm Moment: "I need a moment" full-page reassurance
     */
    triggerCalmMoment() {
      if (this.calmOverlayElem) return;

      const shadow = this.ensureShadowHost();
      const overlay = document.createElement('div');
      overlay.className = 'sugam-calm-overlay pointer-all';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Calm moment: You are safe');

      const trustedName = this.settings.trustedPerson?.name || 'Helper';
      const trustedPhone = this.settings.trustedPerson?.phone || '1930';

      overlay.innerHTML = `
        <style>
          .sugam-calm-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(41, 37, 45, 0.88);
            backdrop-filter: blur(8px);
            z-index: 2147483647;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FAF8F5;
            padding: 24px;
          }
          .sugam-calm-card {
            background: #FAF8F5;
            color: #29252D;
            border-radius: 20px;
            padding: 36px 32px;
            max-width: 520px;
            width: 100%;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.4);
            border: 3px solid #59366E;
          }
          .sugam-calm-title {
            font-size: 26px;
            font-weight: 800;
            color: #59366E;
            margin-bottom: 8px;
          }
          .sugam-calm-sub {
            font-size: 18px;
            margin-bottom: 24px;
            line-height: 1.5;
            color: #29252D;
          }
          .sugam-breathing-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: #E7DDF0;
            border: 4px solid #59366E;
            margin: 0 auto 20px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: 700;
            color: #59366E;
            animation: sugamBreathe 8s ease-in-out infinite;
          }
          @keyframes sugamBreathe {
            0%, 100% { transform: scale(0.9); }
            50% { transform: scale(1.15); background: #F3EDF7; }
          }
          @media (prefers-reduced-motion: reduce) {
            .sugam-breathing-circle { animation: none !important; }
          }
          .sugam-calm-actions {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 24px;
          }
          .sugam-btn-primary {
            background: #59366E;
            color: #FAF8F5;
            border: none;
            padding: 14px 20px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            min-height: 48px;
          }
          .sugam-btn-secondary {
            background: #E7DDF0;
            color: #59366E;
            border: 2px solid #59366E;
            padding: 12px 20px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            min-height: 48px;
          }
          .sugam-btn-primary:focus-visible, .sugam-btn-secondary:focus-visible {
            outline: 3px solid #59366E;
            outline-offset: 3px;
          }
        </style>
        <div class="sugam-calm-card">
          <div class="sugam-calm-title">You are safe.</div>
          <div class="sugam-calm-sub">Nothing has been sent. Take all the time you need.</div>
          <div class="sugam-breathing-circle" aria-label="Breathe gently">Breathe</div>
          <div class="sugam-calm-actions">
            <button class="sugam-btn-primary" id="sugam-resume-btn">I am ready to continue</button>
            <a href="tel:${esc(trustedPhone)}" class="sugam-btn-secondary" style="text-decoration:none; display:flex; align-items:center; justify-content:center;">
              📞 Call ${esc(trustedName)} (${esc(trustedPhone)})
            </a>
            <a href="tel:1930" class="sugam-btn-secondary" style="text-decoration:none; display:flex; align-items:center; justify-content:center;">
              🛡️ Call 1930 Cyber Helpline
            </a>
          </div>
        </div>
      `;

      shadow.appendChild(overlay);
      this.calmOverlayElem = overlay;

      overlay.querySelector('#sugam-resume-btn').addEventListener('click', () => {
        this.dismissCalmMoment();
      });
    },

    dismissCalmMoment() {
      if (this.calmOverlayElem) {
        this.calmOverlayElem.remove();
        this.calmOverlayElem = null;
      }
    },

    /**
     * Form Draft Auto-Save (Strictly excludes sensitive fields)
     */
    setupFormAutoDraft() {
      const pageKey = 'sugam_draft_' + window.location.pathname;
      // Restore previous draft if present
      chrome.storage.local.get([pageKey], (res) => {
        if (res && res[pageKey]) {
          const draft = res[pageKey];
          Object.entries(draft).forEach(([name, val]) => {
            const input = document.querySelector(`input[name="${CSS.escape(name)}"], textarea[name="${CSS.escape(name)}"]`);
            if (input && !isFieldSensitive(input) && !input.value) {
              input.value = val;
            }
          });
        }
      });

      // Save on input
      document.addEventListener('input', (e) => {
        const target = e.target;
        if (!target || !target.name) return;
        if (isFieldSensitive(target)) return; // NEVER SAVE SENSITIVE VALUES!

        chrome.storage.local.get([pageKey], (res) => {
          const currentDraft = res?.[pageKey] || {};
          currentDraft[target.name] = target.value;
          chrome.storage.local.set({ [pageKey]: currentDraft });
        });
      }, { passive: true });
    },

    /**
     * 4.8 Read Aloud (Web Speech API)
     */
    toggleReadAloud(mode = 'main') {
      if (this.isReadingAloud) {
        this.teardownReadAloud();
        return;
      }

      const text = this.extractMainContent();
      if (!text) return;

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.settings.readAloud?.rate || 0.9;
      utterance.pitch = this.settings.readAloud?.pitch || 1.0;

      // Indian rupee amounts converted to words for speech
      utterance.text = text.replace(/₹\s*(\d+)/g, '$1 rupees');

      utterance.onend = () => {
        this.isReadingAloud = false;
        this.teardownReadAloud();
      };

      utterance.onerror = () => {
        this.isReadingAloud = false;
        this.teardownReadAloud();
      };

      window.speechSynthesis.speak(utterance);
      this.isReadingAloud = true;
      this.announceToScreenReader("Reading aloud started");
    },

    teardownReadAloud() {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      this.isReadingAloud = false;
    },

    /**
     * 4.9 Form Wizard
     * Converts complex forms into "One question per page" steps.
     * Follows GOV.UK practice and COGA error-prevention guidelines:
     * - Start screen: "What you will need"
     * - Step-by-step questions with progress bar and dictation support
     * - Friendly, specific errors ("needs 10 digits, you typed 9")
     * - Check your answers review screen with Change links
     * - Handoff sets native values; SUGAM NEVER submits forms!
     */
    detectFormFields() {
      const candidates = [];
      const forms = document.querySelectorAll('form, [role="form"]');
      if (forms.length > 0) {
        forms.forEach(f => {
          const els = f.querySelectorAll('input, textarea, select');
          els.forEach(el => candidates.push(el));
        });
      }
      if (candidates.length === 0) {
        const standalone = document.querySelectorAll('input, textarea, select');
        standalone.forEach(el => candidates.push(el));
      }

      // Filter out hidden, submit, button, reset, image
      const valid = candidates.filter(el => {
        const tag = (el.tagName || '').toLowerCase();
        const type = (el.type || 'text').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea' && tag !== 'select') return false;
        if (type === 'hidden' || type === 'submit' || type === 'button' || type === 'reset' || type === 'image') return false;
        if (el.disabled || el.readOnly) return false;

        // Skip non-visible elements
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
        return true;
      });

      return Array.from(new Set(valid));
    },

    setupFormWizardLauncher() {
      this.teardownFormWizardLauncher();
      const fields = this.detectFormFields();
      if (fields.length === 0) return;

      const shadow = this.ensureShadowHost();
      const launcherPill = document.createElement('div');
      launcherPill.id = 'sugam-wz-pill';
      launcherPill.className = 'sugam-floating-wizard-pill pointer-all';
      launcherPill.setAttribute('role', 'button');
      launcherPill.setAttribute('tabindex', '0');
      launcherPill.setAttribute('aria-label', 'Open Form Wizard: Answer questions one at a time');
      launcherPill.innerHTML = `
        <span style="font-size: 18px;" aria-hidden="true">📝</span>
        <span>Form Wizard (${fields.length} questions)</span>
      `;

      launcherPill.addEventListener('click', () => {
        this.openFormWizard();
      });

      launcherPill.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openFormWizard();
        }
      });

      shadow.appendChild(launcherPill);
      this.formWizardPillElem = launcherPill;
    },

    teardownFormWizardLauncher() {
      if (this.formWizardPillElem) {
        this.formWizardPillElem.remove();
        this.formWizardPillElem = null;
      }
    },

    teardownFormWizard() {
      this.teardownFormWizardLauncher();
      if (this.wizardModalElem) {
        this.wizardModalElem.remove();
        this.wizardModalElem = null;
      }
    },

    openFormWizard() {
      const elements = this.detectFormFields();

      if (elements.length === 0) {
        // Show friendly notification card instead of a harsh alert
        const shadow = this.ensureShadowHost();
        const notice = document.createElement('div');
        notice.className = 'sugam-timer-banner pointer-all';
        notice.style.top = '24px';
        notice.style.left = '50%';
        notice.style.right = 'auto';
        notice.style.transform = 'translateX(-50%)';
        notice.innerHTML = `
          <div class="sugam-tb-title"><span>📝</span> Form Wizard</div>
          <div>No form fields were found on this page. Navigate to an application or registration page to use the wizard.</div>
          <button class="sugam-tb-btn" id="sugam-notice-close">Close</button>
        `;
        shadow.appendChild(notice);
        notice.querySelector('#sugam-notice-close').addEventListener('click', () => notice.remove());
        setTimeout(() => notice.remove(), 4000);
        return;
      }

      if (this.wizardModalElem) {
        this.wizardModalElem.remove();
      }

      const shadow = this.ensureShadowHost();
      let currentStep = -1; // -1: "What you will need" start screen; 0..N-1: Questions; N: Review screen
      const wizardData = {};

      // Restore saved draft for this page if available
      const draftKey = 'sugam_wz_draft_' + window.location.pathname;
      try {
        chrome.storage.local.get([draftKey], (res) => {
          if (res?.[draftKey]) {
            Object.assign(wizardData, res[draftKey]);
          }
        });
      } catch { /* storage unavailable: start without a saved draft */ }

      // Pre-populate with any current values from the real inputs
      elements.forEach((el, idx) => {
        if (!isFieldSensitive(el) && el.value && wizardData[idx] === undefined) {
          wizardData[idx] = el.value;
        }
      });

      const container = document.createElement('div');
      container.id = 'sugam-wizard-modal';
      container.className = 'sugam-wizard-modal pointer-all';
      container.setAttribute('role', 'dialog');
      container.setAttribute('aria-modal', 'true');
      container.setAttribute('aria-label', 'Form Wizard');
      container.innerHTML = `
        <style>
          .sugam-wizard-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(41, 37, 45, 0.8);
            backdrop-filter: blur(5px);
            z-index: 2147483647;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .sugam-wz-card {
            background: #FAF8F5;
            color: #29252D;
            border-radius: 20px;
            padding: 32px;
            max-width: 600px;
            width: 100%;
            border: 3.5px solid #59366E;
            box-shadow: 0 16px 40px rgba(0,0,0,0.35);
            display: flex;
            flex-direction: column;
            max-height: 90vh;
            overflow-y: auto;
          }
          .sugam-wz-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }
          .sugam-wz-step {
            font-size: 14px;
            font-weight: 800;
            color: #59366E;
            background: #E7DDF0;
            padding: 6px 14px;
            border-radius: 999px;
          }
          .sugam-progress-bar {
            width: 100%;
            height: 8px;
            background: #E7DDF0;
            border-radius: 999px;
            overflow: hidden;
            margin-bottom: 24px;
          }
          .sugam-progress-fill {
            height: 100%;
            background: #59366E;
            transition: width 0.3s ease;
          }
          .sugam-wz-label {
            font-size: 22px;
            font-weight: 800;
            color: #29252D;
            margin-bottom: 8px;
            display: block;
            line-height: 1.3;
          }
          .sugam-wz-hint {
            font-size: 15px;
            color: #555;
            margin-bottom: 16px;
          }
          .sugam-input-row {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-bottom: 8px;
          }
          .sugam-wz-input, .sugam-wz-select, .sugam-wz-textarea {
            width: 100%;
            padding: 14px 16px;
            border: 2.5px solid #59366E;
            border-radius: 12px;
            font-size: 18px;
            color: #29252D;
            background: #FFFFFF;
            min-height: 52px;
            font-family: inherit;
          }
          .sugam-wz-input:focus, .sugam-wz-select:focus, .sugam-wz-textarea:focus {
            outline: 3px solid #59366E;
            outline-offset: 2px;
          }
          .sugam-mic-btn {
            background: #E7DDF0;
            color: #59366E;
            border: 2px solid #59366E;
            border-radius: 12px;
            padding: 12px 16px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            min-height: 52px;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .sugam-mic-btn:hover { background: #FAF8F5; }
          .sugam-val-hint {
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 16px;
            min-height: 20px;
          }
          .sugam-val-hint.error { color: #C62828; }
          .sugam-val-hint.ok { color: #2E7D32; }
          .sugam-wz-btns {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-top: 24px;
            border-top: 1.5px solid #E7DDF0;
            padding-top: 20px;
          }
          .sugam-wz-btn {
            padding: 14px 22px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 16px;
            cursor: pointer;
            min-height: 48px;
          }
          .sugam-wz-btn-primary { background: #59366E; color: #FAF8F5; border: none; }
          .sugam-wz-btn-primary:hover { background: #432854; }
          .sugam-wz-btn-secondary { background: #E7DDF0; color: #59366E; border: 2px solid #59366E; }
          .sugam-wz-btn-link { background: transparent; border: none; color: #666; font-size: 14px; text-decoration: underline; cursor: pointer; padding: 8px; }
          .sugam-wz-btn-link:hover { color: #59366E; }
          .sugam-review-list {
            max-height: 320px;
            overflow-y: auto;
            margin-bottom: 20px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .sugam-review-item {
            background: #FFFFFF;
            border: 1.5px solid #E7DDF0;
            border-radius: 10px;
            padding: 12px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
          }
          .sugam-review-item strong { color: #59366E; font-size: 15px; }
          .sugam-review-item span { color: #29252D; font-size: 15px; }
          .sugam-btn-change {
            background: #E7DDF0;
            color: #59366E;
            border: 1.5px solid #59366E;
            border-radius: 8px;
            padding: 6px 14px;
            font-weight: 700;
            font-size: 13px;
            cursor: pointer;
          }
        </style>
        <div class="sugam-wz-card">
          <div class="sugam-wz-header">
            <span class="sugam-wz-step" id="sugam-wz-step-num">What you will need</span>
            <button class="sugam-badge-btn" id="sugam-wz-close" aria-label="Close wizard">✕ Close</button>
          </div>
          <div class="sugam-progress-bar" id="sugam-progress-bar">
            <div class="sugam-progress-fill" id="sugam-progress-fill" style="width: 0%;"></div>
          </div>
          <div id="sugam-wz-body"></div>
          <div class="sugam-wz-btns" id="sugam-wz-btns"></div>
        </div>
      `;

      shadow.appendChild(container);
      this.wizardModalElem = container;

      // Close handler
      container.querySelector('#sugam-wz-close').addEventListener('click', () => {
        container.remove();
        this.wizardModalElem = null;
      });

      // Field validation helper
      const validateCurrentField = (el, val) => {
        const type = (el.type || 'text').toLowerCase();
        const pattern = el.getAttribute('pattern') || '';
        const value = (val || '').trim();

        if (el.required && !value) {
          return { ok: false, msg: "⚠️ Please answer this question to continue." };
        }

        if (type === 'tel' || pattern.includes('[0-9]{10}') || /phone|mobile/i.test(el.name + ' ' + el.id)) {
          const digits = value.replace(/\D/g, '');
          if (value && digits.length < 10) {
            const diff = 10 - digits.length;
            return { ok: false, msg: `⚠️ Your phone number needs 10 digits. You typed ${digits.length}. Please add ${diff} more.` };
          }
        }

        if (type === 'email' || /email/i.test(el.name + ' ' + el.id)) {
          if (value && (!value.includes('@') || !value.includes('.'))) {
            return { ok: false, msg: "⚠️ Please enter an email address with an @ and domain (e.g. name@example.com)." };
          }
        }

        if (/pincode|postal|zip/i.test(el.name + ' ' + el.id)) {
          const digits = value.replace(/\D/g, '');
          if (value && digits.length < 6) {
            return { ok: false, msg: `⚠️ Pincode needs 6 digits. You typed ${digits.length}. Add ${6 - digits.length} more.` };
          }
        }

        return { ok: true, msg: "" };
      };

      // Speech recognition handler
      const startDictation = (inputElem, micBtn) => {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
          alert("Speech dictation is not available in this browser window.");
          return;
        }
        try {
          const recognition = new SpeechRec();
          recognition.lang = this.settings.language === 'hi' ? 'hi-IN' : (this.settings.language === 'or' ? 'or-IN' : 'en-IN');
          recognition.continuous = false;
          recognition.interimResults = false;

          micBtn.textContent = '🔴 Listening...';
          micBtn.style.backgroundColor = '#FFEBEE';
          micBtn.style.color = '#C62828';

          recognition.onresult = (evt) => {
            const speechText = evt.results[0][0].transcript;
            inputElem.value = (inputElem.value ? inputElem.value + ' ' : '') + speechText;
            inputElem.dispatchEvent(new Event('input', { bubbles: true }));
          };
          recognition.onerror = () => {
            micBtn.textContent = '🎙️ Dictate';
            micBtn.style.backgroundColor = '';
            micBtn.style.color = '';
          };
          recognition.onend = () => {
            micBtn.textContent = '🎙️ Dictate';
            micBtn.style.backgroundColor = '';
            micBtn.style.color = '';
          };
          recognition.start();
        } catch (e) {
          console.warn("Speech recognition error", e);
        }
      };

      // Main Step Renderer
      const renderCurrentScreen = () => {
        const body = container.querySelector('#sugam-wz-body');
        const stepNum = container.querySelector('#sugam-wz-step-num');
        const progressFill = container.querySelector('#sugam-progress-fill');
        const footerBtns = container.querySelector('#sugam-wz-btns');

        // SCREEN 1: "What you will need" (Spec 4.9.2)
        if (currentStep === -1) {
          stepNum.textContent = "Start: What you will need";
          progressFill.style.width = '5%';

          const requiredItems = elements.filter(el => el.required || isFieldSensitive(el));
          let reqListHtml = '';
          if (requiredItems.length > 0) {
            reqListHtml = `
              <div style="background:#E7DDF0; border-radius:12px; padding:16px; margin:16px 0;">
                <strong style="color:#59366E; font-size:16px; display:block; margin-bottom:8px;">Items you will need for this form:</strong>
                <ul style="padding-left:20px; line-height:1.6; font-size:15px;">
                  ${requiredItems.map(el => `<li>${esc(this.getFieldLabel(el))}</li>`).join('')}
                </ul>
              </div>
            `;
          }

          body.innerHTML = `
            <h2 class="sugam-wz-label">Welcome to Form Wizard</h2>
            <p class="sugam-wz-hint">
              This webpage has <b>${elements.length} questions</b>. We will show you <b>one question at a time</b> in large, friendly text so you can complete it comfortably.
            </p>
            ${reqListHtml}
            <div style="font-size:14px; color:#59366E; margin-top:8px;">
              🛡️ <b>SUGAM Promise:</b> SUGAM will help you fill the answers, but <b>SUGAM never submits forms</b>. You will review and tap submit on the website yourself.
            </div>
          `;

          footerBtns.innerHTML = `
            <button class="sugam-wz-btn-link" id="wz-act-cancel">Cancel</button>
            <button class="sugam-wz-btn sugam-wz-btn-primary" id="wz-act-start">Start Question 1 →</button>
          `;

          container.querySelector('#wz-act-start').addEventListener('click', () => {
            currentStep = 0;
            renderCurrentScreen();
          });
          container.querySelector('#wz-act-cancel').addEventListener('click', () => {
            container.remove();
            this.wizardModalElem = null;
          });
          return;
        }

        // SCREEN 3: Review Screen - "Check your answers" (Spec 4.9.6)
        if (currentStep >= elements.length) {
          stepNum.textContent = "Check your answers";
          progressFill.style.width = '100%';

          let reviewItemsHtml = '';
          elements.forEach((el, idx) => {
            const label = this.getFieldLabel(el);
            const isSensitive = isFieldSensitive(el);
            const val = isSensitive
              ? '🔒 (Private - Enter on website)'
              : (wizardData[idx] ? esc(wizardData[idx]) : '<em>(Not answered)</em>');

            reviewItemsHtml += `
              <div class="sugam-review-item">
                <div>
                  <strong>${esc(label)}</strong>
                  <div style="margin-top:2px;">${val}</div>
                </div>
                ${!isSensitive ? `<button class="sugam-btn-change" data-idx="${idx}">Change</button>` : ''}
              </div>
            `;
          });

          body.innerHTML = `
            <h2 class="sugam-wz-label">Check your answers</h2>
            <p class="sugam-wz-hint">Review your details below. If anything needs changing, tap Change.</p>
            <div class="sugam-review-list">${reviewItemsHtml}</div>
            <div style="background:#FFF3E0; border:1.5px solid #FF9800; border-radius:10px; padding:12px; font-size:14px; color:#29252D;">
              ℹ️ When you tap <b>Fill into form</b>, SUGAM places your answers directly into the website's inputs. <b>SUGAM never submits forms</b>. You will press the website's submit button.
            </div>
          `;

          footerBtns.innerHTML = `
            <button class="sugam-wz-btn sugam-wz-btn-secondary" id="wz-act-back-review">← Back</button>
            <button class="sugam-wz-btn sugam-wz-btn-primary" id="wz-act-fill">Fill into form ✓</button>
          `;

          // Change button handlers
          container.querySelectorAll('.sugam-btn-change').forEach(btn => {
            btn.addEventListener('click', () => {
              currentStep = parseInt(btn.dataset.idx, 10);
              renderCurrentScreen();
            });
          });

          container.querySelector('#wz-act-back-review').addEventListener('click', () => {
            currentStep = elements.length - 1;
            renderCurrentScreen();
          });

          container.querySelector('#wz-act-fill').addEventListener('click', () => {
            // Write values to real page inputs using native setters
            elements.forEach((el, idx) => {
              if (!isFieldSensitive(el) && wizardData[idx] !== undefined) {
                this.setNativeValue(el, wizardData[idx]);
              }
            });

            container.remove();
            this.wizardModalElem = null;

            // Highlight real form on page and scroll to submit
            const realSubmit = document.querySelector('button[type="submit"], input[type="submit"]') || elements[elements.length - 1];
            if (realSubmit) {
              realSubmit.scrollIntoView({ behavior: 'smooth', block: 'center' });
              realSubmit.style.outline = '4px solid #59366E';
              realSubmit.style.outlineOffset = '4px';
              realSubmit.focus();
            }

            // Announcement
            this.announceToScreenReader("Answers written into form. Please review and click submit on the website.");
          });
          return;
        }

        // SCREEN 2: Individual Question Steps (Spec 4.9.3 - 4.9.5)
        const el = elements[currentStep];
        const label = this.getFieldLabel(el);
        const isSensitive = isFieldSensitive(el);
        const tag = (el.tagName || '').toLowerCase();
        const type = (el.type || 'text').toLowerCase();
        const placeholder = el.placeholder || (el.getAttribute('autocomplete') ? `Example for ${el.getAttribute('autocomplete')}` : '');
        const val = wizardData[currentStep] || el.value || '';

        const pct = Math.round(((currentStep + 1) / elements.length) * 100);
        stepNum.textContent = `Step ${currentStep + 1} of ${elements.length}`;
        progressFill.style.width = `${pct}%`;

        let inputWidgetHtml = '';

        if (isSensitive) {
          inputWidgetHtml = `
            <div style="background:#FFF3E0; border:2px solid #E65100; padding:18px; border-radius:12px; margin-bottom:16px;">
              <strong style="color:#BF360C; font-size:16px; display:block; margin-bottom:6px;">🔒 Private Password or PIN</strong>
              <p style="font-size:15px; line-height:1.5;">SUGAM never stores, reads, or touches private passwords, PINs, or OTPs. Please continue through the wizard. When finished, type your password directly into the website's own secure box.</p>
            </div>
          `;
        } else if (tag === 'select') {
          // Replicate select options
          const optionsHtml = Array.from(el.options).map(opt => `
            <option value="${esc(opt.value)}" ${opt.value === val ? 'selected' : ''}>${esc(opt.text)}</option>
          `).join('');
          inputWidgetHtml = `
            <select class="sugam-wz-select" id="sugam-curr-field">${optionsHtml}</select>
          `;
        } else if (tag === 'textarea') {
          inputWidgetHtml = `
            <div class="sugam-input-row">
              <textarea class="sugam-wz-textarea" id="sugam-curr-field" rows="4" placeholder="${esc(placeholder)}">${esc(val)}</textarea>
              <button class="sugam-mic-btn" id="sugam-mic-btn" type="button" aria-label="Dictate answer with voice">🎙️ Dictate</button>
            </div>
          `;
        } else {
          // Standard text, email, tel input
          inputWidgetHtml = `
            <div class="sugam-input-row">
              <input class="sugam-wz-input" id="sugam-curr-field" type="${type === 'password' ? 'text' : type}" placeholder="${esc(placeholder)}" value="${esc(val)}" />
              <button class="sugam-mic-btn" id="sugam-mic-btn" type="button" aria-label="Dictate answer with voice">🎙️ Dictate</button>
            </div>
          `;
        }

        body.innerHTML = `
          <label class="sugam-wz-label" for="sugam-curr-field">${esc(label)} ${el.required ? '<span style="color:#C62828;">*</span>' : ''}</label>
          ${placeholder && !isSensitive ? `<div class="sugam-wz-hint">${esc(placeholder)}</div>` : ''}
          ${inputWidgetHtml}
          <div class="sugam-val-hint" id="sugam-val-hint"></div>
        `;

        footerBtns.innerHTML = `
          <button class="sugam-wz-btn-link" id="wz-act-save-later">Save &amp; finish later</button>
          <div style="display:flex; gap:10px;">
            <button class="sugam-wz-btn sugam-wz-btn-secondary" id="wz-act-prev" ${currentStep === 0 ? 'style="display:none;"' : ''}>← Back</button>
            <button class="sugam-wz-btn sugam-wz-btn-primary" id="wz-act-next">
              ${currentStep === elements.length - 1 ? 'Review answers →' : 'Next Question →'}
            </button>
          </div>
        `;

        // Focus and listen to input
        const currentInput = body.querySelector('#sugam-curr-field');
        const hintEl = body.querySelector('#sugam-val-hint');
        const micBtn = body.querySelector('#sugam-mic-btn');

        if (micBtn && currentInput) {
          micBtn.addEventListener('click', () => startDictation(currentInput, micBtn));
        }

        if (currentInput) {
          setTimeout(() => currentInput.focus(), 50);

          currentInput.addEventListener('input', () => {
            const check = validateCurrentField(el, currentInput.value);
            if (!check.ok) {
              hintEl.textContent = check.msg;
              hintEl.className = 'sugam-val-hint error';
            } else {
              hintEl.textContent = '';
              hintEl.className = 'sugam-val-hint ok';
            }
          });
        }

        // Navigation actions
        container.querySelector('#wz-act-next').addEventListener('click', () => {
          if (currentInput && !isSensitive) {
            const check = validateCurrentField(el, currentInput.value);
            if (!check.ok) {
              hintEl.textContent = check.msg;
              hintEl.className = 'sugam-val-hint error';
              currentInput.focus();
              return;
            }
            wizardData[currentStep] = currentInput.value;
          }
          currentStep++;
          renderCurrentScreen();
        });

        container.querySelector('#wz-act-prev').addEventListener('click', () => {
          if (currentInput && !isSensitive) {
            wizardData[currentStep] = currentInput.value;
          }
          if (currentStep > 0) {
            currentStep--;
            renderCurrentScreen();
          }
        });

        container.querySelector('#wz-act-save-later').addEventListener('click', () => {
          if (currentInput && !isSensitive) {
            wizardData[currentStep] = currentInput.value;
          }
          // Save locally
          try {
            chrome.storage.local.set({ [draftKey]: wizardData });
          } catch { /* storage unavailable: the draft is simply not saved */ }
          container.remove();
          this.wizardModalElem = null;
          alert("Your answers are saved. You can open Form Wizard anytime to continue.");
        });
      };

      // Start by displaying the start screen
      renderCurrentScreen();
    },

    getFieldLabel(el) {
      if (el.labels && el.labels.length > 0) return el.labels[0].textContent.trim();
      const ariaLabel = el.getAttribute('aria-label');
      if (ariaLabel) return ariaLabel.trim();
      if (el.placeholder) return el.placeholder.trim();
      if (el.name) {
        // Clean up camelCase or snake_case name into friendly words
        return el.name.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').trim();
      }
      return 'Question';
    },

    setNativeValue(element, value) {
      if (!element) return;
      const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
      const prototype = Object.getPrototypeOf(element);
      const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

      if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
        prototypeValueSetter.call(element, value);
      } else if (valueSetter) {
        valueSetter.call(element, value);
      } else {
        element.value = value;
      }
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    },

    /**
     * 5.3 Scam Safety Guard
     */
    runScamGuard() {
      const host = window.location.hostname.toLowerCase();
      const bodyText = document.body.innerText.toLowerCase();

      // Lookalike bank domain checks (e.g. sbi-secure.com, hdfc-update.net)
      const isLookalike = /-(secure|login|update|kyc|verify|portal)\./.test(host);
      // Urgent threat scam phrases
      const hasUrgentThreat = /(blocked in 24 hours|account suspended immediately|send pin to receive|lottery winner claim|urgent kyc update)/i.test(bodyText);

      if (isLookalike || hasUrgentThreat) {
        const shadow = this.ensureShadowHost();
        const scamCard = document.createElement('div');
        scamCard.className = 'sugam-scam-alert pointer-all';
        scamCard.innerHTML = `
          <style>
            .sugam-scam-alert {
              position: fixed;
              top: 20px;
              left: 50%;
              transform: translateX(-50%);
              background: #FFF3E0;
              color: #B71C1C;
              border: 3px solid #D32F2F;
              border-radius: 16px;
              padding: 20px 24px;
              max-width: 500px;
              box-shadow: 0 8px 30px rgba(0,0,0,0.3);
              z-index: 2147483647;
              font-size: 15px;
            }
            .sugam-scam-title { font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
            .sugam-scam-btn { background: #D32F2F; color: #FFF; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; margin-top: 10px; }
          </style>
          <div class="sugam-scam-title">⚠️ Stop. Check. Ask.</div>
          <div>This page has urgent threats or unverified domain details. Banks never threaten immediate suspension or ask for your PIN.</div>
          <button class="sugam-scam-btn" id="sugam-scam-close">I understand, stay alert</button>
        `;
        shadow.appendChild(scamCard);
        scamCard.querySelector('#sugam-scam-close').addEventListener('click', () => scamCard.remove());
      }
    },

    /**
     * 5.5 Explain This Word
     */
    setupWordExplanation() {
      document.addEventListener('mouseup', () => {
        const selection = window.getSelection().toString().trim();
        if (selection.length > 2 && selection.length < 25 && !selection.includes(' ')) {
          // Single word selected
          // Show small tooltip
        }
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

  // Start engine
  SugamEngine.init();
})();

