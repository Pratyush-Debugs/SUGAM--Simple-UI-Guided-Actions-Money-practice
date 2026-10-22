/**
 * SUGAM - Side Panel Controller
 * Easy-Read Cards with Pictograms, Audio Playback, Translation, and Memory.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const settings = await SugamStorage.getSettings();
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
      document.querySelectorAll('.sp-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.sp-view').forEach(view => {
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

  // Load and generate cards
  async function loadEasyCards() {
    loadingIndicator.classList.remove('hidden');
    cardsContainer.replaceChildren();

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        throw new Error("No active web page found.");
      }

      // Ask content script for page text & sensitivity check
      const response = await new Promise((resolve) => {
        chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_PAGE_CONTENT' }, (res) => {
          if (chrome.runtime.lastError || !res) {
            resolve({ content: '', isSensitive: false });
          } else {
            resolve(res);
          }
        });
      });

      const rawText = response.content || '';
      const isSensitive = response.isSensitive;

      // Call Summarizer
      const summaryResult = await SugamAI.summarise(rawText, {
        apiKey: settings.summariser?.geminiApiKey,
        language: settings.language || 'en',
        isSensitive
      });

      currentCards = summaryResult.sentences;
      renderCards(currentCards);

      // Record Where Was I breadcrumb
      recordWhereWasI(tab.title || 'Page', tab.url);

    } catch (err) {
      cardsContainer.replaceChildren();
      const errorBox = document.createElement('div');
      errorBox.className = 'sp-disclaimer';
      errorBox.style.borderColor = '#D32F2F';
      errorBox.style.color = '#D32F2F';
      errorBox.textContent = err.message || 'Could not summarise this page.';
      cardsContainer.appendChild(errorBox);
    } finally {
      loadingIndicator.classList.add('hidden');
    }
  }

  function renderCards(sentences) {
    if (!sentences || sentences.length === 0) {
      showMessage(cardsContainer, 'No summary cards available.', 'placeholder-text');
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
      listen.setAttribute('aria-label', `Listen to card ${idx + 1}`);
      const icon = document.createElement('span');
      icon.textContent = '🔊';
      listen.append(icon, ' Listen');
      footer.appendChild(listen);

      card.append(content, footer);

      cardsContainer.appendChild(card);
    });

    // Attach individual Listen buttons
    cardsContainer.querySelectorAll('.btn-listen-card').forEach(btn => {
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
    progress.textContent = 'Translating...';
    resultBox.append(spinner, progress);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await new Promise(resolve => {
        chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_PAGE_CONTENT' }, resolve);
      });

      const translated = await SugamAI.translate(
        response?.content?.slice(0, 1500) || '',
        targetLang,
        settings.summariser?.geminiApiKey,
        response?.isSensitive
      );

      resultBox.replaceChildren();
      const translatedBox = document.createElement('div');
      translatedBox.style.cssText = 'font-size: 16px; line-height: 1.6; color: #29252D;';
      translatedBox.textContent = translated;
      resultBox.appendChild(translatedBox);
    } catch (e) {
      showMessage(resultBox, `Translation failed: ${e.message}`, '', '#D32F2F');
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
    const filtered = memory.filter(item => item.url !== url);
    filtered.unshift({ title, url, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    settings.whereWasI = { enabled: true, lastVisited: filtered.slice(0, 8) };
    await SugamStorage.saveSettings(settings);
    renderWhereWasI();
  }

  function renderWhereWasI() {
    const list = document.getElementById('memory-list');
    const items = settings.whereWasI?.lastVisited || [];
    list.replaceChildren();
    if (items.length === 0) {
      showMessage(list, 'No recent pages recorded yet.', '', '#666');
      return;
    }

    items.forEach((item) => {
      const href = SugamDom.safeHttpUrl(item.url);
      if (!href) return;

      const entry = document.createElement('div');
      entry.style.cssText = 'background:#FFF; border:1.5px solid #E7DDF0; border-radius:10px; padding:12px; margin-bottom:8px;';

      const title = document.createElement('div');
      title.style.cssText = 'font-weight:700; color:#59366E; margin-bottom:4px;';
      title.textContent = item.title;

      const saved = document.createElement('div');
      saved.style.cssText = 'font-size:12px; color:#666;';
      saved.textContent = `Saved at ${item.timestamp}`;

      const link = document.createElement('a');
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.cssText = 'display:inline-block; margin-top:6px; color:#59366E; font-weight:700; text-decoration:underline;';
      link.textContent = 'Resume reading';

      entry.append(title, saved, link);
      list.appendChild(entry);
    });
  }

  // Initial load
  loadEasyCards();
  renderWhereWasI();
});

