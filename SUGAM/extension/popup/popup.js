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

  // Load User Settings
  let settings = await SugamStorage.getSettings();
  let currentTab = null;

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs.length > 0) {
      currentTab = tabs[0];
    }
  } catch (e) {
    console.warn('Could not query active tab', e);
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

  // Message SUGAM in the active tab. Opening the popup grants access to this tab only (activeTab),
  // so SUGAM is injected here on demand.
  function notifyContentScript(action, payload = {}) {
    if (!currentTab?.id || !SugamInjector.canRunOn(currentTab.url)) return Promise.resolve(undefined);
    return SugamInjector.send(currentTab.id, { action, ...payload });
  }

  // The user opened SUGAM on this page: start it here so their helpers apply.
  if (currentTab?.id && SugamInjector.canRunOn(currentTab.url)) SugamInjector.ensure(currentTab.id);

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
    Object.keys(featureKeyMap).forEach((key) => {
      const tile = document.querySelector(`.helper-tile[data-feature="${key}"]`);
      if (!tile) return;

      const badge = tile.querySelector('.tile-status-badge');
      const mainBtn = tile.querySelector('.tile-main-btn');

      if (key === 'moneyPractice') {
        if (badge) {
          badge.textContent = 'Open';
          badge.className = 'tile-status-badge status-practice';
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
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.lang-btn').forEach((b) => {
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
  document.querySelectorAll('.lang-btn').forEach((btn) => {
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

      const msg = nextState ? 'SUGAM helpers turned on' : 'SUGAM helpers off';
      announce(msg);
    });
  }

  // 3. Helper Tiles Click Listeners
  document.querySelectorAll('.helper-tile').forEach((tile) => {
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
      } else if (feature === 'summariser') {
        settings.summariser.enabled = true;
        if (chrome.sidePanel?.open && currentTab?.id) {
          chrome.sidePanel.open({ tabId: currentTab.id }).catch(() => {});
        }
        setTimeout(() => window.close(), 150);
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

  document.querySelectorAll('[data-close]').forEach((btn) => {
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
  function loadCalmMomentPopupUI() {
    const title = document.getElementById('modal-calm-title');
    const sub = document.getElementById('txt-calm-sub');
    const breathe = document.getElementById('calm-breathe-anim');
    const doneBtn = document.getElementById('btn-calm-done');
    const helperBtn = document.getElementById('btn-calm-call-helper');

    if (title) title.textContent = `🌿 ${SugamI18n.get('calmTitle')}`;
    if (sub) sub.textContent = SugamI18n.get('calmSubtitle');
    if (breathe) breathe.textContent = SugamI18n.get('calmBreathe');
    if (doneBtn) doneBtn.textContent = SugamI18n.get('returnToPage');

    if (helperBtn) {
      const phone = settings.trustedPerson?.phone;
      const name = settings.trustedPerson?.name || SugamI18n.get('calmHelper');
      if (phone && phone !== '1930') {
        helperBtn.style.display = 'flex';
        helperBtn.textContent = `📞 ${SugamI18n.get('calmCallName', { name, phone })}`;
        helperBtn.onclick = () => { window.open(`tel:${phone}`); };
      } else {
        helperBtn.style.display = 'none';
      }
    }
  }

  if (btnCalmMoment) {
    btnCalmMoment.addEventListener('click', async () => {
      if (currentTab?.id && SugamInjector.canRunOn(currentTab.url)) {
        try {
          await notifyContentScript('TRIGGER_CALM_MOMENT');
          setTimeout(() => window.close(), 100);
          return;
        } catch (err) {
          console.warn('Could not trigger calm moment in page, displaying popup modal fallback:', err);
        }
      }
      // Fallback for internal browser pages or injection issues
      loadCalmMomentPopupUI();
      showModal('modal-calm');
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

  document.querySelectorAll('input[name="colorTheme"]').forEach((radio) => {
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
  document.querySelectorAll('.preset-btn').forEach((btn) => {
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
        btnToggleSite.textContent = isDisabled ? 'Re-enable on this website' : 'Never run on this website';
        announce(isDisabled ? 'SUGAM disabled on this site' : 'SUGAM enabled on this site');
      }
    });
  }

  // 8. Help Dialog Binding
  function loadHelpUI() {
    const phone = settings.trustedPerson?.phone || '';
    const txt = document.getElementById('txt-trusted-contact');
    const input = document.getElementById('input-trusted-phone');
    if (txt) {
      txt.textContent = phone ? `Phone: ${phone}` : 'No phone number saved yet. Enter caregiver number below:';
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
      announce('Caregiver phone number saved');
    });
  }

  const btnCallHelper = document.getElementById('btn-call-helper');
  if (btnCallHelper) {
    btnCallHelper.addEventListener('click', () => {
      const phone = settings.trustedPerson?.phone;
      if (phone) {
        window.open(`tel:${phone}`);
      } else {
        alert('Please enter a phone number below and click Save.');
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
        alert('Please enter a phone number below and click Save.');
      }
    });
  }

  const btnCopySummary = document.getElementById('btn-copy-summary');
  if (btnCopySummary) {
    btnCopySummary.addEventListener('click', () => {
      if (currentTab?.id) {
        notifyContentScript('EXTRACT_PAGE_CONTENT').then((resp) => {
          const text = resp?.content?.slice(0, 500) || 'Could not read page text.';
          const summaryText = `Help needed on this page (${currentTab.title || 'Webpage'}):\n"${text}..."`;
          navigator.clipboard.writeText(summaryText);
          alert(SugamI18n.get('helpSummaryCopied'));
        });
      }
    });
  }

  // "Use SUGAM on every website": asks Chrome for access to all sites. Off by default.
  const chkAllSites = document.getElementById('chk-all-sites');
  if (chkAllSites) {
    chkAllSites.checked = await SugamInjector.hasAllSites();
    chkAllSites.addEventListener('change', async () => {
      if (chkAllSites.checked) {
        chkAllSites.checked = await SugamInjector.requestAllSites();
      } else {
        await SugamInjector.removeAllSites();
      }
    });
  }

  // 9. Gear Buttons for Feature Options
  document.querySelectorAll('.tile-gear-btn').forEach((btn) => {
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

    if (!settings[feature]) {
      settings[feature] = {};
    }

    // Work summaries (plain 5th-grade explanation for cognitive accessibility)
    const workDescriptions = {
      timerFreeze: {
        title: '⏳ Take Your Time (Timer Freeze)',
        work: 'Websites often use ticking countdown clocks to create urgency, causing panic and rushed mistakes. This helper detects visible countdowns, translates them into calm, clear words (e.g. "You have about 5 minutes"), and can save your form drafts automatically so you never lose your progress.'
      },
      dyslexiaFont: {
        title: '🔤 Dyslexia-Friendly Font',
        work: 'Standard website fonts can look crowded, causing letters to mirror, swap, or blur. This helper replaces page text with specialized dyslexia fonts featuring heavier baselines and distinct letter shapes to make reading effortless.'
      },
      readingRuler: {
        title: '📏 Reading Ruler',
        work: 'Dense lines of text can make you skip sentences or lose your place. The reading ruler creates a gentle colored focus strip that follows your cursor or finger, while softly shading the surrounding page.'
      },
      bionicRead: {
        title: '👁️ Bionic Read',
        work: 'Bolds the first few letters of each word. Your eyes lock onto the bold letters while your brain naturally completes the word, guiding smooth eye movement and reducing visual fatigue.'
      },
      summariser: {
        title: '🖼️ Summarise',
        work: 'Converts long, complex articles and official notices into a maximum of 8 plain sentences with helpful pictograms, displayed in an easy-read side panel.'
      },
      readAloud: {
        title: '🔊 Read Aloud',
        work: 'Reads webpage text aloud in a calm, clear voice using speech synthesis. It automatically speaks currency figures in words (e.g. ₹5,000 as "5000 rupees") so prices and amounts are easy to hear.'
      },
      formWizard: {
        title: '📝 Form Wizard',
        work: 'Government portals and application forms often have dozens of crowded fields. The Form Wizard breaks them into one calm question at a time on full-screen cards, with large buttons and voice dictation.'
      },
      translate: {
        title: '🌐 Translate',
        work: 'Translates complex English web pages into plain, easy-to-understand Hindi or Odia (or English if browsing regional pages), replacing dense legalese with simple everyday words.'
      },
      moneyPractice: {
        title: '💳 Money Practice (UPI Sandbox)',
        work: 'A completely safe, risk-free training simulator with play money. Practice scanning QR codes, entering demo PINs, paying simulated bills, and learning how to spot real-world payment scams before touching real banking apps.'
      },
      scamGuard: {
        title: '🛡️ Scam Safety Guard',
        work: 'Watches for deceptive fraud tactics, fake banking websites, aggressive pressure countdowns ("Account will be blocked in 24 hours!"), and sneaky requests for your secret PIN or OTP.'
      },
      explainWord: {
        title: '💡 Explain This Word',
        work: 'Government, banking, and legal websites are filled with difficult jargon. Simply highlight or tap any confusing word or phrase on the page to see an instant, 5th-grade plain-language definition.'
      },
      numbersHelper: {
        title: '🔢 Numbers Helper',
        work: 'Long strings of digits and large financial figures (like ₹12,50,000) can cause disorientation or dyscalculia fatigue. This helper spells out numbers in plain Indian words (lakhs & crores) and splits long numbers into readable chunks.'
      }
    };

    const descInfo = workDescriptions[feature] || {
      title: `${feature} Options`,
      work: 'Options for this helper are tuned for maximum clarity and cognitive comfort.'
    };

    title.textContent = descInfo.title;

    // Common "work in short" header block
    const workHeaderHtml = `
      <div class="feature-work-card">
        <span class="feature-work-badge">What this helper does</span>
        <p class="feature-work-desc">${descInfo.work}</p>
      </div>
    `;

    if (feature === 'timerFreeze') {
      body.innerHTML = `
        ${workHeaderHtml}
        <div class="form-group">
          <label for="sel-timer-level" class="group-label">Timer Assistance Level</label>
          <select id="sel-timer-level" class="form-control-select">
            <option value="1">Level 1: Plain words countdown banner (Calm wording - Recommended)</option>
            <option value="2">Level 2: Pause web countdown timers (Opt-in on non-financial forms)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="checkbox-row">
            <input type="checkbox" id="chk-timer-alerts">
            <span>Warn me gently before a page session expires</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" id="chk-timer-autosave">
            <span>Automatically save typed form answers to prevent work loss</span>
          </label>
        </div>
        <div class="info-callout privacy">
          🔒 <b>Safety Guarantee:</b> Real banking timers and OTP countdowns are never paused for your security.
        </div>
      `;
      const selLevel = body.querySelector('#sel-timer-level');
      const chkAlerts = body.querySelector('#chk-timer-alerts');
      const chkAutosave = body.querySelector('#chk-timer-autosave');

      if (selLevel) {
        selLevel.value = settings.timerFreeze?.level || 1;
        selLevel.addEventListener('change', async (e) => {
          settings.timerFreeze.level = parseInt(e.target.value, 10);
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
      if (chkAlerts) {
        chkAlerts.checked = settings.timerFreeze?.sessionAlerts !== false;
        chkAlerts.addEventListener('change', async (e) => {
          settings.timerFreeze.sessionAlerts = e.target.checked;
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
      if (chkAutosave) {
        chkAutosave.checked = settings.timerFreeze?.autoSaveForms !== false;
        chkAutosave.addEventListener('change', async (e) => {
          settings.timerFreeze.autoSaveForms = e.target.checked;
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
    } else if (feature === 'dyslexiaFont') {
      body.innerHTML = `
        ${workHeaderHtml}
        <div class="form-group">
          <label for="sel-font-family" class="group-label">Font Family</label>
          <select id="sel-font-family" class="form-control-select">
            <option value="Lexend">Lexend (Clear &amp; modern, reduces crowding)</option>
            <option value="Atkinson">Atkinson Hyperlegible (Distinguishable letterforms)</option>
            <option value="OpenDyslexic">OpenDyslexic (Weighted bottoms prevent flipping)</option>
            <option value="System">System Sans-Serif (Standard clean Arial / Verdana)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="checkbox-row">
            <input type="checkbox" id="chk-font-spacing">
            <span>Apply relaxed letter and word spacing for easier tracking</span>
          </label>
        </div>
        <div class="info-callout">
          🇮🇳 <b>Regional Support:</b> Hindi and Odia text automatically use Noto Sans Devanagari and Noto Sans Odia.
        </div>
      `;
      const sel = body.querySelector('#sel-font-family');
      const chkSpacing = body.querySelector('#chk-font-spacing');
      if (sel) {
        sel.value = settings.dyslexiaFont?.fontFamily || 'Lexend';
        sel.addEventListener('change', async (e) => {
          settings.dyslexiaFont.fontFamily = e.target.value;
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
      if (chkSpacing) {
        chkSpacing.checked = settings.dyslexiaFont?.applySpacing !== false;
        chkSpacing.addEventListener('change', async (e) => {
          settings.dyslexiaFont.applySpacing = e.target.checked;
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
    } else if (feature === 'readingRuler') {
      body.innerHTML = `
        ${workHeaderHtml}
        <div class="form-group">
          <label for="range-ruler-h" class="range-label">Ruler Height: <span id="val-ruler-h">${settings.readingRuler?.height || 70}px</span></label>
          <input type="range" id="range-ruler-h" min="40" max="140" value="${settings.readingRuler?.height || 70}">
        </div>
        <div class="form-group">
          <label for="range-ruler-dim" class="range-label">Dimming Strength: <span id="val-ruler-dim">${Math.round((settings.readingRuler?.dimmingStrength || 0.45) * 100)}%</span></label>
          <input type="range" id="range-ruler-dim" min="10" max="80" value="${Math.round((settings.readingRuler?.dimmingStrength || 0.45) * 100)}">
        </div>
        <div class="form-group">
          <label for="sel-ruler-tint" class="group-label">Highlight Tint Color</label>
          <select id="sel-ruler-tint" class="form-control-select">
            <option value="rgba(231, 221, 240, 0.45)">Pale Lilac (Calming)</option>
            <option value="rgba(255, 249, 196, 0.45)">Soft Yellow (High comfort)</option>
            <option value="rgba(227, 242, 253, 0.45)">Soft Blue (Cool &amp; clear)</option>
            <option value="rgba(232, 245, 233, 0.45)">Mint Green (Gentle)</option>
          </select>
        </div>
      `;
      const rangeH = body.querySelector('#range-ruler-h');
      const rangeDim = body.querySelector('#range-ruler-dim');
      const selTint = body.querySelector('#sel-ruler-tint');

      if (rangeH) {
        rangeH.addEventListener('input', async (e) => {
          const valH = body.querySelector('#val-ruler-h');
          if (valH) valH.textContent = `${e.target.value}px`;
          settings.readingRuler.height = parseInt(e.target.value, 10);
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
      if (rangeDim) {
        rangeDim.addEventListener('input', async (e) => {
          const valDim = body.querySelector('#val-ruler-dim');
          if (valDim) valDim.textContent = `${e.target.value}%`;
          settings.readingRuler.dimmingStrength = parseInt(e.target.value, 10) / 100;
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
      if (selTint) {
        selTint.value = settings.readingRuler?.tintColor || 'rgba(231, 221, 240, 0.45)';
        selTint.addEventListener('change', async (e) => {
          settings.readingRuler.tintColor = e.target.value;
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
    } else if (feature === 'bionicRead') {
      body.innerHTML = `
        ${workHeaderHtml}
        <div class="form-group">
          <label for="sel-bionic-strength" class="group-label">Fixation Boldness Strength</label>
          <select id="sel-bionic-strength" class="form-control-select">
            <option value="light">Light (bolds first ~30% of each word)</option>
            <option value="medium">Medium (bolds first ~45% of each word - Recommended)</option>
            <option value="strong">Strong (bolds first ~60% of each word)</option>
          </select>
        </div>
        <div class="info-callout">
          💡 <b>Reading Tip:</b> Let your eyes glide over the bolded letters. Your brain will automatically recognize the words.
        </div>
      `;
      const selStrength = body.querySelector('#sel-bionic-strength');
      if (selStrength) {
        selStrength.value = settings.bionicRead?.strength || 'medium';
        selStrength.addEventListener('change', async (e) => {
          settings.bionicRead.strength = e.target.value;
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
    } else if (feature === 'summariser') {
      body.innerHTML = `
        ${workHeaderHtml}
        <div class="info-callout privacy" style="margin-top: 6px;">
          🔒 <b>100% Private &amp; On-Device:</b> Summaries are generated locally on this device. Page text is never sent to external computers or cloud services.
        </div>
        <button class="btn-modal-action" id="btn-open-sidepanel">
          📖 Open Summariser in Side Panel
        </button>
      `;
      const btnSidepanel = body.querySelector('#btn-open-sidepanel');
      if (btnSidepanel) {
        btnSidepanel.addEventListener('click', () => {
          if (chrome.sidePanel?.open && currentTab?.id) {
            chrome.sidePanel.open({ tabId: currentTab.id }).catch(() => {});
          }
          window.close();
        });
      }
    } else if (feature === 'readAloud') {
      body.innerHTML = `
        ${workHeaderHtml}
        <div class="form-group">
          <label for="range-read-rate" class="range-label">Reading Speed: <span id="val-read-rate">${settings.readAloud?.rate || 0.9}x</span></label>
          <input type="range" id="range-read-rate" min="0.7" max="1.3" step="0.05" value="${settings.readAloud?.rate || 0.9}">
        </div>
        <div class="form-group">
          <label for="range-read-pitch" class="range-label">Voice Pitch: <span id="val-read-pitch">${settings.readAloud?.pitch || 1.0}</span></label>
          <input type="range" id="range-read-pitch" min="0.8" max="1.2" step="0.05" value="${settings.readAloud?.pitch || 1.0}">
        </div>
        <div class="form-group">
          <label class="checkbox-row">
            <input type="checkbox" id="chk-read-rupees">
            <span>Speak rupee amounts in full words (e.g. "500 rupees")</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" id="chk-read-highlight">
            <span>Highlight words on the page as they are read</span>
          </label>
        </div>
        <button class="btn-modal-action" id="btn-trigger-speech">
          🔊 Read Current Page Now
        </button>
      `;
      const rangeRate = body.querySelector('#range-read-rate');
      const rangePitch = body.querySelector('#range-read-pitch');
      const chkRupees = body.querySelector('#chk-read-rupees');
      const chkHighlight = body.querySelector('#chk-read-highlight');
      const btnSpeech = body.querySelector('#btn-trigger-speech');

      if (rangeRate) {
        rangeRate.addEventListener('input', async (e) => {
          const valEl = body.querySelector('#val-read-rate');
          if (valEl) valEl.textContent = `${e.target.value}x`;
          settings.readAloud.rate = parseFloat(e.target.value);
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
      if (rangePitch) {
        rangePitch.addEventListener('input', async (e) => {
          const valEl = body.querySelector('#val-read-pitch');
          if (valEl) valEl.textContent = e.target.value;
          settings.readAloud.pitch = parseFloat(e.target.value);
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
      if (chkRupees) {
        chkRupees.checked = settings.readAloud?.readAmountsInWords !== false;
        chkRupees.addEventListener('change', async (e) => {
          settings.readAloud.readAmountsInWords = e.target.checked;
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
      if (chkHighlight) {
        chkHighlight.checked = settings.readAloud?.highlightWords !== false;
        chkHighlight.addEventListener('change', async (e) => {
          settings.readAloud.highlightWords = e.target.checked;
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
      if (btnSpeech) {
        btnSpeech.addEventListener('click', async () => {
          await notifyContentScript('TRIGGER_READ_ALOUD');
          setTimeout(() => window.close(), 100);
        });
      }
    } else if (feature === 'formWizard') {
      body.innerHTML = `
        ${workHeaderHtml}
        <div class="form-group">
          <label class="checkbox-row">
            <input type="checkbox" id="chk-wizard-speak">
            <span>Read each question aloud automatically</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" id="chk-wizard-chunk">
            <span>Add friendly spaces to long phone and account numbers</span>
          </label>
        </div>
        <button class="btn-modal-action" id="btn-launch-wz-direct">
          📝 Open Form Wizard on This Page
        </button>
        <div class="info-callout privacy">
          🔒 <b>Non-Negotiable Privacy:</b> SUGAM never submits forms for you, and never touches passwords, PINs, or OTPs.
        </div>
      `;
      const chkSpeak = body.querySelector('#chk-wizard-speak');
      const chkChunk = body.querySelector('#chk-wizard-chunk');
      const btnWz = body.querySelector('#btn-launch-wz-direct');

      if (chkSpeak) {
        chkSpeak.checked = Boolean(settings.formWizard?.speakQuestions);
        chkSpeak.addEventListener('change', async (e) => {
          settings.formWizard.speakQuestions = e.target.checked;
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
      if (chkChunk) {
        chkChunk.checked = settings.formWizard?.chunkNumbers !== false;
        chkChunk.addEventListener('change', async (e) => {
          settings.formWizard.chunkNumbers = e.target.checked;
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
      if (btnWz) {
        btnWz.addEventListener('click', async () => {
          await notifyContentScript('TRIGGER_FORM_WIZARD');
          setTimeout(() => window.close(), 100);
        });
      }
    } else if (feature === 'translate') {
      body.innerHTML = `
        ${workHeaderHtml}
        <div class="form-group">
          <label for="sel-target-lang" class="group-label">Preferred Translation Language</label>
          <select id="sel-target-lang" class="form-control-select">
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="or">ଓଡ଼ିଆ (Odia)</option>
            <option value="en">English</option>
          </select>
        </div>
        <div class="form-group">
          <label class="checkbox-row">
            <input type="checkbox" id="chk-translate-gemini">
            <span>Use Gemini AI for smoother regional translation (requires Gemini API key)</span>
          </label>
        </div>
        <div class="info-callout warning">
          ⚠️ <b>Important Check:</b> Computer translations may make mistakes with technical terms. Always check original numbers and dates.
        </div>
      `;
      const selTarget = body.querySelector('#sel-target-lang');
      const chkGemini = body.querySelector('#chk-translate-gemini');

      if (selTarget) {
        selTarget.value = settings.translate?.targetLanguage || 'hi';
        selTarget.addEventListener('change', async (e) => {
          settings.translate.targetLanguage = e.target.value;
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
      if (chkGemini) {
        chkGemini.checked = Boolean(settings.translate?.useGemini);
        chkGemini.addEventListener('change', async (e) => {
          settings.translate.useGemini = e.target.checked;
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
    } else if (feature === 'moneyPractice') {
      const currentBal = settings.moneyPractice?.demoBalance ?? 2500;
      body.innerHTML = `
        ${workHeaderHtml}
        <div class="form-group">
          <label class="group-label">Current Practice Balance</label>
          <div style="font-size:22px; font-weight:800; color:#2E7D32;">
            ₹${currentBal.toLocaleString('en-IN')}
          </div>
          <p style="font-size:12px; color:#666;">
            Your safe practice PIN is: <b>1 2 3 4</b>
          </p>
        </div>
        <div class="form-group">
          <button class="btn-modal-action secondary" id="btn-reset-demo-bal">
            🔄 Reset Balance to ₹2,500
          </button>
        </div>
        <div class="info-callout warning">
          💡 <b>Golden Safety Rule:</b> You NEVER type a UPI PIN to receive money! A PIN is only typed when you are SENDING money.
        </div>
        <button class="btn-modal-action" id="btn-launch-sandbox">
          📱 Launch UPI Practice Sandbox
        </button>
      `;
      const btnReset = body.querySelector('#btn-reset-demo-bal');
      const btnSandbox = body.querySelector('#btn-launch-sandbox');

      if (btnReset) {
        btnReset.addEventListener('click', async () => {
          settings.moneyPractice.demoBalance = 2500;
          await SugamStorage.saveSettings(settings);
          announce('Demo balance reset to ₹2,500');
          openFeatureOptionsModal('moneyPractice');
        });
      }
      if (btnSandbox) {
        btnSandbox.addEventListener('click', () => {
          chrome.tabs.create({ url: chrome.runtime.getURL('sandbox/upi-practice.html') });
          window.close();
        });
      }
    } else if (feature === 'scamGuard') {
      const savedPhone = settings.trustedPerson?.phone || '';
      body.innerHTML = `
        ${workHeaderHtml}
        <div class="form-group">
          <label class="checkbox-row">
            <input type="checkbox" id="chk-scam-urgent">
            <span>Alert me on urgent or threatening language (e.g. "blocked in 24 hours")</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" id="chk-scam-lookalikes">
            <span>Alert me on fake bank lookalike web addresses</span>
          </label>
        </div>
        <div class="help-action-card highlight-safety" style="margin-top:6px;">
          <div class="hac-title">🛡️ National Cyber Crime Helpline: 1930</div>
          <p style="font-size:12.5px;">Toll-free in India. Call immediately if anyone threatens you for PIN, OTP, or money.</p>
        </div>
        <div class="info-callout">
          👨‍👩‍👧 <b>Trusted Helper:</b> ${savedPhone ? `Phone: ${savedPhone}` : 'No phone saved yet. You can add one in the Help dialog.'}
        </div>
      `;
      const chkUrgent = body.querySelector('#chk-scam-urgent');
      const chkLookalikes = body.querySelector('#chk-scam-lookalikes');

      if (chkUrgent) {
        chkUrgent.checked = settings.scamGuard?.warnOnUrgentWords !== false;
        chkUrgent.addEventListener('change', async (e) => {
          settings.scamGuard.warnOnUrgentWords = e.target.checked;
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
      if (chkLookalikes) {
        chkLookalikes.checked = settings.scamGuard?.warnOnLookalikes !== false;
        chkLookalikes.addEventListener('change', async (e) => {
          settings.scamGuard.warnOnLookalikes = e.target.checked;
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
    } else if (feature === 'explainWord') {
      body.innerHTML = `
        ${workHeaderHtml}
        <div class="form-group">
          <label for="sel-explain-lang" class="group-label">Explanation Language</label>
          <select id="sel-explain-lang" class="form-control-select">
            <option value="match">Match extension language (English / Hindi / Odia)</option>
            <option value="simple-en">Always Simple English</option>
          </select>
        </div>
        <div class="info-callout">
          💡 <b>How to use:</b> Turn on "Explain this word" in the popup, then simply highlight any confusing word on the page with your mouse. A simple meaning card will pop up beside it.
        </div>
      `;
      const selExplainLang = body.querySelector('#sel-explain-lang');
      if (selExplainLang) {
        selExplainLang.value = settings.explainWord?.lang || 'match';
        selExplainLang.addEventListener('change', async (e) => {
          settings.explainWord.lang = e.target.value;
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
    } else if (feature === 'numbersHelper') {
      body.innerHTML = `
        ${workHeaderHtml}
        <div class="form-group">
          <label class="checkbox-row">
            <input type="checkbox" id="chk-num-words">
            <span>Show Indian amounts in words (e.g. ₹1,50,000 → "1 lakh 50 thousand rupees")</span>
          </label>
          <label class="checkbox-row">
            <input type="checkbox" id="chk-num-chunks">
            <span>Add spaces to long phone and account numbers (e.g. 98765 43210)</span>
          </label>
        </div>
        <div class="info-callout">
          🇮🇳 <b>Numbering Standard:</b> Uses familiar Indian numbering (Lakhs and Crores) to reduce dyscalculia fatigue.
        </div>
      `;
      const chkWords = body.querySelector('#chk-num-words');
      const chkChunks = body.querySelector('#chk-num-chunks');

      if (chkWords) {
        chkWords.checked = settings.numbersHelper?.showWords !== false;
        chkWords.addEventListener('change', async (e) => {
          settings.numbersHelper.showWords = e.target.checked;
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
      if (chkChunks) {
        chkChunks.checked = settings.numbersHelper?.chunkDigits !== false;
        chkChunks.addEventListener('change', async (e) => {
          settings.numbersHelper.chunkDigits = e.target.checked;
          await SugamStorage.saveSettings(settings);
          notifyContentScript('SETTINGS_UPDATED', { settings });
        });
      }
    } else {
      body.innerHTML = `
        ${workHeaderHtml}
        <p style="font-size:14px;">Options for this helper are automatically tuned for maximum clarity and cognitive comfort.</p>
      `;
    }

    showModal('modal-feature-options');
  }
});
