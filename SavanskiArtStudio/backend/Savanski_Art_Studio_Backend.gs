/**
 * Savanski Art Studio - Google Apps Script backend + installable service shell
 * Version: 2026.08.08-v1
 *
 * Deploy this SAME file twice for the complete storage model:
 *  1. Shared service: Execute as "Me"; access as appropriate for your audience.
 *  2. Personal Drive connector: Execute as "User accessing the web app".
 *
 * Paste each deployment URL into js/backend-config.js in the Savanski Art Studio frontend.
 *
 * This file is self-contained. Storage and shared assets are handled through Google Drive.
 */

const SAVANSKI_CONFIG = Object.freeze({
  appName: 'Savanski Art Studio',
  shortName: 'Savanski Studio',
  description: 'Create, draw, edit, composite, crop, layer, and manage visual projects with Savanski Art Studio.',
  version: '2026.08.08-v1',
  systemFolderId: '1sXLBNsZ_FaFi6LUx773gQUP1q6G0Leyk',
  fallbackFolderId: '11SdF1SSrbzBZ5nrgtDlmTqrEKjv-7Mj2',
  libraryFolderId: '172HDX8KoXIS9lvAOpMxVYz6HrDQMlr-k',
  personalFolderName: 'Savanski Art Studio',
  inlineFileLimitBytes: 8 * 1024 * 1024,
  libraryResultLimit: 160,
  projectResultLimit: 200,
  themeColor: '#00FFFF',
  accentColor: '#EC5800',
  highlightColor: '#FFF600',
  backgroundColor: '#001010'
});

function doGet(e) {
  const p = (e && e.parameter) || {};
  const route = String(p.route || '').trim().toLowerCase();
  try {
    if (route) {
      switch (route) {
        case 'app': return appShell_();
        case 'manifest': return manifest_();
        case 'offline': return offline_();
        case 'icon': return iconSvg_();
        default: return output_({ ok: false, error: 'Unknown route.' }, p.callback);
      }
    }
    if (!Object.prototype.hasOwnProperty.call(p, 'action')) return appShell_();
    const action = String(p.action || 'ping');
    if (action === 'connect') return connectPersonalDrive_(p);
    let result;
    switch (action) {
      case 'ping': result = { ok: true, app: SAVANSKI_CONFIG.appName, version: SAVANSKI_CONFIG.version, service: 'google-apps-script' }; break;
      case 'storageStatus': result = storageStatus_(p); break;
      case 'listLibrary': result = listLibrary_(p); break;
      case 'getLibraryFile': result = getLibraryFile_(p); break;
      case 'listProjects': result = listProjects_(p); break;
      case 'getProject': result = getProject_(p); break;
      default: throw new Error('Unknown action.');
    }
    return output_(result, p.callback);
  } catch (err) {
    return output_({ ok: false, error: safeError_(err) }, p.callback);
  }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    let result;
    switch (String(body.action || '')) {
      case 'saveProject': result = saveProject_(body); break;
      case 'saveBinary': result = saveBinary_(body); break;
      case 'ping': result = { ok: true, app: SAVANSKI_CONFIG.appName, version: SAVANSKI_CONFIG.version, service: 'google-apps-script' }; break;
      default: throw new Error('Unknown action.');
    }
    return output_(result);
  } catch (err) {
    return output_({ ok: false, error: safeError_(err) });
  }
}

function setupSavanskiBackend() {
  const checks = { system: folderInfo_(SAVANSKI_CONFIG.systemFolderId), fallback: folderInfo_(SAVANSKI_CONFIG.fallbackFolderId), library: folderInfo_(SAVANSKI_CONFIG.libraryFolderId) };
  const system = DriveApp.getFolderById(SAVANSKI_CONFIG.systemFolderId);
  upsertTextFile_(system, 'savanski-backend-status.json', JSON.stringify({ app: SAVANSKI_CONFIG.appName, version: SAVANSKI_CONFIG.version, configuredAt: new Date().toISOString(), checks: checks }, null, 2), 'application/json');
  return checks;
}

function connectPersonalDrive_(p) {
  try {
    let folder;
    const requested = cleanId_(p.folderId || '');
    if (requested) folder = DriveApp.getFolderById(requested);
    else folder = getOrCreatePersonalRoot_();
    PropertiesService.getUserProperties().setProperty('savanski.personalFolderId', folder.getId());
    return HtmlService.createHtmlOutput(
      '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>Google Drive connected</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;box-sizing:border-box;font:16px system-ui;background:#F2FFFF;color:#001010}main{max-width:620px;border:3px solid #008FB8;background:#D9FFFF;padding:28px;box-shadow:7px 7px 0 #001010}h1{margin-top:0;color:#EC5800}strong{color:#008FB8}</style></head><body><main><h1>Google Drive connected</h1>' +
      '<p><strong>' + htmlEscape_(SAVANSKI_CONFIG.appName) + '</strong> can now save projects and exports to this Drive.</p><p>You can close this window and choose <strong>Refresh Status</strong> in the studio.</p></main></body></html>'
    ).setTitle(SAVANSKI_CONFIG.appName + ' - Drive connected');
  } catch (err) {
    return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><title>Drive connection failed</title><p>Drive connection failed: ' + htmlEscape_(safeError_(err)) + '</p>');
  }
}

function storageStatus_(p) {
  const shared = String(p.mode || '') === 'shared';
  const folder = shared ? getSharedClientFolder_(p.clientKey, true) : getPersonalFolder_(false);
  if (!folder) return { ok: false, mode: shared ? 'shared' : 'personal', error: shared ? 'Shared storage is unavailable.' : 'Personal Drive is not connected yet.' };
  return { ok: true, mode: shared ? 'shared' : 'personal', folderName: shared ? 'Shared fallback storage' : folder.getName() };
}

function saveProject_(body) {
  if (!body.project || typeof body.project !== 'object') throw new Error('Project payload is missing.');
  const mode = body.storageMode === 'personal' ? 'personal' : 'shared';
  const folder = mode === 'personal' ? getPersonalFolder_(true) : getSharedClientFolder_(body.clientKey, true);
  const title = sanitizeName_(body.title || body.project.name || body.project.projectName || 'Untitled Project', 90);
  const name = title.replace(/\.savanski(?:\.json)?$/i, '') + '.savanski.json';
  const content = JSON.stringify(body.project);
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const file = upsertTextFile_(folder, name, content, 'application/json');
    systemEvent_({ type: 'project-save', mode: mode, filename: name, bytes: content.length, client: hashClient_(body.clientKey || '') });
    return { ok: true, id: file.getId(), name: file.getName(), mode: mode, updated: new Date().toISOString() };
  } finally { lock.releaseLock(); }
}

function saveBinary_(body) {
  const base64 = String(body.base64 || '');
  if (!base64) throw new Error('File data is missing.');
  const bytes = Utilities.base64Decode(base64);
  if (bytes.length > SAVANSKI_CONFIG.inlineFileLimitBytes) throw new Error('Inline upload is too large. Use Drive directly for larger files.');
  const mode = body.storageMode === 'personal' ? 'personal' : 'shared';
  const root = mode === 'personal' ? getPersonalFolder_(true) : getSharedClientFolder_(body.clientKey, true);
  const category = sanitizeName_(body.category || 'exports', 32).toLowerCase();
  const folder = getOrCreateChild_(root, category === 'uploads' ? 'Uploads' : category === 'projects' ? 'Projects' : 'Exports');
  const name = sanitizeFilename_(body.filename || ('savanski-export-' + Date.now()));
  const mime = String(body.mimeType || 'application/octet-stream').slice(0, 120);
  const blob = Utilities.newBlob(bytes, mime, name);
  const file = folder.createFile(blob);
  systemEvent_({ type: 'binary-save', mode: mode, filename: name, bytes: bytes.length, client: hashClient_(body.clientKey || '') });
  return { ok: true, id: file.getId(), name: file.getName(), mode: mode };
}

function listProjects_(p) {
  const shared = !!p.clientKey;
  const folder = shared ? getSharedClientFolder_(p.clientKey, false) : getPersonalFolder_(false);
  if (!folder) return { ok: true, items: [] };
  const files = folder.getFiles(), items = [];
  while (files.hasNext()) {
    const f = files.next();
    if (!/\.savanski\.json$/i.test(f.getName())) continue;
    items.push({ id: f.getId(), name: f.getName().replace(/\.savanski\.json$/i, ''), modified: f.getLastUpdated().toISOString(), size: f.getSize() });
  }
  items.sort(function(a, b) { return b.modified.localeCompare(a.modified); });
  return { ok: true, items: items.slice(0, SAVANSKI_CONFIG.projectResultLimit) };
}

function getProject_(p) {
  const id = cleanId_(p.id);
  if (!id) throw new Error('Project id is missing.');
  const shared = !!p.clientKey;
  const folder = shared ? getSharedClientFolder_(p.clientKey, false) : getPersonalFolder_(false);
  if (!folder || !fileIsDirectChild_(id, folder.getId())) throw new Error('Project is not available in this storage space.');
  const f = DriveApp.getFileById(id);
  if (!/\.savanski\.json$/i.test(f.getName())) throw new Error('File is not a Savanski Art Studio project.');
  const text = f.getBlob().getDataAsString('UTF-8');
  return { ok: true, id: id, name: f.getName(), project: JSON.parse(text) };
}

function listLibrary_(p) {
  const root = DriveApp.getFolderById(SAVANSKI_CONFIG.libraryFolderId);
  const q = String(p.q || '').trim().toLowerCase();
  const type = String(p.type || 'all').toLowerCase();
  const out = [];
  walkFolder_(root, '', function(file, path) {
    if (out.length >= SAVANSKI_CONFIG.libraryResultLimit) return false;
    const name = file.getName(), mime = file.getMimeType() || '', kind = classifyFile_(name, mime, path);
    if (type !== 'all' && kind !== type && !(type === 'image' && kind === 'map')) return true;
    if (q && (name + ' ' + path).toLowerCase().indexOf(q) < 0) return true;
    out.push({ id: file.getId(), name: name, mimeType: mime, kind: kind, size: file.getSize(), modified: file.getLastUpdated().toISOString(), path: path });
    return true;
  }, 7);
  return { ok: true, items: out };
}

function getLibraryFile_(p) {
  const id = cleanId_(p.id);
  if (!id) throw new Error('Library file id is missing.');
  if (!isDescendantFile_(id, SAVANSKI_CONFIG.libraryFolderId, 10)) throw new Error('File is not in the Savanski Art Studio shared library.');
  const file = DriveApp.getFileById(id), size = file.getSize(), mime = file.getMimeType() || 'application/octet-stream';
  if (size > SAVANSKI_CONFIG.inlineFileLimitBytes) return { ok: false, id: id, name: file.getName(), mimeType: mime, size: size, error: 'This file is too large for one-click inline transfer. Open the shared library in Drive and download it there.' };
  const blob = file.getBlob();
  return { ok: true, id: id, name: file.getName(), mimeType: mime, size: size, dataUrl: 'data:' + mime + ';base64,' + Utilities.base64Encode(blob.getBytes()) };
}

function getPersonalFolder_(createIfMissing) {
  const props = PropertiesService.getUserProperties();
  const id = cleanId_(props.getProperty('savanski.personalFolderId') || '');
  if (id) {
    try { return DriveApp.getFolderById(id); }
    catch (_) { props.deleteProperty('savanski.personalFolderId'); }
  }
  if (!createIfMissing) return null;
  const folder = getOrCreatePersonalRoot_();
  props.setProperty('savanski.personalFolderId', folder.getId());
  return folder;
}
function getOrCreatePersonalRoot_() { const existing = DriveApp.getFoldersByName(SAVANSKI_CONFIG.personalFolderName); return existing.hasNext() ? existing.next() : DriveApp.createFolder(SAVANSKI_CONFIG.personalFolderName); }
function getSharedClientFolder_(clientKey, createIfMissing) { const key = validateClientKey_(clientKey); if (!key) throw new Error('Shared storage identity is missing.'); const root = DriveApp.getFolderById(SAVANSKI_CONFIG.fallbackFolderId), name = 'User-' + hashClient_(key), it = root.getFoldersByName(name); return it.hasNext() ? it.next() : createIfMissing ? root.createFolder(name) : null; }
function getOrCreateChild_(root, name) { const it = root.getFoldersByName(name); return it.hasNext() ? it.next() : root.createFolder(name); }
function walkFolder_(folder, path, visit, depth) { const files = folder.getFiles(); while (files.hasNext()) if (visit(files.next(), path) === false) return false; if (depth <= 0) return true; const subs = folder.getFolders(); while (subs.hasNext()) { const f = subs.next(), childPath = path ? path + '/' + f.getName() : f.getName(); if (walkFolder_(f, childPath, visit, depth - 1) === false) return false; } return true; }
function isDescendantFile_(fileId, rootId, maxDepth) { try { let frontier = [], p = DriveApp.getFileById(fileId).getParents(); while (p.hasNext()) frontier.push(p.next()); for (let depth = 0; depth < maxDepth && frontier.length; depth++) { const next = []; for (let i = 0; i < frontier.length; i++) { const f = frontier[i]; if (f.getId() === rootId) return true; const parents = f.getParents(); while (parents.hasNext()) next.push(parents.next()); } frontier = next; } } catch (_) {} return false; }
function fileIsDirectChild_(fileId, folderId) { try { const p = DriveApp.getFileById(fileId).getParents(); while (p.hasNext()) if (p.next().getId() === folderId) return true; } catch (_) {} return false; }
function classifyFile_(name, mime, path) { const n = (name + ' ' + path).toLowerCase(); if (/\b(map|battlemap|dungeon|vtt|terrain|token)\b/.test(n) && mime.indexOf('image/') === 0) return 'map'; if (mime.indexOf('image/') === 0) return 'image'; if (mime.indexOf('audio/') === 0) return 'audio'; return 'file'; }
function upsertTextFile_(folder, name, content, mime) { const files = folder.getFilesByName(name); if (files.hasNext()) { const f = files.next(); f.setContent(content); return f; } return folder.createFile(Utilities.newBlob(content, mime || 'text/plain', name)); }
function systemEvent_(event) { try { const folder = DriveApp.getFolderById(SAVANSKI_CONFIG.systemFolderId), month = Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM'), name = 'savanski-backend-audit-' + month + '.jsonl', line = JSON.stringify(Object.assign({ at: new Date().toISOString(), app: SAVANSKI_CONFIG.appName, version: SAVANSKI_CONFIG.version }, event)) + '\n', files = folder.getFilesByName(name); if (files.hasNext()) { const f = files.next(), old = f.getBlob().getDataAsString('UTF-8'); f.setContent((old.length > 2500000 ? old.slice(-1800000) : old) + line); } else folder.createFile(Utilities.newBlob(line, 'application/x-ndjson', name)); } catch (_) {} }

function appShell_() {
  const baseUrl = ScriptApp.getService().getUrl(), manifestUrl = baseUrl + '?route=manifest', iconUrl = baseUrl + '?route=icon', pingUrl = baseUrl + '?action=ping';
  return HtmlService.createHtmlOutput(`<!doctype html><html lang="en"><head><meta charset="utf-8"><base target="_top"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="${SAVANSKI_CONFIG.themeColor}"><meta name="background-color" content="${SAVANSKI_CONFIG.backgroundColor}"><meta name="description" content="${htmlEscape_(SAVANSKI_CONFIG.description)}"><title>${htmlEscape_(SAVANSKI_CONFIG.appName)}</title><link rel="manifest" href="${manifestUrl}"><link rel="icon" type="image/svg+xml" href="${iconUrl}"><link rel="apple-touch-icon" href="${iconUrl}"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="${htmlEscape_(SAVANSKI_CONFIG.shortName)}"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><style>:root{--cyan:#00FFFF;--orange:#EC5800;--yellow:#FFF600;--bg:#001010;--panel:#F2FFFF;--ink:#001010;--muted:#31545A;--line:#008FB8;--shadow:7px 7px 0 #001010}*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:linear-gradient(135deg,#D9FFFF 0 52%,#FFE0C4 52% 76%,#FFF3A4 76%);color:var(--ink);font-family:Arial,Helvetica,sans-serif}body{min-height:100dvh;display:grid;place-items:center;padding:18px}.shell{width:min(100%,880px)}.card{border:3px solid var(--ink);background:var(--panel);box-shadow:var(--shadow);padding:clamp(22px,5vw,44px)}.content{display:grid;gap:18px;justify-items:center;text-align:center}.icon{width:118px;aspect-ratio:1;border:3px solid var(--ink);background:var(--yellow);box-shadow:5px 5px 0 var(--ink);display:grid;place-items:center;padding:12px}.icon img{width:100%;height:100%}h1{margin:0;font-size:clamp(2rem,7vw,4.4rem);line-height:.95;color:var(--orange);text-shadow:2px 2px 0 #fff,4px 4px 0 var(--cyan)}p{margin:0;max-width:62ch;color:var(--muted);font-size:clamp(1rem,2.4vw,1.16rem);line-height:1.5}.badge{display:inline-block;border:2px solid var(--ink);background:var(--cyan);font-weight:900;padding:6px 10px;box-shadow:3px 3px 0 var(--ink)}.buttons{display:flex;flex-wrap:wrap;justify-content:center;gap:12px}button,a.button{border:3px solid var(--ink);background:#fff;color:var(--ink);min-height:48px;padding:10px 16px;font:800 1rem Arial,sans-serif;text-decoration:none;cursor:pointer;box-shadow:4px 4px 0 var(--ink)}.primary{background:var(--yellow)}.status{min-height:1.5em;font-weight:800;color:#005D73}</style></head><body><main class="shell"><section class="card"><div class="content"><div class="icon"><img src="${iconUrl}" alt=""></div><div class="badge">${htmlEscape_(SAVANSKI_CONFIG.version)}</div><h1>${htmlEscape_(SAVANSKI_CONFIG.appName)}</h1><p>The Savanski Art Studio service is online. Shared storage, personal Google Drive storage, project files, exports, and the shared library are handled through this deployment.</p><div class="buttons"><button id="installBtn" class="primary" type="button">Install Service Icon</button><a class="button" href="${pingUrl}" target="_blank" rel="noopener">Check Service</a></div><div id="status" class="status">Checking service…</div></div></section></main><script>let deferredPrompt=null;const installBtn=document.getElementById('installBtn'),statusEl=document.getElementById('status');function setStatus(m){statusEl.textContent=m||''}window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;setStatus('Service online. Ready to install this icon.')});installBtn.addEventListener('click',async()=>{if(!deferredPrompt){setStatus('Use your browser menu to add this service to your desktop or home screen.');return}deferredPrompt.prompt();const choice=await deferredPrompt.userChoice;deferredPrompt=null;setStatus(choice&&choice.outcome==='accepted'?'Installed.':'Install canceled.')});fetch(${JSON.stringify(pingUrl)},{cache:'no-store'}).then(r=>r.json()).then(d=>setStatus(d&&d.ok?'Service online · '+d.version:'Service responded, but did not report ready.')).catch(()=>setStatus('Service shell loaded. API status check was blocked by the browser.'));</script></body></html>`).setTitle(SAVANSKI_CONFIG.appName).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function manifest_() { const baseUrl = ScriptApp.getService().getUrl(), iconUrl = baseUrl + '?route=icon', manifest = { name: SAVANSKI_CONFIG.appName, short_name: SAVANSKI_CONFIG.shortName, description: SAVANSKI_CONFIG.description, start_url: baseUrl, scope: baseUrl, display: 'standalone', orientation: 'any', theme_color: SAVANSKI_CONFIG.themeColor, background_color: SAVANSKI_CONFIG.backgroundColor, icons: [{ src: iconUrl, sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }] }; return ContentService.createTextOutput(JSON.stringify(manifest, null, 2)).setMimeType(ContentService.MimeType.JSON); }
function offline_() { return HtmlService.createHtmlOutput(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${htmlEscape_(SAVANSKI_CONFIG.appName)} Offline</title><style>html,body{margin:0;min-height:100%;background:#D9FFFF;color:#001010;font-family:Arial,sans-serif;display:grid;place-items:center;text-align:center}main{width:min(92vw,680px);padding:28px;border:3px solid #001010;background:#F2FFFF;box-shadow:7px 7px 0 #EC5800}h1{margin:0 0 12px;color:#EC5800}a{color:#008FB8;font-weight:800}</style></head><body><main><h1>Offline</h1><p>${htmlEscape_(SAVANSKI_CONFIG.appName)} needs a connection to reach Google Drive and the shared service.</p><p><a href="${ScriptApp.getService().getUrl()}" target="_top">Try the service again</a></p></main></body></html>`).setTitle(SAVANSKI_CONFIG.appName + ' Offline').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); }
function iconSvg_() { const svg = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">','<rect width="512" height="512" rx="96" fill="#00FFFF"/>','<path d="M60 394 184 76l74 168 68-114 126 264H60Z" fill="#FFF600" stroke="#001010" stroke-width="22" stroke-linejoin="round"/>','<circle cx="369" cy="129" r="58" fill="#EC5800" stroke="#001010" stroke-width="20"/>','<path d="M111 401h290" stroke="#001010" stroke-width="24" stroke-linecap="round"/>','<text x="256" y="454" text-anchor="middle" font-family="Arial,sans-serif" font-size="58" font-weight="900" fill="#001010">SAS</text>','</svg>'].join(''); return ContentService.createTextOutput(svg).setMimeType(ContentService.MimeType.XML); }
function folderInfo_(id) { const f = DriveApp.getFolderById(id); return { id: f.getId(), name: f.getName() }; }
function cleanId_(v) { const s = String(v || '').trim(); return /^[A-Za-z0-9_-]{10,160}$/.test(s) ? s : ''; }
function validateClientKey_(v) { const s = String(v || ''); return /^[A-Za-z0-9_-]{24,100}$/.test(s) ? s : ''; }
function hashClient_(key) { if (!key) return 'personal'; const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, key); return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, '').slice(0, 22); }
function sanitizeName_(v, max) { return String(v || 'Untitled').replace(/[\\/:*?"<>|\x00-\x1f]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max || 100) || 'Untitled'; }
function sanitizeFilename_(v) { const s = String(v || 'file').replace(/[\\/:*?"<>|\x00-\x1f]+/g, '_').replace(/^\.+/, '').slice(0, 180); return s || ('file-' + Date.now()); }
function safeError_(err) { return String((err && err.message) || err || 'Unknown error').slice(0, 500); }
function htmlEscape_(s) { return String(s).replace(/[&<>"']/g, function(c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function output_(obj, callback) { const json = JSON.stringify(obj), cb = String(callback || ''); if (cb && /^[A-Za-z_$][0-9A-Za-z_$]*(?:\.[A-Za-z_$][0-9A-Za-z_$]*)*$/.test(cb)) return ContentService.createTextOutput(cb + '(' + json + ');').setMimeType(ContentService.MimeType.JAVASCRIPT); return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON); }
