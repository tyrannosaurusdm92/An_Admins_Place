/* Jasper Fanfiction — single Apps Script generation bridge.
 * All story-generation aliases point at this provider so GitHub Pages never
 * silently falls back to a browser-only/safe composer.
 */
(function (global) {
  'use strict';

  const ENDPOINT = 'https://script.google.com/macros/s/AKfycbwyy_jft1QFTh14LK77gmD32Ttow-dMsZBRW0NUEIslkvOZC_G0D7sAlRrspsnpa_G1/exec';
  const ADULT_MODES = new Set(['mature_on_page', 'explicit', 'explicit_detailed']);
  const VERSION = '2026-09-19.1';

  function clone(value) {
    try { return JSON.parse(JSON.stringify(value)); } catch (_error) { return value; }
  }

  function slug(value) {
    return String(value || 'choice').trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'choice';
  }

  async function post(action, data) {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      // text/plain keeps this a simple cross-origin request on GitHub Pages;
      // the Apps Script backend parses JSON from postData.contents directly.
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({
        action,
        data: data || {},
        readerId: 'jasper',
        frontend: 'jasper-virtual-book',
        bridgeVersion: VERSION
      }),
      credentials: 'omit',
      redirect: 'follow',
      cache: 'no-store'
    });

    const text = await response.text();
    let payload = null;
    try { payload = JSON.parse(text); } catch (_error) {
      const first = text.indexOf('{');
      const last = text.lastIndexOf('}');
      if (first >= 0 && last > first) {
        try { payload = JSON.parse(text.slice(first, last + 1)); } catch (_inner) {}
      }
    }
    if (!response.ok) throw new Error(`Jasper fanfiction backend returned HTTP ${response.status}.`);
    if (!payload || typeof payload !== 'object') throw new Error('Jasper fanfiction backend returned an unreadable response.');
    if (payload.ok === false) throw new Error(payload.error || 'Jasper fanfiction backend rejected the generation request.');
    return payload;
  }

  function activeEngine() {
    return global.JasperFanfictionApp?.engine || global.JASPER_CYOA || null;
  }

  function activeSeries(context) {
    const engine = activeEngine();
    const key = context?.series?.key || engine?.currentSeriesKey || '';
    return engine?.getSeries?.(key) || null;
  }

  function requestedMode(context, series) {
    return String(context?.content?.effective_mode || context?.content?.requested_mode || series?.content_mode || 'romance').toLowerCase();
  }

  function adultConfirmed(context, series) {
    return Boolean(
      context?.content?.adult_characters_confirmed ||
      (series?.adult_characters_confirmed && series?.consenting_adults_confirmed)
    );
  }

  function backendSeries(series, context) {
    const out = clone(series || {});
    const mode = requestedMode(context, series);
    const confirmed = adultConfirmed(context, series);
    out.content_mode = mode;
    out.adult_characters_confirmed = confirmed;
    out.consenting_adults_confirmed = confirmed;
    out.current_chapter_id = String(context?.parent?.id || out.current_chapter_id || '');
    out.reader_profile = out.reader_profile || global.JasperFanfictionReader?.profile || {
      id: 'jasper-private-reader-v1', name: 'Jasper', birth_year: 1999,
      legal_adult_confirmed: true, gender: 'nonbinary'
    };
    if (!out.key) out.key = context?.series?.key || '';
    if (!out.title) out.title = context?.series?.title || 'Untitled Story';
    if (!out.fandom) out.fandom = context?.series?.fandom || 'Original';
    if (!out.story_type) out.story_type = context?.series?.story_type || 'cyoa_fanfiction';
    if (!out.target_words) out.target_words = Number(context?.requested?.target_words || 1600);
    return out;
  }

  function enrichChapter(chapter, context) {
    if (!chapter || typeof chapter !== 'object') return chapter;
    const copy = clone(chapter);
    copy.choices = Array.isArray(copy.choices) ? copy.choices.map((choice, index) => {
      const label = String(choice?.label || `Choice ${index + 1}`);
      return {
        ...choice,
        id: String(choice?.id || `choice-${index + 1}`),
        path_key: String(choice?.path_key || choice?.pathKey || slug(label)),
        generation_hint: String(choice?.generation_hint || choice?.description || label)
      };
    }) : [];
    copy.content_mode = requestedMode(context, activeSeries(context));
    return copy;
  }

  function adultDirection(mode) {
    if (mode === 'mature_on_page') {
      return 'Keep the selected adult intimacy on-page through the scene. Do not fade to black, cut away, or jump from initiation directly to aftermath. Keep all sexual participants consenting adults 18+; avoid graphic anatomical detail for this mode.';
    }
    if (mode === 'explicit') {
      return 'Continue the selected consensual adult sexual branch on-page as finished narrative prose. Do not fade to black, cut away, skip the sexual sequence, summarize it as off-page/private, or jump directly to aftermath. Preserve character voice, consent, emotional continuity, and established anatomy.';
    }
    if (mode === 'explicit_detailed') {
      return 'Continue the selected consensual adult sexual branch on-page with the requested detailed explicit mode. Do not fade to black, cut away, euphemistically summarize the sexual sequence, or jump directly to aftermath. Preserve character voice, consent, emotional continuity, physical continuity, and established anatomy.';
    }
    return '';
  }

  function directionFor(request, context, mode) {
    const choice = context?.selected_choice;
    const pieces = [
      String(context?.requested?.direction || '').trim(),
      choice ? `${choice.label || 'Selected choice'}: ${choice.description || ''}`.trim() : '',
      adultDirection(mode),
      String(request?.prompt || '').trim()
    ].filter(Boolean);
    // The backend already builds its own full prompt. Limit the browser prompt to
    // a useful direction/context supplement rather than duplicating tens of KB.
    return pieces.join('\n\n').slice(0, 12000);
  }

  async function provider(request = {}) {
    const context = request.context || {};
    const series = activeSeries(context);
    if (!series) throw new Error('No active Jasper fanfiction series is available for backend generation.');

    const mode = requestedMode(context, series);
    const confirmed = adultConfirmed(context, series);
    if (ADULT_MODES.has(mode) && !confirmed) {
      throw new Error('This adult story mode requires confirmation that every sexual participant is a consenting adult (18+). Jasper is already a confirmed adult reader.');
    }

    const synced = backendSeries(series, context);
    const opening = context?.requested?.mode === 'new_story_opening';
    let result;

    if (opening) {
      result = await post('fanfic.create', { ...synced, overwrite: true });
    } else {
      // Existing bundled/local stories may not exist in Drive yet. Sync the exact
      // active story first, with the selected content mode, then generate from it.
      await post('fanfic.save', { series: synced });
      const choice = context?.selected_choice || null;
      const action = choice ? 'fanfic.branch' : 'fanfic.continue';
      result = await post(action, {
        seriesKey: synced.key,
        currentChapterId: context?.parent?.id || synced.current_chapter_id || '',
        choice: choice || undefined,
        direction: directionFor(request, context, mode),
        session_id: `jasper-${synced.key}`,
        reasoning_effort: 'medium'
      });
    }

    if (!result?.chapter) throw new Error('Jasper fanfiction backend did not return a generated chapter.');
    return { ...result, chapter: enrichChapter(result.chapter, context) };
  }

  // One canonical function is deliberately exposed through every generation
  // alias used by this project. This prevents any JS module from choosing a
  // different/local story generator.
  global.JASPER_FANFIC_BACKEND_URL = ENDPOINT;
  global.JASPER_FANFIC_BACKEND_PROVIDER = provider;
  global.JASPER_FANFIC_STORY_PROVIDER = provider;
  global.JASPER_FANFIC_PROVIDER = provider;
  global.JASPER_FANFIC_DIALOGUE_PROVIDER = provider;
  global.CYOA_STORY_PROVIDER = provider;

  try {
    global.StoryGenerationProvider = Object.assign({}, global.StoryGenerationProvider || {}, { generate: provider });
  } catch (_error) {}
  try {
    global.StoryAI = Object.assign({}, global.StoryAI || {}, { generate: provider });
  } catch (_error) {}
  try {
    const ai = Object.assign({}, global.AIBrain || {});
    ai.story = Object.assign({}, ai.story || {}, { generate: provider });
    ai.generateStoryContinuation = provider;
    global.AIBrain = ai;
  } catch (_error) {}

  global.JasperFanfictionBackendBridge = Object.freeze({ VERSION, ENDPOINT, post, provider });
})(typeof globalThis !== 'undefined' ? globalThis : window);
