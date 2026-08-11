/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
(function (global) {
  'use strict';
  var DB_NAME = 'worldbuilder-upload-library-v1', STORE_NAME = 'files', META_KEY = 'worldbuilder.upload.manifest.v1', MAX_FILE = 24000 * 1024, MAX_FOLDER = 900;
  var manifest = { schema: 'worldbuilder.upload-manifest.v1', modules: [], updatedAt: null };
  function q(id) { return document.getElementById(id); }
  function deep(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function uid(prefix) { return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
  function safeSegment(value) { return String(value || 'file').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[<>:"\\|?*\x00-\x1f]/g, '-').replace(/^\.+/, '').replace(/\s+/g, '_').slice(0, 100) || 'file'; }
  function safePath(path) { var pieces = String(path || 'file').replace(/\\/g, '/').split('/').filter(function (part) { return part && part !== '.' && part !== '..'; }).map(safeSegment); return pieces.slice(-5).join('/'); }
  function escapeHtml(value) { var div = document.createElement('div'); div.textContent = value == null ? '' : String(value); return div.innerHTML; }
  function loadMeta() { try { var saved = JSON.parse(localStorage.getItem(META_KEY) || 'null'); if (saved && Array.isArray(saved.modules)) manifest = saved; } catch (_error) {} }
  function saveMeta() { manifest.updatedAt = new Date().toISOString(); try { localStorage.setItem(META_KEY, JSON.stringify(manifest)); } catch (_error) {} renderSummary(); }
  function openDb() { return new Promise(function (resolve, reject) { var request = indexedDB.open(DB_NAME, 1); request.onupgradeneeded = function () { var db = request.result; if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'id' }); }; request.onsuccess = function () { resolve(request.result); }; request.onerror = function () { reject(request.error); }; }); }
  async function putRecord(record) { var db = await openDb(); return new Promise(function (resolve, reject) { var tx = db.transaction(STORE_NAME, 'readwrite'); tx.objectStore(STORE_NAME).put(record); tx.oncomplete = function () { db.close(); resolve(record); }; tx.onerror = function () { db.close(); reject(tx.error); }; }); }
  async function allRecords() { var db = await openDb(); return new Promise(function (resolve, reject) { var tx = db.transaction(STORE_NAME, 'readonly'), request = tx.objectStore(STORE_NAME).getAll(); request.onsuccess = function () { db.close(); resolve(request.result || []); }; request.onerror = function () { db.close(); reject(request.error); }; }); }
  function activeScope() { return document.body.dataset.workspacePage || 'globe'; }
  function extension(name) { var match = String(name || '').toLowerCase().match(/\.([^.\/]+)$/); return match ? match[1] : ''; }
  function classify(name, textHint, requestedScope) {
    var haystack = (name + ' ' + (textHint || '').slice(0, 4000)).toLowerCase(), scope = requestedScope || activeScope(), kind = 'data';
    if (/galaxy|solar|starfield|nebula|constellation|orbit|planet/.test(haystack)) scope = 'galaxy';
    else if (/ocean|marine|reef|bathym|abyss|water|kelp|fish/.test(haystack)) scope = 'globe';
    else if (/weather|storm|climate|rain|snow|tide|hurricane/.test(haystack)) scope = 'weather';
    else if (/moon|aurora|atmospher|sky|satellite/.test(haystack)) scope = 'celestial';
    else if (/npc|race|species|life|schedule|people|character/.test(haystack)) scope = 'life';
    else if (/transit|route|pantheon|faction|politic|lore|canon/.test(haystack)) scope = 'lore';
    var ext = extension(name);
    if (['js', 'css', 'html', 'htm'].includes(ext)) kind = 'code';
    else if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'glb', 'gltf', 'obj', 'mp3', 'wav', 'ogg'].includes(ext)) kind = 'asset';
    else if (ext === 'zip' || ext === 'worldbuilder' || ext === 'lifesim') kind = 'package';
    else if (ext === 'docx' || ext === 'pdf') kind = 'document';
    return { scope: scope, kind: kind };
  }
  function status(message, tone) { var host = q('global-upload-status'); if (host) { host.textContent = message; host.dataset.tone = tone || 'info'; } var toast = q('toast'); if (toast) { toast.textContent = message; toast.classList.add('show'); clearTimeout(status.timer); status.timer = setTimeout(function () { toast.classList.remove('show'); }, 3200); } }
  function addModule(meta) { manifest.modules = manifest.modules.filter(function (module) { return module.id !== meta.id; }); manifest.modules.unshift(meta); saveMeta(); }
  function applyContinentSnapshot(payload, sourceName) {
    if (!payload || !Array.isArray(payload.continents) || !global.WorldBuilderEditor) return 0; var applied = 0;
    payload.continents.forEach(function (continent) { var key = WorldBuilderEditor.findContinent(continent.key || continent.name || continent.defaultName); if (!key) return; var transform = continent.transform && continent.transform.currentCenter || continent.center || {};
      if (continent.name) WorldBuilderEditor.renameContinent(key, continent.name);
      WorldBuilderEditor.moveContinent(key, { lonShift: continent.lonShift != null ? continent.lonShift : Number(transform.lon || 0) - Number(continent.initialCenter && continent.initialCenter.lon || 0), latShift: continent.latShift != null ? continent.latShift : Number(transform.lat || 0) - Number(continent.initialCenter && continent.initialCenter.lat || 0), rotation: Number(continent.rotation || continent.transform && continent.transform.rotation || 0) });
      if (Array.isArray(continent.features) && continent.features.length) WorldBuilderEditor.applyContinentOverride(key, { name: continent.name, features: continent.features, source: sourceName }, sourceName); applied += 1;
    });
    if (applied && WorldBuilderEditor.save) WorldBuilderEditor.save(); return applied;
  }
  async function retainSingle(file, scope, classification) {
    if (file.size > MAX_FILE) throw new Error(file.name + ' exceeds the 24,000 KB per-file limit.');
    var id = uid('module'), path = safePath(file.name), record = { id: id + ':' + path, moduleId: id, path: path, originalName: file.name, scope: scope, kind: classification.kind, size: file.size, blob: file, importedAt: new Date().toISOString() };
    await putRecord(record); addModule({ id: id, name: file.name, scope: scope, kind: classification.kind, sourceType: 'single-file', fileCount: 1, bytes: file.size, entry: path, retainedIntact: true, importedAt: record.importedAt }); return record;
  }
  async function retainPackage(file, scope) {
    if (!global.JSZip) throw new Error('ZIP support is unavailable.'); var zip = await JSZip.loadAsync(await file.arrayBuffer()), moduleId = uid('site'), entries = Object.values(zip.files).filter(function (entry) { return !entry.dir; });
    var folders = {}, kept = [], skipped = [], routedWorldFiles = [], importedGalaxy = false, importedContinents = 0;
    for (var i = 0; i < entries.length; i += 1) {
      var entry = entries[i], path = safePath(entry.name), ext = extension(path); if (!path) continue;
      var blob = await entry.async('blob'); if (blob.size > MAX_FILE) { skipped.push({ path: entry.name, reason: 'over 24,000 KB' }); continue; }
      if (ext === 'docx') { routedWorldFiles.push(new File([blob], path.split('/').pop(), { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })); skipped.push({ path: entry.name, reason: 'world document routed into the editor instead of retained in runtime modules' }); continue; }
      if (['zip', 'rar', '7z', 'exe', 'dll', 'msi', 'pdf'].includes(ext)) { skipped.push({ path: entry.name, reason: 'nested archive, executable, or full document' }); continue; }
      if (ext === 'json') { try { var parsed = JSON.parse(await blob.text()); if (parsed && parsed.system && Array.isArray(parsed.system.planets) && global.WorldBuilderGalaxy && WorldBuilderGalaxy.importState) { WorldBuilderGalaxy.importState(parsed, file.name + '/' + entry.name); importedGalaxy = true; } else if (parsed && Array.isArray(parsed.continents)) importedContinents += applyContinentSnapshot(parsed, file.name + '/' + entry.name); else if (parsed && (parsed.world || parsed.metadata || /(?:continent|world|planet|galaxy)/i.test(path))) routedWorldFiles.push(new File([blob], path.split('/').pop(), { type: 'application/json' })); } catch (_jsonError) {} }
      var folder = path.indexOf('/') >= 0 ? path.slice(0, path.lastIndexOf('/')) : '(root)'; folders[folder] = (folders[folder] || 0) + 1; if (folders[folder] > MAX_FOLDER) { skipped.push({ path: entry.name, reason: 'folder exceeds 900 files' }); continue; }
      var classification = classify(path, '', scope), record = { id: moduleId + ':' + path, moduleId: moduleId, path: path, originalName: entry.name, scope: classification.scope, kind: classification.kind, size: blob.size, blob: blob, importedAt: new Date().toISOString() }; await putRecord(record); kept.push(record);
    }
    if (routedWorldFiles.length && global.WorldBuilderImporter) await global.WorldBuilderImporter.handleFiles(routedWorldFiles);
    if (!kept.length && !routedWorldFiles.length && !importedGalaxy && !importedContinents) throw new Error(file.name + ' contained no safe runtime files.');
    if (!kept.length) return { kept: 0, skipped: skipped.length, routedWorldFiles: routedWorldFiles.length, importedGalaxy: importedGalaxy, importedContinents: importedContinents, moduleId: null };
    var entryPath = kept.find(function (record) { return /(^|\/)index\.html?$/i.test(record.path); });
    addModule({ id: moduleId, name: file.name, scope: scope, kind: entryPath ? 'standalone-site' : 'package', sourceType: 'zip', fileCount: kept.length, bytes: kept.reduce(function (sum, record) { return sum + record.size; }, 0), entry: entryPath && entryPath.path || kept[0].path, retainedIntact: true, skipped: skipped, importedAt: new Date().toISOString() });
    return { kept: kept.length, skipped: skipped.length, routedWorldFiles: routedWorldFiles.length, importedGalaxy: importedGalaxy, importedContinents: importedContinents, moduleId: moduleId };
  }
  async function routeDataFiles(files, scope) {
    var worldCandidates = files.filter(function (file) { return /\.(docx|json)$/i.test(file.name); });
    if (worldCandidates.length && global.WorldBuilderImporter && ['globe', 'weather', 'celestial'].includes(scope)) await global.WorldBuilderImporter.handleFiles(worldCandidates);
    if (global.LifeSimulation && LifeSimulation.importers && LifeSimulation.importers.queueFiles) {
      var accepted = files.filter(function (file) { return !/\.(js|css|glb|gltf|obj|mp3|wav|ogg)$/i.test(file.name); });
      if (accepted.length) await LifeSimulation.importers.queueFiles(accepted, true);
    }
  }
  async function handleFiles(fileList, requestedScope) {
    var files = Array.from(fileList || []), scope = requestedScope || activeScope(), results = []; if (!files.length) return results;
    status('Superbot is classifying ' + files.length + ' upload' + (files.length === 1 ? '' : 's') + ' for ' + scope + '…');
    for (var i = 0; i < files.length; i += 1) {
      var file = files[i];
      try {
        var hint = ''; if (/\.(js|css|html?|json|geojson|txt|md|csv|tsv)$/i.test(file.name) && file.size < 2 * 1024 * 1024) hint = await file.text();
        var classification = classify(file.name, hint, scope), result;
        if (classification.kind === 'package') result = await retainPackage(file, classification.scope); else if (classification.kind === 'code' || classification.kind === 'asset') result = await retainSingle(file, classification.scope, classification); else result = { routed: true };
        results.push({ ok: true, file: file.name, scope: classification.scope, kind: classification.kind, result: result });
      } catch (error) { results.push({ ok: false, file: file.name, error: error.message || String(error) }); }
    }
    try { await routeDataFiles(files, scope); } catch (error) { results.push({ ok: false, file: 'data routing', error: error.message || String(error) }); }
    var failed = results.filter(function (result) { return !result.ok; }); status(failed.length ? (results.length - failed.length) + ' upload(s) sorted; ' + failed.length + ' need review.' : files.length + ' upload(s) sorted and connected to ' + scope + '.', failed.length ? 'warning' : 'success');
    document.dispatchEvent(new CustomEvent('worldbuilder:uploads-routed', { detail: { scope: scope, results: deep(results), manifest: deep(manifest) } })); renderSummary(); return results;
  }
  function renderSummary() {
    var host = q('upload-library-summary'); if (!host) return;
    if (!manifest.modules.length) { host.textContent = 'No external modules retained yet.'; return; }
    host.innerHTML = manifest.modules.map(function (module) { var canStyle = module.kind === 'code' || module.kind === 'standalone-site' || /\.css$/i.test(module.entry || ''); return '<article class="upload-module-card"><strong>' + escapeHtml(module.name) + '</strong><span>' + escapeHtml(module.scope) + ' · ' + module.fileCount + ' intact file(s) · ' + (module.bytes / 1024 / 1024).toFixed(2) + ' MB</span><div class="button-row"><button class="text-button" data-preview-upload="' + module.id + '" type="button">Preview isolated</button>' + (canStyle ? '<button class="text-button" data-apply-upload="' + module.id + '" type="button">Apply scoped CSS</button>' : '') + '</div></article>'; }).join('');
    host.querySelectorAll('[data-preview-upload]').forEach(function (button) { button.onclick = function () { previewModule(button.dataset.previewUpload).catch(function (error) { status('Preview failed: ' + error.message, 'error'); }); }; });
    host.querySelectorAll('[data-apply-upload]').forEach(function (button) { button.onclick = function () { applyModuleStyles(button.dataset.applyUpload).catch(function (error) { status('Style activation failed: ' + error.message, 'error'); }); }; });
  }
  async function moduleRecords(moduleId) { return (await allRecords()).filter(function (record) { return record.moduleId === moduleId; }); }
  async function previewModule(moduleId) {
    var module = manifest.modules.find(function (item) { return item.id === moduleId; }); if (!module) throw new Error('Module not found.'); var records = await moduleRecords(moduleId), htmlRecord = records.find(function (record) { return record.path === module.entry && /\.html?$/i.test(record.path); }) || records.find(function (record) { return /(^|\/)index\.html?$/i.test(record.path); }), css = '';
    for (var i = 0; i < records.length; i += 1) if (/\.css$/i.test(records[i].path)) css += '\n/* ' + records[i].path + ' */\n' + await records[i].blob.text();
    var body = htmlRecord ? new DOMParser().parseFromString(await htmlRecord.blob.text(), 'text/html').body : null;
    if (body) body.querySelectorAll('script,iframe,object,embed').forEach(function (node) { node.remove(); });
    var shell = document.createElement('div'); shell.className = 'module-preview-shell'; shell.innerHTML = '<div class="module-preview-card"><div class="module-preview-head"><strong>' + escapeHtml(module.name) + '</strong><span>Isolated Shadow DOM preview · scripts paused</span><button type="button" data-close-preview>Close</button></div><div class="module-shadow-host"></div></div>'; document.body.appendChild(shell); shell.querySelector('[data-close-preview]').onclick = function () { shell.remove(); };
    var shadow = shell.querySelector('.module-shadow-host').attachShadow({ mode: 'open' }), reset = ':host{display:block;min-height:420px;background:#fff;color:#111;font-family:system-ui;overflow:auto}*,*:before,*:after{box-sizing:border-box}'; shadow.innerHTML = '<style>' + reset + css + '</style>' + (body ? body.innerHTML : '<main class="module-preview-sample"><h1>' + escapeHtml(module.name) + '</h1><p>This scoped stylesheet is retained intact. Activate it only when you want it applied to the ' + escapeHtml(module.scope) + ' page.</p><button>Sample control</button><section><h2>Visual module sample</h2><p>Typography, panels, colors, borders, and spacing appear here without entering WorldBuilder’s global CSS cascade.</p></section></main>');
    status(module.name + ' opened in an isolated preview.', 'success');
  }
  async function applyModuleStyles(moduleId) {
    var module = manifest.modules.find(function (item) { return item.id === moduleId; }); if (!module) throw new Error('Module not found.'); var records = await moduleRecords(moduleId), css = '';
    for (var i = 0; i < records.length; i += 1) if (/\.css$/i.test(records[i].path)) css += '\n' + await records[i].blob.text();
    if (!css.trim()) throw new Error('This module contains no CSS file.'); var old = document.querySelector('style[data-worldbuilder-upload="' + module.id + '"]'); if (old) old.remove(); var style = document.createElement('style'); style.dataset.worldbuilderUpload = module.id; style.textContent = '@scope (#page-' + module.scope + ') {\n' + css + '\n}'; document.head.appendChild(style); status(module.name + ' CSS applied only inside the ' + module.scope + ' page.', 'success'); document.dispatchEvent(new CustomEvent('worldbuilder:upload-style-applied', { detail: { module: deep(module) } })); return true;
  }
  function projectIndexHtml(projectName, moduleRows) {
    return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escapeHtml(projectName) + ' · UniversalSimulator Export</title><style>body{margin:0;background:#07111c;color:#efffff;font:16px/1.5 system-ui;padding:32px}main{max-width:1100px;margin:auto}section{margin:16px 0;padding:18px;border:1px solid #00ffff55;border-radius:16px;background:#0f1b29}a{color:#00ffff}code{color:#f4edb8}</style><main><h1>' + escapeHtml(projectName) + '</h1><p>Complete UniversalSimulator project exchange. Import <code>project/galaxy.json</code> into UniversalSimulator. Standalone modules remain in their original internal structure beneath <code>modules/</code>.</p><section><h2>Retained modules</h2>' + (moduleRows || '<p>None.</p>') + '</section><section><h2>Project data</h2><ul><li>Galaxy and planets</li><li>Globe and continent editor</li><li>Weather-linked celestial system</li><li>UniversalSimulator state</li><li>Universal Covenant Engine rules</li><li>Planet-specific lore and systems</li><li>Upload provenance</li></ul></section></main></html>';
  }
  async function exportUnified() {
    if (!global.JSZip) throw new Error('ZIP export support is unavailable.'); status('Building complete UniversalSimulator project ZIP…');
    var zip = new JSZip(), galaxy = global.WorldBuilderGalaxy && WorldBuilderGalaxy.getState ? WorldBuilderGalaxy.getState() : {}, projectName = galaxy.projectName || q('world-title') && q('world-title').value || 'UniversalSimulator_Project';
    zip.file('project/galaxy.json', JSON.stringify(galaxy, null, 2));
    zip.file('project/celestial.json', JSON.stringify(global.WorldBuilderCelestial && WorldBuilderCelestial.getState ? WorldBuilderCelestial.getState() : {}, null, 2));
    zip.file('project/world_lore.json', JSON.stringify(global.WorldBuilderLore && WorldBuilderLore.getState ? WorldBuilderLore.getState() : {}, null, 2));
    zip.file('project/deep_sky.json', JSON.stringify(global.WorldBuilderDeepSky && WorldBuilderDeepSky.getState ? WorldBuilderDeepSky.getState() : {}, null, 2));
    zip.file('project/continent_editor.json', JSON.stringify(global.WorldBuilderEditor && WorldBuilderEditor.getSnapshot ? WorldBuilderEditor.getSnapshot() : {}, null, 2));
    zip.file('project/universal_simulator.json', JSON.stringify(global.UniversalSimulator && UniversalSimulator.store ? UniversalSimulator.store.get() : {}, null, 2));
    if (global.UniversalRules) {
      await UniversalRules.loadFullData();
      (UniversalRules.runtime.files || []).forEach(function (file) { var key = file.replace(/\.json$/i, ''); if (UniversalRules.full[key]) zip.file('rules/' + file, JSON.stringify(UniversalRules.full[key], null, 2)); });
    }
    zip.file('project/uploads_manifest.json', JSON.stringify(manifest, null, 2));
    var records = await allRecords(), rows = [];
    records.forEach(function (record) { var module = manifest.modules.find(function (item) { return item.id === record.moduleId; }), base = 'modules/' + safeSegment(module && module.name.replace(/\.[^.]+$/, '') || record.moduleId) + '/'; zip.file(base + record.path, record.blob); });
    manifest.modules.forEach(function (module) { rows.push('<p><strong>' + escapeHtml(module.name) + '</strong> — ' + escapeHtml(module.scope) + ', ' + module.fileCount + ' files. Entry: <code>' + escapeHtml(module.entry) + '</code></p>'); });
    zip.file('index.html', projectIndexHtml(projectName, rows.join(''))); zip.file('README.txt', 'UniversalSimulator complete project exchange\n\nOpen index.html for the package catalog. Import project/galaxy.json or this ZIP into UniversalSimulator. The campaign scope is Medieval through Interstellar.\n');
    var blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } }, function (meta) { status('Building complete UniversalSimulator project ZIP… ' + Math.round(meta.percent) + '%'); }), link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = safeSegment(projectName) + '_Complete_UniversalSimulator_Project.zip'; link.click(); setTimeout(function () { URL.revokeObjectURL(link.href); }, 1500); status('Complete UniversalSimulator project ZIP created.', 'success'); return blob;
  }
  function bindZone(zone, input, scopeResolver) {
    if (!zone || !input) return; zone.addEventListener('click', function (event) { if (event.target !== input) input.click(); }); zone.addEventListener('keydown', function (event) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); input.click(); } });
    input.addEventListener('change', function () { handleFiles(input.files, scopeResolver()); input.value = ''; });
    ['dragenter', 'dragover'].forEach(function (name) { zone.addEventListener(name, function (event) { event.preventDefault(); zone.classList.add('dragging'); }); });
    ['dragleave', 'drop'].forEach(function (name) { zone.addEventListener(name, function (event) { event.preventDefault(); zone.classList.remove('dragging'); }); });
    zone.addEventListener('drop', function (event) { handleFiles(event.dataTransfer && event.dataTransfer.files, scopeResolver()); });
  }
  function init() { loadMeta(); bindZone(q('global-upload-zone'), q('global-upload-input'), activeScope); var exportButton = q('export-unified-workspace'); if (exportButton) exportButton.onclick = function () { exportUnified().catch(function (error) { status('Export failed: ' + error.message, 'error'); }); }; renderSummary(); }
  document.addEventListener('DOMContentLoaded', init);
  global.WorldBuilderUploadRouter = { handleFiles: handleFiles, exportUnified: exportUnified, getManifest: function () { return deep(manifest); }, allRecords: allRecords, previewModule: previewModule, applyModuleStyles: applyModuleStyles, applyContinentSnapshot: applyContinentSnapshot, classify: classify, limits: { maxFileBytes: MAX_FILE, maxFilesPerFolder: MAX_FOLDER } };
}(window));

;/* WorldBuilder companion metadata */
(function(g){'use strict';var m={module:'js.upload_router',category:'system',sourceFile:'js/upload_router.js',companionCss:'css/upload_router.css',accessModel:'front-facing-authoring'};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;})(window);
