/* Jasper Fanfiction — William Saville writing-style + adult reader generation helpers. */
(function (global) {
  'use strict';

  const WILLIAM_SAVILLE_STYLE = Object.freeze({
    id: 'william-saville-v2',
    label: 'William Saville',
    source: 'user-supplied writing corpus',
    voice: 'emotion-forward, atmospheric, concrete, character-centered prose',
    avg_sentence_words: 14.2,
    avg_paragraph_words: 61.1,
    tendencies: [
      'Begin inside a concrete sensory moment rather than abstract explanation.',
      'Ground emotion in body sensation, gesture, environment, light, sound, texture, scent, and temperature.',
      'Use accessible language and direct interiority rather than dense abstraction.',
      'Let dialogue happen inside action and physical reaction.',
      'Use contrast pivots such as but, yet, and though when emotion changes direction.',
      'Use semicolons occasionally; avoid relying on em dashes.',
      'Build from environment to body to emotional realization to consequence.',
      'End scenes on consequence, revelation, commitment, danger, or a real decision.'
    ],
    avoid: [
      'Do not copy or remix source sentences verbatim.',
      'Do not use generic therapy-speak as a substitute for character-specific thought.',
      'Do not mention prompts, JSON, generation, branches, or chapter mechanics inside prose.',
      'Avoid repetitive sentence openings and stacked metaphors.'
    ]
  });

  const JASPER_READER_PROFILE = Object.freeze({
    id: 'jasper-private-reader-v1',
    name: 'Jasper',
    birth_year: 1999,
    legal_adult_confirmed: true,
    gender: 'nonbinary',
    pronouns: Object.freeze({ subject: 'they', object: 'them', possessive_adjective: 'their', possessive_pronoun: 'theirs', reflexive: 'themself' }),
    assigned_sex_at_birth: 'AFAB',
    point_of_view: 'first-person reader protagonist using I / me / my / myself',
    address_rule: 'Other characters may address the reader-protagonist by the name Jasper.',
    anatomy: Object.freeze({
      profile: 'AFAB',
      chest: 'chest',
      external_genitals: ['vulva', 'clitoris'],
      internal_genitals: ['vagina'],
      reproductive_anatomy: ['uterus'],
      rule: 'Use only anatomy that the story context establishes as applicable to Jasper; do not invent anatomy from gender stereotypes.'
    }),
    privacy: 'private single-reader project'
  });

  const STORY_CONTENT_MODES = Object.freeze({
    general: Object.freeze({ id: 'general', label: 'General', instruction: 'Keep the chapter nonsexual. Romance and affection are fine.' }),
    romance: Object.freeze({ id: 'romance', label: 'Romance', instruction: 'Romance may be on-page, but do not initiate a sex scene.' }),
    adult_explicit: Object.freeze({
      id: 'adult_explicit',
      label: 'Adults-only explicit on-page',
      instruction: 'Sexual content is allowed only between consenting adults age 18+. If a sex scene occurs, keep it on-page and describe the physical sequence, anatomy, sensation, communication, consent, and aftermath directly. Do not fade to black, cut away, skip from initiation to aftermath, or replace the scene with euphemistic summary.'
    })
  });

  const STORY_TAG_TAXONOMY = Object.freeze({
    source: 'https://tags.literotica.com/',
    purpose: 'metadata vocabulary only; this project remains a private fanfiction reader',
    categories: ['Fan Fiction & Celebrities', 'Romance', 'Mature', 'Novels and Novellas', 'Sci-Fi & Fantasy', 'Humor & Satire'],
    supported_tags: [
      'romance','slow burn','polyamory','love story','sensual','kissing','age gap','adventure','action','drama','mystery','historical','magic','supernatural','humor','military','dirty talk','roleplay','bondage','dominance','submission','oral sex','vaginal sex','mutual masturbation','toys','multiple orgasms','aftercare'
    ]
  });

  const arr = value => Array.isArray(value) ? value : (value == null ? [] : [value]);
  const wc = text => (String(text || '').match(/\b[\w’'-]+\b/g) || []).length;
  const trim = (text, max = 4000) => { const v=String(text||'').trim(); if(v.length<=max)return v; const h=Math.floor(max*.35); return `${v.slice(0,h).trim()}\n…[trimmed]…\n${v.slice(-(max-h-16)).trim()}`; };

  function normalizeMode(value) {
    const key = String(value || 'romance').toLowerCase();
    if (key === 'mature_on_page' || key === 'explicit' || key === 'nsfw') return STORY_CONTENT_MODES.adult_explicit;
    return STORY_CONTENT_MODES[key] || STORY_CONTENT_MODES.romance;
  }

  function analyzeStoryStyle(texts=[]) {
    const corpus=arr(texts).map(String).filter(Boolean).join('\n\n');
    const sentences=(corpus.replace(/\s+/g,' ').match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]);
    const paragraphs=corpus.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
    const mean=(values,fallback)=>values.length?values.reduce((a,b)=>a+b,0)/values.length:fallback;
    return {sample_words:wc(corpus),avg_sentence_words:Number(mean(sentences.map(wc).filter(Boolean),14.2).toFixed(1)),avg_paragraph_words:Number(mean(paragraphs.map(wc).filter(Boolean),61.1).toFixed(1)),semicolons:(corpus.match(/;/g)||[]).length,em_dashes:(corpus.match(/—/g)||[]).length};
  }

  function adultsEligible(series={}) {
    if (!series.adult_characters_confirmed) return false;
    const ages = series.character_ages && typeof series.character_ages === 'object' ? Object.values(series.character_ages) : [];
    return !ages.some(age => Number.isFinite(Number(age)) && Number(age) < 18);
  }

  function buildStoryContext({series={},chapters=[],currentChapter=null,selectedChoice=null,branchState={},notes=[],privateSeed=''}={}) {
    const sorted=arr(chapters).slice().sort((a,b)=>(a.chapter_number||0)-(b.chapter_number||0));
    const requested=normalizeMode(series.content_mode);
    const effective=requested.id==='adult_explicit'&&!adultsEligible(series)?STORY_CONTENT_MODES.romance:requested;
    return {
      schema:'jasper.fanfiction.story-context.v5',
      reader: JASPER_READER_PROFILE,
      series:{key:series.key||series.series_slug||'',title:series.title||'',fandom:series.fandom||'',pairing:series.pairing||'',premise:series.premise||series.description||'',canon_window:series.canon_window||'',reader_mode:series.reader_mode||JASPER_READER_PROFILE.point_of_view,story_bible:trim(series.story_bible||'',7000),character_bible:series.character_bible||series.characters||[],character_ages:series.character_ages||{}},
      style:{profile:WILLIAM_SAVILLE_STYLE,observed:analyzeStoryStyle(sorted.slice(-8).map(ch=>ch.content))},
      content:{requested_mode:requested.id,effective_mode:effective.id,instruction:effective.instruction,adult_characters_confirmed:Boolean(series.adult_characters_confirmed),taxonomy_source:STORY_TAG_TAXONOMY.source,tags:series.content_tags||[]},
      currentChapter:currentChapter?{id:currentChapter.id,chapter_number:currentChapter.chapter_number,title:currentChapter.title,ending:trim(String(currentChapter.content||'').slice(-3500),3500)}:null,
      selectedChoice:selectedChoice||null,branchState:branchState||{},privateSeed:privateSeed?trim(privateSeed,7000):'',notes:arr(notes)
    };
  }

  function buildStoryPrompt(context,{mode='continue',choiceCount=3,minWords=900,targetWords=1600}={}) {
    const lines=[
      mode==='create'?'Create chapter 01 of Jasper’s private interactive fanfiction.':'Continue Jasper’s private interactive fanfiction directly from continuity.',
      `Jasper is the reader-protagonist. Write first-person narration as I/me/my/myself; other characters may call the protagonist Jasper. Jasper uses they/them pronouns when referred to by others.`,
      'Preserve established characterization, canon, point of view, unresolved threads, physical facts, promises, relationship state, and prior-choice consequences.',
      `Write approximately ${targetWords} words and normally at least ${minWords}.`,
      'Use the William Saville style profile as cadence and voice guidance without copying source sentences.',
      `Content mode: ${context?.content?.instruction || STORY_CONTENT_MODES.romance.instruction}`,
      'Sexual activity is prohibited if any participant is under 18 or adult status is unknown. Jasper is a confirmed legal adult; every other sexual participant must also be confirmed 18+ in this story.',
      'For adult-explicit scenes, use Jasper’s configured AFAB anatomy consistently when relevant and do not substitute anatomy based on gender stereotypes.',
      'Do not use fade-to-black phrases, cutaways, “the rest stayed private,” or jumps from sexual initiation directly to aftermath when adult-explicit mode is active.',
      `End at a meaningful decision point with ${choiceCount}-5 materially different choices.`,
      'Return strict JSON with title, subtitle, content, path_variants, research_alignment, continuity_updates, unresolved_threads, and choices.',
      JSON.stringify(context)
    ];
    return lines.join('\n\n');
  }

  global.JasperFanfictionWriting = Object.freeze({WILLIAM_SAVILLE_STYLE,JASPER_READER_PROFILE,STORY_CONTENT_MODES,STORY_TAG_TAXONOMY,normalizeMode,analyzeStoryStyle,adultsEligible,buildStoryContext,buildStoryPrompt});
})(typeof globalThis !== 'undefined' ? globalThis : window);
