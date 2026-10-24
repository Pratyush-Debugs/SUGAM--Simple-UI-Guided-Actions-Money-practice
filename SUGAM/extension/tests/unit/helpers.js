/**
 * Test helpers: an in-memory stand-in for chrome.storage.
 */

function makeArea() {
  const data = {};
  return {
    data,
    get(keys, cb) {
      const out = {};
      for (const k of [].concat(keys)) if (k in data) out[k] = JSON.parse(JSON.stringify(data[k]));
      cb(out);
    },
    set(items, cb) {
      for (const [k, v] of Object.entries(items)) data[k] = JSON.parse(JSON.stringify(v));
      if (cb) cb();
    },
    remove(key, cb) {
      delete data[key];
      if (cb) cb();
    }
  };
}

function installFakeChrome() {
  const chromeFake = { storage: { sync: makeArea(), local: makeArea() } };
  globalThis.chrome = chromeFake;
  return chromeFake;
}

module.exports = { installFakeChrome };
