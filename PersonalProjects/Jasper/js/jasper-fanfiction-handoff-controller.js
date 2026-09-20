(function (global) {
  'use strict';

  const VERSION = '1.0.0-story-seam-fade';
  const PRIVATE_TARGET_PREFIX = '@generate-explicit';
  const RESUME_PATH = 'resume_story';
  const WAIT_MS = 240;

  let overlay = null;
  let active = false;

  function sleep(ms) {
    return new Promise(resolve => global.setTimeout(resolve, ms));
  }

  function ensureOverlay() {
    if (overlay && overlay.isConnected) return overlay;
    const doc = global.document;
    if (!doc?.body) return null;
    overlay = doc.getElementById('privateHandoffFade');
    if (!overlay) {
      overlay = doc.createElement('div');
      overlay.id = 'privateHandoffFade';
      overlay.className = 'private-handoff-fade';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = '<div class="private-handoff-fade__label">Private interlude</div>';
      doc.body.appendChild(overlay);
    }
    return overlay;
  }

  function choiceTarget(choice) {
    return String(choice?.target || '');
  }

  function isPrivateChoice(choice) {
    const target = choiceTarget(choice);
    const key = String(choice?.path_key || choice?.pathKey || '').toLowerCase();
    return Boolean(choice?.private) || target.startsWith(PRIVATE_TARGET_PREFIX) || key === 'private-handoff';
  }

  function isResumeChoice(choice) {
    const key = String(choice?.path_key || choice?.pathKey || '').toLowerCase();
    return key === RESUME_PATH || String(choice?.label || '').trim().toLowerCase() === 'return to the story';
  }

  function statePayload(kind, details = {}) {
    return {
      version: VERSION,
      kind,
      at: new Date().toISOString(),
      seriesKey: details.seriesKey || '',
      chapterId: details.chapterId || '',
      choiceId: details.choice?.id || '',
      target: details.choice?.target || '',
      resumeTarget: details.choice?.handoff_resume_target || details.result?.resumeTarget || '',
      generatedChapterId: details.result?.chapter?.id || ''
    };
  }

  function remember(kind, details) {
    try {
      global.sessionStorage?.setItem('jasper.privateHandoffState', JSON.stringify(statePayload(kind, details)));
    } catch (_error) {}
  }

  function emit(name, detail) {
    try {
      global.dispatchEvent(new CustomEvent(`jasper:${name}`, { detail }));
    } catch (_error) {}
  }

  async function fadeToBlack(details = {}) {
    const node = ensureOverlay();
    active = true;
    remember('fade-to-black', details);
    emit('private-handoff-fade-start', statePayload('fade-to-black', details));
    if (!node) return;
    node.classList.add('is-active');
    node.setAttribute('aria-hidden', 'false');
    global.document?.documentElement?.classList.add('private-handoff-running');
    await sleep(WAIT_MS);
  }

  async function fadeBack(details = {}) {
    const node = ensureOverlay();
    remember('fade-back-to-story', details);
    emit('private-handoff-fade-return', statePayload('fade-back-to-story', details));
    if (node) {
      node.classList.remove('is-active');
      node.setAttribute('aria-hidden', 'true');
    }
    global.document?.documentElement?.classList.remove('private-handoff-running');
    await sleep(WAIT_MS);
    active = false;
  }

  async function beforeChoice(details = {}) {
    const choice = details.choice || null;
    if (!isPrivateChoice(choice) && !isResumeChoice(choice)) return false;
    await fadeToBlack(details);
    remember(isPrivateChoice(choice) ? 'bridge-generating' : 'story-resuming', details);
    emit(isPrivateChoice(choice) ? 'private-handoff-begin' : 'private-handoff-resume-begin', statePayload('begin', details));
    return true;
  }

  async function afterChoice(details = {}) {
    const choice = details.choice || null;
    if (!active && !isPrivateChoice(choice) && !isResumeChoice(choice)) return false;
    remember(details.result ? 'transition-complete' : 'transition-error', details);
    emit(details.result ? 'private-handoff-complete' : 'private-handoff-error', statePayload(details.result ? 'complete' : 'error', details));
    await fadeBack(details);
    return true;
  }

  function handoffMetadata(choice, fallbackResumeTarget = '') {
    if (!isPrivateChoice(choice)) return null;
    return {
      visualTransition: 'fade_to_black',
      beforeBridge: true,
      afterBridge: true,
      preserveStoryState: true,
      resumeTarget: String(choice?.handoff_resume_target || fallbackResumeTarget || ''),
      bridgeOwned: true,
      meaning: 'UI handoff transition only; not a prose censorship device.'
    };
  }

  const api = Object.freeze({
    VERSION,
    isPrivateChoice,
    isResumeChoice,
    beforeChoice,
    afterChoice,
    fadeToBlack,
    fadeBack,
    handoffMetadata,
    get active() { return active; }
  });

  global.JasperFanfictionHandoffController = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
