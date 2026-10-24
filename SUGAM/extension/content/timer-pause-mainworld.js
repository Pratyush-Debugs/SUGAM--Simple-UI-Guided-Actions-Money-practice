/**
 * SUGAM - Main-World Timer Pause (Level 2)
 * Opt-in for NON-FINANCIAL pages only.
 * Wraps setInterval and setTimeout to pause client-side countdown clocks.
 * Fully undoable via window.postMessage when the master switch is toggled.
 */

(function () {
  // Prevent duplicate execution
  if (window.__SUGAM_TIMER_PAUSE_INITIALIZED__) return;
  window.__SUGAM_TIMER_PAUSE_INITIALIZED__ = true;

  const originalSetInterval = window.setInterval;
  const originalClearInterval = window.clearInterval;
  const originalSetTimeout = window.setTimeout;
  const originalClearTimeout = window.clearTimeout;

  let isPaused = false;
  const trackedIntervals = new Map(); // id -> { handler, delay, args, virtualElapsed }

  // Listen for control messages from content script
  window.addEventListener('message', (event) => {
    if (!event.data || event.data.source !== 'SUGAM_CONTENT_SCRIPT') return;

    if (event.data.action === 'PAUSE_TIMERS') {
      isPaused = true;
    } else if (event.data.action === 'RESUME_TIMERS') {
      isPaused = false;
    } else if (event.data.action === 'RESTORE_NATIVE_TIMERS') {
      // Complete teardown when master switch is turned off
      isPaused = false;
      window.setInterval = originalSetInterval;
      window.clearInterval = originalClearInterval;
      window.setTimeout = originalSetTimeout;
      window.clearTimeout = originalClearTimeout;
      window.__SUGAM_TIMER_PAUSE_INITIALIZED__ = false;
    }
  });

  // Wrapped setInterval
  window.setInterval = function (handler, delay, ...args) {
    if (typeof handler !== 'function') {
      return originalSetInterval(handler, delay, ...args);
    }

    const wrappedHandler = function () {
      if (!isPaused) {
        handler(...args);
      }
    };

    const id = originalSetInterval(wrappedHandler, delay);
    trackedIntervals.set(id, { handler, delay, args });
    return id;
  };

  window.clearInterval = function (id) {
    trackedIntervals.delete(id);
    return originalClearInterval(id);
  };
})();
