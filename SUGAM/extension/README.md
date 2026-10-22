# SUGAM (Simple UI, Guided Actions & Money practice)

**SUGAM** is an accessible Manifest V3 browser extension built for desktop Chrome and Microsoft Edge. It supports people with autism, dyslexia, intellectual disabilities, and cognitive impairments, along with their caregivers and teachers.

Initial market: **India**  
Supported languages: **English**, **Hindi (हिन्दी)**, and **Odia (ଓଡ଼ିଆ)**.

---

## 🎨 Color Palette

| Name | Hex | Usage |
| :--- | :--- | :--- |
| **Warm white** | `#FAF8F5` | Primary body background |
| **Deep plum** | `#59366E` | Primary branding, buttons, active states, focus rings |
| **Lavender** | `#E7DDF0` | Soft containers, borders, chip backgrounds |
| **Pale lilac** | `#F3EDF7` | Header background, card tints, breathing circle |
| **Charcoal** | `#29252D` | Primary readable high-contrast text |

---

## 🛡️ Non-Negotiables & Guarantees

1. **One-Tap Master Switch (Zero Residue):**
   - Toggling the master switch off completely undoes every injected style and node from the page.
   - Screen reader announces `"SUGAM helpers off"`.
   - Injected UI uses a isolated Shadow DOM container (`#sugam-root`) which is completely removed from the DOM on teardown.
   - Bionic reading text modifications are restored cleanly and losslessly.
   - Toggling the switch back on re-applies previous user settings.
   - Includes a floating `"SUGAM is on: Turn off"` badge and shortcut (`Alt+Shift+S`).
2. **Never Submits or Moves Money:**
   - SUGAM **never** submits a form, approves a payment, or moves money.
   - The Form Wizard populates values using native setters, dispatches standard `input` and `change` events, and lets the user review and click submit on the website themselves.
3. **Sensitive Field & Privacy Protection:**
   - SUGAM **never** reads aloud, stores, logs, or sends PINs, OTPs, passwords, card numbers, or CVVs.
   - Sensitive domains (SBI, HDFC, ICICI, Paytm, PhonePe, BHIM, Razorpay, Income Tax, UIDAI, etc.) automatically disable cloud calls and client-side timer freezing.
   - On encountering sensitive fields, the Form Wizard notifies the user with a calm note: *"This is a private password or PIN. SUGAM never touches private details. Please type directly into the website's own secure box."*
4. **On-Device by Default & Gemini AI Summarization:**
   - Free Gemini API (`gemini-3.8-flash` / `gemini-3.5-flash-lite`) is used with user consent for summarization into at most 8 plain sentences with Indian context pictograms (Rupee, UPI, QR, OTP, Bank, Bill).
   - If offline or on sensitive pages, an on-device heuristic summarizer runs automatically.
5. **Honest Machine Output Disclaimers:**
   - *"This summary is made by a computer and may have mistakes. Check the original for money, health and legal information."*
   - *"Computer translation. Check amounts and dates in the original."*
   - *"SUGAM paused the on-screen clock. The website's own clock may still run."*

---

## 📱 Core Features

### 1. Visual Comfort Mode (`4.1`)
- **Presets:** Calm (autism), Dyslexia, Easy read, Memory support.
- **Controls:** Text size (100% to 200%), Line spacing (1.5 to 2.0), Letter & word spacing up to WCAG 1.4.12 values, Left-align text override, Max line length (50-75ch).
- **Themes:** Cream, Soft Blue, Soft Grey, Dark, High Contrast.
- **Calm switches:** Pause carousels/videos, stop animations, hide popups.

### 2. Take Your Time / Freeze Panic Timer (`4.3`)
- **Level 1 (Safe):** Detects countdowns (`role="timer"`, `04:59`) and restates them in plain words: *"You have 4 minutes. Take your time."* Auto-saves non-sensitive form drafts locally.
- **Level 2 (Opt-in, non-financial):** Injects main-world wrapper to pause client countdowns with honest disclaimer.
- **Calm Button ("I need a moment"):** Full-page calming dim, breathing guide, and one-tap contact to trusted helper or 1930 Cyber helpline.

### 3. Dyslexia-Friendly Font (`4.4`)
- Choose between **Lexend**, **Atkinson Hyperlegible**, **OpenDyslexic**, and System Sans-Serif.
- Unicode-range protection ensures Hindi and Odia text falls back to **Noto Sans Devanagari** and **Noto Sans Odia**.

### 4. Reading Ruler (`4.5`)
- Gentle horizontal reading band that follows mouse or arrow keys.
- `pointer-events: none` ensures clicks pass through to the page. `Esc` dismisses.

### 5. Bionic Read (`4.6`)
- Bolds the first ~40% of words in main content paragraphs. Latin only; leaves Hindi and Odia untouched.

### 6. Summarise with Pictures (`4.7` & Side Panel)
- Extracts main content and creates at most 8 short, plain cards.
- Matches key concepts to open SVG pictograms (₹, UPI, QR, OTP, Bank, Bill, Doctor, Bus, etc.).
- Audio listen button on each card.

### 7. Read Aloud (`4.8`)
- Web Speech API TTS with word highlighting.
- Speaks ₹ amounts in words (e.g. "two hundred rupees").
- Never reads sensitive fields.

### 8. Form Wizard (`4.9`)
- Transforms intimidating web forms into one question per screen.
- Clear hints, dictation support, friendly specific errors.
- "Check your answers" review screen. SUGAM never submits forms.

### 9. Safe UPI & Money Practice (`5.1` MUST)
- Dedicated interactive smartphone sandbox (`sandbox/upi-practice.html`).
- Practice balance: ₹2,500 demo money.
- Practice PIN: `1234`.
- Guided steps: Choose person → Amount in words → Review → PIN → Success receipt.
- **Scam Spotter Scenarios:**
  1. Fake refund request (*"Enter PIN to receive ₹5,000 refund"* → Teaches: **Never enter PIN to receive money!**)
  2. Scan-to-receive QR scam (*"Scan QR to claim lottery"* → Teaches: **Scanning QR always sends money!**)
  3. Fake KYC SMS link (*"Urgent: Account blocked in 2 hours"* → Teaches: **Banks never threaten via links!**)
  4. Genuine grocery store payment (*Safe verified QR pay*).

### 10. Scam Safety Guard (`5.3`) & Consistent Help (`5.4`)
- Detects look-alike domains and urgent panic phrases. Shows *"Stop. Check. Ask."*
- Persistent Help button opens quick caregiver calling, SMS, and **1930 National Cyber Fraud Helpline**.

---

## 🚀 How to Load & Test in Chrome / Edge

1. Open Chrome or Edge and go to `chrome://extensions` (or `edge://extensions`).
2. Turn ON **Developer mode** (toggle in top-right or sidebar).
3. Click **Load unpacked**.
4. Select the directory:
   ```
   /home/pratyush/Documents/Sugam/extension
   ```
5. Click the SUGAM icon in the toolbar to open the extension popup!

---

## 🧪 Automated Test Suite

Run the built-in verification suite:
```bash
node tests/verify-all.js
```
Sample test pages for testing extension behavior:
- `tests/sample-article.html`: Article with English, Hindi, and Odia content.
- `tests/form-page.html`: 10-field application form for testing Form Wizard and sensitive field protection.
- `tests/countdown-page.html`: Page with client-side countdown timer for testing Level 1 & Level 2 timer freeze.

