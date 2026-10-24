/**
 * SUGAM - Side Panel Controller
 * Easy-Read Cards with Pictograms, Audio Playback, Translation, and Memory.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const settings = await SugamStorage.getSettings();
  SugamI18n.setLanguage(settings.language || 'en');
  SugamI18n.translatePage();
  const t = (key, values) => SugamI18n.get(key, values);
  const cardsContainer = document.getElementById('summary-cards-container');
  const loadingIndicator = document.getElementById('summary-loading');
  let currentCards = [];

  // Messages and results are shown with textContent so nothing from a web page or cloud AI is parsed as HTML.
  function showMessage(container, text, className, color) {
    container.replaceChildren();
    const p = document.createElement('p');
    if (className) p.className = className;
    if (color) p.style.color = color;
    p.textContent = text;
    container.appendChild(p);
  }

  // Tab switching
  const tabs = {
    'tab-btn-summary': 'view-summary',
    'tab-btn-translate': 'view-translate',
    'tab-btn-memory': 'view-memory'
  };

  Object.entries(tabs).forEach(([tabId, viewId]) => {
    document.getElementById(tabId)?.addEventListener('click', () => {
      document.querySelectorAll('.sp-tab-btn').forEach((btn) => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.sp-view').forEach((view) => {
        view.classList.remove('active');
        view.hidden = true;
      });

      const activeBtn = document.getElementById(tabId);
      const activeView = document.getElementById(viewId);
      activeBtn.classList.add('active');
      activeBtn.setAttribute('aria-selected', 'true');
      activeView.classList.add('active');
      activeView.hidden = false;
    });
  });

  /**
   * Returns true only if the user agreed to Google Gemini. Asks once (in `container`) and saves the answer.
   */
  async function ensureCloudConsent(container) {
    const choice = settings.summariser?.cloudConsent || 'ask';
    if (choice !== 'ask') return choice === 'yes';

    const agreed = await new Promise((resolve) => {
      container.replaceChildren();
      const card = document.createElement('div');
      card.className = 'sp-consent-card';
      card.setAttribute('role', 'dialog');
      card.setAttribute('aria-labelledby', 'sp-consent-title');
      const title = document.createElement('h3');
      title.id = 'sp-consent-title';
      title.textContent = t('cloudConsentTitle');
      const body = document.createElement('p');
      body.textContent = t('cloudConsentBody');
      const yes = document.createElement('button');
      yes.className = 'sp-primary-btn';
      yes.id = 'btn-cloud-yes';
      yes.textContent = t('cloudConsentYes');
      yes.addEventListener('click', () => resolve(true));
      const no = document.createElement('button');
      no.className = 'sp-action-btn';
      no.id = 'btn-cloud-no';
      no.textContent = t('cloudConsentNo');
      no.addEventListener('click', () => resolve(false));
      card.append(title, body, no, yes);
      container.appendChild(card);
      no.focus(); // the private choice is the default
    });

    settings.summariser.cloudConsent = agreed ? 'yes' : 'no';
    await SugamStorage.saveSettings(settings);
    container.replaceChildren();
    return agreed;
  }

  // Load and generate cards
  async function loadEasyCards() {
    loadingIndicator.classList.remove('hidden');
    cardsContainer.replaceChildren();

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        throw new Error(t('spNoPage'));
      }

      // Ask content script for page text & sensitivity check
      const response = await SugamInjector.send(tab.id, { action: 'EXTRACT_PAGE_CONTENT' });
      if (!response) {
        const tabUrl = tab.url || '';
        if (tabUrl.startsWith('chrome://') || tabUrl.startsWith('edge://') || tabUrl.startsWith('about:')) {
          throw new Error('SUGAM cannot run on internal browser pages. Please open a regular webpage or article to summarise.');
        }
        if (tabUrl.startsWith('file://')) {
          throw new Error('To summarise local files, open chrome://extensions, click Details on SUGAM, and toggle ON "Allow access to file URLs".');
        }
        throw new Error(t('spCouldNotSummarise') || 'Could not connect to the webpage. Please refresh the page and try again.');
      }

      const rawText = response.content || '';
      const isSensitive = response.isSensitive;

      if (isSensitive) {
        cardsContainer.replaceChildren();
        const sensitiveBox = document.createElement('div');
        sensitiveBox.className = 'sp-disclaimer';
        sensitiveBox.style.borderColor = '#59366E';
        sensitiveBox.style.color = '#59366E';
        sensitiveBox.style.backgroundColor = '#F3EDF7';

        const titleDiv = document.createElement('div');
        titleDiv.style.fontWeight = '800';
        titleDiv.style.fontSize = '14px';
        titleDiv.style.marginBottom = '4px';
        titleDiv.textContent = '🔒 Privacy Shield Active';

        const descP = document.createElement('p');
        descP.style.fontSize = '13px';
        descP.style.lineHeight = '1.4';
        descP.style.color = '#29252D';
        descP.textContent = 'This page contains sensitive password, PIN, or payment fields. To protect your financial security, summaries are never created on sensitive pages.';

        sensitiveBox.append(titleDiv, descP);
        cardsContainer.appendChild(sensitiveBox);
        return;
      }

      if (!rawText || rawText.trim().length < 50) {
        throw new Error('The page content is too short to summarise. Please open an article with more text.');
      }

      // Cloud AI only with a key, on non-sensitive pages, and after the user said yes.
      const apiKey = settings.summariser?.geminiApiKey || '';
      let cloudAllowed = false;
      if (apiKey && !isSensitive && rawText.trim().length >= 50) {
        loadingIndicator.classList.add('hidden');
        cloudAllowed = await ensureCloudConsent(cardsContainer);
        loadingIndicator.classList.remove('hidden');
      }

      const summaryResult = await SugamAI.summarise(rawText, {
        apiKey,
        language: settings.language || 'en',
        isSensitive: false,
        cloudAllowed
      });

      currentCards = summaryResult.sentences;
      renderCards(currentCards);
      const source = document.createElement('p');
      source.className = 'sp-source-note';
      source.id = 'sp-source-note';
      source.textContent = t(summaryResult.source === 'gemini' ? 'spMadeByCloud' : 'spMadeOnDevice');
      cardsContainer.appendChild(source);

      // Record Where Was I breadcrumb
      recordWhereWasI(tab.title || 'Page', tab.url);
    } catch (err) {
      cardsContainer.replaceChildren();
      const errorBox = document.createElement('div');
      errorBox.className = 'sp-disclaimer';
      errorBox.style.borderColor = '#D32F2F';
      errorBox.style.color = '#D32F2F';
      errorBox.textContent = err.message || t('spCouldNotSummarise');
      cardsContainer.appendChild(errorBox);
    } finally {
      loadingIndicator.classList.add('hidden');
    }
  }

  function renderCards(sentences) {
    if (!sentences || sentences.length === 0) {
      showMessage(cardsContainer, t('spNoCards'), 'placeholder-text');
      return;
    }

    cardsContainer.replaceChildren();
    sentences.forEach((sentence, idx) => {
      const card = document.createElement('div');
      card.className = 'easy-card';
      card.setAttribute('role', 'listitem');

      // Pictograms come from SUGAM's own bundled data, so their SVG markup is trusted.
      const matchedPic = PictogramMatcher.matchSentence(sentence);
      const pic = document.createElement('div');
      pic.className = 'easy-card-pic';
      pic.setAttribute('aria-hidden', 'true');
      if (matchedPic) {
        pic.innerHTML = matchedPic.svg;
      } else {
        const fallback = document.createElement('span');
        fallback.style.fontSize = '28px';
        fallback.textContent = '📄';
        pic.appendChild(fallback);
      }

      const text = document.createElement('div');
      text.className = 'easy-card-text';
      SugamDom.appendEmphasis(text, sentence);

      const content = document.createElement('div');
      content.className = 'easy-card-content';
      content.append(pic, text);

      const footer = document.createElement('div');
      footer.className = 'easy-card-footer';
      const listen = document.createElement('button');
      listen.className = 'btn-listen-card';
      listen.dataset.idx = String(idx);
      listen.setAttribute('aria-label', t('spListenCard', { n: idx + 1 }));
      const icon = document.createElement('span');
      icon.textContent = '🔊';
      listen.append(icon, ` ${t('spListen')}`);
      footer.appendChild(listen);

      card.append(content, footer);

      cardsContainer.appendChild(card);
    });

    // Attach individual Listen buttons
    cardsContainer.querySelectorAll('.btn-listen-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        speakSentence(sentences[idx]);
      });
    });
  }

  function speakSentence(text) {
    if (!text) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    const cleanText = text.replace(/\*\*/g, '').replace(/₹\s*(\d+)/g, '$1 rupees');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = settings.readAloud?.rate || 0.9;
    window.speechSynthesis.speak(utterance);
  }

  // Refresh Cards button
  document.getElementById('btn-refresh-summary')?.addEventListener('click', () => {
    loadEasyCards();
  });

  // Read all cards
  document.getElementById('btn-listen-all')?.addEventListener('click', () => {
    if (currentCards.length === 0) return;
    const fullText = currentCards.join(' ');
    speakSentence(fullText);
  });

  // Translation handler
  document.getElementById('btn-run-translate')?.addEventListener('click', async () => {
    const targetLang = document.getElementById('select-trans-lang').value;
    const resultBox = document.getElementById('translate-result');
    resultBox.replaceChildren();
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    const progress = document.createElement('p');
    progress.textContent = t('spTranslating');
    resultBox.append(spinner, progress);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await SugamInjector.send(tab.id, { action: 'EXTRACT_PAGE_CONTENT' });

      const apiKey = settings.summariser?.geminiApiKey || '';
      if (!apiKey) {
        showMessage(resultBox, t('spTranslateNeedsKey'));
        return;
      }
      if (!response?.isSensitive && !(await ensureCloudConsent(resultBox))) {
        showMessage(resultBox, t('spTranslateNeedsCloud'));
        return;
      }
      resultBox.replaceChildren(spinner, progress);

      const translated = await SugamAI.translate(
        response?.content?.slice(0, 1500) || '',
        targetLang,
        apiKey,
        response?.isSensitive,
        true
      );

      resultBox.replaceChildren();
      const translatedBox = document.createElement('div');
      translatedBox.style.cssText = 'font-size: 16px; line-height: 1.6; color: #29252D;';
      translatedBox.textContent = translated;
      resultBox.appendChild(translatedBox);
    } catch (e) {
      showMessage(resultBox, t('spTranslateFailed', { error: e.message }), '', '#D32F2F');
    }
  });

  // Where was I tracker
  async function recordWhereWasI(title, url) {
    // Only plain web pages are remembered, and without ?query or #fragment (which can carry tokens).
    const safeUrl = SugamDom.safeHttpUrl(url);
    if (!safeUrl) return;
    const parsed = new URL(safeUrl);
    url = parsed.origin + parsed.pathname;
    const memory = settings.whereWasI?.lastVisited || [];
    const filtered = memory.filter((item) => item.url !== url);
    filtered.unshift({
      title,
      url,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    settings.whereWasI = { enabled: true, lastVisited: filtered.slice(0, 8) };
    await SugamStorage.saveSettings(settings);
    renderWhereWasI();
  }

  function renderWhereWasI() {
    const list = document.getElementById('memory-list');
    const items = settings.whereWasI?.lastVisited || [];
    list.replaceChildren();
    if (items.length === 0) {
      showMessage(list, t('spNoMemory'), '', '#666');
      return;
    }

    items.forEach((item) => {
      const href = SugamDom.safeHttpUrl(item.url);
      if (!href) return;

      const entry = document.createElement('div');
      entry.style.cssText =
        'background:#FFF; border:1.5px solid #E7DDF0; border-radius:10px; padding:12px; margin-bottom:8px;';

      const title = document.createElement('div');
      title.style.cssText = 'font-weight:700; color:#59366E; margin-bottom:4px;';
      title.textContent = item.title;

      const saved = document.createElement('div');
      saved.style.cssText = 'font-size:12px; color:#666;';
      saved.textContent = t('spSavedAt', { time: item.timestamp });

      const link = document.createElement('a');
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.cssText =
        'display:inline-block; margin-top:6px; color:#59366E; font-weight:700; text-decoration:underline;';
      link.textContent = t('spResume');

      entry.append(title, saved, link);
      list.appendChild(entry);
    });
  }

  // Initial load
  loadEasyCards();
  renderWhereWasI();

  // Auto-refresh summary when switching tabs or navigating
  chrome.tabs?.onActivated?.addListener(() => {
    loadEasyCards();
  });
  chrome.tabs?.onUpdated?.addListener((tabId, changeInfo, tab) => {
    if (tab?.active && changeInfo.status === 'complete') {
      loadEasyCards();
    }
  });
});
