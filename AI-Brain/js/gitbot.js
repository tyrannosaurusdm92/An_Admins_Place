(() => {
  const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbzoGmgKoNq_d-KorQsuBYYeJYQ0pAVk4a7Y3zFxdJncbU7GlMK_Dg2irgbR1zPfyiPr4g/exec';
  let lastVoice = null;
  const $ = id => document.getElementById(id);
  function show(el, data){ el.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2); }
  function addMsg(role, text){ const div=document.createElement('div'); div.className='msg '+(role==='user'?'user':'bot'); div.textContent=(role==='user'?'You':'gitbot')+':\n'+text; $('chatLog').appendChild(div); $('chatLog').scrollTop=$('chatLog').scrollHeight; }
  async function api(payload){
    payload = { ...payload };
    if (!payload.action) payload.action = 'health';
    const body = new URLSearchParams({ payload: JSON.stringify(payload) });
    const res = await fetch(BACKEND_URL, { method: 'POST', body });
    const text = await res.text();
    try { return JSON.parse(text); } catch { return { ok:false, raw:text }; }
  }
  $('setupBtn').onclick = async () => alert(JSON.stringify(await api({action:'setup'}), null, 2));
  $('chatForm').onsubmit = async ev => { ev.preventDefault(); const text=$('chatInput').value.trim(); if(!text) return; $('chatInput').value=''; addMsg('user', text); const r=await api({action:'bot.chat', message:text}); addMsg('bot', r.reply || r.error || JSON.stringify(r)); };
  $('scanBtn').onclick = async () => { show($('scanOut'),'Scanning...'); const r=await api({action:'github.scan', repository:$('repoInput').value.trim(), branch:$('branchInput').value.trim(), maxFiles:Number($('maxFilesInput').value||40)}); show($('scanOut'), r); };
  $('scanAllBtn').onclick = async () => { show($('scanOut'),'Scanning all repos...'); const r=await api({action:'github.scan', allRepos:true, maxFiles:Number($('maxFilesInput').value||40)}); show($('scanOut'), r); };
  async function indexFiles(files){ for (const file of files){ const text = await file.text().catch(()=>null); if(text == null){ show($('fileOut'), 'Could not read '+file.name); continue; } const r=await api({action:'file.indexText', name:file.name, text, source:'frontend-upload'}); show($('fileOut'), r); } }
  $('fileInput').onchange = e => indexFiles([...e.target.files]);
  const dz=$('dropZone'); ['dragenter','dragover'].forEach(evt=>dz.addEventListener(evt,e=>{e.preventDefault();dz.classList.add('drag')})); ['dragleave','drop'].forEach(evt=>dz.addEventListener(evt,e=>{e.preventDefault();dz.classList.remove('drag')})); dz.addEventListener('drop', e => indexFiles([...e.dataTransfer.files]));
  function voicePayload(action='voice.simulate'){ return { action, text:$('voiceText').value, accentName:$('accentName').value, sliders:{ pitch:+$('pitch').value, speed:+$('speed').value, breath:+$('breath').value, roughness:+$('roughness').value, accent:+$('accent').value, clarity:+$('clarity').value } }; }
  $('voiceBtn').onclick = async () => { const r=await api(voicePayload()); lastVoice=r; show($('voiceOut'), r); };
  $('voiceJobBtn').onclick = async () => { const r=await api(voicePayload('voice.job.create')); lastVoice=r.simulation || r; show($('voiceOut'), r); };
  $('speakBtn').onclick = () => { const sim = lastVoice || { webSpeech:{rate:1,pitch:1,volume:1} }; const u = new SpeechSynthesisUtterance($('voiceText').value); Object.assign(u, sim.webSpeech || {}); speechSynthesis.cancel(); speechSynthesis.speak(u); };
  $('taskBtn').onclick = async () => show($('taskOut'), await api({action:'tasks.fromText', text:$('taskText').value}));
  $('taskListBtn').onclick = async () => show($('taskOut'), await api({action:'tasks.list', status:'open'}));
  addMsg('bot','I am gitbot. Ask me to scan GitHub, inspect code, handle tasks, or simulate a voice profile.');
})();
