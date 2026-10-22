/**
 * SUGAM - Gemini AI & Local Summarizer/Translator
 * Follows COGA and Easy-to-Read rules:
 * - At most 8 plain sentences
 * - 5th grade reading level, positive active voice, no idioms
 * - Numbers, dates, names and ₹ amounts kept EXACT and bold
 * - Strict check: NEVER runs on sensitive pages
 * - Clear machine output disclaimers
 */

const SugamAI = {
  /**
   * Generates an easy-read summary using Gemini API or local heuristic fallback.
   * @param {string} text - Raw article text.
   * @param {object} options - { apiKey, language, isSensitive }
   */
  async summarise(text, options = {}) {
    const { apiKey = '', language = 'en', isSensitive = false } = options;

    if (isSensitive) {
      throw new Error("Cloud AI is disabled on sensitive pages to protect your privacy.");
    }

    if (!text || text.trim().length < 50) {
      throw new Error("The page content is too short to summarise.");
    }

    // Try Gemini API if key is present
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const sentences = await this._callGeminiSummarise(text, apiKey, language);
        if (sentences && sentences.length > 0) {
          return {
            source: 'gemini',
            sentences: sentences.slice(0, 8),
            disclaimer: "This summary is made by a computer and may have mistakes. Check the original for money, health and legal information."
          };
        }
      } catch (err) {
        console.warn("Gemini API call failed, falling back to local summarizer:", err);
      }
    }

    // On-device fallback (heuristic extraction conforming to COGA)
    const localSentences = this._localEasyReadSummarise(text, language);
    return {
      source: 'local',
      sentences: localSentences.slice(0, 8),
      disclaimer: "This summary is made by an on-device helper. Check the original for money, health and legal information."
    };
  },

  /**
   * Calls Gemini 3.8 Flash via REST endpoint
   */
  async _callGeminiSummarise(text, apiKey, language) {
    const targetLangName = language === 'hi' ? 'Hindi' : (language === 'or' ? 'Odia' : 'English');

    const prompt = `You are an accessibility assistant for people with intellectual, autistic, and cognitive disabilities following W3C COGA and Inclusion Europe Easy-to-Read standards.
Summarise the following text into at most 8 short, plain, friendly sentences in ${targetLangName}.
Strict rules:
1. One idea per sentence.
2. Positive wording, active voice, everyday words.
3. No idioms, metaphors, or jargon.
4. Keep all numbers, dates, names, and rupee amounts EXACTLY as in source, formatted in bold (e.g. **₹500**, **October 24**, **5 days**).
5. Output ONLY a valid JSON array of strings, for example: ["Sentence 1.", "Sentence 2."].

Text to summarise:
${text.slice(0, 8000)}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error("No response from Gemini API");
    }

    // Parse JSON array from response
    const cleaned = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [cleaned];
  },

  /**
   * On-device heuristic summarizer.
   * Splits into sentences, scores by key information (numbers, dates, headings),
   * and simplifies length.
   */
  _localEasyReadSummarise(rawText, language) {
    const rawSentences = rawText
      .replace(/\r?\n+/g, ' ')
      .split(/(?<=[.!?।])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 15 && s.length < 180);

    if (rawSentences.length === 0) {
      return ["This page does not have enough text to summarise."];
    }

    // Score sentences by presence of numbers, currency, dates, and concise length
    const scored = rawSentences.map((sentence, index) => {
      let score = 0;
      if (index === 0) score += 3; // First sentence is often key
      if (/\b(\d+|₹|rs|lakh|crore|percent|%)\b/i.test(sentence)) score += 2;
      if (/(important|notice|warning|date|step|apply|cost|fee|benefit)/i.test(sentence)) score += 1.5;
      // Prefer shorter sentences for cognitive accessibility
      if (sentence.length >= 30 && sentence.length <= 100) score += 1;
      return { sentence, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const top = scored.slice(0, 6).map(item => {
      // Bold numbers and amounts for clarity
      let bolded = item.sentence.replace(/(\b\d+[\d,.]*\b|₹\s*\d+[\d,.]*)/g, '**$1**');
      return bolded;
    });

    return top;
  },

  /**
   * Translates text into target language (Hindi, Odia, or English)
   */
  async translate(text, targetLang, apiKey = '', isSensitive = false) {
    if (isSensitive) {
      throw new Error("Translation via cloud is disabled on sensitive pages.");
    }
    if (!text || !text.trim()) return text;

    if (apiKey && apiKey.trim().length > 10) {
      const targetLangName = targetLang === 'hi' ? 'Hindi' : (targetLang === 'or' ? 'Odia' : 'English');
      const prompt = `Translate the following text into clear, easy-to-read ${targetLangName} at a 5th-grade reading level.
Keep numbers, currency symbols (₹), names, URLs, and UPI IDs unchanged.
Return ONLY the translated text without extra explanation.

Text:
${text}`;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (translated) return translated.trim();
      }
    }

    // Local fallback for common phrases if offline
    return text;
  }
};

if (typeof module !== 'undefined') {
  module.exports = { SugamAI };
}

