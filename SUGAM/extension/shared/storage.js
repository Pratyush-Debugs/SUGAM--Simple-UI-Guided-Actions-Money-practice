/**
 * SUGAM - Storage Module
 * Manages user settings, presets, caregiver lock, and per-site rules.
 *
 * Where things live:
 * - chrome.storage.sync  -> comfort settings only (follow the user across devices).
 * - chrome.storage.local -> secrets (Gemini API key). Never synced to the user's Google account.
 * - Caregiver PIN        -> only a salted PBKDF2 hash is stored, never the PIN itself.
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

  // Caregiver protection (optional PIN lock to prevent accidental changes).
  // This is a speed bump against accidental changes, not a security boundary.
  // Use SugamStorage.setCaregiverPin() / verifyCaregiverPin(); the PIN itself is never stored.
  caregiverLock: {
    enabled: false,
    pinHash: '',
    pinSalt: ''
  },

  // 4.1 Visual Comfort Settings
  visualComfort: {
    enabled: false,
    textSize: 110, // 100% to 200%
    lineSpacing: 1.6, // 1.5 to 2.0
    letterSpacing: 0.05, // 0 to 0.12 em
    wordSpacing: 0.1, // 0 to 0.16 em
    paragraphSpacing: 1.8, // 1.0 to 2.0
    leftAlign: true, // override justify
    maxLineLength: 65, // 50 to 75 ch
    colorTheme: 'cream', // 'default', 'cream', 'blue', 'grey', 'dark', 'high-contrast'
    pauseMedia: true, // pause carousels, videos, audio
    stopAnimations: true, // pause CSS animations & transitions
    hidePopups: true // hide sticky overlays & floating banners
  },

  // 4.3 Take your time (Timer freeze & Calm button)
  timerFreeze: {
    enabled: false,
    level: 1, // Level 1: Plain words detector. Level 2: Pause client-side timer (opt-in, non-financial).
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
    height: 70, // pixels
    tintColor: 'rgba(231, 221, 240, 0.45)', // Pale lilac tint
    dimmingStrength: 0.45 // 0.1 to 0.8
  },

  // 4.6 Bionic reading
  bionicRead: {
    enabled: false,
    strength: 'medium' // 'light' (30%), 'medium' (45%), 'strong' (60%)
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
    rate: 0.9, // 0.7 to 1.5 (default 0.9)
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
      wordSpacing: 0.1,
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

const SUGAM_SETTINGS_KEY = 'sugamSettings';
const SUGAM_SECRETS_KEY = 'sugamSecrets';
const SUGAM_PIN_ITERATIONS = 100000;

function sugamIsPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Recursively merges `patch` onto `base` and returns a new object.
 * Plain objects are merged key by key; arrays and primitives are replaced.
 */
function sugamDeepMerge(base, patch) {
  const result = sugamIsPlainObject(base) ? { ...base } : {};
  if (!sugamIsPlainObject(patch)) return result;
  for (const [key, value] of Object.entries(patch)) {
    result[key] = sugamIsPlainObject(value) ? sugamDeepMerge(result[key], value) : value;
  }
  return result;
}

function sugamClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sugamStorageGet(area, key) {
  return new Promise((resolve) => {
    chrome.storage[area].get([key], (res) => resolve((res && res[key]) || undefined));
  });
}

function sugamStorageSet(area, items) {
  return new Promise((resolve) => chrome.storage[area].set(items, () => resolve()));
}

function sugamStorageRemove(area, key) {
  return new Promise((resolve) => chrome.storage[area].remove(key, () => resolve()));
}

function sugamBytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function sugamBase64ToBytes(b64) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function sugamHashPin(pin, saltBytes) {
  const subtle = globalThis.crypto.subtle;
  const keyMaterial = await subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBytes, iterations: SUGAM_PIN_ITERATIONS },
    keyMaterial,
    256
  );
  return sugamBytesToBase64(new Uint8Array(bits));
}

const SugamStorage = {
  /**
   * Retrieves all user settings with fallback to defaults.
   * The Gemini API key is read from local-only storage and exposed on
   * settings.summariser.geminiApiKey so existing callers keep working.
   */
  async getSettings() {
    const stored = await sugamStorageGet('sync', SUGAM_SETTINGS_KEY);
    const secrets = (await sugamStorageGet('local', SUGAM_SECRETS_KEY)) || {};
    const merged = sugamDeepMerge(SUGAM_DEFAULT_SETTINGS, stored);

    // One-time migration: older versions kept the API key in synced storage.
    const legacyKey = stored?.summariser?.geminiApiKey;
    if (legacyKey) {
      if (!secrets.geminiApiKey) secrets.geminiApiKey = legacyKey;
      await this._persist(merged, secrets);
    }

    // Legacy plain-text caregiver PIN becomes a salted hash.
    const legacyPin = stored?.caregiverLock?.pin;
    if (legacyPin !== undefined) {
      delete merged.caregiverLock.pin;
      if (/^\d{4}$/.test(String(legacyPin))) await this._storeCaregiverPin(merged, String(legacyPin));
      await this._persist(merged, secrets);
    }

    merged.summariser.geminiApiKey = secrets.geminiApiKey || '';
    return merged;
  },

  /**
   * Saves updated settings. Secrets are split out into local-only storage.
   */
  async saveSettings(updated) {
    const toSync = sugamClone(updated);
    const secrets = (await sugamStorageGet('local', SUGAM_SECRETS_KEY)) || {};
    if (toSync.summariser && typeof toSync.summariser.geminiApiKey === 'string') {
      secrets.geminiApiKey = toSync.summariser.geminiApiKey.trim();
    }
    await this._persist(toSync, secrets);
    return updated;
  },

  /**
   * Writes settings (without secrets) to sync and secrets to local storage.
   */
  async _persist(settings, secrets) {
    const toSync = sugamClone(settings);
    if (toSync.summariser) delete toSync.summariser.geminiApiKey;
    if (toSync.caregiverLock) delete toSync.caregiverLock.pin;
    await sugamStorageSet('sync', { [SUGAM_SETTINGS_KEY]: toSync });

    if (secrets.geminiApiKey) {
      await sugamStorageSet('local', { [SUGAM_SECRETS_KEY]: secrets });
    } else {
      await sugamStorageRemove('local', SUGAM_SECRETS_KEY);
    }
  },

  /**
   * Updates partial settings (deep merge).
   */
  async updateSettings(patch) {
    const current = await this.getSettings();
    return this.saveSettings(sugamDeepMerge(current, patch));
  },

  /**
   * Applies a preset on top of the current settings.
   * Deep merge keeps values the preset does not mention (API key, consent, ...).
   */
  async applyPreset(presetKey) {
    const current = await this.getSettings();
    const presetData = SUGAM_PRESETS[presetKey];
    if (!presetData) return current;

    return this.saveSettings({
      ...sugamDeepMerge(current, presetData),
      preset: presetKey
    });
  },

  async getApiKey() {
    const secrets = (await sugamStorageGet('local', SUGAM_SECRETS_KEY)) || {};
    return secrets.geminiApiKey || '';
  },

  async setApiKey(key) {
    const settings = await this.getSettings();
    settings.summariser.geminiApiKey = String(key || '');
    await this.saveSettings(settings);
  },

  /**
   * Sets (or replaces) the caregiver PIN. Only 4-digit PINs are accepted.
   */
  async setCaregiverPin(pin) {
    if (!/^\d{4}$/.test(String(pin))) throw new Error('The PIN must be exactly 4 digits.');
    const settings = await this.getSettings();
    await this._storeCaregiverPin(settings, String(pin));
    await this.saveSettings(settings);
  },

  async _storeCaregiverPin(settings, pin) {
    const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
    settings.caregiverLock.pinSalt = sugamBytesToBase64(salt);
    settings.caregiverLock.pinHash = await sugamHashPin(pin, salt);
    settings.caregiverLock.enabled = true;
  },

  async verifyCaregiverPin(pin) {
    const { pinHash, pinSalt } = (await this.getSettings()).caregiverLock;
    if (!pinHash || !pinSalt || !/^\d{4}$/.test(String(pin))) return false;
    const attempt = await sugamHashPin(String(pin), sugamBase64ToBytes(pinSalt));
    // Constant-time comparison
    let diff = attempt.length ^ pinHash.length;
    for (let i = 0; i < attempt.length && i < pinHash.length; i++) {
      diff |= attempt.charCodeAt(i) ^ pinHash.charCodeAt(i);
    }
    return diff === 0;
  },

  async clearCaregiverPin() {
    const settings = await this.getSettings();
    settings.caregiverLock = { enabled: false, pinHash: '', pinSalt: '' };
    await this.saveSettings(settings);
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
  module.exports = { SUGAM_DEFAULT_SETTINGS, SUGAM_PRESETS, SugamStorage, sugamDeepMerge };
}
