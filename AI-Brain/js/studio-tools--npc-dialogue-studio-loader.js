/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function (global) {
  'use strict';

  const DEFAULT_BASE = 'assets/RandomEncounters/js/dialogue-studio/';
  const CORE = [
    'namespace.js',
    'config.js',
    'utils.js',
    'search.js',
    'prompt.js',
    'backend.js',
    'fallback-brain.js'
  ];
  let pending = null;

  function cleanBase(value) {
    const base = String(value || DEFAULT_BASE).replace(/\\/g, '/');
    return base.endsWith('/') ? base : `${base}/`;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const scripts = Array.from(document.scripts || []);
      const found = scripts.find((script) => script.dataset?.randomEncounterDialogueStudioSrc === src || script.src?.endsWith(src));
      if (found) {
        if (found.dataset.loaded === 'true' || found.readyState === 'complete') return resolve(found);
        found.addEventListener('load', () => resolve(found), { once: true });
        found.addEventListener('error', () => reject(new Error(`Could not load ${src}`)), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.dataset.randomEncounterDialogueStudioSrc = src;
      script.addEventListener('load', () => {
        script.dataset.loaded = 'true';
        resolve(script);
      }, { once: true });
      script.addEventListener('error', () => reject(new Error(`Could not load ${src}`)), { once: true });
      (document.head || document.documentElement).appendChild(script);
    });
  }

  async function load(options = {}) {
    if (global.LifeTalk?.fallbackBrain && global.LifeTalk?.backend && global.LifeTalk?.prompt) return global.LifeTalk;
    if (pending) return pending;
    const base = cleanBase(options.basePath);
    pending = (async () => {
      for (const file of CORE) await loadScript(base + file);
      if (!global.LifeTalk?.fallbackBrain || !global.LifeTalk?.backend) {
        throw new Error('Dialogue Studio runtime core did not initialize.');
      }
      global.dispatchEvent(new CustomEvent('randomencounters:dialogue-studio-ready', {
        detail: { basePath: base, version: global.LifeTalk.version, coreFiles: CORE.slice() }
      }));
      return global.LifeTalk;
    })().catch((error) => {
      pending = null;
      throw error;
    });
    return pending;
  }

  global.RandomEncounterDialogueStudioLoader = {
    DEFAULT_BASE,
    CORE,
    load,
    cleanBase
  };
}(window));
