# Reviewing SUGAM's Hindi and Odia text

SUGAM is used by people with autism, dyslexia, intellectual disabilities and other cognitive differences, often at a stressful moment (a scam message, a long government form). The Hindi and Odia text was written by a computer and needs checking by native speakers before release.

## How to review

1. Open `translations-for-review.csv` in Excel or Google Sheets.
2. Rows are in priority order. Please start at the top: the scam warning, calm screen and Form Wizard appear on real websites when people most need to understand them.
3. For each row, read the English, then the Hindi or Odia. Write **yes** in the "OK?" column, or **fix** and your better wording in "Comments".

## What good looks like

- **Everyday words** a 10-year-old would understand. Avoid formal or Sanskrit-heavy words when a common one exists.
- **Short sentences**, one idea each.
- **Calm and kind**, never blaming ("No worries! Try again").
- **Exact numbers, amounts and names**: `₹5,000`, `1930`, `1 2 3 4` must stay exactly as they are.
- **Same meaning as the English**, especially safety rules such as "You never enter a PIN to receive money".
- Words in `{curly brackets}` are filled in by the app (a name, an amount). Keep them, unchanged, wherever they fit naturally in your sentence.

## Also needed

Amounts in words ("One hundred fifty rupees") are only in English today. A native speaker's help with Hindi and Odia number words would let the UPI practice show "एक सौ पचास रुपये" / "ଏକ ଶହ ପଚାଶ ଟଙ୍କା".

Developers: regenerate the sheet with `npm run translations:export` after changing `SUGAM/extension/shared/i18n.js`.
