/**
 * SUGAM - Take Your Time: timer detection, calm moment and form drafts (4.3)
 * Methods are mixed into SugamEngine by content/content.js, so `this` is the engine.
 */

globalThis.SugamFeatures = globalThis.SugamFeatures || {};

SugamFeatures.takeYourTime = {
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

    const timerElems = document.querySelectorAll(
      '[role="timer"], [class*="countdown"], [id*="countdown"], [class*="timer"], [id*="timer"]'
    );
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
        <span>⏳</span> ${t('tileTimer')}
      </div>
      <div>${t('timerMinutesLeft', { minutes: countdown.minutes })}</div>
      <button class="sugam-tb-btn" id="sugam-calm-btn">${t('iNeedAMoment')}</button>
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
      console.warn('Main world pause failed', e);
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
    overlay.setAttribute('aria-label', t('calmLabel'));

    const trustedName = this.settings.trustedPerson?.name || t('calmHelper');
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
        <div class="sugam-calm-title">${t('calmTitle')}</div>
        <div class="sugam-calm-sub">${t('calmSubtitle')}</div>
        <div class="sugam-breathing-circle" aria-label="${t('calmBreatheLabel')}">${t('calmBreathe')}</div>
        <div class="sugam-calm-actions">
          <button class="sugam-btn-primary" id="sugam-resume-btn">${t('returnToPage')}</button>
          <a href="tel:${esc(trustedPhone)}" class="sugam-btn-secondary" style="text-decoration:none; display:flex; align-items:center; justify-content:center;">
            📞 ${t('calmCallName', { name: esc(trustedName), phone: esc(trustedPhone) })}
          </a>
          <a href="tel:1930" class="sugam-btn-secondary" style="text-decoration:none; display:flex; align-items:center; justify-content:center;">
            🛡️ ${t('cyberHelpline')}
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
          const input = document.querySelector(
            `input[name="${CSS.escape(name)}"], textarea[name="${CSS.escape(name)}"]`
          );
          if (input && !isFieldSensitive(input) && !input.value) {
            input.value = val;
          }
        });
      }
    });

    // Save on input
    document.addEventListener(
      'input',
      (e) => {
        const target = e.target;
        if (!target || !target.name) return;
        if (isFieldSensitive(target)) return; // NEVER SAVE SENSITIVE VALUES!

        chrome.storage.local.get([pageKey], (res) => {
          const currentDraft = res?.[pageKey] || {};
          currentDraft[target.name] = target.value;
          chrome.storage.local.set({ [pageKey]: currentDraft });
        });
      },
      { passive: true }
    );
  }
};
