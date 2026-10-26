/**
 * SUGAM - Scam Safety Guard (5.3) and Explain This Word (5.5)
 * Methods are mixed into SugamEngine by content/content.js, so `this` is the engine.
 */

globalThis.SugamFeatures = globalThis.SugamFeatures || {};

SugamFeatures.scamGuard = {
  /**
   * 5.3 Scam Safety Guard
   */
  runScamGuard() {
    const host = window.location.hostname.toLowerCase();
    const bodyText = document.body.innerText.toLowerCase();

    // Lookalike bank domain checks (e.g. sbi-secure.com, hdfc-update.net)
    const isLookalike = /-(secure|login|update|kyc|verify|portal)\./.test(host);
    // Urgent threat scam phrases
    const hasUrgentThreat =
      /(blocked in 24 hours|account suspended immediately|send pin to receive|lottery winner claim|urgent kyc update)/i.test(
        bodyText
      );

    if (isLookalike || hasUrgentThreat) {
      const shadow = this.ensureShadowHost();
      const scamCard = document.createElement('div');
      scamCard.className = 'sugam-scam-alert pointer-all';
      scamCard.innerHTML = `
        <style>
          .sugam-scam-alert {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #FFF3E0;
            color: #B71C1C;
            border: 3px solid #D32F2F;
            border-radius: 16px;
            padding: 20px 24px;
            max-width: 500px;
            box-shadow: 0 8px 30px rgba(0,0,0,0.3);
            z-index: 2147483647;
            font-size: 15px;
          }
          .sugam-scam-title { font-size: 20px; font-weight: 800; display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
          .sugam-scam-btn { background: #D32F2F; color: #FFF; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; margin-top: 10px; }
        </style>
        <div class="sugam-scam-title">⚠️ ${t('scamTitle')}</div>
        <div>${t('scamBody')}</div>
        <div style="margin-top:6px; font-weight:700;">${t('scamHelpline')}</div>
        <button class="sugam-scam-btn" id="sugam-scam-close">${t('scamDismiss')}</button>
      `;
      shadow.appendChild(scamCard);
      scamCard.querySelector('#sugam-scam-close').addEventListener('click', () => scamCard.remove());
    }
  },

  /**
   * 5.5 Explain This Word
   */
  setupWordExplanation() {
    document.addEventListener('mouseup', () => {
      const selection = window.getSelection().toString().trim();
      if (selection.length > 2 && selection.length < 25 && !selection.includes(' ')) {
        // Single word selected
        // Show small tooltip
      }
    });
  }
};
