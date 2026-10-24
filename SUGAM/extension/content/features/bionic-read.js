/**
 * SUGAM - Bionic Read (4.6)
 * Methods are mixed into SugamEngine by content/content.js, so `this` is the engine.
 */

globalThis.SugamFeatures = globalThis.SugamFeatures || {};

SugamFeatures.bionicRead = {
  /**
   * 4.6 Bionic Read
   */
  applyBionicRead(strength = 'medium') {
    this.teardownBionicRead();
    this.bionicRecords = SugamBionic.apply(document.body, SugamBionic.ratioFor(strength));
  },

  teardownBionicRead() {
    SugamBionic.restore(this.bionicRecords);
  }
};
