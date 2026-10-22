/**
 * SUGAM - Storage Module
 * Manages user settings, presets, caregiver lock, and per-site rules.
 * All settings are stored locally or synced via chrome.storage.
 */

const SUGAM_DEFAULT_SETTINGS = {
  // Master switch: if false, NO changes are applied to pages
  masterSwitch: true,

  // UI Language: 'en' (English), 'hi' (Hindi), 'or' (Odia)
  language: 'en',

  // Current active preset: 'calm', 'dyslexia', 'easyread', 'memory', or 'custom'
  preset: 'calm',

  // List of hostnames where SUGAM helpers are completely disabled
  disabledSites: [],

  // Caregiver protection (optional PIN lock to prevent accidental changes)
  caregiverLock: {
    enabled: false,
    pin: '' // 4-digit PIN
  },

  // 4.1 Visual Comfort Settings
  visualComfort: {
    enabled: false,
    textSize: 110,         // 100% to 200%
    lineSpacing: 1.6,      // 1.5 to 2.0
    letterSpacing: 0.05,   // 0 to 0.12 em
    wordSpacing: 0.1,      // 0 to 0.16 em
    paragraphSpacing: 1.8, // 1.0 to 2.0
    leftAlign: true,       // override justify
    maxLineLength: 65,     // 50 to 75 ch
    colorTheme: 'cream',   // 'default', 'cream', 'blue', 'grey', 'dark', 'high-contrast'
    pauseMedia: true,      // pause carousels, videos, audio
    stopAnimations: true,  // pause CSS animations & transitions
    hidePopups: true       // hide sticky overlays & floating banners
  },

  // 4.3 Take your time (Timer freeze & Calm button)
  timerFreeze: {
    enabled: false,
    level: 1,              // Level 1: Plain words detector. Level 2: Pause client-side timer (opt-in, non-financial).
    sessionAlerts: true,
    autoSaveForms: true
  },

  // 4.4 Dyslexia-friendly font
  dyslexiaFont: {
    enabled: false,
    fontFamily: 'Lexend', // 'Lexend', 'Atkinson', 'OpenDyslexic', 'System'
    applySpacing: true
  },

  // 4.5 Reading ruler
  readingRuler: {
    enabled: false,
    height: 70,           // pixels
    tintColor: 'rgba(231, 221, 240, 0.45)', // Pale lilac tint
    dimmingStrength: 0.45 // 0.1 to 0.8
  },

  // 4.6 Bionic reading
  bionicRead: {
    enabled: false,
    strength: 'medium'    // 'light' (30%), 'medium' (45%), 'strong' (60%)
  },

  // 4.7 Summarise with pictures
  summariser: {
    enabled: false,
    useGemini: false,
    geminiApiKey: '',
    consentGiven: false
  },

  // 4.8 Read aloud
  readAloud: {
    enabled: false,
    rate: 0.9,            // 0.7 to 1.5 (default 0.9)
    pitch: 1.0,
    voiceUri: '',
    highlightWords: true,
    readAmountsInWords: true
  },

  // 4.9 Form wizard
  formWizard: {
    enabled: false,
    speakQuestions: false,
    chunkNumbers: true
  },

  // 4.10 Translate
  translate: {
    enabled: false,
    targetLanguage: 'hi', // 'hi', 'or', 'en'
    useGemini: false
  },

  // 5.1 Money practice (sandbox status)
  moneyPractice: {
    demoBalance: 2500,
    completedScenarios: []
  },

  // 5.3 Scam safety guard
  scamGuard: {
    enabled: true,
    warnOnUrgentWords: true,
    warnOnLookalikes: true
  },

  // 5.4 Help and trusted person
  trustedPerson: {
    name: '',
    phone: '',
    relationship: 'Family / Caregiver'
  },

  // 5.5 Explain this word & plain rewrite
  explainWord: {
    enabled: false
  },

  // 5.6 Numbers helper
  numbersHelper: {
    enabled: false,
    showWords: true,
    chunkDigits: true
  },

  // 5.7 Where was I (memory breadcrumb)
  whereWasI: {
    enabled: false,
    lastVisited: []
  }
};

// Preset configurations
const SUGAM_PRESETS = {
  calm: {
    name: 'Calm (Autism)',
    description: 'Soft colors, stops distracting animations, hides pop-ups, calm timers.',
    visualComfort: {
      enabled: true,
      textSize: 115,
      lineSpacing: 1.6,
      letterSpacing: 0.04,
      wordSpacing: 0.08,
      paragraphSpacing: 1.8,
      leftAlign: true,
      maxLineLength: 65,
      colorTheme: 'cream',
      pauseMedia: true,
      stopAnimations: true,
      hidePopups: true
    },
    timerFreeze: { enabled: true, level: 1 },
    scamGuard: { enabled: true }
  },
  dyslexia: {
    name: 'Dyslexia Support',
    description: 'Clear font, wider spacing, reading ruler, left alignment.',
    visualComfort: {
      enabled: true,
      textSize: 120,
      lineSpacing: 1.8,
      letterSpacing: 0.08,
      wordSpacing: 0.12,
      paragraphSpacing: 2.0,
      leftAlign: true,
      maxLineLength: 60,
      colorTheme: 'cream',
      pauseMedia: true,
      stopAnimations: true,
      hidePopups: true
    },
    dyslexiaFont: { enabled: true, fontFamily: 'Lexend', applySpacing: true },
    readingRuler: { enabled: true, height: 75, dimmingStrength: 0.4 },
    readAloud: { enabled: true, rate: 0.9 }
  },
  easyread: {
    name: 'Easy Read',
    description: 'Bigger text, short plain sentences, pictures and summaries.',
    visualComfort: {
      enabled: true,
      textSize: 130,
      lineSpacing: 1.8,
      letterSpacing: 0.06,
      wordSpacing: 0.10,
      paragraphSpacing: 2.0,
      leftAlign: true,
      maxLineLength: 55,
      colorTheme: 'cream',
      pauseMedia: true,
      stopAnimations: true,
      hidePopups: true
    },
    dyslexiaFont: { enabled: true, fontFamily: 'Lexend', applySpacing: true },
    summariser: { enabled: true },
    readAloud: { enabled: true, rate: 0.85 }
  },
  memory: {
    name: 'Memory Support',
    description: 'Form wizard, Where was I breadcrumbs, timer alerts, numbers helper.',
    visualComfort: {
      enabled: true,
      textSize: 115,
      lineSpacing: 1.6,
      colorTheme: 'cream',
      hidePopups: true
    },
    timerFreeze: { enabled: true, level: 1, sessionAlerts: true, autoSaveForms: true },
    formWizard: { enabled: true, chunkNumbers: true },
    numbersHelper: { enabled: true, showWords: true, chunkDigits: true },
    whereWasI: { enabled: true }
  }
};

const SugamStorage = {
  /**
   * Retrieves all user settings with fallback to defaults.
   */
  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['sugamSettings'], (res) => {
        if (!res || !res.sugamSettings) {
          resolve(JSON.parse(JSON.stringify(SUGAM_DEFAULT_SETTINGS)));
        } else {
          // Deep merge with defaults to ensure all keys exist
          const merged = { ...SUGAM_DEFAULT_SETTINGS, ...res.sugamSettings };
          resolve(merged);
        }
      });
    });
  },

  /**
   * Saves updated settings.
   */
  async saveSettings(updated) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ sugamSettings: updated }, () => {
        resolve(updated);
      });
    });
  },

  /**
   * Updates partial settings.
   */
  async updateSettings(patch) {
    const current = await this.getSettings();
    const updated = { ...current, ...patch };
    return this.saveSettings(updated);
  },

  /**
   * Applies a preset.
   */
  async applyPreset(presetKey) {
    const current = await this.getSettings();
    const presetData = SUGAM_PRESETS[presetKey];
    if (!presetData) return current;

    const updated = {
      ...current,
      preset: presetKey,
      ...presetData
    };
    return this.saveSettings(updated);
  },

  /**
   * Checks if SUGAM is disabled on a specific site.
   */
  async isSiteDisabled(url) {
    try {
      const hostname = new URL(url).hostname;
      const settings = await this.getSettings();
      return settings.disabledSites.includes(hostname);
    } catch {
      return false;
    }
  },

  /**
   * Toggles whether SUGAM runs on the given hostname.
   */
  async toggleSiteDisabled(url) {
    try {
      const hostname = new URL(url).hostname;
      const settings = await this.getSettings();
      const list = new Set(settings.disabledSites || []);
      if (list.has(hostname)) {
        list.delete(hostname);
      } else {
        list.add(hostname);
      }
      settings.disabledSites = Array.from(list);
      await this.saveSettings(settings);
      return settings.disabledSites.includes(hostname);
    } catch {
      return false;
    }
  }
};

// Export for ES modules and standard browser contexts
if (typeof module !== 'undefined') {
  module.exports = { SUGAM_DEFAULT_SETTINGS, SUGAM_PRESETS, SugamStorage };
}

