/**
 * SUGAM - Safe UPI & Money Practice Sandbox Controller
 * Interactive smartphone simulation with guided steps, coach feedback,
 * and 4 realistic scam spotter training scenarios.
 */

document.addEventListener('DOMContentLoaded', async () => {
  let settings = await SugamStorage.getSettings();
  let demoBalance = settings.moneyPractice?.demoBalance || 2500;

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
    phoneBalanceElem.textContent = `Play Balance: ₹${demoBalance.toLocaleString('en-IN')}`;
  }
  updateBalanceDisplay();

  function updateCoach(text) {
    coachTextElem.innerHTML = text;
  }

  // TTS for Coach
  btnListenCoach.addEventListener('click', () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }
    const clean = coachTextElem.innerText.replace(/₹\s*(\d+)/g, '$1 rupees');
    const u = new SpeechSynthesisUtterance(clean);
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
    updateCoach('Play balance reset to <strong>₹2,500</strong>. You are ready to practise!');
  });

  document.getElementById('btn-exit-sandbox').addEventListener('click', () => {
    window.close();
  });

  // Number to Indian Words
  function numberToWords(num) {
    if (isNaN(num) || num <= 0) return 'Zero rupees';
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
    updateCoach('<strong>Step 1:</strong> Tap a person to send play money to. Look at their name and UPI ID.');
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
      document.getElementById('txt-selected-payee').textContent = `Paying ${currentPayee.name}`;
      document.getElementById('inp-amount').value = '';
      document.getElementById('txt-amount-words').textContent = 'Zero rupees';

      showScreen('amount');
      updateCoach(
        `<strong>Step 2:</strong> Type how much you want to send to <strong>${currentPayee.name}</strong>. Always check the words below the amount.`
      );
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

  // Proceed to Review
  document.getElementById('btn-proceed-to-review').addEventListener('click', () => {
    if (currentAmount <= 0) {
      alert('Please enter an amount of at least ₹1.');
      return;
    }
    if (currentAmount > demoBalance) {
      alert(`You only have ₹${demoBalance} play money. Enter a smaller amount.`);
      return;
    }

    document.getElementById('rev-payee-name').textContent = currentPayee.name;
    document.getElementById('rev-payee-upi').textContent = currentPayee.upi;
    document.getElementById('rev-amount').textContent = `₹${currentAmount}`;
    document.getElementById('rev-amount-words').textContent = numberToWords(currentAmount);

    showScreen('review');
    updateCoach(
      `<strong>Step 3: Check Carefully!</strong> Look at the name (<strong>${currentPayee.name}</strong>) and amount (<strong>₹${currentAmount}</strong>). You are SENDING money from your bank.`
    );
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
    updateCoach(
      '<strong>Step 4: Enter Practice PIN.</strong> On real phones, never tell anyone your PIN. In this sandbox, type <strong>1 2 3 4</strong>.'
    );
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
      alert('Please enter all 4 digits of your practice PIN.');
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
      document.getElementById('rec-time').textContent =
        `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      showScreen('receipt');
      updateCoach(
        '🎉 <strong>Payment Successful!</strong> You checked who you were paying, checked the amount, and entered the practice PIN. Outstanding job!'
      );
    } else {
      document.getElementById('txt-pin-error').classList.remove('hidden');
      updateCoach(
        '⚠️ That was not 1234. No worries! Tap <strong>C</strong> to clear, then type <strong>1 2 3 4</strong>.'
      );
    }
  });

  document.getElementById('btn-finish-receipt').addEventListener('click', () => {
    startSendFlow();
  });

  // SCAM SPOTTER SCENARIOS (Section 5.1)
  const scamScenarios = {
    'scam-refund': {
      title: 'Scam Scenario 1: Fake Refund Request',
      coachMessage:
        '⚠️ <strong>Scam Spotter:</strong> A stranger says they overpaid you by accident and asks you to enter your PIN to get the refund. What should you do?',
      content: `
        <div class="scam-message-banner">
          <span class="scam-badge">Incoming Payment Request</span>
          <div class="scam-msg-body">
            <strong>Unknown Caller (Rajesh Kumar):</strong><br>
            "Sir, I mistakenly sent ₹5,000 to your Google Pay! I sent you a collect request. Please enter your 4-digit UPI PIN now to receive your refund."
          </div>
        </div>
        <div class="scam-question">What is the Golden Rule here?</div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          <button class="scam-option-btn" id="scam-opt-wrong-1">
            ❌ Enter PIN so I can receive the ₹5,000 refund
          </button>
          <button class="scam-option-btn" id="scam-opt-correct-1">
            ✅ Decline immediately! You NEVER enter a PIN to receive money!
          </button>
        </div>
      `,
      onCorrect: () => {
        updateCoach(
          '🌟 <strong>BRILLIANT!</strong> You remembered Golden Rule #1: You <strong>NEVER</strong> enter a UPI PIN to receive money. A PIN is ONLY for sending money out of your account!'
        );
      },
      onWrong: () => {
        updateCoach(
          '🚨 <strong>STOP! Danger!</strong> If you enter your PIN, ₹5,000 will be STOLEN from your bank! Remember: You <em>never</em> type a PIN to receive money.'
        );
      }
    },

    'scam-qr': {
      title: 'Scam Scenario 2: Scan QR to Receive Lottery',
      coachMessage:
        '⚠️ <strong>Scam Spotter:</strong> You receive a message with a QR code promising ₹2,000 festival cashback.',
      content: `
        <div class="scam-message-banner">
          <span class="scam-badge">WhatsApp Lottery Message</span>
          <div class="scam-msg-body">
            <strong>Festival Lottery Offer:</strong><br>
            "Congratulations! You won ₹2,000 cash. Open your UPI app and SCAN THIS QR CODE to receive the cash directly into your bank!"
          </div>
        </div>
        <div class="scam-question">What actually happens when you scan a QR code?</div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          <button class="scam-option-btn" id="scam-opt-correct-2">
            ✅ Scanning a QR code always SENDS money out of my account. I will not scan!
          </button>
          <button class="scam-option-btn" id="scam-opt-wrong-2">
            ❌ Scanning a QR code receives money into my bank.
          </button>
        </div>
      `,
      onCorrect: () => {
        updateCoach(
          '🌟 <strong>PERFECT!</strong> Scanning a QR code is for PAYING money at a store or to a person. It NEVER receives money into your account.'
        );
      },
      onWrong: () => {
        updateCoach(
          "🚨 <strong>DANGER!</strong> Scanning a QR code always makes a payment. Scammers use fake 'receive' QR codes to drain your account!"
        );
      }
    },

    'scam-kyc': {
      title: 'Scam Scenario 3: Urgent Bank KYC Threat',
      coachMessage:
        '⚠️ <strong>Scam Spotter:</strong> You receive an SMS threatening that your bank account will be blocked today.',
      content: `
        <div class="scam-message-banner">
          <span class="scam-badge">Urgent SMS</span>
          <div class="scam-msg-body">
            <strong>Alert from SBI-Bank-Notice:</strong><br>
            "Dear customer, your bank account will be BLOCKED in 2 hours due to pending KYC! Click http://sbi-kyc-verify-portal.top to update your ATM card and PIN immediately."
          </div>
        </div>
        <div class="scam-question">How can you tell this is a fake threat?</div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          <button class="scam-option-btn" id="scam-opt-correct-3">
            ✅ Banks never threaten immediate blockage or ask for ATM PIN/password via SMS links!
          </button>
          <button class="scam-option-btn" id="scam-opt-wrong-3">
            ❌ Click the link fast before my account is blocked!
          </button>
        </div>
      `,
      onCorrect: () => {
        updateCoach(
          '🌟 <strong>EXCELLENT!</strong> Banks never send urgent threat links asking for card details or PINs. If you ever feel scared, call <strong>1930</strong> (National Cyber Helpline).'
        );
      },
      onWrong: () => {
        updateCoach(
          "🚨 <strong>DON'T PANIC!</strong> Scammers use artificial panic and urgency ('blocked in 2 hours') to make people act without thinking. Real banks never do this!"
        );
      }
    },

    shop: {
      title: 'Practice: Genuine Grocery Store Payment',
      coachMessage:
        '🛒 <strong>Positive Practice:</strong> You are buying ₹80 of groceries at Kirana Store. Tap to check merchant name and pay safely.',
      content: `
        <div style="background:#FFFFFF; border:2px solid #59366E; border-radius:14px; padding:18px;">
          <h3 style="color:#59366E; margin-bottom:8px;">At the Grocery Store Counter</h3>
          <p>Merchant QR Code shows: <strong>Kirana Grocery Store (Verified Merchant)</strong></p>
          <div style="font-size:24px; font-weight:800; color:#59366E; margin:14px 0;">Bill: ₹80</div>
          <button class="btn-phone-primary" id="btn-start-shop-pay">Proceed to Pay ₹80 Safely</button>
        </div>
      `,
      setup: () => {
        document.getElementById('btn-start-shop-pay').addEventListener('click', () => {
          currentPayee = { name: 'Kirana Grocery Store', upi: 'merchant@icici', avatar: '🏪' };
          currentAmount = 80;
          document.getElementById('rev-payee-name').textContent = currentPayee.name;
          document.getElementById('rev-payee-upi').textContent = currentPayee.upi;
          document.getElementById('rev-amount').textContent = '₹80';
          document.getElementById('rev-amount-words').textContent = 'Eighty rupees';
          showScreen('review');
          updateCoach(
            'Check the shop name: <strong>Kirana Grocery Store</strong> and amount <strong>₹80</strong>. Tap Enter Practice PIN.'
          );
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
