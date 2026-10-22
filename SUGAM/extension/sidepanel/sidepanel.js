/**
 * SUGAM - Side Panel Controller
 * Easy-Read Cards with Pictograms, Audio Playback, Translation, and Memory.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const settings = await SugamStorage.getSettings();
  const cardsContainer = document.getElementById('summary-cards-container');
  const loadingIndicator = document.getElementById('summary-loading');
  let currentCards = [];

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
    cardsContainer.innerHTML = '';

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
      cardsContainer.innerHTML = `
        <div class="sp-disclaimer" style="border-color:#D32F2F; color:#D32F2F;">
          ${err.message || 'Could not summarise this page.'}
        </div>
      `;
    } finally {
      loadingIndicator.classList.add('hidden');
    }
  }

  function renderCards(sentences) {
    if (!sentences || sentences.length === 0) {
      cardsContainer.innerHTML = `<p class="placeholder-text">No summary cards available.</p>`;
      return;
    }

    cardsContainer.innerHTML = '';
    sentences.forEach((sentence, idx) => {
      const card = document.createElement('div');
      card.className = 'easy-card';
      card.setAttribute('role', 'listitem');

      // Match pictogram
      const matchedPic = PictogramMatcher.matchSentence(sentence);
      const picHtml = matchedPic 
        ? `<div class="easy-card-pic" aria-hidden="true">${matchedPic.svg}</div>`
        : `<div class="easy-card-pic" aria-hidden="true"><span style="font-size:28px;">📄</span></div>`;

      // Bolded formatting
      const formattedText = sentence.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      card.innerHTML = `
        <div class="easy-card-content">
          ${picHtml}
          <div class="easy-card-text">${formattedText}</div>
        </div>
        <div class="easy-card-footer">
          <button class="btn-listen-card" data-idx="${idx}" aria-label="Listen to card ${idx + 1}">
            <span>🔊</span> Listen
          </button>
        </div>
      `;

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
    resultBox.innerHTML = `<div class="spinner"></div><p>Translating...</p>`;

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

      resultBox.innerHTML = `
        <div style="font-size: 16px; line-height: 1.6; color: #29252D;">
          ${translated}
        </div>
      `;
    } catch (e) {
      resultBox.innerHTML = `<p style="color:#D32F2F;">Translation failed: ${e.message}</p>`;
    }
  });

  // Where was I tracker
  async function recordWhereWasI(title, url) {
    if (!url || url.startsWith('chrome://')) return;
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
    if (items.length === 0) {
      list.innerHTML = `<p style="color:#666;">No recent pages recorded yet.</p>`;
      return;
    }

    list.innerHTML = items.map(item => `
      <div style="background:#FFF; border:1.5px solid #E7DDF0; border-radius:10px; padding:12px; margin-bottom:8px;">
        <div style="font-weight:700; color:#59366E; margin-bottom:4px;">${item.title}</div>
        <div style="font-size:12px; color:#666;">Saved at ${item.timestamp}</div>
        <a href="${item.url}" target="_blank" style="display:inline-block; margin-top:6px; color:#59366E; font-weight:700; text-decoration:underline;">
          Resume reading
        </a>
      </div>
    `).join('');
  }

  // Initial load
  loadEasyCards();
  renderWhereWasI();
});

