# SUGAM — Simple UI, Guided Actions & Money practice

A cognitive and neuro-inclusive accessibility layer for the web, with a safe UPI practice sandbox. SUGAM is a Manifest V3 extension for Chrome and Microsoft Edge, in **English, Hindi (हिन्दी) and Odia (ଓଡ଼ିଆ)**.

**Who it is for:** people with autism, dyslexia, intellectual disabilities or other cognitive impairments (recognised under the RPwD Act and Odisha's BBSA scheme), and their caregivers and teachers.

**The problem:** most accessibility tools focus on sight or hearing. Dense text, countdown timers, dark patterns and 25-field forms on public portals cause real overload and anxiety for neurodivergent users, and scams target exactly these moments.

## What it does

- **Calmer pages:** comfort presets, dyslexia-friendly fonts (bundled, work offline), reading ruler, Bionic Read, paused animations and pop-ups.
- **Easy-read summaries** with pictograms, made on the device; Google Gemini is used only if the user says yes.
- **Form Wizard:** turns long forms into one calm question at a time. It never submits a form and never touches passwords, PINs or OTPs.
- **Take your time:** countdowns in plain words, and an "I need a moment" calm screen with one tap to a trusted person or the 1930 Cyber Helpline.
- **Scam Safety Guard:** "Stop. Check. Ask." warnings on threatening or look-alike pages.
- **Safe UPI practice:** a pretend phone with play money (₹2,500, PIN 1 2 3 4) and scam-spotter lessons: fake refunds, "scan to receive" QR codes and fake KYC threats.

## Privacy and permissions

- **No standing access to websites.** SUGAM runs on a page only when the user opens it there (popup, `Alt+Shift+S`, or the right-click menu). Turning on **"Use SUGAM on every website"** (needed for automatic scam warnings) asks Chrome's permission first, and can be turned off at any time.
- **Nothing leaves the device without consent.** Before the first cloud summary or translation, SUGAM asks whether to use Google Gemini. Each summary says where it was made. Banking, payment and password pages are never sent.
- **Secrets stay local.** A Gemini API key is stored on this device only (never synced) and sent in a header, not a URL. The caregiver PIN is stored only as a salted hash.
- **Zero residue.** Switching SUGAM off restores the page exactly as the website rendered it.

## Try it

1. Download or clone this repository.
2. Open `chrome://extensions` (or `edge://extensions`) and turn on **Developer mode**.
3. Click **Load unpacked** and choose the [`SUGAM/extension`](SUGAM/extension) folder.
4. Click the SUGAM icon on any page. Choose a language at the top of the popup.

## Project layout

| Path | What is there |
| :--- | :--- |
| `SUGAM/extension/manifest.json` | Extension manifest (permissions above) |
| `SUGAM/extension/background/` | Service worker: shortcuts, menus, on-demand injection |
| `SUGAM/extension/content/` | Page helpers: `content.js` core plus one file per feature in `features/` |
| `SUGAM/extension/shared/` | Storage, translations (`i18n.js`), safe DOM helpers, sensitive-site rules, Gemini client, injector |
| `SUGAM/extension/popup/`, `sidepanel/`, `sandbox/` | Popup, easy-read side panel, UPI practice |
| `SUGAM/extension/fonts/` | Bundled fonts (SIL Open Font License) |
| `SUGAM/extension/tests/` | Unit tests, browser tests and sample pages |

## Development

Needs Node.js 20 or newer. Run from the repository root:

```bash
npm install
npx playwright install chromium   # once, for browser tests

npm test            # unit tests + verification suite
npm run test:e2e    # Playwright: loads the real extension in Chromium
npm run lint        # ESLint
npm run format      # Prettier
```

GitHub Actions runs lint, format check, unit tests and browser tests on every pull request.

The browser tests check SUGAM's promises in a real browser: switching off leaves no trace, the Form Wizard never submits or stores private values, nothing is sent to Gemini without a "yes", SUGAM does not run on sites it was not given, and the side panel, UPI practice and on-page helpers work in Hindi and Odia.

More detail on features and coding rules: [`SUGAM/extension/README.md`](SUGAM/extension/README.md).
