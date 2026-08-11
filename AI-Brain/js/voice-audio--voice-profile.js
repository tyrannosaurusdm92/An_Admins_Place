/* Genericized for AI-Brain capability use. Provenance group: voice-persona-creator. */
const VOICE_SLIDER_SCHEMA = [
  {label:'Voice Height',key:'pitch',min:0,max:10,step:0.1,default:5.0,controls:'Base pitch, F0, semitone shift, pitch range'},
  {label:'Speaking Speed',key:'speed',min:0,max:10,step:0.1,default:5.0,controls:'Speech rate, duration, pacing'},
  {label:'Expression Shape',key:'inflection',min:0,max:10,step:0.1,default:5.0,controls:'Pitch motion, melody, phrase movement'},
  {label:'Hesitations',key:'stutter',min:0,max:10,step:0.1,default:1.0,controls:'Stutter chance, hesitation text, pause behavior'},
  {label:'Softness',key:'breath',min:0,max:10,step:0.1,default:3.0,controls:'Airiness, aspiration, soft delivery'},
  {label:'Gruff Edge',key:'roughness',min:0,max:10,step:0.1,default:2.0,controls:'Rough cadence, jitter/shimmer hints, gruff stress'},
  {label:'Deep Register',key:'deepRegister',min:0,max:10,step:0.1,default:3.0,controls:'Extended low register and subharmonic depth'},
  {label:'Musical Lilt',key:'musicalLilt',min:0,max:10,step:0.1,default:5.0,controls:'Sing-song phrase arcs and melodic speaking movement'},
  {label:'Air Texture',key:'airTexture',min:0,max:10,step:0.1,default:3.0,controls:'Audible breath, whisper air, and high airy texture'},
  {label:'Harsh Edge',key:'harshEdge',min:0,max:10,step:0.1,default:2.0,controls:'Rasp, grit, bite, and broken harshness'},
  {label:'Vocal Weight',key:'vocalWeight',min:0,max:10,step:0.1,default:5.0,controls:'Heavy chest/body support and vocal mass'},
  {label:'Body / Depth',key:'resonance',min:0,max:10,step:0.1,default:5.5,controls:'Fullness, formant scale, chest/body feel'},
  {label:'Speech Style',key:'formality',min:0,max:10,step:0.1,default:5.5,controls:'Formality, articulation, carefulness'},
  {label:'Vowel Flow',key:'vowelFlow',min:0,max:10,step:0.1,default:5.0,controls:'Clipped vs stretched vowels'},
  {label:'Consonant Bite',key:'consonantBite',min:0,max:10,step:0.1,default:5.0,controls:'Soft vs sharp consonants'},
  {label:'Mouth Shape',key:'mouthShape',min:0,max:10,step:0.1,default:5.0,controls:'Closed vs open mouth feel'},
  {label:'Nasal Color',key:'nasality',min:0,max:10,step:0.1,default:5.0,controls:'Oral vs nasal color'},
  {label:'Throat Depth',key:'throatDepth',min:0,max:10,step:0.1,default:5.0,controls:'Forward vs back, throaty resonance'},
  {label:'Speech Rhythm',key:'rhythm',min:0,max:10,step:0.1,default:5.0,controls:'Even vs bouncy cadence'},
  {label:'Pause Space',key:'pauseControl',min:0,max:10,step:0.1,default:5.0,controls:'Tight vs spacious phrase timing'},
  {label:'Word Emphasis',key:'emphasis',min:0,max:10,step:0.1,default:5.0,controls:'Gentle vs strong stress'},
  {label:'Warmth',key:'warmth',min:0,max:10,step:0.1,default:5.0,controls:'Cool vs warm delivery'},
  {label:'Clarity',key:'clarity',min:0,max:10,step:0.1,default:6.0,controls:'Muttered vs clear articulation'},
  {label:'Projection',key:'projection',min:0,max:10,step:0.1,default:5.0,controls:'Quiet/private vs projected/outward'},
  {label:'Human Variation',key:'humanVariation',min:0,max:10,step:0.1,default:5.0,controls:'Mechanical steadiness vs lifelike micro-variation'},
  {label:'Accent Color',key:'accentColor',min:0,max:10,step:0.1,default:7.0,controls:'Removes or strengthens accent mouth-feel'},
  {label:'Race / Ancestry Influence',key:'influenceRace',min:0,max:1,step:0.01,default:1.0,percent:true,controls:'How strongly ancestry/species modifies the base voice'},
  {label:'Gender Identity Influence',key:'influenceGender',min:0,max:1,step:0.01,default:1.0,percent:true,controls:'How strongly gender-linked style affects the voice'},
  {label:'Personality Influence',key:'influencePersonality',min:0,max:1,step:0.01,default:1.0,percent:true,controls:'How strongly personality affects delivery'},
  {label:'Accent Strength / Remove Accent',key:'influenceBiome',min:0,max:1,step:0.01,default:1.0,percent:true,controls:'How strongly biome/accent rules appear or fade'},
  {label:'Uploaded / Recorded Voice Influence',key:'influenceBaseAudio',min:0,max:1,step:0.01,default:0.45,percent:true,controls:'How much the original clip remains in the result'},
  {label:'Emotion Strength',key:'emotionIntensity',min:0,max:1,step:0.01,default:0.75,percent:true,controls:'How strongly emotion curves reshape pitch, timing, and tone'}
];

function defaultVoiceProfile() {
  return Object.fromEntries(VOICE_SLIDER_SCHEMA.map(s => [s.key, s.default]));
}

function getSliderProfile() {
  const profile = {};
  for (const s of VOICE_SLIDER_SCHEMA) {
    const el = document.getElementById(`slider_${s.key}`);
    profile[s.key] = el ? Number(el.value) : s.default;
  }
  return profile;
}

function setSliderProfile(profile = {}) {
  for (const s of VOICE_SLIDER_SCHEMA) {
    const el = document.getElementById(`slider_${s.key}`);
    const valueEl = document.getElementById(`value_${s.key}`);
    const value = Number(profile[s.key] ?? s.default);
    if (el) el.value = value;
    if (valueEl) valueEl.textContent = formatSliderValue(s, value);
  }
}

function formatSliderValue(schema, value) {
  return schema.percent ? `${Math.round(value * 100)}%` : Number(value).toFixed(1);
}

function internalVoiceParameters(profile) {
  const clamp = (n, min, max) => Math.max(min, Math.min(max, Number.isFinite(+n) ? +n : min));
  const value = (key, fallback = 5) => Number.isFinite(+profile[key]) ? +profile[key] : fallback;
  const center = (key, fallback = 5) => (value(key, fallback) - 5) / 5;
  const pitch = value('pitch', 5);
  const speed = value('speed', 5);
  const inflection = value('inflection', 5);
  const breath = value('breath', 3);
  const roughness = value('roughness', 2);
  const deepRegister = value('deepRegister', 3);
  const musicalLilt = value('musicalLilt', 5);
  const airTexture = value('airTexture', 3);
  const harshEdge = value('harshEdge', 2);
  const vocalWeight = value('vocalWeight', 5);
  const resonance = value('resonance', 5.5);
  const throatDepth = value('throatDepth', 5);
  const mouthShape = value('mouthShape', 5);
  const semitoneShift = (pitch - 5) * 3.6 - deepRegister * 1.9 - Math.max(0, center('throatDepth')) * 6.5 - Math.max(0, center('vocalWeight')) * 4 + center('resonance', 5.5) * 1.6;
  const liltCurve = Math.pow(musicalLilt / 10, 1.35);
  const subharmonicMix = clamp((deepRegister - 2.5) * 0.085 + roughness * 0.018 + vocalWeight * 0.026, 0, 0.78);
  const growlMix = clamp(roughness * 0.055 + harshEdge * 0.074 + deepRegister * 0.025 + Math.max(0, 5 - value('clarity', 6)) * 0.018, 0, 1.25);
  const breathNoiseMix = clamp(breath * 0.068 + airTexture * 0.078 + Math.max(0, 4 - value('projection', 5)) * 0.018, 0, 1.35);
  return {
    f0: clamp(150 * Math.pow(2, semitoneShift / 12), 34, 360),
    semitoneShift,
    pitchRange: 4 + Math.pow(inflection / 10, 1.25) * 70 + liltCurve * 42,
    speechRate: clamp(0.44 + speed * 0.155 - deepRegister * 0.018 - vocalWeight * 0.012, 0.38, 2.25),
    pauseDensity: clamp(0.13 + (10 - speed) * 0.018 + value('pauseControl', 5) * 0.032 + deepRegister * 0.008 - musicalLilt * 0.005, 0.015, 0.74),
    breathNoiseMix,
    airAmount: clamp(airTexture / 10 * 1.15 + breath / 18, 0, 1.45),
    roughnessAmount: clamp(roughness * 0.072 + harshEdge * 0.085 + deepRegister * 0.026 + Math.max(0, vocalWeight - 5) * 0.032, 0, 1.45),
    harshnessAmount: clamp(harshEdge / 10 * 1.18 + value('consonantBite', 5) / 35 + roughness / 40, 0, 1.45),
    subharmonicMix,
    growlMix,
    liltAmount: clamp(liltCurve * 0.95 + inflection / 18 + value('rhythm', 5) / 30, 0, 1.55),
    weightAmount: clamp(vocalWeight / 10 * 1.1 + resonance / 28 + deepRegister / 35, 0, 1.65),
    formantShift: clamp(1.04 + (pitch - 5) * 0.035 - deepRegister * 0.043 - throatDepth * 0.032 - vocalWeight * 0.021 + resonance * 0.012 + (mouthShape - 5) * 0.02, 0.48, 1.62),
    articulationPrecision: ((value('clarity', 6)) + value('formality', 5.5) + value('consonantBite', 5)) / 30,
    nasality: value('nasality', 5) / 10,
    projection: value('projection', 5) / 10,
    warmth: value('warmth', 5) / 10,
    clarity: value('clarity', 6) / 10,
    humanVariation: value('humanVariation', 5) / 10,
    accentColor: value('accentColor', 7) / 10,
    vowelStretch: value('vowelFlow', 5) / 10,
    rhythmBounce: value('rhythm', 5) / 10,
    emphasis: value('emphasis', 5) / 10,
    stutterChance: value('stutter', 1) / 25,
    rangeVersion: 'wide-impact-v3'
  };
}

function sanitizeVocalPrompt(text) {
  let clean = String(text || '');
  for (const term of window.VOICE_STUDIO_CONFIG.blockedPromptTerms) {
    clean = clean.replace(new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?\\b`, 'gi'), '[removed-instrument]');
  }
  return clean.trim();
}

function buildGenerationPayload(extra = {}) {
  const profile = getSliderProfile();
  const permission = document.querySelector('input[name="assetPermission"]:checked')?.value || 'unknown';
  const confirmed = document.getElementById('permissionConfirm')?.checked;
  const lyricsRaw = document.getElementById('lyrics')?.value || '';
  const mode = document.getElementById('mode')?.value || 'spoken';
  const payload = {
    action: 'generateVoiceAcapella',
    mode,
    noInstruments: true,
    vocalOnly: true,
    outputFormats: ['mp3', 'wav', 'json'],
    backendContractVersion: '2026-06-25-universal-complete-voice-merge-v2',
    backendRoutes: { audioEditing: window.VOICE_STUDIO_CONFIG.audioEditingBackendUrl, accentVoice: window.VOICE_STUDIO_CONFIG.accentBackendUrl },
    assetPermission: permission,
    permissionConfirmed: Boolean(confirmed),
    prompt: sanitizeVocalPrompt(lyricsRaw),
    lyrics: sanitizeVocalPrompt(lyricsRaw),
    tags: [...window.VOICE_STUDIO_CONFIG.forcedVocalTerms, mode.replaceAll('_', ' ')],
    emotion: document.getElementById('emotion')?.value || 'Neutral/Base',
    race: document.getElementById('race')?.value || '',
    gender: document.getElementById('gender')?.value || '',
    personality: document.getElementById('personality')?.value || '',
    biome: document.getElementById('biome')?.value || '',
    voiceProfile: profile,
    internalParameters: internalVoiceParameters(profile),
    pipeline: ['MP3/WAV decode','feature analysis','base voice parameters','accent rules','emotion rules','personality rules','stutter/hesitation rules','synth or convert','output waveform'],
    ...extra
  };
  return payload;
}

function validateSafetyGate(payload) {
  if (!window.VOICE_STUDIO_CONFIG.allowedAssetPermissions.includes(payload.assetPermission)) {
    throw new Error('Blocked: voice asset permission is unknown or not cleared. Choose an allowed permission category.');
  }
  if (!payload.permissionConfirmed) {
    throw new Error('Please confirm that the voice asset is allowed for this project.');
  }
  return true;
}
