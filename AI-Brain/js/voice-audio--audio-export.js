/* Genericized for AI-Brain capability use. Provenance group: voice-persona-creator. */
let currentOutput = { blob: null, wavBlob: null, mp3Blob: null, json: null, audioBuffer: null, objectUrl: null };

function floatTo16BitPCM(view, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
}

function encodeWav(samples, sampleRate = 44100) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);
  floatTo16BitPCM(view, 44, samples);
  return new Blob([view], { type: 'audio/wav' });
}


function normalizeSamples(samples, ceiling = 0.92) {
  let peak = 0;
  for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
  if (peak > ceiling && peak > 0) {
    const scale = ceiling / peak;
    for (let i = 0; i < samples.length; i++) samples[i] *= scale;
  }
  return samples;
}

async function renderLocalVoicePreview(text, profile) {
  const params = internalVoiceParameters(profile);
  const sampleRate = 44100;
  const words = (text || 'this is what I sound like').trim().split(/\s+/).filter(Boolean);
  const seconds = Math.max(1.4, Math.min(30, words.length / Math.max(.6, params.speechRate) * (0.40 + params.liltAmount * 0.05) + 0.8 + params.pauseDensity * 0.22));
  const length = Math.floor(sampleRate * seconds);
  const data = new Float32Array(length);
  let phase = 0, phase2 = 0, phase3 = 0, phase4 = 0, noiseSeed = 22222, lastSample = 0;
  const syllableDur = Math.max(0.055, (0.22 + params.liltAmount * 0.024) / Math.max(.35, params.speechRate));
  function rand() { noiseSeed = (1664525 * noiseSeed + 1013904223) >>> 0; return (noiseSeed / 0xffffffff) * 2 - 1; }
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const syllable = Math.floor(t / syllableDur);
    const local = (t % syllableDur) / syllableDur;
    const vowelCycle = syllable % 5;
    const human = (Math.sin(t * 5.1) + Math.sin(t * 2.7) + Math.sin(t * 11.9) * 0.35) * params.humanVariation * 0.015;
    const lilt = Math.sin(t * (1.25 + params.liltAmount * 4.8) + vowelCycle * 0.55) * params.pitchRange * 0.0075 * params.liltAmount;
    const phraseArc = Math.sin((t / Math.max(0.3, seconds)) * Math.PI * (1.1 + params.liltAmount)) * params.pitchRange * 0.004;
    const roughFlutter = Math.sin(t * (18 + params.growlMix * 42)) * params.growlMix * 0.018;
    const baseF = Math.max(24, params.f0 * (1 + human + lilt + phraseArc + roughFlutter + (vowelCycle - 2) * 0.013));
    phase += 2 * Math.PI * baseF / sampleRate;
    phase2 += 2 * Math.PI * baseF * (1.98 + params.roughnessAmount * .14 + params.harshnessAmount * 0.035) / sampleRate;
    phase3 += 2 * Math.PI * baseF * (0.49 + params.liltAmount * 0.015) / sampleRate;
    phase4 += 2 * Math.PI * Math.max(16, baseF * (0.48 - params.subharmonicMix * 0.08)) / sampleRate;
    const attack = Math.min(1, local / Math.max(0.035, 0.105 - params.harshnessAmount * 0.025));
    const release = Math.min(1, (1 - local) / (0.18 + params.pauseDensity * .18));
    const env = Math.max(0, Math.min(attack, release)) * (0.22 + params.projection * 0.28);
    const form1 = [0.96, .78, 1.22, .88, 1.12][vowelCycle] * params.formantShift;
    const form2 = [1.78, 2.35, 1.46, 2.72, 1.68][vowelCycle] / Math.max(.48, params.formantShift);
    const form3 = [2.7, 3.12, 2.35, 3.45, 2.92][vowelCycle] * Math.max(0.55, params.formantShift + params.harshnessAmount * 0.04);
    const vowelRoll = Math.sin(phase3) * params.liltAmount * 0.055;
    const sub = Math.sin(phase4) * params.subharmonicMix * (0.32 + params.weightAmount * 0.12);
    const growl = (Math.sin(phase2) + Math.sin(phase2 * 0.501)) * (params.roughnessAmount * 0.075 + params.growlMix * 0.09);
    const airScrape = rand() * (params.breathNoiseMix * 0.044 + params.airAmount * 0.034 + params.harshnessAmount * 0.026);
    const brightRasp = Math.sin(phase * form3) * params.harshnessAmount * 0.045;
    let voiced = Math.sin(phase) * (0.52 + params.warmth * 0.08) + Math.sin(phase * form1) * .24 + Math.sin(phase * form2) * .13 + brightRasp + growl + sub + vowelRoll;
    const breath = rand() * params.breathNoiseMix * (0.045 + params.airAmount * 0.035);
    const nasal = Math.sin(phase * 2.8) * params.nasality * .085;
    const consonantClick = (local < 0.035 + params.harshnessAmount * 0.016 ? rand() * params.articulationPrecision * params.emphasis * (.085 + params.harshnessAmount * 0.05) : 0);
    let sample = (voiced + breath + airScrape + nasal + consonantClick) * env * (0.74 + params.weightAmount * 0.16);
    if (params.harshnessAmount > 0.35) sample = Math.tanh(sample * (1 + params.harshnessAmount * 1.7)) / (1 + params.harshnessAmount * 0.22);
    sample = sample * (1 - params.growlMix * 0.055) + lastSample * params.growlMix * 0.055;
    lastSample = sample;
    data[i] = sample;
  }
  normalizeSamples(data);
  const wavBlob = encodeWav(data, sampleRate);
  return { wavBlob, samples: data, sampleRate, duration: seconds, rangeVersion: params.rangeVersion };
}

function downloadBlob(blob, filename) {
  if (!blob) throw new Error('Nothing has been generated yet.');
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 800);
}

async function blobToBase64(blob) {
  const buffer = await blob.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function postBackendTo(url, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), window.VOICE_STUDIO_CONFIG.requestTimeoutMs);
  try {
    const res = await fetch(url || window.VOICE_STUDIO_CONFIG.backendUrl, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const text = await res.text();
    try { return JSON.parse(text); } catch { return { ok: res.ok, raw: text }; }
  } finally {
    clearTimeout(timeout);
  }
}

async function postBackend(payload) {
  return postBackendTo(window.VOICE_STUDIO_CONFIG.audioEditingBackendUrl || window.VOICE_STUDIO_CONFIG.backendUrl, payload);
}

async function postAccentBackend(payload) {
  return postBackendTo(window.VOICE_STUDIO_CONFIG.accentBackendUrl, payload);
}

async function backendConvertAudio(targetFormat) {
  if (!currentOutput.wavBlob) throw new Error('Generate or load audio before converting.');
  const payload = buildGenerationPayload({
    action: 'exportAudio',
    targetFormat,
    sourceFormat: 'wav',
    audioBase64: await blobToBase64(currentOutput.wavBlob)
  });
  validateSafetyGate(payload);
  const result = await postBackend(payload);
  if (!result || result.ok === false) throw new Error(result?.error || 'Backend conversion failed.');
  const data = result.audioBase64 || result.mp3Base64 || result.wavBase64;
  if (!data) throw new Error('Backend did not return audioBase64.');
  const mime = targetFormat === 'mp3' ? 'audio/mpeg' : 'audio/wav';
  const bytes = Uint8Array.from(atob(data), c => c.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}
