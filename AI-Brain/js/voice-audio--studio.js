/* Genericized for AI-Brain capability use. Provenance group: voice-persona-creator. */
(() => {
  'use strict';

  const D = window.UniversalNpcLabData;
  const $ = (id) => document.getElementById(id);

  const sliderLabelHints = {
    pitch: ['Lower', 'Higher'],
    speed: ['Slower', 'Faster'],
    inflection: ['Flatter', 'More melodic'],
    stutter: ['Clean', 'Hesitant'],
    breath: ['Crisp', 'Soft'],
    roughness: ['Smooth', 'Gruff'],
    deepRegister: ['Natural', 'Very deep'],
    musicalLilt: ['Plain', 'Singing lilt'],
    airTexture: ['Dry', 'Airy'],
    harshEdge: ['Clean', 'Harsh'],
    vocalWeight: ['Light', 'Heavy'],
    resonance: ['Thin', 'Full'],
    formality: ['Casual', 'Careful'],
    vowelFlow: ['Clipped', 'Stretched'],
    consonantBite: ['Soft', 'Sharp'],
    mouthShape: ['Closed', 'Open'],
    nasality: ['Oral', 'Nasal'],
    throatDepth: ['Forward', 'Throaty'],
    rhythm: ['Even', 'Bouncy'],
    pauseControl: ['Tight', 'Spacious'],
    emphasis: ['Gentle', 'Strong'],
    warmth: ['Cool', 'Warm'],
    clarity: ['Muttered', 'Clear'],
    projection: ['Private', 'Projected'],
    humanVariation: ['Steady', 'Lifelike'],
    accentColor: ['Reduced accent', 'Strong accent'],
    influenceRace: ['Off', 'Full'],
    influenceGender: ['Off', 'Full'],
    influencePersonality: ['Off', 'Full'],
    influenceBiome: ['Remove accent', 'Full accent'],
    influenceBaseAudio: ['No original clip', 'Keep original clip'],
    emotionIntensity: ['Flat', 'Full emotion']
  };

  const sliderHelp = {
    pitch: 'Base pitch, F0, semitone shift, and pitch range.',
    speed: 'Speech rate, duration, and pacing.',
    inflection: 'Pitch motion, melody, and phrase movement.',
    stutter: 'Stutter chance, hesitation text, and pause behavior.',
    breath: 'Airiness, aspiration, and soft delivery.',
    roughness: 'Rough cadence, jitter/shimmer hints, and gruff stress.',
    deepRegister: 'Drops the register far below the normal pitch slider for cavern, giant, dragon, and monster-deep voices.',
    musicalLilt: 'Adds sing-song pitch arcs, melodic phrase lift, and more musical speaking movement.',
    airTexture: 'Adds audible breath and airy high noise without only making the voice quieter.',
    harshEdge: 'Adds bite, distortion, rasp, and sharper broken edges.',
    vocalWeight: 'Adds chest weight, low-body support, and heavier vocal mass.',
    resonance: 'Fullness, formant scale, and chest/body feel.',
    formality: 'Formality, articulation, and carefulness.',
    vowelFlow: 'Clipped versus stretched vowels.',
    consonantBite: 'Soft versus sharp consonants.',
    mouthShape: 'Closed versus open mouth feel.',
    nasality: 'Oral versus nasal color.',
    throatDepth: 'Forward versus back, throaty resonance.',
    rhythm: 'Even versus bouncy cadence.',
    pauseControl: 'Tight versus spacious phrase timing.',
    emphasis: 'Gentle versus strong stress.',
    warmth: 'Cool versus warm delivery.',
    clarity: 'Muttered versus clear articulation.',
    projection: 'Quiet/private versus projected/outward.',
    humanVariation: 'Mechanical steadiness versus lifelike micro-variation.',
    accentColor: 'Removes or strengthens accent mouth-feel.',
    influenceRace: 'How strongly ancestry/species modifies the base voice.',
    influenceGender: 'How strongly gender-linked style affects the voice.',
    influencePersonality: 'How strongly personality affects delivery.',
    influenceBiome: 'How strongly biome/accent rules appear or fade.',
    influenceBaseAudio: 'How much the original uploaded/recorded/licensed clip remains in the result.',
    emotionIntensity: 'How strongly emotion curves reshape pitch, timing, and tone.'
  };

  const sliderDefaults = {
    pitch: 5.0,
    speed: 5.0,
    inflection: 5.0,
    stutter: 1.0,
    breath: 3.0,
    roughness: 2.0,
    deepRegister: 3.0,
    musicalLilt: 5.0,
    airTexture: 3.0,
    harshEdge: 2.0,
    vocalWeight: 5.0,
    resonance: 5.5,
    formality: 5.5,
    vowelFlow: 5.0,
    consonantBite: 5.0,
    mouthShape: 5.0,
    nasality: 5.0,
    throatDepth: 5.0,
    rhythm: 5.0,
    pauseControl: 5.0,
    emphasis: 5.0,
    warmth: 5.0,
    clarity: 6.0,
    projection: 5.0,
    humanVariation: 5.0,
    accentColor: 7.0,
    influenceRace: 100,
    influenceGender: 100,
    influencePersonality: 100,
    influenceBiome: 100,
    influenceBaseAudio: 45,
    emotionIntensity: 75
  };

  const state = {
    selectedIndex: 0,
    selectedNpc: D.NPCS[0],
    activeAudio: null,
    availableVoices: [],
    lastRuntime: ''
  };

  const clamp = (n, min = 0, max = 10) => Math.max(min, Math.min(max, Number.isFinite(+n) ? +n : min));
  const round = (n, places = 3) => Number.parseFloat((+n).toFixed(places));
  const normalizeTrait = (value) => {
    const n = +value;
    if (!Number.isFinite(n)) return 5;
    return n > 10 ? clamp(n / 10, 0, 10) : clamp(n, 0, 10);
  };
  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
  const safeName = (name = 'npc_voice') => String(name)
    .normalize('NFKD')
    .replace(/[’'`´-]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'npc_voice';
  const sanitizeFilePart = (value) => String(value || '')
    .normalize('NFKD')
    .replace(/[\'’‘`´-]/g, '')
    .replace(/[^A-Za-z0-9]/g, '') || 'NPC';
  const emotionSlugForFile = (emotionKey) => D.EMOTION_FILE_SLUGS[emotionKey]
    || String(emotionKey || 'neutral').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    || 'neutral';
  const exportFilenameForNpc = (npc, emotionKey, extension = 'mp3') => {
    const parts = String(npc.name || 'NPC Voice').trim().split(/\s+/);
    const first = sanitizeFilePart(parts[0] || npc.key || 'NPC');
    const last = sanitizeFilePart(parts[parts.length - 1] || 'Voice');
    const ext = String(extension || 'mp3').replace(/^\./, '').toLowerCase();
    return `${first}_${last}-${emotionSlugForFile(emotionKey)}.${ext}`;
  };
  const exportAudioFilenameForNpc = (npc, emotionKey, format = 'mp3') => exportFilenameForNpc(npc, emotionKey, format);
  const downloadText = (filename, text, type = 'application/json') => {
    const blob = new Blob([text], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      link.remove();
    }, 600);
  };

  const downloadBlob = (blob, filename) => {
    if (!(blob instanceof Blob)) throw new Error('No audio blob was available to download.');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
      link.remove();
    }, 1200);
  };

  function addDelta(profile, delta = {}, influence = 1) {
    for (const [key, value] of Object.entries(delta || {})) {
      profile[key] = clamp((Number(profile[key]) || 0) + value * influence, 0, 10);
    }
    return profile;
  }

  function repositoryVoiceForNpc(npc = state.selectedNpc) {
    return D.REPOSITORY_VOICES[npc.repoVoiceKey] || null;
  }

  function repositoryPayloadForNpc(npc = state.selectedNpc) {
    const repo = repositoryVoiceForNpc(npc);
    if (!repo) return null;
    return {
      repository: repo.repo,
      engine: repo.engine,
      folder: repo.folder,
      voiceId: `voice_pack_v2/${repo.folder}`,
      referenceClip: repo.clip,
      rationale: repo.rationale,
      assetPermission: repo.assetPermission || D.DEFAULT_ASSET_PERMISSION,
      safetyLayer: {
        allowedAssetTypes: D.SAFETY_ALLOWED_ASSET_TYPES.slice(),
        blockUnknownAssetsByDefault: true,
        selectedAssetType: repo.assetPermission || D.DEFAULT_ASSET_PERMISSION,
        userSuppliedRepository: true
      }
    };
  }

  function validateAssetSafety(repositoryVoice) {
    const selectedAssetType = repositoryVoice && repositoryVoice.assetPermission
      ? repositoryVoice.assetPermission
      : D.DEFAULT_ASSET_PERMISSION;
    const ok = D.SAFETY_ALLOWED_ASSET_TYPES.includes(selectedAssetType);
    return {
      ok,
      selectedAssetType,
      allowedAssetTypes: D.SAFETY_ALLOWED_ASSET_TYPES.slice(),
      blockUnknownAssetsByDefault: true,
      message: ok ? 'Allowed voice asset permission.' : `Blocked unknown or unapproved voice asset permission: ${selectedAssetType}`
    };
  }

  function baseProfileForNpc(npc, influenceOverride = null) {
    const profile = JSON.parse(JSON.stringify(D.DEFAULT_PROFILE));
    if (influenceOverride) Object.assign(profile, influenceOverride);
    const model = D.VOICE_MODELS[npc.modelKey] || { delta: {} };
    addDelta(profile, model.delta, profile.influenceBiome);
    addDelta(profile, D.RACE_DELTAS[npc.race], profile.influenceRace);
    addDelta(profile, D.CLASS_DELTAS[npc.klass], profile.influencePersonality);
    addDelta(profile, D.GENDER_DELTAS[npc.gender], profile.influenceGender);
    return profile;
  }

  function readProfileFromSliders() {
    const profile = {};
    for (const [, key] of D.CORE_SLIDERS) {
      const slider = document.querySelector(`[data-slider="${key}"]`);
      profile[key] = slider ? Number(slider.value) : D.DEFAULT_PROFILE[key];
    }
    for (const [, key] of D.INFLUENCE_SLIDERS) {
      const slider = document.querySelector(`[data-slider="${key}"]`);
      profile[key] = slider ? Number(slider.value) / 100 : D.DEFAULT_PROFILE[key];
    }
    return profile;
  }

  function applyEmotionByKey(profile, emotionKey = 'neutral') {
    const key = emotionKey || 'neutral';
    const intensity = Number(profile.emotionIntensity ?? D.DEFAULT_PROFILE.emotionIntensity);
    const emotion = D.EMOTIONS[key] || D.EMOTIONS.neutral;
    return addDelta(profile, emotion.delta, intensity);
  }

  function applyEmotion(profile) {
    return applyEmotionByKey(profile, $('emotionSelect').value || 'neutral');
  }

  function resolvedProfile() {
    return applyEmotion(readProfileFromSliders());
  }

  function resolveInternalSynthTexture(profile = {}) {
    const rough = normalizeTrait(profile.roughness);
    const breath = normalizeTrait(profile.breath);
    const resonance = normalizeTrait(profile.resonance);
    if (rough >= 8) return 'sawtooth';
    if (breath >= 8) return 'hybrid';
    if (resonance <= 2) return 'sine';
    if (rough >= 5) return 'square';
    return 'triangle';
  }

  function setHiddenSynthTexture(profile = {}) {
    const hidden = $('waveform');
    if (hidden) hidden.value = 'auto';
    const textureDetails = $('textureDetails');
    if (textureDetails) {
      textureDetails.textContent = 'Auto-managed from selected NPC, emotion, and sliders.';
    }
  }

  function profileToEngine(profile = {}) {
    const p = { ...D.DEFAULT_PROFILE, ...profile };
    const pitch = normalizeTrait(p.pitch);
    const speed = normalizeTrait(p.speed);
    const inflection = normalizeTrait(p.inflection);
    const breath = normalizeTrait(p.breath);
    const roughness = normalizeTrait(p.roughness);
    const deepRegister = normalizeTrait(p.deepRegister ?? 3);
    const musicalLilt = normalizeTrait(p.musicalLilt ?? p.inflection ?? 5);
    const airTexture = normalizeTrait(p.airTexture ?? p.breath ?? 3);
    const harshEdge = normalizeTrait(p.harshEdge ?? p.roughness ?? 2);
    const vocalWeight = normalizeTrait(p.vocalWeight ?? 5);
    const resonance = normalizeTrait(p.resonance);
    const formality = normalizeTrait(p.formality);
    const vowelFlow = normalizeTrait(p.vowelFlow);
    const consonantBite = normalizeTrait(p.consonantBite);
    const mouthShape = normalizeTrait(p.mouthShape);
    const nasality = normalizeTrait(p.nasality);
    const throatDepth = normalizeTrait(p.throatDepth);
    const rhythm = normalizeTrait(p.rhythm);
    const pauseControl = normalizeTrait(p.pauseControl);
    const emphasis = normalizeTrait(p.emphasis);
    const warmth = normalizeTrait(p.warmth);
    const clarity = normalizeTrait(p.clarity);
    const projection = normalizeTrait(p.projection);
    const humanVariation = normalizeTrait(p.humanVariation);
    const accentColor = normalizeTrait(p.accentColor);
    const center = (value) => (value - 5) / 5;
    const positive = (value) => Math.max(0, center(value));

    // Extended-impact mapping inspired by the old source/filter, formant, and prosody math:
    // the UI stays simple 0–10, but the sound engine now spans monster-deep, airy, harsh, and musical extremes.
    const semitoneShift = (pitch - 5) * 3.6 - deepRegister * 1.9 - positive(throatDepth) * 6.5 - positive(vocalWeight) * 4.0 + center(resonance) * 1.6;
    const f0 = clamp(150 * Math.pow(2, semitoneShift / 12), 34, 360);
    const liltCurve = Math.pow(musicalLilt / 10, 1.35);
    const pitchRange = 4 + Math.pow(inflection / 10, 1.25) * 70 + liltCurve * 42 + Math.max(0, rhythm - 5) * 2.2 + (humanVariation - 5) * 1.4;
    const speechRate = clamp(0.44 + speed * 0.155 + (rhythm - 5) * 0.019 - deepRegister * 0.018 - vocalWeight * 0.012 + (vowelFlow - 5) * 0.018, 0.38, 2.25);
    const pauseDensity = clamp(0.13 + (10 - speed) * 0.018 + formality * 0.012 + pauseControl * 0.032 + deepRegister * 0.008 - musicalLilt * 0.005, 0.015, 0.74);
    const breathNoiseMix = clamp(breath * 0.068 + airTexture * 0.078 + Math.max(0, 4 - projection) * 0.018, 0, 1.35);
    const roughnessAmount = clamp(roughness * 0.072 + harshEdge * 0.085 + deepRegister * 0.026 + Math.max(0, vocalWeight - 5) * 0.032, 0, 1.45);
    const formantShift = clamp(1.04 + (pitch - 5) * 0.035 - deepRegister * 0.043 - throatDepth * 0.032 - vocalWeight * 0.021 + resonance * 0.012 + (mouthShape - 5) * 0.02, 0.48, 1.62);
    const subharmonicMix = clamp((deepRegister - 2.5) * 0.085 + roughness * 0.018 + vocalWeight * 0.026, 0, 0.78);
    const growlMix = clamp(roughness * 0.055 + harshEdge * 0.074 + deepRegister * 0.025 + Math.max(0, 5 - clarity) * 0.018, 0, 1.25);
    const liltAmount = clamp(liltCurve * 0.95 + inflection / 18 + rhythm / 30, 0, 1.55);
    const harshnessAmount = clamp(harshEdge / 10 * 1.18 + consonantBite / 35 + roughness / 40, 0, 1.45);
    const airAmount = clamp(airTexture / 10 * 1.15 + breath / 18, 0, 1.45);
    const weightAmount = clamp(vocalWeight / 10 * 1.1 + resonance / 28 + deepRegister / 35, 0, 1.65);

    return {
      f0: round(f0, 2),
      semitoneShift: round(semitoneShift, 2),
      pitchRange: round(Math.max(2, pitchRange), 2),
      speechRate: round(speechRate, 3),
      pauseDensity: round(pauseDensity, 3),
      breathNoiseMix: round(breathNoiseMix, 3),
      airAmount: round(airAmount, 3),
      roughnessAmount: round(roughnessAmount, 3),
      harshnessAmount: round(harshnessAmount, 3),
      subharmonicMix: round(subharmonicMix, 3),
      growlMix: round(growlMix, 3),
      liltAmount: round(liltAmount, 3),
      weightAmount: round(weightAmount, 3),
      formantShift: round(formantShift, 3),
      articulationPrecision: round(clamp((clarity * 0.55 + consonantBite * 0.34 + formality * 0.11 + harshEdge * 0.05) / 10, 0, 1.25), 3),
      nasality: round(nasality / 10, 3),
      projection: round(projection / 10, 3),
      warmth: round(warmth / 10, 3),
      clarity: round(clarity / 10, 3),
      emphasis: round(emphasis / 10, 3),
      humanVariation: round(clamp(humanVariation / 10 + liltAmount * 0.08 + growlMix * 0.03, 0, 1.35), 3),
      accentStrength: round(accentColor / 10, 3),
      stutterAmount: round(normalizeTrait(p.stutter) / 10, 3),
      synthTextureMode: 'auto-managed',
      rangeVersion: 'wide-impact-v3',
      gain: round(clamp(0.12 + resonance / 10 * 0.055 + projection * 0.017 + weightAmount * 0.04 - breathNoiseMix * 0.025, 0.09, 0.44), 3)
    };
  }

  function profileToInternal(profile, npc, emotionOverride = null) {
    const resolvedEmotionKey = emotionOverride || ($('emotionSelect').value || 'neutral');
    return {
      npc: npc.name,
      selectedVoiceModel: D.VOICE_MODELS[npc.modelKey]?.name || npc.modelKey,
      biome: npc.biome,
      accent: npc.accent,
      f0: profileToEngine(profile).f0,
      pitchRange: profileToEngine(profile).pitchRange,
      semitoneShift: profileToEngine(profile).semitoneShift,
      deepRegister: round(profile.deepRegister ?? D.DEFAULT_PROFILE.deepRegister ?? 3, 2),
      musicalLilt: round(profile.musicalLilt ?? D.DEFAULT_PROFILE.musicalLilt ?? 5, 2),
      airTexture: round(profile.airTexture ?? D.DEFAULT_PROFILE.airTexture ?? 3, 2),
      harshEdge: round(profile.harshEdge ?? D.DEFAULT_PROFILE.harshEdge ?? 2, 2),
      vocalWeight: round(profile.vocalWeight ?? D.DEFAULT_PROFILE.vocalWeight ?? 5, 2),
      speechRate: profileToEngine(profile).speechRate,
      pauseDensity: profileToEngine(profile).pauseDensity,
      breathNoiseMix: profileToEngine(profile).breathNoiseMix,
      roughnessAmount: profileToEngine(profile).roughnessAmount,
      airAmount: profileToEngine(profile).airAmount,
      harshnessAmount: profileToEngine(profile).harshnessAmount,
      subharmonicMix: profileToEngine(profile).subharmonicMix,
      growlMix: profileToEngine(profile).growlMix,
      liltAmount: profileToEngine(profile).liltAmount,
      weightAmount: profileToEngine(profile).weightAmount,
      formantShift: profileToEngine(profile).formantShift,
      articulationPrecision: profileToEngine(profile).articulationPrecision,
      nasality: round(profile.nasality / 10, 2),
      projection: round(profile.projection / 10, 2),
      warmth: round(profile.warmth / 10, 2),
      clarity: round(profile.clarity / 10, 2),
      humanVariation: round(profile.humanVariation / 10, 2),
      accentStrength: round(profile.accentColor / 10, 2),
      synthTextureMode: 'auto-managed',
      emotion: resolvedEmotionKey,
      influences: {
        race: round(profile.influenceRace, 2),
        gender: round(profile.influenceGender, 2),
        personality: round(profile.influencePersonality, 2),
        biome: round(profile.influenceBiome, 2),
        baseAudio: round(profile.influenceBaseAudio, 2),
        emotion: round(profile.emotionIntensity, 2)
      },
      safety: {
        allowedAssetTypes: D.SAFETY_ALLOWED_ASSET_TYPES.slice(),
        blockUnknownAssetsByDefault: true
      },
      pipeline: [
        'MP3 decode or synthetic source',
        'feature analysis',
        'base voice parameters',
        'accent rules',
        'emotion rules',
        'personality rules',
        'stutter / hesitation rules',
        'synth or convert',
        'output waveform'
      ]
    };
  }

  function makeSliderText(key, value, max = 10) {
    const numeric = Number(value);
    const total = 10;
    const position = max === 100 ? Math.round(numeric / 10) : Math.round(normalizeTrait(numeric));
    const left = '─'.repeat(Math.max(0, position));
    const right = '─'.repeat(Math.max(0, total - position));
    const hints = sliderLabelHints[key] || ['Low', 'High'];
    return `${hints[0]} ◄${left}●${right}► ${hints[1]}`;
  }

  function makeSlider(label, key, min, max, step, value, scalePercent = false) {
    const display = scalePercent ? Math.round(value * 100) : Number(value).toFixed(1);
    const defaultValue = sliderDefaults[key] !== undefined
      ? sliderDefaults[key]
      : (scalePercent ? Math.round((D.DEFAULT_PROFILE[key] || 0) * 100) : D.DEFAULT_PROFILE[key]);
    const defaultText = scalePercent ? `${defaultValue}%` : Number(defaultValue).toFixed(1);
    return `<div class="slider-row" data-slider-row="${key}">
      <div class="slider-head">
        <label for="sl_${key}">${escapeHtml(label)}</label>
        <output id="out_${key}">${display}${scalePercent ? '%' : ''}</output>
      </div>
      <input id="sl_${key}" data-slider="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${display}">
      <div class="hint"><span>${escapeHtml((sliderLabelHints[key] || ['Low', 'High'])[0])}</span><code id="hint_${key}">${escapeHtml(makeSliderText(key, display, max))}</code><span>${escapeHtml((sliderLabelHints[key] || ['Low', 'High'])[1])}</span></div>
      <small>${escapeHtml(sliderHelp[key] || 'Voice parameter control.')} Default: ${escapeHtml(defaultText)}.</small>
    </div>`;
  }

  function renderNpcList() {
    const wrap = $('npcLoaderList');
    const searchBox = $('npcSearch');
    const q = searchBox ? searchBox.value.trim().toLowerCase() : '';
    const rows = D.NPCS
      .map((npc, index) => ({ npc, index }))
      .filter(({ npc }) => {
        if (!q) return true;
        const model = D.VOICE_MODELS[npc.modelKey] || {};
        const repo = D.REPOSITORY_VOICES[npc.repoVoiceKey] || {};
        return [npc.name, npc.pronounce, npc.race, npc.klass, npc.gender, npc.alignment, npc.biome, npc.accent, model.name, model.fantasy, repo.folder, repo.clip, repo.repo]
          .join(' ')
          .toLowerCase()
          .includes(q);
      });
    wrap.innerHTML = rows.length ? rows.map(({ npc, index }) => `<div class="npc-card ${index === state.selectedIndex ? 'active' : ''}">
      <button class="npc-select-zone" type="button" data-npc-index="${index}">
        <span class="avatar">${escapeHtml(npc.initials)}</span>
        <span><b>${escapeHtml(npc.name)}</b><small class="tagline">${escapeHtml([npc.race, npc.klass, npc.gender, npc.alignment].join(' • '))}</small><small>${escapeHtml(npc.biome)} / ${escapeHtml(npc.accent)} — ${escapeHtml(D.VOICE_MODELS[npc.modelKey]?.name || npc.modelKey)}</small></span>
      </button>
      <div class="npc-card-actions">
        <button class="mini-btn good" type="button" data-npc-mp3-index="${index}">MP3</button>
        <button class="mini-btn" type="button" data-npc-wav-index="${index}">WAV</button>
        <button class="mini-btn" type="button" data-npc-load-mp3-index="${index}">Load + Edit</button>
      </div>
    </div>`).join('') : '<div class="locked-note">No NPCs match that search.</div>';
    wrap.querySelectorAll('[data-npc-index]').forEach((button) => {
      button.addEventListener('click', () => selectNpc(Number(button.dataset.npcIndex)));
    });
    wrap.querySelectorAll('[data-npc-load-mp3-index]').forEach((button) => {
      button.addEventListener('click', () => selectNpc(Number(button.dataset.npcLoadMp3Index)));
    });
    wrap.querySelectorAll('[data-npc-mp3-index]').forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.stopPropagation();
        const index = Number(button.dataset.npcMp3Index);
        await exportNpcMp3AtIndex(index);
      });
    });
    wrap.querySelectorAll('[data-npc-wav-index]').forEach((button) => {
      button.addEventListener('click', async (event) => {
        event.stopPropagation();
        const index = Number(button.dataset.npcWavIndex);
        await exportNpcWavAtIndex(index);
      });
    });
  }

  function renderSelected() {
    const npc = state.selectedNpc;
    const model = D.VOICE_MODELS[npc.modelKey] || {};
    const repo = repositoryVoiceForNpc(npc) || {};
    $('bigAvatar').textContent = npc.initials;
    $('npcName').textContent = npc.name;
    $('npcPronounce').textContent = npc.pronounce || '';
    $('npcTags').innerHTML = [npc.race, npc.klass, npc.gender, npc.alignment, npc.biome, npc.accent]
      .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
    $('modelName').textContent = `${model.name || npc.modelKey} — ${model.fantasy || npc.accent}`;
    $('modelDetails').textContent = model.feel || '';
    $('repoDetails').textContent = repo.repo
      ? `Repository voice: ${repo.repo} / ${repo.folder} / ${repo.clip}`
      : 'Repository voice: synthetic original only';
    $('speechText').value = npc.sample || 'this is what I sound like';
    $('npcBio').textContent = `${npc.bio}\n\nVoice model: ${model.name || npc.modelKey}\nRepository rationale: ${repo.rationale || 'No external clip required.'}\nSafety permission: ${(repo.assetPermission || D.DEFAULT_ASSET_PERMISSION)}\nEmbedded repo voice stamp: ${(D.REPOSITORY_VOICE_CLIPS && D.REPOSITORY_VOICE_CLIPS[npc.repoVoiceKey]) ? 'included' : 'not included'}`;
    $('leftStatus').textContent = `${npc.name} loaded. ${D.NPCS.length} total NPCs available.`;
  }

  function buildSliders() {
    const profile = baseProfileForNpc(state.selectedNpc);
    $('coreSliders').innerHTML = D.CORE_SLIDERS
      .map(([label, key, min, max, step]) => makeSlider(label, key, min, max, step, profile[key] ?? D.DEFAULT_PROFILE[key], false))
      .join('');
    $('influenceSliders').innerHTML = D.INFLUENCE_SLIDERS
      .map(([label, key, min, max, step]) => makeSlider(label, key, min, max, step, profile[key] ?? D.DEFAULT_PROFILE[key], true))
      .join('');
    document.querySelectorAll('[data-slider]').forEach((slider) => {
      slider.addEventListener('input', () => {
        updateSliderOutputs();
        updateReadouts();
      });
    });
    updateSliderOutputs();
  }

  function updateSliderOutputs() {
    document.querySelectorAll('[data-slider]').forEach((slider) => {
      const key = slider.dataset.slider;
      const max = Number(slider.max);
      const value = Number(slider.value);
      const output = $('out_' + key);
      const hint = $('hint_' + key);
      if (output) output.textContent = value.toFixed(max === 100 ? 0 : 1) + (max === 100 ? '%' : '');
      if (hint) hint.textContent = makeSliderText(key, value, max);
    });
    setHiddenSynthTexture(readProfileFromSliders());
  }

  function selectNpc(index) {
    state.selectedIndex = index;
    state.selectedNpc = D.NPCS[index] || D.NPCS[0];
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (state.activeAudio) {
      try { state.activeAudio.pause(); } catch {}
      state.activeAudio = null;
    }
    renderNpcList();
    renderSelected();
    buildSliders();
    setHiddenSynthTexture(baseProfileForNpc(state.selectedNpc));
    updateReadouts();
    setStatus(`${state.selectedNpc.name} loaded into the Voice Creator Studio.`, 'good');
  }

  function setStatus(message, tone = '') {
    $('status').textContent = message;
    $('status').className = `status ${tone}`;
  }

  function populateControls() {
    Object.entries(D.EMOTIONS).forEach(([key, emotion]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = emotion.label;
      $('emotionSelect').appendChild(option);
    });
    $('emotionSelect').value = 'neutral';
    $('emotionSelect').addEventListener('change', () => {
      setHiddenSynthTexture(resolvedProfile());
      updateReadouts();
    });
    setHiddenSynthTexture(baseProfileForNpc(state.selectedNpc));
  }

  function loadVoices() {
    if (!window.speechSynthesis) return [];
    state.availableVoices = window.speechSynthesis.getVoices() || [];
    return state.availableVoices;
  }

  function stopAudio() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (state.activeAudio) {
      try { state.activeAudio.pause(); state.activeAudio.currentTime = 0; } catch {}
      state.activeAudio = null;
    }
    setStatus('Audio stopped.');
  }

  function playRepoClip() {
    const repo = repositoryVoiceForNpc(state.selectedNpc);
    const clip = D.REPOSITORY_VOICE_CLIPS && state.selectedNpc ? D.REPOSITORY_VOICE_CLIPS[state.selectedNpc.repoVoiceKey] : null;
    if (!repo || !clip) {
      setStatus('No embedded repository voice stamp is available for this NPC.', 'bad');
      return;
    }
    stopAudio();
    state.activeAudio = new Audio(clip);
    state.activeAudio.onended = () => setStatus(`Finished assigned repository voice stamp: ${repo.folder}.`, 'good');
    state.activeAudio.onerror = () => setStatus(`Could not play embedded repo voice stamp for ${repo.folder}.`, 'bad');
    state.activeAudio.play()
      .then(() => setStatus(`Playing assigned repo voice stamp from ${repo.repo}: ${repo.folder}/${repo.clip}.`, 'good'))
      .catch(() => setStatus('Browser blocked audio playback; click the button again after interacting with the page.', 'bad'));
  }

  function chooseVoice(profile) {
    const model = D.VOICE_MODELS[state.selectedNpc.modelKey] || {};
    const voices = state.availableVoices.length ? state.availableVoices : loadVoices();
    if (!voices.length) return null;
    const preferred = profile.accentColor < 2.5 || profile.influenceBiome < 0.25 ? ['en-US', 'en-GB'] : (model.langs || ['en-US']);
    for (const lang of preferred) {
      const exact = voices.find((voice) => (voice.lang || '').toLowerCase() === lang.toLowerCase());
      if (exact) return exact;
      const prefix = voices.find((voice) => (voice.lang || '').toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
      if (prefix) return prefix;
    }
    return voices.find((voice) => /^en[-_]/i.test(voice.lang || '')) || voices[0];
  }

  function shapeText(text, profile, emotionKey) {
    let phrase = String(text || state.selectedNpc.sample || 'this is what I sound like').trim();
    const stutter = normalizeTrait(profile.stutter);
    const clarity = normalizeTrait(profile.clarity);
    const emotion = D.EMOTIONS[emotionKey] || D.EMOTIONS.neutral;
    if (stutter >= 8) phrase = phrase.replace(/\b([A-Za-z])/i, '$1-$1-$1');
    else if (stutter >= 6) phrase = phrase.replace(/\b([A-Za-z]{2})/i, '$1-$1');
    else if (stutter >= 4) phrase = phrase.replace(/\b(and|but|the|this|that)\b/i, '$1, um,');
    if (clarity >= 8 && !/[.!?]$/.test(phrase)) phrase += '.';
    if (emotionKey === 'commanding' && !/[!]$/.test(phrase)) phrase += '!';
    if (emotionKey === 'fearful' || emotionKey === 'panic') phrase = phrase.replace(/\.$/, '...');
    if (emotion && emotion.label && emotionKey !== 'neutral') return phrase;
    return phrase;
  }

  function getCtx() {
    return window.__universalVoiceCtx || (window.__universalVoiceCtx = new (window.AudioContext || window.webkitAudioContext)());
  }

  function makeNoiseBuffer(ctx, duration = 1) {
    const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * duration)), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  function makeDistortionCurve(amount = 0) {
    const k = Math.max(0, amount) * 520;
    const n = 4096;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i += 1) {
      const x = i * 2 / n - 1;
      curve[i] = (1 + k) * x / (1 + k * Math.abs(x));
    }
    return curve;
  }

  function normalizeSamples(samples, ceiling = 0.92) {
    let peak = 0;
    for (let i = 0; i < samples.length; i += 1) peak = Math.max(peak, Math.abs(samples[i]));
    if (peak > ceiling && peak > 0) {
      const scale = ceiling / peak;
      for (let i = 0; i < samples.length; i += 1) samples[i] *= scale;
    }
    return samples;
  }

  function connectFormants(ctx, input, engine) {
    const master = ctx.createGain();
    master.gain.value = Math.min(1.15, 0.76 + engine.weightAmount * 0.12);
    [
      { f: 520, q: 8, g: 1.05 + engine.weightAmount * 0.18 },
      { f: 930, q: 9, g: 0.74 },
      { f: 1900, q: 10, g: 0.46 + engine.harshnessAmount * 0.08 },
      { f: 3150, q: 12, g: 0.24 + engine.airAmount * 0.12 }
    ].forEach((formant) => {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = formant.f * engine.formantShift;
      bp.Q.value = formant.q;
      const gain = ctx.createGain();
      gain.gain.value = formant.g * (0.5 + engine.projection * 0.4);
      input.connect(bp);
      bp.connect(gain);
      gain.connect(master);
    });
    const low = ctx.createBiquadFilter();
    low.type = 'lowshelf';
    low.frequency.value = 220;
    low.gain.value = (engine.projection - 0.5) * 10 + engine.subharmonicMix * 10 + engine.weightAmount * 3;
    const high = ctx.createBiquadFilter();
    high.type = 'highshelf';
    high.frequency.value = 4300;
    high.gain.value = (engine.breathNoiseMix - 0.35) * 8 + engine.airAmount * 5 + engine.harshnessAmount * 2;
    input.connect(low);
    low.connect(high);
    high.connect(master);
    return master;
  }

  async function startSpeechTextureBed(profile = {}, options = {}) {
    const ctx = getCtx();
    await ctx.resume();
    const engine = profileToEngine(profile);
    const waveform = resolveInternalSynthTexture(profile);
    const duration = options.duration || Math.max(1.45, 2.6 - (engine.speechRate - 1) * 0.55);
    const start = ctx.currentTime + 0.01;
    const end = start + duration;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, start);
    master.gain.exponentialRampToValueAtTime(Math.max(0.008, options.textureVolume ?? 0.16), start + 0.08);
    master.gain.setValueAtTime(Math.max(0.008, options.textureVolume ?? 0.16), end - 0.16);
    master.gain.exponentialRampToValueAtTime(0.0001, end);
    master.connect(ctx.destination);

    if (engine.breathNoiseMix > 0.12 || waveform === 'noise' || waveform === 'hybrid') {
      const noise = ctx.createBufferSource();
      noise.buffer = makeNoiseBuffer(ctx, duration + 0.2);
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 720 + engine.airAmount * 3200;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = Math.min(0.22, engine.breathNoiseMix * 0.075 + engine.airAmount * 0.055 + engine.harshnessAmount * 0.025);
      noise.connect(hp);
      hp.connect(noiseGain);
      noiseGain.connect(master);
      noise.start(start);
      noise.stop(end + 0.05);
    }

    const body = ctx.createOscillator();
    body.type = waveform === 'noise' || waveform === 'hybrid' ? 'triangle' : waveform;
    body.frequency.setValueAtTime(Math.max(24, engine.f0 * (0.26 + engine.weightAmount * 0.08)), start);
    body.frequency.linearRampToValueAtTime(Math.max(22, engine.f0 * (0.22 + engine.subharmonicMix * 0.06)), end);
    const bodyGain = ctx.createGain();
    bodyGain.gain.value = Math.max(0.012, engine.projection * 0.042 + engine.roughnessAmount * 0.032 + engine.subharmonicMix * 0.09 + engine.weightAmount * 0.03);
    const shaper = ctx.createWaveShaper();
    shaper.curve = makeDistortionCurve(engine.roughnessAmount * 0.75 + engine.harshnessAmount * 0.55 + engine.growlMix * 0.28);
    shaper.oversample = '4x';
    const toneIn = ctx.createGain();
    const formants = connectFormants(ctx, toneIn, engine);
    body.connect(shaper);
    shaper.connect(bodyGain);
    bodyGain.connect(toneIn);

    if (engine.subharmonicMix > 0.04 || engine.growlMix > 0.04) {
      const sub = ctx.createOscillator();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(Math.max(18, engine.f0 * 0.48), start);
      sub.frequency.linearRampToValueAtTime(Math.max(18, engine.f0 * 0.42), end);
      const subGain = ctx.createGain();
      subGain.gain.value = Math.min(0.18, engine.subharmonicMix * 0.13 + engine.growlMix * 0.05);
      sub.connect(subGain);
      subGain.connect(toneIn);
      sub.start(start);
      sub.stop(end + 0.02);
    }

    formants.connect(master);
    body.start(start);
    body.stop(end + 0.02);
    setTimeout(() => {
      try { master.disconnect(); } catch {}
    }, duration * 1000 + 450);
    return { engine, endsAt: end };
  }

  async function browserSpeak(text, profile) {
    if (!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) {
      setStatus('This browser does not support speech preview.', 'bad');
      return;
    }
    const emotion = $('emotionSelect').value || 'neutral';
    const shaped = shapeText(text, profile, emotion);
    try { window.speechSynthesis.cancel(); } catch {}
    await startSpeechTextureBed(profile, { duration: Math.max(1.35, shaped.length / (8 + profileToEngine(profile).speechRate * 4)) });
    const utterance = new SpeechSynthesisUtterance(shaped);
    const engine = profileToEngine(profile);
    utterance.rate = clamp(0.42 + normalizeTrait(profile.speed) * 0.17 + (normalizeTrait(profile.rhythm) - 5) * 0.018 - normalizeTrait(profile.deepRegister ?? 3) * 0.012, 0.35, 2.15);
    utterance.pitch = clamp(engine.f0 / 150 + (normalizeTrait(profile.inflection) - 5) * 0.018 + (normalizeTrait(profile.musicalLilt ?? 5) - 5) * 0.014, 0.12, 2);
    utterance.volume = clamp(0.52 + normalizeTrait(profile.projection) * 0.048 + engine.weightAmount * 0.05 - engine.breathNoiseMix * 0.08, 0.25, 1);
    const voice = chooseVoice(profile);
    if (voice) utterance.voice = voice;
    utterance.onend = () => setStatus(`Finished browser synth preview for ${state.selectedNpc.name}.`, 'good');
    utterance.onerror = () => setStatus('Browser speech preview failed, but sliders/readouts remain usable.', 'bad');
    window.speechSynthesis.speak(utterance);
    setStatus(`Previewing ${state.selectedNpc.name} with the current sliders.`, 'good');
  }

  async function postToBackend(url, payload) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`Backend returned ${response.status}`);
      const text = await response.text();
      try { return JSON.parse(text); }
      catch { return { text }; }
    } catch (error) {
      return null;
    }
  }

  async function tryBackendSynthesis(payload) {
    return postToBackend(D.BACKEND_URL, { ...payload, route: 'accentVoice', backendRole: 'accent specific' });
  }

  async function tryAudioEditingBackend(payload) {
    return postToBackend(D.AUDIO_EDITING_BACKEND_URL || D.BACKEND_URL, { ...payload, route: 'audioEditing', backendRole: 'mp3 and editing specific' });
  }

  function buildVoicePayloadForNpc(npc, profile, action = 'npcVoiceSynthesize', options = {}) {
    const model = D.VOICE_MODELS[npc.modelKey] || {};
    const text = options.text || $('speechText').value || npc.sample || 'this is what I sound like';
    const emotion = options.emotion || $('emotionSelect').value || 'neutral';
    const repositoryVoice = repositoryPayloadForNpc(npc);
    const safety = validateAssetSafety(repositoryVoice);
    const shapedText = shapeText(text, profile, emotion);
    return {
      action,
      requestType: action === 'npcVoiceExportMp3' ? 'export_mp3' : 'synthesize_preview',
      source: 'Universal_Voice_Creator_Acapella_NPC_FULL_MERGE',
      app: 'Universal NPC Voice Lab',
      route: action === 'npcVoiceExportMp3' ? 'audioEditing' : 'accentVoice',
      backendRole: action === 'npcVoiceExportMp3' ? 'mp3 and editing specific' : 'accent specific',
      backendRoutes: { accentVoice: D.BACKEND_URL, audioEditing: D.AUDIO_EDITING_BACKEND_URL },
      npc: npc.key,
      npcName: npc.name,
      voiceModel: model.name,
      biome: npc.biome,
      accent: npc.accent,
      repositoryVoice,
      safety,
      assetPermission: safety.selectedAssetType,
      permissionConfirmed: Boolean(safety.ok),
      vocalOnly: true,
      noInstruments: true,
      format: action === 'npcVoiceExportMp3' ? 'mp3' : undefined,
      targetFormat: action === 'npcVoiceExportMp3' ? 'mp3' : undefined,
      mimeType: action === 'npcVoiceExportMp3' ? 'audio/mpeg' : undefined,
      emotion,
      text,
      prompt: shapedText,
      lyrics: shapedText,
      shapedText,
      voiceProfile: profile,
      profile,
      sliders: profile,
      internal: profileToInternal(profile, npc, emotion),
      cleanParameterSet: profileToEngine(profile),
      userFacingControls: {
        technicalWaveformNamesHidden: true,
        synthTextureMode: 'auto-managed'
      },
      embeddedRepositoryVoiceStampAvailable: Boolean(D.REPOSITORY_VOICE_CLIPS && D.REPOSITORY_VOICE_CLIPS[npc.repoVoiceKey])
    };
  }

  function buildVoicePayload(action = 'npcVoiceSynthesize') {
    return buildVoicePayloadForNpc(state.selectedNpc, resolvedProfile(), action);
  }


  async function speak() {
    const profile = resolvedProfile();
    const text = $('speechText').value || state.selectedNpc.sample;
    const payload = buildVoicePayload('npcVoiceSynthesize');
    setStatus('Trying accent backend audio, with browser synth fallback if unavailable...');
    const backend = await tryBackendSynthesis(payload);
    if (backend && (backend.audioBase64 || backend.audioUrl)) {
      if (backend.audioBase64) {
        const mime = backend.mimeType || 'audio/mpeg';
        state.activeAudio = new Audio(`data:${mime};base64,${backend.audioBase64}`);
      } else {
        state.activeAudio = new Audio(backend.audioUrl);
      }
      state.activeAudio.onended = () => setStatus(`Finished backend audio for ${state.selectedNpc.name}.`, 'good');
      state.activeAudio.onerror = () => browserSpeak(backend.text || text, profile);
      state.activeAudio.play()
        .then(() => setStatus(`Speaking as ${state.selectedNpc.name} through backend audio.`, 'good'))
        .catch(() => browserSpeak(backend.text || text, profile));
    } else {
      browserSpeak((backend && backend.text) || text, profile);
    }
  }

  function downloadBase64File(base64, mimeType, fileName) {
    const raw = atob(String(base64 || '').replace(/^data:[^,]+,/, ''));
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
    const blob = new Blob([bytes], { type: mimeType || 'audio/mpeg' });
    downloadBlob(blob, fileName);
  }

  function candidateObjectsFromBackend(result) {
    const queue = [];
    const seen = new Set();
    const add = (value) => {
      if (!value || seen.has(value)) return;
      seen.add(value);
      queue.push(value);
      if (typeof value === 'object') {
        ['result', 'data', 'output', 'file', 'audio', 'response', 'body', 'payload'].forEach((key) => add(value[key]));
        ['files', 'outputs', 'items'].forEach((key) => {
          if (Array.isArray(value[key])) value[key].forEach(add);
        });
      }
    };
    add(result);
    return queue;
  }

  function normalizeBackendAudioResult(result, preferredFileName, targetFormat = 'mp3') {
    if (!result) return null;
    const requested = String(targetFormat || 'mp3').toLowerCase();
    const wantsMp3 = requested === 'mp3';
    const wantsWav = requested === 'wav';
    for (const item of candidateObjectsFromBackend(result)) {
      if (!item) continue;
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (wantsMp3 && /^data:audio\/mpeg/i.test(trimmed)) return { kind: 'dataUri', dataUri: trimmed, mimeType: 'audio/mpeg', fileName: preferredFileName };
        if (wantsWav && /^data:audio\/wav/i.test(trimmed)) return { kind: 'dataUri', dataUri: trimmed, mimeType: 'audio/wav', fileName: preferredFileName };
        if (wantsMp3 && /\.mp3(\?|#|$)/i.test(trimmed)) return { kind: 'url', url: trimmed, mimeType: 'audio/mpeg', fileName: preferredFileName };
        if (wantsWav && /\.wav(\?|#|$)/i.test(trimmed)) return { kind: 'url', url: trimmed, mimeType: 'audio/wav', fileName: preferredFileName };
        continue;
      }
      if (typeof item !== 'object') continue;
      const mimeType = item.mimeType || item.contentType || item.type || result.mimeType || result.contentType || (wantsWav ? 'audio/wav' : 'audio/mpeg');
      const fileName = item.fileName || item.filename || item.name || result.fileName || result.filename || preferredFileName;
      const base64 = wantsMp3
        ? (item.audioBase64 || item.mp3Base64 || item.fileBase64 || item.dataBase64 || item.base64 || item.audioData || item.bytesBase64)
        : (item.wavBase64 || item.audioBase64 || item.fileBase64 || item.dataBase64 || item.base64 || item.audioData || item.bytesBase64);
      const mimeLower = String(mimeType || '').toLowerCase();
      if (base64) {
        if (wantsMp3 && (mimeLower.includes('mpeg') || mimeLower.includes('mp3') || !mimeLower.includes('wav'))) {
          return { kind: 'base64', base64, mimeType: 'audio/mpeg', fileName: fileName.replace(/\.wav$/i, '.mp3') };
        }
        if (wantsWav && (mimeLower.includes('wav') || mimeLower.includes('wave'))) {
          return { kind: 'base64', base64, mimeType: 'audio/wav', fileName: fileName.replace(/\.mp3$/i, '.wav') };
        }
      }
      const url = item.audioUrl || item.mp3Url || item.wavUrl || item.fileUrl || item.downloadUrl || item.url || item.href;
      if (url) {
        const u = String(url);
        if (wantsMp3 && (/\.mp3(\?|#|$)/i.test(u) || mimeLower.includes('mpeg') || mimeLower.includes('mp3'))) return { kind: 'url', url: u, mimeType: 'audio/mpeg', fileName: fileName.replace(/\.wav$/i, '.mp3') };
        if (wantsWav && (/\.wav(\?|#|$)/i.test(u) || mimeLower.includes('wav'))) return { kind: 'url', url: u, mimeType: 'audio/wav', fileName: fileName.replace(/\.mp3$/i, '.wav') };
      }
      const dataUri = item.dataUri || item.audioDataUri || item.fileDataUri;
      if (dataUri) {
        const d = String(dataUri);
        if (wantsMp3 && /^data:audio\/mpeg/i.test(d)) return { kind: 'dataUri', dataUri: d, mimeType: 'audio/mpeg', fileName: fileName.replace(/\.wav$/i, '.mp3') };
        if (wantsWav && /^data:audio\/wav/i.test(d)) return { kind: 'dataUri', dataUri: d, mimeType: 'audio/wav', fileName: fileName.replace(/\.mp3$/i, '.wav') };
      }
    }
    return null;
  }

  function downloadBackendAudio(downloadable, fallbackFileName) {
    const fileName = downloadable.fileName || fallbackFileName;
    if (downloadable.kind === 'base64') {
      downloadBase64File(downloadable.base64, downloadable.mimeType || 'audio/mpeg', fileName);
      return;
    }
    const link = document.createElement('a');
    link.href = downloadable.kind === 'dataUri' ? downloadable.dataUri : downloadable.url;
    link.download = fileName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function floatTo16BitPCM(view, offset, input) {
    for (let i = 0; i < input.length; i += 1, offset += 2) {
      const sample = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    }
  }

  function writeWavString(view, offset, string) {
    for (let i = 0; i < string.length; i += 1) view.setUint8(offset + i, string.charCodeAt(i));
  }

  function encodeWavBlob(samples, sampleRate = 44100) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    writeWavString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeWavString(view, 8, 'WAVE');
    writeWavString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeWavString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);
    floatTo16BitPCM(view, 44, samples);
    return new Blob([view], { type: 'audio/wav' });
  }

  async function blobToBase64(blob) {
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  function accentSeedForNpc(npc = state.selectedNpc) {
    const base = `${npc.name}|${npc.biome}|${npc.accent}|${npc.modelKey}|${npc.repoVoiceKey}`;
    let seed = 2166136261;
    for (let i = 0; i < base.length; i += 1) {
      seed ^= base.charCodeAt(i);
      seed += (seed << 1) + (seed << 4) + (seed << 7) + (seed << 8) + (seed << 24);
    }
    return seed >>> 0;
  }

  function accentShapeForNpc(npc = state.selectedNpc) {
    const model = D.VOICE_MODELS[npc.modelKey] || { delta: {} };
    const seed = accentSeedForNpc(npc);
    const n = (shift) => (((seed >>> shift) & 255) / 255) - 0.5;
    return {
      vowelTilt: (model.delta?.vowelFlow || 0) * 0.028 + n(0) * 0.018,
      consonantPop: (model.delta?.consonantBite || 0) * 0.022 + n(8) * 0.015,
      rhythmLift: (model.delta?.rhythm || 0) * 0.035 + n(16) * 0.02,
      formantColor: (model.delta?.accentColor || 0) * 0.018 + n(24) * 0.016,
      maritimeRoll: /Portuguese|Hawaiian|Cajun|Italian|French/i.test(npc.accent || '') ? 0.018 : 0,
      clippedEdge: /German|Russian|Scottish|Welsh/i.test(npc.accent || '') ? 0.018 : 0
    };
  }

  function renderLocalNpcWav(text, profile, npc = state.selectedNpc, emotionKey = 'neutral') {
    const engine = profileToEngine(profile);
    const accent = accentShapeForNpc(npc);
    const sampleRate = 44100;
    const words = String(text || 'this is what I sound like').trim().split(/\s+/).filter(Boolean);
    const seconds = Math.max(1.4, Math.min(36, words.length / Math.max(0.6, engine.speechRate) * (0.42 + accent.rhythmLift) + 0.85 + engine.pauseDensity * 0.35));
    const length = Math.floor(sampleRate * seconds);
    const data = new Float32Array(length);
    let phase = 0;
    let phase2 = 0;
    let phase3 = 0;
    let phase4 = 0;
    let lastSample = 0;
    let noiseSeed = accentSeedForNpc(npc) + Math.floor(engine.f0 * 10) + Math.floor((profile.emotionIntensity || 0.75) * 1000);
    const syllableDur = Math.max(0.055, (0.23 + accent.rhythmLift * 0.9 + engine.liltAmount * 0.025) / Math.max(0.35, engine.speechRate));
    const accentStrength = Math.max(0, Math.min(1, Number(engine.accentStrength || 0.7)));
    const rand = () => {
      noiseSeed = (1664525 * noiseSeed + 1013904223) >>> 0;
      return (noiseSeed / 0xffffffff) * 2 - 1;
    };
    for (let i = 0; i < length; i += 1) {
      const t = i / sampleRate;
      const syllable = Math.floor(t / syllableDur);
      const local = (t % syllableDur) / syllableDur;
      const vowelCycle = syllable % 5;
      const wordIndex = Math.min(words.length - 1, Math.floor(syllable / 2));
      const wordColor = ((words[wordIndex] || '').length % 7 - 3) * 0.004;
      const human = (Math.sin(t * 5.1) + Math.sin(t * 2.7) + Math.sin(t * 11.9) * 0.35) * engine.humanVariation * 0.015;
      const lilt = Math.sin(t * (1.25 + engine.liltAmount * 4.8) + vowelCycle * 0.55) * engine.pitchRange * 0.0075 * engine.liltAmount;
      const phraseArc = Math.sin((t / Math.max(0.3, seconds)) * Math.PI * (1.1 + engine.liltAmount)) * engine.pitchRange * 0.004;
      const roughFlutter = Math.sin(t * (18 + engine.growlMix * 42)) * engine.growlMix * 0.018;
      const baseF = Math.max(24, engine.f0 * (1 + human + lilt + phraseArc + roughFlutter + (vowelCycle - 2) * (0.013 + accent.vowelTilt * accentStrength) + wordColor));
      phase += 2 * Math.PI * baseF / sampleRate;
      phase2 += 2 * Math.PI * baseF * (1.98 + engine.roughnessAmount * 0.14 + accent.clippedEdge * accentStrength + engine.harshnessAmount * 0.035) / sampleRate;
      phase3 += 2 * Math.PI * baseF * (0.49 + accent.maritimeRoll * accentStrength + engine.liltAmount * 0.015) / sampleRate;
      phase4 += 2 * Math.PI * Math.max(16, baseF * (0.48 - engine.subharmonicMix * 0.08)) / sampleRate;
      const attack = Math.min(1, local / (0.10 - Math.min(0.05, accent.consonantPop * accentStrength)));
      const release = Math.min(1, (1 - local) / (0.18 + engine.pauseDensity * 0.18));
      const gate = local > (0.86 - engine.pauseDensity * 0.2) ? Math.max(0, 1 - (local - 0.86) * 5) : 1;
      const env = Math.max(0, Math.min(attack, release)) * gate * (0.22 + engine.projection * 0.28);
      const form1 = [0.96, 0.78, 1.22, 0.88, 1.12][vowelCycle] * (engine.formantShift + accent.formantColor * accentStrength);
      const form2 = [1.78, 2.35, 1.46, 2.72, 1.68][vowelCycle] / Math.max(0.48, engine.formantShift - accent.formantColor * accentStrength);
      const form3 = [2.7, 3.12, 2.35, 3.45, 2.92][vowelCycle] * Math.max(0.55, engine.formantShift + engine.harshnessAmount * 0.04);
      const vowelRoll = Math.sin(phase3) * (accent.maritimeRoll * accentStrength * 0.18 + engine.liltAmount * 0.055);
      const sub = Math.sin(phase4) * engine.subharmonicMix * (0.32 + engine.weightAmount * 0.12);
      const growl = (Math.sin(phase2) + Math.sin(phase2 * 0.501)) * (engine.roughnessAmount * 0.075 + engine.growlMix * 0.09 + accent.clippedEdge * accentStrength * 0.065);
      const airScrape = rand() * (engine.breathNoiseMix * 0.044 + engine.airAmount * 0.034 + engine.harshnessAmount * 0.026);
      const brightRasp = Math.sin(phase * form3) * engine.harshnessAmount * 0.045;
      const voiced = Math.sin(phase) * (0.52 + engine.warmth * 0.08) + Math.sin(phase * form1) * 0.24 + Math.sin(phase * form2) * 0.13 + brightRasp + growl + sub + vowelRoll;
      const breath = rand() * engine.breathNoiseMix * (0.045 + engine.airAmount * 0.035);
      const nasal = Math.sin(phase * 2.8) * engine.nasality * 0.085;
      const consonantClick = local < (0.035 + accent.consonantPop * accentStrength + engine.harshnessAmount * 0.016) ? rand() * engine.articulationPrecision * engine.emphasis * (0.085 + accent.consonantPop + engine.harshnessAmount * 0.05) : 0;
      let sample = (voiced + breath + airScrape + nasal + consonantClick) * env * (0.74 + engine.weightAmount * 0.16);
      if (engine.harshnessAmount > 0.35) sample = Math.tanh(sample * (1 + engine.harshnessAmount * 1.7)) / (1 + engine.harshnessAmount * 0.22);
      sample = sample * (1 - engine.growlMix * 0.055) + lastSample * engine.growlMix * 0.055;
      lastSample = sample;
      data[i] = sample;
    }
    normalizeSamples(data);
    return { wavBlob: encodeWavBlob(data, sampleRate), duration: seconds, sampleRate, engine, accentShape: accent, emotion: emotionKey };
  }

  async function requestEditedAudioForNpc(npc, profile, options = {}) {
    const format = String(options.format || 'mp3').toLowerCase();
    const emotion = options.emotion || $('emotionSelect').value || 'neutral';
    const fileName = options.fileName || exportAudioFilenameForNpc(npc, emotion, format);
    const text = options.text || $('speechText').value || npc.sample || 'this is what I sound like';
    const payload = buildVoicePayloadForNpc(npc, profile, format === 'mp3' ? 'npcVoiceExportMp3' : 'npcVoiceExportWav', { text, emotion });
    payload.export = {
      format,
      targetFormat: format,
      mimeType: format === 'mp3' ? 'audio/mpeg' : 'audio/wav',
      fileName,
      namingPattern: 'firstname_lastname-emotion.' + format,
      includeSliderChanges: true,
      includeEmotion: true,
      includeAccentModel: true,
      includeRepositoryVoice: true,
      requireSafetyPass: true
    };
    if (!payload.safety.ok) {
      throw new Error(`${payload.safety.message} audio export stopped before render.`);
    }

    const localRender = renderLocalNpcWav(payload.shapedText, profile, npc, emotion);
    const wavFileName = exportAudioFilenameForNpc(npc, emotion, 'wav');
    if (format === 'wav') {
      downloadBlob(localRender.wavBlob, wavFileName);
      return { fileName: wavFileName, downloadedFormat: 'wav', localRender, fallback: false };
    }

    const wavBase64 = await blobToBase64(localRender.wavBlob);
    payload.localSliderRenderedWav = {
      sourceFormat: 'wav',
      audioBase64: wavBase64,
      duration: localRender.duration,
      sampleRate: localRender.sampleRate,
      renderBasis: 'selected NPC biome/accent + repository voice assignment + visible sliders + emotion regulator'
    };
    payload.audioBase64 = wavBase64;
    payload.sourceFormat = 'wav';
    payload.targetFormat = 'mp3';
    payload.format = 'mp3';
    payload.mimeType = 'audio/mpeg';

    let accentResult = null;
    try {
      accentResult = await tryBackendSynthesis({ ...payload, action: 'npcVoiceAccentResolveBeforeMp3', requestType: 'accent_profile_only' });
    } catch (error) {
      accentResult = { ok: false, ignored: true, message: String(error && error.message ? error.message : error) };
    }

    const mp3Requests = [
      { ...payload, accentBackendResult: accentResult, action: 'convert_wav_to_mp3', requestType: 'convert_wav_to_mp3', backendPipeline: ['local render: accent+sliders WAV', 'mp3/editing backend: convert WAV to MP3'] },
      { ...payload, accentBackendResult: accentResult, action: 'exportAudio', requestType: 'convert_wav_to_mp3' },
      { ...payload, accentBackendResult: accentResult, action: 'npcVoiceExportMp3', requestType: 'export_mp3' }
    ];

    const backendAttempts = [];
    for (const attempt of mp3Requests) {
      const result = await tryAudioEditingBackend(attempt);
      backendAttempts.push(result);
      const downloadable = normalizeBackendAudioResult(result, fileName, 'mp3');
      if (downloadable) {
        downloadBackendAudio(downloadable, fileName);
        return { fileName, downloadedFormat: 'mp3', result, backendAttempts, localRender, fallback: false };
      }
    }

    // Guaranteed user-visible export: never pretend this is MP3. If the deployed MP3 backend
    // validates but does not convert, download the actual slider/accent WAV instead.
    downloadBlob(localRender.wavBlob, wavFileName);
    const messages = backendAttempts
      .filter(Boolean)
      .map((r) => r.error || r.message || r.raw || (r.needsGenerator ? 'Backend validated request but did not return generated audio.' : 'No audio returned.'))
      .map((m) => String(m).slice(0, 220));
    return {
      fileName: wavFileName,
      requestedFileName: fileName,
      downloadedFormat: 'wav',
      backendAttempts,
      localRender,
      fallback: true,
      message: messages[0] || 'MP3 backend did not return audio, so the local edited WAV was downloaded instead.'
    };
  }

  async function requestEditedMp3ForNpc(npc, profile, options = {}) {
    return requestEditedAudioForNpc(npc, profile, { ...options, format: 'mp3' });
  }

  async function requestEditedWavForNpc(npc, profile, options = {}) {
    return requestEditedAudioForNpc(npc, profile, { ...options, format: 'wav' });
  }

  async function exportEditedMp3() {
    const emotion = $('emotionSelect').value || 'neutral';
    const fileName = exportAudioFilenameForNpc(state.selectedNpc, emotion, 'mp3');
    setStatus(`Rendering accent+slider WAV first, then requesting MP3 conversion: ${fileName}`);
    try {
      const exported = await requestEditedMp3ForNpc(state.selectedNpc, resolvedProfile(), { emotion, fileName });
      if (exported.downloadedFormat === 'mp3') {
        setStatus(`Downloaded ${fileName}.`, 'good');
      } else {
        setStatus(`MP3 backend did not return MP3, so the edited WAV downloaded instead: ${exported.fileName}. ${exported.message || ''}`, 'bad');
      }
    } catch (error) {
      setStatus(`Audio export failed for ${fileName}. ${error.message}`, 'bad');
    }
  }

  async function exportEditedWav() {
    const emotion = $('emotionSelect').value || 'neutral';
    const fileName = exportAudioFilenameForNpc(state.selectedNpc, emotion, 'wav');
    setStatus(`Rendering edited WAV locally from accent + sliders: ${fileName}`);
    try {
      await requestEditedWavForNpc(state.selectedNpc, resolvedProfile(), { emotion, fileName });
      setStatus(`Downloaded ${fileName}.`, 'good');
    } catch (error) {
      setStatus(`WAV export failed for ${fileName}. ${error.message}`, 'bad');
    }
  }

  async function exportNpcMp3AtIndex(index) {
    const npc = D.NPCS[index] || state.selectedNpc;
    const emotion = $('emotionSelect').value || 'neutral';
    const selectedIsCurrent = npc.key === state.selectedNpc.key;
    const profile = selectedIsCurrent ? resolvedProfile() : applyEmotionByKey(baseProfileForNpc(npc), emotion);
    const fileName = exportAudioFilenameForNpc(npc, emotion, 'mp3');
    setStatus(`Rendering audio for ${npc.name}: ${fileName}`);
    try {
      const exported = await requestEditedMp3ForNpc(npc, profile, { emotion, fileName, text: $('speechText').value || npc.sample });
      if (exported.downloadedFormat === 'mp3') {
        setStatus(`Downloaded ${fileName}.`, 'good');
      } else {
        setStatus(`MP3 backend unavailable for ${npc.name}; downloaded edited WAV instead: ${exported.fileName}.`, 'bad');
      }
    } catch (error) {
      setStatus(`Audio export failed for ${npc.name}. ${error.message}`, 'bad');
    }
  }

  async function exportNpcWavAtIndex(index) {
    const npc = D.NPCS[index] || state.selectedNpc;
    const emotion = $('emotionSelect').value || 'neutral';
    const selectedIsCurrent = npc.key === state.selectedNpc.key;
    const profile = selectedIsCurrent ? resolvedProfile() : applyEmotionByKey(baseProfileForNpc(npc), emotion);
    const fileName = exportAudioFilenameForNpc(npc, emotion, 'wav');
    setStatus(`Rendering WAV for ${npc.name}: ${fileName}`);
    try {
      await requestEditedWavForNpc(npc, profile, { emotion, fileName, text: $('speechText').value || npc.sample });
      setStatus(`Downloaded ${fileName}.`, 'good');
    } catch (error) {
      setStatus(`WAV export failed for ${npc.name}. ${error.message}`, 'bad');
    }
  }

  async function exportAllNpcMp3s() {
    const emotion = $('emotionSelect').value || 'neutral';
    const text = $('speechText').value || 'this is what I sound like';
    let mp3 = 0;
    let wavFallback = 0;
    let failed = 0;
    setStatus(`Starting audio export for all ${D.NPCS.length} NPCs. MP3 uses backend; WAV fallback is local.`);
    for (const npc of D.NPCS) {
      const profile = applyEmotionByKey(baseProfileForNpc(npc), emotion);
      const fileName = exportAudioFilenameForNpc(npc, emotion, 'mp3');
      try {
        const exported = await requestEditedMp3ForNpc(npc, profile, { emotion, fileName, text: text || npc.sample });
        if (exported.downloadedFormat === 'mp3') mp3 += 1;
        else wavFallback += 1;
        setStatus(`Exported ${mp3 + wavFallback}/${D.NPCS.length}. MP3: ${mp3}; WAV fallback: ${wavFallback}.`, exported.downloadedFormat === 'mp3' ? 'good' : 'bad');
      } catch (error) {
        failed += 1;
        setStatus(`Failed ${failed}; exported ${mp3 + wavFallback}/${D.NPCS.length}. Last failure: ${npc.name} — ${error.message}`, 'bad');
      }
    }
    setStatus(`All-NPC export complete. MP3: ${mp3}; WAV fallback: ${wavFallback}; failed: ${failed}.`, failed || wavFallback ? 'bad' : 'good');
  }

  async function exportAllNpcWavs() {
    const emotion = $('emotionSelect').value || 'neutral';
    const text = $('speechText').value || 'this is what I sound like';
    let ok = 0;
    let failed = 0;
    setStatus(`Starting guaranteed local WAV export for all ${D.NPCS.length} NPCs.`);
    for (const npc of D.NPCS) {
      const profile = applyEmotionByKey(baseProfileForNpc(npc), emotion);
      const fileName = exportAudioFilenameForNpc(npc, emotion, 'wav');
      try {
        await requestEditedWavForNpc(npc, profile, { emotion, fileName, text: text || npc.sample });
        ok += 1;
        setStatus(`Downloaded ${ok}/${D.NPCS.length}: ${fileName}`, 'good');
      } catch (error) {
        failed += 1;
        setStatus(`Failed ${failed}; downloaded ${ok}/${D.NPCS.length}. Last failure: ${npc.name} — ${error.message}`, 'bad');
      }
    }
    setStatus(`All-NPC WAV export complete. Downloaded ${ok}; failed ${failed}.`, failed ? 'bad' : 'good');
  }


  function buildBundle() {
    const profile = resolvedProfile();
    const repo = repositoryPayloadForNpc(state.selectedNpc);
    return {
      exportedAt: new Date().toISOString(),
      app: 'Universal Voice Creator Studio — NPC Lab Merge',
      npc: state.selectedNpc,
      selectedSingleVoiceModel: { key: state.selectedNpc.modelKey, ...(D.VOICE_MODELS[state.selectedNpc.modelKey] || {}) },
      assignedRepositoryVoice: repo,
      emotion: $('emotionSelect').value,
      voiceProfile: profile,
      engine: profileToEngine(profile),
      internalParameters: profileToInternal(profile, state.selectedNpc),
      mp3ExportName: exportAudioFilenameForNpc(state.selectedNpc, $('emotionSelect').value || 'neutral', 'mp3'),
      wavExportName: exportAudioFilenameForNpc(state.selectedNpc, $('emotionSelect').value || 'neutral', 'wav'),
      assetSafety: validateAssetSafety(repo),
      typedText: $('speechText').value,
      embeddedAudioIncluded: Boolean(D.REPOSITORY_VOICE_CLIPS && D.REPOSITORY_VOICE_CLIPS[state.selectedNpc.repoVoiceKey]),
      embeddedRepositoryVoiceStamp: (D.REPOSITORY_VOICE_CLIPS && D.REPOSITORY_VOICE_CLIPS[state.selectedNpc.repoVoiceKey]) || null,
      technicalWaveformNamesHiddenFromUserInterface: true
    };
  }

  function buildUserFacingPreview() {
    const bundle = buildBundle();
    return {
      exportedAt: bundle.exportedAt,
      app: bundle.app,
      npc: bundle.npc.name,
      npcIdentity: {
        race: bundle.npc.race,
        class: bundle.npc.klass,
        gender: bundle.npc.gender,
        alignment: bundle.npc.alignment,
        biome: bundle.npc.biome,
        accent: bundle.npc.accent
      },
      emotion: bundle.emotion,
      voiceProfile: bundle.voiceProfile,
      resolvedInternalParameterSet: bundle.internalParameters,
      engine: bundle.engine,
      mp3ExportName: bundle.mp3ExportName,
      wavExportName: bundle.wavExportName,
      assetSafety: bundle.assetSafety,
      embeddedAudioIncluded: Boolean(D.REPOSITORY_VOICE_CLIPS && D.REPOSITORY_VOICE_CLIPS[state.selectedNpc.repoVoiceKey]),
      embeddedRepositoryVoiceStampAvailable: Boolean(D.REPOSITORY_VOICE_CLIPS && D.REPOSITORY_VOICE_CLIPS[state.selectedNpc.repoVoiceKey]),
      technicalWaveformNamesHidden: true
    };
  }

  function standaloneRuntime() {
    return `/* Standalone NPC voice runtime from Universal Voice Creator Studio. */\n(function(global){\n'use strict';\nconst clamp=(n,min=0,max=10)=>Math.max(min,Math.min(max,Number.isFinite(+n)?+n:min));\nconst norm=(v,d=5)=>{const n=+v;return !Number.isFinite(n)?d:n>10?clamp(n/10):clamp(n)};\nfunction profileToEngine(p={}){const pitch=norm(p.pitch),speed=norm(p.speed),inf=norm(p.inflection),breath=norm(p.breath,3),rough=norm(p.roughness,2),deep=norm(p.deepRegister,3),lilt=norm(p.musicalLilt,5),air=norm(p.airTexture,3),harsh=norm(p.harshEdge,2),weight=norm(p.vocalWeight,5),res=norm(p.resonance,5.5),throat=norm(p.throatDepth,5),clarity=norm(p.clarity,6),projection=norm(p.projection,5),accent=norm(p.accentColor,7);const semi=(pitch-5)*3.6-deep*1.9-Math.max(0,(throat-5)/5)*6.5-Math.max(0,(weight-5)/5)*4+(res-5)/5*1.6;return{f0:+clamp(150*Math.pow(2,semi/12),34,360).toFixed(2),semitoneShift:+semi.toFixed(2),pitchRange:+(4+Math.pow(inf/10,1.25)*70+Math.pow(lilt/10,1.35)*42).toFixed(2),speechRate:+clamp(.44+speed*.155-deep*.018-weight*.012,.38,2.25).toFixed(3),breathNoiseMix:+clamp(breath*.068+air*.078,0,1.35).toFixed(3),roughnessAmount:+clamp(rough*.072+harsh*.085+deep*.026,0,1.45).toFixed(3),subharmonicMix:+clamp((deep-2.5)*.085+rough*.018+weight*.026,0,.78).toFixed(3),growlMix:+clamp(rough*.055+harsh*.074+deep*.025,0,1.25).toFixed(3),formantShift:+clamp(1.04+(pitch-5)*.035-deep*.043-throat*.032-weight*.021+res*.012,.48,1.62).toFixed(3),articulationPrecision:+(clarity/10).toFixed(3),projection:+(projection/10).toFixed(3),accentStrength:+(accent/10).toFixed(3),synthTextureMode:'auto-managed',rangeVersion:'wide-impact-v3'}}\nasync function speakPreview(text){if(!('speechSynthesis'in global)||!global.SpeechSynthesisUtterance)return null;const p=global.NPC_VOICE_PROFILE.voiceProfile||{};const e=profileToEngine(p);const u=new SpeechSynthesisUtterance(text||global.NPC_VOICE_PROFILE.typedText||global.NPC_VOICE_PROFILE.npc?.sample||'this is what I sound like');u.rate=clamp(.42+norm(p.speed)/5.9-norm(p.deepRegister,3)*.012,.35,2.15);u.pitch=clamp(e.f0/150+(norm(p.inflection)-5)*.018,.12,2);u.volume=clamp(.25+norm(p.projection,5)/13,.05,1);global.speechSynthesis.cancel();global.speechSynthesis.speak(u);return{engine:e}}\nglobal.NPCVoiceRuntime={speakPreview,profileToEngine};\n})(window);`;
  }

  function buildRuntimeJs() {
    const bundle = buildBundle();
    return `${standaloneRuntime()}\nwindow.NPC_VOICE_PROFILE = ${JSON.stringify(bundle, null, 2)};\n`;
  }

  function exportJson() {
    downloadText(`${state.selectedNpc.key}_${state.selectedNpc.modelKey}_voice_profile.json`, JSON.stringify(buildBundle(), null, 2), 'application/json');
  }

  function exportJs() {
    downloadText(`${safeName(state.selectedNpc.name)}_voice_runtime.js`, buildRuntimeJs(), 'application/javascript');
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(buildRuntimeJs());
      setStatus('JS runtime copied to clipboard.', 'good');
    } catch {
      const area = $('profileCode');
      area.focus();
      area.select();
      setStatus('Could not access clipboard. Clean profile preview is selected; use Export JS Runtime for the runtime file.', 'bad');
    }
  }

  function updateReadouts() {
    setHiddenSynthTexture(resolvedProfile());
    const preview = buildUserFacingPreview();
    $('paramBox').textContent = JSON.stringify(preview.resolvedInternalParameterSet, null, 2);
    $('engineReadout').textContent = JSON.stringify(preview.engine, null, 2);
    $('profileCode').value = JSON.stringify(preview, null, 2);
    state.lastRuntime = buildRuntimeJs();
  }

  function resetToNpc() {
    const currentInfluences = {};
    for (const [, key] of D.INFLUENCE_SLIDERS) {
      const slider = document.querySelector(`[data-slider="${key}"]`);
      currentInfluences[key] = slider ? Number(slider.value) / 100 : D.DEFAULT_PROFILE[key];
    }
    const profile = baseProfileForNpc(state.selectedNpc, currentInfluences);
    for (const [, key] of D.CORE_SLIDERS) {
      const slider = document.querySelector(`[data-slider="${key}"]`);
      if (slider) slider.value = Number(profile[key] ?? D.DEFAULT_PROFILE[key]).toFixed(1);
    }
    updateSliderOutputs();
    updateReadouts();
    setStatus(`${state.selectedNpc.name}'s model reapplied, preserving influence sliders.`, 'good');
  }

  function randomize() {
    document.querySelectorAll('#coreSliders [data-slider]').forEach((slider) => {
      const base = Number(slider.value);
      slider.value = clamp(base + (Math.random() - 0.5) * 1.8, Number(slider.min), Number(slider.max)).toFixed(1);
    });
    updateSliderOutputs();
    updateReadouts();
    setStatus('Core sliders randomized around the selected NPC model.', 'good');
  }

  function attachEvents() {
    $('speakBtn').addEventListener('click', speak);
    $('repoClipBtn').addEventListener('click', playRepoClip);
    $('stopBtn').addEventListener('click', stopAudio);
    $('resetBtn').addEventListener('click', resetToNpc);
    $('randomBtn').addEventListener('click', randomize);
    $('exportJsonBtn').addEventListener('click', exportJson);
    $('exportJsBtn').addEventListener('click', exportJs);
    $('copyCodeBtn').addEventListener('click', copyCode);
    $('exportMp3Btn').addEventListener('click', exportEditedMp3);
    if ($('exportWavBtn')) $('exportWavBtn').addEventListener('click', exportEditedWav);
    if ($('exportLoadedNpcMp3Btn')) $('exportLoadedNpcMp3Btn').addEventListener('click', exportEditedMp3);
    if ($('exportLoadedNpcWavBtn')) $('exportLoadedNpcWavBtn').addEventListener('click', exportEditedWav);
    if ($('exportAllNpcMp3Btn')) $('exportAllNpcMp3Btn').addEventListener('click', exportAllNpcMp3s);
    if ($('exportAllNpcWavBtn')) $('exportAllNpcWavBtn').addEventListener('click', exportAllNpcWavs);
    $('speechText').addEventListener('input', updateReadouts);
    if ($('npcSearch')) $('npcSearch').addEventListener('input', renderNpcList);
  }

  function init() {
    if (!D || !Array.isArray(D.NPCS) || !D.NPCS.length) {
      throw new Error('NPC lab data did not load.');
    }
    renderNpcList();
    populateControls();
    renderSelected();
    buildSliders();
    attachEvents();
    updateReadouts();
    loadVoices();
    if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
