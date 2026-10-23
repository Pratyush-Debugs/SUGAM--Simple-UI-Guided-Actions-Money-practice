/**
 * SUGAM - Visual Comfort Mode (4.1) and Dyslexia-Friendly Font (4.4)
 * Methods are mixed into SugamEngine by content/content.js, so `this` is the engine.
 */

globalThis.SugamFeatures = globalThis.SugamFeatures || {};

SugamFeatures.visualComfort = {
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
      document.querySelectorAll('video, audio').forEach((media) => {
        try {
          media.pause();
        } catch {
          /* some media elements refuse to pause */
        }
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
      '[class*="cookie"]',
      '[id*="cookie"]',
      '[class*="newsletter"]',
      '[id*="newsletter"]',
      '[class*="intercom"]',
      '[id*="intercom"]',
      '[class*="chat-widget"]',
      '[id*="chat-widget"]'
    ];
    document.querySelectorAll(selectors.join(',')).forEach((el) => {
      if (el.id !== 'sugam-root' && !el.classList.contains('sugam-hidden-distraction')) {
        el.classList.add('sugam-hidden-distraction');
        this.hiddenDistractions.push(el);
      }
    });
  },

  restoreHiddenDistractions() {
    this.hiddenDistractions.forEach((el) => {
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
    fontStack +=
      ', "SUGAM Noto Sans Devanagari", "Noto Sans Devanagari", "SUGAM Noto Sans Odia", "Noto Sans Odia", sans-serif';
    document.documentElement.style.setProperty('--sugam-font-family', fontStack);

    if (df.applySpacing) {
      document.documentElement.style.setProperty('--sugam-line-height', '1.8');
      document.documentElement.style.setProperty('--sugam-letter-spacing', '0.06em');
      document.documentElement.style.setProperty('--sugam-word-spacing', '0.12em');
    }
  }
};
