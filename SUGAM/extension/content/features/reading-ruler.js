/**
 * SUGAM - Reading Ruler (4.5)
 * Methods are mixed into SugamEngine by content/content.js, so `this` is the engine.
 */

globalThis.SugamFeatures = globalThis.SugamFeatures || {};

SugamFeatures.readingRuler = {
  /**
   * 4.5 Reading Ruler
   */
  setupRuler(options) {
    this.teardownRuler();

    const shadow = this.ensureShadowHost();
    const ruler = document.createElement('div');
    ruler.id = 'sugam-ruler-container';
    ruler.setAttribute('aria-hidden', 'true');
    ruler.innerHTML = `
      <style>
        #sugam-ruler-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 2147483640;
        }
        #sugam-ruler-top, #sugam-ruler-bottom {
          position: absolute;
          left: 0;
          width: 100vw;
          background: rgba(41, 37, 45, ${options.dimmingStrength || 0.45});
          pointer-events: none;
          transition: height 0.04s linear;
        }
        #sugam-ruler-top { top: 0; }
        #sugam-ruler-bottom { bottom: 0; }
        #sugam-ruler-guide {
          position: absolute;
          left: 0;
          width: 100vw;
          height: ${options.height || 70}px;
          background: ${options.tintColor || 'rgba(231, 221, 240, 0.4)'};
          border-top: 2px solid #59366E;
          border-bottom: 2px solid #59366E;
          pointer-events: none;
          box-shadow: 0 0 12px rgba(89, 54, 110, 0.3);
        }
      </style>
      <div id="sugam-ruler-top"></div>
      <div id="sugam-ruler-guide"></div>
      <div id="sugam-ruler-bottom"></div>
    `;

    shadow.appendChild(ruler);
    this.readingRulerElem = ruler;

    const topDim = ruler.querySelector('#sugam-ruler-top');
    const guide = ruler.querySelector('#sugam-ruler-guide');
    const botDim = ruler.querySelector('#sugam-ruler-bottom');
    const rHeight = options.height || 70;

    const updatePosition = (clientY) => {
      const topH = Math.max(0, clientY - rHeight / 2);
      topDim.style.height = `${topH}px`;
      guide.style.top = `${topH}px`;
      const botH = Math.max(0, window.innerHeight - topH - rHeight);
      botDim.style.height = `${botH}px`;
    };

    this._rulerMoveHandler = (e) => updatePosition(e.clientY);
    window.addEventListener('mousemove', this._rulerMoveHandler, { passive: true });
    updatePosition(window.innerHeight / 3);
  },

  teardownRuler() {
    if (this._rulerMoveHandler) {
      window.removeEventListener('mousemove', this._rulerMoveHandler);
      this._rulerMoveHandler = null;
    }
    if (this.readingRulerElem) {
      this.readingRulerElem.remove();
      this.readingRulerElem = null;
    }
  }
};
