/**
 * SUGAM - Form Wizard (4.9)
 * Methods are mixed into SugamEngine by content/content.js, so `this` is the engine.
 */

globalThis.SugamFeatures = globalThis.SugamFeatures || {};

SugamFeatures.formWizard = {
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
      forms.forEach((f) => {
        const els = f.querySelectorAll('input, textarea, select');
        els.forEach((el) => candidates.push(el));
      });
    }
    if (candidates.length === 0) {
      const standalone = document.querySelectorAll('input, textarea, select');
      standalone.forEach((el) => candidates.push(el));
    }

    // Filter out hidden, submit, button, reset, image
    const valid = candidates.filter((el) => {
      const tag = (el.tagName || '').toLowerCase();
      const type = (el.type || 'text').toLowerCase();
      if (tag !== 'input' && tag !== 'textarea' && tag !== 'select') return false;
      if (type === 'hidden' || type === 'submit' || type === 'button' || type === 'reset' || type === 'image')
        return false;
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
    launcherPill.setAttribute('aria-label', t('wzLauncherLabel'));
    launcherPill.innerHTML = `
      <span style="font-size: 18px;" aria-hidden="true">📝</span>
      <span>${t('wzLauncher', { n: fields.length })}</span>
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
        <div class="sugam-tb-title"><span>📝</span> ${t('wzName')}</div>
        <div>${t('wzNoFields')}</div>
        <button class="sugam-tb-btn" id="sugam-notice-close">${t('close')}</button>
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
    } catch {
      /* storage unavailable: start without a saved draft */
    }

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
    container.setAttribute('aria-label', t('wzName'));
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
          <span class="sugam-wz-step" id="sugam-wz-step-num">${t('wizardStartTitle')}</span>
          <button class="sugam-badge-btn" id="sugam-wz-close" aria-label="${t('wzCloseLabel')}">✕ ${t('close')}</button>
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
        return { ok: false, msg: t('wzRequired') };
      }

      if (type === 'tel' || pattern.includes('[0-9]{10}') || /phone|mobile/i.test(el.name + ' ' + el.id)) {
        const digits = value.replace(/\D/g, '');
        if (value && digits.length < 10) {
          const diff = 10 - digits.length;
          return {
            ok: false,
            msg: t('wzPhoneDigits', { typed: digits.length, more: diff })
          };
        }
      }

      if (type === 'email' || /email/i.test(el.name + ' ' + el.id)) {
        if (value && (!value.includes('@') || !value.includes('.'))) {
          return { ok: false, msg: t('wzEmail') };
        }
      }

      if (/pincode|postal|zip/i.test(el.name + ' ' + el.id)) {
        const digits = value.replace(/\D/g, '');
        if (value && digits.length < 6) {
          return {
            ok: false,
            msg: t('wzPincode', { typed: digits.length, more: 6 - digits.length })
          };
        }
      }

      return { ok: true, msg: '' };
    };

    // Speech recognition handler
    const startDictation = (inputElem, micBtn) => {
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRec) {
        alert(t('wzNoDictation'));
        return;
      }
      try {
        const recognition = new SpeechRec();
        recognition.lang =
          this.settings.language === 'hi' ? 'hi-IN' : this.settings.language === 'or' ? 'or-IN' : 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = false;

        micBtn.textContent = `🔴 ${t('wzListening')}`;
        micBtn.style.backgroundColor = '#FFEBEE';
        micBtn.style.color = '#C62828';

        recognition.onresult = (evt) => {
          const speechText = evt.results[0][0].transcript;
          inputElem.value = (inputElem.value ? inputElem.value + ' ' : '') + speechText;
          inputElem.dispatchEvent(new Event('input', { bubbles: true }));
        };
        recognition.onerror = () => {
          micBtn.textContent = `🎙️ ${t('wzDictate')}`;
          micBtn.style.backgroundColor = '';
          micBtn.style.color = '';
        };
        recognition.onend = () => {
          micBtn.textContent = `🎙️ ${t('wzDictate')}`;
          micBtn.style.backgroundColor = '';
          micBtn.style.color = '';
        };
        recognition.start();
      } catch (e) {
        console.warn('Speech recognition error', e);
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
        stepNum.textContent = t('wzStartStep');
        progressFill.style.width = '5%';

        const requiredItems = elements.filter((el) => el.required || isFieldSensitive(el));
        let reqListHtml = '';
        if (requiredItems.length > 0) {
          reqListHtml = `
            <div style="background:#E7DDF0; border-radius:12px; padding:16px; margin:16px 0;">
              <strong style="color:#59366E; font-size:16px; display:block; margin-bottom:8px;">${t('wzItemsNeeded')}</strong>
              <ul style="padding-left:20px; line-height:1.6; font-size:15px;">
                ${requiredItems.map((el) => `<li>${esc(this.getFieldLabel(el))}</li>`).join('')}
              </ul>
            </div>
          `;
        }

        body.innerHTML = `
          <h2 class="sugam-wz-label">${t('wzWelcome')}</h2>
          <p class="sugam-wz-hint">
            ${t('wzIntro', { n: elements.length })}
          </p>
          ${reqListHtml}
          <div style="font-size:14px; color:#59366E; margin-top:8px;">
            ${t('wzPromise')}
          </div>
        `;

        footerBtns.innerHTML = `
          <button class="sugam-wz-btn-link" id="wz-act-cancel">${t('wzCancel')}</button>
          <button class="sugam-wz-btn sugam-wz-btn-primary" id="wz-act-start">${t('wzStartQ1')}</button>
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
        stepNum.textContent = t('wizardCheckAnswers');
        progressFill.style.width = '100%';

        let reviewItemsHtml = '';
        elements.forEach((el, idx) => {
          const label = this.getFieldLabel(el);
          const isSensitive = isFieldSensitive(el);
          const val = isSensitive
            ? t('wzPrivateEnter')
            : wizardData[idx]
              ? esc(wizardData[idx])
              : `<em>${t('wzNotAnswered')}</em>`;

          reviewItemsHtml += `
            <div class="sugam-review-item">
              <div>
                <strong>${esc(label)}</strong>
                <div style="margin-top:2px;">${val}</div>
              </div>
              ${!isSensitive ? `<button class="sugam-btn-change" data-idx="${idx}">${t('wizardChange')}</button>` : ''}
            </div>
          `;
        });

        body.innerHTML = `
          <h2 class="sugam-wz-label">${t('wizardCheckAnswers')}</h2>
          <p class="sugam-wz-hint">${t('wzReviewHint')}</p>
          <div class="sugam-review-list">${reviewItemsHtml}</div>
          <div style="background:#FFF3E0; border:1.5px solid #FF9800; border-radius:10px; padding:12px; font-size:14px; color:#29252D;">
            ${t('wzFillNote')}
          </div>
        `;

        footerBtns.innerHTML = `
          <button class="sugam-wz-btn sugam-wz-btn-secondary" id="wz-act-back-review">← ${t('back')}</button>
          <button class="sugam-wz-btn sugam-wz-btn-primary" id="wz-act-fill">${t('wzFill')}</button>
        `;

        // Change button handlers
        container.querySelectorAll('.sugam-btn-change').forEach((btn) => {
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
          const realSubmit =
            document.querySelector('button[type="submit"], input[type="submit"]') || elements[elements.length - 1];
          if (realSubmit) {
            realSubmit.scrollIntoView({ behavior: 'smooth', block: 'center' });
            realSubmit.style.outline = '4px solid #59366E';
            realSubmit.style.outlineOffset = '4px';
            realSubmit.focus();
          }

          // Announcement
          this.announceToScreenReader(t('wizardDoneHandoff'));
        });
        return;
      }

      // SCREEN 2: Individual Question Steps (Spec 4.9.3 - 4.9.5)
      const el = elements[currentStep];
      const label = this.getFieldLabel(el);
      const isSensitive = isFieldSensitive(el);
      const tag = (el.tagName || '').toLowerCase();
      const type = (el.type || 'text').toLowerCase();
      const placeholder =
        el.placeholder || (el.getAttribute('autocomplete') ? `Example for ${el.getAttribute('autocomplete')}` : '');
      const val = wizardData[currentStep] || el.value || '';

      const pct = Math.round(((currentStep + 1) / elements.length) * 100);
      stepNum.textContent = t('wizardStepOf', { current: currentStep + 1, total: elements.length });
      progressFill.style.width = `${pct}%`;

      let inputWidgetHtml = '';

      if (isSensitive) {
        inputWidgetHtml = `
          <div style="background:#FFF3E0; border:2px solid #E65100; padding:18px; border-radius:12px; margin-bottom:16px;">
            <strong style="color:#BF360C; font-size:16px; display:block; margin-bottom:6px;">🔒 ${t('wzPrivateTitle')}</strong>
            <p style="font-size:15px; line-height:1.5;">${t('wzPrivateBody')}</p>
          </div>
        `;
      } else if (tag === 'select') {
        // Replicate select options
        const optionsHtml = Array.from(el.options)
          .map(
            (opt) => `
          <option value="${esc(opt.value)}" ${opt.value === val ? 'selected' : ''}>${esc(opt.text)}</option>
        `
          )
          .join('');
        inputWidgetHtml = `
          <select class="sugam-wz-select" id="sugam-curr-field">${optionsHtml}</select>
        `;
      } else if (tag === 'textarea') {
        inputWidgetHtml = `
          <div class="sugam-input-row">
            <textarea class="sugam-wz-textarea" id="sugam-curr-field" rows="4" placeholder="${esc(placeholder)}">${esc(val)}</textarea>
            <button class="sugam-mic-btn" id="sugam-mic-btn" type="button" aria-label="${t('wzDictateLabel')}">🎙️ ${t('wzDictate')}</button>
          </div>
        `;
      } else {
        // Standard text, email, tel input
        inputWidgetHtml = `
          <div class="sugam-input-row">
            <input class="sugam-wz-input" id="sugam-curr-field" type="${type === 'password' ? 'text' : type}" placeholder="${esc(placeholder)}" value="${esc(val)}" />
            <button class="sugam-mic-btn" id="sugam-mic-btn" type="button" aria-label="${t('wzDictateLabel')}">🎙️ ${t('wzDictate')}</button>
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
        <button class="sugam-wz-btn-link" id="wz-act-save-later">${esc(t('wzSaveLater'))}</button>
        <div style="display:flex; gap:10px;">
          <button class="sugam-wz-btn sugam-wz-btn-secondary" id="wz-act-prev" ${currentStep === 0 ? 'style="display:none;"' : ''}>← Back</button>
          <button class="sugam-wz-btn sugam-wz-btn-primary" id="wz-act-next">
            ${currentStep === elements.length - 1 ? t('wzReviewAnswers') : t('wzNextQuestion')}
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
        } catch {
          /* storage unavailable: the draft is simply not saved */
        }
        container.remove();
        this.wizardModalElem = null;
        alert(t('wzSaved'));
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
      return el.name
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]/g, ' ')
        .trim();
    }
    return t('wzQuestion');
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
  }
};
