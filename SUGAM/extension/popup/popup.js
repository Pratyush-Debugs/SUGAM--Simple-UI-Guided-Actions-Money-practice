/**
 * SUGAM - Popup Controller
 * Manages tiles, comfort settings, master switch, i18n, and accessibility.
 * All event handlers are initialized cleanly without any TDZ errors.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Element References (Queried safely once DOM is loaded)
  const masterToggle = document.getElementById('master-toggle');
  const masterStatusText = document.getElementById('master-status-text');
  const liveAnnouncer = document.getElementById('aria-live-status');
  const btnComfortSettings = document.getElementById('btn-comfort-settings');
  const btnHelp = document.getElementById('btn-help');
  const btnCalmMoment = document.getElementById('btn-calm-moment');
  const modalComfort = document.getElementById('modal-comfort');
  const modalHelp = document.getElementById('modal-help');
  const modalFeatureOptions = document.getElementById('modal-feature-options');

  // Load User Settings
  let settings = await SugamStorage.getSettings();
  let currentTab = null;

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs.length > 0) {
      currentTab = tabs[0];
    }
  } catch (e) {
    console.warn("Could not query active tab", e);
  }

  // Feature to Settings Key Mapping
  const featureKeyMap = {
    timerFreeze: 'timerFreeze',
    dyslexiaFont: 'dyslexiaFont',
    readingRuler: 'readingRuler',
    bionicRead: 'bionicRead',
    summariser: 'summariser',
    readAloud: 'readAloud',
    formWizard: 'formWizard',
    translate: 'translate',
    moneyPractice: 'moneyPractice',
    scamGuard: 'scamGuard',
    explainWord: 'explainWord',
    numbersHelper: 'numbersHelper'
  };

  // Accessible Announcements for Screen Readers
  function announce(msg) {
    if (liveAnnouncer) {
      liveAnnouncer.textContent = msg;
    }
  }

  // Message Active Tab's Content Script with dynamic injection fallback
  function notifyContentScript(action, payload = {}) {
    if (!currentTab || !currentTab.id) return;

    // Skip internal browser pages
    if (currentTab.url && (currentTab.url.startsWith('chrome://') || currentTab.url.startsWith('edge://') || currentTab.url.startsWith('about:'))) {
      return;
    }

    chrome.tabs.sendMessage(currentTab.id, { action, ...payload }, (response) => {
      if (chrome.runtime.lastError) {
        // Content script might not be injected yet into this tab. Inject dynamically!
        if (chrome.scripting && chrome.scripting.executeScript) {
          if (chrome.scripting.insertCSS) {
            chrome.scripting.insertCSS({
              target: { tabId: currentTab.id },
              files: ['content/content.css']
            }).catch(() => {});
          }

          chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            files: ['content/content.js']
          }).then(() => {
            // Retry sending message after injection
            chrome.tabs.sendMessage(currentTab.id, { action, ...payload });
          }).catch(err => {
            console.warn("Script injection skipped:", err);
          });
        }
      }
    });
  }

  // UI Update Functions
  function updateMasterSwitchUI() {
    if (!masterToggle || !masterStatusText) return;
    const isOn = settings.masterSwitch !== false;
    masterToggle.setAttribute('aria-checked', isOn.toString());
    if (isOn) {
      masterToggle.classList.add('active');
      masterStatusText.textContent = SugamI18n.get('statusOn');
    } else {
      masterToggle.classList.remove('active');
      masterStatusText.textContent = SugamI18n.get('statusOff');
    }
  }

  function updateTilesUI() {
    Object.keys(featureKeyMap).forEach(key => {
      const tile = document.querySelector(`.helper-tile[data-feature="${key}"]`);
      if (!tile) return;

      const badge = tile.querySelector('.tile-status-badge');
      const mainBtn = tile.querySelector('.tile-main-btn');

      if (key === 'moneyPractice') {
        if (badge) {
          badge.textContent = "Open";
          badge.className = "tile-status-badge status-practice";
        }
        return;
      }

      const isFeatureEnabled = Boolean(settings[key]?.enabled);
      if (isFeatureEnabled) {
        tile.classList.add('tile-active');
        if (mainBtn) mainBtn.setAttribute('aria-pressed', 'true');
        if (badge) {
          badge.textContent = SugamI18n.get('statusOn');
          badge.className = 'tile-status-badge status-on';
        }
      } else {
        tile.classList.remove('tile-active');
        if (mainBtn) mainBtn.setAttribute('aria-pressed', 'false');
        if (badge) {
          badge.textContent = SugamI18n.get('statusOff');
          badge.className = 'tile-status-badge status-off';
        }
      }
    });
  }

  function applyTranslations() {
    const elTagline = document.getElementById('txt-app-tagline');
    const elComfort = document.getElementById('txt-comfort-btn');
    const elMaster = document.getElementById('txt-master-label');
    const elCalm = document.getElementById('txt-calm-moment');
    const elHelp = document.getElementById('txt-help-btn');

    if (elTagline) elTagline.textContent = SugamI18n.get('appSubtitle');
    if (elComfort) elComfort.textContent = SugamI18n.get('comfortSettings');
    if (elMaster) elMaster.textContent = SugamI18n.get('turnOffAll');
    if (elCalm) elCalm.textContent = SugamI18n.get('iNeedAMoment');
    if (elHelp) elHelp.textContent = SugamI18n.get('help');

    // Tile labels
    const tileIds = [
      ['txt-tile-timer', 'tileTimer'],
      ['txt-tile-font', 'tileFont'],
      ['txt-tile-ruler', 'tileRuler'],
      ['txt-tile-bionic', 'tileBionic'],
      ['txt-tile-summariser', 'tileSummarise'],
      ['txt-tile-readaloud', 'tileReadAloud'],
      ['txt-tile-formwizard', 'tileFormWizard'],
      ['txt-tile-translate', 'tileTranslate'],
      ['txt-tile-moneypractice', 'tileMoneyPractice'],
      ['txt-tile-scamguard', 'tileScamGuard'],
      ['txt-tile-explainword', 'tileExplainWord'],
      ['txt-tile-numbers', 'tileNumbersHelper']
    ];

    tileIds.forEach(([domId, i18nKey]) => {
      const el = document.getElementById(domId);
      if (el) el.textContent = SugamI18n.get(i18nKey);
    });

    updateMasterSwitchUI();
    updateTilesUI();
  }

  // Set Language and Update Text
  SugamI18n.setLanguage(settings.language || 'en');
  applyTranslations();

  // 1. Language Selector Buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const lang = btn.dataset.lang;
      settings.language = lang;
      SugamI18n.setLanguage(lang);
      await SugamStorage.saveSettings(settings);
      applyTranslations();
      announce(`Language set to ${lang.toUpperCase()}`);
    });
  });

  // Highlight active language button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const isActive = btn.dataset.lang === settings.language;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive.toString());
  });

  // 2. Master Switch Toggle Listener
  if (masterToggle) {
    masterToggle.addEventListener('click', async () => {
      const nextState = !(settings.masterSwitch !== false);
      settings.masterSwitch = nextState;
      await SugamStorage.saveSettings(settings);
      updateMasterSwitchUI();
      notifyContentScript('TOGGLE_MASTER_SWITCH', { value: nextState });

      const msg = nextState ? "SUGAM helpers turned on" : "SUGAM helpers off";
      announce(msg);
    });
  }

  // 3. Helper Tiles Click Listeners
  document.querySelectorAll('.helper-tile').forEach(tile => {
    const feature = tile.dataset.feature;
    const mainBtn = tile.querySelector('.tile-main-btn');
    if (!mainBtn) return;

    mainBtn.addEventListener('click', async () => {
      // Money practice: Open dedicated interactive sandbox page
      if (feature === 'moneyPractice') {
        chrome.tabs.create({ url: chrome.runtime.getURL('sandbox/upi-practice.html') });
        return;
      }

      if (!settings[feature]) {
        settings[feature] = { enabled: false };
      }

      const nextVal = !settings[feature].enabled;
      settings[feature].enabled = nextVal;

      // Special action triggers
      if (feature === 'readAloud' && nextVal) {
        notifyContentScript('TRIGGER_READ_ALOUD');
      } else if (feature === 'formWizard' && nextVal) {
        notifyContentScript('TRIGGER_FORM_WIZARD');
        setTimeout(() => window.close(), 150);
      } else if (feature === 'summariser' && nextVal) {
        if (chrome.sidePanel?.open && currentTab?.id) {
          chrome.sidePanel.open({ tabId: currentTab.id }).catch(() => {});
        }
      }

      await SugamStorage.saveSettings(settings);
      updateTilesUI();
      notifyContentScript('SETTINGS_UPDATED', { settings });

      const titleEl = tile.querySelector('.tile-title');
      const titleText = titleEl ? titleEl.textContent : feature;
      const stateWord = nextVal ? SugamI18n.get('statusOn') : SugamI18n.get('statusOff');
      announce(`${titleText} is now ${stateWord}`);
    });
  });

  // Modal helpers
  function showModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('hidden');
  }

  function hideModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('hidden');
  }

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      hideModal(btn.dataset.close);
    });
  });

  // 4. Comfort Settings Modal Trigger
  if (btnComfortSettings) {
    btnComfortSettings.addEventListener('click', () => {
      loadComfortSettingsUI();
      showModal('modal-comfort');
    });
  }

  // 5. Help Modal Trigger
  if (btnHelp) {
    btnHelp.addEventListener('click', () => {
      loadHelpUI();
      showModal('modal-help');
    });
  }

  // 6. Calm Moment Trigger ("I need a moment")
  if (btnCalmMoment) {
    btnCalmMoment.addEventListener('click', () => {
      notifyContentScript('TRIGGER_CALM_MOMENT');
      window.close(); // Close popup so user experiences full calming screen on the web page
    });
  }

  // 7. Comfort Settings UI Binding
  function loadComfortSettingsUI() {
    const vc = settings.visualComfort || {};
    const textSizeSlider = document.getElementById('range-text-size');
    const textSizeVal = document.getElementById('val-text-size');
    const lineSpacingSlider = document.getElementById('range-line-spacing');
    const lineSpacingVal = document.getElementById('val-line-spacing');

    if (textSizeSlider && textSizeVal) {
      textSizeSlider.value = vc.textSize || 110;
      textSizeVal.textContent = `${textSizeSlider.value}%`;
    }

    if (lineSpacingSlider && lineSpacingVal) {
      lineSpacingSlider.value = vc.lineSpacing || 1.6;
      lineSpacingVal.textContent = lineSpacingSlider.value;
    }

    const chkPauseMedia = document.getElementById('chk-pause-media');
    const chkStopAnimations = document.getElementById('chk-stop-animations');
    const chkHidePopups = document.getElementById('chk-hide-popups');
    const chkLeftAlign = document.getElementById('chk-left-align');

    if (chkPauseMedia) chkPauseMedia.checked = vc.pauseMedia !== false;
    if (chkStopAnimations) chkStopAnimations.checked = vc.stopAnimations !== false;
    if (chkHidePopups) chkHidePopups.checked = vc.hidePopups !== false;
    if (chkLeftAlign) chkLeftAlign.checked = vc.leftAlign !== false;

    // Theme Radio
    const theme = vc.colorTheme || 'cream';
    const radio = document.querySelector(`input[name="colorTheme"][value="${theme}"]`);
    if (radio) radio.checked = true;
  }

  const rangeTextSize = document.getElementById('range-text-size');
  if (rangeTextSize) {
    rangeTextSize.addEventListener('input', async (e) => {
      const valTextSize = document.getElementById('val-text-size');
      if (valTextSize) valTextSize.textContent = `${e.target.value}%`;
      if (!settings.visualComfort) settings.visualComfort = {};
      settings.visualComfort.textSize = parseInt(e.target.value, 10);
      settings.visualComfort.enabled = true;
      await SugamStorage.saveSettings(settings);
      notifyContentScript('SETTINGS_UPDATED', { settings });
    });
  }

  const rangeLineSpacing = document.getElementById('range-line-spacing');
  if (rangeLineSpacing) {
    rangeLineSpacing.addEventListener('input', async (e) => {
      const valLineSpacing = document.getElementById('val-line-spacing');
      if (valLineSpacing) valLineSpacing.textContent = e.target.value;
      if (!settings.visualComfort) settings.visualComfort = {};
      settings.visualComfort.lineSpacing = parseFloat(e.target.value);
      settings.visualComfort.enabled = true;
      await SugamStorage.saveSettings(settings);
      notifyContentScript('SETTINGS_UPDATED', { settings });
    });
  }

  document.querySelectorAll('input[name="colorTheme"]').forEach(radio => {
    radio.addEventListener('change', async (e) => {
      if (!settings.visualComfort) settings.visualComfort = {};
      settings.visualComfort.colorTheme = e.target.value;
      settings.visualComfort.enabled = true;
      await SugamStorage.saveSettings(settings);
      notifyContentScript('SETTINGS_UPDATED', { settings });
    });
  });

  const chkMap = {
    'chk-pause-media': 'pauseMedia',
    'chk-stop-animations': 'stopAnimations',
    'chk-hide-popups': 'hidePopups',
    'chk-left-align': 'leftAlign'
  };

  Object.entries(chkMap).forEach(([id, prop]) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', async (e) => {
        if (!settings.visualComfort) settings.visualComfort = {};
        settings.visualComfort[prop] = e.target.checked;
        settings.visualComfort.enabled = true;
        await SugamStorage.saveSettings(settings);
        notifyContentScript('SETTINGS_UPDATED', { settings });
      });
    }
  });

  // Presets in Comfort Modal
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const presetKey = btn.dataset.preset;
      settings = await SugamStorage.applyPreset(presetKey);
      loadComfortSettingsUI();
      updateTilesUI();
      notifyContentScript('SETTINGS_UPDATED', { settings });
      announce(`Applied ${presetKey} preset.`);
    });
  });

  // Never Run on this Website Toggle
  const btnToggleSite = document.getElementById('btn-toggle-site');
  if (btnToggleSite) {
    btnToggleSite.addEventListener('click', async () => {
      if (currentTab?.url) {
        const isDisabled = await SugamStorage.toggleSiteDisabled(currentTab.url);
        settings = await SugamStorage.getSettings();
        notifyContentScript('TOGGLE_SITE_DISABLED');
        btnToggleSite.textContent = isDisabled 
          ? "Re-enable on this website" 
          : "Never run on this website";
        announce(isDisabled ? "SUGAM disabled on this site" : "SUGAM enabled on this site");
      }
    });
  }

  // 8. Help Dialog Binding
  function loadHelpUI() {
    const phone = settings.trustedPerson?.phone || '';
    const txt = document.getElementById('txt-trusted-contact');
    const input = document.getElementById('input-trusted-phone');
    if (txt) {
      txt.textContent = phone 
        ? `Phone: ${phone}` 
        : "No phone number saved yet. Enter caregiver number below:";
    }
    if (input) input.value = phone;
  }

  const btnSavePhone = document.getElementById('btn-save-phone');
  if (btnSavePhone) {
    btnSavePhone.addEventListener('click', async () => {
      const input = document.getElementById('input-trusted-phone');
      const val = input ? input.value.trim() : '';
      if (!settings.trustedPerson) settings.trustedPerson = {};
      settings.trustedPerson.phone = val;
      await SugamStorage.saveSettings(settings);
      loadHelpUI();
      announce("Caregiver phone number saved");
    });
  }

  const btnCallHelper = document.getElementById('btn-call-helper');
  if (btnCallHelper) {
    btnCallHelper.addEventListener('click', () => {
      const phone = settings.trustedPerson?.phone;
      if (phone) {
        window.open(`tel:${phone}`);
      } else {
        alert("Please enter a phone number below and click Save.");
      }
    });
  }

  const btnMsgHelper = document.getElementById('btn-msg-helper');
  if (btnMsgHelper) {
    btnMsgHelper.addEventListener('click', () => {
      const phone = settings.trustedPerson?.phone;
      if (phone) {
        window.open(`sms:${phone}?body=Hi, I need help with this webpage.`);
      } else {
        alert("Please enter a phone number below and click Save.");
      }
    });
  }

  const btnCopySummary = document.getElementById('btn-copy-summary');
  if (btnCopySummary) {
    btnCopySummary.addEventListener('click', () => {
      if (currentTab?.id) {
        chrome.tabs.sendMessage(currentTab.id, { action: 'EXTRACT_PAGE_CONTENT' }, (resp) => {
          const text = resp?.content?.slice(0, 500) || "Could not read page text.";
          const summaryText = `Help needed on this page (${currentTab.title || 'Webpage'}):\n"${text}..."`;
          navigator.clipboard.writeText(summaryText);
          alert(SugamI18n.get('helpSummaryCopied'));
        });
      }
    });
  }

  // 9. Gear Buttons for Feature Options
  document.querySelectorAll('.tile-gear-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tile = btn.closest('.helper-tile');
      const feature = tile?.dataset?.feature;
      if (feature) {
        openFeatureOptionsModal(feature);
      }
    });
  });

  function openFeatureOptionsModal(feature) {
    const body = document.getElementById('modal-fo-body');
    const title = document.getElementById('modal-fo-title');
    if (!body || !title) return;

    title.textContent = `${feature} Options`;

    if (feature === 'dyslexiaFont') {
      title.textContent = "Dyslexia Font Options";
      body.innerHTML = `
        <div class="form-group">
          <label class="group-label">Font Family</label>
          <select id="sel-font-family" style="padding:10px; border-radius:8px; border:2px solid #59366E; font-size:16px; width:100%;">
            <option value="Lexend">Lexend (Clear &amp; modern)</option>
            <option value="Atkinson">Atkinson Hyperlegible (Distinguishable letters)</option>
            <option value="OpenDyslexic">OpenDyslexic (Weighted bottoms)</option>
            <option value="System">System Sans-Serif (Arial / Verdana)</option>
          </select>
          <p style="font-size:13px; color:#59366E; margin-top:8px;">
            Note: Devanagari (Hindi) and Odia scripts fall back to Noto Sans Devanagari and Noto Sans Odia.
          </p>
        </div>
      `;
      const sel = body.querySelector('#sel-font-family');
      if (sel) {
        sel.value = settings.dyslexiaFont?.fontFamily || 'Lexend';
        sel.addEventListener('change', async (e) => {
          if (!settings.dyslexiaFont) settings.dyslexiaFont = { enabled: true };
          settings.dyslexiaFont.fontFamily = e.target.value;
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
    } else if (feature === 'readingRuler') {
      title.textContent = "Reading Ruler Options";
      body.innerHTML = `
        <div class="form-group">
          <label class="range-label">Ruler Height: <span id="val-ruler-h">${settings.readingRuler?.height || 70}px</span></label>
          <input type="range" id="range-ruler-h" min="40" max="140" value="${settings.readingRuler?.height || 70}">
        </div>
        <div class="form-group">
          <label class="range-label">Dimming Strength: <span id="val-ruler-dim">${Math.round((settings.readingRuler?.dimmingStrength || 0.45) * 100)}%</span></label>
          <input type="range" id="range-ruler-dim" min="10" max="80" value="${Math.round((settings.readingRuler?.dimmingStrength || 0.45) * 100)}">
        </div>
      `;
      const rangeH = body.querySelector('#range-ruler-h');
      const rangeDim = body.querySelector('#range-ruler-dim');

      if (rangeH) {
        rangeH.addEventListener('input', async (e) => {
          const valH = body.querySelector('#val-ruler-h');
          if (valH) valH.textContent = `${e.target.value}px`;
          if (!settings.readingRuler) settings.readingRuler = { enabled: true };
          settings.readingRuler.height = parseInt(e.target.value, 10);
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }

      if (rangeDim) {
        rangeDim.addEventListener('input', async (e) => {
          const valDim = body.querySelector('#val-ruler-dim');
          if (valDim) valDim.textContent = `${e.target.value}%`;
          if (!settings.readingRuler) settings.readingRuler = { enabled: true };
          settings.readingRuler.dimmingStrength = parseInt(e.target.value, 10) / 100;
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
    } else if (feature === 'summariser') {
      title.textContent = "Summariser & Gemini AI Options";
      body.innerHTML = `
        <div class="form-group">
          <p style="font-size:14px; line-height:1.4;">
            SUGAM summarises pages into at most 8 plain sentences with pictures.
          </p>
          <label class="group-label" style="margin-top:10px;">Free Gemini API Key (Optional)</label>
          <input type="password" id="input-gemini-key" class="text-input" placeholder="AIzaSy..." value="${settings.summariser?.geminiApiKey || ''}" style="padding:10px; border-radius:8px; border:2px solid #59366E; width:100%;">
          <p style="font-size:12px; color:#666; margin-top:4px;">
            Get a free key from Google AI Studio. If left empty, SUGAM uses fast on-device summarization.
          </p>
          <p style="font-size:12px; background:#E7DDF0; padding:8px; border-radius:6px; margin-top:8px;">
            🔒 <b>Privacy Rule:</b> Cloud AI is NEVER used on sensitive banking or login pages.
          </p>
        </div>
      `;
      const keyInput = body.querySelector('#input-gemini-key');
      if (keyInput) {
        keyInput.addEventListener('change', async (e) => {
          if (!settings.summariser) settings.summariser = { enabled: true };
          settings.summariser.geminiApiKey = e.target.value.trim();
          await SugamStorage.saveSettings(settings);
        });
      }
    } else if (feature === 'formWizard') {
      title.textContent = "Form Wizard Options";
      body.innerHTML = `
        <div class="form-group">
          <p style="font-size:14px; line-height:1.5;">
            The Form Wizard converts any intimidating web form into <b>one easy question per screen</b>, with voice dictation, big text, and friendly validation.
          </p>
          <button class="modal-btn-primary" id="btn-launch-wz-direct" style="margin-top:14px; width:100%;">
            📝 Open Form Wizard on this page
          </button>
        </div>
      `;
      body.querySelector('#btn-launch-wz-direct')?.addEventListener('click', () => {
        notifyContentScript('TRIGGER_FORM_WIZARD');
        window.close();
      });
    } else {
      body.innerHTML = `<p style="font-size:14px;">Options for this helper are automatically tuned for maximum clarity and cognitive comfort.</p>`;
    }

    showModal('modal-feature-options');
  }
});
