/**
 * SUGAM - Internationalization (i18n) Module
 * Plain 5th-grade language translations for English, Hindi, and Odia.
 */

const SUGAM_TRANSLATIONS = {
  en: {
    appName: 'SUGAM',
    appSubtitle: 'Simple UI, Guided Actions & Money practice',
    comfortSettings: 'Comfort settings',
    turnOffAll: 'Turn off all helpers',
    turnOnAll: 'Turn on all helpers',
    statusOn: 'On',
    statusOff: 'Off',
    help: 'Help',
    options: 'Options',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    save: 'Save',
    reset: 'Reset',
    disclaimerComputer:
      'This summary is made by a computer and may have mistakes. Check the original for money, health and legal information.',
    disclaimerTranslation: 'Computer translation. Check amounts and dates in the original.',
    disclaimerTimer: "SUGAM paused the on-screen clock. The website's own clock may still run.",
    disclaimerBionic: 'Some people find this easier. Studies have not shown it makes reading faster for most people.',
    floatingTurnOff: 'SUGAM is on: Turn off',
    neverOnThisSite: 'Never run on this site',
    siteDisabled: 'SUGAM is turned off for this site.',

    // Tiles
    tileTimer: 'Take your time',
    tileTimerDesc: 'Pause panic timers and read countdowns in plain words.',
    tileFont: 'Dyslexia font',
    tileFontDesc: 'Clean letter shapes and friendly spacing.',
    tileRuler: 'Reading ruler',
    tileRulerDesc: 'A gentle reading line that guides your eyes.',
    tileBionic: 'Bionic read',
    tileBionicDesc: 'Bold word starts to guide eye movement.',
    tileSummarise: 'Summarise with pictures',
    tileSummariseDesc: 'Short easy-read cards with helpful pictures.',
    tileReadAloud: 'Read aloud',
    tileReadAloudDesc: 'Listen to text with word highlighting.',
    tileFormWizard: 'Form wizard',
    tileFormWizardDesc: 'Fill forms one easy question at a time.',
    tileTranslate: 'Translate',
    tileTranslateDesc: 'Read in Hindi, Odia, or English.',
    tileMoneyPractice: 'Money practice',
    tileMoneyPracticeDesc: 'Safe UPI practice and scam spotter training.',
    tileScamGuard: 'Scam safety guard',
    tileScamGuardDesc: 'Warns about fake links, threats, and PIN traps.',
    tileExplainWord: 'Explain this word',
    tileExplainWordDesc: 'Tap any word to see what it means.',
    tileNumbersHelper: 'Numbers helper',
    tileNumbersHelperDesc: 'Shows amounts in words and reads digits slowly.',
    tileWhereWasI: 'Where was I?',
    tileWhereWasIDesc: 'Remembers your page and task when you take a break.',

    // Calm Moment
    iNeedAMoment: 'I need a moment',
    calmTitle: 'You are safe.',
    calmSubtitle: 'Nothing has been sent. Take all the time you need.',
    breatheIn: 'Breathe in slowly...',
    breatheHold: 'Hold gently...',
    breatheOut: 'Breathe out slowly...',
    callHelper: 'Call trusted person',
    messageHelper: 'Message trusted person',
    cyberHelpline: 'Call 1930 Cyber Helpline',
    returnToPage: 'I am ready to continue',

    // UPI Practice
    upiTitle: 'Safe UPI & Money Practice',
    upiBalanceLabel: 'Practice Money:',
    upiPracticePinHint: 'Your practice PIN is: 1234',
    upiSendMoney: 'Send Practice Money',
    upiScanQr: 'Scan Practice QR',
    upiPayBill: 'Pay Practice Bill',
    upiScamSpotter: 'Play Scam Spotter',
    upiRuleNeverPinToReceive: 'Important rule: You NEVER type a PIN to receive money!',
    upiRuleCheckNameAmount: "Important rule: Always check the person's name and amount before paying.",
    upiWrongPin: "That PIN was not 1234. Don't worry! Try again: 1 2 3 4.",

    // Form Wizard
    wizardStartTitle: 'What you will need',
    wizardStepOf: 'Step {current} of {total}',
    wizardCheckAnswers: 'Check your answers',
    wizardChange: 'Change',
    wizardSensitiveNotice:
      "This is a private password or PIN. SUGAM never touches private details. Please type directly into the website's own secure box.",
    wizardDoneHandoff:
      "Your answers are filled in. You can now review and tap the website's submit button. SUGAM never submits forms for you.",

    // Help Dialog
    helpTitle: 'Need assistance?',
    helpCaregiverContact: 'Your Trusted Helper:',
    helpNotSet: 'No helper number saved yet.',
    helpCopySummary: 'Copy page summary to send helper',
    helpSummaryCopied: 'Page summary copied to clipboard!',
    helpNationalHelpline: 'National Cyber Crime Helpline: 1930 (Toll Free)',

    spTitle: 'SUGAM Reader',

    spTabsLabel: 'Reading modes',

    spTabCards: 'Easy cards',

    spRefreshCards: 'Refresh cards',

    spReadAll: 'Read all cards',

    spLoading: 'Creating easy-read cards...',

    spTranslateInto: 'Translate page into:',

    spTranslateButton: 'Translate page',

    spTranslatePlaceholder: 'Choose a language and tap Translate page to read comfortably.',

    spMemoryTitle: 'Where you were',

    spMemoryIntro: 'SUGAM remembers your pages so you never feel lost when taking a break.',

    spNoCards: 'No summary cards available.',

    spNoPage: 'No active web page found.',

    spCouldNotSummarise: 'Could not summarise this page.',

    spListen: 'Listen',

    spListenCard: 'Listen to card {n}',

    spTranslating: 'Translating...',

    spTranslateFailed: 'Translation failed: {error}',

    spNoMemory: 'No recent pages recorded yet.',

    spSavedAt: 'Saved at {time}',

    spResume: 'Resume reading',

    upiSubtitle: 'Practise with play money. Learn to spot real-world scams.',

    upiResetMoney: 'Reset Demo Money (₹2,500)',

    upiBackToBrowsing: 'Back to browsing',

    upiGoldenRules: 'The 3 Golden Rules',

    upiRule1:
      '<strong>1. Never enter a PIN to receive money:</strong> A UPI PIN is <em>only</em> used to SEND money from your bank.',

    upiRule2: '<strong>2. Always check the name and amount:</strong> Look at the screen before typing your PIN.',

    upiRule3:
      '<strong>3. Stop. Check. Ask:</strong> If someone rushes or threatens you, hang up and call <strong>1930</strong>.',

    upiCoachName: 'Coach Sugam',

    upiCoachStatus: 'Here to help you practice safely',

    upiCoachWelcome:
      'Welcome! This phone uses <strong>play money</strong>. Your practice PIN is <strong>1 2 3 4</strong>. Choose an activity below to begin.',

    upiListenCoach: 'Listen to Coach',

    upiChooseMode: 'Choose Practice Mode:',

    upiModeSend: 'Send Money (Standard Flow)',

    upiModeScam1: 'Scam 1: "Enter PIN to Receive Refund"',

    upiModeScam2: 'Scam 2: "Scan QR to Receive Lottery"',

    upiModeScam3: 'Scam 3: "Urgent Bank KYC Threat"',

    upiModeShop: 'Genuine Grocery Shop Payment',

    upiPhoneLabel: 'Virtual UPI Smartphone Screen',

    upiDemoTag: 'DEMO UPI APP',

    upiHello: 'Hello, Rahul!',

    upiPlayBalance: 'Play Balance: ₹{amount}',

    upiWhoToPay: 'Who do you want to pay?',

    upiVerifiedShop: 'Verified Shop',

    upiPayingSomeone: 'Paying Someone',

    upiPaying: 'Paying {name}',

    upiEnterAmount: 'Enter Rupee Amount:',

    upiZeroRupees: 'Zero rupees',

    upiRupees: '{amount} rupees',

    upiReviewPayment: 'Review Payment',

    upiCheckCarefully: 'Please Check Carefully',

    upiPayingTo: 'Paying to:',

    upiUpiId: 'UPI ID:',

    upiAmount: 'Amount:',

    upiSendingAlert: 'ℹ️ You are <strong>SENDING</strong> money from your bank account.',

    upiChangeAmount: 'Change Amount',

    upiEnterPracticePin: 'Enter Practice PIN',

    upiEnterUpiPin: 'Enter UPI PIN',

    upiTypePracticePin: 'Type practice PIN: <strong>1 2 3 4</strong>',

    upiPinDotsLabel: 'PIN entered digits',

    upiPinError: '❌ That was not 1234. No worries! Try typing 1 2 3 4.',

    upiKeypadLabel: 'PIN keypad',

    upiClearKey: 'Clear',

    upiConfirmKey: 'Confirm PIN',

    upiPaymentSuccessful: 'Payment Successful!',

    upiPaidTo: 'Paid to',

    upiSafetyRecap: '👍 You checked the name, verified the amount, and safely sent money. Well done!',

    upiStartNew: 'Start New Practice',

    upiToday: 'Today, {time}',

    upiCoachReset: 'Play balance reset to <strong>₹2,500</strong>. You are ready to practise!',

    upiCoachStep1: '<strong>Step 1:</strong> Tap a person to send play money to. Look at their name and UPI ID.',

    upiCoachStep2:
      '<strong>Step 2:</strong> Type how much you want to send to <strong>{name}</strong>. Always check the words below the amount.',

    upiCoachStep3:
      '<strong>Step 3: Check Carefully!</strong> Look at the name (<strong>{name}</strong>) and amount (<strong>₹{amount}</strong>). You are SENDING money from your bank.',

    upiCoachStep4:
      '<strong>Step 4: Enter Practice PIN.</strong> On real phones, never tell anyone your PIN. In this sandbox, type <strong>1 2 3 4</strong>.',

    upiCoachSuccess:
      '🎉 <strong>Payment Successful!</strong> You checked who you were paying, checked the amount, and entered the practice PIN. Outstanding job!',

    upiCoachWrongPin:
      '⚠️ That was not 1234. No worries! Tap <strong>C</strong> to clear, then type <strong>1 2 3 4</strong>.',

    upiAlertMinAmount: 'Please enter an amount of at least ₹1.',

    upiAlertTooMuch: 'You only have ₹{balance} play money. Enter a smaller amount.',

    upiAlertPinDigits: 'Please enter all 4 digits of your practice PIN.',

    upiScam1Title: 'Scam Scenario 1: Fake Refund Request',

    upiScam1Coach:
      '⚠️ <strong>Scam Spotter:</strong> A stranger says they overpaid you by accident and asks you to enter your PIN to get the refund. What should you do?',

    upiScam1Badge: 'Incoming Payment Request',

    upiScam1From: 'Unknown Caller (Rajesh Kumar):',

    upiScam1Message:
      '"Sir, I mistakenly sent ₹5,000 to your Google Pay! I sent you a collect request. Please enter your 4-digit UPI PIN now to receive your refund."',

    upiScam1Question: 'What is the Golden Rule here?',

    upiScam1Wrong: 'Enter PIN so I can receive the ₹5,000 refund',

    upiScam1Correct: 'Decline immediately! You NEVER enter a PIN to receive money!',

    upiScam1OnCorrect:
      '🌟 <strong>BRILLIANT!</strong> You remembered Golden Rule #1: You <strong>NEVER</strong> enter a UPI PIN to receive money. A PIN is ONLY for sending money out of your account!',

    upiScam1OnWrong:
      '🚨 <strong>STOP! Danger!</strong> If you enter your PIN, ₹5,000 will be STOLEN from your bank! Remember: You <em>never</em> type a PIN to receive money.',

    upiScam2Title: 'Scam Scenario 2: Scan QR to Receive Lottery',

    upiScam2Coach:
      '⚠️ <strong>Scam Spotter:</strong> You receive a message with a QR code promising ₹2,000 festival cashback.',

    upiScam2Badge: 'WhatsApp Lottery Message',

    upiScam2From: 'Festival Lottery Offer:',

    upiScam2Message:
      '"Congratulations! You won ₹2,000 cash. Open your UPI app and SCAN THIS QR CODE to receive the cash directly into your bank!"',

    upiScam2Question: 'What actually happens when you scan a QR code?',

    upiScam2Correct: 'Scanning a QR code always SENDS money out of my account. I will not scan!',

    upiScam2Wrong: 'Scanning a QR code receives money into my bank.',

    upiScam2OnCorrect:
      '🌟 <strong>PERFECT!</strong> Scanning a QR code is for PAYING money at a store or to a person. It NEVER receives money into your account.',

    upiScam2OnWrong:
      "🚨 <strong>DANGER!</strong> Scanning a QR code always makes a payment. Scammers use fake 'receive' QR codes to drain your account!",

    upiScam3Title: 'Scam Scenario 3: Urgent Bank KYC Threat',

    upiScam3Coach:
      '⚠️ <strong>Scam Spotter:</strong> You receive an SMS threatening that your bank account will be blocked today.',

    upiScam3Badge: 'Urgent SMS',

    upiScam3From: 'Alert from SBI-Bank-Notice:',

    upiScam3Message:
      '"Dear customer, your bank account will be BLOCKED in 2 hours due to pending KYC! Click http://sbi-kyc-verify-portal.top to update your ATM card and PIN immediately."',

    upiScam3Question: 'How can you tell this is a fake threat?',

    upiScam3Correct: 'Banks never threaten immediate blockage or ask for ATM PIN/password via SMS links!',

    upiScam3Wrong: 'Click the link fast before my account is blocked!',

    upiScam3OnCorrect:
      '🌟 <strong>EXCELLENT!</strong> Banks never send urgent threat links asking for card details or PINs. If you ever feel scared, call <strong>1930</strong> (National Cyber Helpline).',

    upiScam3OnWrong:
      "🚨 <strong>DON'T PANIC!</strong> Scammers use artificial panic and urgency ('blocked in 2 hours') to make people act without thinking. Real banks never do this!",

    upiShopTitle: 'Practice: Genuine Grocery Store Payment',

    upiShopCoach:
      '🛒 <strong>Positive Practice:</strong> You are buying ₹80 of groceries at Kirana Store. Tap to check merchant name and pay safely.',

    upiShopCounter: 'At the Grocery Store Counter',

    upiShopMerchant: 'Merchant QR Code shows: <strong>Kirana Grocery Store (Verified Merchant)</strong>',

    upiShopBill: 'Bill: ₹80',

    upiShopProceed: 'Proceed to Pay ₹80 Safely',

    upiShopCheck:
      'Check the shop name: <strong>Kirana Grocery Store</strong> and amount <strong>₹80</strong>. Tap Enter Practice PIN.',

    scamTitle: 'Stop. Check. Ask.',

    scamBody:
      'This page has urgent threats or unverified domain details. Banks never threaten immediate suspension or ask for your PIN.',

    scamHelpline: 'Not sure? Call 1930 (Cyber Helpline).',

    scamDismiss: 'I understand, stay alert',

    calmLabel: 'Calm moment: You are safe',

    calmBreathe: 'Breathe',

    calmBreatheLabel: 'Breathe gently',

    calmHelper: 'Helper',

    calmCallName: 'Call {name} ({phone})',

    timerMinutesLeft: 'You have about <b>{minutes} minutes</b> left on this page. Take your time.',

    wzName: 'Form Wizard',

    wzLauncher: 'Form Wizard ({n} questions)',

    wzLauncherLabel: 'Open Form Wizard: Answer questions one at a time',

    wzNoFields:
      'No form fields were found on this page. Navigate to an application or registration page to use the wizard.',

    wzCloseLabel: 'Close wizard',

    wzStartStep: 'Start: What you will need',

    wzItemsNeeded: 'Items you will need for this form:',

    wzWelcome: 'Welcome to Form Wizard',

    wzIntro:
      'This webpage has <b>{n} questions</b>. We will show you <b>one question at a time</b> in large, friendly text so you can complete it comfortably.',

    wzPromise:
      '🛡️ <b>SUGAM Promise:</b> SUGAM will help you fill the answers, but <b>SUGAM never submits forms</b>. You will review and tap submit on the website yourself.',

    wzCancel: 'Cancel',

    wzStartQ1: 'Start Question 1 →',

    wzPrivateEnter: '🔒 (Private - Enter on website)',

    wzNotAnswered: '(Not answered)',

    wzReviewHint: 'Review your details below. If anything needs changing, tap Change.',

    wzFillNote:
      "ℹ️ When you tap <b>Fill into form</b>, SUGAM places your answers directly into the website's inputs. <b>SUGAM never submits forms</b>. You will press the website's submit button.",

    wzFill: 'Fill into form ✓',

    wzPrivateTitle: 'Private Password or PIN',

    wzPrivateBody:
      "SUGAM never stores, reads, or touches private passwords, PINs, or OTPs. Please continue through the wizard. When finished, type your password directly into the website's own secure box.",

    wzDictate: 'Dictate',

    wzDictateLabel: 'Dictate answer with voice',

    wzListening: 'Listening...',

    wzNoDictation: 'Speech dictation is not available in this browser window.',

    wzSaveLater: 'Save & finish later',

    wzReviewAnswers: 'Review answers →',

    wzNextQuestion: 'Next Question →',

    wzSaved: 'Your answers are saved. You can open Form Wizard anytime to continue.',

    wzRequired: '⚠️ Please answer this question to continue.',

    wzPhoneDigits: '⚠️ Your phone number needs 10 digits. You typed {typed}. Please add {more} more.',

    wzEmail: '⚠️ Please enter an email address with an @ and domain (e.g. name@example.com).',

    wzPincode: '⚠️ Pincode needs 6 digits. You typed {typed}. Add {more} more.',

    wzQuestion: 'Question',

    cloudConsentTitle: 'Use Google Gemini for better results?',

    cloudConsentBody:
      'SUGAM can send the text of this page to Google Gemini, a service on the internet, to make easier summaries and translations. Google may keep this text. SUGAM never sends pages with passwords, PINs or bank details.',

    cloudConsentYes: 'Yes, use Google Gemini',

    cloudConsentNo: 'No, keep everything on this device',

    spMadeOnDevice: 'Made on this device. Nothing was sent to the internet.',

    spMadeByCloud: 'Made by Google Gemini (cloud). The page text was sent to Google.',

    spTranslateNeedsCloud:
      'Translation needs Google Gemini. You chose to keep everything on this device. You can change this in SUGAM options.',

    spTranslateNeedsKey: 'Translation needs a Google Gemini key. Add one in SUGAM options.'
  },

  hi: {
    appName: 'सुगम',
    appSubtitle: 'सरल यूआई, मार्गदर्शित कार्य और मनी अभ्यास',
    comfortSettings: 'सुविधा सेटिंग्स',
    turnOffAll: 'सभी मददगार बंद करें',
    turnOnAll: 'सभी मददगार चालू करें',
    statusOn: 'चालू',
    statusOff: 'बंद',
    help: 'मदद',
    options: 'विकल्प',
    close: 'बंद करें',
    back: 'पीछे',
    next: 'आगे',
    save: 'सहेजें',
    reset: 'रीसेट',
    disclaimerComputer:
      'यह सारांश कंप्यूटर द्वारा बनाया गया है और इसमें गलतियां हो सकती हैं। पैसे, स्वास्थ्य और कानूनी जानकारी के लिए मूल पेज अवश्य देखें।',
    disclaimerTranslation: 'कंप्यूटर अनुवाद। मूल पेज में राशि और तारीखों की जांच करें।',
    disclaimerTimer: 'सुगम ने स्क्रीन की घड़ी रोकी है। वेबसाइट की अपनी घड़ी अभी भी चल सकती है।',
    disclaimerBionic:
      'कुछ लोगों को यह आसान लगता है। अध्ययनों में यह साबित नहीं हुआ है कि इससे सभी की पढ़ने की गति बढ़ती है।',
    floatingTurnOff: 'सुगम चालू है: बंद करें',
    neverOnThisSite: 'इस वेबसाइट पर कभी न चलाएं',
    siteDisabled: 'इस वेबसाइट के लिए सुगम बंद है।',

    // Tiles
    tileTimer: 'आराम से समय लें',
    tileTimerDesc: 'उलटी गिनती का तनाव रोकें और आसान शब्दों में समय समझें।',
    tileFont: 'डिस्लेक्सिया अनुकूल फॉन्ट',
    tileFontDesc: 'स्पष्ट अक्षर और खुला-खुला स्पेस।',
    tileRuler: 'रीडिंग रूलर',
    tileRulerDesc: 'एक आसान पट्टी जो पढ़ते समय आपकी आंखों को राह दिखाती है।',
    tileBionic: 'बायोनिक पठन',
    tileBionicDesc: 'शब्दों के शुरुआती अक्षरों को गाढ़ा करें।',
    tileSummarise: 'चित्रों के साथ सारांश',
    tileSummariseDesc: 'आसान चित्रों वाले छोटे और सरल कार्ड।',
    tileReadAloud: 'बोलकर सुनाएं',
    tileReadAloudDesc: 'शब्दों को हाईलाइट करते हुए आवाज़ में सुनें।',
    tileFormWizard: 'फॉर्म सहायक',
    tileFormWizardDesc: 'एक बार में केवल एक आसान सवाल का जवाब दें।',
    tileTranslate: 'अनुवाद',
    tileTranslateDesc: 'हिंदी, उड़िया या अंग्रेजी में पढ़ें।',
    tileMoneyPractice: 'मनी अभ्यास',
    tileMoneyPracticeDesc: 'सुरक्षित यूपीआई अभ्यास और धोखाधड़ी (स्कैम) पहचानना सीखें।',
    tileScamGuard: 'सुरक्षा गार्ड',
    tileScamGuardDesc: 'फर्जी लिंक, धमकी भरे संदेश और पिन चोरी से सावधान करें।',
    tileExplainWord: 'इस शब्द का अर्थ',
    tileExplainWordDesc: 'किसी भी शब्द को दबाकर उसका सरल अर्थ देखें।',
    tileNumbersHelper: 'संख्या सहायक',
    tileNumbersHelperDesc: 'रुपयों को शब्दों में देखें और अंकों को धीरे सुनें।',
    tileWhereWasI: 'मैं कहां था?',
    tileWhereWasIDesc: 'काम बीच में रुकने पर याद रखता है कि आप कहां थे।',

    // Calm Moment
    iNeedAMoment: 'मुझे एक पल चाहिए',
    calmTitle: 'आप सुरक्षित हैं।',
    calmSubtitle: 'कुछ भी भेजा नहीं गया है। जितना समय चाहिए उतना लें।',
    breatheIn: 'धीरे से सांस अंदर लें...',
    breatheHold: 'सांस रोकें...',
    breatheOut: 'धीरे से सांस बाहर छोड़ें...',
    callHelper: 'मददगार को फोन करें',
    messageHelper: 'मददगार को संदेश भेजें',
    cyberHelpline: '1930 साइबर हेल्पलाइन पर कॉल करें',
    returnToPage: 'मैं वापस जाने को तैयार हूँ',

    // UPI Practice
    upiTitle: 'सुरक्षित यूपीआई और मनी अभ्यास',
    upiBalanceLabel: 'अभ्यास राशि:',
    upiPracticePinHint: 'आपका अभ्यास पिन है: 1234',
    upiSendMoney: 'पैसे भेजने का अभ्यास करें',
    upiScanQr: 'क्यूआर स्कैन का अभ्यास करें',
    upiPayBill: 'बिल भरने का अभ्यास करें',
    upiScamSpotter: 'स्कैम पकड़ो खेलें',
    upiRuleNeverPinToReceive: 'ज़रूरी नियम: पैसे प्राप्त करने के लिए कभी पिन नहीं डाला जाता!',
    upiRuleCheckNameAmount: 'ज़रूरी नियम: भुगतान से पहले नाम और राशि की जांच हमेशा करें।',
    upiWrongPin: 'यह पिन 1234 नहीं था। कोई बात नहीं! फिर से डालें: 1 2 3 4.',

    // Form Wizard
    wizardStartTitle: 'आपको क्या-क्या चाहिए होगा',
    wizardStepOf: 'कदम {current} / {total}',
    wizardCheckAnswers: 'अपने जवाब जांचें',
    wizardChange: 'बदलें',
    wizardSensitiveNotice:
      'यह एक निजी पासवर्ड या पिन है। सुगम निजी जानकारी कभी नहीं छूता। कृपया वेबसाइट के अपने सुरक्षित बॉक्स में टाइप करें।',
    wizardDoneHandoff:
      'आपके जवाब भर दिए गए हैं। अब वेबसाइट का सबमिट बटन स्वयं दबाएं। सुगम कभी अपने आप फॉर्म जमा नहीं करता।',

    // Help Dialog
    helpTitle: 'मदद चाहिए?',
    helpCaregiverContact: 'आपके भरोसेमंद मददगार:',
    helpNotSet: 'अभी कोई नंबर सहेजा नहीं गया है।',
    helpCopySummary: 'पेज का सरल सारांश कॉपी करें',
    helpSummaryCopied: 'सारांश कॉपी हो गया!',
    helpNationalHelpline: 'राष्ट्रीय साइबर अपराध हेल्पलाइन: 1930 (टोल फ्री)',

    spTitle: 'सुगम रीडर',

    spTabsLabel: 'पढ़ने के तरीके',

    spTabCards: 'आसान कार्ड',

    spRefreshCards: 'कार्ड फिर से बनाएं',

    spReadAll: 'सभी कार्ड सुनें',

    spLoading: 'आसान कार्ड बन रहे हैं...',

    spTranslateInto: 'पेज को इस भाषा में बदलें:',

    spTranslateButton: 'पेज का अनुवाद करें',

    spTranslatePlaceholder: 'भाषा चुनें और "पेज का अनुवाद करें" दबाएं।',

    spMemoryTitle: 'आप कहाँ थे',

    spMemoryIntro: 'सुगम आपके पेज याद रखता है, ताकि आराम के बाद आप भटकें नहीं।',

    spNoCards: 'अभी कोई सारांश कार्ड नहीं है।',

    spNoPage: 'कोई खुला वेब पेज नहीं मिला।',

    spCouldNotSummarise: 'इस पेज का सारांश नहीं बन सका।',

    spListen: 'सुनें',

    spListenCard: 'कार्ड {n} सुनें',

    spTranslating: 'अनुवाद हो रहा है...',

    spTranslateFailed: 'अनुवाद नहीं हो सका: {error}',

    spNoMemory: 'अभी कोई पेज याद नहीं रखा गया है।',

    spSavedAt: '{time} पर सहेजा गया',

    spResume: 'फिर से पढ़ें',

    upiSubtitle: 'खेल वाले पैसों से अभ्यास करें। असली धोखाधड़ी पहचानना सीखें।',

    upiResetMoney: 'अभ्यास के पैसे फिर से ₹2,500 करें',

    upiBackToBrowsing: 'ब्राउज़िंग पर वापस जाएं',

    upiGoldenRules: '3 सुनहरे नियम',

    upiRule1:
      '<strong>1. पैसे पाने के लिए कभी PIN न डालें:</strong> UPI PIN <em>सिर्फ</em> आपके बैंक से पैसे भेजने के लिए होता है।',

    upiRule2: '<strong>2. हमेशा नाम और रकम जाँचें:</strong> PIN डालने से पहले स्क्रीन देखें।',

    upiRule3:
      '<strong>3. रुकें। जाँचें। पूछें:</strong> अगर कोई जल्दी करवाए या डराए, तो फ़ोन काट दें और <strong>1930</strong> पर कॉल करें।',

    upiCoachName: 'कोच सुगम',

    upiCoachStatus: 'सुरक्षित अभ्यास में आपकी मदद के लिए',

    upiCoachWelcome:
      'स्वागत है! यह फ़ोन <strong>खेल वाले पैसे</strong> इस्तेमाल करता है। आपका अभ्यास PIN <strong>1 2 3 4</strong> है। शुरू करने के लिए नीचे एक गतिविधि चुनें।',

    upiListenCoach: 'कोच को सुनें',

    upiChooseMode: 'अभ्यास का तरीका चुनें:',

    upiModeSend: 'पैसे भेजें (सामान्य तरीका)',

    upiModeScam1: 'धोखा 1: "रिफ़ंड पाने के लिए PIN डालें"',

    upiModeScam2: 'धोखा 2: "लॉटरी पाने के लिए QR स्कैन करें"',

    upiModeScam3: 'धोखा 3: "बैंक KYC की धमकी"',

    upiModeShop: 'असली किराना दुकान पर भुगतान',

    upiPhoneLabel: 'अभ्यास UPI फ़ोन की स्क्रीन',

    upiDemoTag: 'अभ्यास UPI ऐप',

    upiHello: 'नमस्ते, राहुल!',

    upiPlayBalance: 'खेल के पैसे: ₹{amount}',

    upiWhoToPay: 'आप किसे पैसे देना चाहते हैं?',

    upiVerifiedShop: 'जाँची हुई दुकान',

    upiPayingSomeone: 'किसी को भुगतान',

    upiPaying: '{name} को भुगतान',

    upiEnterAmount: 'रुपये की रकम लिखें:',

    upiZeroRupees: 'शून्य रुपये',

    upiRupees: '{amount} रुपये',

    upiReviewPayment: 'भुगतान जाँचें',

    upiCheckCarefully: 'कृपया ध्यान से जाँचें',

    upiPayingTo: 'किसे भुगतान:',

    upiUpiId: 'UPI ID:',

    upiAmount: 'रकम:',

    upiSendingAlert: 'ℹ️ आप अपने बैंक खाते से पैसे <strong>भेज</strong> रहे हैं।',

    upiChangeAmount: 'रकम बदलें',

    upiEnterPracticePin: 'अभ्यास PIN डालें',

    upiEnterUpiPin: 'UPI PIN डालें',

    upiTypePracticePin: 'अभ्यास PIN लिखें: <strong>1 2 3 4</strong>',

    upiPinDotsLabel: 'डाले गए PIN अंक',

    upiPinError: '❌ यह 1234 नहीं था। कोई बात नहीं! 1 2 3 4 लिखकर देखें।',

    upiKeypadLabel: 'PIN कीपैड',

    upiClearKey: 'मिटाएं',

    upiConfirmKey: 'PIN पक्का करें',

    upiPaymentSuccessful: 'भुगतान सफल रहा!',

    upiPaidTo: 'भुगतान किया गया:',

    upiSafetyRecap: '👍 आपने नाम देखा, रकम जाँची, और सुरक्षित तरीके से पैसे भेजे। बहुत अच्छा!',

    upiStartNew: 'नया अभ्यास शुरू करें',

    upiToday: 'आज, {time}',

    upiCoachReset: 'खेल के पैसे फिर से <strong>₹2,500</strong> हो गए। अब आप अभ्यास के लिए तैयार हैं!',

    upiCoachStep1:
      '<strong>पहला कदम:</strong> जिसे खेल वाले पैसे भेजने हैं, उस व्यक्ति को दबाएं। उनका नाम और UPI ID देखें।',

    upiCoachStep2:
      '<strong>दूसरा कदम:</strong> लिखें कि आप <strong>{name}</strong> को कितने पैसे भेजना चाहते हैं। रकम के नीचे लिखे शब्द हमेशा जाँचें।',

    upiCoachStep3:
      '<strong>तीसरा कदम: ध्यान से जाँचें!</strong> नाम (<strong>{name}</strong>) और रकम (<strong>₹{amount}</strong>) देखें। आप अपने बैंक से पैसे भेज रहे हैं।',

    upiCoachStep4:
      '<strong>चौथा कदम: अभ्यास PIN डालें।</strong> असली फ़ोन पर अपना PIN कभी किसी को न बताएं। यहाँ <strong>1 2 3 4</strong> लिखें।',

    upiCoachSuccess:
      '🎉 <strong>भुगतान सफल रहा!</strong> आपने देखा कि किसे पैसे दे रहे हैं, रकम जाँची, और अभ्यास PIN डाला। बहुत बढ़िया!',

    upiCoachWrongPin:
      '⚠️ यह 1234 नहीं था। कोई बात नहीं! मिटाने के लिए <strong>C</strong> दबाएं, फिर <strong>1 2 3 4</strong> लिखें।',

    upiAlertMinAmount: 'कृपया कम से कम ₹1 की रकम लिखें।',

    upiAlertTooMuch: 'आपके पास सिर्फ ₹{balance} खेल के पैसे हैं। छोटी रकम लिखें।',

    upiAlertPinDigits: 'कृपया अपने अभ्यास PIN के चारों अंक डालें।',

    upiScam1Title: 'धोखा 1: नकली रिफ़ंड की माँग',

    upiScam1Coach:
      '⚠️ <strong>धोखा पहचानें:</strong> एक अनजान व्यक्ति कहता है कि उसने गलती से ज़्यादा पैसे भेज दिए, और पैसे लौटाने के लिए आपसे PIN डालने को कहता है। आपको क्या करना चाहिए?',

    upiScam1Badge: 'आया हुआ भुगतान अनुरोध',

    upiScam1From: 'अनजान कॉलर (राजेश कुमार):',

    upiScam1Message:
      '"सर, मैंने गलती से आपके Google Pay पर ₹5,000 भेज दिए! मैंने आपको एक अनुरोध भेजा है। पैसे वापस पाने के लिए अभी अपना 4 अंकों का UPI PIN डालें।"',

    upiScam1Question: 'यहाँ सुनहरा नियम क्या है?',

    upiScam1Wrong: '₹5,000 का रिफ़ंड पाने के लिए PIN डाल दूँ',

    upiScam1Correct: 'तुरंत मना करें! पैसे पाने के लिए कभी PIN नहीं डालते!',

    upiScam1OnCorrect:
      '🌟 <strong>शाबाश!</strong> आपको सुनहरा नियम 1 याद रहा: पैसे पाने के लिए UPI PIN <strong>कभी नहीं</strong> डालते। PIN सिर्फ अपने खाते से पैसे भेजने के लिए है!',

    upiScam1OnWrong:
      '🚨 <strong>रुकिए! खतरा!</strong> अगर आप PIN डालेंगे, तो आपके बैंक से ₹5,000 चोरी हो जाएंगे! याद रखें: पैसे पाने के लिए PIN <em>कभी नहीं</em> डालते।',

    upiScam2Title: 'धोखा 2: लॉटरी पाने के लिए QR स्कैन',

    upiScam2Coach:
      '⚠️ <strong>धोखा पहचानें:</strong> आपको एक संदेश मिलता है जिसमें QR कोड है और ₹2,000 त्योहार कैशबैक का वादा है।',

    upiScam2Badge: 'WhatsApp लॉटरी संदेश',

    upiScam2From: 'त्योहार लॉटरी ऑफ़र:',

    upiScam2Message:
      '"बधाई हो! आपने ₹2,000 जीते हैं। अपना UPI ऐप खोलें और पैसे सीधे बैंक में पाने के लिए यह QR कोड स्कैन करें!"',

    upiScam2Question: 'QR कोड स्कैन करने पर असल में क्या होता है?',

    upiScam2Correct: 'QR कोड स्कैन करने से हमेशा मेरे खाते से पैसे जाते हैं। मुझे स्कैन नहीं करना है!',

    upiScam2Wrong: 'QR कोड स्कैन करने से मेरे बैंक में पैसे आते हैं।',

    upiScam2OnCorrect:
      '🌟 <strong>बिल्कुल सही!</strong> QR कोड स्कैन करना दुकान पर या किसी व्यक्ति को पैसे देने के लिए होता है। इससे आपके खाते में पैसे कभी नहीं आते।',

    upiScam2OnWrong:
      '🚨 <strong>खतरा!</strong> QR कोड स्कैन करने से हमेशा भुगतान होता है। धोखेबाज़ "पैसे पाने" वाले नकली QR कोड से आपका खाता खाली कर देते हैं!',

    upiScam3Title: 'धोखा 3: बैंक KYC की धमकी',

    upiScam3Coach:
      '⚠️ <strong>धोखा पहचानें:</strong> आपको एक SMS मिलता है जिसमें धमकी है कि आज आपका बैंक खाता बंद हो जाएगा।',

    upiScam3Badge: 'ज़रूरी SMS',

    upiScam3From: 'SBI-Bank-Notice से चेतावनी:',

    upiScam3Message:
      '"प्रिय ग्राहक, KYC बाकी होने के कारण आपका बैंक खाता 2 घंटे में बंद हो जाएगा! अपना ATM कार्ड और PIN तुरंत अपडेट करने के लिए http://sbi-kyc-verify-portal.top पर क्लिक करें।"',

    upiScam3Question: 'आप कैसे जानेंगे कि यह नकली धमकी है?',

    upiScam3Correct: 'बैंक कभी तुरंत खाता बंद करने की धमकी नहीं देते, और SMS लिंक से ATM PIN या पासवर्ड नहीं माँगते!',

    upiScam3Wrong: 'खाता बंद होने से पहले जल्दी लिंक पर क्लिक करूँ!',

    upiScam3OnCorrect:
      '🌟 <strong>बहुत बढ़िया!</strong> बैंक कभी डराने वाले लिंक भेजकर कार्ड या PIN की जानकारी नहीं माँगते। अगर कभी डर लगे, तो <strong>1930</strong> (राष्ट्रीय साइबर हेल्पलाइन) पर कॉल करें।',

    upiScam3OnWrong:
      '🚨 <strong>घबराइए मत!</strong> धोखेबाज़ झूठी जल्दी ("2 घंटे में बंद") दिखाकर लोगों से बिना सोचे काम करवाते हैं। असली बैंक ऐसा कभी नहीं करते!',

    upiShopTitle: 'अभ्यास: असली किराना दुकान पर भुगतान',

    upiShopCoach:
      '🛒 <strong>अच्छा अभ्यास:</strong> आप किराना दुकान से ₹80 का सामान खरीद रहे हैं। दुकान का नाम जाँचने और सुरक्षित भुगतान के लिए दबाएं।',

    upiShopCounter: 'किराना दुकान के काउंटर पर',

    upiShopMerchant: 'दुकान का QR कोड दिखाता है: <strong>Kirana Grocery Store (जाँची हुई दुकान)</strong>',

    upiShopBill: 'बिल: ₹80',

    upiShopProceed: '₹80 सुरक्षित तरीके से दें',

    upiShopCheck:
      'दुकान का नाम <strong>Kirana Grocery Store</strong> और रकम <strong>₹80</strong> जाँचें। फिर "अभ्यास PIN डालें" दबाएं।',

    scamTitle: 'रुकें। जाँचें। पूछें।',

    scamBody:
      'इस पेज पर डराने वाली बातें हैं या वेबसाइट का पता संदिग्ध है। बैंक कभी तुरंत खाता बंद करने की धमकी नहीं देते और न ही आपका PIN माँगते हैं।',

    scamHelpline: 'पक्का नहीं पता? 1930 (साइबर हेल्पलाइन) पर कॉल करें।',

    scamDismiss: 'ठीक है, सावधान रहें',

    calmLabel: 'शांत पल: आप सुरक्षित हैं',

    calmBreathe: 'साँस लें',

    calmBreatheLabel: 'धीरे से साँस लें',

    calmHelper: 'सहायक',

    calmCallName: '{name} को कॉल करें ({phone})',

    timerMinutesLeft: 'इस पेज पर आपके पास लगभग <b>{minutes} मिनट</b> बचे हैं। आराम से करें।',

    wzName: 'फ़ॉर्म विज़ार्ड',

    wzLauncher: 'फ़ॉर्म विज़ार्ड ({n} सवाल)',

    wzLauncherLabel: 'फ़ॉर्म विज़ार्ड खोलें: एक बार में एक सवाल',

    wzNoFields: 'इस पेज पर कोई फ़ॉर्म नहीं मिला। विज़ार्ड इस्तेमाल करने के लिए किसी आवेदन या पंजीकरण पेज पर जाएं।',

    wzCloseLabel: 'विज़ार्ड बंद करें',

    wzStartStep: 'शुरुआत: आपको क्या चाहिए होगा',

    wzItemsNeeded: 'इस फ़ॉर्म के लिए आपको ये चीज़ें चाहिए:',

    wzWelcome: 'फ़ॉर्म विज़ार्ड में स्वागत है',

    wzIntro:
      'इस पेज पर <b>{n} सवाल</b> हैं। हम आपको बड़े और साफ़ अक्षरों में <b>एक बार में एक सवाल</b> दिखाएंगे, ताकि आप आराम से भर सकें।',

    wzPromise:
      '🛡️ <b>सुगम का वादा:</b> सुगम उत्तर भरने में मदद करेगा, लेकिन <b>सुगम कभी फ़ॉर्म जमा नहीं करता</b>। आप खुद जाँचकर वेबसाइट पर सबमिट दबाएंगे।',

    wzCancel: 'रद्द करें',

    wzStartQ1: 'पहला सवाल शुरू करें →',

    wzPrivateEnter: '🔒 (निजी - वेबसाइट पर खुद भरें)',

    wzNotAnswered: '(उत्तर नहीं दिया)',

    wzReviewHint: 'नीचे अपनी जानकारी देखें। कुछ बदलना हो तो "बदलें" दबाएं।',

    wzFillNote:
      'ℹ️ जब आप <b>फ़ॉर्म में भरें</b> दबाएंगे, सुगम आपके उत्तर वेबसाइट के खानों में डाल देगा। <b>सुगम कभी फ़ॉर्म जमा नहीं करता</b>। सबमिट बटन आप खुद दबाएंगे।',

    wzFill: 'फ़ॉर्म में भरें ✓',

    wzPrivateTitle: 'निजी पासवर्ड या PIN',

    wzPrivateBody:
      'सुगम निजी पासवर्ड, PIN या OTP कभी नहीं सहेजता, पढ़ता या छूता। विज़ार्ड में आगे बढ़ते रहें। आख़िर में अपना पासवर्ड सीधे वेबसाइट के अपने सुरक्षित खाने में लिखें।',

    wzDictate: 'बोलकर लिखें',

    wzDictateLabel: 'उत्तर बोलकर लिखें',

    wzListening: 'सुन रहा है...',

    wzNoDictation: 'इस ब्राउज़र में बोलकर लिखने की सुविधा नहीं है।',

    wzSaveLater: 'सहेजें और बाद में पूरा करें',

    wzReviewAnswers: 'उत्तर जाँचें →',

    wzNextQuestion: 'अगला सवाल →',

    wzSaved: 'आपके उत्तर सहेज लिए गए। आगे भरने के लिए फ़ॉर्म विज़ार्ड कभी भी खोलें।',

    wzRequired: '⚠️ आगे बढ़ने के लिए कृपया इस सवाल का उत्तर दें।',

    wzPhoneDigits: '⚠️ फ़ोन नंबर में 10 अंक चाहिए। आपने {typed} लिखे। {more} और जोड़ें।',

    wzEmail: '⚠️ कृपया @ और डोमेन वाला ईमेल पता लिखें (जैसे name@example.com)।',

    wzPincode: '⚠️ पिनकोड में 6 अंक चाहिए। आपने {typed} लिखे। {more} और जोड़ें।',

    wzQuestion: 'सवाल',

    cloudConsentTitle: 'बेहतर नतीजों के लिए Google Gemini इस्तेमाल करें?',

    cloudConsentBody:
      'आसान सारांश और अनुवाद बनाने के लिए सुगम इस पेज का लेख Google Gemini (इंटरनेट की एक सेवा) को भेज सकता है। Google यह लेख रख सकता है। पासवर्ड, PIN या बैंक जानकारी वाले पेज सुगम कभी नहीं भेजता।',

    cloudConsentYes: 'हाँ, Google Gemini इस्तेमाल करें',

    cloudConsentNo: 'नहीं, सब कुछ इसी डिवाइस पर रखें',

    spMadeOnDevice: 'इसी डिवाइस पर बना। इंटरनेट पर कुछ नहीं भेजा गया।',

    spMadeByCloud: 'Google Gemini (क्लाउड) ने बनाया। पेज का लेख Google को भेजा गया।',

    spTranslateNeedsCloud:
      'अनुवाद के लिए Google Gemini चाहिए। आपने सब कुछ इसी डिवाइस पर रखना चुना है। आप इसे सुगम के विकल्पों में बदल सकते हैं।',

    spTranslateNeedsKey: 'अनुवाद के लिए Google Gemini key चाहिए। इसे सुगम के विकल्पों में जोड़ें।'
  },

  or: {
    appName: 'ସୁଗମ',
    appSubtitle: 'ସରଳ UI, ନିର୍ଦ୍ଦେଶିତ କାର୍ଯ୍ୟ ଏବଂ ଟଙ୍କା ଅଭ୍ୟାସ',
    comfortSettings: 'ସୁବିଧା ସେଟିଙ୍ଗ୍ସ',
    turnOffAll: 'ସବୁ ସହାୟକ ବନ୍ଦ କରନ୍ତୁ',
    turnOnAll: 'ସବୁ ସହାୟକ ଚାଲୁ କରନ୍ତୁ',
    statusOn: 'ଚାଲୁ',
    statusOff: 'ବନ୍ଦ',
    help: 'ସାହାଯ୍ୟ',
    options: 'ବିକଳ୍ପ',
    close: 'ବନ୍ଦ କରନ୍ତୁ',
    back: 'ପଛକୁ',
    next: 'ଆଗକୁ',
    save: 'ସାଇତନ୍ତୁ',
    reset: 'ରିସେଟ୍',
    disclaimerComputer:
      'ଏହି ସାରାଂଶ କମ୍ପ୍ୟୁଟର ଦ୍ୱାରା ପ୍ରସ୍ତୁତ ଏବଂ ଏଥିରେ ଭୁଲ ଥାଇପାରେ। ଟଙ୍କା, ସ୍ୱାସ୍ଥ୍ୟ ଏବଂ ଆଇନ ସମ୍ବନ୍ଧୀୟ ତଥ୍ୟ ପାଇଁ ମୂଳ ପୃଷ୍ଠା ଦେଖନ୍ତୁ।',
    disclaimerTranslation: 'କମ୍ପ୍ୟୁଟର ଅନୁବାଦ। ମୂଳ ପୃଷ୍ଠାରେ ଟଙ୍କା ଏବଂ ତାରିଖ ଯାଞ୍ଚ କରନ୍ତୁ।',
    disclaimerTimer: 'ସୁଗମ ସ୍କ୍ରିନର ଘଣ୍ଟାକୁ ଅଟକାଇଛି। ୱେବସାଇଟର ନିଜସ୍ୱ ଘଣ୍ଟା ଚାଲିପାରେ।',
    disclaimerBionic: 'କିଛି ଲୋକଙ୍କୁ ଏହା ସହଜ ଲାଗେ। ଅଧ୍ୟୟନରୁ ଏହା ସମସ୍ତଙ୍କ ପାଇଁ ପଢ଼ିବା ଦ୍ରୁତ କରେ ବୋଲି ପ୍ରମାଣିତ ହୋଇନାହିଁ।',
    floatingTurnOff: 'ସୁଗମ ଚାଲୁ ଅଛି: ବନ୍ଦ କରନ୍ତୁ',
    neverOnThisSite: 'ଏହି ୱେବସାଇଟରେ କେବେ ଚଳାନ୍ତୁ ନାହିଁ',
    siteDisabled: 'ଏହି ୱେବସାଇଟ୍ ପାଇଁ ସୁଗମ ବନ୍ଦ ଅଛି।',

    // Tiles
    tileTimer: 'ଆରାମରେ ସମୟ ନିଅନ୍ତୁ',
    tileTimerDesc: 'କାଉଣ୍ଟଡାଉନ ଟେନସନ ରୋକନ୍ତୁ ଏବଂ ସହଜ ଭାଷାରେ ସମୟ ବୁଝନ୍ତୁ।',
    tileFont: 'ଡିସଲେକ୍ସିଆ ଉପଯୋଗୀ ଫଣ୍ଟ',
    tileFontDesc: 'ସ୍ପଷ୍ଟ ଅକ୍ଷର ଏବଂ ଉପଯୁକ୍ତ ବ୍ୟବଧାନ।',
    tileRuler: 'ରିଡିଂ ରୁଲର',
    tileRulerDesc: 'ପଢ଼ିବା ସମୟରେ ଆଖିକୁ ରାସ୍ତା ଦେଖାଇବା ପାଇଁ ଏକ ସରଳ ପଟି।',
    tileBionic: 'ବାୟୋନିକ୍ ପଠନ',
    tileBionicDesc: 'ଶବ୍ଦର ପ୍ରଥମ ଅକ୍ଷରଗୁଡ଼ିକୁ ମୋଟା କରନ୍ତୁ।',
    tileSummarise: 'ଚିତ୍ର ସହିତ ସାରାଂଶ',
    tileSummariseDesc: 'ସହଜ ଚିତ୍ର ଥିବା ଛୋଟ ଏବଂ ସରଳ କାର୍ଡ।',
    tileReadAloud: 'ପଢ଼ି ଶୁଣାନ୍ତୁ',
    tileReadAloudDesc: 'ଶବ୍ଦ ହାଇଲାଇଟ୍ ସହିତ ସ୍ୱରରେ ଶୁଣନ୍ତୁ।',
    tileFormWizard: 'ଫର୍ମ ସହାୟକ',
    tileFormWizardDesc: 'ଥରକରେ ଗୋଟିଏ ସହଜ ପ୍ରଶ୍ନର ଉତ୍ତର ଦିଅନ୍ତୁ।',
    tileTranslate: 'ଅନୁବାଦ',
    tileTranslateDesc: 'ଓଡ଼ିଆ, ହିନ୍ଦୀ ବା ଇଂରାଜୀରେ ପଢ଼ନ୍ତୁ।',
    tileMoneyPractice: 'ଟଙ୍କା ଅଭ୍ୟାସ',
    tileMoneyPracticeDesc: 'ନିରାପଦ UPI ଅଭ୍ୟାସ ଏବଂ ଠକାମି ଚିହ୍ନିବା ଶିଖନ୍ତୁ।',
    tileScamGuard: 'ନିରାପତ୍ତା ଗାର୍ଡ',
    tileScamGuardDesc: 'ନକଲି ଲିଙ୍କ୍, ଧମକ ଏବଂ PIN ଫାନ୍ଦ ବିରୁଦ୍ଧରେ ସତର୍କ କରାଏ।',
    tileExplainWord: 'ଏହି ଶବ୍ଦର ଅର୍ଥ',
    tileExplainWordDesc: 'ଯେକୌଣସି ଶବ୍ଦକୁ ଛୁଇଁ ତାର ସରଳ ଅର୍ଥ ଦେଖନ୍ତୁ।',
    tileNumbersHelper: 'ସଂଖ୍ୟା ସହାୟକ',
    tileNumbersHelperDesc: 'ଟଙ୍କାକୁ ଅକ୍ଷରରେ ଦେଖନ୍ତୁ ଏବଂ ଅଙ୍କଗୁଡ଼ିକୁ ଧୀରେ ଶୁଣନ୍ତୁ।',
    tileWhereWasI: 'ମୁଁ କେଉଁଠି ଥିଲି?',
    tileWhereWasIDesc: 'ବିରତି ନେଲେ ଆପଣ କେଉଁଠି ଥିଲେ ତାହା ମନେ ରଖେ।',

    // Calm Moment
    iNeedAMoment: 'ମତେ ଟିକେ ସମୟ ଦରକାର',
    calmTitle: 'ଆପଣ ସୁରକ୍ଷିତ ଅଛନ୍ତି।',
    calmSubtitle: 'କିଛି ବି ପଠାଯାଇ ନାହିଁ। ଆପଣଙ୍କୁ ଯେତେ ସମୟ ଦରକାର ନିଅନ୍ତୁ।',
    breatheIn: 'ଧୀରେ ଧୀରେ ନିଶ୍ୱାସ ନିଅନ୍ତୁ...',
    breatheHold: 'ଟିକେ ଅଟକାନ୍ତୁ...',
    breatheOut: 'ଧୀରେ ଧୀରେ ନିଶ୍ୱାସ ଛାଡ଼ନ୍ତୁ...',
    callHelper: 'ସହାୟକଙ୍କୁ ଫୋନ କରନ୍ତୁ',
    messageHelper: 'ସହାୟକଙ୍କୁ ବାର୍ତ୍ତା ପଠାନ୍ତୁ',
    cyberHelpline: '1930 ସାଇବର ହେଲ୍ପଲାଇନକୁ କଲ କରନ୍ତୁ',
    returnToPage: 'ମୁଁ ପୁଣି ପଢ଼ିବାକୁ ପ୍ରସ୍ତୁତ',

    // UPI Practice
    upiTitle: 'ନିରାପଦ UPI ଏବଂ ଟଙ୍କା ଅଭ୍ୟାସ',
    upiBalanceLabel: 'ଅଭ୍ୟାସ ଟଙ୍କା:',
    upiPracticePinHint: 'ଆପଣଙ୍କ ଅଭ୍ୟାସ PIN: 1234',
    upiSendMoney: 'ଟଙ୍କା ପଠାଇବା ଅଭ୍ୟାସ କରନ୍ତୁ',
    upiScanQr: 'QR ସ୍କାନ ଅଭ୍ୟାସ କରନ୍ତୁ',
    upiPayBill: 'ବିଲ୍ ପୈଠ ଅଭ୍ୟାସ କରନ୍ତୁ',
    upiScamSpotter: 'ଠକାମି ଧରନ୍ତୁ ଖେଳ',
    upiRuleNeverPinToReceive: 'ଜରୁରୀ ନିୟମ: ଟଙ୍କା ପାଇବା ପାଇଁ କେବେ ବି PIN ଦିଆଯାଏ ନାହିଁ!',
    upiRuleCheckNameAmount: 'ଜରୁରୀ ନିୟମ: ଟଙ୍କା ଦେବା ପୂର୍ବରୁ ସବୁବେଳେ ନାମ ଏବଂ ରାଶି ଯାଞ୍ଚ କରନ୍ତୁ।',
    upiWrongPin: 'ଏହି PIN 1234 ନୁହେଁ। ଚିନ୍ତା କରନ୍ତୁ ନାହିଁ! ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ: 1 2 3 4.',

    // Form Wizard
    wizardStartTitle: "ଆପଣଙ୍କୁ କ'ଣ ଦରକାର ହେବ",
    wizardStepOf: 'ପାଦ {current} / {total}',
    wizardCheckAnswers: 'ଆପଣଙ୍କ ଉତ୍ତର ଯାଞ୍ଚ କରନ୍ତୁ',
    wizardChange: 'ବଦଳାନ୍ତୁ',
    wizardSensitiveNotice:
      'ଏହା ଏକ ବ୍ୟକ୍ତିଗତ ପାସୱାର୍ଡ ବା PIN। ସୁଗମ ବ୍ୟକ୍ତିଗତ ତଥ୍ୟ କଦାପି ଛୁଏଁ ନାହିଁ। ଦୟାକରି ୱେବସାଇଟର ନିଜସ୍ୱ ସୁରକ୍ଷିତ ବାକ୍ସରେ ଲେଖନ୍ତୁ।',
    wizardDoneHandoff:
      'ଆପଣଙ୍କ ଉତ୍ତର ଭରି ଦିଆଗଲା। ଏବେ ୱେବସାଇଟର ସବମିଟ୍ ବଟନ ନିଜେ ଦବାନ୍ତୁ। ସୁଗମ ନିଜେ କେବେ ଫର୍ମ ଦାଖଲ କରେ ନାହିଁ।',

    // Help Dialog
    helpTitle: 'ସାହାଯ୍ୟ ଦରକାର କି?',
    helpCaregiverContact: 'ଆପଣଙ୍କ ବିଶ୍ୱସ୍ତ ସହାୟକ:',
    helpNotSet: 'କୌଣସି ନମ୍ବର ସାଇତା ହୋଇନାହିଁ।',
    helpCopySummary: 'ପୃଷ୍ଠାର ସରଳ ସାରାଂଶ କପି କରନ୍ତୁ',
    helpSummaryCopied: 'ସାରାଂଶ କପି ହୋଇଗଲା!',
    helpNationalHelpline: 'ଜାତୀୟ ସାଇବର ଅପରାଧ ହେଲ୍ପଲାଇନ୍: 1930 (ଟୋଲ୍ ଫ୍ରି)',

    spTitle: 'ସୁଗମ ରିଡର',

    spTabsLabel: 'ପଢ଼ିବା ପ୍ରକାର',

    spTabCards: 'ସହଜ କାର୍ଡ',

    spRefreshCards: 'କାର୍ଡ ପୁଣି ତିଆରି କରନ୍ତୁ',

    spReadAll: 'ସବୁ କାର୍ଡ ଶୁଣନ୍ତୁ',

    spLoading: 'ସହଜ କାର୍ଡ ତିଆରି ହେଉଛି...',

    spTranslateInto: 'ପୃଷ୍ଠାକୁ ଏହି ଭାଷାରେ ବଦଳାନ୍ତୁ:',

    spTranslateButton: 'ପୃଷ୍ଠା ଅନୁବାଦ କରନ୍ତୁ',

    spTranslatePlaceholder: 'ଭାଷା ବାଛନ୍ତୁ ଏବଂ "ପୃଷ୍ଠା ଅନୁବାଦ କରନ୍ତୁ" ଦବାନ୍ତୁ।',

    spMemoryTitle: 'ଆପଣ କେଉଁଠି ଥିଲେ',

    spMemoryIntro: 'ସୁଗମ ଆପଣଙ୍କ ପୃଷ୍ଠା ମନେ ରଖେ, ଯାହାଫଳରେ ବିରତି ପରେ ଆପଣ ହଜିଯିବେ ନାହିଁ।',

    spNoCards: 'ଏବେ କୌଣସି ସାରାଂଶ କାର୍ଡ ନାହିଁ।',

    spNoPage: 'କୌଣସି ଖୋଲା ୱେବ୍ ପୃଷ୍ଠା ମିଳିଲା ନାହିଁ।',

    spCouldNotSummarise: 'ଏହି ପୃଷ୍ଠାର ସାରାଂଶ ତିଆରି ହୋଇପାରିଲା ନାହିଁ।',

    spListen: 'ଶୁଣନ୍ତୁ',

    spListenCard: 'କାର୍ଡ {n} ଶୁଣନ୍ତୁ',

    spTranslating: 'ଅନୁବାଦ ହେଉଛି...',

    spTranslateFailed: 'ଅନୁବାଦ ହୋଇପାରିଲା ନାହିଁ: {error}',

    spNoMemory: 'ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ପୃଷ୍ଠା ମନେ ରଖାଯାଇନାହିଁ।',

    spSavedAt: '{time} ରେ ସାଇତା ହେଲା',

    spResume: 'ପୁଣି ପଢ଼ନ୍ତୁ',

    upiSubtitle: 'ଖେଳ ଟଙ୍କାରେ ଅଭ୍ୟାସ କରନ୍ତୁ। ପ୍ରକୃତ ଠକେଇ ଚିହ୍ନିବା ଶିଖନ୍ତୁ।',

    upiResetMoney: 'ଅଭ୍ୟାସ ଟଙ୍କା ପୁଣି ₹2,500 କରନ୍ତୁ',

    upiBackToBrowsing: 'ବ୍ରାଉଜିଂକୁ ଫେରନ୍ତୁ',

    upiGoldenRules: '3ଟି ସୁନେଲି ନିୟମ',

    upiRule1:
      '<strong>1. ଟଙ୍କା ପାଇବା ପାଇଁ କେବେ ବି PIN ଦିଅନ୍ତୁ ନାହିଁ:</strong> UPI PIN <em>କେବଳ</em> ଆପଣଙ୍କ ବ୍ୟାଙ୍କରୁ ଟଙ୍କା ପଠାଇବା ପାଇଁ।',

    upiRule2: '<strong>2. ସବୁବେଳେ ନାମ ଓ ରାଶି ଯାଞ୍ଚ କରନ୍ତୁ:</strong> PIN ଦେବା ପୂର୍ବରୁ ସ୍କ୍ରିନ୍ ଦେଖନ୍ତୁ।',

    upiRule3:
      '<strong>3. ରୁହନ୍ତୁ। ଯାଞ୍ଚ କରନ୍ତୁ। ପଚାରନ୍ତୁ:</strong> କେହି ତରବର କରାଇଲେ ବା ଡରାଇଲେ, ଫୋନ୍ କାଟି <strong>1930</strong>କୁ କଲ୍ କରନ୍ତୁ।',

    upiCoachName: 'କୋଚ୍ ସୁଗମ',

    upiCoachStatus: 'ସୁରକ୍ଷିତ ଅଭ୍ୟାସରେ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିବାକୁ',

    upiCoachWelcome:
      'ସ୍ୱାଗତ! ଏହି ଫୋନ୍ <strong>ଖେଳ ଟଙ୍କା</strong> ବ୍ୟବହାର କରେ। ଆପଣଙ୍କ ଅଭ୍ୟାସ PIN <strong>1 2 3 4</strong>। ଆରମ୍ଭ କରିବାକୁ ତଳେ ଗୋଟିଏ କାମ ବାଛନ୍ତୁ।',

    upiListenCoach: 'କୋଚ୍‌ଙ୍କୁ ଶୁଣନ୍ତୁ',

    upiChooseMode: 'ଅଭ୍ୟାସ ପ୍ରକାର ବାଛନ୍ତୁ:',

    upiModeSend: 'ଟଙ୍କା ପଠାନ୍ତୁ (ସାଧାରଣ ଉପାୟ)',

    upiModeScam1: 'ଠକେଇ 1: "ଫେରସ୍ତ ଟଙ୍କା ପାଇବାକୁ PIN ଦିଅନ୍ତୁ"',

    upiModeScam2: 'ଠକେଇ 2: "ଲଟେରୀ ପାଇବାକୁ QR ସ୍କାନ୍ କରନ୍ତୁ"',

    upiModeScam3: 'ଠକେଇ 3: "ବ୍ୟାଙ୍କ KYC ଧମକ"',

    upiModeShop: 'ପ୍ରକୃତ କିରାଣା ଦୋକାନରେ ପେମେଣ୍ଟ',

    upiPhoneLabel: 'ଅଭ୍ୟାସ UPI ଫୋନ୍ ସ୍କ୍ରିନ୍',

    upiDemoTag: 'ଅଭ୍ୟାସ UPI ଆପ୍',

    upiHello: 'ନମସ୍କାର, ରାହୁଲ!',

    upiPlayBalance: 'ଖେଳ ଟଙ୍କା: ₹{amount}',

    upiWhoToPay: 'ଆପଣ କାହାକୁ ଟଙ୍କା ଦେବାକୁ ଚାହାଁନ୍ତି?',

    upiVerifiedShop: 'ଯାଞ୍ଚ ହୋଇଥିବା ଦୋକାନ',

    upiPayingSomeone: 'କାହାକୁ ପେମେଣ୍ଟ',

    upiPaying: '{name}ଙ୍କୁ ପେମେଣ୍ଟ',

    upiEnterAmount: 'ଟଙ୍କା ରାଶି ଲେଖନ୍ତୁ:',

    upiZeroRupees: 'ଶୂନ ଟଙ୍କା',

    upiRupees: '{amount} ଟଙ୍କା',

    upiReviewPayment: 'ପେମେଣ୍ଟ ଯାଞ୍ଚ କରନ୍ତୁ',

    upiCheckCarefully: 'ଦୟାକରି ଧ୍ୟାନରେ ଯାଞ୍ଚ କରନ୍ତୁ',

    upiPayingTo: 'କାହାକୁ ପେମେଣ୍ଟ:',

    upiUpiId: 'UPI ID:',

    upiAmount: 'ରାଶି:',

    upiSendingAlert: 'ℹ️ ଆପଣ ଆପଣଙ୍କ ବ୍ୟାଙ୍କ ଖାତାରୁ ଟଙ୍କା <strong>ପଠାଉଛନ୍ତି</strong>।',

    upiChangeAmount: 'ରାଶି ବଦଳାନ୍ତୁ',

    upiEnterPracticePin: 'ଅଭ୍ୟାସ PIN ଦିଅନ୍ତୁ',

    upiEnterUpiPin: 'UPI PIN ଦିଅନ୍ତୁ',

    upiTypePracticePin: 'ଅଭ୍ୟାସ PIN ଲେଖନ୍ତୁ: <strong>1 2 3 4</strong>',

    upiPinDotsLabel: 'ଦିଆଯାଇଥିବା PIN ଅଙ୍କ',

    upiPinError: '❌ ଏହା 1234 ନୁହେଁ। ଚିନ୍ତା ନାହିଁ! 1 2 3 4 ଲେଖି ଦେଖନ୍ତୁ।',

    upiKeypadLabel: 'PIN କିପ୍ୟାଡ୍',

    upiClearKey: 'ଲିଭାନ୍ତୁ',

    upiConfirmKey: 'PIN ନିଶ୍ଚିତ କରନ୍ତୁ',

    upiPaymentSuccessful: 'ପେମେଣ୍ଟ ସଫଳ ହେଲା!',

    upiPaidTo: 'ପେମେଣ୍ଟ କରାଗଲା:',

    upiSafetyRecap: '👍 ଆପଣ ନାମ ଦେଖିଲେ, ରାଶି ଯାଞ୍ଚ କଲେ, ଏବଂ ସୁରକ୍ଷିତ ଭାବେ ଟଙ୍କା ପଠାଇଲେ। ବହୁତ ଭଲ!',

    upiStartNew: 'ନୂଆ ଅଭ୍ୟାସ ଆରମ୍ଭ କରନ୍ତୁ',

    upiToday: 'ଆଜି, {time}',

    upiCoachReset: 'ଖେଳ ଟଙ୍କା ପୁଣି <strong>₹2,500</strong> ହେଲା। ଆପଣ ଅଭ୍ୟାସ ପାଇଁ ପ୍ରସ୍ତୁତ!',

    upiCoachStep1:
      '<strong>ପ୍ରଥମ ପାଦ:</strong> ଯାହାକୁ ଖେଳ ଟଙ୍କା ପଠାଇବେ, ସେହି ବ୍ୟକ୍ତିଙ୍କୁ ଦବାନ୍ତୁ। ତାଙ୍କ ନାମ ଓ UPI ID ଦେଖନ୍ତୁ।',

    upiCoachStep2:
      '<strong>ଦ୍ୱିତୀୟ ପାଦ:</strong> <strong>{name}</strong>ଙ୍କୁ କେତେ ଟଙ୍କା ପଠାଇବେ ଲେଖନ୍ତୁ। ରାଶି ତଳେ ଲେଖାଥିବା ଶବ୍ଦ ସବୁବେଳେ ଯାଞ୍ଚ କରନ୍ତୁ।',

    upiCoachStep3:
      '<strong>ତୃତୀୟ ପାଦ: ଧ୍ୟାନରେ ଯାଞ୍ଚ କରନ୍ତୁ!</strong> ନାମ (<strong>{name}</strong>) ଓ ରାଶି (<strong>₹{amount}</strong>) ଦେଖନ୍ତୁ। ଆପଣ ଆପଣଙ୍କ ବ୍ୟାଙ୍କରୁ ଟଙ୍କା ପଠାଉଛନ୍ତି।',

    upiCoachStep4:
      '<strong>ଚତୁର୍ଥ ପାଦ: ଅଭ୍ୟାସ PIN ଦିଅନ୍ତୁ।</strong> ପ୍ରକୃତ ଫୋନରେ ଆପଣଙ୍କ PIN କେବେ କାହାକୁ କୁହନ୍ତୁ ନାହିଁ। ଏଠାରେ <strong>1 2 3 4</strong> ଲେଖନ୍ତୁ।',

    upiCoachSuccess:
      '🎉 <strong>ପେମେଣ୍ଟ ସଫଳ ହେଲା!</strong> ଆପଣ କାହାକୁ ଦେଉଛନ୍ତି ଦେଖିଲେ, ରାଶି ଯାଞ୍ଚ କଲେ, ଏବଂ ଅଭ୍ୟାସ PIN ଦେଲେ। ବହୁତ ବଢ଼ିଆ!',

    upiCoachWrongPin:
      '⚠️ ଏହା 1234 ନୁହେଁ। ଚିନ୍ତା ନାହିଁ! ଲିଭାଇବାକୁ <strong>C</strong> ଦବାନ୍ତୁ, ତାପରେ <strong>1 2 3 4</strong> ଲେଖନ୍ତୁ।',

    upiAlertMinAmount: 'ଦୟାକରି ଅତି କମରେ ₹1 ରାଶି ଲେଖନ୍ତୁ।',

    upiAlertTooMuch: 'ଆପଣଙ୍କ ପାଖରେ କେବଳ ₹{balance} ଖେଳ ଟଙ୍କା ଅଛି। କମ୍ ରାଶି ଲେଖନ୍ତୁ।',

    upiAlertPinDigits: 'ଦୟାକରି ଅଭ୍ୟାସ PIN ର ଚାରିଟି ଅଙ୍କ ଦିଅନ୍ତୁ।',

    upiScam1Title: 'ଠକେଇ 1: ନକଲି ଫେରସ୍ତ ଅନୁରୋଧ',

    upiScam1Coach:
      "⚠️ <strong>ଠକେଇ ଚିହ୍ନନ୍ତୁ:</strong> ଜଣେ ଅଚିହ୍ନା ଲୋକ କୁହେ ସେ ଭୁଲରେ ଅଧିକ ଟଙ୍କା ପଠାଇଛି, ଏବଂ ଫେରସ୍ତ ପାଇଁ ଆପଣଙ୍କୁ PIN ଦେବାକୁ କୁହେ। ଆପଣ କ'ଣ କରିବେ?",

    upiScam1Badge: 'ଆସିଥିବା ପେମେଣ୍ଟ ଅନୁରୋଧ',

    upiScam1From: 'ଅଚିହ୍ନା କଲର୍ (ରାଜେଶ କୁମାର):',

    upiScam1Message:
      '"ସାର୍, ମୁଁ ଭୁଲରେ ଆପଣଙ୍କ Google Payକୁ ₹5,000 ପଠାଇଦେଲି! ମୁଁ ଆପଣଙ୍କୁ ଏକ ଅନୁରୋଧ ପଠାଇଛି। ଟଙ୍କା ଫେରସ୍ତ ପାଇବାକୁ ଏବେ ଆପଣଙ୍କ 4 ଅଙ୍କର UPI PIN ଦିଅନ୍ତୁ।"',

    upiScam1Question: "ଏଠାରେ ସୁନେଲି ନିୟମ କ'ଣ?",

    upiScam1Wrong: '₹5,000 ଫେରସ୍ତ ପାଇବାକୁ PIN ଦେଇଦେବି',

    upiScam1Correct: 'ତୁରନ୍ତ ମନା କରନ୍ତୁ! ଟଙ୍କା ପାଇବା ପାଇଁ କେବେ PIN ଦିଆଯାଏ ନାହିଁ!',

    upiScam1OnCorrect:
      '🌟 <strong>ସାବାସ୍!</strong> ଆପଣଙ୍କୁ ସୁନେଲି ନିୟମ 1 ମନେ ଅଛି: ଟଙ୍କା ପାଇବା ପାଇଁ UPI PIN <strong>କେବେ ବି</strong> ଦିଆଯାଏ ନାହିଁ। PIN କେବଳ ଆପଣଙ୍କ ଖାତାରୁ ଟଙ୍କା ପଠାଇବା ପାଇଁ!',

    upiScam1OnWrong:
      '🚨 <strong>ରୁହନ୍ତୁ! ବିପଦ!</strong> ଆପଣ PIN ଦେଲେ, ଆପଣଙ୍କ ବ୍ୟାଙ୍କରୁ ₹5,000 ଚୋରି ହୋଇଯିବ! ମନେ ରଖନ୍ତୁ: ଟଙ୍କା ପାଇବା ପାଇଁ PIN <em>କେବେ ବି</em> ଦିଆଯାଏ ନାହିଁ।',

    upiScam2Title: 'ଠକେଇ 2: ଲଟେରୀ ପାଇବାକୁ QR ସ୍କାନ୍',

    upiScam2Coach:
      '⚠️ <strong>ଠକେଇ ଚିହ୍ନନ୍ତୁ:</strong> ଆପଣଙ୍କୁ QR କୋଡ୍ ସହ ଏକ ମେସେଜ୍ ଆସେ, ଯେଉଁଥିରେ ₹2,000 ପର୍ବ କ୍ୟାସବ୍ୟାକ୍ ପ୍ରତିଶ୍ରୁତି ଅଛି।',

    upiScam2Badge: 'WhatsApp ଲଟେରୀ ମେସେଜ୍',

    upiScam2From: 'ପର୍ବ ଲଟେରୀ ଅଫର୍:',

    upiScam2Message:
      '"ଅଭିନନ୍ଦନ! ଆପଣ ₹2,000 ଜିତିଛନ୍ତି। ଆପଣଙ୍କ UPI ଆପ୍ ଖୋଲନ୍ତୁ ଏବଂ ଟଙ୍କା ସିଧା ବ୍ୟାଙ୍କରେ ପାଇବାକୁ ଏହି QR କୋଡ୍ ସ୍କାନ୍ କରନ୍ତୁ!"',

    upiScam2Question: "QR କୋଡ୍ ସ୍କାନ୍ କଲେ ପ୍ରକୃତରେ କ'ଣ ହୁଏ?",

    upiScam2Correct: 'QR କୋଡ୍ ସ୍କାନ୍ କଲେ ସବୁବେଳେ ମୋ ଖାତାରୁ ଟଙ୍କା ଯାଏ। ମୁଁ ସ୍କାନ୍ କରିବି ନାହିଁ!',

    upiScam2Wrong: 'QR କୋଡ୍ ସ୍କାନ୍ କଲେ ମୋ ବ୍ୟାଙ୍କକୁ ଟଙ୍କା ଆସେ।',

    upiScam2OnCorrect:
      '🌟 <strong>ଏକଦମ୍ ଠିକ୍!</strong> QR କୋଡ୍ ସ୍କାନ୍ ଦୋକାନରେ ବା କାହାକୁ ଟଙ୍କା ଦେବା ପାଇଁ। ଏହା ଦ୍ୱାରା ଆପଣଙ୍କ ଖାତାକୁ କେବେ ଟଙ୍କା ଆସେ ନାହିଁ।',

    upiScam2OnWrong:
      '🚨 <strong>ବିପଦ!</strong> QR କୋଡ୍ ସ୍କାନ୍ କଲେ ସବୁବେଳେ ପେମେଣ୍ଟ ହୁଏ। ଠକମାନେ "ଟଙ୍କା ପାଇବା" ନାମରେ ନକଲି QR କୋଡ୍ ଦେଇ ଆପଣଙ୍କ ଖାତା ଖାଲି କରନ୍ତି!',

    upiScam3Title: 'ଠକେଇ 3: ବ୍ୟାଙ୍କ KYC ଧମକ',

    upiScam3Coach: '⚠️ <strong>ଠକେଇ ଚିହ୍ନନ୍ତୁ:</strong> ଆପଣଙ୍କୁ ଏକ SMS ଆସେ ଯେ ଆଜି ଆପଣଙ୍କ ବ୍ୟାଙ୍କ ଖାତା ବନ୍ଦ ହୋଇଯିବ।',

    upiScam3Badge: 'ଜରୁରୀ SMS',

    upiScam3From: 'SBI-Bank-Notice ରୁ ସତର୍କତା:',

    upiScam3Message:
      '"ପ୍ରିୟ ଗ୍ରାହକ, KYC ବାକି ଥିବାରୁ ଆପଣଙ୍କ ବ୍ୟାଙ୍କ ଖାତା 2 ଘଣ୍ଟାରେ ବନ୍ଦ ହୋଇଯିବ! ଆପଣଙ୍କ ATM କାର୍ଡ ଓ PIN ତୁରନ୍ତ ଅପଡେଟ୍ କରିବାକୁ http://sbi-kyc-verify-portal.top ରେ କ୍ଲିକ୍ କରନ୍ତୁ।"',

    upiScam3Question: 'ଏହା ନକଲି ଧମକ ବୋଲି କେମିତି ଜାଣିବେ?',

    upiScam3Correct:
      'ବ୍ୟାଙ୍କ କେବେ ତୁରନ୍ତ ଖାତା ବନ୍ଦ କରିବା ଧମକ ଦିଏ ନାହିଁ, କିମ୍ବା SMS ଲିଙ୍କରେ ATM PIN ବା ପାସୱାର୍ଡ ମାଗେ ନାହିଁ!',

    upiScam3Wrong: 'ଖାତା ବନ୍ଦ ହେବା ଆଗରୁ ଶୀଘ୍ର ଲିଙ୍କରେ କ୍ଲିକ୍ କରିବି!',

    upiScam3OnCorrect:
      '🌟 <strong>ବହୁତ ବଢ଼ିଆ!</strong> ବ୍ୟାଙ୍କ କେବେ ଡରାଇବା ଲିଙ୍କ ପଠାଇ କାର୍ଡ ବା PIN ତଥ୍ୟ ମାଗେ ନାହିଁ। କେବେ ଡର ଲାଗିଲେ, <strong>1930</strong> (ଜାତୀୟ ସାଇବର ହେଲ୍ପଲାଇନ୍)କୁ କଲ୍ କରନ୍ତୁ।',

    upiScam3OnWrong:
      '🚨 <strong>ଡରନ୍ତୁ ନାହିଁ!</strong> ଠକମାନେ ମିଛ ତରବର ("2 ଘଣ୍ଟାରେ ବନ୍ଦ") ଦେଖାଇ ଲୋକଙ୍କୁ ନ ଭାବି କାମ କରାନ୍ତି। ପ୍ରକୃତ ବ୍ୟାଙ୍କ ଏପରି କେବେ କରେ ନାହିଁ!',

    upiShopTitle: 'ଅଭ୍ୟାସ: ପ୍ରକୃତ କିରାଣା ଦୋକାନରେ ପେମେଣ୍ଟ',

    upiShopCoach:
      '🛒 <strong>ଭଲ ଅଭ୍ୟାସ:</strong> ଆପଣ କିରାଣା ଦୋକାନରୁ ₹80ର ଜିନିଷ କିଣୁଛନ୍ତି। ଦୋକାନ ନାମ ଯାଞ୍ଚ କରି ସୁରକ୍ଷିତ ପେମେଣ୍ଟ ପାଇଁ ଦବାନ୍ତୁ।',

    upiShopCounter: 'କିରାଣା ଦୋକାନ କାଉଣ୍ଟରରେ',

    upiShopMerchant: 'ଦୋକାନର QR କୋଡ୍ ଦେଖାଏ: <strong>Kirana Grocery Store (ଯାଞ୍ଚ ହୋଇଥିବା ଦୋକାନ)</strong>',

    upiShopBill: 'ବିଲ୍: ₹80',

    upiShopProceed: '₹80 ସୁରକ୍ଷିତ ଭାବେ ଦିଅନ୍ତୁ',

    upiShopCheck:
      'ଦୋକାନ ନାମ <strong>Kirana Grocery Store</strong> ଓ ରାଶି <strong>₹80</strong> ଯାଞ୍ଚ କରନ୍ତୁ। ତାପରେ "ଅଭ୍ୟାସ PIN ଦିଅନ୍ତୁ" ଦବାନ୍ତୁ।',

    scamTitle: 'ରୁହନ୍ତୁ। ଯାଞ୍ଚ କରନ୍ତୁ। ପଚାରନ୍ତୁ।',

    scamBody:
      'ଏହି ପୃଷ୍ଠାରେ ଡରାଇବା କଥା ଅଛି ବା ୱେବସାଇଟ୍ ଠିକଣା ସନ୍ଦେହଜନକ। ବ୍ୟାଙ୍କ କେବେ ତୁରନ୍ତ ଖାତା ବନ୍ଦ କରିବା ଧମକ ଦିଏ ନାହିଁ କିମ୍ବା ଆପଣଙ୍କ PIN ମାଗେ ନାହିଁ।',

    scamHelpline: 'ନିଶ୍ଚିତ ନୁହଁନ୍ତି? 1930 (ସାଇବର ହେଲ୍ପଲାଇନ୍)କୁ କଲ୍ କରନ୍ତୁ।',

    scamDismiss: 'ବୁଝିଲି, ସାବଧାନ ରହିବି',

    calmLabel: 'ଶାନ୍ତ ମୁହୂର୍ତ୍ତ: ଆପଣ ସୁରକ୍ଷିତ',

    calmBreathe: 'ଶ୍ୱାସ ନିଅନ୍ତୁ',

    calmBreatheLabel: 'ଧୀରେ ଶ୍ୱାସ ନିଅନ୍ତୁ',

    calmHelper: 'ସହାୟକ',

    calmCallName: '{name}ଙ୍କୁ କଲ୍ କରନ୍ତୁ ({phone})',

    timerMinutesLeft: 'ଏହି ପୃଷ୍ଠାରେ ଆପଣଙ୍କ ପାଖରେ ପ୍ରାୟ <b>{minutes} ମିନିଟ୍</b> ବାକି ଅଛି। ଧୀରେ ଧୀରେ କରନ୍ତୁ।',

    wzName: 'ଫର୍ମ ୱିଜାର୍ଡ',

    wzLauncher: 'ଫର୍ମ ୱିଜାର୍ଡ ({n}ଟି ପ୍ରଶ୍ନ)',

    wzLauncherLabel: 'ଫର୍ମ ୱିଜାର୍ଡ ଖୋଲନ୍ତୁ: ଥରକେ ଗୋଟିଏ ପ୍ରଶ୍ନ',

    wzNoFields: 'ଏହି ପୃଷ୍ଠାରେ କୌଣସି ଫର୍ମ ମିଳିଲା ନାହିଁ। ୱିଜାର୍ଡ ବ୍ୟବହାର ପାଇଁ ଆବେଦନ ବା ପଞ୍ଜୀକରଣ ପୃଷ୍ଠାକୁ ଯାଆନ୍ତୁ।',

    wzCloseLabel: 'ୱିଜାର୍ଡ ବନ୍ଦ କରନ୍ତୁ',

    wzStartStep: "ଆରମ୍ଭ: ଆପଣଙ୍କୁ କ'ଣ ଦରକାର ହେବ",

    wzItemsNeeded: 'ଏହି ଫର୍ମ ପାଇଁ ଆପଣଙ୍କୁ ଏସବୁ ଦରକାର:',

    wzWelcome: 'ଫର୍ମ ୱିଜାର୍ଡକୁ ସ୍ୱାଗତ',

    wzIntro:
      'ଏହି ପୃଷ୍ଠାରେ <b>{n}ଟି ପ୍ରଶ୍ନ</b> ଅଛି। ଆମେ ବଡ଼ ଓ ସଫା ଅକ୍ଷରରେ <b>ଥରକେ ଗୋଟିଏ ପ୍ରଶ୍ନ</b> ଦେଖାଇବୁ, ଯାହାଫଳରେ ଆପଣ ଆରାମରେ ପୂରଣ କରିପାରିବେ।',

    wzPromise:
      '🛡️ <b>ସୁଗମର ପ୍ରତିଶ୍ରୁତି:</b> ସୁଗମ ଉତ୍ତର ଭରିବାରେ ସାହାଯ୍ୟ କରିବ, କିନ୍ତୁ <b>ସୁଗମ କେବେ ଫର୍ମ ଦାଖଲ କରେ ନାହିଁ</b>। ଆପଣ ନିଜେ ଯାଞ୍ଚ କରି ୱେବସାଇଟରେ ସବମିଟ୍ ଦବାଇବେ।',

    wzCancel: 'ବାତିଲ୍ କରନ୍ତୁ',

    wzStartQ1: 'ପ୍ରଥମ ପ୍ରଶ୍ନ ଆରମ୍ଭ କରନ୍ତୁ →',

    wzPrivateEnter: '🔒 (ବ୍ୟକ୍ତିଗତ - ୱେବସାଇଟରେ ନିଜେ ଭରନ୍ତୁ)',

    wzNotAnswered: '(ଉତ୍ତର ଦିଆଯାଇନାହିଁ)',

    wzReviewHint: 'ତଳେ ଆପଣଙ୍କ ତଥ୍ୟ ଦେଖନ୍ତୁ। କିଛି ବଦଳାଇବାକୁ ହେଲେ "ବଦଳାନ୍ତୁ" ଦବାନ୍ତୁ।',

    wzFillNote:
      'ℹ️ ଆପଣ <b>ଫର୍ମରେ ଭରନ୍ତୁ</b> ଦବାଇଲେ, ସୁଗମ ଆପଣଙ୍କ ଉତ୍ତର ୱେବସାଇଟର ଘରେ ରଖିଦେବ। <b>ସୁଗମ କେବେ ଫର୍ମ ଦାଖଲ କରେ ନାହିଁ</b>। ସବମିଟ୍ ବଟନ ଆପଣ ନିଜେ ଦବାଇବେ।',

    wzFill: 'ଫର୍ମରେ ଭରନ୍ତୁ ✓',

    wzPrivateTitle: 'ବ୍ୟକ୍ତିଗତ ପାସୱାର୍ଡ ବା PIN',

    wzPrivateBody:
      'ସୁଗମ ବ୍ୟକ୍ତିଗତ ପାସୱାର୍ଡ, PIN ବା OTP କେବେ ସାଇତେ ନାହିଁ, ପଢ଼େ ନାହିଁ କି ଛୁଏଁ ନାହିଁ। ୱିଜାର୍ଡରେ ଆଗକୁ ବଢ଼ନ୍ତୁ। ଶେଷରେ ଆପଣଙ୍କ ପାସୱାର୍ଡ ସିଧା ୱେବସାଇଟର ନିଜସ୍ୱ ସୁରକ୍ଷିତ ଘରେ ଲେଖନ୍ତୁ।',

    wzDictate: 'କହି ଲେଖନ୍ତୁ',

    wzDictateLabel: 'ଉତ୍ତର କହି ଲେଖନ୍ତୁ',

    wzListening: 'ଶୁଣୁଛି...',

    wzNoDictation: 'ଏହି ବ୍ରାଉଜରରେ କହି ଲେଖିବା ସୁବିଧା ନାହିଁ।',

    wzSaveLater: 'ସାଇତି ପରେ ଶେଷ କରନ୍ତୁ',

    wzReviewAnswers: 'ଉତ୍ତର ଯାଞ୍ଚ କରନ୍ତୁ →',

    wzNextQuestion: 'ପରବର୍ତ୍ତୀ ପ୍ରଶ୍ନ →',

    wzSaved: 'ଆପଣଙ୍କ ଉତ୍ତର ସାଇତା ହେଲା। ଆଗକୁ ଭରିବାକୁ ଯେକୌଣସି ସମୟରେ ଫର୍ମ ୱିଜାର୍ଡ ଖୋଲନ୍ତୁ।',

    wzRequired: '⚠️ ଆଗକୁ ଯିବାକୁ ଦୟାକରି ଏହି ପ୍ରଶ୍ନର ଉତ୍ତର ଦିଅନ୍ତୁ।',

    wzPhoneDigits: '⚠️ ଫୋନ୍ ନମ୍ବରରେ 10ଟି ଅଙ୍କ ଦରକାର। ଆପଣ {typed}ଟି ଲେଖିଛନ୍ତି। ଆଉ {more}ଟି ଯୋଡ଼ନ୍ତୁ।',

    wzEmail: '⚠️ ଦୟାକରି @ ଓ ଡୋମେନ୍ ଥିବା ଇମେଲ୍ ଠିକଣା ଲେଖନ୍ତୁ (ଯେପରି name@example.com)।',

    wzPincode: '⚠️ ପିନକୋଡରେ 6ଟି ଅଙ୍କ ଦରକାର। ଆପଣ {typed}ଟି ଲେଖିଛନ୍ତି। ଆଉ {more}ଟି ଯୋଡ଼ନ୍ତୁ।',

    wzQuestion: 'ପ୍ରଶ୍ନ',

    cloudConsentTitle: 'ଭଲ ଫଳାଫଳ ପାଇଁ Google Gemini ବ୍ୟବହାର କରିବେ?',

    cloudConsentBody:
      'ସହଜ ସାରାଂଶ ଓ ଅନୁବାଦ ପାଇଁ ସୁଗମ ଏହି ପୃଷ୍ଠାର ଲେଖା Google Gemini (ଇଣ୍ଟରନେଟର ଏକ ସେବା)କୁ ପଠାଇପାରେ। Google ଏହି ଲେଖା ରଖିପାରେ। ପାସୱାର୍ଡ, PIN ବା ବ୍ୟାଙ୍କ ତଥ୍ୟ ଥିବା ପୃଷ୍ଠା ସୁଗମ କେବେ ପଠାଏ ନାହିଁ।',

    cloudConsentYes: 'ହଁ, Google Gemini ବ୍ୟବହାର କରନ୍ତୁ',

    cloudConsentNo: 'ନା, ସବୁକିଛି ଏହି ଡିଭାଇସରେ ରଖନ୍ତୁ',

    spMadeOnDevice: 'ଏହି ଡିଭାଇସରେ ତିଆରି। ଇଣ୍ଟରନେଟକୁ କିଛି ପଠାଯାଇନାହିଁ।',

    spMadeByCloud: 'Google Gemini (କ୍ଲାଉଡ୍) ତିଆରି କଲା। ପୃଷ୍ଠାର ଲେଖା Googleକୁ ପଠାଗଲା।',

    spTranslateNeedsCloud:
      'ଅନୁବାଦ ପାଇଁ Google Gemini ଦରକାର। ଆପଣ ସବୁକିଛି ଏହି ଡିଭାଇସରେ ରଖିବାକୁ ବାଛିଛନ୍ତି। ଏହା ସୁଗମ ବିକଳ୍ପରେ ବଦଳାଇପାରିବେ।',

    spTranslateNeedsKey: 'ଅନୁବାଦ ପାଇଁ Google Gemini key ଦରକାର। ଏହା ସୁଗମ ବିକଳ୍ପରେ ଯୋଡ଼ନ୍ତୁ।'
  }
};

const SugamI18n = {
  currentLang: 'en',

  setLanguage(lang) {
    if (SUGAM_TRANSLATIONS[lang]) {
      this.currentLang = lang;
    }
  },

  /**
   * Fills elements marked up for translation under `root`:
   * data-i18n (text), data-i18n-html (bundled strings with markup), and
   * data-i18n-aria-label, data-i18n-placeholder and data-i18n-title (attributes).
   */
  translatePage(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = this.get(el.dataset.i18n);
    });
    // Only for SUGAM's own bundled strings that contain <strong>/<em>; never for page or user text.
    root.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = this.get(el.dataset.i18nHtml);
    });
    for (const attr of ['aria-label', 'placeholder', 'title']) {
      root.querySelectorAll(`[data-i18n-${attr}]`).forEach((el) => {
        el.setAttribute(attr, this.get(el.getAttribute(`data-i18n-${attr}`)));
      });
    }
    if (root.documentElement) root.documentElement.lang = this.currentLang;
  },

  get(key, replacements = {}) {
    const langDict = SUGAM_TRANSLATIONS[this.currentLang] || SUGAM_TRANSLATIONS.en;
    let text = langDict[key] || SUGAM_TRANSLATIONS.en[key] || key;
    for (const [placeholder, val] of Object.entries(replacements)) {
      text = text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), val);
    }
    return text;
  }
};

if (typeof module !== 'undefined') {
  module.exports = { SUGAM_TRANSLATIONS, SugamI18n };
}
