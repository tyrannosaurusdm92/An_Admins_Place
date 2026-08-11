/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
(function (global) {
  'use strict';

  var M = global.WorldBuilderMerge = global.WorldBuilderMerge || {};
  var lastModel = null;

  function clone(value) {
    if (typeof structuredClone === 'function') {
      try { return structuredClone(value); } catch (_err) {}
    }
    if (typeof value === 'undefined') return undefined;
    return JSON.parse(JSON.stringify(value));
  }

  function deepMerge(base, override) {
    if (Array.isArray(override)) return override.map(clone);
    if (!override || typeof override !== 'object') return override;
    var out = base && typeof base === 'object' && !Array.isArray(base) ? clone(base) : {};
    Object.keys(override).forEach(function (key) {
      var value = override[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) out[key] = deepMerge(out[key], value);
      else out[key] = clone(value);
    });
    return out;
  }

  function normalizeKey(value) {
    return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function findBaselineContinent(baseline, continent) {
    if (!baseline || !continent) return {};
    var collections = [];
    if (Array.isArray(baseline.continents)) collections.push(baseline.continents);
    if (baseline.world && Array.isArray(baseline.world.continents)) collections.push(baseline.world.continents);
    if (baseline.catalogs && Array.isArray(baseline.catalogs.continents)) collections.push(baseline.catalogs.continents);
    var keys = [continent.key, continent.name, continent.defaultName].map(normalizeKey);
    for (var c = 0; c < collections.length; c += 1) {
      var found = collections[c].find(function (item) {
        var text = typeof item === 'string' ? item : (item.key || item.id || item.name || item.title);
        return keys.indexOf(normalizeKey(text)) >= 0;
      });
      if (found) return typeof found === 'string' ? { name: found } : clone(found);
    }
    if (baseline.sections) {
      var sectionKey = Object.keys(baseline.sections).find(function (heading) {
        var h = normalizeKey(heading);
        return keys.some(function (key) { return key && (h === key || h.indexOf(key) >= 0); });
      });
      if (sectionKey) return { name: continent.name, sourceSection: clone(baseline.sections[sectionKey]) };
    }
    return {};
  }

  function collectNamedFeatures(value, output, path, seen) {
    output = output || [];
    path = path || [];
    seen = seen || new Set();
    if (!value || typeof value !== 'object' || seen.has(value)) return output;
    seen.add(value);
    if (Array.isArray(value)) {
      value.forEach(function (item) { collectNamedFeatures(item, output, path, seen); });
      return output;
    }
    var name = value.name || value.title || value.label;
    var type = value.type || value.kind || value.category || path[path.length - 1];
    if (typeof name === 'string' && name.trim()) output.push({ name: name.trim(), type: String(type || 'feature').toLowerCase(), sourcePath: path.join('.') });
    Object.keys(value).forEach(function (key) {
      if (key === 'rawText' || key === 'textIndex' || key === 'xml') return;
      collectNamedFeatures(value[key], output, path.concat(key), seen);
    });
    return output;
  }

  function dedupeFeatures(features) {
    var seen = {};
    return (features || []).filter(function (feature) {
      var key = normalizeKey(feature.type) + '|' + normalizeKey(feature.name);
      if (!feature.name || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function build(snapshot) {
    snapshot = snapshot || (global.WorldBuilderEditor && global.WorldBuilderEditor.getSnapshot());
    if (!snapshot) return null;
    var baseline = clone(snapshot.worldBaseline || {});
    var model = deepMerge({}, baseline);
    model.schema = 'worldbuilder.merged-world.v3';
    model.generatedAt = new Date().toISOString();
    model.precedence = ['DOCX world baseline', 'continent JSON override', 'interactive editor changes'];
    model.world = model.world || {};
    model.world.name = snapshot.title || model.world.name || model.name || 'Untitled World';
    model.world.geologicalReferenceFrame = clone(snapshot.frame);
    model.world.oceanBorderUnit = snapshot.oceanUnit;
    model.continents = snapshot.continents.map(function (continent) {
      var fromBaseline = findBaselineContinent(baseline, continent);
      var resolved = deepMerge(fromBaseline, continent.overrideData || {});
      resolved.key = continent.key;
      resolved.name = continent.name;
      resolved.defaultName = continent.defaultName;
      resolved.transform = {
        initialCenter: clone(continent.initialCenter),
        currentCenter: clone(continent.center),
        longitudeShift: continent.lonShift,
        latitudeShift: continent.latShift,
        rotationDegrees: continent.rotation
      };
      resolved.geometry = {
        pixelWidth: continent.pixelWidth,
        pixelHeight: continent.pixelHeight,
        relativeArea: continent.relativeArea
      };
      var baselineFeatures = collectNamedFeatures(fromBaseline, []);
      var overrideFeatures = collectNamedFeatures(continent.overrideData || {}, []);
      resolved.features = dedupeFeatures(baselineFeatures.concat(overrideFeatures).concat(clone(continent.features || [])));
      resolved.overrideSource = clone(continent.overrideSource);
      return resolved;
    });
    model.nameResolutions = clone(snapshot.nameResolutions || []);
    model.editor = { terrain: clone(snapshot.terrain), selectedContinentKey: snapshot.selectedKey };
    lastModel = model;
    try { document.dispatchEvent(new CustomEvent('worldbuilder:merged-model', { detail: { model: clone(model) } })); } catch (_err) {}
    return model;
  }

  function extractWaterNames(continent) {
    var waterPattern = /(ocean|sea|bay|gulf|sound|strait|channel|lagoon|inlet|fjord|trenchsea|deep|water)/i;
    return dedupeFeatures((continent && continent.features || []).filter(function (feature) {
      return waterPattern.test(String(feature.type || '') + ' ' + String(feature.sourcePath || ''));
    })).map(function (feature) { return feature.name; });
  }

  M.clone = clone;
  M.deepMerge = deepMerge;
  M.normalizeKey = normalizeKey;
  M.build = build;
  M.getLastModel = function () { return clone(lastModel); };
  M.extractWaterNames = extractWaterNames;
  M.collectNamedFeatures = collectNamedFeatures;

  document.addEventListener('worldbuilder:ready', function (event) { build(event.detail && event.detail.snapshot); });
  document.addEventListener('worldbuilder:project-change', function (event) { build(event.detail && event.detail.snapshot); });
}(window));

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.world_merge_engine","category":"system","sourceFile":"js/world_merge_engine.js","companionCss":"css/world_merge_engine.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
