/*
 * Jasper Fanfiction CYOA + Adult Short Story Engine.
 *
 * Architecture adapted from the user-supplied choose-your-own-adventure
 * reference projects, especially the MIT-licensed CYOAwesome and Undum:
 * - named scene/situation graph rather than a fixed next-page list
 * - transition history / replayable branch trail
 * - qualities (choice effects) and conditional choices
 * - persistent save state
 * - visited-scene tracking
 * - current choices become inactive once a transition is taken
 *
 * The supplied cya.js project is GPLv3. Its source is NOT copied here so this
 * file does not force the surrounding project to adopt GPLv3. Its high-level
 * ideas (scene targets, choices, save/load) are implemented independently.
 * Readteractive's chapter-link model informed the JSON chapter graph, but no
 * unlicensed Readteractive source is copied.
 */
(function (global) {
  'use strict';

  const VERSION = '5.0.0';
  const STORAGE_PREFIX = 'jasper-fanfiction-cyoa-v5';
  const HANDLE_DB = 'jasper-cyoa-file-handles';
  const HANDLE_STORE = 'handles';
  const HANDLE_KEY = 'project-root';

  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const nowIso = () => new Date().toISOString();
  const arr = value => Array.isArray(value) ? value : (value == null ? [] : [value]);
  const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const randomId = prefix => `${prefix || 'id'}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  const slug = value => String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'story';
  const safeFolder = value => String(value || 'Story').replace(/[<>:"/\\|?*\x00-\x1F]/g, '-').replace(/[. ]+$/g, '').trim() || 'Story';
  const dashedFolder = (value, fallback = 'Story') => {
    const cleaned = String(value || fallback)
      .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, ' And ')
      .replace(/[’']/g, '')
      .replace(/[^A-Za-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
    return safeFolder(cleaned || fallback);
  };
  const wordCount = text => (String(text || '').trim().match(/\b[\w’'-]+\b/g) || []).length;
  const padChapter = n => String(Math.max(0, Number(n) || 0)).padStart(2, '0');
  const sentenceCase = text => {
    const s = String(text || '').trim();
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  };


  /*
   * Compact adaptive style model. This stores general prose tendencies and
   * route-local metrics only; it does not embed or reproduce any outside book.
   */
  const ADAPTIVE_STORY_STYLE_PROFILE = Object.freeze({
    id: 'story-adaptive-v1',
    label: 'Adaptive story style',
    source: 'current route prose and reader preferences',
    voice: 'emotion-forward, atmospheric, concrete, character-centered prose',
    point_of_view_preference: 'match the story; first-person for reader-insert fanfiction',
    avg_sentence_words: 14.2,
    target_sentence_words: [10, 19],
    avg_paragraph_words: 61,
    target_paragraph_words: [40, 85],
    dialogue_density: 'moderate',
    punctuation: {
      semicolons: 'occasional emotional/logical pivot',
      em_dash: 'rare; prefer commas, periods, or semicolons',
      exclamation: 'sparingly',
      rhetorical_questions: 'sparingly'
    },
    tendencies: [
      'Open inside a concrete moment rather than with abstract exposition.',
      'Anchor scenes in sensory detail: light, temperature, texture, scent, sound, breath, posture, and hands.',
      'Keep emotional stakes physically legible through body sensation and action.',
      'Use direct interiority and accessible language rather than ornate abstraction.',
      'Use simile and image to intensify emotion, but keep the image easy to visualize.',
      'Let dialogue occur inside action; avoid long stretches of floating dialogue.',
      'Build tension by narrowing attention from environment to body to decision.',
      'Use contrast pivots such as but/yet/though when emotion changes direction.',
      'Allow tenderness, dread, grief, humor, or desire to coexist with practical scene details.',
      'End scenes on consequence, revelation, commitment, danger, or a meaningful choice.'
    ],
    avoid: [
      'Do not imitate source passages verbatim.',
      'Avoid repetitive therapy-speak or generic reassurance language.',
      'Avoid explaining the story as a story, chapter, branch, premise, or prompt inside the prose.',
      'Avoid purple-prose stacks of metaphors.',
      'Avoid repetitive sentence openings and repeated emotional labels.'
    ]
  });

  /*
   * The taxonomy source is used for discoverability/metadata and scene intent.
   * Adult-only content modes are explicit-capable when a story-generation provider is configured.
   */
  const STORY_TAG_TAXONOMY = Object.freeze({
    source: 'https://tags.literotica.com/',
    categories: ['Fan Fiction & Celebrities', 'Romance', 'Mature', 'Novels and Novellas', 'Sci-Fi & Fantasy', 'Humor & Satire', 'Erotic Horror'],
    supported_tags: [
      'romance', 'slow burn', 'polyamory', 'love story', 'sensual', 'kissing', 'age gap',
      'adventure', 'action', 'drama', 'mystery', 'historical', 'magic', 'supernatural',
      'vampire', 'werewolf', 'witch', 'monster', 'humor', 'military', 'holiday', 'wedding',
      'hurt/comfort', 'found family', 'domestic', 'jealousy', 'protective', 'reconciliation'
    ]
  });

  const CONTENT_MODES = Object.freeze({
    general: {
      id: 'general', label: 'General', adult_required: false,
      instruction: 'Do not initiate sexual activity. Romance and affection are fine; do not imply off-page sex or use a fade-to-black transition.'
    },
    romance: {
      id: 'romance', label: 'Romance', adult_required: false,
      instruction: 'Romance may be on-page with kissing, desire, affection, and relationship tension. If the scene reaches a sexual decision point, stop at a real choice instead of fading to black or skipping to aftermath.'
    },
    mature_on_page: {
      id: 'mature_on_page', label: 'Mature on-page', adult_required: true,
      instruction: 'All romantic or sexual participants must be confirmed adults and consenting. Intimacy may remain on-page through undressing, sensual touch, desire, consent, and aftermath, but avoid graphic anatomical detail.'
    },
    explicit: {
      id: 'explicit', label: 'Explicit', adult_required: true,
      instruction: 'All sexual participants must be confirmed consenting adults. The requested scene may be sexually explicit and remain on-page instead of fading to black. Preserve characterization, consent, emotional continuity, and the requested point of view.'
    },
    explicit_detailed: {
      id: 'explicit_detailed', label: 'Explicit + detailed', adult_required: true,
      instruction: 'All sexual participants must be confirmed consenting adults. The requested scene may use detailed explicit sexual description. Keep the scene character-driven, consensual, continuous with the story, and written as finished prose rather than a list of acts.'
    }
  });

  function trimText(text, max = 4000) {
    const value = String(text || '').trim();
    if (value.length <= max) return value;
    const head = Math.max(0, Math.floor(max * 0.36));
    const tail = Math.max(0, max - head - 27);
    return `${value.slice(0, head).trim()}\n…[continuity trimmed]…\n${value.slice(-tail).trim()}`;
  }

  function splitSentences(text) {
    return String(text || '').replace(/\s+/g, ' ').trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  }

  function splitParagraphs(text) {
    return String(text || '').split(/\n\s*\n/).map(item => item.trim()).filter(Boolean);
  }

  function average(values, fallback = 0) {
    const usable = values.filter(value => Number.isFinite(value));
    return usable.length ? usable.reduce((sum, value) => sum + value, 0) / usable.length : fallback;
  }

  function analyzeStyleCorpus(texts) {
    const corpus = arr(texts).map(value => String(value || '').trim()).filter(Boolean);
    const joined = corpus.join('\n\n');
    const sentences = splitSentences(joined);
    const paragraphs = corpus.flatMap(splitParagraphs);
    const sentenceWords = sentences.map(wordCount).filter(Boolean);
    const paragraphWords = paragraphs.map(wordCount).filter(Boolean);
    const words = Math.max(1, wordCount(joined));
    const quotePairs = (joined.match(/[“\"]/g) || []).length / 2;
    return {
      sample_count: corpus.length,
      word_count: wordCount(joined),
      avg_sentence_words: Number(average(sentenceWords, 14).toFixed(1)),
      avg_paragraph_words: Number(average(paragraphWords, 58).toFixed(1)),
      semicolons_per_1k: Number(((joined.match(/;/g) || []).length / words * 1000).toFixed(1)),
      em_dashes_per_1k: Number(((joined.match(/—/g) || []).length / words * 1000).toFixed(1)),
      dialogue_pairs_per_1k: Number((quotePairs / words * 1000).toFixed(1)),
      first_person_markers: (joined.match(/\b(?:I|me|my|myself)\b/g) || []).length,
      third_person_markers: (joined.match(/\b(?:he|she|him|her|his|hers|they|them|their)\b/gi) || []).length
    };
  }

  function normalizeTags(value) {
    const values = Array.isArray(value) ? value : String(value || '').split(',');
    const seen = new Set();
    return values.map(item => String(item || '').trim().toLowerCase()).filter(item => {
      if (!item || seen.has(item)) return false;
      seen.add(item);
      return true;
    }).slice(0, 40);
  }

  function resolveContentMode(value) {
    const key = String(value || 'romance').trim().toLowerCase();
    return CONTENT_MODES[key] || CONTENT_MODES.romance;
  }

  function buildStyleProfile(series, chapters) {
    const mode = String(series?.style_mode || 'story_adaptive').toLowerCase();
    const samples = arr(chapters).map(ch => ch?.content).filter(text => wordCount(text) >= 80).slice(-8);
    const inferred = analyzeStyleCorpus(samples);
    if (mode === 'story_only' || mode === 'infer') {
      return {
        id: 'story-inferred',
        label: 'Inferred from this story',
        avg_sentence_words: inferred.avg_sentence_words,
        avg_paragraph_words: inferred.avg_paragraph_words,
        observed: inferred,
        tendencies: ['Match diction, paragraph cadence, dialogue density, and emotional distance from the supplied story samples.'],
        avoid: ['Do not quote or recycle distinctive sentences from earlier chapters unless continuity requires a brief callback.']
      };
    }
    return {
      ...clone(ADAPTIVE_STORY_STYLE_PROFILE),
      observed_story_style: inferred.word_count >= 500 ? inferred : null,
      custom: series?.style_profile && typeof series.style_profile === 'object' ? clone(series.style_profile) : {}
    };
  }

  function hashText(text) {
    let h = 2166136261;
    const s = String(text || '');
    for (let i = 0; i < s.length; i += 1) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
  }

  function stableChoiceId(seriesKey, chapterNumber, pathKey, index) {
    return `${slug(seriesKey)}-${padChapter(chapterNumber)}-${slug(pathKey || `choice-${index + 1}`)}`;
  }

  function normalizeEffects(effect) {
    if (!effect || typeof effect !== 'object' || Array.isArray(effect)) return {};
    return clone(effect);
  }

  function normalizeChoice(choice, chapter, index) {
    const source = choice && typeof choice === 'object' ? choice : { label: String(choice || '') };
    const pathKey = source.path_key || source.pathKey || source.key || slug(source.label || `choice-${index + 1}`);
    return {
      ...clone(source),
      id: source.id || stableChoiceId(chapter.series_slug || chapter.series_key || 'story', chapter.chapter_number, pathKey, index),
      label: source.label || source.text || `Choice ${index + 1}`,
      description: source.description || source.detail || '',
      target: source.target || source.next || '@generate',
      return_to: source.return_to || source.returnTo || null,
      path_key: pathKey,
      effect: normalizeEffects(source.effect || source.effects),
      requires: source.requires || source.when || null,
      unless: source.unless || null,
      once: Boolean(source.once),
      hidden: Boolean(source.hidden),
      generation_hint: source.generation_hint || source.generationHint || source.description || source.label || ''
    };
  }

  function normalizeChapter(raw, series, fallbackNumber) {
    const chapter = clone(raw || {});
    const seriesKey = chapter.series_slug || chapter.series_key || series?.key || slug(series?.title || series?.fandom || 'story');
    const n = Math.max(1, num(chapter.chapter_number ?? chapter.chapter ?? chapter.number, fallbackNumber || 1));
    const choices = arr(chapter.choices || chapter.options).map((choice, index) => normalizeChoice(choice, { ...chapter, series_slug: seriesKey, chapter_number: n }, index));
    const content = String(chapter.content ?? chapter.text ?? chapter.body ?? '');
    const id = chapter.id || chapter.chapter_id || `${seriesKey}-${padChapter(n)}`;
    return {
      ...chapter,
      schema_version: chapter.schema_version || '3.0',
      work_type: chapter.work_type || 'fanfic_chapter',
      format: chapter.format || 'choice_enriched_first_person_reader_insert',
      id,
      series_slug: seriesKey,
      series_key: seriesKey,
      series_title: chapter.series_title || series?.title || 'Untitled Story',
      fandom: chapter.fandom || series?.fandom || 'Original',
      pairing: chapter.pairing || series?.pairing || '',
      chapter_number: n,
      title: chapter.title || `Chapter ${n}`,
      subtitle: chapter.subtitle || `${chapter.series_title || series?.title || 'Story'} · Chapter ${n}`,
      content,
      word_count: num(chapter.word_count, wordCount(content)),
      choices,
      choice_count: choices.length,
      path_variants: chapter.path_variants && typeof chapter.path_variants === 'object' ? clone(chapter.path_variants) : {},
      generated: Boolean(chapter.generated || chapter.generation),
      created_at: chapter.created_at || chapter.date_written || nowIso(),
      updated_at: chapter.updated_at || chapter.date_revised || null
    };
  }

  function normalizeSeries(raw, fallbackKey) {
    const series = clone(raw || {});
    const title = series.title || series.series_title || sentenceCase(String(series.series_slug || fallbackKey || 'story').replace(/-/g, ' '));
    const key = series.key || series.series_slug || fallbackKey || slug(title || series.fandom || 'story');
    const pathParts = String(series.series_path || '').split(/[\/]/).filter(Boolean);
    const fandomFolder = safeFolder(series.fandom_folder || series.folder || pathParts[0] || series.fandom || 'Original');
    const storyFolder = dashedFolder(series.series_folder || series.story_folder || pathParts[1] || title || key, sentenceCase(key));
    const storyType = String(series.story_type || series.format_type || 'cyoa_fanfiction').toLowerCase() === 'short_story' ? 'short_story' : 'cyoa_fanfiction';
    const normalized = {
      ...series,
      key,
      series_slug: key,
      folder: fandomFolder,
      fandom_folder: fandomFolder,
      series_folder: storyFolder,
      story_folder: storyFolder,
      series_path: `${fandomFolder}/${storyFolder}`,
      fandom: series.fandom || fandomFolder,
      title,
      series_title: title,
      pairing: series.pairing || '',
      description: series.description || series.premise || '',
      premise: series.premise || series.description || '',
      reader_mode: series.reader_mode || 'First-person reader insert',
      genre: series.genre || '',
      tone: series.tone || '',
      story_type: storyType,
      choice_count: storyType === 'short_story' ? 0 : clamp(num(series.choice_count, 4), 3, 5),
      style_mode: series.style_mode || 'story_adaptive',
      style_profile: series.style_profile && typeof series.style_profile === 'object' ? clone(series.style_profile) : {},
      content_mode: resolveContentMode(series.content_mode || series.rating_mode || 'romance').id,
      content_tags: normalizeTags(series.content_tags || series.tags),
      target_words: clamp(num(series.target_words || series.chapter_target_words, storyType === 'short_story' ? 2500 : 1600), 600, 10000),
      adult_characters_confirmed: Boolean(series.adult_characters_confirmed || series.consenting_adults_confirmed),
      consenting_adults_confirmed: Boolean(series.adult_characters_confirmed || series.consenting_adults_confirmed),
      story_bible: series.story_bible || series.continuity_bible || '',
      character_bible: clone(series.character_bible || series.characters || []),
      unresolved_threads: clone(series.unresolved_threads || []),
      must_include: clone(series.must_include || []),
      avoid: clone(series.avoid || []),
      accent: series.accent || '',
      chapters: []
    };
    normalized.chapters = arr(series.chapters).map((chapter, index) => normalizeChapter(chapter, normalized, index + 1));
    return normalized;
  }

  function mergeChapter(existing, incoming) {
    if (!existing) return incoming;
    const merged = { ...existing, ...incoming };
    merged.choices = incoming.choices?.length ? incoming.choices : existing.choices;
    merged.path_variants = { ...(existing.path_variants || {}), ...(incoming.path_variants || {}) };
    merged.content = incoming.content || existing.content || '';
    merged.word_count = wordCount(merged.content);
    merged.choice_count = merged.choices?.length || 0;
    return merged;
  }

  function setDeep(target, path, value, mode) {
    const parts = String(path || '').split('.').filter(Boolean);
    if (!parts.length) return;
    let cursor = target;
    for (let i = 0; i < parts.length - 1; i += 1) {
      const key = parts[i];
      if (!cursor[key] || typeof cursor[key] !== 'object' || Array.isArray(cursor[key])) cursor[key] = {};
      cursor = cursor[key];
    }
    const key = parts[parts.length - 1];
    if (mode === 'inc') cursor[key] = num(cursor[key], 0) + num(value, 0);
    else if (mode === 'toggle') cursor[key] = !cursor[key];
    else cursor[key] = clone(value);
  }

  function getDeep(target, path) {
    const parts = String(path || '').split('.').filter(Boolean);
    let cursor = target;
    for (const key of parts) {
      if (cursor == null) return undefined;
      cursor = cursor[key];
    }
    return cursor;
  }

  function matchesCondition(condition, memory) {
    if (!condition) return true;
    if (typeof condition === 'function') {
      try { return Boolean(condition(memory)); } catch (_error) { return false; }
    }
    if (typeof condition === 'string') return Boolean(getDeep(memory, condition));
    if (Array.isArray(condition)) return condition.every(item => matchesCondition(item, memory));
    if (typeof condition !== 'object') return Boolean(condition);

    if (condition.all) return arr(condition.all).every(item => matchesCondition(item, memory));
    if (condition.any) return arr(condition.any).some(item => matchesCondition(item, memory));
    if (condition.not) return !matchesCondition(condition.not, memory);

    return Object.entries(condition).every(([path, expected]) => {
      const actual = getDeep(memory, path);
      if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
        if ('$gte' in expected && !(num(actual) >= num(expected.$gte))) return false;
        if ('$gt' in expected && !(num(actual) > num(expected.$gt))) return false;
        if ('$lte' in expected && !(num(actual) <= num(expected.$lte))) return false;
        if ('$lt' in expected && !(num(actual) < num(expected.$lt))) return false;
        if ('$eq' in expected && actual !== expected.$eq) return false;
        if ('$ne' in expected && actual === expected.$ne) return false;
        if ('$in' in expected && !arr(expected.$in).includes(actual)) return false;
        if ('$includes' in expected && !arr(actual).includes(expected.$includes)) return false;
        return true;
      }
      return actual === expected;
    });
  }

  class BranchMemory {
    constructor(seriesKey, seed) {
      this.seriesKey = seriesKey;
      this.key = `${STORAGE_PREFIX}:state:${seriesKey}`;
      this.state = {
        schema: 'cyoa.branch-state.v5',
        seriesKey,
        currentId: null,
        currentBridge: '',
        turn: 0,
        values: {},
        flags: {},
        visited: [],
        chosenChoiceIds: [],
        history: [],
        journal: [],
        generatedIds: [],
        continuityUpdates: [],
        branches: [],
        undoStack: [],
        startedAt: nowIso(),
        updatedAt: nowIso(),
        ...clone(seed || {})
      };
      this.load();
    }

    load() {
      try {
        const raw = global.localStorage?.getItem(this.key);
        if (!raw) return this.state;
        const parsed = JSON.parse(raw);
        if (parsed && parsed.seriesKey === this.seriesKey) {
          this.state = { ...this.state, ...parsed };
          this.state.branches = arr(this.state.branches).filter(branch => branch && branch.id && branch.snapshot);
          this.state.undoStack = arr(this.state.undoStack).filter(id => this.state.branches.some(branch => branch.id === id));
        }
      } catch (_error) {}
      return this.state;
    }

    save() {
      this.state.updatedAt = nowIso();
      try { global.localStorage?.setItem(this.key, JSON.stringify(this.state)); } catch (_error) {}
      return this.state;
    }

    reset({ keepGenerated = true } = {}) {
      const generatedIds = keepGenerated ? [...(this.state.generatedIds || [])] : [];
      this.state = {
        schema: 'cyoa.branch-state.v5', seriesKey: this.seriesKey, currentId: null, currentBridge: '', turn: 0,
        values: {}, flags: {}, visited: [], chosenChoiceIds: [], history: [], journal: [], generatedIds, continuityUpdates: [],
        branches: [], undoStack: [],
        startedAt: nowIso(), updatedAt: nowIso()
      };
      this.save();
      return this.state;
    }

    visit(chapter, meta = {}) {
      if (!chapter) return;
      this.state.currentId = chapter.id;
      this.state.currentBridge = meta.bridge || '';
      this.state.turn = Math.max(0, num(this.state.turn)) + 1;
      if (!this.state.visited.includes(chapter.id)) this.state.visited.push(chapter.id);
      this.state.history.push({
        at: nowIso(),
        type: 'enter',
        chapterId: chapter.id,
        chapterNumber: chapter.chapter_number,
        title: chapter.title,
        from: meta.from || null,
        choiceId: meta.choiceId || null,
        pathKey: meta.pathKey || null,
        bridge: meta.bridge || ''
      });
      this.state.history = this.state.history.slice(-500);
      this.save();
    }

    choose(chapter, choice) {
      if (!chapter || !choice) return;
      const branch = this.captureDecision(chapter, choice);
      if (!this.state.chosenChoiceIds.includes(choice.id)) this.state.chosenChoiceIds.push(choice.id);
      this.applyEffects(choice.effect || {});
      const bridge = chapter.path_variants?.[choice.path_key] || '';
      this.state.currentBridge = bridge;
      this.state.journal.push({
        at: nowIso(), chapterId: chapter.id, chapterNumber: chapter.chapter_number,
        chapter: `Chapter ${chapter.chapter_number}`, choiceId: choice.id, choice: choice.label,
        pathKey: choice.path_key || null, effect: clone(choice.effect || {}), bridge
      });
      this.state.journal = this.state.journal.slice(-200);
      this.state.history.push({
        at: nowIso(), type: 'choice', chapterId: chapter.id, choiceId: choice.id,
        label: choice.label, target: choice.target, pathKey: choice.path_key || null,
        effect: clone(choice.effect || {})
      });
      this.state.history = this.state.history.slice(-500);
      if (branch?.id) this.state.undoStack = [...arr(this.state.undoStack), branch.id].slice(-100);
      this.save();
      return bridge;
    }

    decisionSnapshot() {
      const snapshot = clone(this.state);
      snapshot.branches = [];
      snapshot.undoStack = [];
      return snapshot;
    }

    captureDecision(chapter, choice) {
      const id = randomId('branch');
      const branch = {
        id,
        kind: 'decision',
        label: `Before “${choice.label || 'this choice'}”`,
        chapterId: chapter.id,
        chapterNumber: chapter.chapter_number,
        choiceId: choice.id || null,
        choiceLabel: choice.label || '',
        createdAt: nowIso(),
        snapshot: this.decisionSnapshot()
      };
      this.state.branches = [...arr(this.state.branches), branch].slice(-100);
      return branch;
    }

    createBranch(label = '') {
      const branch = {
        id: randomId('branch'),
        kind: 'manual',
        label: String(label || `Saved at chapter ${this.state.turn || 0}`).trim(),
        chapterId: this.state.currentId,
        chapterNumber: this.state.history.slice().reverse().find(item => item.chapterNumber)?.chapterNumber || null,
        choiceId: null,
        choiceLabel: '',
        createdAt: nowIso(),
        snapshot: this.decisionSnapshot()
      };
      this.state.branches = [...arr(this.state.branches), branch].slice(-100);
      this.save();
      return this.branchInfo(branch);
    }

    branchInfo(branch) {
      if (!branch) return null;
      const { snapshot: _snapshot, ...info } = branch;
      return clone(info);
    }

    listBranches() {
      return arr(this.state.branches).slice().reverse().map(branch => this.branchInfo(branch)).filter(Boolean);
    }

    canUndo() { return arr(this.state.undoStack).length > 0; }

    undo() {
      const stack = [...arr(this.state.undoStack)];
      while (stack.length) {
        const id = stack.pop();
        const branch = this.state.branches.find(item => item.id === id && item.snapshot);
        if (!branch) continue;
        const branches = this.state.branches;
        const restored = clone(branch.snapshot);
        restored.branches = branches;
        restored.undoStack = stack;
        restored.schema = 'cyoa.branch-state.v5';
        this.state = restored;
        this.save();
        return this.branchInfo(branch);
      }
      this.state.undoStack = stack;
      this.save();
      return null;
    }

    restoreBranch(id) {
      const branch = this.state.branches.find(item => item.id === id && item.snapshot);
      if (!branch) return null;
      const branches = this.state.branches;
      const restored = clone(branch.snapshot);
      restored.branches = branches;
      restored.undoStack = [];
      restored.schema = 'cyoa.branch-state.v5';
      this.state = restored;
      this.save();
      return this.branchInfo(branch);
    }

    applyEffects(effects) {
      if (!effects || typeof effects !== 'object') return;
      Object.entries(effects).forEach(([path, value]) => {
        if (path === '$set' && value && typeof value === 'object') {
          Object.entries(value).forEach(([p, v]) => setDeep(this.state, p, v, 'set'));
        } else if (path === '$inc' && value && typeof value === 'object') {
          Object.entries(value).forEach(([p, v]) => setDeep(this.state, p, v, 'inc'));
        } else if (path === '$flags' && value && typeof value === 'object') {
          Object.entries(value).forEach(([p, v]) => setDeep(this.state.flags, p, v, 'set'));
        } else if (typeof value === 'number') {
          setDeep(this.state.values, path, value, 'inc');
        } else {
          setDeep(this.state.values, path, value, 'set');
        }
      });
      this.save();
    }

    canChoose(choice) {
      if (!choice || choice.hidden) return false;
      if (choice.once && this.state.chosenChoiceIds.includes(choice.id)) return false;
      const view = { ...this.state, qualities: this.state.values, values: this.state.values, flags: this.state.flags };
      if (!matchesCondition(choice.requires, view)) return false;
      if (choice.unless && matchesCondition(choice.unless, view)) return false;
      return true;
    }

    markGenerated(id) {
      if (id && !this.state.generatedIds.includes(id)) this.state.generatedIds.push(id);
      this.save();
    }

    recordContinuity(chapter) {
      if (!chapter) return;
      const updates = chapter.continuity_updates && typeof chapter.continuity_updates === 'object'
        ? clone(chapter.continuity_updates)
        : {};
      const unresolved = arr(chapter.unresolved_threads).map(value => String(value || '').trim()).filter(Boolean);
      this.state.continuityUpdates = arr(this.state.continuityUpdates);
      this.state.continuityUpdates.push({
        at: nowIso(),
        chapterId: chapter.id || null,
        chapterNumber: chapter.chapter_number || null,
        updates,
        unresolvedThreads: unresolved
      });
      this.state.continuityUpdates = this.state.continuityUpdates.slice(-120);
      if (updates.flags && typeof updates.flags === 'object') {
        Object.entries(updates.flags).forEach(([key, value]) => setDeep(this.state.flags, key, value, 'set'));
      }
      if (updates.qualities && typeof updates.qualities === 'object') {
        Object.entries(updates.qualities).forEach(([key, value]) => {
          if (typeof value === 'number') setDeep(this.state.values, key, value, 'inc');
          else setDeep(this.state.values, key, value, 'set');
        });
      }
      this.save();
    }

    snapshot() {
      const snapshot = clone(this.state);
      snapshot.branches = arr(this.state.branches).map(branch => this.branchInfo(branch));
      return snapshot;
    }

    fullSnapshot() { return clone(this.state); }
  }

  class StoryJsonStore {
    constructor() {
      this.projectRoot = null;
      this.handleRestoreAttempted = false;
    }

    generatedKey(seriesKey) { return `${STORAGE_PREFIX}:generated:${seriesKey}`; }
    settingsKey(seriesKey) { return `${STORAGE_PREFIX}:settings:${seriesKey}`; }

    loadSeriesSettings(seriesKey) {
      try {
        const raw = global.localStorage?.getItem(this.settingsKey(seriesKey));
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
      } catch (_error) { return {}; }
    }

    saveSeriesSettings(seriesKey, settings) {
      try { global.localStorage?.setItem(this.settingsKey(seriesKey), JSON.stringify(settings || {})); } catch (_error) {}
      return settings || {};
    }

    loadGenerated(seriesKey) {
      try {
        const raw = global.localStorage?.getItem(this.generatedKey(seriesKey));
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (_error) { return []; }
    }

    saveGenerated(seriesKey, chapters) {
      try { global.localStorage?.setItem(this.generatedKey(seriesKey), JSON.stringify(chapters)); } catch (_error) {}
    }

    async rememberHandle(handle) {
      if (!global.indexedDB || !handle) return;
      await new Promise((resolve, reject) => {
        let request;
        try { request = indexedDB.open(HANDLE_DB, 1); } catch (_error) { resolve(); return; }
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(HANDLE_STORE)) db.createObjectStore(HANDLE_STORE);
        };
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction(HANDLE_STORE, 'readwrite');
          tx.objectStore(HANDLE_STORE).put(handle, HANDLE_KEY);
          tx.oncomplete = () => { db.close(); resolve(); };
          tx.onerror = () => { db.close(); reject(tx.error); };
        };
      }).catch(() => {});
    }

    async restoreHandle() {
      if (this.handleRestoreAttempted) return this.projectRoot;
      this.handleRestoreAttempted = true;
      if (!global.indexedDB) return null;
      const handle = await new Promise(resolve => {
        let request;
        try { request = indexedDB.open(HANDLE_DB, 1); } catch (_error) { resolve(null); return; }
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(HANDLE_STORE)) db.createObjectStore(HANDLE_STORE);
        };
        request.onerror = () => resolve(null);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction(HANDLE_STORE, 'readonly');
          const get = tx.objectStore(HANDLE_STORE).get(HANDLE_KEY);
          get.onsuccess = () => { const value = get.result || null; db.close(); resolve(value); };
          get.onerror = () => { db.close(); resolve(null); };
        };
      });
      if (!handle) return null;
      try {
        const permission = await handle.queryPermission?.({ mode: 'readwrite' });
        if (permission === 'granted') this.projectRoot = handle;
      } catch (_error) {}
      return this.projectRoot;
    }

    async connectProjectRoot() {
      if (!global.showDirectoryPicker) throw new Error('This browser does not support direct project-folder writing.');
      const handle = await global.showDirectoryPicker({ mode: 'readwrite', id: 'jasper-fanfic-project' });
      const permission = await handle.requestPermission?.({ mode: 'readwrite' });
      if (permission && permission !== 'granted') throw new Error('Write permission was not granted.');
      this.projectRoot = handle;
      await this.rememberHandle(handle);
      return handle;
    }

    async ensureDir(parent, name) {
      return parent.getDirectoryHandle(safeFolder(name), { create: true });
    }

    async writeTextFile(dir, name, text) {
      const handle = await dir.getFileHandle(name, { create: true });
      const writable = await handle.createWritable();
      await writable.write(text);
      await writable.close();
      return handle;
    }

    async writeChapterToProject(series, chapter) {
      if (!this.projectRoot) await this.restoreHandle();
      if (!this.projectRoot) return { written: false, reason: 'no-project-folder' };
      try {
        const jsonDir = await this.ensureDir(this.projectRoot, 'json');
        const fandomDir = await this.ensureDir(jsonDir, series.fandom_folder || series.folder || series.fandom || series.key);
        const storyDir = await this.ensureDir(fandomDir, series.series_folder || dashedFolder(series.title || series.key));
        const filename = `${padChapter(chapter.chapter_number)}.json`;
        await this.writeTextFile(storyDir, filename, JSON.stringify({
          ...chapter,
          fandom_folder: series.fandom_folder,
          series_folder: series.series_folder,
          series_path: series.series_path
        }, null, 2));
        await this.updateSeriesManifest(storyDir, series);
        await this.updateCatalog(jsonDir, series);
        return { written: true, filename: `json/${series.series_path}/${filename}` };
      } catch (error) {
        return { written: false, reason: error?.message || 'write-failed', error };
      }
    }

    async updateSeriesManifest(storyDir, series) {
      let existing = {};
      try {
        const handle = await storyDir.getFileHandle('series.json');
        const file = await handle.getFile();
        existing = JSON.parse(await file.text());
      } catch (_error) {}
      const chapterFiles = series.chapters
        .slice()
        .sort((a, b) => a.chapter_number - b.chapter_number)
        .map(chapter => `${padChapter(chapter.chapter_number)}.json`);
      const manifest = {
        ...existing,
        schema_version: '5.0',
        key: series.key,
        folder: series.fandom_folder,
        fandom_folder: series.fandom_folder,
        series_folder: series.series_folder,
        story_folder: series.series_folder,
        series_path: series.series_path,
        fandom: series.fandom,
        title: series.title,
        series_title: series.title,
        series_slug: series.key,
        story_type: series.story_type,
        pairing: series.pairing,
        description: series.description,
        premise: series.premise,
        reader_mode: series.reader_mode,
        canon_window: series.canon_window || '',
        genre: series.genre || '',
        tone: series.tone || '',
        style_mode: series.style_mode || 'story_adaptive',
        content_mode: series.content_mode || 'romance',
        content_tags: normalizeTags(series.content_tags),
        target_words: series.target_words || 1600,
        adult_characters_confirmed: Boolean(series.adult_characters_confirmed),
        consenting_adults_confirmed: Boolean(series.adult_characters_confirmed),
        story_bible: series.story_bible || '',
        character_bible: clone(series.character_bible || []),
        unresolved_threads: clone(series.unresolved_threads || []),
        must_include: clone(series.must_include || []),
        avoid: clone(series.avoid || []),
        chapter_count: series.chapters.length,
        generated_chapter_count: series.chapters.filter(chapter => chapter.generated).length,
        chapters: series.chapters.slice().sort((a, b) => a.chapter_number - b.chapter_number).map(chapter => ({ number: chapter.chapter_number, id: chapter.id, file: `${padChapter(chapter.chapter_number)}.json`, title: chapter.title, word_count: wordCount(chapter.content), choice_count: arr(chapter.choices).length })),
        chapter_files: chapterFiles,
        updated_at: nowIso()
      };
      await this.writeTextFile(storyDir, 'series.json', JSON.stringify(manifest, null, 2));
    }

    async updateCatalog(jsonDir, series) {
      let existing = {};
      try {
        const handle = await jsonDir.getFileHandle('fandoms.json');
        const file = await handle.getFile();
        existing = JSON.parse(await file.text());
      } catch (_error) {}
      const current = Array.isArray(existing) ? existing : arr(existing.series || existing.fandoms || existing.routes);
      const descriptor = {
        key: series.key,
        series_slug: series.key,
        folder: series.fandom_folder,
        fandom_folder: series.fandom_folder,
        series_folder: series.series_folder,
        story_folder: series.series_folder,
        series_path: series.series_path,
        fandom: series.fandom,
        title: series.title,
        series_title: series.title,
        pairing: series.pairing,
        description: series.description,
        story_type: series.story_type,
        series_manifest: `${series.series_path}/series.json`
      };
      const byKey = new Map(current.filter(Boolean).map(item => [item.key || item.series_slug || slug(item.title || item.fandom || item.folder), item]));
      byKey.set(series.key, { ...(byKey.get(series.key) || {}), ...descriptor });
      const catalog = Array.isArray(existing)
        ? [...byKey.values()]
        : { ...existing, schema_version: '5.0', work_type: 'fanfiction_library_catalog', series: [...byKey.values()], updated_at: nowIso() };
      await this.writeTextFile(jsonDir, 'fandoms.json', JSON.stringify(catalog, null, 2));
    }

    async writeChapterToOPFS(series, chapter) {
      if (!global.navigator?.storage?.getDirectory) return { written: false, reason: 'opfs-unavailable' };
      try {
        const root = await global.navigator.storage.getDirectory();
        const generated = await this.ensureDir(root, 'generated-json');
        const fandom = await this.ensureDir(generated, series.fandom_folder || series.folder || series.fandom || series.key);
        const story = await this.ensureDir(fandom, series.series_folder || dashedFolder(series.title || series.key));
        const filename = `${padChapter(chapter.chapter_number)}.json`;
        await this.writeTextFile(story, filename, JSON.stringify({ ...chapter, fandom_folder: series.fandom_folder, series_folder: series.series_folder, series_path: series.series_path }, null, 2));
        return { written: true, filename: `generated-json/${series.series_path}/${filename}` };
      } catch (error) {
        return { written: false, reason: error?.message || 'opfs-write-failed' };
      }
    }

    downloadJson(data, filename) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(href), 1500);
    }
  }

  function extractLastSentences(text, count = 3) {
    const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
    if (!cleaned) return [];
    const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
    return sentences.slice(-count).map(s => s.trim());
  }

  function deriveFocus(series) {
    const pairing = String(series.pairing || '').split('/').map(part => part.trim()).filter(Boolean);
    const primary = pairing[0] || 'the person beside me';
    return { primary, reader: pairing[1] || 'me', fandom: series.fandom || 'the world around us' };
  }

  function seededPick(seed, items, offset = 0) {
    if (!items.length) return '';
    const h = parseInt(hashText(`${seed}:${offset}`), 36) || 0;
    return items[h % items.length];
  }

  function extractKeywords(text, limit = 8) {
    const stop = new Set('about after again against because before being between could every first from have into itself just more most much must only other over same should some such than that their them then there these they this those through under very were what when where which while with would your story chapter premise choice branch reader character characters'.split(' '));
    const counts = new Map();
    const matches = String(text || '').toLowerCase().match(/\b[a-z][a-z'-]{3,}\b/g) || [];
    for (const word of matches) {
      if (stop.has(word)) continue;
      counts.set(word, (counts.get(word) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([word]) => word);
  }

  function chapterContinuityView(chapter) {
    if (!chapter) return null;
    const content = String(chapter.content || '');
    return {
      id: chapter.id,
      chapter_number: chapter.chapter_number,
      title: chapter.title,
      word_count: wordCount(content),
      opening_excerpt: trimText(content.slice(0, 1800), 1800),
      closing_excerpt: trimText(content.slice(-3200), 3200),
      choices: arr(chapter.choices).map(choice => ({
        id: choice.id,
        label: choice.label,
        description: choice.description,
        path_key: choice.path_key,
        effect: clone(choice.effect || {}),
        target: choice.target
      })),
      path_variants: clone(chapter.path_variants || {}),
      research_alignment: arr(chapter.research_alignment)
    };
  }

  class LocalStoryComposer {
    constructor() {
      this.openers = [
        'The room had changed while I was deciding, though nothing in it had actually moved. The light still fell across the same surfaces, the air still carried the same small sounds, but my body knew something was different before my thoughts managed to catch up.',
        'I noticed the quiet first. It was not empty silence; it was the kind that collected after someone said something important and neither of us wanted to cheapen it by rushing to fill the space.',
        'The next few seconds felt strangely ordinary. Somewhere nearby, something clicked or shifted, and the world kept going as if I had not just made a decision that sat heavy and warm behind my ribs.',
        'For a moment, I concentrated on details I could trust: the angle of the light, the temperature against my skin, the sound of breathing close enough to notice without trying.'
      ];
      this.pivots = [
        'But certainty did not arrive with the decision. What came instead was a clearer kind of nervousness, one I could actually do something with.',
        'Yet the feeling was not simple. Relief and fear had tangled together so tightly that separating them would have meant pretending one of them was not real.',
        'I wanted the moment to become easier once I understood what I wanted; instead, understanding only made the stakes harder to ignore.',
        'The practical part of my mind tried to inventory consequences while the rest of me stayed fixed on the person in front of me.'
      ];
      this.sensory = [
        'I grounded myself in the physical world. Fabric dragged softly beneath my fingertips. The air smelled faintly of whatever had been here before us, layered beneath the cleaner scent of the present moment. A distant sound repeated itself until it became almost comforting.',
        'The smallest details sharpened as my attention narrowed. I could feel the weight of my own hands, the pull of clothing when I shifted, the dry catch in my throat before I swallowed and tried again.',
        'Light caught on edges and turned them briefly brighter than everything around them. I watched that instead of looking away completely; it gave my nerves somewhere harmless to go.'
      ];
      this.motion = [
        'Eventually, standing still became its own decision, and I was not sure I wanted to keep making it. I shifted closer to the next practical thing that needed doing and let movement carry some of the pressure for me.',
        'We had to move sooner or later. The world outside the feeling had errands, doors, weather, obligations, and unfinished problems, and I was grateful for every ordinary thing that gave my hands something useful to do.',
        'A change of place helped. Emotion followed us instead of disappearing, but it stopped taking up the entire room once there were other details competing for my attention.'
      ];
      this.closers = [
        'By then I understood that the next decision was not about choosing the perfect answer. It was about deciding which truth I was willing to act on first.',
        'The moment narrowed until there were several honest ways forward and no version of me that could take all of them at once.',
        'Nothing had become simple, but the possibilities had become specific. That was enough to make the next choice feel real.'
      ];
    }

    compose({ series, parent, choice, memory, privateSeed, premise, opening }) {
      const requestedMode = resolveContentMode(extra.contentModeOverride || series.content_mode);
      if ((requestedMode.id === 'explicit' || requestedMode.id === 'explicit_detailed') && series.adult_characters_confirmed) {
        const error = new Error('Explicit fanfiction generation requires a configured story-generation provider; the local fallback only composes non-explicit prose.');
        error.code = 'EXPLICIT_PROVIDER_REQUIRED';
        throw error;
      }
      const focus = deriveFocus(series);
      const seed = `${series.key}:${parent?.id || 'opening'}:${choice?.id || 'continue'}:${memory?.turn || 0}`;
      const mode = resolveContentMode(series.content_mode);
      const mature = mode.id === 'mature_on_page' && series.adult_characters_confirmed;
      const bridge = parent?.path_variants?.[choice?.path_key] || memory?.currentBridge || '';
      const source = String(privateSeed || premise || series.premise || series.description || '').trim();
      const tail = extractLastSentences(parent?.content || source, 3);
      const hint = String(choice?.generation_hint || choice?.description || choice?.label || '').trim();
      const keywords = extractKeywords(`${source} ${parent?.content || ''}`, 6);
      const keywordLine = keywords.length ? `The details I kept circling back to were ${keywords.slice(0, 3).join(', ')}; they had stopped feeling like background and started feeling connected.` : '';
      const canon = String(series.canon_window || parent?.canon_window || '').trim();
      const paras = [];

      paras.push(seededPick(seed, this.openers, 1));
      if (opening && source) {
        const openingFacts = splitSentences(source).slice(0, 3).join(' ');
        paras.push(`${openingFacts} I had known the facts before I stepped into the moment, but facts were different from living inside them. Once they had weight, sound, and another person breathing in the same space, they stopped being hypothetical.`);
      } else if (tail.length) {
        paras.push(`${tail.join(' ')} The words stayed with me after the sound of them was gone. I could feel the consequence in the way I held myself, as if my body had understood the scene before I had decided what to call it.`);
      }
      if (bridge) paras.push(String(bridge));
      if (hint) paras.push(`I had chosen my direction for a reason. ${sentenceCase(hint.replace(/[.!?]+$/, ''))}. Saying it in simpler words did not make the consequences smaller, but it did make them mine.`);
      paras.push(seededPick(seed, this.pivots, 2));

      paras.push(`${focus.primary} watched me without turning the silence into a demand. That mattered. I had spent enough of my life learning how quickly attention could become pressure, but this felt different; there was room inside it for me to change my mind, ask a question, or admit that I did not have the right words yet.`);
      paras.push(seededPick(seed, this.sensory, 3));
      if (canon) paras.push(`${canon} None of that vanished just because the moment between us had become personal. History, routines, danger, and other people's expectations still pressed against the edges of what we were doing, giving every private decision a public shape whether we wanted one or not.`);
      if (keywordLine) paras.push(keywordLine);

      paras.push(`“Tell me if I am reading this wrong,” I said. My voice came out steadier than I expected. I did not want a perfect answer; I wanted something specific enough to trust. ${focus.primary} took a second before replying, and that pause felt more honest than an immediate reassurance would have.`);
      paras.push(`The answer gave me something solid to work with. Not certainty, exactly, but a boundary I could see and a need I could respond to. I asked another question. Then one more. Each answer changed the shape of the next one until the conversation stopped feeling like a confession and started feeling like two people building the same understanding from opposite sides.`);
      paras.push(`I remembered enough of what had brought us here to know that one good conversation could not erase it. There had been habits, assumptions, and moments neither of us had handled perfectly. But memory did not have to function only as evidence against the present. It could also show me what had changed, and what I was finally willing to do differently.`);
      paras.push(`Something ordinary interrupted us before the moment could become too polished. I welcomed it. We dealt with the small problem together, and the interruption revealed more than another speech would have; the way ${focus.primary} moved around me, the way I made room without thinking, the fact that neither of us treated care as a performance.`);
      paras.push(`That ease did not last untouched. A wrong word landed between us, not cruel enough to become a fight and not harmless enough to ignore. I felt myself tense before I understood why. This time I did not bury the reaction and wait for resentment to explain it later. I named the part I could name, even though my voice caught halfway through.`);
      paras.push(`${focus.primary} did not answer defensively. That did not make the conversation painless, but it kept it useful. We untangled intention from impact one piece at a time. I could feel my pulse slowing as the misunderstanding became specific enough to solve, and the relief that followed was almost physical; not because we were perfect, but because repair had happened while the hurt was still small.`);

      if (mature) {
        paras.push(`Closeness changed the air between us. I did not want the moment hidden behind a convenient cut in the scene, but I did want it to stay ours. We checked in with each other in small, ordinary ways; a question, a pause, a hand that waited instead of assuming. Desire was there, unmistakable, but so was the choice to keep listening.`);
        paras.push(`I let myself stay present for the tenderness of it: the warmth of skin beneath careful touch, the awkward little adjustments that made us both laugh, the way breathing changed when nerves finally loosened. Nothing needed to become graphic to feel intimate. What mattered was that neither of us disappeared inside the moment; we were still talking, still noticing, still able to stop or continue without turning consent into a single line spoken once.`);
      } else {
        paras.push(`Affection surfaced in smaller ways: a touch that lasted a little longer than necessary, a smile I caught before it was hidden, the easy warmth of being close without needing to make the closeness prove anything. I let myself enjoy it instead of immediately asking what it meant for the rest of my life.`);
      }

      paras.push(seededPick(seed, this.motion, 4));
      paras.push(`The next task was simple enough to name but complicated enough to expose what had changed. I took one part of it. ${focus.primary} took another. Cooperation made the relationship visible in a different way; not through declarations, but through who anticipated what, who asked before stepping in, and who noticed when the other person needed space.`);
      paras.push(`That was when the first real complication arrived. It was not dramatic enough to announce itself as danger, which made it easier to underestimate. A detail I had noticed earlier returned with a different meaning, attaching itself to the problem in front of us until I could no longer pretend the two things were separate.`);
      paras.push(`My first instinct was to solve everything at once. I knew that instinct well enough to distrust it. I forced myself to choose one fact, then another, and separate what I knew from what I was afraid might happen. The distinction did not erase the fear; it kept the fear from making every decision for me.`);
      paras.push(`${focus.primary} noticed the change in me. “What is it?” The question was quiet, but it landed directly on the thing I had been trying not to name. I could tell the truth immediately. I could soften it with humor. I could ask for more information before I decided whether the problem was real. I could also admit I needed a minute before doing any of those things.`);
      paras.push(`Each option carried a different kind of trust. Directness meant believing the relationship could survive pressure. Humor meant believing warmth could make room for something difficult without erasing it. Curiosity meant accepting that I might learn an answer I did not like. Slowing down meant treating my own limits as part of the situation instead of an inconvenience.`);
      paras.push(seededPick(seed, this.closers, 5));

      return paras.filter(Boolean).join('\n\n');
    }
  }

  class StoryGenerator {
    constructor(options = {}) {
      this.options = options;
      this.local = new LocalStoryComposer();
    }

    buildContext(series, parent, choice, memory, extra = {}) {
      const chapters = series.chapters.slice().sort((a, b) => a.chapter_number - b.chapter_number);
      const eligible = chapters.filter(ch => !parent || ch.chapter_number <= parent.chapter_number);
      const recentChapters = eligible.slice(-6);
      const requestedMode = resolveContentMode(extra.contentModeOverride || series.content_mode);
      if (requestedMode.adult_required && !(series.adult_characters_confirmed && series.consenting_adults_confirmed)) {
        throw new Error('Adult-only content modes require confirmation that every sexual participant is a consenting adult (18+).');
      }
      const effectiveMode = requestedMode;
      const style = buildStyleProfile(series, recentChapters);
      const targetWords = clamp(num(series.target_words, series.story_type === 'short_story' ? 2500 : 1600), 600, 10000);
      const context = {
        schema: 'jasper.fanfiction-generation-context.v5',
        engine_version: VERSION,
        series: {
          key: series.key,
          folder: series.fandom_folder,
          fandom_folder: series.fandom_folder,
          series_folder: series.series_folder,
          series_path: series.series_path,
          story_type: series.story_type,
          fandom: series.fandom,
          title: series.title,
          pairing: series.pairing,
          description: series.description,
          premise: series.premise,
          reader_mode: series.reader_mode,
          canon_window: series.canon_window || parent?.canon_window || null,
          genre: series.genre || '',
          tone: series.tone || '',
          story_bible: trimText(series.story_bible, 7000),
          character_bible: clone(series.character_bible || []),
          unresolved_threads: clone(series.unresolved_threads || []),
          must_include: clone(series.must_include || []),
          avoid: clone(series.avoid || [])
        },
        style: {
          mode: series.style_mode || 'story_adaptive',
          profile: style,
          instruction: 'Use the profile as a statistical and qualitative target. Preserve the current story voice where it is more specific. Do not copy distinctive source wording.'
        },
        content: {
          requested_mode: requestedMode.id,
          effective_mode: effectiveMode.id,
          instruction: effectiveMode.instruction,
          adult_characters_confirmed: Boolean(series.adult_characters_confirmed),
          tags: normalizeTags(series.content_tags),
          taxonomy_source: STORY_TAG_TAXONOMY.source,
          taxonomy_categories: STORY_TAG_TAXONOMY.categories,
          note: requestedMode.adult_required ? 'Adult-only mode validated for consenting adults (18+).' : ''
        },
        continuity: {
          memory: clone(memory || {}),
          recent_chapters: recentChapters.map(chapterContinuityView),
          arc_index: eligible.slice(-80).map(chapter => ({
            id: chapter.id,
            chapter_number: chapter.chapter_number,
            title: chapter.title,
            ending: trimText(extractLastSentences(chapter.content, 2).join(' '), 360),
            generated: Boolean(chapter.generated)
          })),
          current_bridge: memory?.currentBridge || '',
          recent_branch_journal: arr(memory?.journal).slice(-16),
          qualities: clone(memory?.values || {}),
          flags: clone(memory?.flags || {})
        },
        parent: chapterContinuityView(parent),
        selected_choice: choice ? clone(choice) : null,
        private_seed: extra.privateSeed ? trimText(extra.privateSeed, 7000) : '',
        premise_override: extra.premise ? trimText(extra.premise, 5000) : '',
        requested: {
          mode: extra.opening ? 'new_story_opening' : 'continue_story',
          direction: extra.direction || choice?.path_key || 'continue',
          point_of_view: series.reader_mode || 'First-person reader insert',
          preserve_continuity: true,
          story_type: series.story_type,
          create_distinct_choices: series.story_type !== 'short_story',
          output_json: true,
          minimum_choice_count: series.story_type === 'short_story' ? 0 : 3,
          maximum_choice_count: series.story_type === 'short_story' ? 0 : 5,
          target_words: targetWords,
          minimum_acceptable_words: Math.max(500, Math.round(targetWords * 0.62))
        }
      };
      return this.fitContextBudget(context);
    }

    fitContextBudget(context, maxChars = this.options.maxContextChars || 46000) {
      const copy = clone(context);
      const size = value => JSON.stringify(value).length;
      if (size(copy) <= maxChars) return copy;

      copy.series.story_bible = trimText(copy.series.story_bible, 3500);
      copy.private_seed = trimText(copy.private_seed, 3500);
      copy.premise_override = trimText(copy.premise_override, 2500);
      copy.continuity.recent_chapters = arr(copy.continuity.recent_chapters).map(chapter => ({
        ...chapter,
        opening_excerpt: trimText(chapter.opening_excerpt, 900),
        closing_excerpt: trimText(chapter.closing_excerpt, 1800)
      }));
      copy.continuity.arc_index = arr(copy.continuity.arc_index).map(item => ({
        ...item,
        ending: trimText(item.ending, 220)
      }));
      if (size(copy) <= maxChars) return copy;

      copy.continuity.recent_branch_journal = arr(copy.continuity.recent_branch_journal).slice(-10);
      copy.continuity.arc_index = arr(copy.continuity.arc_index).slice(-50);
      copy.series.character_bible = arr(copy.series.character_bible).slice(0, 24);
      copy.series.unresolved_threads = arr(copy.series.unresolved_threads).slice(-24);
      copy.series.must_include = arr(copy.series.must_include).slice(-20);
      copy.series.avoid = arr(copy.series.avoid).slice(-20);
      if (size(copy) <= maxChars) return copy;

      copy.continuity.recent_chapters = arr(copy.continuity.recent_chapters).slice(-4).map(chapter => ({
        ...chapter,
        opening_excerpt: trimText(chapter.opening_excerpt, 600),
        closing_excerpt: trimText(chapter.closing_excerpt, 1200)
      }));
      copy.continuity.arc_index = arr(copy.continuity.arc_index).slice(-35);
      return copy;
    }

    promptFromContext(context) {
      const target = context.requested?.target_words || 1600;
      return [
        context.requested?.story_type === 'short_story'
          ? 'Write a complete standalone fanfiction short story from the supplied premise and character personalities. Resolve its central scene or emotional arc within this one JSON story file.'
          : (context.requested?.mode === 'new_story_opening'
            ? 'Write the opening chapter of the interactive longform fanfiction described below.'
            : 'Continue the interactive longform fanfiction directly from the supplied continuity.'),
        `Write approximately ${target} words of finished prose. Do not return an outline, synopsis, notes, or a scene sketch.`,
        'Treat continuity as binding: preserve established canon, characterization, relationship state, unresolved threads, injuries, possessions, promises, prior choices, and the physical location unless the scene itself changes them.',
        'The selected choice must materially change what happens next. Do not merely mention the choice and then write the same chapter another branch would receive.',
        'Use the supplied style profile as cadence/voice guidance. Match the existing story when its diction or rhythm is more specific. Never quote or remix distinctive source sentences just to imitate style.',
        'Keep prose concrete and immersive. Never mention prompts, JSON, generation, branches, readers making choices, chapter mechanics, or the fact that this is fanfiction inside the narrative itself.',
        `Content mode: ${context.content?.instruction || CONTENT_MODES.romance.instruction}`,
        context.content?.effective_mode === 'explicit' || context.content?.effective_mode === 'explicit_detailed'
          ? 'Do not fade to black, cut away, skip from desire to aftermath, or summarize the sexual scene as off-page. Keep the consensual adult scene on-page and continuous with the selected branch.'
          : 'Do not use fade-to-black as a substitute for a choice. If sex is not selected, keep the scene nonsexual rather than implying skipped off-page sex.',
        'Romantic or sexual material is permitted only between adult characters. If adult status is not confirmed, keep the scene nonsexual.',
        context.requested?.create_distinct_choices
          ? (context.content?.adult_characters_confirmed
            ? 'End after a meaningful consequence or revelation at a genuine decision point. Include 3-5 materially different choices. At least one optional intimacy choice should target "@generate-explicit"; other choices should target "@generate" unless deliberately linking to an existing chapter id. Every choice needs label, description, path_key, effect, and generation_hint.'
            : 'End after a meaningful consequence or revelation at a genuine decision point. Include 3-5 materially different nonsexual choices; each needs label, description, path_key, effect, generation_hint, and target "@generate" unless deliberately linking to an existing chapter id.')
          : 'This is a standalone short story. Do not append CYOA choices; end with a satisfying final beat appropriate to the requested tone.',
        'Return ONE strict JSON object only. Required keys: title, subtitle, content, path_variants, research_alignment, choices, continuity_updates, unresolved_threads.',
        context.requested?.create_distinct_choices
          ? 'path_variants must map each path_key to a short continuity bridge describing what the next chapter must remember if that choice is selected.'
          : 'For a short story, return choices as [] and path_variants as {}.',
        'research_alignment should contain only concise canon/characterization facts actually used; do not fabricate citations or claim web research was performed by the generator.',
        JSON.stringify(context)
      ].join('\n\n');
    }

    providers() {
      const candidates = [
        global.JASPER_FANFIC_BACKEND_PROVIDER,
        global.JASPER_FANFIC_STORY_PROVIDER,
        global.JASPER_FANFIC_PROVIDER,
        global.CYOA_STORY_PROVIDER,
        global.StoryGenerationProvider?.generate,
        global.AIBrain?.story?.generate,
        global.AIBrain?.generateStoryContinuation,
        global.StoryAI?.generate
      ].filter(fn => typeof fn === 'function');
      return [...new Set(candidates)];
    }

    parseProviderResult(result) {
      if (!result) return null;
      if (typeof result === 'object') return clone(result.chapter || result);
      const text = String(result).trim();
      if (!text) return null;
      try { return JSON.parse(text); } catch (_error) {}
      const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (fenced) {
        try { return JSON.parse(fenced[1]); } catch (_error) {}
      }
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace >= 0 && lastBrace > firstBrace) {
        try { return JSON.parse(text.slice(firstBrace, lastBrace + 1)); } catch (_error) {}
      }
      return { content: text };
    }

    validateProviderChapter(chapter, context) {
      const problems = [];
      if (!chapter || typeof chapter !== 'object') return ['No chapter object was returned.'];
      const content = String(chapter.content || chapter.text || chapter.body || '').trim();
      const wc = wordCount(content);
      if (!content) problems.push('content is missing');
      if (wc < Math.max(350, num(context.requested?.minimum_acceptable_words, 500) * 0.55)) problems.push(`content is too short (${wc} words)`);
      const choices = arr(chapter.choices || chapter.options);
      if (context.requested?.create_distinct_choices) {
        if (choices.length < 3) problems.push('fewer than 3 choices');
        if (choices.length > 5) problems.push('more than 5 choices');
        if (choices.some(choice => !choice?.label || !(choice?.path_key || choice?.pathKey || choice?.key))) problems.push('one or more choices lack label/path_key');
      }
      if (/\b(as an ai|language model|the prompt|this chapter should|json object)\b/i.test(content)) problems.push('meta-generation language leaked into prose');
      return problems;
    }

    repairPrompt(context, problems, badResult) {
      return [
        'Repair the previous story-generation result. Return a complete replacement JSON object, not commentary.',
        `Problems: ${problems.join('; ')}.`,
        'Keep all continuity/style/content requirements from the original context. Expand or rewrite the prose as needed rather than padding with repetition.',
        'Previous result (may be incomplete):',
        trimText(typeof badResult === 'string' ? badResult : JSON.stringify(badResult), 9000),
        'Original context:',
        JSON.stringify(context)
      ].join('\n\n');
    }

    async callExternal(context) {
      const basePrompt = this.promptFromContext(context);
      const providers = this.providers();
      if (!providers.length) {
        const error = new Error('Jasper fanfiction generation backend is not connected.');
        error.code = 'JASPER_BACKEND_PROVIDER_REQUIRED';
        throw error;
      }
      let lastError = null;
      for (const provider of providers) {
        try {
          const raw = await provider({ prompt: basePrompt, context, mode: context.requested?.mode, schema: context.schema });
          const parsed = this.parseProviderResult(raw);
          const problems = this.validateProviderChapter(parsed, context);
          if (!problems.length) return parsed;
          try {
            const repairedRaw = await provider({
              prompt: this.repairPrompt(context, problems, raw),
              context,
              mode: 'repair_story_chapter',
              schema: context.schema,
              problems
            });
            const repaired = this.parseProviderResult(repairedRaw);
            if (!this.validateProviderChapter(repaired, context).length) return repaired;
          } catch (repairError) {
            lastError = repairError;
            console.warn('CYOA story backend repair attempt failed.', repairError);
          }
          if (parsed?.content) return parsed;
          lastError = new Error(`Jasper fanfiction backend returned an invalid chapter: ${problems.join('; ')}`);
        } catch (error) {
          lastError = error;
          console.warn('Jasper fanfiction backend generation failed.', error);
        }
      }
      throw lastError || new Error('Jasper fanfiction backend did not return a chapter.');
    }

    defaultChoices(series, chapterNumber, seed) {
      const templates = [
        { path_key: 'direct', label: 'Say what I actually mean', description: 'Choose honesty and deal with the consequences.', effect: { trust: 1, honesty: 1 } },
        { path_key: 'playful', label: 'Meet it with humor', description: 'Choose warmth without erasing what matters.', effect: { warmth: 1, playfulness: 1 } },
        { path_key: 'curious', label: 'Ask the question underneath it', description: 'Follow the unresolved thread.', effect: { curiosity: 1, insight: 1 } },
        { path_key: 'careful', label: 'Slow down', description: 'Protect space for reflection and boundaries.', effect: { patience: 1, boundaries: 1 } }
      ];
      const count = 2 + (parseInt(hashText(seed), 36) % 3);
      const choices = templates.slice(0, count).map((item, index) => ({
        ...item,
        id: stableChoiceId(series.key, chapterNumber, item.path_key, index),
        target: '@generate',
        generation_hint: item.description
      }));
      if (series.adult_characters_confirmed) {
        const item = {
          path_key: 'intimate',
          label: 'Take the intimate route',
          description: 'Continue on-page into a consensual adult explicit scene that follows this branch and stays in character.',
          effect: { intimacy: 1, trust: 1 }
        };
        choices.push({
          ...item,
          id: stableChoiceId(series.key, chapterNumber, item.path_key, choices.length),
          target: '@generate-explicit',
          generation_hint: 'Move naturally from the current emotional and physical context into an on-page consensual adult explicit scene. Do not fade out, cut away, or jump directly to aftermath.'
        });
      }
      return choices.slice(0, 5);
    }

    async generate(series, parent, choice, memory, extra = {}) {
      const context = this.buildContext(series, parent, choice, memory, extra);
      const provider = await this.callExternal(context);
      const nextNumber = extra.chapterNumber || (Math.max(0, ...series.chapters.map(ch => num(ch.chapter_number))) + 1);
      const seed = `${series.key}:${parent?.id || 'opening'}:${choice?.id || extra.direction || 'continue'}:${nextNumber}`;
      const requestedGenerationMode = resolveContentMode(context.content?.effective_mode || series.content_mode);
      if (!provider) {
        const error = new Error('Jasper fanfiction generation must come from the configured Apps Script backend; local safe fallback is disabled.');
        error.code = 'JASPER_BACKEND_PROVIDER_REQUIRED';
        throw error;
      }
      const localContent = '';
      const titleSeeds = extra.opening
        ? ['The First Door', 'Where It Begins', 'Before the World Changes', 'The First Step']
        : ['What the Choice Changed', 'After the Answer', 'The Next Honest Thing', 'Consequences in Motion', 'A Different Kind of Quiet', 'The Road Narrows'];
      const raw = provider || {};
      const content = String(raw.content || raw.text || raw.body || localContent).trim();
      const choicesRaw = arr(raw.choices || raw.options);
      let preparedChoices = series.story_type === 'short_story' ? [] : (choicesRaw.length ? choicesRaw.slice(0, 5) : this.defaultChoices(series, nextNumber, seed));
      if (series.story_type !== 'short_story' && series.adult_characters_confirmed && !preparedChoices.some(item => String(item?.target || '').startsWith('@generate-explicit'))) {
        const intimate = {
          id: stableChoiceId(series.key, nextNumber, 'intimate', preparedChoices.length),
          label: 'Take the intimate route',
          target: '@generate-explicit',
          path_key: 'intimate',
          effect: { intimacy: 1, trust: 1 },
          description: 'Continue on-page into a consensual adult explicit scene that follows this branch and stays in character.',
          generation_hint: 'Move naturally from the current emotional and physical context into an on-page consensual adult explicit scene. Do not fade out, cut away, summarize the sex off-page, or jump directly to aftermath.'
        };
        if (preparedChoices.length >= 5) preparedChoices = preparedChoices.slice(0, 4);
        preparedChoices.push(intimate);
      }
      const mode = resolveContentMode(context.content?.effective_mode || series.content_mode);
      const rating = mode.id === 'explicit_detailed' ? 'Explicit - adults only' : (mode.id === 'explicit' ? 'Explicit - adults only' : (mode.id === 'mature_on_page' ? 'Mature - adults only' : (mode.id === 'romance' ? 'Romance / non-explicit' : 'General')));
      const chapter = normalizeChapter({
        ...raw,
        schema_version: raw.schema_version || '4.0',
        work_type: raw.work_type || 'fanfic_chapter',
        format: raw.format || (series.story_type === 'short_story' ? 'generated_fanfiction_short_story' : 'generated_choice_enriched_first_person_reader_insert'),
        title: raw.title || seededPick(seed, titleSeeds, 7),
        subtitle: raw.subtitle || `${series.title} · Chapter ${nextNumber}`,
        author: raw.author || series.author || global.JASPER_FANFIC_DATA?.author || '',
        dedication: raw.dedication || global.JASPER_FANFIC_DATA?.dedication || '',
        date_written: raw.date_written || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        fandom: raw.fandom || series.fandom,
        pairing: raw.pairing || series.pairing,
        reader_character: raw.reader_character || 'Adult unnamed first-person reader-proxy written in I / me / my / myself; appearance and legal name intentionally undefined.',
        rating: raw.rating || rating,
        content_mode: mode.id,
        content_tags: normalizeTags(raw.content_tags || series.content_tags),
        style_profile_id: raw.style_profile_id || context.style?.profile?.id || 'story-inferred',
        content_notes: arr(raw.content_notes || parent?.content_notes),
        canon_window: raw.canon_window || series.canon_window || parent?.canon_window || '',
        series_slug: series.key,
        series_title: series.title,
        chapter_number: nextNumber,
        research_alignment: arr(raw.research_alignment || parent?.research_alignment),
        continuity_updates: clone(raw.continuity_updates || {}),
        unresolved_threads: arr(raw.unresolved_threads || series.unresolved_threads),
        path_variants: raw.path_variants || {},
        choices: preparedChoices,
        content,
        generated: true,
        generation: {
          engine: provider ? 'external-provider' : 'local-style-aware-composer',
          engine_version: VERSION,
          generated_at: nowIso(),
          parent_chapter_id: parent?.id || null,
          selected_choice_id: choice?.id || null,
          selected_path_key: choice?.path_key || extra.direction || null,
          context_hash: hashText(JSON.stringify(context)),
          private_seed_used: Boolean(extra.privateSeed),
          target_words: context.requested?.target_words || series.target_words,
          style_mode: series.style_mode,
          content_mode: mode.id
        }
      }, series, nextNumber);

      if (series.story_type !== 'short_story' && !Object.keys(chapter.path_variants || {}).length) {
        chapter.path_variants = Object.fromEntries(chapter.choices.map(c => [
          c.path_key,
          `Carry forward the concrete consequence of choosing “${c.label},” including its effect on trust, knowledge, boundaries, location, and the immediate unresolved problem.`
        ]));
      }
      chapter.word_count = wordCount(chapter.content);
      chapter.choice_count = chapter.choices.length;
      return chapter;
    }
  }

  class StoryEngine {
    constructor(bundle, options = {}) {
      this.options = options;
      this.store = options.store || new StoryJsonStore();
      this.generator = options.generator || new StoryGenerator(options.generatorOptions || {});
      this.series = new Map();
      this.memories = new Map();
      this.currentSeriesKey = null;
      this.bundleMeta = {};
      this.loadBundle(bundle || { series: [] });
    }

    async ready() {
      await this.store.restoreHandle();
      return this;
    }

    loadBundle(bundle) {
      this.bundleMeta = { ...clone(bundle || {}) };
      delete this.bundleMeta.series;
      arr(bundle?.series).forEach(series => this.registerSeries(series));
      return this;
    }

    registerSeries(raw) {
      const baseKey = raw?.key || raw?.series_slug || slug(raw?.title || raw?.fandom || 'story');
      const savedSettings = this.store.loadSeriesSettings(baseKey);
      const incoming = normalizeSeries({ ...clone(raw || {}), ...savedSettings, chapters: raw?.chapters || [] }, baseKey);
      const existing = this.series.get(incoming.key);
      let series = existing || { ...incoming, chapters: [] };
      series = { ...series, ...incoming, chapters: series.chapters || [] };
      const byId = new Map(series.chapters.map(ch => [ch.id, ch]));
      incoming.chapters.forEach(chapter => byId.set(chapter.id, mergeChapter(byId.get(chapter.id), chapter)));
      this.store.loadGenerated(incoming.key).forEach(rawChapter => {
        const chapter = normalizeChapter(rawChapter, series);
        byId.set(chapter.id, mergeChapter(byId.get(chapter.id), chapter));
      });
      series.chapters = [...byId.values()].sort((a, b) => a.chapter_number - b.chapter_number || String(a.id).localeCompare(String(b.id)));
      series.chapter_count = series.chapters.length;
      series.total_word_count = series.chapters.reduce((sum, ch) => sum + num(ch.word_count, wordCount(ch.content)), 0);
      this.series.set(series.key, series);
      if (!this.memories.has(series.key)) this.memories.set(series.key, new BranchMemory(series.key));
      return series;
    }

    listSeries() { return [...this.series.values()].map(series => this.refreshSeriesStats(series)); }

    refreshSeriesStats(series) {
      if (!series) return null;
      series.chapters.sort((a, b) => a.chapter_number - b.chapter_number || String(a.id).localeCompare(String(b.id)));
      series.chapter_count = series.chapters.length;
      series.total_word_count = series.chapters.reduce((sum, ch) => sum + wordCount(ch.content), 0);
      return series;
    }

    getSeries(key) { return this.refreshSeriesStats(this.series.get(key) || null); }
    memory(key = this.currentSeriesKey) { return key ? this.memories.get(key) : null; }

    chapterById(series, id) {
      if (!series || !id) return null;
      const exact = series.chapters.find(ch => ch.id === id);
      if (exact) return exact;
      const n = Number(String(id).match(/(\d+)(?!.*\d)/)?.[1]);
      if (Number.isFinite(n)) return series.chapters.find(ch => ch.chapter_number === n) || null;
      return null;
    }

    current(key = this.currentSeriesKey) {
      const series = this.getSeries(key);
      const memory = this.memory(key);
      if (!series || !memory) return null;
      return this.chapterById(series, memory.state.currentId) || series.chapters[0] || null;
    }

    start(key, options = {}) {
      const series = this.getSeries(key);
      if (!series) return null;
      this.currentSeriesKey = key;
      const memory = this.memory(key);
      if (options.restart) memory.reset({ keepGenerated: true });
      let chapter = this.current(key);
      if (!chapter) chapter = series.chapters[0] || null;
      if (chapter && !memory.state.currentId) memory.visit(chapter, { from: null });
      return chapter;
    }

    openChapter(key, chapterOrIndex, options = {}) {
      const series = this.getSeries(key);
      if (!series) return null;
      this.currentSeriesKey = key;
      let chapter = null;
      if (typeof chapterOrIndex === 'number') chapter = series.chapters[chapterOrIndex] || series.chapters.find(ch => ch.chapter_number === chapterOrIndex);
      else chapter = this.chapterById(series, chapterOrIndex);
      if (!chapter) return null;
      if (options.record !== false) this.memory(key).visit(chapter, { from: this.memory(key).state.currentId, bridge: options.bridge || '' });
      else this.memory(key).state.currentId = chapter.id;
      this.memory(key).save();
      return chapter;
    }

    availableChoices(chapter = this.current()) {
      const memory = this.memory();
      if (!chapter || !memory) return [];
      return arr(chapter.choices).filter(choice => memory.canChoose(choice));
    }

    resolveTarget(series, target) {
      if (!target) return null;
      if (target === 'ending' || target === '@ending') return { type: 'ending' };
      if (target === 'private' || target === '@private') return { type: 'generate', contentMode: 'explicit' };
      if (String(target).startsWith('@generate-explicit-detailed')) return { type: 'generate', contentMode: 'explicit_detailed' };
      if (String(target).startsWith('@generate-explicit')) return { type: 'generate', contentMode: 'explicit' };
      if (String(target).startsWith('@generate') || target === 'continue') return { type: 'generate' };
      const chapter = this.chapterById(series, target);
      return chapter ? { type: 'chapter', chapter } : { type: 'missing', target };
    }

    async choose(choiceId) {
      const series = this.getSeries(this.currentSeriesKey);
      const chapter = this.current();
      const memory = this.memory();
      if (!series || !chapter || !memory) throw new Error('No active story route.');
      const choice = arr(chapter.choices).find(item => item.id === choiceId);
      if (!choice || !memory.canChoose(choice)) throw new Error('That choice is not currently available.');
      const bridge = memory.choose(chapter, choice) || '';
      const resolved = this.resolveTarget(series, choice.target);
      if (resolved?.type === 'ending') return { type: 'ending', chapter, choice, bridge };
      if (resolved?.type === 'chapter') {
        memory.visit(resolved.chapter, { from: chapter.id, choiceId: choice.id, pathKey: choice.path_key, bridge });
        return { type: 'chapter', chapter: resolved.chapter, choice, bridge };
      }
      const generated = await this.generateContinuation({ parent: chapter, choice, bridge, contentModeOverride: resolved?.contentMode });
      return { type: 'chapter', chapter: generated, choice, bridge, generated: true };
    }

    async generateContinuation({ parent, choice, privateSeed, direction, opening, premise, contentModeOverride } = {}) {
      const series = this.getSeries(this.currentSeriesKey);
      const memory = this.memory();
      if (!series || !memory) throw new Error('No active story route.');
      parent = parent || this.current();
      if (!choice && parent) {
        const lastJournal = arr(memory.state.journal).slice().reverse().find(entry => entry.chapterId === parent.id);
        if (lastJournal?.choiceId) choice = arr(parent.choices).find(item => item.id === lastJournal.choiceId) || null;
      }
      const nextNumber = Math.max(0, ...series.chapters.map(ch => num(ch.chapter_number))) + 1;
      const chapter = await this.generator.generate(series, parent, choice || null, memory.snapshot(), {
        privateSeed: privateSeed || '', direction: direction || choice?.path_key || 'continue', opening: Boolean(opening), premise, chapterNumber: nextNumber, contentModeOverride
      });
      this.addGeneratedChapter(series, chapter);
      const bridge = parent?.path_variants?.[choice?.path_key] || memory.state.currentBridge || '';
      memory.markGenerated(chapter.id);
      memory.recordContinuity(chapter);
      memory.visit(chapter, { from: parent?.id || null, choiceId: choice?.id || null, pathKey: choice?.path_key || direction || null, bridge });
      const opfs = await this.store.writeChapterToOPFS(series, chapter);
      const project = await this.store.writeChapterToProject(series, chapter);
      this.dispatch('generated', { series: clone(series), chapter: clone(chapter), opfs, project });
      return chapter;
    }

    addGeneratedChapter(series, rawChapter) {
      const chapter = normalizeChapter({ ...rawChapter, generated: true }, series);
      const i = series.chapters.findIndex(ch => ch.id === chapter.id || ch.chapter_number === chapter.chapter_number);
      if (i >= 0) series.chapters[i] = mergeChapter(series.chapters[i], chapter);
      else series.chapters.push(chapter);
      this.refreshSeriesStats(series);
      const generated = series.chapters.filter(ch => ch.generated);
      this.store.saveGenerated(series.key, generated);
      return chapter;
    }

    async continueFromPrivate(text, returnTo) {
      const series = this.getSeries(this.currentSeriesKey);
      const parent = this.current();
      if (!series || !parent) throw new Error('No active chapter.');
      if (returnTo && returnTo !== 'ending' && !String(returnTo).startsWith('@generate')) {
        const target = this.chapterById(series, returnTo);
        if (target) {
          this.memory().visit(target, { from: parent.id, pathKey: 'private', bridge: parent.path_variants?.private || '' });
          return target;
        }
      }
      return this.generateContinuation({ parent, privateSeed: String(text || ''), direction: 'private' });
    }

    async continueStory(direction = 'continue') {
      return this.generateContinuation({ parent: this.current(), direction });
    }

    async createStory(spec = {}) {
      const title = String(spec.title || 'Untitled Story').trim() || 'Untitled Story';
      const key = spec.key || slug(spec.series_slug || title || spec.fandom || 'new-story');
      const existingFandom = this.listSeries().find(item => String(item.fandom || '').trim().toLowerCase() === String(spec.fandom || '').trim().toLowerCase());
      const fandomFolder = safeFolder(spec.fandom_folder || spec.folder || existingFandom?.fandom_folder || existingFandom?.folder || dashedFolder(spec.fandom || 'Original'));
      const storyFolder = dashedFolder(spec.series_folder || spec.story_folder || title, sentenceCase(key));
      const requestedMode = resolveContentMode(spec.content_mode || spec.rating_mode || 'romance');
      const adultConfirmed = Boolean(spec.adult_characters_confirmed && (spec.consenting_adults_confirmed ?? spec.adult_characters_confirmed));
      if (requestedMode.adult_required && !adultConfirmed) {
        throw new Error('Adult-only content modes require confirmation that every sexual participant is a consenting adult (18+).');
      }
      const contentMode = requestedMode.id;
      const storyType = String(spec.story_type || 'cyoa_fanfiction').toLowerCase() === 'short_story' ? 'short_story' : 'cyoa_fanfiction';
      const series = this.registerSeries({
        key,
        folder: fandomFolder,
        fandom_folder: fandomFolder,
        series_folder: storyFolder,
        story_folder: storyFolder,
        series_path: `${fandomFolder}/${storyFolder}`,
        fandom: spec.fandom || 'Original',
        title,
        series_title: title,
        pairing: spec.pairing || '',
        description: spec.description || spec.premise || '',
        premise: spec.premise || spec.description || '',
        reader_mode: spec.reader_mode || 'Adult unnamed first-person reader insert',
        canon_window: spec.canon_window || '',
        genre: spec.genre || '',
        tone: spec.tone || '',
        story_type: storyType,
        choice_count: storyType === 'short_story' ? 0 : clamp(num(spec.choice_count, 4), 3, 5),
        style_mode: spec.style_mode || 'story_adaptive',
        style_profile: spec.style_profile || {},
        content_mode: contentMode,
        content_tags: normalizeTags(spec.content_tags || spec.tags),
        target_words: clamp(num(spec.target_words || spec.chapter_target_words, storyType === 'short_story' ? 2500 : 1600), 600, 10000),
        adult_characters_confirmed: adultConfirmed,
        consenting_adults_confirmed: adultConfirmed,
        story_bible: spec.story_bible || spec.continuity_bible || '',
        character_bible: clone(spec.character_bible || spec.characters || []),
        unresolved_threads: clone(spec.unresolved_threads || []),
        must_include: clone(spec.must_include || []),
        avoid: clone(spec.avoid || []),
        rating: spec.rating || (contentMode.startsWith('explicit') ? 'Explicit - adults only' : (contentMode === 'mature_on_page' ? 'Mature - adults only' : 'Romance / non-explicit')),
        author: spec.author || this.bundleMeta.author || '',
        chapters: []
      });
      this.currentSeriesKey = key;
      this.memory(key).reset({ keepGenerated: false });
      const chapter = await this.generateContinuation({ parent: null, opening: true, premise: spec.premise || spec.description || '' });
      return { series: this.getSeries(key), chapter };
    }

    configureSeries(seriesKey = this.currentSeriesKey, patch = {}) {
      const series = this.getSeries(seriesKey);
      if (!series) throw new Error('Story route not found.');
      const requested = resolveContentMode(patch.content_mode ?? series.content_mode);
      const adultConfirmed = patch.adult_characters_confirmed == null
        ? Boolean(series.adult_characters_confirmed && series.consenting_adults_confirmed)
        : Boolean(patch.adult_characters_confirmed);
      if (requested.adult_required && !adultConfirmed) {
        throw new Error('Adult-only content modes require confirmation that every sexual participant is a consenting adult (18+).');
      }
      const contentMode = requested.id;
      const settings = {
        style_mode: patch.style_mode || series.style_mode || 'story_adaptive',
        style_profile: patch.style_profile && typeof patch.style_profile === 'object' ? clone(patch.style_profile) : clone(series.style_profile || {}),
        content_mode: contentMode,
        content_tags: normalizeTags(patch.content_tags ?? series.content_tags),
        target_words: clamp(num(patch.target_words ?? series.target_words, 1600), 600, 10000),
        adult_characters_confirmed: adultConfirmed,
        consenting_adults_confirmed: adultConfirmed,
        tone: patch.tone == null ? series.tone : String(patch.tone || ''),
        genre: patch.genre == null ? series.genre : String(patch.genre || ''),
        canon_window: patch.canon_window == null ? series.canon_window : String(patch.canon_window || ''),
        story_bible: patch.story_bible == null ? series.story_bible : String(patch.story_bible || ''),
        unresolved_threads: patch.unresolved_threads == null ? clone(series.unresolved_threads || []) : clone(patch.unresolved_threads),
        must_include: patch.must_include == null ? clone(series.must_include || []) : clone(patch.must_include),
        avoid: patch.avoid == null ? clone(series.avoid || []) : clone(patch.avoid)
      };
      Object.assign(series, settings);
      this.store.saveSeriesSettings(series.key, settings);
      this.dispatch('series-settings', { series: clone(series), settings: clone(settings) });
      return this.refreshSeriesStats(series);
    }

    importJSON(data, sourceName = '') {
      const imported = [];
      if (!data) return imported;
      if (Array.isArray(data)) {
        data.forEach(item => imported.push(...this.importJSON(item, sourceName)));
        return imported;
      }
      if (Array.isArray(data.series)) {
        data.series.forEach(series => imported.push(this.registerSeries(series)));
        return imported;
      }
      if (Array.isArray(data.chapters)) {
        imported.push(this.registerSeries(data));
        return imported;
      }
      const looksLikeChapter = data.chapter_number != null || data.work_type === 'fanfic_chapter' || data.content != null;
      if (looksLikeChapter) {
        const key = data.series_slug || data.series_key || slug(data.series_title || data.fandom || sourceName || 'imported-story');
        const sourceParts = String(sourceName || '').split(/[\/]/).filter(Boolean);
        const inferredStory = data.series_folder || data.story_folder || (sourceParts.length >= 2 ? sourceParts[sourceParts.length - 2] : '') || dashedFolder(data.series_title || key);
        const inferredFandom = data.fandom_folder || data.folder || (sourceParts.length >= 3 ? sourceParts[sourceParts.length - 3] : '') || dashedFolder(data.fandom || 'Imported');
        const existing = this.series.get(key) || this.registerSeries({
          key, folder: inferredFandom, fandom_folder: inferredFandom, series_folder: inferredStory, series_path: `${inferredFandom}/${inferredStory}`,
          fandom: data.fandom || 'Imported', title: data.series_title || data.title || sentenceCase(key),
          pairing: data.pairing || '', description: data.description || '', chapters: []
        });
        const chapter = normalizeChapter(data, existing);
        const idx = existing.chapters.findIndex(ch => ch.id === chapter.id || ch.chapter_number === chapter.chapter_number);
        if (idx >= 0) existing.chapters[idx] = mergeChapter(existing.chapters[idx], chapter); else existing.chapters.push(chapter);
        this.refreshSeriesStats(existing);
        imported.push(existing);
        return imported;
      }
      if (data.key || data.fandom || data.title) {
        imported.push(this.registerSeries({ ...data, chapters: data.chapters || [] }));
      }
      return imported;
    }

    async importFiles(files) {
      const imported = [];
      for (const file of arr(files)) {
        if (!file || !String(file.name || '').toLowerCase().endsWith('.json')) continue;
        try {
          const data = JSON.parse(await file.text());
          imported.push(...this.importJSON(data, file.webkitRelativePath || file.name));
        } catch (error) {
          this.dispatch('import-error', { file: file.name, error: error?.message || String(error) });
        }
      }
      this.listSeries().forEach(series => {
        const generated = series.chapters.filter(ch => ch.generated);
        this.store.saveGenerated(series.key, generated);
      });
      this.dispatch('imported', { series: imported.map(s => s.key) });
      return imported;
    }

    async loadHostedJson(base = 'json') {
      if (!global.fetch || !global.document || String(global.location?.protocol || '').toLowerCase() === 'file:') return [];
      const imported = [];
      const fetched = new Set();
      const fetchJson = async url => {
        if (fetched.has(url)) return null;
        fetched.add(url);
        try {
          const response = await fetch(url, { cache: 'no-store' });
          if (!response.ok) return null;
          return await response.json();
        } catch (_error) { return null; }
      };

      const catalog = await fetchJson(`${base}/fandoms.json`);
      const descriptors = catalog
        ? (Array.isArray(catalog) ? catalog : arr(catalog.series || catalog.fandoms || catalog.routes))
        : [];
      descriptors.forEach(desc => {
        if (!desc) return;
        const key = desc.key || desc.series_slug || slug(desc.title || desc.fandom || desc.folder);
        if (!this.series.has(key)) this.registerSeries({ ...desc, key, chapters: [] });
      });

      const keys = new Set([...this.series.keys(), ...descriptors.map(desc => desc?.key || desc?.series_slug).filter(Boolean)]);
      for (const key of keys) {
        let series = this.getSeries(key);
        if (!series) continue;
        const descriptor = descriptors.find(desc => (desc?.key || desc?.series_slug) === key) || {};
        const fandomFolder = safeFolder(descriptor.fandom_folder || descriptor.folder || series.fandom_folder || series.folder || series.fandom || key);
        const storyFolder = dashedFolder(descriptor.series_folder || descriptor.story_folder || series.series_folder || series.title || key);
        const seriesPath = String(descriptor.series_path || series.series_path || `${fandomFolder}/${storyFolder}`).replace(/^json\//, '');
        const manifestPath = descriptor.series_manifest || `${seriesPath}/series.json`;
        const manifest = await fetchJson(`${base}/${String(manifestPath).replace(/^json\//, '')}`);
        if (manifest) {
          series = this.registerSeries({ ...series, ...manifest, key, fandom_folder: fandomFolder, series_folder: storyFolder, series_path: seriesPath, chapters: series.chapters });
          imported.push(series);
        }
        let files = arr(manifest?.chapter_files || manifest?.chapters_files || manifest?.files || arr(manifest?.chapters).map(item => item?.file).filter(Boolean));
        if (!files.length && num(manifest?.chapter_count) > 0) {
          files = Array.from({ length: num(manifest.chapter_count) }, (_, i) => `${padChapter(i + 1)}.json`);
        }
        if (!files.length) continue;
        for (const fileName of files) {
          const n = Number(String(fileName).match(/(\d+)(?!.*\d)/)?.[1]);
          const chapterData = await fetchJson(`${base}/${seriesPath}/${fileName}`);
          if (!chapterData) continue;
          this.importJSON(chapterData, `${seriesPath}/${fileName}`);
        }
      }
      return imported;
    }

    exportGenerated(seriesKey = this.currentSeriesKey) {
      const series = this.getSeries(seriesKey);
      if (!series) return 0;
      const generated = series.chapters.filter(ch => ch.generated);
      generated.forEach(chapter => this.store.downloadJson(chapter, `${padChapter(chapter.chapter_number)}.json`));
      return generated.length;
    }

    exportState(seriesKey = this.currentSeriesKey) {
      const series = this.getSeries(seriesKey);
      const memory = this.memory(seriesKey);
      if (!series || !memory) return null;
      const data = { schema: 'cyoa.story-save.v5', engine_version: VERSION, exported_at: nowIso(), series: clone(series), state: memory.fullSnapshot() };
      this.store.downloadJson(data, `${slug(series.title)}-save.json`);
      return data;
    }

    saveProgress(seriesKey = this.currentSeriesKey) {
      const memory = this.memory(seriesKey);
      if (!memory) return null;
      memory.save();
      return memory.snapshot();
    }

    canUndo(seriesKey = this.currentSeriesKey) {
      return Boolean(this.memory(seriesKey)?.canUndo());
    }

    undo(seriesKey = this.currentSeriesKey) {
      const memory = this.memory(seriesKey);
      if (!memory) return null;
      this.currentSeriesKey = seriesKey;
      return memory.undo();
    }

    listBranches(seriesKey = this.currentSeriesKey) {
      return this.memory(seriesKey)?.listBranches() || [];
    }

    createBranch(label, seriesKey = this.currentSeriesKey) {
      const memory = this.memory(seriesKey);
      if (!memory) return null;
      this.currentSeriesKey = seriesKey;
      return memory.createBranch(label);
    }

    restoreBranch(branchId, seriesKey = this.currentSeriesKey) {
      const memory = this.memory(seriesKey);
      if (!memory) return null;
      this.currentSeriesKey = seriesKey;
      return memory.restoreBranch(branchId);
    }

    getEntryBridge(seriesKey = this.currentSeriesKey) { return this.memory(seriesKey)?.state.currentBridge || ''; }
    getJournal(seriesKey = this.currentSeriesKey) { return clone(this.memory(seriesKey)?.state.journal || []); }
    getQualities(seriesKey = this.currentSeriesKey) { return clone(this.memory(seriesKey)?.state.values || {}); }
    hasProjectFolder() { return Boolean(this.store.projectRoot); }
    connectProjectFolder() { return this.store.connectProjectRoot(); }

    dispatch(name, detail) {
      try { global.document?.dispatchEvent(new CustomEvent(`cyoa:${name}`, { detail })); } catch (_error) {}
    }
  }

  const FanfictionProviderAdapters = Object.freeze({
    jsonEndpoint(options = {}) {
      if (!options.endpoint) throw new Error('jsonEndpoint requires { endpoint }.');
      return async request => {
        const body = options.buildBody ? options.buildBody(request) : { mode: request.mode, prompt: request.prompt, context: request.context };
        const response = await fetch(options.endpoint, {
          method: options.method || 'POST',
          headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
          body: JSON.stringify(body),
          credentials: options.credentials || 'same-origin'
        });
        if (!response.ok) throw new Error(`Story provider returned HTTP ${response.status}.`);
        const data = options.responseType === 'text' ? await response.text() : await response.json();
        return options.extract ? options.extract(data, response) : data;
      };
    },
    functionAdapter(fn, options = {}) {
      if (typeof fn !== 'function') throw new Error('functionAdapter requires a function.');
      return async request => {
        const payload = options.mapRequest ? options.mapRequest(request) : request;
        const result = await fn(payload);
        return options.mapResponse ? options.mapResponse(result, request) : result;
      };
    },
    retry(provider, options = {}) {
      if (typeof provider !== 'function') throw new Error('retry requires a provider function.');
      const attempts = Math.max(1, Number(options.attempts || 2));
      return async request => {
        let lastError = null;
        for (let i = 0; i < attempts; i += 1) { try { return await provider(request); } catch (error) { lastError = error; } }
        throw lastError || new Error('Provider failed.');
      };
    }
  });

  global.CYOAStoryEngine = Object.freeze({
    VERSION,
    StoryEngine,
    StoryGenerator,
    StoryJsonStore,
    BranchMemory,
    normalizeSeries,
    normalizeChapter,
    normalizeChoice,
    matchesCondition,
    wordCount,
    slug,
    safeFolder,
    dashedFolder,
    FanfictionProviderAdapters,
    padChapter,
    analyzeStyleCorpus,
    buildStyleProfile,
    resolveContentMode,
    normalizeTags,
    ADAPTIVE_STORY_STYLE_PROFILE,
    STORY_TAG_TAXONOMY,
    CONTENT_MODES
  });
  global.JasperFanfictionEngine = global.CYOAStoryEngine;
}(typeof globalThis !== 'undefined' ? globalThis : window));
