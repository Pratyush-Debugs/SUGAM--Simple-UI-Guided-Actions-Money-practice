/**
 * SUGAM - Safe UPI & Money Practice Sandbox Controller
 * Interactive smartphone simulation with guided steps, coach feedback,
 * and 4 realistic scam spotter training scenarios.
 *
 * All text comes from shared/i18n.js (English, Hindi, Odia). Coach messages contain
 * <strong>/<em> markup, so they are SUGAM's own bundled strings; names and amounts
 * placed into them are escaped first.
 */

document.addEventListener('DOMContentLoaded', async () => {
  let settings = await SugamStorage.getSettings();
  let demoBalance = settings.moneyPractice?.demoBalance || 2500;

  const lang = settings.language || 'en';
  SugamI18n.setLanguage(lang);
  SugamI18n.translatePage();
  const t = (key, values) => SugamI18n.get(key, values);
  const esc = (value) => SugamDom.escapeHtml(value);
  const SPEECH_LANG = { en: 'en-IN', hi: 'hi-IN', or: 'or-IN' };

  // State
  let currentPayee = { name: 'Mom', upi: 'mom@okhdfcbank', avatar: '👩' };
  let currentAmount = 0;
  let enteredPin = '';
  const PRACTICE_PIN = '1234';

  // Elements
  const phoneBalanceElem = document.getElementById('phone-balance');
  const coachTextElem = document.getElementById('coach-text');
  const btnListenCoach = document.getElementById('btn-listen-coach');

  // Screens
  const screens = {
    contact: document.getElementById('step-choose-contact'),
    amount: document.getElementById('step-enter-amount'),
    review: document.getElementById('step-review'),
    pin: document.getElementById('step-pin'),
    receipt: document.getElementById('step-receipt'),
    scam: document.getElementById('step-scam-scenario')
  };

  function showScreen(name) {
    Object.values(screens).forEach((s) => {
      s.classList.remove('active');
      s.hidden = true;
    });
    screens[name].classList.add('active');
    screens[name].hidden = false;
  }

  function updateBalanceDisplay() {
    phoneBalanceElem.textContent = t('upiPlayBalance', { amount: demoBalance.toLocaleString('en-IN') });
  }
  updateBalanceDisplay();

  /** Shows a coach message. `html` must be one of SUGAM's own translation strings. */
  function updateCoach(html) {
    coachTextElem.innerHTML = html;
  }

  // TTS for Coach, in the chosen language
  btnListenCoach.addEventListener('click', () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }
    const clean = coachTextElem.innerText.replace(/₹\s*([\d,]+)/g, (m, amount) => t('upiRupees', { amount }));
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = SPEECH_LANG[lang] || 'en-IN';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  });

  // Reset demo balance
  document.getElementById('btn-reset-balance').addEventListener('click', async () => {
    demoBalance = 2500;
    if (!settings.moneyPractice) settings.moneyPractice = {};
    settings.moneyPractice.demoBalance = 2500;
    await SugamStorage.saveSettings(settings);
    updateBalanceDisplay();
    startSendFlow();
    updateCoach(t('upiCoachReset'));
  });

  document.getElementById('btn-exit-sandbox').addEventListener('click', () => {
    window.close();
  });

  // Amount in words. English gets full Indian-system words; Hindi and Odia show the
  // grouped number with the rupee word until native-speaker number words are added.
  function numberToWords(num) {
    if (isNaN(num) || num <= 0) return t('upiZeroRupees');
    if (lang !== 'en') return t('upiRupees', { amount: num.toLocaleString('en-IN') });

    const a = [
      '',
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten',
      'eleven',
      'twelve',
      'thirteen',
      'fourteen',
      'fifteen',
      'sixteen',
      'seventeen',
      'eighteen',
      'nineteen'
    ];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    function inWords(n) {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' hundred' + (n % 100 !== 0 ? ' ' + inWords(n % 100) : '');
      if (n < 100000)
        return inWords(Math.floor(n / 1000)) + ' thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
      return inWords(Math.floor(n / 100000)) + ' lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
    }

    const words = inWords(num);
    return words.charAt(0).toUpperCase() + words.slice(1) + ' rupees';
  }

  // FLOW 1: Standard Send Money
  function startSendFlow() {
    showScreen('contact');
    updateCoach(t('upiCoachStep1'));
  }

  // Contact list selection
  document.querySelectorAll('.contact-item').forEach((item) => {
    item.addEventListener('click', () => {
      currentPayee = {
        name: item.dataset.contact,
        upi: item.dataset.upi,
        avatar: item.dataset.avatar
      };

      document.getElementById('txt-selected-avatar').textContent = currentPayee.avatar;
      document.getElementById('txt-selected-payee').textContent = t('upiPaying', { name: currentPayee.name });
      document.getElementById('inp-amount').value = '';
      document.getElementById('txt-amount-words').textContent = numberToWords(0);

      showScreen('amount');
      updateCoach(t('upiCoachStep2', { name: esc(currentPayee.name) }));
    });
  });

  // Amount input
  const inpAmount = document.getElementById('inp-amount');
  inpAmount.addEventListener('input', () => {
    const val = parseInt(inpAmount.value, 10) || 0;
    currentAmount = val;
    document.getElementById('txt-amount-words').textContent = numberToWords(val);
  });

  document.querySelectorAll('.chip-btn').forEach((chip) => {
    chip.addEventListener('click', () => {
      const add = parseInt(chip.dataset.amt, 10);
      const val = (parseInt(inpAmount.value, 10) || 0) + add;
      inpAmount.value = val;
      currentAmount = val;
      document.getElementById('txt-amount-words').textContent = numberToWords(val);
    });
  });

  document.getElementById('btn-back-to-contacts').addEventListener('click', () => {
    showScreen('contact');
  });

  function showReview() {
    document.getElementById('rev-payee-name').textContent = currentPayee.name;
    document.getElementById('rev-payee-upi').textContent = currentPayee.upi;
    document.getElementById('rev-amount').textContent = `₹${currentAmount}`;
    document.getElementById('rev-amount-words').textContent = numberToWords(currentAmount);
    showScreen('review');
  }

  // Proceed to Review
  document.getElementById('btn-proceed-to-review').addEventListener('click', () => {
    if (currentAmount <= 0) {
      alert(t('upiAlertMinAmount'));
      return;
    }
    if (currentAmount > demoBalance) {
      alert(t('upiAlertTooMuch', { balance: demoBalance }));
      return;
    }

    showReview();
    updateCoach(t('upiCoachStep3', { name: esc(currentPayee.name), amount: currentAmount }));
  });

  document.getElementById('btn-back-to-amount').addEventListener('click', () => {
    showScreen('amount');
  });

  // Proceed to PIN
  document.getElementById('btn-proceed-to-pin').addEventListener('click', () => {
    enteredPin = '';
    updatePinDots();
    document.getElementById('txt-pin-error').classList.add('hidden');
    showScreen('pin');
    updateCoach(t('upiCoachStep4'));
  });

  // Keypad logic
  function updatePinDots() {
    for (let i = 1; i <= 4; i++) {
      const dot = document.getElementById(`dot-${i}`);
      if (enteredPin.length >= i) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    }
  }

  document.querySelectorAll('.key-btn[data-key]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (enteredPin.length < 4) {
        enteredPin += btn.dataset.key;
        updatePinDots();
      }
    });
  });

  document.getElementById('key-clear').addEventListener('click', () => {
    enteredPin = '';
    updatePinDots();
    document.getElementById('txt-pin-error').classList.add('hidden');
  });

  document.getElementById('key-submit').addEventListener('click', async () => {
    if (enteredPin.length < 4) {
      alert(t('upiAlertPinDigits'));
      return;
    }

    if (enteredPin === PRACTICE_PIN) {
      // Success! Deduct demo balance
      demoBalance -= currentAmount;
      if (!settings.moneyPractice) settings.moneyPractice = {};
      settings.moneyPractice.demoBalance = demoBalance;
      await SugamStorage.saveSettings(settings);
      updateBalanceDisplay();

      document.getElementById('rec-amount').textContent = `₹${currentAmount}`;
      document.getElementById('rec-payee').textContent = currentPayee.name;
      document.getElementById('rec-time').textContent = t('upiToday', {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      showScreen('receipt');
      updateCoach(t('upiCoachSuccess'));
    } else {
      document.getElementById('txt-pin-error').classList.remove('hidden');
      updateCoach(t('upiCoachWrongPin'));
    }
  });

  document.getElementById('btn-finish-receipt').addEventListener('click', () => {
    startSendFlow();
  });

  /** Builds a scam message with two answer buttons. `n` picks the upiScam{n}* strings. */
  function scamContent(n, correctFirst) {
    const correct = `<button class="scam-option-btn" id="scam-opt-correct-${n}">✅ ${t(`upiScam${n}Correct`)}</button>`;
    const wrong = `<button class="scam-option-btn" id="scam-opt-wrong-${n}">❌ ${t(`upiScam${n}Wrong`)}</button>`;
    return `
      <div class="scam-message-banner">
        <span class="scam-badge">${t(`upiScam${n}Badge`)}</span>
        <div class="scam-msg-body">
          <strong>${t(`upiScam${n}From`)}</strong><br>
          ${t(`upiScam${n}Message`)}
        </div>
      </div>
      <div class="scam-question">${t(`upiScam${n}Question`)}</div>
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${correctFirst ? correct + wrong : wrong + correct}
      </div>
    `;
  }

  function scamScenario(n, correctFirst) {
    return {
      title: t(`upiScam${n}Title`),
      coachMessage: t(`upiScam${n}Coach`),
      content: scamContent(n, correctFirst),
      onCorrect: () => updateCoach(t(`upiScam${n}OnCorrect`)),
      onWrong: () => updateCoach(t(`upiScam${n}OnWrong`))
    };
  }

  // SCAM SPOTTER SCENARIOS (Section 5.1)
  const scamScenarios = {
    'scam-refund': scamScenario(1, false),
    'scam-qr': scamScenario(2, true),
    'scam-kyc': scamScenario(3, true),

    shop: {
      title: t('upiShopTitle'),
      coachMessage: t('upiShopCoach'),
      content: `
        <div style="background:#FFFFFF; border:2px solid #59366E; border-radius:14px; padding:18px;">
          <h3 style="color:#59366E; margin-bottom:8px;">${t('upiShopCounter')}</h3>
          <p>${t('upiShopMerchant')}</p>
          <div style="font-size:24px; font-weight:800; color:#59366E; margin:14px 0;">${t('upiShopBill')}</div>
          <button class="btn-phone-primary" id="btn-start-shop-pay">${t('upiShopProceed')}</button>
        </div>
      `,
      setup: () => {
        document.getElementById('btn-start-shop-pay').addEventListener('click', () => {
          currentPayee = { name: 'Kirana Grocery Store', upi: 'merchant@icici', avatar: '🏪' };
          currentAmount = 80;
          showReview();
          updateCoach(t('upiShopCheck'));
        });
      }
    }
  };

  // Activity button clicks
  document.querySelectorAll('.activity-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.activity-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const flow = btn.dataset.flow;
      if (flow === 'send') {
        startSendFlow();
      } else {
        const scenario = scamScenarios[flow];
        if (scenario) {
          showScreen('scam');
          updateCoach(scenario.coachMessage);
          const box = document.getElementById('scam-box');
          box.innerHTML = `
            <h2 class="step-title">${scenario.title}</h2>
            ${scenario.content}
          `;

          if (scenario.setup) scenario.setup();

          // Attach correct/wrong handlers
          box.querySelectorAll('.scam-option-btn').forEach((opt) => {
            opt.addEventListener('click', () => {
              if (opt.id.includes('correct')) {
                opt.style.borderColor = '#2E7D32';
                opt.style.backgroundColor = '#E8F5E9';
                scenario.onCorrect();
              } else {
                opt.style.borderColor = '#D32F2F';
                opt.style.backgroundColor = '#FFEBEE';
                scenario.onWrong();
              }
            });
          });
        }
      }
    });
  });

  // Start with default send flow
  startSendFlow();
});
