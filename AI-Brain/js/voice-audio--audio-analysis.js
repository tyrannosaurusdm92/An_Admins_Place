/* Genericized for AI-Brain capability use. Provenance group: voice-persona-creator. */
async function decodeAudioFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
  await ctx.close?.();
  return decoded;
}

function mixToMono(audioBuffer) {
  const length = audioBuffer.length;
  const channels = audioBuffer.numberOfChannels;
  const mono = new Float32Array(length);
  for (let c = 0; c < channels; c++) {
    const data = audioBuffer.getChannelData(c);
    for (let i = 0; i < length; i++) mono[i] += data[i] / channels;
  }
  return mono;
}

function autocorrelationPitch(frame, sampleRate) {
  let rms = 0;
  for (let i = 0; i < frame.length; i++) rms += frame[i] * frame[i];
  rms = Math.sqrt(rms / frame.length);
  if (rms < 0.01) return 0;
  const minLag = Math.floor(sampleRate / 450);
  const maxLag = Math.floor(sampleRate / 70);
  let bestLag = 0, best = -Infinity;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < frame.length - lag; i++) sum += frame[i] * frame[i + lag];
    if (sum > best) { best = sum; bestLag = lag; }
  }
  return bestLag ? sampleRate / bestLag : 0;
}

function analyzePcm(mono, sampleRate) {
  const frameSize = Math.floor(sampleRate * 0.04);
  const hop = Math.floor(frameSize / 2);
  const pitches = [], energies = [], zcrs = [];
  for (let start = 0; start + frameSize < mono.length; start += hop) {
    const frame = mono.subarray(start, start + frameSize);
    let energy = 0, zc = 0;
    for (let i = 0; i < frame.length; i++) {
      energy += frame[i] * frame[i];
      if (i && Math.sign(frame[i]) !== Math.sign(frame[i - 1])) zc++;
    }
    energy = Math.sqrt(energy / frame.length);
    energies.push(energy);
    zcrs.push(zc / frame.length);
    const f0 = autocorrelationPitch(frame, sampleRate);
    if (f0) pitches.push(f0);
  }
  const avg = arr => arr.length ? arr.reduce((a,b)=>a+b,0) / arr.length : 0;
  const variance = arr => {
    const m = avg(arr); return arr.length ? avg(arr.map(x => (x - m) ** 2)) : 0;
  };
  const sortedEnergy = [...energies].sort((a,b)=>a-b);
  const active = sortedEnergy.filter(e => e > (sortedEnergy[Math.floor(sortedEnergy.length * .35)] || 0.003));
  const duration = mono.length / sampleRate;
  const silenceRatio = energies.length ? energies.filter(e => e < 0.008).length / energies.length : 0;
  const avgPitch = avg(pitches) || 120;
  const pitchSd = Math.sqrt(variance(pitches));
  const zcr = avg(zcrs);
  const roughnessProxy = Math.min(1, zcr * 38);
  const breathProxy = Math.min(1, avg(active) < 0.035 ? .65 : Math.max(0, zcr * 14 - .1));
  const result = {
    sampleRate, duration,
    f0: Number(avgPitch.toFixed(2)),
    pitchRange: Number(Math.min(36, pitchSd / 4).toFixed(2)),
    speechRate: Number(Math.max(.4, Math.min(2.2, active.length / Math.max(1, duration) / 9)).toFixed(2)),
    pauseDensity: Number(silenceRatio.toFixed(3)),
    breathNoiseMix: Number(breathProxy.toFixed(3)),
    roughnessAmount: Number(roughnessProxy.toFixed(3)),
    formantShift: 1.0,
    articulationPrecision: Number(Math.max(.2, Math.min(1, 1 - silenceRatio * .3)).toFixed(3)),
    nasality: Number(Math.min(1, zcr * 9).toFixed(3)),
    projection: Number(Math.min(1, avg(active) * 18).toFixed(3)),
    warmth: Number(Math.max(.1, 1 - zcr * 12).toFixed(3)),
    clarity: Number(Math.max(.2, Math.min(1, avg(active) * 20 - silenceRatio * .1)).toFixed(3)),
    humanVariation: Number(Math.min(1, pitchSd / 80 + Math.sqrt(variance(energies)) * 12).toFixed(3))
  };
  return result;
}

function analysisToSliderHints(analysis) {
  return {
    pitch: Math.max(0, Math.min(10, 5 + Math.log2((analysis.f0 || 120) / 120) * 5)),
    speed: Math.max(0, Math.min(10, (analysis.speechRate - .65) / 1.15 * 10)),
    inflection: Math.max(0, Math.min(10, (analysis.pitchRange || 2) / 22)),
    breath: Math.max(0, Math.min(10, (analysis.breathNoiseMix || 0) * 10)),
    roughness: Math.max(0, Math.min(10, (analysis.roughnessAmount || 0) * 10)),
    nasality: Math.max(0, Math.min(10, (analysis.nasality || .5) * 10)),
    projection: Math.max(0, Math.min(10, (analysis.projection || .5) * 10)),
    warmth: Math.max(0, Math.min(10, (analysis.warmth || .5) * 10)),
    clarity: Math.max(0, Math.min(10, (analysis.clarity || .6) * 10)),
    humanVariation: Math.max(0, Math.min(10, (analysis.humanVariation || .5) * 10))
  };
}
