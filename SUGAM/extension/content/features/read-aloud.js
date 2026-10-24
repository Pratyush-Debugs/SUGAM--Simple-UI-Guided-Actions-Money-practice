/**
 * SUGAM - Read Aloud (4.8)
 * Methods are mixed into SugamEngine by content/content.js, so `this` is the engine.
 */

globalThis.SugamFeatures = globalThis.SugamFeatures || {};

SugamFeatures.readAloud = {
  /**
   * 4.8 Read Aloud (Web Speech API)
   */
  toggleReadAloud(mode = 'main') {
    if (this.isReadingAloud) {
      this.teardownReadAloud();
      return;
    }

    const text = this.extractMainContent();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.settings.readAloud?.rate || 0.9;
    utterance.pitch = this.settings.readAloud?.pitch || 1.0;

    // Indian rupee amounts converted to words for speech
    utterance.text = text.replace(/₹\s*(\d+)/g, '$1 rupees');

    utterance.onend = () => {
      this.isReadingAloud = false;
      this.teardownReadAloud();
    };

    utterance.onerror = () => {
      this.isReadingAloud = false;
      this.teardownReadAloud();
    };

    window.speechSynthesis.speak(utterance);
    this.isReadingAloud = true;
    this.announceToScreenReader('Reading aloud started');
  },

  teardownReadAloud() {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    this.isReadingAloud = false;
  }
};
