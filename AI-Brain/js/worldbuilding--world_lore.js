/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
(function (global) {
  'use strict';
  var STORE = 'worldbuilder.world.lore.v1';
  var CATEGORIES = ['lore', 'transit', 'npcs', 'pantheons', 'schedules', 'politics', 'factions'];
  var LABELS = {
    lore: ['Lore kind', 'History, geography, culture, language, event, secret, custom'], transit: ['Transit mode', 'Rail, road, caravan, ferry, steamship, submarine, skyship, portal, orbital, custom'],
    npcs: ['Role / profession', 'Leader, worker, traveler, scholar, criminal, official, custom'], pantheons: ['Belief type', 'Deity, spirit, philosophy, ancestor, cosmic force, institution, custom'],
    schedules: ['Schedule scope', 'Person, location, route, faction, settlement, region, planet, custom'], politics: ['Political type', 'Government, law, office, election, conflict, treaty, policy, custom'],
    factions: ['Faction type', 'Guild, house, company, faith, movement, agency, syndicate, military, custom']
  };
  var state = { selectedPlanetId: null, planets: {} };
  function q(id) { return document.getElementById(id); }
  function deep(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function uid(prefix) { return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
  function safe(value) { return String(value || 'world').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[<>:"/\\|?*\x00-\x1f]/g, '-').replace(/\s+/g, '_').slice(0, 90); }
  function escapeHtml(value) { var div = document.createElement('div'); div.textContent = value == null ? '' : String(value); return div.innerHTML; }
  function galaxy() { return global.WorldBuilderGalaxy && global.WorldBuilderGalaxy.getState ? global.WorldBuilderGalaxy.getState() : null; }
  function planets() { var value = galaxy(); return value && value.system && value.system.planets || []; }
  function selectedPlanet() { return planets().find(function (planet) { return planet.id === state.selectedPlanetId; }) || planets()[0] || { id: 'base-world', name: 'Base World' }; }
  function planetData(id) { if (!state.planets[id]) { state.planets[id] = {}; CATEGORIES.forEach(function (category) { state.planets[id][category] = []; }); } CATEGORIES.forEach(function (category) { state.planets[id][category] = state.planets[id][category] || []; }); return state.planets[id]; }
  function load() { try { var saved = JSON.parse(localStorage.getItem(STORE) || 'null'); if (saved && saved.planets) state = saved; } catch (_error) {} }
  function save(reason) { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (_error) {} document.dispatchEvent(new CustomEvent('worldbuilder:lore-change', { detail: { state: deep(state), planet: deep(selectedPlanet()), reason: reason || '' } })); }
  function populatePlanetSelect() {
    var select = q('lore-planet-select'), list = planets(); if (!select) return;
    if (!list.length) list = [{ id: 'base-world', name: 'Base World', isMainWorld: true }];
    if (!state.selectedPlanetId || !list.some(function (planet) { return planet.id === state.selectedPlanetId; })) state.selectedPlanetId = (list.find(function (planet) { return planet.isMainWorld; }) || list[0]).id;
    select.innerHTML = list.map(function (planet) { return '<option value="' + planet.id + '">' + escapeHtml(planet.name) + (planet.isMainWorld ? ' · Main world' : '') + '</option>'; }).join(''); select.value = state.selectedPlanetId;
  }
  function formHtml(category) {
    var label = LABELS[category] || ['Record type', 'Custom'];
    return '<form class="lore-record-form" data-category="' + category + '"><input type="hidden" name="recordId"><label><span>Name</span><input name="name" required placeholder="Record name"></label><label><span>' + label[0] + '</span><input name="type" placeholder="' + label[1] + '"></label><label><span>Summary and editable canon</span><textarea name="description" required rows="6" placeholder="Describe this record in full…"></textarea></label><div class="form-grid-2"><label><span>Tags</span><input name="tags" placeholder="comma, separated"></label><label><span>Status</span><select name="status"><option>active</option><option>planned</option><option>historical</option><option>dormant</option><option>contested</option><option>custom</option></select></label></div><label><span>Relationships / dependencies</span><textarea name="relationships" rows="3" placeholder="Stable IDs or names this record affects"></textarea></label><div class="button-row"><button class="button accent" type="submit">Save ' + category + ' record</button><button class="button secondary" data-clear-form type="button">Clear</button></div><p class="note">Saved to the selected planet with a stable ID, modification time, and manual-edit provenance.</p></form>';
  }
  function installForms() {
    var loreMount = q('lore-form-mount'); if (loreMount) loreMount.innerHTML = formHtml('lore');
    document.querySelectorAll('[data-lore-form]').forEach(function (mount) { mount.innerHTML = formHtml(mount.dataset.loreForm); });
    document.querySelectorAll('.lore-record-form').forEach(function (form) {
      form.addEventListener('submit', function (event) { event.preventDefault(); saveForm(form); });
      var clear = form.querySelector('[data-clear-form]'); if (clear) clear.onclick = function () { form.reset(); form.elements.recordId.value = ''; };
    });
  }
  function saveForm(form) {
    var category = form.dataset.category, data = planetData(state.selectedPlanetId), id = form.elements.recordId.value || uid(category), existing = data[category].find(function (record) { return record.id === id; });
    var record = { id: id, planetId: state.selectedPlanetId, category: category, name: form.elements.name.value.trim(), type: form.elements.type.value.trim() || 'custom', description: form.elements.description.value.trim(), tags: form.elements.tags.value.split(',').map(function (item) { return item.trim(); }).filter(Boolean), status: form.elements.status.value, relationships: form.elements.relationships.value.split(/\n|,/).map(function (item) { return item.trim(); }).filter(Boolean), source: { type: 'manual-edit', protected: true }, createdAt: existing && existing.createdAt || new Date().toISOString(), modifiedAt: new Date().toISOString() };
    if (!record.name || !record.description) return;
    if (existing) data[category][data[category].indexOf(existing)] = record; else data[category].unshift(record);
    form.reset(); form.elements.recordId.value = ''; save(category + '-saved'); renderCategory(category); bridgeRecord(record);
  }
  function bridgeRecord(record) {
    if (record.category === 'npcs' && global.LifeSimulation && LifeSimulation.store && LifeSimulation.store.mutate) {
      LifeSimulation.store.mutate('worldbuilder-lore-npc', function (ls) { ls.npcs = ls.npcs || []; if (!ls.npcs.some(function (npc) { return npc.id === record.id; })) ls.npcs.push({ id: record.id, name: record.name, profession: record.type, notes: record.description, planetId: record.planetId, protected: true, source: 'WorldBuilder world-lore editor' }); });
    }
    document.dispatchEvent(new CustomEvent('worldbuilder:lore-record', { detail: { record: deep(record) } }));
  }
  function renderCategory(category) {
    var host = document.querySelector('[data-lore-list="' + category + '"]'); if (!host) return; var records = planetData(state.selectedPlanetId)[category];
    host.innerHTML = records.length ? records.map(function (record) { return '<article class="lore-record-card" data-record-id="' + record.id + '"><div class="section-heading"><div><strong>' + escapeHtml(record.name) + '</strong><small>' + escapeHtml(record.type) + ' · ' + escapeHtml(record.status) + '</small></div><div class="record-actions"><button class="text-button" data-edit-record="' + record.id + '" type="button">Edit</button><button class="text-button danger" data-remove-record="' + record.id + '" type="button">Remove</button></div></div><p>' + escapeHtml(record.description) + '</p><div class="record-tags">' + (record.tags || []).map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div><small>ID ' + record.id + ' · updated ' + new Date(record.modifiedAt).toLocaleString() + '</small></article>'; }).join('') : '<div class="feature-summary empty">No ' + category + ' records for ' + escapeHtml(selectedPlanet().name) + '.</div>';
    host.querySelectorAll('[data-edit-record]').forEach(function (button) { button.onclick = function () { editRecord(category, button.dataset.editRecord); }; });
    host.querySelectorAll('[data-remove-record]').forEach(function (button) { button.onclick = function () { removeRecord(category, button.dataset.removeRecord); }; });
  }
  function editRecord(category, id) {
    var record = planetData(state.selectedPlanetId)[category].find(function (item) { return item.id === id; }), form = document.querySelector('.lore-record-form[data-category="' + category + '"]'); if (!record || !form) return;
    form.elements.recordId.value = record.id; form.elements.name.value = record.name; form.elements.type.value = record.type; form.elements.description.value = record.description; form.elements.tags.value = (record.tags || []).join(', '); form.elements.status.value = record.status; form.elements.relationships.value = (record.relationships || []).join('\n'); form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function removeRecord(category, id) { var data = planetData(state.selectedPlanetId); data[category] = data[category].filter(function (record) { return record.id !== id; }); save(category + '-removed'); renderCategory(category); }
  function renderAll() { CATEGORIES.forEach(renderCategory); }
  function switchTab(category) { document.querySelectorAll('[data-lore-tab]').forEach(function (button) { button.classList.toggle('active', button.dataset.loreTab === category); }); document.querySelectorAll('[data-lore-panel]').forEach(function (panel) { panel.classList.toggle('active', panel.dataset.lorePanel === category); }); }
  function payload(planetId) { var planet = planets().find(function (item) { return item.id === planetId; }) || selectedPlanet(); return { schema: 'worldbuilder.planet-lore.v1', exportedAt: new Date().toISOString(), planet: deep(planet), records: deep(planetData(planetId || state.selectedPlanetId)) }; }
  function downloadJson() { var body = payload(state.selectedPlanetId), blob = new Blob([JSON.stringify(body, null, 2)], { type: 'application/json' }), link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = safe(body.planet.name) + '_World_Lore.json'; link.click(); setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000); }
  function sync() { populatePlanetSelect(); planetData(state.selectedPlanetId); renderAll(); }
  function bind() {
    document.querySelectorAll('[data-lore-tab]').forEach(function (button) { button.onclick = function () { switchTab(button.dataset.loreTab); }; });
    q('lore-planet-select').onchange = function (event) { state.selectedPlanetId = event.target.value; save('planet-selected'); renderAll(); };
    q('export-lore-json').onclick = downloadJson;
  }
  function init() { load(); installForms(); populatePlanetSelect(); bind(); renderAll(); }
  document.addEventListener('DOMContentLoaded', init); document.addEventListener('worldbuilder:galaxy-change', function () { setTimeout(sync, 0); });
  global.WorldBuilderLore = { getState: function () { return deep(state); }, getPlanetPayload: payload, addRecord: function (planetId, category, record) { var data = planetData(planetId); record = Object.assign({ id: uid(category), planetId: planetId, category: category, createdAt: new Date().toISOString(), modifiedAt: new Date().toISOString(), source: { type: 'import', protected: true } }, record); data[category].unshift(record); save('record-imported'); renderCategory(category); return deep(record); }, selectPlanet: function (id) { state.selectedPlanetId = id; save('planet-selected'); sync(); }, refresh: sync };
}(window));

;/* WorldBuilder companion metadata */
(function(g){'use strict';var m={module:'js.world_lore',category:'world-data',sourceFile:'js/world_lore.js',companionCss:'css/world_lore.css',accessModel:'front-facing-authoring'};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;})(window);
