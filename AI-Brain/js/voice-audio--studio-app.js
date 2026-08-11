/* Genericized for AI-Brain capability use. Provenance group: voice-persona-creator. */
const $ = id => document.getElementById(id);
let recordedChunks = [];
let recorder = null;
let uploadedOrRecordedFile = null;
let lastAnalysis = null;

function logStatus(message, data) {
  const stamp = new Date().toLocaleTimeString();
  $('statusLog').textContent = `[${stamp}] ${message}` + (data ? `\n${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}` : '') + '\n\n' + $('statusLog').textContent;
}

function renderSliders() {
  const wrap = $('sliderContainer');
  wrap.innerHTML = '';
  for (const s of VOICE_SLIDER_SCHEMA) {
    const card = document.createElement('div');
    card.className = 'slider-card';
    card.innerHTML = `<div class="slider-head"><strong>${s.label}</strong><span id="value_${s.key}">${formatSliderValue(s, s.default)}</span></div>
      <input type="range" id="slider_${s.key}" min="${s.min}" max="${s.max}" step="${s.step}" value="${s.default}" />
      <small>${s.controls}</small>`;
    wrap.appendChild(card);
    card.querySelector('input').addEventListener('input', () => {
      const val = Number(card.querySelector('input').value);
      $(`value_${s.key}`).textContent = formatSliderValue(s, val);
      updateProfileJson();
    });
  }
}

function updateProfileJson() {
  const payload = buildGenerationPayload({ analysis: lastAnalysis });
  $('profileJson').textContent = JSON.stringify(payload, null, 2);
}

async function checkBackend() {
  const checks = [];
  try {
    const result = await postBackend({ action: 'ping', app: 'Universal Vocal Acapella Studio', route: 'audioEditing' });
    checks.push(result?.ok === false ? 'MP3/editing: warning' : 'MP3/editing: connected');
  } catch (err) {
    checks.push('MP3/editing: fallback');
    logStatus('MP3/editing backend ping did not complete. Local WAV/JSON preview still works; MP3 conversion needs backend support.', err.message);
  }
  try {
    const result = await postAccentBackend({ action: 'ping', app: 'Universal Vocal Acapella Studio', route: 'accentVoice' });
    checks.push(result?.ok === false ? 'accent: warning' : 'accent: connected');
  } catch (err) {
    checks.push('accent: fallback');
    logStatus('Accent backend ping did not complete. Accent profile payloads will still be included for the audio backend.', err.message);
  }
  $('backendStatus').textContent = 'Backends — ' + checks.join(' | ');
}

function setPlayerBlob(blob) {
  if (currentOutput.objectUrl) URL.revokeObjectURL(currentOutput.objectUrl);
  currentOutput.objectUrl = URL.createObjectURL(blob);
  $('player').src = currentOutput.objectUrl;
}

async function analyzeCurrentAudio() {
  if (!uploadedOrRecordedFile) throw new Error('Upload or record a vocal MP3/WAV first.');
  const audioBuffer = await decodeAudioFile(uploadedOrRecordedFile);
  const mono = mixToMono(audioBuffer);
  const analysis = analyzePcm(mono, audioBuffer.sampleRate);
  lastAnalysis = analysis;
  const hints = analysisToSliderHints(analysis);
  setSliderProfile({ ...getSliderProfile(), ...hints });
  updateProfileJson();
  logStatus('Voice analysis complete and slider hints applied.', analysis);
}

async function generateLocalPreview() {
  const payload = buildGenerationPayload();
  validateSafetyGate(payload);
  const rendered = await renderLocalVoicePreview(payload.prompt || 'this is what I sound like', payload.voiceProfile);
  currentOutput.wavBlob = rendered.wavBlob;
  currentOutput.mp3Blob = null;
  currentOutput.json = buildGenerationPayload({ localPreview: true, rendered: { duration: rendered.duration, sampleRate: rendered.sampleRate }, analysis: lastAnalysis });
  setPlayerBlob(rendered.wavBlob);
  logStatus('Local vocal-only preview generated as WAV. Use backend for model-quality voice/acapella generation and MP3 conversion.', currentOutput.json);
  updateProfileJson();
}

async function generateWithBackend() {
  const extra = { analysis: lastAnalysis };
  if (uploadedOrRecordedFile) {
    extra.uploadedAudio = {
      name: uploadedOrRecordedFile.name || 'recorded_voice.webm',
      type: uploadedOrRecordedFile.type || 'audio/webm',
      base64: await blobToBase64(uploadedOrRecordedFile)
    };
  }
  let accentResult = null;
  try {
    accentResult = await postAccentBackend({
      action: 'accentVoiceProfileResolve',
      source: 'Universal merged Vocal + Acapella Studio',
      race: document.getElementById('race')?.value || '',
      gender: document.getElementById('gender')?.value || '',
      personality: document.getElementById('personality')?.value || '',
      biome: document.getElementById('biome')?.value || '',
      emotion: document.getElementById('emotion')?.value || 'Neutral/Base',
      promptPreview: sanitizeVocalPrompt(document.getElementById('lyrics')?.value || '').slice(0, 500),
      route: 'accentVoice'
    });
    logStatus('Accent backend profile pass completed.', accentResult);
  } catch (err) {
    logStatus('Accent backend profile pass skipped/failed; audio backend will still run.', err.message);
  }
  const payload = buildGenerationPayload({ ...extra, accentBackendResult: accentResult });
  validateSafetyGate(payload);
  logStatus('Sending vocal-only generation request to MP3/editing backend…');
  const result = await postBackend(payload);
  if (!result || result.ok === false) throw new Error(result?.error || 'Backend generation failed.');
  const wavData = result.wavBase64 || result.audioWavBase64;
  const mp3Data = result.mp3Base64 || (result.format === 'mp3' ? result.audioBase64 : null);
  const genericData = result.audioBase64 && !mp3Data ? result.audioBase64 : null;
  if (wavData) currentOutput.wavBlob = new Blob([Uint8Array.from(atob(wavData), c => c.charCodeAt(0))], {type:'audio/wav'});
  if (mp3Data) currentOutput.mp3Blob = new Blob([Uint8Array.from(atob(mp3Data), c => c.charCodeAt(0))], {type:'audio/mpeg'});
  if (genericData && !currentOutput.wavBlob) currentOutput.wavBlob = new Blob([Uint8Array.from(atob(genericData), c => c.charCodeAt(0))], {type: result.mimeType || 'audio/wav'});
  currentOutput.json = { ...payload, backendResult: { ...result, audioBase64: undefined, wavBase64: undefined, mp3Base64: undefined } };
  if (currentOutput.mp3Blob) setPlayerBlob(currentOutput.mp3Blob);
  else if (currentOutput.wavBlob) setPlayerBlob(currentOutput.wavBlob);
  logStatus('Backend generation complete.', currentOutput.json.backendResult);
  updateProfileJson();
}

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recordedChunks = [];
  const options = MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } : undefined;
  recorder = new MediaRecorder(stream, options);
  recorder.ondataavailable = ev => { if (ev.data.size) recordedChunks.push(ev.data); };
  recorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: recorder.mimeType || 'audio/webm' });
    uploadedOrRecordedFile = new File([blob], 'recorded_voice.webm', { type: blob.type });
    setPlayerBlob(blob);
    logStatus('Recording captured. You can analyze it or send it to the backend.');
    stream.getTracks().forEach(t => t.stop());
  };
  recorder.start();
  $('recordBtn').disabled = true;
  $('stopRecordBtn').disabled = false;
  logStatus('Recording started…');
}

function stopRecording() {
  if (recorder && recorder.state !== 'inactive') recorder.stop();
  $('recordBtn').disabled = false;
  $('stopRecordBtn').disabled = true;
}

function safeFileBase() {
  const mode = $('mode').value;
  const emotion = ($('emotion').value || 'neutral').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return `${window.VOICE_STUDIO_CONFIG.defaultOutputBaseName}_${mode}_${emotion}`;
}

window.addEventListener('DOMContentLoaded', () => {
  renderSliders();
  updateProfileJson();
  checkBackend();
  document.querySelectorAll('input, textarea, select').forEach(el => el.addEventListener('change', updateProfileJson));
  $('audioFile').addEventListener('change', ev => {
    uploadedOrRecordedFile = ev.target.files?.[0] || null;
    if (uploadedOrRecordedFile) {
      setPlayerBlob(uploadedOrRecordedFile);
      logStatus(`Loaded ${uploadedOrRecordedFile.name}.`);
    }
  });
  $('recordBtn').addEventListener('click', () => startRecording().catch(err => logStatus('Recording failed.', err.message)));
  $('stopRecordBtn').addEventListener('click', stopRecording);
  $('analyzeBtn').addEventListener('click', () => analyzeCurrentAudio().catch(err => logStatus('Analysis failed.', err.message)));
  $('localPreviewBtn').addEventListener('click', () => generateLocalPreview().catch(err => logStatus('Local preview failed.', err.message)));
  $('backendGenerateBtn').addEventListener('click', () => generateWithBackend().catch(err => logStatus('Backend generation failed.', err.message)));
  $('resetBtn').addEventListener('click', () => { setSliderProfile(defaultVoiceProfile()); updateProfileJson(); logStatus('Sliders reset.'); });
  document.querySelectorAll('[data-seek]').forEach(btn => btn.addEventListener('click', () => { $('player').currentTime = Math.max(0, $('player').currentTime + Number(btn.dataset.seek)); }));
  $('pauseBtn').addEventListener('click', () => $('player').pause());
  $('stopBtn').addEventListener('click', () => { $('player').pause(); $('player').currentTime = 0; });
  $('downloadWavBtn').addEventListener('click', () => downloadBlob(currentOutput.wavBlob || currentOutput.blob, `${safeFileBase()}.wav`));
  $('downloadMp3Btn').addEventListener('click', async () => {
    try {
      if (!currentOutput.mp3Blob) currentOutput.mp3Blob = await backendConvertAudio('mp3');
      downloadBlob(currentOutput.mp3Blob, `${safeFileBase()}.mp3`);
    } catch (err) { logStatus('MP3 export failed. Backend conversion is required unless the backend returned MP3 directly.', err.message); }
  });
  $('downloadJsonBtn').addEventListener('click', () => {
    const json = currentOutput.json || buildGenerationPayload({ analysis: lastAnalysis });
    downloadBlob(new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' }), `${safeFileBase()}.json`);
  });
});
