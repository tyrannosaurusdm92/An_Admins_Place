/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function (global) {
  'use strict';

  var F = global.WorldBuilderRuntime = global.WorldBuilderRuntime || {};
  var TECHNOLOGY = {3:'Medieval',4:'Renaissance / Early Modern',5:'Industrial / Steam',6:'Electrified / Modern',7:'Digital / Atomic',8:'Planetary / Orbital',9:'Interplanetary',10:'Spacefaring / Interstellar'};
  var lastGenerated = null;

  function q(id) { return document.getElementById(id); }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function hash(value) { var h = 2166136261; String(value).split('').forEach(function (c) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }); return h >>> 0; }
  function rngFor(seed) { var a = hash(seed); return function () { a += 0x6D2B79F5; var t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function pick(rng, list) { return list[Math.floor(rng() * list.length)] || ''; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function slug(value) { return String(value || 'world').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90) || 'world'; }

  function connectivityLabel(value) {
    value = Number(value || 0);
    if (value < 15) return 'Isolated';
    if (value < 35) return 'Local';
    if (value < 65) return 'Regional';
    if (value < 85) return 'Global';
    return 'Hyperconnected';
  }

  function modesFor(tech, interconnectedness) {
    var modes = {3:['caravan','canal barge','sailing ship'],4:['carriage','oceanic sailing ship','semaphore route'],5:['rail','steamship','ferry','airship'],6:['electrified rail','airline','submarine','airship'],7:['high-speed rail','airline','autonomous ship','orbital aircraft'],8:['planetary transit','orbital shuttle','space elevator'],9:['interplanetary shuttle','transfer vessel','orbital relay'],10:['starship','worldship','jump route','portal']}[tech] || ['caravan'];
    var count = clamp(Math.ceil((Number(interconnectedness || 0) / 100) * modes.length), 1, modes.length);
    return modes.slice(0, count);
  }

  function populationBand(tech, area, rng) {
    var base = {3:1800000,4:4200000,5:9500000,6:24000000,7:78000000,8:140000000,9:210000000,10:260000000}[tech] || 1800000;
    return Math.round(base * clamp(area * 13, 0.45, 2.8) * (0.75 + rng() * 0.5));
  }

  function settlementCount(tech, area, interconnectedness) {
    return clamp(Math.round(2 + tech * 1.6 + area * 35 + interconnectedness / 20), 3, 36);
  }

  function buildContinentSystems(continent, climate, tech, interconnectedness, rng) {
    var count = settlementCount(tech, continent.geometry && continent.geometry.relativeArea || 0.08, interconnectedness);
    var modes = modesFor(tech, interconnectedness);
    var population = populationBand(tech, continent.geometry && continent.geometry.relativeArea || 0.08, rng);
    var settlements = [];
    for (var i = 0; i < count; i += 1) {
      settlements.push({
        id: continent.key + '-settlement-' + (i + 1),
        type: i === 0 ? 'capital' : (i < Math.ceil(count * 0.2) ? 'city' : (i < Math.ceil(count * 0.55) ? 'town' : 'village')),
        population: Math.max(80, Math.round(population / count * (0.45 + rng() * 1.2))),
        transit: modes.slice(0, 1 + Math.floor(rng() * modes.length)),
        climate: climate ? climate.zone : 'unclassified',
        relativePosition: { x: Number((0.12 + rng() * 0.76).toFixed(4)), y: Number((0.12 + rng() * 0.76).toFixed(4)) }
      });
    }
    var environment = global.WorldBuilderEnvironment;
    var generatedFeatures = [];
    ['terrain','shallowWater','mediumWater','deepWater','caves'].forEach(function (category) {
      var featureCount = category === 'terrain' ? 5 : 2;
      for (var f = 0; f < featureCount; f += 1) generatedFeatures.push({ type: category, subtype: environment.pick(category, rng), relativeX: Number(rng().toFixed(4)), relativeY: Number(rng().toFixed(4)), generated: true });
    });
    return {
      technology: TECHNOLOGY[tech],
      connectivity: connectivityLabel(interconnectedness),
      estimatedPopulation: population,
      primaryModes: modes,
      settlements: settlements,
      generatedFeatures: generatedFeatures,
      climate: clone(climate),
      administration: interconnectedness > 70 ? 'continent-wide coordinated institutions' : (interconnectedness > 35 ? 'regional governments and trade leagues' : 'local polities with limited shared administration')
    };
  }

  function generate() {
    if (!global.WorldBuilderEditor || !global.WorldBuilderMerge) return null;
    var snapshot = global.WorldBuilderEditor.getSnapshot();
    var merged = global.WorldBuilderMerge.build(snapshot);
    var climate = global.WorldBuilderClimate && global.WorldBuilderClimate.getLatest();
    var tech = clamp(Number(q('technology-level') && q('technology-level').value || 5), 3, 10);
    var interconnectedness = Number(q('interconnectedness') && q('interconnectedness').value || 55);
    var rng = rngFor((snapshot.title || 'world') + '|' + snapshot.preset + '|' + tech + '|' + interconnectedness + '|' + snapshot.continents.map(function (c) { return [c.key,c.lonShift,c.latShift,c.rotation].join(':'); }).join('|'));
    var climateByKey = {};
    (climate && climate.systems || []).forEach(function (system) { climateByKey[system.key] = system; });
    merged.world.technology = { level: tech, label: TECHNOLOGY[tech] };
    merged.world.interconnectedness = { value: interconnectedness, label: connectivityLabel(interconnectedness) };
    var tideIntensity = Number(q('tide-intensity') && q('tide-intensity').value || 72) / 100;
    merged.world.tides = global.WorldBuilderEnvironment.tideState((Date.now() / 86400000) % 330.15, tideIntensity);
    merged.world.climate = clone(climate);
    merged.continents.forEach(function (continent) {
      continent.generatedSystems = buildContinentSystems(continent, climateByKey[continent.key], tech, interconnectedness, rng);
    });
    var routeCandidates = [];
    for (var i = 0; i < merged.continents.length; i += 1) {
      for (var j = i + 1; j < merged.continents.length; j += 1) {
        if (rng() > interconnectedness / 100) continue;
        var a = merged.continents[i], b = merged.continents[j];
        routeCandidates.push({ from: a.key, to: b.key, mode: pick(rng, modesFor(tech, interconnectedness)), status: 'suggested', visibility: Number(q('route-visibility') && q('route-visibility').value || 82), rationale: 'Generated from current continent placement, technology, interconnectedness, and route visibility.' });
      }
    }
    merged.world.intercontinentalRoutes = routeCandidates;
    merged.world.backend = { endpoint: global.WorldBuilder_BACKEND_URL, libraryReference: global.WorldBuilder_LIBRARY_REFERENCE };
    merged.world.forgedAt = new Date().toISOString();
    lastGenerated = merged;
    updateSummary(merged);
    try { document.dispatchEvent(new CustomEvent('worldbuilder:systems-forged', { detail: { world: clone(merged) } })); } catch (_err) {}
    return merged;
  }

  function updateSummary(model) {
    var summary = q('world-merge-summary');
    var health = q('merge-health');
    if (!summary || !model) return;
    var overrides = model.continents.filter(function (c) { return c.overrideSource; }).length;
    var features = model.continents.reduce(function (sum, c) { return sum + (c.features || []).length; }, 0);
    var settlements = model.continents.reduce(function (sum, c) { return sum + (c.generatedSystems ? c.generatedSystems.settlements.length : 0); }, 0);
    summary.className = 'feature-summary';
    summary.innerHTML = '<strong>' + model.world.name + '</strong><div>' + model.continents.length + ' continents · ' + overrides + ' JSON overrides · ' + features + ' named features' + (settlements ? ' · ' + settlements + ' generated settlements' : '') + '</div><small>Precedence: DOCX baseline → continent JSON → live editor transforms.</small>';
    if (health) health.textContent = overrides ? 'Merged ' + overrides : (model.source || model.sections ? 'DOCX loaded' : 'Editor only');
  }

  function exportMerged() {
    var model = lastGenerated || generate() || global.WorldBuilderMerge.build();
    if (!model) return;
    var blob = new Blob([JSON.stringify(model, null, 2)], { type: 'application/json' });
    global.WorldBuilderEditor.downloadBlob(blob, slug(model.world && model.world.name) + '-worldbuilder-merged.json');
    global.WorldBuilderEditor.toast('Merged world JSON exported.');
  }

  function updateLabels() {
    var tech = clamp(Number(q('technology-level') && q('technology-level').value || 5), 3, 10);
    var inter = Number(q('interconnectedness') && q('interconnectedness').value || 55);
    if (q('technology-label')) q('technology-label').textContent = TECHNOLOGY[tech];
    if (q('interconnectedness-label')) q('interconnectedness-label').textContent = connectivityLabel(inter);
  }

  function bind() {
    var forge = q('forge-world-systems');
    if (!forge) return;
    q('technology-level').addEventListener('input', updateLabels);
    q('interconnectedness').addEventListener('input', updateLabels);
    forge.addEventListener('click', function () { generate(); global.WorldBuilderEditor.toast('World systems regenerated from the current geography.'); });
    q('export-world-json').addEventListener('click', exportMerged);
    updateLabels();
  }

  F.TECHNOLOGY = Object.assign({}, TECHNOLOGY);
  F.generate = generate;
  F.getLastGenerated = function () { return clone(lastGenerated); };
  F.exportMerged = exportMerged;

  bind();
  document.addEventListener('worldbuilder:merged-model', function (event) { updateSummary(event.detail && event.detail.model); });
}(window));

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.forge_runtime","category":"system","sourceFile":"js/forge_runtime.js","companionCss":"css/forge_runtime.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
