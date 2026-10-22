/**
 * SUGAM - Gemini AI & Local Summarizer/Translator
 * Follows COGA and Easy-to-Read rules:
 * - At most 8 plain sentences
 * - 5th grade reading level, positive active voice, no idioms
 * - Numbers, dates, names and ₹ amounts kept EXACT and bold
 * - Strict check: NEVER runs on sensitive pages
 * - Clear machine output disclaimers
 */

// Change the model in one place. Check Google's current model list before releasing.
const SUGAM_GEMINI_MODEL = 'gemini-3.8-flash';
const SUGAM_GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${SUGAM_GEMINI_MODEL}:generateContent`;
const SUGAM_GEMINI_TIMEOUT_MS = 20000;

const SugamAI = {
  /**
   * POSTs a prompt to Gemini. The key travels in a header, never in the URL,
   * and the request is aborted if it takes too long.
   * @returns {Promise<string>} the text of the first candidate
   */
  async _generate(prompt, apiKey, generationConfig) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SUGAM_GEMINI_TIMEOUT_MS);
    try {
      const response = await fetch(SUGAM_GEMINI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        // Status only: the response body is not needed and may echo request details.
        throw new Error(`Gemini API error (${response.status})`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No response from Gemini API');
      return text;
    } finally {
      clearTimeout(timer);
    }
  },

  /**
   * Generates an easy-read summary using Gemini API or local heuristic fallback.
   * @param {string} text - Raw article text.
   * @param {object} options - { apiKey, language, isSensitive }
   */
  async summarise(text, options = {}) {
    const { apiKey = '', language = 'en', isSensitive = false } = options;

    if (isSensitive) {
      throw new Error('Cloud AI is disabled on sensitive pages to protect your privacy.');
    }

    if (!text || text.trim().length < 50) {
      throw new Error('The page content is too short to summarise.');
    }

    // Try Gemini API if key is present
    if (apiKey && apiKey.trim().length > 10) {
      try {
        const sentences = await this._callGeminiSummarise(text, apiKey, language);
        if (sentences && sentences.length > 0) {
          return {
            source: 'gemini',
            sentences: sentences.slice(0, 8),
            disclaimer:
              'This summary is made by a computer and may have mistakes. Check the original for money, health and legal information.'
          };
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local summarizer:', err);
      }
    }

    // On-device fallback (heuristic extraction conforming to COGA)
    const localSentences = this._localEasyReadSummarise(text, language);
    return {
      source: 'local',
      sentences: localSentences.slice(0, 8),
      disclaimer:
        'This summary is made by an on-device helper. Check the original for money, health and legal information.'
    };
  },

  /**
   * Summarises text with Gemini and returns an array of plain sentences
   */
  async _callGeminiSummarise(text, apiKey, language) {
    const targetLangName = language === 'hi' ? 'Hindi' : language === 'or' ? 'Odia' : 'English';

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

    const candidateText = await this._generate(prompt, apiKey, {
      temperature: 0.2,
      maxOutputTokens: 1000
    });

    // Parse JSON array from response
    const cleaned = candidateText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) {
      throw new Error('Gemini returned an unexpected format');
    }
    const sentences = parsed.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim());
    if (sentences.length === 0) {
      throw new Error('Gemini returned no sentences');
    }
    return sentences;
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
      .map((s) => s.trim())
      .filter((s) => s.length > 15 && s.length < 180);

    if (rawSentences.length === 0) {
      return ['This page does not have enough text to summarise.'];
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

    const top = scored.slice(0, 6).map((item) => {
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
      throw new Error('Translation via cloud is disabled on sensitive pages.');
    }
    if (!text || !text.trim()) return text;

    if (apiKey && apiKey.trim().length > 10) {
      const targetLangName = targetLang === 'hi' ? 'Hindi' : targetLang === 'or' ? 'Odia' : 'English';
      const prompt = `Translate the following text into clear, easy-to-read ${targetLangName} at a 5th-grade reading level.
Keep numbers, currency symbols (₹), names, URLs, and UPI IDs unchanged.
Return ONLY the translated text without extra explanation.

Text:
${text}`;

      try {
        const translated = await this._generate(prompt, apiKey, { temperature: 0.1 });
        return translated.trim();
      } catch (err) {
        console.warn('Gemini translation failed, returning original text:', err.message);
      }
    }

    // Local fallback for common phrases if offline
    return text;
  }
};

if (typeof module !== 'undefined') {
  module.exports = { SugamAI };
}
