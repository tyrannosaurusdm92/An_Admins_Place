/* AI-Brain generic capability extraction. Source group: legacy-capability-patterns. Original UI shell omitted; embedded logic retained. */

(function(){if(window.__bdgSharedNavInstalled)return;window.__bdgSharedNavInstalled=true;document.body.classList.add('bdg-has-global-nav');var page=(location.pathname.split('/').pop()||'index.html').toLowerCase();document.querySelectorAll('#bd-global-dropdown-nav .bdg-link').forEach(function(a){if((a.getAttribute('href')||'').toLowerCase()===page){a.classList.add('bdg-current');a.setAttribute('aria-current','page');}});function clampPos(el,x,y){var r=el.getBoundingClientRect();var maxX=Math.max(0,window.innerWidth-r.width-8);var maxY=Math.max(0,window.innerHeight-r.height-8);return{x:Math.min(Math.max(8,x),maxX),y:Math.min(Math.max(8,y),maxY)}}function restorePos(el,key,def){try{var p=JSON.parse(localStorage.getItem(key)||'null');if(p){el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.right='auto';el.style.bottom='auto'}else if(def){Object.assign(el.style,def)}}catch(e){}}function makeDrag(handle,el,key){var sx=0,sy=0,ox=0,oy=0,moved=false;if(!handle||!el)return;handle.addEventListener('pointerdown',function(ev){moved=false;var r=el.getBoundingClientRect();sx=ev.clientX;sy=ev.clientY;ox=r.left;oy=r.top;handle.setPointerCapture(ev.pointerId);ev.preventDefault()});handle.addEventListener('pointermove',function(ev){if(!handle.hasPointerCapture(ev.pointerId))return;var nx=ox+(ev.clientX-sx),ny=oy+(ev.clientY-sy);if(Math.abs(ev.clientX-sx)+Math.abs(ev.clientY-sy)>3)moved=true;var p=clampPos(el,nx,ny);el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.right='auto';el.style.bottom='auto'});handle.addEventListener('pointerup',function(ev){if(handle.hasPointerCapture(ev.pointerId))handle.releasePointerCapture(ev.pointerId);var r=el.getBoundingClientRect();try{localStorage.setItem(key,JSON.stringify({x:r.left,y:r.top}))}catch(e){};if(moved){ev.preventDefault();ev.stopPropagation()}},true)}var nav=document.getElementById('bd-global-dropdown-nav'),bubble=document.getElementById('bd-nav-bubble');restorePos(nav,'bdgNavPos');restorePos(bubble,'bdgBubblePos',{left:'14px',bottom:'14px'});makeDrag(document.querySelector('#bd-global-dropdown-nav .bdg-drag-handle'),nav,'bdgNavPos');makeDrag(document.querySelector('#bd-nav-bubble .bdg-bubble-core'),bubble,'bdgBubblePos');document.getElementById('bdg-hide-nav')?.addEventListener('click',function(){document.body.classList.add('bdg-nav-hidden');try{localStorage.setItem('bdgNavHidden','1')}catch(e){}});document.getElementById('bdg-show-nav')?.addEventListener('click',function(){document.body.classList.remove('bdg-nav-hidden');try{localStorage.setItem('bdgNavHidden','0')}catch(e){}});try{if(localStorage.getItem('bdgNavHidden')==='1')document.body.classList.add('bdg-nav-hidden')}catch(e){}window.addEventListener('resize',function(){[nav,bubble].forEach(function(el){if(!el)return;var r=el.getBoundingClientRect();var p=clampPos(el,r.left,r.top);el.style.left=p.x+'px';el.style.top=p.y+'px';el.style.right='auto';el.style.bottom='auto'})});var meaningfulSelector='.panel,.card,.doc-card,.focus-box,.mini-panel,.sidebar,.drawer,.box,.window,.hud,.legend,.modal,.dialog,[data-panel],[data-window],[role="dialog"]';var tray=document.getElementById('bd-unhide-tray'),list=document.getElementById('bd-unhide-list'),count=document.getElementById('bd-unhide-count');function labelFor(el,i){var h=el.querySelector&&el.querySelector('h1,h2,h3,h4,.title,.panel-title,.section-title,[aria-label]');var t=(el.getAttribute('aria-label')||el.getAttribute('data-title')||(h&&(h.textContent||h.getAttribute('aria-label')))||el.id||el.className||'Panel').toString().trim().replace(/\s+/g,' ');return t.slice(0,46)||('Panel '+(i+1))}function isHidden(el){if(!el||el.id==='bd-unhide-tray'||el.closest&&(el.closest('#bd-unhide-tray')||el.closest('#bd-global-dropdown-nav')||el.closest('#bd-nav-bubble')))return false;var cs=getComputedStyle(el);return el.hidden||cs.display==='none'||cs.visibility==='hidden'||el.classList.contains('hidden')||el.classList.contains('is-hidden')}function showEl(el){try{el.hidden=false;el.removeAttribute('hidden');el.style.display='';el.style.visibility='';el.style.opacity='';el.classList.remove('hidden','is-hidden','closed','collapsed');if(getComputedStyle(el).display==='none')el.style.display='block';el.scrollIntoView({block:'nearest',inline:'nearest'})}catch(e){}refresh()}function refresh(){if(!list)return;list.innerHTML='';var found=[];document.querySelectorAll(meaningfulSelector).forEach(function(el){if(isHidden(el)&&found.indexOf(el)<0)found.push(el)});count.textContent=found.length;tray.style.display='block';if(!found.length){var none=document.createElement('span');none.style.opacity='.78';none.style.padding='7px';none.textContent='No hidden panels detected.';list.appendChild(none);return}found.slice(0,60).forEach(function(el,i){var b=document.createElement('button');b.type='button';b.textContent='Unhide: '+labelFor(el,i);b.addEventListener('click',function(){showEl(el)});list.appendChild(b)})}document.addEventListener('click',function(ev){var b=ev.target.closest&&ev.target.closest('button,a,[role="button"]');if(!b)return;var txt=(b.textContent||b.getAttribute('aria-label')||b.title||'').toLowerCase();if(/\b(hide|close|collapse|minimize|dismiss)\b|×|✕|✖/.test(txt))setTimeout(refresh,80)},true);document.getElementById('bd-unhide-all')?.addEventListener('click',function(){document.querySelectorAll(meaningfulSelector).forEach(function(el){if(isHidden(el))showEl(el)});refresh()});new MutationObserver(function(){clearTimeout(window.__bdgUnhideTimer);window.__bdgUnhideTimer=setTimeout(refresh,120)}).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['class','style','hidden','aria-hidden']});refresh()})();



(() => {
  'use strict';

  const STORAGE_KEY = 'universal_character_portal_v2';
  const LEGACY_STORAGE_KEY = 'universal_character_portal_v1';
  const SESSION_KEY = 'universal_character_session_v2';
  const LEGACY_SESSION_KEY = 'universal_character_session_v1';
  const MAX_SHEETS = 3;

  const $ = (id) => document.getElementById(id);
  const screens = ['home', 'profile', 'uploader', 'viewer', 'editor'];

  const demoSheet = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Universal Demo Character Sheet</title>
<style>
  body{font-family:Georgia,serif;margin:0;padding:18px;background:#f7f2e8;color:#211a12;}
  .sheet{max-width:900px;margin:0 auto;background:#fff;border:1px solid #d2c4ad;border-radius:16px;padding:18px;box-shadow:0 12px 40px rgba(0,0,0,.1);}
  h1,h2{margin:0 0 12px;}
  .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;}
  .box{border:1px solid #d8cbb5;border-radius:12px;padding:12px;background:#fcfaf6;}
  label{display:block;font-weight:700;font-size:.92rem;margin-bottom:4px;}
  input,textarea,select{width:100%;box-sizing:border-box;border:1px solid #cdbfa8;border-radius:10px;padding:10px;font:inherit;background:#fff;}
  textarea{min-height:110px;resize:vertical;}
  .wide{grid-column:1/-1;}
  button{border:0;border-radius:10px;padding:10px 12px;font-weight:700;cursor:pointer;background:#3d9fa0;color:#fff;}
  .result{padding:12px;border-radius:10px;background:#f3efe6;border:1px solid #d8cbb5;min-height:48px;}
  @media(max-width:720px){.grid{grid-template-columns:1fr;}}
</style>
</head>
<body>
  <main class="sheet">
    <h1>Demo Character Sheet</h1>
    <p>This is a starter sheet for testing the portal. Uploaded sheets with inputs, textareas, selects, checkboxes, radio buttons, and editable text will save their current values.</p>
    <div class="grid">
      <div class="box"><label>Character Name</label><input name="characterName" value="Captain Ash Vale"></div>
      <div class="box"><label>Class</label><input name="class" value="Clockwork Ranger"></div>
      <div class="box"><label>Level</label><input name="level" type="number" value="5"></div>
      <div class="box"><label>Strength</label><input name="str" type="number" value="14"></div>
      <div class="box"><label>Dexterity</label><input name="dex" type="number" value="18"></div>
      <div class="box"><label>Intelligence</label><input name="int" type="number" value="12"></div>
      <div class="box wide"><label>Notes</label><textarea name="notes">Built for swordplay, scouting, and suspiciously dramatic entrances.</textarea></div>
      <div class="box wide">
        <label>Dice Roller</label>
        <input id="expr" value="1d20+3" style="max-width:160px;">
        <button type="button" data-roll="expr" data-roll-output="result">Roll</button>
        <div id="result" class="result">No roll yet.</div>
      </div>
    </div>
  </main>
</body>
</html>`;

  const state = {
    history: [],
    currentScreen: 'home',
    data: loadData(),
    user: null,
    currentSheetId: null,
    usernameManual: false,
    creatorSourceVisible: false
  };

  function normalizeEmail(email){ return String(email || '').trim().toLowerCase(); }
  function safeText(value){ return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function uid(){ return (crypto.randomUUID ? crypto.randomUUID() : `sheet-${Date.now()}-${Math.random().toString(16).slice(2)}`); }
  function slugPart(value){ return String(value || '').toLowerCase().replace(/@.*$/, '').replace(/[^a-z0-9]+/g, '').slice(0, 32); }

  function loadData(){
    const blank = { accounts:{}, sheetsByUser:{} };
    for (const key of [STORAGE_KEY, LEGACY_STORAGE_KEY]) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        return {
          accounts: parsed.accounts || {},
          sheetsByUser: parsed.sheetsByUser || {}
        };
      } catch (_) {}
    }
    return blank;
  }
  function saveData(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data)); }
  function loadSession(){
    for (const key of [SESSION_KEY, LEGACY_SESSION_KEY]) {
      try {
        const session = JSON.parse(localStorage.getItem(key) || 'null');
        if (session && session.email) return { email: normalizeEmail(session.email) };
      } catch (_) {}
    }
    return null;
  }
  function saveSession(user){
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify({ email: normalizeEmail(user.email) }));
    else localStorage.removeItem(SESSION_KEY);
  }

  function findAccountByEmail(email){ return state.data.accounts[normalizeEmail(email)] || null; }
  function findAccountByUsername(username){
    const target = slugPart(username);
    if (!target) return null;
    return Object.values(state.data.accounts).find(acc => slugPart(acc.username) === target) || null;
  }
  function findAccountByIdentifier(identifier){
    const value = String(identifier || '').trim();
    if (!value) return null;
    return value.includes('@') ? findAccountByEmail(value) : findAccountByUsername(value);
  }
  function generateUsername(email, nickname){ return slugPart(nickname) || slugPart(email) || 'player'; }
  function ensureUniqueUsername(base, ignoreEmail=''){
    const root = slugPart(base) || 'player';
    let candidate = root;
    let n = 1;
    const ignore = normalizeEmail(ignoreEmail);
    while (Object.values(state.data.accounts).some(acc => normalizeEmail(acc.email) !== ignore && slugPart(acc.username) === slugPart(candidate))) {
      n += 1;
      candidate = `${root}${n}`;
    }
    return candidate.slice(0, 32);
  }

  async function hashPassword(password, salt){
    const bytes = new TextEncoder().encode(`${salt}:${password}`);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,'0')).join('');
  }
  function newSalt(){ return Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2,'0')).join(''); }
  async function passwordRecord(password){ const salt = newSalt(); return { salt, passwordHash: await hashPassword(password, salt) }; }
  async function verifyPassword(password, account){
    if (!account) return false;
    if (!account.salt && account.passwordHash) return account.passwordHash === await hashPassword(password, '');
    return account.passwordHash === await hashPassword(password, account.salt || '');
  }

  function getUserSheets(email){ return state.data.sheetsByUser[normalizeEmail(email)] || []; }
  function setUserSheets(email, sheets){ state.data.sheetsByUser[normalizeEmail(email)] = sheets; saveData(); }
  function currentAccount(){ return state.user ? findAccountByEmail(state.user.email) : null; }
  function currentSheet(){
    if (!state.user) return null;
    const sheets = getUserSheets(state.user.email);
    if (!sheets.length) { state.currentSheetId = null; return null; }
    if (!state.currentSheetId || !sheets.some(s => s.id === state.currentSheetId)) state.currentSheetId = sheets[0].id;
    return sheets.find(s => s.id === state.currentSheetId) || sheets[0];
  }

  function setBodyMode(screen){
    document.body.classList.remove('homepage','quick-quiz','deep-quiz','results');
    if (screen === 'home') document.body.classList.add('homepage');
    else if (screen === 'editor') document.body.classList.add('deep-quiz');
    else if (screen === 'profile') document.body.classList.add('results');
    else document.body.classList.add('quick-quiz');
    document.body.classList.add('bdg-has-global-nav');
  }
  function authLabel(){
    if (!state.user) return 'Sign in to manage character sheets';
    const acc = currentAccount();
    return `Signed in as ${state.user.email}${acc?.username ? ` @${acc.username}` : ''}`;
  }
  function updateNavState(){
    $('statusLine').textContent = authLabel();
    $('navHome').classList.toggle('hidden', state.currentScreen === 'home');
    $('navBack').disabled = state.history.length === 0;
    const logged = !!state.user;
    ['navProfile','navUploader','navEditor','navViewer'].forEach(id => { if ($(id)) $(id).disabled = !logged; });
  }
  function switchScreen(screen, push=true){
    if (!screens.includes(screen)) return;
    if (push && state.currentScreen && state.currentScreen !== screen) state.history.push(state.currentScreen);
    state.currentScreen = screen;
    setBodyMode(screen);
    screens.forEach(s => $(`screen-${s}`)?.classList.toggle('active', s === screen));
    updateNavState();
    updateProfileText();
    renderProfile();
    renderUploadList();
    updateSheetPickers();
    if (screen === 'viewer') renderSheet('viewer');
    if (screen === 'editor') renderSheet('editor');
  }

  function updateProfileText(){
    const acc = currentAccount();
    const sheets = state.user ? getUserSheets(state.user.email) : [];
    $('profileWelcome').textContent = state.user ? `Signed in as ${state.user.email}${acc?.username ? ` @${acc.username}` : ''}.` : 'Sign in to manage your sheets.';
    $('profileStats').textContent = state.user ? `You have ${sheets.length} saved character sheet${sheets.length === 1 ? '' : 's'}. Up to ${MAX_SHEETS} are allowed.` : 'No account loaded.';
  }
  function sheetCard(sheet){
    return `<div class="sheet-item">
      <div><strong>${safeText(sheet.name)}</strong><div class="sheet-meta">Saved ${safeText(new Date(sheet.modifiedAt).toLocaleString())}</div></div>
      <div class="sheet-actions">
        <button class="ghost" type="button" data-open-sheet="${safeText(sheet.id)}" data-target="viewer">Open</button>
        <button class="ghost" type="button" data-open-sheet="${safeText(sheet.id)}" data-target="editor">Edit</button>
        <button class="ghost" type="button" data-download-sheet="${safeText(sheet.id)}">Export</button>
        <button class="ghost" type="button" data-delete-sheet="${safeText(sheet.id)}">Delete</button>
      </div>
    </div>`;
  }
  function renderProfile(){
    const list = $('sheetList');
    if (!list) return;
    if (!state.user) { list.innerHTML = '<div class="muted">No account yet.</div>'; return; }
    const sheets = getUserSheets(state.user.email);
    list.innerHTML = sheets.length ? sheets.map(sheetCard).join('') : '<div class="muted">No character sheets uploaded yet.</div>';
  }
  function renderUploadList(){
    const list = $('uploadList');
    if (!list) return;
    if (!state.user) { list.innerHTML = '<div class="muted">Sign in first.</div>'; return; }
    const sheets = getUserSheets(state.user.email);
    list.innerHTML = sheets.length ? sheets.map(sheetCard).join('') : '<div class="muted">No uploaded files yet.</div>';
  }
  function updateSheetPickers(){
    const sheets = state.user ? getUserSheets(state.user.email) : [];
    for (const id of ['viewerSelect','editorSelect']) {
      const select = $(id);
      if (!select) continue;
      select.innerHTML = sheets.length
        ? sheets.map(s => `<option value="${safeText(s.id)}">${safeText(s.name)}</option>`).join('')
        : '<option value="">Demo sheet / no uploads</option>';
      if (state.currentSheetId && sheets.some(s => s.id === state.currentSheetId)) select.value = state.currentSheetId;
    }
  }

  function syncUsernameSuggestion(force=false){
    const username = $('authUsername');
    if (!username) return;
    if (force || !state.usernameManual || !username.value.trim()) username.value = ensureUniqueUsername(generateUsername($('authEmail').value, $('authNickname').value), $('authEmail').value);
  }
  async function handleAuth(event){
    event.preventDefault();
    const email = normalizeEmail($('authEmail').value);
    const nickname = $('authNickname').value.trim();
    const password = $('authPassword').value;
    if (!email || !password) return alert('Enter an email and password.');
    const username = ensureUniqueUsername($('authUsername').value || generateUsername(email, nickname), email);
    let account = findAccountByEmail(email);
    if (account) {
      if (!(await verifyPassword(password, account))) return alert('That password does not match this account.');
      account.username = account.username || username;
      account.nickname = account.nickname || nickname;
      account.modifiedAt = new Date().toISOString();
    } else {
      account = { email, username, nickname, ...(await passwordRecord(password)), createdAt:new Date().toISOString(), modifiedAt:new Date().toISOString(), resetRequests:[] };
      state.data.accounts[email] = account;
      state.data.sheetsByUser[email] = state.data.sheetsByUser[email] || [];
    }
    saveData();
    state.user = { email };
    saveSession(state.user);
    state.usernameManual = false;
    switchScreen('profile', false);
  }
  function logout(){ state.user = null; state.currentSheetId = null; saveSession(null); switchScreen('home', false); }
  function setLookupResult(id, message, ok=false){ const node = $(id); if (node) { node.textContent = message; node.style.color = ok ? 'var(--teal2)' : '#ffb6b6'; } }
  function lookupEmail(){ const acc = findAccountByUsername($('lookupEmailUsername').value); setLookupResult('lookupEmailResult', acc ? `Email found: ${acc.email}` : 'No account matched that username.', !!acc); }
  function lookupUsername(){ const acc = findAccountByEmail($('lookupUsernameEmail').value); setLookupResult('lookupUsernameResult', acc ? `Username found: ${acc.username}` : 'No account matched that email.', !!acc); }
  function resetPassword(){
    const acc = findAccountByIdentifier($('resetIdentifier').value);
    if (!acc) return setLookupResult('resetResult', 'No matching account was found.', false);
    const token = uid();
    acc.resetRequests = acc.resetRequests || [];
    acc.resetRequests.push({ token, requestedAt:new Date().toISOString() });
    acc.modifiedAt = new Date().toISOString();
    saveData();
    setLookupResult('resetResult', `Reset request recorded for ${acc.email}. A backend email service can send the link in a live deployment.`, true);
  }

  async function uploadFiles(){
    if (!state.user) return alert('Sign in first.');
    const input = $('sheetFiles');
    const files = Array.from(input.files || []);
    if (!files.length) return alert('Choose one or more HTML files first.');
    const existing = getUserSheets(state.user.email).slice();
    let added = 0;
    for (const file of files) {
      if (existing.length >= MAX_SHEETS) break;
      const isHtml = file.name.toLowerCase().endsWith('.html') || file.type === 'text/html' || file.type === '';
      if (!isHtml) { alert(`Skipped ${file.name}. Only HTML character sheets are accepted.`); continue; }
      const html = await file.text();
      existing.push({ id:uid(), name:file.name, html, modifiedAt:new Date().toISOString() });
      added += 1;
    }
    setUserSheets(state.user.email, existing);
    input.value = '';
    if (added) state.currentSheetId = existing[existing.length - 1].id;
    renderProfile(); renderUploadList(); updateSheetPickers();
    alert(added ? `${added} sheet${added === 1 ? '' : 's'} uploaded.` : `No sheets were added. Each account can store ${MAX_SHEETS}.`);
  }

  function rollDice(expr){
    const match = String(expr || '').trim().match(/^(\d*)d(\d+)([+-]\d+)?$/i);
    if (!match) return 'Invalid expression. Try 1d20+5.';
    const count = Math.min(parseInt(match[1] || '1', 10), 100);
    const sides = Math.min(parseInt(match[2], 10), 10000);
    const mod = parseInt(match[3] || '0', 10);
    let total = 0; const rolls = [];
    for (let i=0; i<count; i++) { const r = 1 + Math.floor(Math.random() * sides); rolls.push(r); total += r; }
    return `${expr}: ${rolls.join(', ')} = ${total}${mod ? (mod > 0 ? ` + ${mod}` : ` - ${Math.abs(mod)}`) : ''} → ${total + mod}`;
  }
  function injectRuntime(doc, mode){
    const old = doc.querySelectorAll('[data-portal-runtime], #portalRuntimeScript, .portal-runtime-chip');
    old.forEach(n => n.remove());
    const style = doc.createElement('style');
    style.dataset.portalRuntime = 'true';
    style.textContent = `
      input,textarea,select,button,[contenteditable="true"]{pointer-events:auto!important;}
      [contenteditable="true"]{outline:2px dashed rgba(61,159,160,.35);outline-offset:2px;}
      .portal-runtime-chip{position:fixed;right:12px;bottom:12px;z-index:999999;padding:8px 10px;border-radius:999px;background:rgba(15,17,21,.84);color:#fff;font:12px/1.2 sans-serif;border:1px solid rgba(255,255,255,.18);}
    `;
    (doc.head || doc.documentElement).appendChild(style);
    doc.querySelectorAll('input, textarea, select, button, [contenteditable]').forEach(node => {
      node.removeAttribute('disabled');
      if (mode === 'editor' || mode === 'viewer') node.removeAttribute('readonly');
    });
    const script = doc.createElement('script');
    script.id = 'portalRuntimeScript';
    script.textContent = `
      (function(){
        function rollDice(expr){
          var match=String(expr||'').trim().match(/^(\\d*)d(\\d+)([+-]\\d+)?$/i);
          if(!match)return 'Invalid expression. Try 1d20+5.';
          var count=Math.min(parseInt(match[1]||'1',10),100), sides=Math.min(parseInt(match[2],10),10000), mod=parseInt(match[3]||'0',10);
          var total=0, rolls=[]; for(var i=0;i<count;i++){var r=1+Math.floor(Math.random()*sides); rolls.push(r); total+=r;}
          return expr+': '+rolls.join(', ')+' = '+total+(mod?(mod>0?' + '+mod:' - '+Math.abs(mod)):'')+' → '+(total+mod);
        }
        document.addEventListener('click',function(e){
          var btn=e.target.closest('[data-roll], [data-dice], .roll-dice'); if(!btn)return;
          var exprId=btn.getAttribute('data-roll') || btn.getAttribute('data-dice-input');
          var expr=(exprId && document.getElementById(exprId) ? document.getElementById(exprId).value : '') || btn.getAttribute('data-dice') || btn.getAttribute('data-expression') || '1d20';
          var outId=btn.getAttribute('data-roll-output') || btn.getAttribute('data-dice-output');
          var out=(outId && document.getElementById(outId)) || document.querySelector('[data-dice-output]') || document.getElementById('diceResult') || document.getElementById('result');
          if(out) out.textContent=rollDice(expr);
        });
      })();`;
    doc.body.appendChild(script);
    const chip = doc.createElement('div');
    chip.className = 'portal-runtime-chip';
    chip.textContent = mode === 'editor' ? 'Editor mode — save from portal' : 'Viewer mode — fillable';
    doc.body.appendChild(chip);
  }
  function loadSheetFor(mode){
    const sheets = state.user ? getUserSheets(state.user.email) : [];
    if (!sheets.length) return null;
    const picker = mode === 'editor' ? $('editorSelect') : $('viewerSelect');
    const selected = picker?.value || state.currentSheetId || sheets[0].id;
    const sheet = sheets.find(s => s.id === selected) || sheets[0];
    state.currentSheetId = sheet.id;
    if ($('viewerSelect')) $('viewerSelect').value = sheet.id;
    if ($('editorSelect')) $('editorSelect').value = sheet.id;
    return sheet;
  }
  function renderSheet(mode){
    const frame = mode === 'editor' ? $('editorFrame') : $('sheetFrame');
    if (!frame) return;
    const sheet = loadSheetFor(mode);
    const html = sheet?.html || demoSheet;
    frame.onload = () => { try { injectRuntime(frame.contentDocument, mode); } catch (err) { console.warn(err); } };
    frame.srcdoc = html;
    if (mode === 'editor') {
      $('creatorSourceText').textContent = html;
      $('creatorSourceWrap').classList.toggle('hidden', !state.creatorSourceVisible);
      $('toggleSourceBtn').textContent = state.creatorSourceVisible ? 'Hide Source' : 'Show Source';
    }
  }
  function syncFormValuesIntoMarkup(root){
    root.querySelectorAll('input').forEach(input => {
      const type = (input.getAttribute('type') || 'text').toLowerCase();
      if (['checkbox','radio'].includes(type)) {
        if (input.checked) input.setAttribute('checked',''); else input.removeAttribute('checked');
      } else if (type !== 'file') {
        input.setAttribute('value', input.value ?? '');
      }
    });
    root.querySelectorAll('textarea').forEach(textarea => { textarea.textContent = textarea.value ?? ''; });
    root.querySelectorAll('select').forEach(select => {
      Array.from(select.options).forEach(option => {
        if (option.selected) option.setAttribute('selected',''); else option.removeAttribute('selected');
      });
    });
    root.querySelectorAll('[contenteditable="true"], [contenteditable=""]').forEach(node => { node.setAttribute('data-saved-contenteditable','true'); });
  }
  function serializeFrame(frame){
    const doc = frame.contentDocument;
    if (!doc) return '';
    syncFormValuesIntoMarkup(doc);
    const clone = doc.documentElement.cloneNode(true);
    clone.querySelectorAll('[data-portal-runtime], #portalRuntimeScript, .portal-runtime-chip').forEach(n => n.remove());
    return '<!DOCTYPE html>\n' + clone.outerHTML;
  }
  function saveFrom(mode){
    if (!state.user) return alert('Sign in first.');
    const sheet = loadSheetFor(mode);
    if (!sheet) return alert('Upload at least one HTML sheet first.');
    const frame = mode === 'editor' ? $('editorFrame') : $('sheetFrame');
    const html = serializeFrame(frame);
    if (!html) return alert('Could not read the sheet.');
    const sheets = getUserSheets(state.user.email).map(s => s.id === sheet.id ? { ...s, html, modifiedAt:new Date().toISOString() } : s);
    setUserSheets(state.user.email, sheets);
    $('creatorSourceText').textContent = html;
    renderProfile(); renderUploadList(); updateSheetPickers();
    alert('Character sheet saved in this browser.');
  }
  function deleteSheet(id){
    if (!state.user) return;
    const sheets = getUserSheets(state.user.email).filter(s => s.id !== id);
    setUserSheets(state.user.email, sheets);
    if (state.currentSheetId === id) state.currentSheetId = sheets[0]?.id || null;
    renderProfile(); renderUploadList(); updateSheetPickers();
    if (state.currentScreen === 'viewer') renderSheet('viewer');
    if (state.currentScreen === 'editor') renderSheet('editor');
  }
  function exportSheet(id){
    if (!state.user) return;
    const sheet = getUserSheets(state.user.email).find(s => s.id === id) || currentSheet();
    if (!sheet) return;
    const blob = new Blob([sheet.html], { type:'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = sheet.name || 'universal-character-sheet.html';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function openCreatorSource(){
    state.creatorSourceVisible = !state.creatorSourceVisible;
    const sheet = currentSheet();
    $('creatorSourceWrap').classList.toggle('hidden', !state.creatorSourceVisible);
    $('creatorSourceText').textContent = sheet?.html || demoSheet;
    $('toggleSourceBtn').textContent = state.creatorSourceVisible ? 'Hide Source' : 'Show Source';
  }
  function addViewerSaveButton(){
    if ($('saveViewer')) return;
    const btn = document.createElement('button');
    btn.id = 'saveViewer'; btn.type = 'button'; btn.className = 'secondary'; btn.textContent = 'Save Viewer Changes';
    btn.title = 'Save changes made in the viewer';
    $('reloadViewer')?.insertAdjacentElement('afterend', btn);
    btn.addEventListener('click', () => saveFrom('viewer'));
  }
  function addDemoButton(){
    const actions = $('goLogin')?.parentElement;
    if (!actions || $('addDemoSheet')) return;
    const btn = document.createElement('button'); btn.type='button'; btn.className='ghost'; btn.id='addDemoSheet'; btn.textContent='Add Demo Sheet';
    actions.appendChild(btn);
    btn.addEventListener('click', async () => {
      if (!state.user) { alert('Sign in first, then add the demo sheet.'); return; }
      const sheets = getUserSheets(state.user.email);
      if (sheets.length >= MAX_SHEETS) return alert(`Each profile can store up to ${MAX_SHEETS} sheets.`);
      sheets.push({ id:uid(), name:'demo-character-sheet.html', html:demoSheet, modifiedAt:new Date().toISOString() });
      setUserSheets(state.user.email, sheets); state.currentSheetId = sheets[sheets.length-1].id; switchScreen('viewer');
    });
  }

  function bindEvents(){
    $('authForm')?.addEventListener('submit', handleAuth);
    $('logoutBtn')?.addEventListener('click', logout);
    $('togglePassword')?.addEventListener('click', () => {
      const input = $('authPassword'), btn = $('togglePassword');
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.textContent = show ? 'Hide' : 'Show';
      btn.setAttribute('aria-pressed', String(show));
    });
    $('authEmail')?.addEventListener('input', () => syncUsernameSuggestion());
    $('authNickname')?.addEventListener('input', () => syncUsernameSuggestion());
    $('authUsername')?.addEventListener('input', () => { state.usernameManual = true; });
    $('findEmailBtn')?.addEventListener('click', lookupEmail);
    $('findUsernameBtn')?.addEventListener('click', lookupUsername);
    $('resetPasswordBtn')?.addEventListener('click', resetPassword);
    $('uploadBtn')?.addEventListener('click', uploadFiles);
    $('refreshUploadList')?.addEventListener('click', () => { renderUploadList(); updateSheetPickers(); });
    $('reloadViewer')?.addEventListener('click', () => renderSheet('viewer'));
    $('reloadEditor')?.addEventListener('click', () => renderSheet('editor'));
    $('saveSheet')?.addEventListener('click', () => saveFrom('editor'));
    $('rollDice')?.addEventListener('click', () => { $('diceOutput').textContent = rollDice($('diceExpr').value); });
    $('openCreatorSource')?.addEventListener('click', openCreatorSource);
    $('toggleSourceBtn')?.addEventListener('click', openCreatorSource);
    $('goLogin')?.addEventListener('click', () => $('authEmail')?.focus());
    $('viewerSelect')?.addEventListener('change', () => renderSheet('viewer'));
    $('editorSelect')?.addEventListener('change', () => renderSheet('editor'));
    $('navBack')?.addEventListener('click', () => { const prev = state.history.pop(); if (prev) switchScreen(prev, false); });
    $('navHome')?.addEventListener('click', () => { state.history = []; switchScreen('home', false); });
    document.querySelectorAll('[data-goto]').forEach(btn => btn.addEventListener('click', () => {
      const target = btn.dataset.goto;
      if (!state.user && target !== 'home') return alert('Please sign in first.');
      switchScreen(target);
    }));
    document.addEventListener('click', event => {
      const open = event.target.closest('[data-open-sheet]');
      if (open) { state.currentSheetId = open.dataset.openSheet; switchScreen(open.dataset.target || 'viewer'); }
      const del = event.target.closest('[data-delete-sheet]');
      if (del && confirm('Delete this sheet from this browser?')) deleteSheet(del.dataset.deleteSheet);
      const exp = event.target.closest('[data-download-sheet]');
      if (exp) exportSheet(exp.dataset.downloadSheet);
    });
    $('sheetFiles')?.addEventListener('change', () => {
      const selected = $('sheetFiles').files?.length || 0;
      const saved = state.user ? getUserSheets(state.user.email).length : 0;
      if (selected + saved > MAX_SHEETS) alert(`Only the first available slots will be saved. Limit: ${MAX_SHEETS} total sheets.`);
    });
    addViewerSaveButton();
    addDemoButton();
  }

  function init(){
    state.user = loadSession();
    if (state.user && !findAccountByEmail(state.user.email)) { state.user = null; saveSession(null); }
    bindEvents();
    syncUsernameSuggestion(true);
    if (state.user) switchScreen('profile', false); else switchScreen('home', false);
  }

  init();
})();
