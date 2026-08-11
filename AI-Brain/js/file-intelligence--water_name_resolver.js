/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
(function (global) {
  'use strict';

  var R = global.WorldBuilderWaterResolver = global.WorldBuilderWaterResolver || {};
  var queue = [];
  var active = null;
  var dismissed = new Set();
  var timer = null;

  function q(id) { return document.getElementById(id); }
  function normalize(value) { return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  function wrapLon(value) { var n = Number(value || 0); while (n > 180) n -= 360; while (n < -180) n += 360; return n; }
  function distance(a, b) { var mean = ((a.lat + b.lat) / 2) * Math.PI / 180; return Math.hypot(wrapLon(a.lon - b.lon) * Math.max(0.25, Math.cos(mean)), a.lat - b.lat); }
  function radius(continent) { return Math.max(continent.pixelWidth / continent.sourceWidth * 180, continent.pixelHeight / continent.sourceHeight * 90) * 0.42; }
  function moved(continent) { return Math.abs(continent.lonShift) > 0.25 || Math.abs(continent.latShift) > 0.25 || Math.abs(continent.rotation) > 0.25; }

  function hash(text) {
    var h = 2166136261;
    for (var i = 0; i < text.length; i += 1) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function syllables(name) {
    var clean = String(name || '').replace(/\b(the|ocean|sea|bay|gulf|sound|strait|lagoon|channel|inlet|fjord)\b/gi, ' ').replace(/[^A-Za-zÀ-ž'’-]+/g, ' ').trim();
    var parts = clean.split(/\s+|[-'’]/).filter(Boolean);
    var out = [];
    parts.forEach(function (part) {
      var bits = part.match(/[^aeiouyà-ž]*[aeiouyà-ž]+(?:[^aeiouyà-ž](?=[^aeiouyà-ž]*[aeiouyà-ž]|$))?/gi) || [part];
      bits.forEach(function (bit) { if (bit.length > 1) out.push(bit); });
    });
    return out.length ? out : parts;
  }

  function cap(value) { return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : ''; }

  function mergeName(a, b, attempt) {
    var aa = syllables(a), bb = syllables(b);
    var seed = hash(a + '|' + b + '|' + attempt);
    var takeA = 1 + seed % Math.max(1, Math.min(2, aa.length));
    var takeB = 1 + (seed >>> 5) % Math.max(1, Math.min(2, bb.length));
    var left = aa.slice(0, takeA).join('');
    var right = bb.slice(Math.max(0, bb.length - takeB)).join('');
    var base = cap((left + right).replace(/(.)\1\1+/g, '$1$1'));
    var types = ['Ocean', 'Sea', 'Bay', 'Gulf', 'Sound', 'Strait'];
    var preferred = /bay/i.test(a + b) ? 'Bay' : (/gulf/i.test(a + b) ? 'Gulf' : (/strait|channel/i.test(a + b) ? 'Strait' : types[(seed >>> 9) % types.length]));
    return base + ' ' + preferred;
  }

  function localWaterNames(continent, mergedModel) {
    var modelContinent = mergedModel && mergedModel.continents && mergedModel.continents.find(function (c) { return c.key === continent.key; });
    var names = global.WorldBuilderMerge && modelContinent ? global.WorldBuilderMerge.extractWaterNames(modelContinent) : [];
    if (names.length) return names;
    var features = continent.features || [];
    names = features.filter(function (feature) { return /(ocean|sea|bay|gulf|sound|strait|channel|lagoon|inlet|fjord)/i.test(String(feature.type || '')); }).map(function (feature) { return feature.name; });
    if (names.length) return names;
    // DOCX water catalogs are world-level rather than continent-owned. Assign a
    // stable local candidate order so topology changes can still be resolved.
    var catalogs = mergedModel && mergedModel.catalogs || {};
    var globalNames = [];
    ['oceans','seas','bays'].forEach(function (key) {
      (Array.isArray(catalogs[key]) ? catalogs[key] : []).forEach(function (item) {
        var name = typeof item === 'string' ? item : (item && (item.name || item.title || item.label));
        if (name && globalNames.indexOf(name) < 0) globalNames.push(name);
      });
    });
    if (!globalNames.length) return [];
    var start = hash(continent.key) % globalNames.length;
    return globalNames.slice(start).concat(globalNames.slice(0, start));
  }

  function detect(snapshot) {
    if (!snapshot || !snapshot.continents || snapshot.continents.length < 2) return [];
    var merged = global.WorldBuilderMerge && global.WorldBuilderMerge.build(snapshot);
    var resolved = new Set((snapshot.nameResolutions || []).map(function (item) { return item.id; }).filter(Boolean));
    var found = [];
    for (var i = 0; i < snapshot.continents.length; i += 1) {
      for (var j = i + 1; j < snapshot.continents.length; j += 1) {
        var a = snapshot.continents[i], b = snapshot.continents[j];
        if (!moved(a) && !moved(b)) continue;
        var d = distance(a.center, b.center), threshold = radius(a) + radius(b) + 8;
        if (d >= threshold) continue;
        var namesA = localWaterNames(a, merged), namesB = localWaterNames(b, merged);
        if (!namesA.length || !namesB.length) continue;
        var nameA = namesA[0], nameB = namesB[0];
        if (normalize(nameA) === normalize(nameB)) continue;
        var pair = [a.key, b.key].sort().join('|');
        var id = pair + '|' + [normalize(nameA), normalize(nameB)].sort().join('|');
        if (resolved.has(id) || dismissed.has(id)) continue;
        found.push({ id: id, continentA: a.key, continentB: b.key, continentNameA: a.name, continentNameB: b.name, nameA: nameA, nameB: nameB, distance: d, threshold: threshold, mergeAttempt: 0 });
      }
    }
    return found;
  }

  function fillModal(conflict) {
    var modal = q('water-conflict-modal');
    if (!modal) return;
    q('water-conflict-description').textContent = conflict.continentNameA + ' and ' + conflict.continentNameB + ' are now close enough to narrow, split, or close a former ocean corridor. Choose which water name survives, remove both, or create a merged replacement.';
    q('keep-water-a').textContent = 'Keep “' + conflict.nameA + '”';
    q('keep-water-b').textContent = 'Keep “' + conflict.nameB + '”';
    q('merged-water-name').value = mergeName(conflict.nameA, conflict.nameB, conflict.mergeAttempt++);
    modal.hidden = false;
    document.body.classList.add('modal-open');
  }

  function hideModal() {
    var modal = q('water-conflict-modal');
    if (modal) modal.hidden = true;
    document.body.classList.remove('modal-open');
    active = null;
    setTimeout(showNext, 50);
  }

  function showNext() {
    if (active || !queue.length) return;
    active = queue.shift();
    fillModal(active);
  }

  function resolve(action, newName) {
    if (!active) return;
    var payload = Object.assign({}, active, { action: action, newName: newName || null });
    global.WorldBuilderEditor.resolveWaterConflict(payload);
    if (global.WorldBuilderImporter) global.WorldBuilderImporter.log('Resolved changing water names: ' + active.nameA + ' / ' + active.nameB + ' → ' + (newName || action) + '.', 'success');
    hideModal();
  }

  function schedule(snapshot) {
    clearTimeout(timer);
    timer = setTimeout(function () {
      var conflicts = detect(snapshot || global.WorldBuilderEditor.getSnapshot());
      conflicts.forEach(function (conflict) {
        if (!queue.some(function (queued) { return queued.id === conflict.id; }) && (!active || active.id !== conflict.id)) queue.push(conflict);
      });
      showNext();
    }, 550);
  }

  function bind() {
    var random = q('randomize-water-name');
    if (!random) return;
    random.addEventListener('click', function () { if (active) q('merged-water-name').value = mergeName(active.nameA, active.nameB, active.mergeAttempt++); });
    q('keep-water-a').addEventListener('click', function () { resolve('keepA'); });
    q('keep-water-b').addEventListener('click', function () { resolve('keepB'); });
    q('remove-both-water').addEventListener('click', function () { resolve('removeBoth'); });
    q('save-merged-water').addEventListener('click', function () {
      var name = q('merged-water-name').value.trim();
      if (!name) { q('merged-water-name').focus(); return; }
      resolve('merge', name);
    });
    q('dismiss-water-conflict').addEventListener('click', function () { if (active) dismissed.add(active.id); hideModal(); });
  }

  R.detect = detect;
  R.mergeName = mergeName;
  R.schedule = schedule;

  bind();
  document.addEventListener('worldbuilder:project-change', function (event) { schedule(event.detail && event.detail.snapshot); });
}(window));

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.water_name_resolver","category":"water","sourceFile":"js/water_name_resolver.js","companionCss":"css/water_name_resolver.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
