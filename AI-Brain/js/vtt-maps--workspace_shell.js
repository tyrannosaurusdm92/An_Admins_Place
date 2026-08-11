/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function (global) {
  'use strict';
  var PAGE_ORDER = ['globe', 'weather', 'celestial', 'galaxy', 'life', 'lore'];
  function q(id) { return document.getElementById(id); }
  function make(tag, className, html) { var node = document.createElement(tag); if (className) node.className = className; if (html != null) node.innerHTML = html; return node; }
  function detachLegacy(id) { var node = q(id); if (!node) return null; node.classList.remove('page', 'active', 'workspace-secondary'); node.classList.add('workspace-legacy-panel'); node.removeAttribute('aria-hidden'); return node; }
  function tabStrip(group, tabs, active) { return '<div class="workspace-tabs workspace-group-tabs" role="tablist" aria-label="' + group + ' sections">' + tabs.map(function (tab) { return '<button class="' + (tab.id === active ? 'active' : '') + '" data-workspace-group="' + group + '" data-workspace-tab="' + tab.id + '" type="button">' + tab.label + '</button>'; }).join('') + '</div>'; }
  function buildGlobe(main) {
    var viewer = detachLegacy('page-viewer'), terrain = detachLegacy('page-terrain'), imports = detachLegacy('page-imports'); if (!viewer || !terrain || !imports) return;
    viewer.dataset.workspacePanel = 'viewer'; terrain.dataset.workspacePanel = 'terrain'; imports.dataset.workspacePanel = 'start';
    var wrapper = make('section', 'page', tabStrip('globe', [{ id: 'continent', label: 'Continent Editor' }, { id: 'viewer', label: 'Globe / Depth Viewer' }, { id: 'start', label: 'Upload / Start World' }], 'continent')); wrapper.id = 'page-globe'; wrapper.append(viewer, terrain, imports); main.insertBefore(wrapper, main.firstElementChild);
    activateGlobe('continent');
  }
  function activateGlobe(tab) {
    document.querySelectorAll('[data-workspace-group="globe"]').forEach(function (button) { button.classList.toggle('active', button.dataset.workspaceTab === tab); });
    var viewer = q('page-viewer'), terrain = q('page-terrain'), start = q('page-imports');
    [viewer, terrain, start].forEach(function (panel) { if (panel) panel.classList.remove('active'); });
    if (tab === 'continent') { if (viewer) viewer.classList.add('active'); if (terrain) terrain.classList.add('active'); }
    else if (tab === 'viewer') { if (viewer) viewer.classList.add('active'); }
    else { if (start) start.classList.add('active'); if (viewer) viewer.classList.add('active'); }
    setTimeout(function () { if (global.WorldBuilderEditor && WorldBuilderEditor.forceResize) WorldBuilderEditor.forceResize(); }, 80);
  }
  function buildWeather(main) {
    var legacy = q('page-environment'); if (!legacy) return; var windows = Array.from(legacy.querySelectorAll(':scope > .page-grid > .window')), ids = ['climate', 'water', 'atmosphere'];
    var wrapper = make('section', 'page', '<div class="workspace-page-heading"><div><span class="eyebrow">Planetary circulation workshop</span><h2>Weather Editor</h2><p>Edit climate circulation, wet and dry regimes, severe systems, tides, water depth realms, poles, coordinates, and atmospheric behavior.</p></div><div class="header-chip">MOON-LINKED</div></div>' + tabStrip('weather', [{ id: 'climate', label: 'Climate &amp; Weather' }, { id: 'water', label: 'Water &amp; Tides' }, { id: 'atmosphere', label: 'Poles &amp; Atmosphere' }], 'climate')); wrapper.id = 'page-weather';
    windows.forEach(function (windowNode, index) { windowNode.classList.add('workspace-weather-panel'); windowNode.dataset.workspacePanel = ids[index]; wrapper.appendChild(windowNode); }); legacy.remove(); main.appendChild(wrapper); activateSimple('weather', 'climate');
  }
  function moveLegacyLore() {
    var systems = q('page-systems'), exportsPage = q('page-exports'), superbot = q('page-superbot'), systemsMount = q('legacy-systems-mount'), exportsMount = q('legacy-exports-mount'), botMount = q('global-superbot-mount');
    if (systems && systemsMount) { while (systems.firstChild) systemsMount.appendChild(systems.firstChild); systems.remove(); }
    if (exportsPage && exportsMount) { while (exportsPage.firstChild) exportsMount.appendChild(exportsPage.firstChild); exportsPage.remove(); }
    if (superbot && botMount) { var consoleWindow = superbot.querySelector('.window'); if (consoleWindow) botMount.appendChild(consoleWindow); superbot.remove(); }
  }
  function activateSimple(group, tab) {
    document.querySelectorAll('[data-workspace-group="' + group + '"]').forEach(function (button) { button.classList.toggle('active', button.dataset.workspaceTab === tab); });
    var page = q('page-' + group); if (!page) return; page.querySelectorAll('[data-workspace-panel]').forEach(function (panel) { panel.classList.toggle('active', panel.dataset.workspacePanel === tab); });
  }
  function createIngestZones() {
    var descriptions = { globe: 'World maps, terrain code, images, ZIP sites, DOCX, JSON, GeoJSON', weather: 'Weather code, cloud assets, climate data, storm and tide sources', celestial: 'Moon data, aurora assets, atmosphere code, sky textures', galaxy: 'Solar-system sites, planet data, nebulae, starfields, orbit code', life: 'NPCs, races/species, locations, schedules, full UniversalSimulator packages', lore: 'Lore, transit, pantheons, factions, politics, canon and export modules' };
    PAGE_ORDER.forEach(function (pageName) { var page = q('page-' + pageName); if (!page || page.querySelector(':scope > .page-ingest-zone')) return; var zone = make('div', 'page-ingest-zone'); zone.dataset.scope = pageName; zone.tabIndex = 0; zone.setAttribute('role', 'button'); zone.innerHTML = '<input type="file" multiple><div><strong>Drop into ' + pageName + ' · Superbot sorts and connects it</strong><span>' + descriptions[pageName] + '</span></div>'; page.insertBefore(zone, page.firstChild); var input = zone.querySelector('input');
      function route(files) { if (global.WorldBuilderUploadRouter) WorldBuilderUploadRouter.handleFiles(files, pageName); }
      input.addEventListener('change', function () { route(input.files); input.value = ''; }); zone.addEventListener('keydown', function (event) { if (event.key === 'Enter' || event.key === ' ') input.click(); });
      ['dragenter', 'dragover'].forEach(function (eventName) { zone.addEventListener(eventName, function (event) { event.preventDefault(); zone.classList.add('dragging'); }); });
      ['dragleave', 'drop'].forEach(function (eventName) { zone.addEventListener(eventName, function (event) { event.preventDefault(); zone.classList.remove('dragging'); }); }); zone.addEventListener('drop', function (event) { route(event.dataTransfer && event.dataTransfer.files); });
    });
  }
  function bindTabs() {
    document.querySelectorAll('[data-workspace-group]').forEach(function (button) { button.addEventListener('click', function () { var group = button.dataset.workspaceGroup, tab = button.dataset.workspaceTab; if (group === 'globe') activateGlobe(tab); else activateSimple(group, tab); }); });
  }
  function bindDock() { var dock = q('global-superbot-dock'), toggle = q('superbot-dock-toggle'); if (!dock || !toggle) return; toggle.onclick = function () { var open = dock.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); if (open) { var input = q('bot-input'); if (input) setTimeout(function () { input.focus(); }, 50); } }; }
  function reorder(main) { PAGE_ORDER.forEach(function (name) { var page = q('page-' + name); if (page) main.appendChild(page); }); }
  function showInitial() {
    var stored = 'globe'; try { stored = localStorage.getItem('worldbuilder.unified.viewer.v5.page') || 'globe'; } catch (_error) {}
    if (!PAGE_ORDER.includes(stored)) stored = 'globe'; if (global.WorldBuilderViewerManager) WorldBuilderViewerManager.showPage(stored); else if (global.WorldBuilderGalaxyNavigation) WorldBuilderGalaxyNavigation.activatePage(stored);
    document.body.dataset.workspacePage = stored;
  }
  function init() {
    var main = document.querySelector('.app-shell > main'); if (!main) return; buildGlobe(main); buildWeather(main); moveLegacyLore(); reorder(main); bindTabs(); createIngestZones(); bindDock();
    document.querySelectorAll('.page').forEach(function (page) { page.setAttribute('data-drop-connected', 'true'); }); setTimeout(showInitial, 0);
    global.dispatchEvent(new CustomEvent('worldbuilder:workspace-ready', { detail: { pages: PAGE_ORDER.slice(), access: 'front-facing-authoring' } }));
  }
  document.addEventListener('DOMContentLoaded', init);
  global.WorldBuilderWorkspace = { pages: PAGE_ORDER.slice(), activateGlobe: activateGlobe, activatePage: function (name) { if (global.WorldBuilderViewerManager) WorldBuilderViewerManager.showPage(name); }, accessModel: 'front-facing-authoring' };
}(window));

;/* WorldBuilder companion metadata */
(function(g){'use strict';var m={module:'js.workspace_shell',category:'system',sourceFile:'js/workspace_shell.js',companionCss:'css/workspace_shell.css',accessModel:'front-facing-authoring'};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;})(window);
