/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function (global) {
  'use strict';
  var STORE = 'worldbuilder.celestial.editor.v1';
  var state = { selectedPlanetId: null, planets: {} };
  var drawing = false;
  function q(id) { return document.getElementById(id); }
  function deep(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
  function uid(prefix) { return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
  function escapeHtml(value) { var div = document.createElement('div'); div.textContent = value == null ? '' : String(value); return div.innerHTML; }
  function galaxyState() { return global.WorldBuilderGalaxy && global.WorldBuilderGalaxy.getState ? global.WorldBuilderGalaxy.getState() : null; }
  function planets() { var galaxy = galaxyState(); return galaxy && galaxy.system && Array.isArray(galaxy.system.planets) ? galaxy.system.planets : []; }
  function selectedPlanet() { return planets().find(function (planet) { return planet.id === state.selectedPlanetId; }) || planets()[0] || null; }
  function localPlanet(id) {
    state.planets[id] = state.planets[id] || {
      layout: 'independent', aurora: { north: 72, south: 58, solarWind: 46, magnetic: 1, colors: ['#36ffb5', '#8d7bff'] },
      nearbyObjects: [], sky: { heightKm: 100, cloud: 55, haze: 28, dayColor: '#397ea7', twilightColor: '#8d701d', airglowColor: '#00ffff' }
    };
    return state.planets[id];
  }
  function load() { try { var saved = JSON.parse(localStorage.getItem(STORE) || 'null'); if (saved && saved.planets) state = saved; } catch (_error) {} }
  function save(reason) {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (_error) {}
    document.dispatchEvent(new CustomEvent('worldbuilder:celestial-change', { detail: { state: deep(state), planet: deep(selectedPlanet()), reason: reason || '' } }));
  }
  function ensureMainWorld() {
    var list = planets(); if (!list.length || !global.WorldBuilderGalaxy) return;
    var main = list.find(function (planet) { return planet.isMainWorld; });
    if (!main) { main = list[0]; global.WorldBuilderGalaxy.applyPatch(main.id, { isMainWorld: true }, 'Assigned the initial main world.'); }
    if (!Array.isArray(main.moons) || main.moons.length < 1 || main.moons.length > 3) global.WorldBuilderGalaxy.applyPatch(main.id, { moonCount: clamp(main.moons && main.moons.length || 2, 1, 3) }, 'Normalized the main world to the supported one-to-three-moon weather system.');
    if (!state.selectedPlanetId || !list.some(function (planet) { return planet.id === state.selectedPlanetId; })) state.selectedPlanetId = main.id;
  }
  function setMainWorld(id) {
    if (!global.WorldBuilderGalaxy) return;
    var list = planets(), target = list.find(function (planet) { return planet.id === id; });
    list.filter(function (planet) { return planet.id !== id && planet.isMainWorld; }).forEach(function (planet) { global.WorldBuilderGalaxy.applyPatch(planet.id, { isMainWorld: false }, 'Released ' + planet.name + ' as main world.'); });
    if (target && !target.isMainWorld) global.WorldBuilderGalaxy.applyPatch(target.id, { isMainWorld: true }, 'Assigned ' + target.name + ' as main world.');
  }
  function populatePlanets() {
    var list = planets(), selects = [q('celestial-planet-select'), q('lore-planet-select')].filter(Boolean);
    selects.forEach(function (select) {
      var current = select.id === 'celestial-planet-select' ? state.selectedPlanetId : select.value;
      select.innerHTML = list.map(function (planet) { return '<option value="' + planet.id + '">' + escapeHtml(planet.name) + (planet.isMainWorld ? ' · Main world' : '') + '</option>'; }).join('');
      if (list.some(function (planet) { return planet.id === current; })) select.value = current; else if (list[0]) select.value = list[0].id;
    });
  }
  function moonPeriodDays(moon, planet) {
    var orbit = Math.max(1000, Number(moon.orbitKm) || 100000), mass = Math.max(.001, Number(planet.massEarth) || 1);
    return Math.max(.15, 27.3 * Math.pow(orbit / 384400, 1.5) / Math.sqrt(mass));
  }
  function moonWeight(moon, planet) {
    var radius = Math.max(10, Number(moon.radiusKm) || 1000), orbit = Math.max(radius * 2, Number(moon.orbitKm) || 100000);
    var earthMoon = Math.pow(1737, 3) / Math.pow(384400, 3);
    return clamp((Math.pow(radius, 3) / Math.pow(orbit, 3)) / earthMoon / Math.max(.15, Number(planet.massEarth) || 1), .02, 8);
  }
  function tidalState(day, planetId) {
    var planet = planets().find(function (item) { return item.id === planetId; }) || selectedPlanet();
    if (!planet) return { heightFactor: 1, alignment: 0, label: 'no lunar tide', components: [] };
    var moons = (planet.moons || []).slice(0, planet.isMainWorld ? 3 : 20), components = [], totalWeight = 0, signal = 0;
    moons.forEach(function (moon, index) {
      var period = moonPeriodDays(moon, planet), weight = moonWeight(moon, planet), direction = moon.retrograde ? -1 : 1;
      var phase = (((Number(day) || 0) / period * direction + index * .173) % 1 + 1) % 1;
      signal += Math.cos(phase * Math.PI * 2) * weight; totalWeight += weight;
      components.push({ id: moon.id, name: moon.name, phase: phase, periodDays: period, weight: weight, retrograde: !!moon.retrograde });
    });
    var alignment = totalWeight ? signal / totalWeight : 0, amplitude = clamp(totalWeight / Math.max(1, moons.length), .12, 2.5);
    return { heightFactor: 1 + alignment * .42 * amplitude, alignment: alignment, amplitude: amplitude, label: alignment > .58 ? 'compound spring tide' : alignment < -.48 ? 'compound neap tide' : 'mixed lunar beat', components: components };
  }
  function drawTides() {
    var canvas = q('celestial-tide-canvas'), planet = selectedPlanet(); if (!canvas || !planet) return;
    var ctx = canvas.getContext('2d'), width = canvas.width, height = canvas.height, pad = 44, days = 40;
    ctx.clearRect(0, 0, width, height); ctx.fillStyle = '#050a12'; ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(201,246,255,.15)'; ctx.lineWidth = 1;
    for (var row = 0; row <= 4; row += 1) { var y = pad + (height - pad * 2) * row / 4; ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(width - pad, y); ctx.stroke(); }
    ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 3; ctx.beginPath();
    for (var i = 0; i <= 320; i += 1) { var day = days * i / 320, tide = tidalState(day, planet.id); var x = pad + (width - pad * 2) * i / 320, py = height / 2 - (tide.heightFactor - 1) * (height - pad * 2) * .72; if (i) ctx.lineTo(x, py); else ctx.moveTo(x, py); }
    ctx.stroke(); ctx.fillStyle = '#f4edb8'; ctx.font = '700 14px system-ui'; ctx.fillText('0 days', pad, height - 14); ctx.fillText(days + ' days', width - pad - 54, height - 14);
    var now = tidalState((galaxyState() || {}).epochDay || 0, planet.id), metrics = q('celestial-tide-metrics');
    if (metrics) metrics.innerHTML = '<div><strong>' + (planet.moons || []).length + '</strong><span>moons</span></div><div><strong>' + now.heightFactor.toFixed(2) + '×</strong><span>current height factor</span></div><div><strong>' + now.amplitude.toFixed(2) + '×</strong><span>lunar forcing</span></div><div><strong>' + escapeHtml(now.label) + '</strong><span>tide state</span></div>';
  }
  function renderMoons() {
    var planet = selectedPlanet(), host = q('celestial-moon-list'); if (!planet || !host) return;
    q('celestial-main-world').checked = !!planet.isMainWorld;
    q('celestial-moon-count').value = String(clamp((planet.moons || []).length || 1, 1, 3));
    q('celestial-moon-layout').value = localPlanet(planet.id).layout || 'independent';
    host.innerHTML = (planet.moons || []).slice(0, planet.isMainWorld ? 3 : 20).map(function (moon, index) {
      return '<article class="celestial-moon-card" data-moon-index="' + index + '"><div><strong>' + escapeHtml(moon.name) + '</strong><small>' + escapeHtml(moon.composition || 'rocky') + (moon.retrograde ? ' · retrograde' : '') + '</small></div><label><span>Name</span><input data-moon-field="name" value="' + escapeHtml(moon.name) + '"></label><div class="form-grid-2"><label><span>Radius km</span><input data-moon-field="radiusKm" type="number" min="10" value="' + Number(moon.radiusKm || 1000) + '"></label><label><span>Orbit km</span><input data-moon-field="orbitKm" type="number" min="1000" value="' + Number(moon.orbitKm || 100000) + '"></label></div><label class="check-label"><input data-moon-field="retrograde" type="checkbox" ' + (moon.retrograde ? 'checked' : '') + '> Retrograde orbit</label><small>Derived period ' + moonPeriodDays(moon, planet).toFixed(2) + ' days · tide weight ' + moonWeight(moon, planet).toFixed(2) + '×</small></article>';
    }).join('') || '<div class="feature-summary">No moons. A main world must use one to three.</div>';
    host.querySelectorAll('[data-moon-field]').forEach(function (control) { control.addEventListener('change', updateMoonFromControl); });
    var impact = tidalState((galaxyState() || {}).epochDay || 0, planet.id), weather = q('celestial-weather-impact');
    if (weather) weather.innerHTML = '<strong>Weather link active</strong><div>' + (planet.moons || []).length + ' moon(s) currently produce ' + impact.label + ' with ' + impact.amplitude.toFixed(2) + '× modeled tidal forcing. Coastal flooding, mixing, currents, humidity, and storm-surge risk inherit this state.</div>';
    drawTides();
  }
  function updateMoonFromControl(event) {
    var planet = selectedPlanet(), card = event.target.closest('[data-moon-index]'); if (!planet || !card) return;
    var moons = deep(planet.moons || []), moon = moons[Number(card.dataset.moonIndex)], field = event.target.dataset.moonField;
    if (!moon) return; moon[field] = event.target.type === 'checkbox' ? event.target.checked : (event.target.type === 'number' ? Number(event.target.value) : event.target.value);
    global.WorldBuilderGalaxy.applyPatch(planet.id, { moons: moons }, 'Updated ' + moon.name + ' and recalculated tides.'); save('moon-edited'); renderMoons();
  }
  function applyMoons() {
    var planet = selectedPlanet(); if (!planet || !global.WorldBuilderGalaxy) return;
    var count = clamp(q('celestial-moon-count').value, 1, 3), layout = q('celestial-moon-layout').value; localPlanet(planet.id).layout = layout;
    setMainWorld(planet.id); global.WorldBuilderGalaxy.applyPatch(planet.id, { moonCount: count, isMainWorld: true, lunarArchitecture: layout }, 'Applied ' + count + '-moon main-world system and recalculated weather.');
    save('main-world-moons'); setTimeout(sync, 20);
  }
  function renderObjects() {
    var planet = selectedPlanet(), host = q('nearby-object-list'); if (!planet || !host) return;
    var objects = localPlanet(planet.id).nearbyObjects;
    host.innerHTML = objects.length ? objects.map(function (object) { return '<article class="card" data-object-id="' + object.id + '"><div class="section-heading"><strong>' + escapeHtml(object.name) + '</strong><button class="text-button danger" data-remove-object="' + object.id + '" type="button">Remove</button></div><small>' + escapeHtml(object.type) + '</small><p>' + escapeHtml(object.notes) + '</p></article>'; }).join('') : '<div class="feature-summary empty">No nearby objects recorded for this planet.</div>';
    host.querySelectorAll('[data-remove-object]').forEach(function (button) { button.onclick = function () { var local = localPlanet(planet.id); local.nearbyObjects = local.nearbyObjects.filter(function (item) { return item.id !== button.dataset.removeObject; }); save('object-removed'); renderObjects(); }; });
  }
  function addObject() {
    var planet = selectedPlanet(); if (!planet) return; var type = q('nearby-object-type').value, name = q('nearby-object-name').value.trim() || type + ' ' + (localPlanet(planet.id).nearbyObjects.length + 1), notes = q('nearby-object-notes').value.trim();
    localPlanet(planet.id).nearbyObjects.unshift({ id: uid('object'), type: type, name: name, notes: notes, createdAt: new Date().toISOString() }); q('nearby-object-name').value = ''; q('nearby-object-notes').value = ''; save('object-added'); renderObjects();
  }
  function randomObject() { var types = ['Long-period comet', 'Trojan asteroid field', 'Derelict orbital habitat', 'Captured rubble moon', 'Dust torus', 'Luminous magical sky reef']; var pick = types[Math.floor(Math.random() * types.length)]; q('nearby-object-name').value = pick; q('nearby-object-notes').value = 'Inclined orbit with seasonally changing visibility; composition, hazards, and cultural interpretations remain editable.'; }
  function applyAurora() {
    var planet = selectedPlanet(); if (!planet) return; var model = localPlanet(planet.id).aurora;
    model.north = Number(q('aurora-north').value); model.south = Number(q('aurora-south').value); model.solarWind = Number(q('aurora-solar-wind').value); model.magnetic = Number(q('aurora-magnetic').value); model.colors = [q('aurora-color-a').value, q('aurora-color-b').value];
    if (global.WorldBuilderGalaxy) global.WorldBuilderGalaxy.applyPatch(planet.id, { magneticField: model.magnetic, aurora: deep(model) }, 'Updated aurora and magnetic-field model.'); save('aurora-applied');
  }
  function drawAurora(time) {
    var canvas = q('aurora-canvas'); if (!canvas) { drawing = false; return; } drawing = true; var ctx = canvas.getContext('2d'), planet = selectedPlanet(); if (!planet) return requestAnimationFrame(drawAurora);
    var model = localPlanet(planet.id).aurora, width = canvas.width, height = canvas.height, gradient = ctx.createLinearGradient(0, 0, 0, height); gradient.addColorStop(0, '#02040b'); gradient.addColorStop(.65, '#0b3357'); gradient.addColorStop(1, '#062d34'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
    [model.colors[0], model.colors[1]].forEach(function (color, band) { ctx.beginPath(); for (var x = -40; x <= width + 40; x += 12) { var wave = Math.sin(x * .012 + time * .00035 + band * 1.7) * (45 + model.solarWind * .35) + Math.sin(x * .031 - time * .00018) * 24; var y = height * (.28 + band * .11) + wave; if (x === -40) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.lineWidth = 22 + (band ? model.south : model.north) * .34; ctx.strokeStyle = color + '80'; ctx.shadowBlur = 34; ctx.shadowColor = color; ctx.stroke(); ctx.shadowBlur = 0; }); requestAnimationFrame(drawAurora);
  }
  function applySky() {
    var planet = selectedPlanet(); if (!planet) return; var sky = localPlanet(planet.id).sky;
    sky.heightKm = Number(q('sky-height').value); sky.cloud = Number(q('sky-cloud').value); sky.haze = Number(q('sky-haze').value); sky.dayColor = q('sky-day-color').value; sky.twilightColor = q('sky-twilight-color').value; sky.airglowColor = q('sky-airglow-color').value;
    if (global.WorldBuilderGalaxy) global.WorldBuilderGalaxy.applyPatch(planet.id, { skyModel: deep(sky) }, 'Updated upper-atmosphere and sky model.'); save('sky-applied'); renderSky();
  }
  function renderSky() {
    var planet = selectedPlanet(); if (!planet) return; var sky = localPlanet(planet.id).sky, preview = q('sky-preview');
    ['height', 'cloud', 'haze'].forEach(function (name) { var control = q('sky-' + name), output = q('sky-' + name + '-output'); if (control) control.value = sky[name === 'height' ? 'heightKm' : name]; if (output) output.textContent = control.value + (name === 'height' ? ' km' : '%'); });
    q('sky-day-color').value = sky.dayColor; q('sky-twilight-color').value = sky.twilightColor; q('sky-airglow-color').value = sky.airglowColor;
    if (preview) preview.style.background = 'radial-gradient(circle at 72% 16%,#fff 0 2%,transparent 9%),linear-gradient(180deg,' + sky.dayColor + ',' + sky.twilightColor + ' 72%,' + sky.airglowColor + ')';
    if (q('sky-summary')) q('sky-summary').innerHTML = '<strong>' + sky.heightKm + ' km modeled atmosphere</strong><div>' + sky.cloud + '% cloud deck and ' + sky.haze + '% high haze. Lighting changes feed the globe, weather, and settlement walkthrough state.</div>';
  }
  function switchTab(name) { document.querySelectorAll('[data-celestial-tab]').forEach(function (button) { button.classList.toggle('active', button.dataset.celestialTab === name); }); document.querySelectorAll('[data-celestial-panel]').forEach(function (panel) { panel.classList.toggle('active', panel.dataset.celestialPanel === name); }); if (name === 'moons') drawTides(); if (name === 'auroras' && !drawing) requestAnimationFrame(drawAurora); }
  function sync() {
    ensureMainWorld(); populatePlanets(); var select = q('celestial-planet-select'); if (select) select.value = state.selectedPlanetId;
    var planet = selectedPlanet(); if (!planet) return; var local = localPlanet(planet.id), aurora = local.aurora;
    q('aurora-north').value = aurora.north; q('aurora-south').value = aurora.south; q('aurora-solar-wind').value = aurora.solarWind; q('aurora-magnetic').value = aurora.magnetic; q('aurora-color-a').value = aurora.colors[0]; q('aurora-color-b').value = aurora.colors[1];
    renderMoons(); renderObjects(); renderSky();
  }
  function bind() {
    document.querySelectorAll('[data-celestial-tab]').forEach(function (button) { button.onclick = function () { switchTab(button.dataset.celestialTab); }; });
    q('celestial-planet-select').onchange = function (event) { state.selectedPlanetId = event.target.value; save('planet-selected'); sync(); };
    q('celestial-main-world').onchange = function (event) { if (event.target.checked) { setMainWorld(state.selectedPlanetId); sync(); } else { event.target.checked = true; } };
    q('celestial-apply-moons').onclick = applyMoons; q('aurora-apply').onclick = applyAurora; q('nearby-object-add').onclick = addObject; q('nearby-object-random').onclick = randomObject; q('sky-apply').onclick = applySky;
    ['sky-height', 'sky-cloud', 'sky-haze'].forEach(function (id) { q(id).oninput = renderSky; });
  }
  function init() { load(); bind(); sync(); }
  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('worldbuilder:galaxy-change', function () { setTimeout(sync, 0); });
  global.WorldBuilderCelestial = { getState: function () { return deep(state); }, getTidalState: tidalState, getSelectedPlanet: function () { return deep(selectedPlanet()); }, selectPlanet: function (id) { state.selectedPlanetId = id; save('planet-selected'); sync(); }, setMainWorld: setMainWorld, refresh: sync };
}(window));

;/* WorldBuilder companion metadata */
(function(g){'use strict';var m={module:'js.celestial_objects',category:'space',sourceFile:'js/celestial_objects.js',companionCss:'css/celestial_objects.css',accessModel:'front-facing-authoring'};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;})(window);
