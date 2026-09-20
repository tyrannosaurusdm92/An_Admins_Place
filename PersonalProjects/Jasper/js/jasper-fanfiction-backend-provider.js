/* Jasper Fanfiction — single Apps Script generation provider.
 *
 * Ordinary generation is story-first and stops before the private boundary.
 * Private-interlude content is never authored by this file's built-in prompt;
 * explicit-bridge.js supplies the sole user-owned extension when that handoff
 * is deliberately selected.
 */
(function (global) {
  'use strict';

  const ENDPOINT = 'https://script.google.com/macros/s/AKfycbwyy_jft1QFTh14LK77gmD32Ttow-dMsZBRW0NUEIslkvOZC_G0D7sAlRrspsnpa_G1/exec';
  const ADULT_MODES = new Set(['mature_on_page', 'explicit', 'explicit_detailed']);
  const VERSION = '2026-09-20.4-full-integration';

  function clone(value) { try { return JSON.parse(JSON.stringify(value)); } catch (_error) { return value; } }
  function slug(value) { return String(value || 'choice').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'choice'; }

  async function post(action, data) {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({ action, data: data || {}, readerId: 'jasper', frontend: 'jasper-virtual-book', bridgeVersion: VERSION }),
      credentials: 'omit', redirect: 'follow', cache: 'no-store'
    });
    const text = await response.text();
    let payload = null;
    try { payload = JSON.parse(text); } catch (_error) {
      const first = text.indexOf('{'); const last = text.lastIndexOf('}');
      if (first >= 0 && last > first) { try { payload = JSON.parse(text.slice(first, last + 1)); } catch (_inner) {} }
    }
    if (!response.ok) throw new Error(`Jasper fanfiction backend returned HTTP ${response.status}.`);
    if (!payload || typeof payload !== 'object') throw new Error('Jasper fanfiction backend returned an unreadable response.');
    if (payload.ok === false) throw new Error(payload.error || 'Jasper fanfiction backend rejected the generation request.');
    return payload;
  }

  function activeEngine() { return global.JasperFanfictionApp?.engine || global.JASPER_CYOA || null; }
  function activeSeries(context) {
    const engine = activeEngine();
    const key = context?.series?.key || engine?.currentSeriesKey || '';
    return engine?.getSeries?.(key) || context?.series || null;
  }

  function requestedMode(context, series) {
    const requested = String(context?.content?.effective_mode || context?.content?.requested_mode || series?.content_mode || 'mature_on_page').toLowerCase();
    if (requested === 'explicit') return 'explicit_detailed';
    return ['general', 'romance', 'mature_on_page', 'explicit_detailed'].includes(requested) ? requested : 'mature_on_page';
  }

  function isPrivateHandoff(context, mode) {
    const target = String(context?.selected_choice?.target || '');
    return mode === 'explicit_detailed' || target.startsWith('@generate-explicit') || Boolean(context?.handoff);
  }

  function adultConfirmed(context, series) {
    const gate = global.JasperFanfictionAdultContract?.validateSeries?.(series || {});
    return gate ? Boolean(gate.ok) : true;
  }

  function storyFirstDirection() {
    return [
      'STORY-FIRST MODE: prioritize plot, characterization, continuous dialogue, banter, humor, atmosphere, conflict, callbacks, memory, relationship development, grammar, and earned emotional consequences.',
      'Slow builds and nonsexual chapters are expected. Do not force a private interlude because the project supports one.',
      'The normal writer may build romance and sensual tension, but it stops at a clean choice/seam before nudity or sexual action. Do not fake that missing section with a censorship fade.',
      'Ordinary generated continuation choices should target @generate. At most one optional private-interlude choice may target @generate-explicit-detailed when it genuinely fits the relationship and scene.',
      'After a returned private interlude, resume with aftercare/reconnection, banter, dialogue, consequences, memory, relationship changes, and the next plot beat.'
    ].join(' ');
  }

  function authoredSequenceDirection(series = {}, context = {}) {
    const parent = context?.parent || {};
    const sequence = parent?.authored_sequence || {};
    const chapterNumber = Number(parent?.chapter_number || sequence?.chapter_number || 0);
    const originalCount = Number(sequence?.original_chapter_count || series?.original_authored_chapter_count || 40);
    const resumeTarget = String(context?.handoff?.resume_target || context?.selected_choice?.handoff_resume_target || sequence?.private_handoff_resume_target || '');
    const lines = [
      `AUTHORED-SEQUENCE LOCK: the starting library contains ${originalCount} fully written authored chapters. Treat them as binding history, not a synopsis to rewrite.`,
      chapterNumber ? `Current chapter position: ${chapterNumber} of ${originalCount} in the original authored arc.` : '',
      chapterNumber >= originalCount
        ? 'The original forty-chapter arc is complete. Any ordinary continuation now creates chapter 41+ while preserving the entire authored history, relationships, callbacks, and unresolved consequences.'
        : 'Before chapter 40, ordinary authored choices may return directly to the next authored chapter rather than generating a replacement for material that already exists.',
      resumeTarget ? `Private-handoff resume target: ${resumeTarget}. Honor it exactly.` : '',
      'Never restart the relationship, reintroduce established facts as new, erase prior choices, or summarize away the forty authored chapters.'
    ].filter(Boolean);
    return lines.join(' ');
  }

  function privateHandoffDirection(context) {
    return [
      'PRIVATE INTERLUDE HANDOFF: the normal writer has already stopped at the private seam; this provider call is now the bridge-owned adult interlude.',
      'Apply context.private_generation.instructions plus the runtime hard-explicit guide specification. Preserve the exact scene state, canon voice, consent/boundary state, dialogue thread, emotional state, William-style cadence, and plot continuity supplied by explicit-bridge.js.',
      context?.handoff?.resume_target
        ? `Finish at a clean return seam so the story runtime can resume at ${context.handoff.resume_target}.`
        : 'Finish at a clean return seam so the story-first runtime can resume afterward.',
      'Do not replace the larger story with repeated private interludes.'
    ].join(' ');
  }

  function writerInfluence(series={}, context={}, request={}) {
    const existing=request?.writerReferenceInfluence || context?.writer_reference || context?.writer_runtime?.writer_reference || context?.writer_runtime?.writer_reference_influence || null;
    if (existing) return clone(existing);
    const options={
      query:[context?.requested?.direction,context?.selected_choice?.generation_hint,context?.selected_choice?.description,context?.parent?.title,series?.title].filter(Boolean).join(' '),
      sceneGoal:context?.requested?.direction||context?.selected_choice?.description||'',
      theme:series?.theme||'',
      dynamic:series?.relationship_dynamic||'',
      character:String(series?.pairing||''),
      seriesKey:series?.key||series?.series_slug||'',
      authoredContext:context?.authored_library||context?.parent?.continuity_snapshot||context?.parent||{},
      continuityLedger:context?.continuity?.memory||context?.continuity||{},
      guideLimit:5,guideChars:800,referenceLimit:6,passageLimit:5
    };
    return global.StoryTools?.JasperWriterReference?.buildBridgeInfluencePacket?.(options)||null;
  }
  function writerInfluencePrompt(series={}, context={}, request={}) {
    const direct=String(context?.writer_reference_prompt||context?.writer_runtime?.writer_reference||request?.writerReferencePrompt||'').trim();
    if (direct) return direct.slice(0,10000);
    return String(global.StoryTools?.JasperWriterReference?.buildJasperWriterReferencePrompt?.({
      query:[context?.requested?.direction,context?.selected_choice?.generation_hint,context?.selected_choice?.description,context?.parent?.title,series?.title].filter(Boolean).join(' '),
      sceneGoal:context?.requested?.direction||context?.selected_choice?.description||'',
      character:String(series?.pairing||''),theme:series?.theme||'',dynamic:series?.relationship_dynamic||'',seriesKey:series?.key||series?.series_slug||'',
      authoredContext:context?.authored_library||context?.parent?.continuity_snapshot||context?.parent||{},continuityLedger:context?.continuity?.memory||context?.continuity||{},
      guideLimit:4,guideChars:700,referenceLimit:5,passageLimit:4
    })||'').slice(0,10000);
  }

  function materialPrompt(context={}) {
    const direct=String(context?.materials_prompt||'').trim();
    if(direct)return direct.slice(0,26000);
    try{return String(global.JasperFanfictionMaterialHub?.promptFor?.(context?.materials)||'').slice(0,26000);}
    catch(_error){return'';}
  }

  function backendSeries(series, context) {
    const out = clone(series || {});
    const mode = requestedMode(context, series);
    const confirmed = adultConfirmed(context, series);
    out.content_mode = mode;
    out.adult_characters_confirmed = confirmed;
    out.consenting_adults_confirmed = confirmed;
    out.current_chapter_id = String(context?.parent?.id || out.current_chapter_id || '');
    out.reader_profile = out.reader_profile || global.JasperFanfictionReader?.profile || { id:'jasper-private-reader-v1', name:'Jasper', birth_year:1999, legal_adult_confirmed:true, gender:'nonbinary' };
    if (!out.key) out.key = context?.series?.key || '';
    if (!out.title) out.title = context?.series?.title || 'Untitled Story';
    if (!out.fandom) out.fandom = context?.series?.fandom || 'Original';
    if (!out.story_type) out.story_type = context?.series?.story_type || 'cyoa_fanfiction';
    if (!out.target_words) out.target_words = Number(context?.requested?.target_words || 1800);
    out.character_profile_ids = clone(context?.character_profile_ids || out.character_profile_ids || []);
    out.character_library = clone(context?.character_library || out.character_library || null);
    out.creation_sources = clone(context?.creation_sources || out.creation_sources || null);
    out.materials_context = clone(context?.materials || out.materials_context || null);
    out.materials_manifest = clone(context?.materials?.availability || out.materials_manifest || null);
    out.guide_runtime = clone(context?.guide_runtime || out.guide_runtime || null);
    out.specialist_runtime = clone(context?.specialist_runtime || context?.materials?.specialist_context?.specialist_runtime || out.specialist_runtime || null);
    out.cyoa_runtime = clone(context?.branch_runtime || context?.materials?.specialist_context?.branch_suggestions || out.cyoa_runtime || null);
    out.private_runtime_spec = String(context?.private_generation?.runtime_spec || context?.materials?.private_spec || out.private_runtime_spec || '').slice(0,16000);

    const contract = global.JasperFanfictionAdultContract?.contractForSeries?.(out) || {};
    out.audience = contract.audience || out.audience;
    out.explicitness = contract.explicitness || out.explicitness;
    out.intimacy_profile = contract.intimacy || out.intimacy_profile;
    out.hard_safety_rules = contract.hard_safety_rules || out.hard_safety_rules;
    out.voice_profiles = contract.voice_profiles || out.voice_profiles;
    out.rating = global.JasperFanfictionAdultContract?.RATING || out.rating || '18+ Private Story / Private Interlude Handoff';
    if (isPrivateHandoff(context, mode) && context?.explicit_bridge?.literotica_reference) {
      out.literotica_reference = clone(context.explicit_bridge.literotica_reference);
      out.private_bridge_age_metadata = clone(context.explicit_bridge.age_metadata || {});
    } else {
      delete out.literotica_reference;
      delete out.private_bridge_age_metadata;
    }

    const contractText = global.JasperFanfictionAdultContract?.promptBlock?.(out, context) || '';
    const beats = global.JasperFanfictionSceneBeats?.prompt?.({ series:out, chapter:context?.parent, choice:context?.selected_choice }) || '';
    const influence = writerInfluence(out, context, {});
    const influencePrompt = writerInfluencePrompt(out, context, {});
    if (influence) {
      out.writer_style_profile = clone(influence.style_dna || {});
      out.writer_reference_influence = clone(influence);
    }
    out.story_bible = [
      ...(Array.isArray(out.story_bible) ? out.story_bible.map(x=>String(x||'').trim()) : [String(out.story_bible || '').trim()]),
      storyFirstDirection(),
      authoredSequenceDirection(out, context),
      'WRITER-REFERENCE PRIORITY: use William Saville corpus tendencies for scene craft/cadence without copying source language; preserve Jasper profile, canon-specific voice, slow-build relationship logic, memory callbacks, continuity, and open plot threads across every generated scene.',
      influencePrompt,
      materialPrompt(context),
      contractText, beats
    ].filter(Boolean).join('\n\n').slice(0,28000);
    const voices = (contract.voice_profiles || []).map(v => `VOICE ${v.character}: ${JSON.stringify(v)}`);
    const characterMaterial = global.JasperFanfictionCharacterLibrary?.promptForPacket?.(context?.character_library) || '';
    out.character_bible = [
      ...(Array.isArray(out.character_bible) ? out.character_bible : []),
      ...voices,
      characterMaterial ? `RESOLVED CHARACTER MATERIAL:\n${characterMaterial}` : ''
    ].filter(Boolean).slice(0,64);
    return out;
  }

  function enrichChapter(chapter, context) {
    if (!chapter || typeof chapter !== 'object') return chapter;
    const copy = clone(chapter);
    copy.choices = Array.isArray(copy.choices) ? copy.choices.map((choice, index) => {
      const label = String(choice?.label || `Choice ${index + 1}`);
      const key = String(choice?.path_key || choice?.pathKey || slug(label)).toLowerCase();
      const target = String(choice?.target || '');
      return {
        ...choice,
        id: String(choice?.id || `choice-${index + 1}`),
        path_key: key,
        generation_hint: String(choice?.generation_hint || choice?.description || label),
        target: target.startsWith('@generate') && /(?:intimat|explicit|private)/.test(key) ? '@generate-explicit-detailed' : (target || '@generate')
      };
    }) : [];
    copy.content_mode = requestedMode(context, activeSeries(context));
    return copy;
  }

  function directionFor(request, context, mode) {
    const choice = context?.selected_choice;
    const privateHandoff = isPrivateHandoff(context, mode);
    const series=activeSeries(context)||context?.series||{};
    const influence=writerInfluence(series,context,request);
    const influencePrompt=writerInfluencePrompt(series,context,request);
    return [
      String(context?.requested?.direction || '').trim(),
      choice ? `${choice.label || 'Selected choice'}: ${choice.description || ''}`.trim() : '',
      storyFirstDirection(),
      authoredSequenceDirection(series, context),
      'CONTINUITY CARRY: do not reset dialogue, emotional state, promises, callbacks, favorite details, injuries/objects/locations, relationship changes, boundaries, or unresolved plot threads.',
      influencePrompt,
      materialPrompt(context),
      privateHandoff && context?.private_generation?.runtime_spec ? `PRIVATE RUNTIME SPEC:
${String(context.private_generation.runtime_spec).slice(0,16000)}` : '',
      influence ? `MACHINE WRITER INFLUENCE:\n${JSON.stringify(influence)}` : '',
      privateHandoff ? privateHandoffDirection(context) : '',
      String(request?.prompt || '').trim()
    ].filter(Boolean).join('\n\n').slice(0, 30000);
  }

  async function provider(request = {}) {
    const context = request.context || {};
    const series = activeSeries(context);
    if (!series) throw new Error('No active Jasper fanfiction series is available for backend generation.');

    const mode = requestedMode(context, series);
    const confirmed = adultConfirmed(context, series);
    if (ADULT_MODES.has(mode) && !confirmed) throw new Error('Adult-only project rule blocked this story because it explicitly describes an under-18 participant or lacks required adult-era framing.');

    const synced = backendSeries(series, context);
    const opening = context?.requested?.mode === 'new_story_opening';
    let result;
    if (opening) {
      result = await post('fanfic.create', { ...synced, overwrite: true });
    } else {
      await post('fanfic.save', { series: synced });
      const choice = context?.selected_choice || null;
      result = await post(choice ? 'fanfic.branch' : 'fanfic.continue', {
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

  global.JASPER_FANFIC_BACKEND_URL = ENDPOINT;
  global.JASPER_FANFIC_BACKEND_PROVIDER = provider;
  global.JASPER_FANFIC_STORY_PROVIDER = provider;
  global.JASPER_FANFIC_PROVIDER = provider;
  global.JASPER_FANFIC_DIALOGUE_PROVIDER = provider;
  global.CYOA_STORY_PROVIDER = provider;
  try { global.StoryGenerationProvider = Object.assign({}, global.StoryGenerationProvider || {}, { generate: provider }); } catch (_error) {}
  try { global.StoryAI = Object.assign({}, global.StoryAI || {}, { generate: provider }); } catch (_error) {}
  try { const ai=Object.assign({},global.AIBrain||{}); ai.story=Object.assign({},ai.story||{},{generate:provider}); ai.generateStoryContinuation=provider; global.AIBrain=ai; } catch (_error) {}

  global.JasperFanfictionBackendBridge = Object.freeze({ VERSION, ENDPOINT, post, provider });
})(typeof globalThis !== 'undefined' ? globalThis : window);
