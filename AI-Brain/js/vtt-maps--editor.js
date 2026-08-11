/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
(function () {
  'use strict';

  var STORAGE_KEY = 'worldbuilder-galaxy-edition-v1';
  var PRESETS = window.WorldBuilder_CONTINENT_EDITOR_PRESETS || window.WorldBuilder_GEOLOGICAL_REFERENCE_PRESETS || {};
  var textureCanvas = document.getElementById('texture-canvas');
  var textureCtx = textureCanvas.getContext('2d');
  var mapCanvas = document.getElementById('map-canvas');
  var mapCtx = mapCanvas.getContext('2d');

  var els = {
    era: document.getElementById('era-select'),
    title: document.getElementById('world-title'),
    resetWorld: document.getElementById('reset-world'),
    selectionChip: document.getElementById('selection-chip'),
    continentName: document.getElementById('continent-name'),
    transformReadout: document.getElementById('transform-readout'),
    stepSize: document.getElementById('step-size'),
    resetContinent: document.getElementById('reset-continent'),
    oceanUnit: document.getElementById('ocean-unit'),
    featureCount: document.getElementById('feature-count'),
    featureUpload: document.getElementById('feature-upload'),
    uploadFeatures: document.getElementById('upload-features'),
    downloadTemplate: document.getElementById('download-template'),
    clearFeatures: document.getElementById('clear-features'),
    featureSummary: document.getElementById('feature-summary'),
    showFeatures: document.getElementById('show-features'),
    showGrid: document.getElementById('show-grid'),
    showNames: document.getElementById('show-names'),
    frameDescription: document.getElementById('frame-description'),
    status: document.getElementById('status'),
    globeWrap: document.getElementById('globe-wrap'),
    toggleSpin: document.getElementById('toggle-spin'),
    continentList: document.getElementById('continent-list'),
    exportSize: document.getElementById('export-size'),
    exportPng: document.getElementById('export-png'),
    exportHtml: document.getElementById('export-html'),
    toast: document.getElementById('toast'),
    toolChip: document.getElementById('tool-chip'),
    brushSize: document.getElementById('brush-size'),
    brushSizeValue: document.getElementById('brush-size-value'),
    useHeight: document.getElementById('use-height'),
    heightValue: document.getElementById('height-value'),
    heightOutput: document.getElementById('height-output'),
    useDepth: document.getElementById('use-depth'),
    depthValue: document.getElementById('depth-value'),
    depthOutput: document.getElementById('depth-output'),
    smudgeStrength: document.getElementById('smudge-strength'),
    smudgeOutput: document.getElementById('smudge-output'),
    extendBoundaries: document.getElementById('extend-boundaries'),
    autoMatchTerrain: document.getElementById('auto-match-terrain'),
    attachNewTerrain: document.getElementById('attach-new-terrain'),
    roundEdges: document.getElementById('round-edges'),
    clearHighlight: document.getElementById('clear-highlight'),
    undoTerrain: document.getElementById('undo-terrain'),
    saveCorrectPlates: document.getElementById('save-correct-plates'),
    plateReport: document.getElementById('plate-report')
  };

  var project = loadProject();
  var runtime = {
    preset: null,
    continents: [],
    byKey: {},
    selectedKey: null,
    dragging: false,
    dragStart: null,
    imagesReady: false,
    renderQueued: false,
    oceanCache: {},
    toastTimer: null,
    globe: null,
    tool: 'move',
    brushActive: false,
    activeStroke: null,
    highlight: [],
    brushCursor: null,
    editCanvas: document.createElement('canvas'),
    editCanvas2: document.createElement('canvas'),
    maskCanvas: document.createElement('canvas')
  };

  populateEraSelect();
  bindUi();
  switchPreset(project.currentPreset || 'base', false);
  initGlobe();
  installWorldBuilderApi();

  function defaultProject() {
    return {
      version: 3,
      currentPreset: 'base',
      title: 'My WorldBuilder World',
      oceanUnit: 'miles',
      showGrid: true,
      showNames: true,
      showFeatures: true,
      brushSizeKm: 300,
      terrainTypes: ['shallow', 'coastal', 'land'],
      useHeight: true,
      heightMeters: 1500,
      useDepth: true,
      depthMeters: 2500,
      smudgeStrength: 45,
      extendBoundaries: true,
      autoMatchTerrain: true,
      attachNewTerrain: true,
      worldBaseline: null,
      importLog: [],
      nameResolutions: [],
      states: {}
    };
  }

  function loadProject() {
    var base = defaultProject();
    try {
      var raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('geologic-continent-editor-v2') || localStorage.getItem('geologic-continent-editor-v1');
      if (!raw) return base;
      var parsed = JSON.parse(raw);
      Object.keys(base).forEach(function (key) {
        if (typeof parsed[key] !== 'undefined') base[key] = parsed[key];
      });
      if (!PRESETS[base.currentPreset]) base.currentPreset = 'base';
      return base;
    } catch (err) {
      return base;
    }
  }

  function saveProject() {
    project.currentPreset = String(els.era.value || project.currentPreset);
    project.title = els.title.value || 'My WorldBuilder World';
    project.oceanUnit = els.oceanUnit.value;
    project.showGrid = !!els.showGrid.checked;
    project.showNames = !!els.showNames.checked;
    project.showFeatures = !!els.showFeatures.checked;
    project.brushSizeKm = Number(els.brushSize.value || 300);
    project.terrainTypes = selectedTerrainTypes();
    project.useHeight = !!els.useHeight.checked;
    project.heightMeters = Number(els.heightValue.value || 0);
    project.useDepth = !!els.useDepth.checked;
    project.depthMeters = Number(els.depthValue.value || 0);
    project.smudgeStrength = Number(els.smudgeStrength.value || 45);
    project.extendBoundaries = !els.extendBoundaries || !!els.extendBoundaries.checked;
    project.autoMatchTerrain = !els.autoMatchTerrain || !!els.autoMatchTerrain.checked;
    project.attachNewTerrain = !els.attachNewTerrain || !!els.attachNewTerrain.checked;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (err) {
      // Large feature catalogs may exceed localStorage. The live project still works.
    }
    window.clearTimeout(runtime.projectChangeTimer);
    runtime.projectChangeTimer = window.setTimeout(function () {
      try { document.dispatchEvent(new CustomEvent('worldbuilder:project-change', { detail: { snapshot: buildWorldBuilderSnapshot() } })); } catch (_err) {}
    }, 40);
  }

  function populateEraSelect() {
    Object.keys(PRESETS).sort(function (a, b) { return Number(b) - Number(a); }).forEach(function (year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = PRESETS[year].label;
      els.era.appendChild(option);
    });
    els.era.value = project.currentPreset;
    els.title.value = project.title;
    els.oceanUnit.value = project.oceanUnit;
    els.showGrid.checked = project.showGrid;
    els.showNames.checked = project.showNames;
    els.showFeatures.checked = project.showFeatures;
    els.brushSize.value = project.brushSizeKm || 300;
    els.useHeight.checked = project.useHeight !== false;
    els.heightValue.value = Number(project.heightMeters || 1500);
    els.useDepth.checked = project.useDepth !== false;
    els.depthValue.value = Number(project.depthMeters || 2500);
    els.smudgeStrength.value = Number(project.smudgeStrength || 45);
    if (els.extendBoundaries) els.extendBoundaries.checked = project.extendBoundaries !== false;
    if (els.autoMatchTerrain) els.autoMatchTerrain.checked = project.autoMatchTerrain !== false;
    if (els.attachNewTerrain) els.attachNewTerrain.checked = project.attachNewTerrain !== false;
    Array.prototype.forEach.call(document.querySelectorAll('[data-terrain]'), function (input) {
      input.checked = (project.terrainTypes || ['shallow', 'coastal', 'land']).indexOf(input.getAttribute('data-terrain')) >= 0;
    });
    updateBrushUi();
    setTool('move');
  }

  function ensureState(year) {
    if (!project.states[year]) {
      project.states[year] = { order: [], continents: {}, terrainStrokes: [], roundOps: [], plateCorrections: [], terrainOperationHistory: [], plateRevision: 0, plateReport: '', importMeta: {} };
    }
    var store = project.states[year];
    if (!Array.isArray(store.terrainStrokes)) store.terrainStrokes = [];
    if (!Array.isArray(store.roundOps)) store.roundOps = [];
    if (!Array.isArray(store.plateCorrections)) store.plateCorrections = [];
    if (!Array.isArray(store.terrainOperationHistory)) store.terrainOperationHistory = [];
    if (!Number.isFinite(store.plateRevision)) store.plateRevision = 0;
    if (typeof store.plateReport !== 'string') store.plateReport = '';
    if (!store.importMeta || typeof store.importMeta !== 'object') store.importMeta = {};
    PRESETS[year].continents.forEach(function (data) {
      if (!store.continents[data.key]) {
        store.continents[data.key] = {
          name: data.defaultName,
          lonShift: 0,
          latShift: 0,
          rotation: 0,
          features: [],
          overrideData: null,
          overrideSource: null
        };
      }
      if (typeof store.continents[data.key].overrideData === 'undefined') store.continents[data.key].overrideData = null;
      if (typeof store.continents[data.key].overrideSource === 'undefined') store.continents[data.key].overrideSource = null;
      if (store.order.indexOf(data.key) < 0) store.order.push(data.key);
    });
    return store;
  }

  function switchPreset(year, announce) {
    year = String(year);
    if (!PRESETS[year]) return;
    project.currentPreset = year;
    els.era.value = year;
    runtime.preset = PRESETS[year];
    runtime.selectedKey = null;
    runtime.imagesReady = false;
    runtime.continents = [];
    runtime.byKey = {};
    els.frameDescription.textContent = runtime.preset.description;
    els.status.textContent = 'Loading ' + runtime.preset.label + ' landmasses…';
    updateSelectionUi();

    var store = ensureState(year);
    var promises = runtime.preset.continents.map(function (data) {
      return loadContinentRuntime(data, store.continents[data.key]);
    });

    Promise.all(promises).then(function (items) {
      runtime.byKey = {};
      items.forEach(function (item) { runtime.byKey[item.data.key] = item; });
      runtime.continents = store.order.map(function (key) { return runtime.byKey[key]; }).filter(Boolean);
      runtime.imagesReady = true;
      rebuildContinentList();
      queueRender();
      els.status.textContent = 'Move continents or choose Paint, Smudge, or Highlight.';
      runtime.highlight = [];
      updateTerrainUi();
      saveProject();
      try { document.dispatchEvent(new CustomEvent('worldbuilder:ready', { detail: { snapshot: buildWorldBuilderSnapshot() } })); } catch (_err) {}
      if (announce) toast('Loaded ' + runtime.preset.label + '.');
    }).catch(function (err) {
      els.status.textContent = 'Could not load embedded continent assets.';
      console.error(err);
    });
  }

  function loadContinentRuntime(data, state) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () {
        var alphaCanvas = document.createElement('canvas');
        alphaCanvas.width = data.width;
        alphaCanvas.height = data.height;
        var alphaCtx = alphaCanvas.getContext('2d');
        alphaCtx.drawImage(image, 0, 0);
        var pixels = alphaCtx.getImageData(0, 0, data.width, data.height).data;

        var silhouette = document.createElement('canvas');
        silhouette.width = data.width;
        silhouette.height = data.height;
        var sctx = silhouette.getContext('2d');
        sctx.drawImage(image, 0, 0);
        sctx.globalCompositeOperation = 'source-in';
        sctx.fillStyle = '#062b49';
        sctx.fillRect(0, 0, silhouette.width, silhouette.height);
        sctx.globalCompositeOperation = 'source-over';

        resolve({ data: data, state: state, image: image, alpha: pixels, silhouette: silhouette, boundary: extractBoundaryPoints(pixels, data.width, data.height) });
      };
      image.onerror = reject;
      image.src = data.image;
    });
  }

  function bindUi() {
    els.era.addEventListener('change', function () { switchPreset(els.era.value, true); });
    els.title.addEventListener('input', function () { saveProject(); });
    els.oceanUnit.addEventListener('change', function () { saveProject(); queueRender(); });
    els.showGrid.addEventListener('change', function () { saveProject(); queueRender(); });
    els.showNames.addEventListener('change', function () { saveProject(); queueRender(); });
    els.showFeatures.addEventListener('change', function () { saveProject(); queueRender(); });

    Array.prototype.forEach.call(document.querySelectorAll('.tool-tab'), function (button) {
      button.addEventListener('click', function () { setTool(button.getAttribute('data-tool')); });
    });
    els.brushSize.addEventListener('input', function () { updateBrushUi(); saveProject(); queueRender(); });
    els.heightValue.addEventListener('input', function () { updateBrushUi(); saveProject(); });
    els.depthValue.addEventListener('input', function () { updateBrushUi(); saveProject(); });
    els.smudgeStrength.addEventListener('input', function () { updateBrushUi(); saveProject(); });
    els.useHeight.addEventListener('change', function () { updateBrushUi(); saveProject(); });
    els.useDepth.addEventListener('change', function () { updateBrushUi(); saveProject(); });
    [els.extendBoundaries, els.autoMatchTerrain, els.attachNewTerrain].forEach(function (input) { if (input) input.addEventListener('change', function () { saveProject(); queueRender(); }); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-terrain]'), function (input) {
      input.addEventListener('change', function () {
        if (!selectedTerrainTypes().length) input.checked = true;
        updateBrushUi(); saveProject();
      });
    });
    els.roundEdges.addEventListener('click', applyRoundEdges);
    els.clearHighlight.addEventListener('click', function () { runtime.highlight = []; updateTerrainUi(); queueRender(); toast('Highlighted area cleared.'); });
    els.undoTerrain.addEventListener('click', undoTerrainEdit);
    els.saveCorrectPlates.addEventListener('click', saveAndCorrectPlates);

    els.continentName.addEventListener('input', function () {
      var selected = selectedContinent();
      if (!selected) return;
      selected.state.name = els.continentName.value || selected.data.defaultName;
      saveProject();
      rebuildContinentList();
      updateSelectionUi();
      queueRender();
    });

    els.resetContinent.addEventListener('click', function () {
      var selected = selectedContinent();
      if (!selected) return;
      selected.state.lonShift = 0;
      selected.state.latShift = 0;
      selected.state.rotation = 0;
      markPlateCorrectionsStale();
      updateSelectionUi();
      saveProject();
      queueRender();
      toast('Selected continent returned to its frozen-frame position.');
    });

    els.resetWorld.addEventListener('click', function () {
      var store = ensureState(project.currentPreset);
      runtime.preset.continents.forEach(function (data) {
        var existing = store.continents[data.key];
        existing.name = data.defaultName;
        existing.lonShift = 0;
        existing.latShift = 0;
        existing.rotation = 0;
        existing.features = [];
        existing.overrideData = null;
        existing.overrideSource = null;
      });
      store.order = runtime.preset.continents.map(function (item) { return item.key; });
      store.terrainStrokes = [];
      store.roundOps = [];
      store.plateCorrections = [];
      store.terrainOperationHistory = [];
      store.plateRevision = 0;
      store.plateReport = '';
      runtime.highlight = [];
      switchPreset(project.currentPreset, false);
      toast('The Continent Editor base surface was reset.');
    });

    Array.prototype.forEach.call(document.querySelectorAll('.nudge'), function (button) {
      button.addEventListener('click', function () {
        var step = Number(els.stepSize.value || 1);
        nudgeSelected(Number(button.getAttribute('data-dx') || 0) * step,
          Number(button.getAttribute('data-dy') || 0) * step,
          Number(button.getAttribute('data-rotate') || 0) * step);
      });
    });

    document.addEventListener('keydown', function (event) {
      var tag = (event.target && event.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
      if (!selectedContinent()) return;
      var step = Number(els.stepSize.value || 1) * (event.shiftKey ? 5 : 1);
      var used = true;
      if (event.key === 'ArrowLeft') nudgeSelected(-step, 0, 0);
      else if (event.key === 'ArrowRight') nudgeSelected(step, 0, 0);
      else if (event.key === 'ArrowUp') nudgeSelected(0, step, 0);
      else if (event.key === 'ArrowDown') nudgeSelected(0, -step, 0);
      else if (event.key.toLowerCase() === 'q') nudgeSelected(0, 0, -step);
      else if (event.key.toLowerCase() === 'e') nudgeSelected(0, 0, step);
      else used = false;
      if (used) event.preventDefault();
    });

    mapCanvas.addEventListener('pointerdown', onMapPointerDown);
    mapCanvas.addEventListener('pointermove', onMapPointerMove);
    mapCanvas.addEventListener('pointerup', onMapPointerUp);
    mapCanvas.addEventListener('pointercancel', onMapPointerUp);
    mapCanvas.addEventListener('pointerleave', function () { if (!runtime.brushActive) { runtime.brushCursor = null; queueRender(); } });
    mapCanvas.addEventListener('contextmenu', function (event) { event.preventDefault(); });

    els.uploadFeatures.addEventListener('click', function () { els.featureUpload.click(); });
    els.featureUpload.addEventListener('change', handleFeatureUpload);
    els.clearFeatures.addEventListener('click', function () {
      var selected = selectedContinent();
      if (!selected) return;
      selected.state.features = [];
      saveProject();
      updateFeatureUi();
      rebuildContinentList();
      queueRender();
      toast('The selected continent catalog was cleared.');
    });
    els.downloadTemplate.addEventListener('click', downloadFeatureTemplate);
    els.exportPng.addEventListener('click', exportPng);
    els.exportHtml.addEventListener('click', exportHtml);
    els.toggleSpin.addEventListener('click', toggleSpin);
    window.addEventListener('resize', function () {
      resizeMapCanvas();
      resizeGlobe();
      queueRender();
    });
  }

  function extractBoundaryPoints(pixels, width, height) {
    var points = [];
    var step = Math.max(1, Math.floor(Math.min(width, height) / 95));
    function alphaAt(x, y) {
      if (x < 0 || y < 0 || x >= width || y >= height) return 0;
      return pixels[(y * width + x) * 4 + 3];
    }
    for (var y = 1; y < height - 1; y += step) {
      for (var x = 1; x < width - 1; x += step) {
        if (alphaAt(x, y) < 40) continue;
        if (alphaAt(x - step, y) < 40 || alphaAt(x + step, y) < 40 || alphaAt(x, y - step) < 40 || alphaAt(x, y + step) < 40) {
          points.push({ x: x - width / 2, y: y - height / 2 });
        }
      }
    }
    if (points.length <= 280) return points;
    var reduced = [];
    var stride = points.length / 280;
    for (var i = 0; i < 280; i++) reduced.push(points[Math.floor(i * stride)]);
    return reduced;
  }

  function applyRoundEdges() {
    if (!runtime.highlight || !runtime.highlight.length) return;
    var store = currentStore();
    var selections = runtime.highlight.map(function (stroke) {
      return {
        points: stroke.points.map(function (point) { return { x: point.x, y: point.y }; }),
        sizeKm: stroke.sizeKm,
        attachToSelected: !!stroke.attachToSelected,
        selectedContinentKey: stroke.selectedContinentKey || null,
        attachment: cloneWorldBuilder(stroke.attachment || null)
      };
    });
    var maxSize = selections.reduce(function (max, item) { return Math.max(max, Number(item.sizeKm || 0)); }, Number(els.brushSize.value || 300));
    store.roundOps.push({
      kind: 'round',
      selections: selections,
      sizeKm: maxSize,
      strength: Number(els.smudgeStrength.value || 45),
      types: selectedTerrainTypes(),
      extendBoundaries: !els.extendBoundaries || !!els.extendBoundaries.checked,
      autoMatchTerrain: !els.autoMatchTerrain || !!els.autoMatchTerrain.checked,
      height: els.useHeight.checked ? Number(els.heightValue.value || 0) : 0,
      depth: els.useDepth.checked ? Number(els.depthValue.value || 0) : 0,
      seed: Math.floor(Math.random() * 2147483647),
      created: Date.now()
    });
    runtime.highlight = [];
    saveProject();
    updateTerrainUi();
    queueRender();
    toast('Highlighted terrain rounded and allowed to grow or erode beyond the former boundary.');
  }

  function undoTerrainEdit() {
    var store = currentStore();
    var candidates = [];
    if (store.terrainStrokes.length) candidates.push({ list: store.terrainStrokes, index: store.terrainStrokes.length - 1, created: store.terrainStrokes[store.terrainStrokes.length - 1].created || 0, name: 'terrain stroke' });
    if (store.roundOps.length) candidates.push({ list: store.roundOps, index: store.roundOps.length - 1, created: store.roundOps[store.roundOps.length - 1].created || 0, name: 'edge-rounding pass' });
    if (store.plateCorrections.length) candidates.push({ list: store.plateCorrections, index: store.plateCorrections.length - 1, created: store.plateCorrections[store.plateCorrections.length - 1].created || 0, name: 'plate correction' });
    if (!candidates.length) return;
    candidates.sort(function (a, b) { return b.created - a.created; });
    var target = candidates[0];
    var item = target.list[target.index];
    var groupId = item && item.groupId;
    var removed = 1;
    if (groupId) {
      var beforeStrokes = store.terrainStrokes.length;
      var beforeRounds = store.roundOps.length;
      var beforePlates = store.plateCorrections.length;
      store.terrainStrokes = store.terrainStrokes.filter(function (entry) { return entry.groupId !== groupId; });
      store.roundOps = store.roundOps.filter(function (entry) { return entry.groupId !== groupId; });
      store.plateCorrections = store.plateCorrections.filter(function (entry) { return entry.groupId !== groupId; });
      removed = (beforeStrokes - store.terrainStrokes.length) + (beforeRounds - store.roundOps.length) + (beforePlates - store.plateCorrections.length);
      var historyIndex = store.terrainOperationHistory.map(function (entry) { return entry.groupId; }).lastIndexOf(groupId);
      if (historyIndex >= 0) {
        var history = store.terrainOperationHistory.splice(historyIndex, 1)[0];
        if (history) {
          store.plateCorrections = cloneWorldBuilder(history.previousPlateCorrections || []);
          store.plateRevision = Number(history.previousPlateRevision || 0);
          store.plateReport = String(history.previousPlateReport || '');
        }
      }
    } else target.list.splice(target.index, 1);
    if (!groupId && target.name === 'plate correction') store.plateReport = 'A saved plate correction was undone.';
    saveProject();
    updateTerrainUi();
    queueRender();
    toast(groupId ? 'Undid the complete terrain operation (' + removed + ' linked edits).' : 'Undid the last ' + target.name + '.');
  }

  function saveAndCorrectPlates() {
    if (!runtime.imagesReady) return;
    var store = currentStore();
    var corrections = detectPlateContacts();
    store.plateCorrections = corrections;
    store.plateRevision = Number(store.plateRevision || 0) + 1;
    var bridges = corrections.filter(function (item) { return item.kind === 'bridge'; }).length;
    var channels = corrections.filter(function (item) { return item.kind === 'channel'; }).length;
    if (corrections.length) {
      var pairs = corrections.slice(0, 5).map(function (item) { return item.pair.join(' ↔ '); }).join('; ');
      store.plateReport = 'Corrected plate revision ' + store.plateRevision + ': ' + bridges + ' land bridge' + (bridges === 1 ? '' : 's') + ' and ' + channels + ' water gap' + (channels === 1 ? '' : 's') + '. Contact pairs: ' + pairs + (corrections.length > 5 ? '…' : '');
    } else {
      store.plateReport = 'Corrected plate revision ' + store.plateRevision + ': no newly placed continent edges were close enough to require a bridge or water gap.';
    }
    saveProject();
    updateTerrainUi();
    queueRender();
    els.status.textContent = 'Placements saved and tectonic contact zones recalculated.';
    toast(corrections.length ? 'Corrected plates saved: ' + bridges + ' bridge(s), ' + channels + ' gap(s).' : 'Placements saved; no touching edges detected.');
  }

  function detectPlateContacts() {
    var width = 960;
    var height = 480;
    var transformed = runtime.continents.map(function (continent) {
      return { continent: continent, points: transformedBoundary(continent, width, height) };
    });
    var threshold = Math.max(8, 550 / 40075.017 * width);
    var corrections = [];
    for (var i = 0; i < transformed.length; i++) {
      for (var j = i + 1; j < transformed.length; j++) {
        var a = transformed[i];
        var b = transformed[j];
        if (!continentWasMoved(a.continent) && !continentWasMoved(b.continent)) continue;
        var nearest = nearestBoundaryPair(a.points, b.points, width);
        if (!nearest || nearest.distance > threshold) continue;
        var nameA = a.continent.state.name || a.continent.data.defaultName;
        var nameB = b.continent.state.name || b.continent.data.defaultName;
        var key = a.continent.data.key + '|' + b.continent.data.key + '|' + Math.round(nearest.a.x) + '|' + Math.round(nearest.a.y) + '|' + Math.round(nearest.b.x) + '|' + Math.round(nearest.b.y);
        var seed = stringHash(key);
        var bridge = (seed % 100) < 58;
        var ax = nearest.a.x / width;
        var ay = nearest.a.y / height;
        var bx = nearest.b.x / width;
        var by = nearest.b.y / height;
        var dx = wrappedDelta(bx, ax) * width;
        var dy = (by - ay) * height;
        var length = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        var midpoint = { x: ((ax + wrappedDelta(bx, ax) * .5) % 1 + 1) % 1, y: clamp((ay + by) * .5, 0, 1) };
        var radiusKm = 115 + (seed % 145);
        var points;
        if (bridge) {
          var bend = ((seed >>> 8) % 100 / 100 - .5) * .012;
          points = [
            { x: ((ax % 1) + 1) % 1, y: clamp(ay, 0, 1) },
            { x: ((midpoint.x - dy / length * bend) % 1 + 1) % 1, y: clamp(midpoint.y + dx / length * bend, 0, 1) },
            { x: ((bx % 1) + 1) % 1, y: clamp(by, 0, 1) }
          ];
        } else {
          var tangentX = -dy / length;
          var tangentY = dx / length;
          var half = Math.max(7, threshold * .75);
          points = [
            { x: ((midpoint.x - tangentX * half / width) % 1 + 1) % 1, y: clamp(midpoint.y - tangentY * half / height, 0, 1) },
            { x: ((midpoint.x + tangentX * half / width) % 1 + 1) % 1, y: clamp(midpoint.y + tangentY * half / height, 0, 1) }
          ];
        }
        corrections.push({
          kind: bridge ? 'bridge' : 'channel',
          points: points,
          radiusKm: radiusKm,
          height: 900 + (seed % 2600),
          depth: 700 + (seed % 3600),
          seed: seed,
          pair: [nameA, nameB],
          created: Date.now() + corrections.length
        });
      }
    }
    return corrections;
  }

  function continentWasMoved(continent) {
    return Math.abs(Number(continent.state.lonShift || 0)) > .05 || Math.abs(Number(continent.state.latShift || 0)) > .05 || Math.abs(Number(continent.state.rotation || 0)) > .05;
  }

  function transformedBoundary(continent, width, height) {
    var center = transformedCenter(continent, width, height);
    var scale = width / continent.data.sourceWidth;
    var angle = continent.state.rotation * Math.PI / 180;
    var cos = Math.cos(angle), sin = Math.sin(angle);
    return (continent.boundary || []).map(function (point) {
      var x = point.x * scale;
      var y = point.y * scale;
      return { x: center.x + x * cos - y * sin, y: center.y + x * sin + y * cos };
    });
  }

  function nearestBoundaryPair(aPoints, bPoints, width) {
    var best = null;
    for (var i = 0; i < aPoints.length; i++) {
      var a = aPoints[i];
      for (var j = 0; j < bPoints.length; j++) {
        var b = bPoints[j];
        var dx = b.x - a.x;
        if (dx > width / 2) dx -= width;
        if (dx < -width / 2) dx += width;
        var dy = b.y - a.y;
        var d2 = dx * dx + dy * dy;
        if (!best || d2 < best.d2) {
          best = { d2: d2, distance: Math.sqrt(d2), a: { x: a.x, y: a.y }, b: { x: a.x + dx, y: b.y } };
        }
      }
    }
    return best;
  }

  function stringHash(text) {
    var hash = 2166136261;
    for (var i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function selectedTerrainTypes() {
    return Array.prototype.map.call(document.querySelectorAll('[data-terrain]:checked'), function (input) {
      return input.getAttribute('data-terrain');
    }).filter(Boolean);
  }

  function updateBrushUi() {
    var size = Number(els.brushSize.value || 300);
    els.brushSizeValue.textContent = size.toLocaleString() + ' km';
    els.heightOutput.textContent = Number(els.heightValue.value || 0).toLocaleString() + ' m';
    els.depthOutput.textContent = Number(els.depthValue.value || 0).toLocaleString() + ' m';
    els.smudgeOutput.textContent = Number(els.smudgeStrength.value || 45) + '%';
    els.heightValue.disabled = !els.useHeight.checked;
    els.depthValue.disabled = !els.useDepth.checked;
  }

  function setTool(tool) {
    runtime.tool = /^(move|paint|smudge|highlight)$/.test(tool) ? tool : 'move';
    Array.prototype.forEach.call(document.querySelectorAll('.tool-tab'), function (button) {
      button.classList.toggle('active', button.getAttribute('data-tool') === runtime.tool);
    });
    mapCanvas.classList.remove('tool-move', 'tool-paint', 'tool-smudge', 'tool-highlight');
    mapCanvas.classList.add('tool-' + runtime.tool);
    els.toolChip.textContent = runtime.tool.charAt(0).toUpperCase() + runtime.tool.slice(1);
    runtime.brushCursor = null;
    updateTerrainUi();
    queueRender();
  }

  function currentStore() {
    return ensureState(project.currentPreset);
  }

  function updateTerrainUi() {
    var store = currentStore();
    var hasHighlight = runtime.highlight && runtime.highlight.length > 0;
    els.roundEdges.disabled = !hasHighlight;
    els.clearHighlight.disabled = !hasHighlight;
    els.undoTerrain.disabled = !(store.terrainStrokes.length || store.roundOps.length || store.plateCorrections.length);
    if (store.plateReport) {
      els.plateReport.textContent = store.plateReport;
    } else if (store.plateRevision) {
      els.plateReport.textContent = 'Corrected plate revision ' + store.plateRevision + ' is saved.';
    } else {
      els.plateReport.textContent = 'No corrected plate pass has been saved for this frame.';
    }
  }

  function sourceCenterLatitude(continent) {
    return 90 - continent.data.sourceCenterY / continent.data.sourceHeight * 180;
  }

  function clampLatShift(continent, value) {
    var base = sourceCenterLatitude(continent);
    return clamp(Number(value || 0), -90 - base, 90 - base);
  }

  function markPlateCorrectionsStale() {
    var store = currentStore();
    if (!store.plateCorrections.length && !store.plateRevision) return;
    store.plateCorrections = [];
    store.plateReport = 'Placements changed after the last correction pass. Save & correct tectonic plates again.';
    updateTerrainUi();
  }

  function selectedContinent() {
    return runtime.selectedKey ? runtime.byKey[runtime.selectedKey] : null;
  }

  function selectContinent(key, bringToFront) {
    if (!runtime.byKey[key]) return;
    runtime.selectedKey = key;
    if (bringToFront) {
      var store = ensureState(project.currentPreset);
      store.order = store.order.filter(function (item) { return item !== key; });
      store.order.push(key);
      runtime.continents = store.order.map(function (item) { return runtime.byKey[item]; }).filter(Boolean);
    }
    updateSelectionUi();
    rebuildContinentList();
    saveProject();
    queueRender();
  }

  function updateSelectionUi() {
    var selected = selectedContinent();
    var disabled = !selected;
    els.continentName.disabled = disabled;
    els.resetContinent.disabled = disabled;
    els.uploadFeatures.disabled = disabled;
    els.downloadTemplate.disabled = disabled;
    els.clearFeatures.disabled = disabled || !selected.state.features.length;
    Array.prototype.forEach.call(document.querySelectorAll('.nudge'), function (button) { button.disabled = disabled; });
    if (!selected) {
      els.selectionChip.textContent = 'None';
      els.continentName.value = '';
      els.transformReadout.textContent = 'Longitude +0.00° · Latitude +0.00° · Rotation +0.00°';
    } else {
      els.selectionChip.textContent = selected.state.name || selected.data.defaultName;
      els.continentName.value = selected.state.name || selected.data.defaultName;
      els.transformReadout.textContent = 'Longitude ' + signed(selected.state.lonShift) + '° · Latitude ' + signed(selected.state.latShift) + '° · Rotation ' + signed(selected.state.rotation) + '°';
    }
    updateFeatureUi();
  }

  function signed(value) {
    var n = Number(value || 0);
    return (n >= 0 ? '+' : '') + n.toFixed(2);
  }

  function nudgeSelected(dx, dy, dr) {
    var selected = selectedContinent();
    if (!selected) return;
    selected.state.lonShift = normalizeLongitude(selected.state.lonShift + dx);
    selected.state.latShift = clampLatShift(selected, selected.state.latShift + dy);
    markPlateCorrectionsStale();
    selected.state.rotation = normalizeAngle(selected.state.rotation + dr);
    updateSelectionUi();
    saveProject();
    queueRender();
  }

  function normalizeLongitude(value) {
    var n = Number(value || 0);
    while (n > 180) n -= 360;
    while (n < -180) n += 360;
    return n;
  }

  function normalizeAngle(value) {
    var n = Number(value || 0);
    while (n > 180) n -= 360;
    while (n < -180) n += 360;
    return n;
  }

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function resizeMapCanvas() {
    var rect = mapCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(800, Math.round(rect.width * dpr));
    var h = Math.round(w / 2);
    if (mapCanvas.width !== w || mapCanvas.height !== h) {
      mapCanvas.width = w;
      mapCanvas.height = h;
    }
  }

  function queueRender() {
    if (runtime.renderQueued) return;
    runtime.renderQueued = true;
    requestAnimationFrame(function () {
      runtime.renderQueued = false;
      if (!runtime.imagesReady) return;
      resizeMapCanvas();
      renderWorld(textureCanvas, { labels: true, grid: els.showGrid.checked, names: els.showNames.checked, features: els.showFeatures.checked, legend: false });
      renderMapDisplay();
      updateGlobeTexture();
    });
  }

  function renderWorld(canvas, options) {
    options = options || {};
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    drawOcean(ctx, width, height, !!options.grid);

    var oceanKm = els.oceanUnit.value === 'kilometers' ? 50 : 80.4672;
    var bufferPx = Math.max(1.2, oceanKm / 40075.017 * width);
    runtime.continents.forEach(function (continent) {
      drawContinent(ctx, continent, width, height);
    });

    var landMask = createLandMask(width, height);
    var store = currentStore();
    applyPlateCorrections(ctx, landMask, width, height, store.plateCorrections || []);
    applyRoundOperations(ctx, landMask, width, height, store.roundOps || []);
    var strokes = (store.terrainStrokes || []).slice();
    if (runtime.activeStroke && runtime.activeStroke.kind !== 'highlight') strokes.push(runtime.activeStroke);
    applyTerrainStrokes(ctx, landMask, width, height, strokes);
    drawFinalOceanBorder(ctx, landMask, width, height, bufferPx);

    if (options.labels) {
      if (options.features) runtime.continents.forEach(function (continent) { drawFeatureLabels(ctx, continent, width, height); });
      if (options.names) runtime.continents.forEach(function (continent) { drawContinentName(ctx, continent, width, height); });
    }
    if (options.legend) drawExportLegend(ctx, width, height);
  }

  function prepareCanvas(canvas, width, height) {
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.filter = 'none';
    ctx.clearRect(0, 0, width, height);
    return ctx;
  }

  function createLandMask(width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    runtime.continents.forEach(function (continent) {
      var scale = width / continent.data.sourceWidth;
      var dw = continent.data.width * scale;
      var dh = continent.data.height * scale;
      eachWrap(continent, width, height, function (cx, cy) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(continent.state.rotation * Math.PI / 180);
        ctx.drawImage(continent.silhouette, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      });
    });
    return canvas;
  }

  function applyPlateCorrections(ctx, landMask, width, height, corrections) {
    if (!corrections || !corrections.length) return;
    var maskCtx = landMask.getContext('2d');
    corrections.forEach(function (op) {
      var radius = Math.max(1.5, Number(op.radiusKm || 180) / 40075.017 * width);
      if (op.kind === 'bridge') {
        drawWrappedPath(ctx, op.points, width, height, radius * 4.2, '#49b9aa', .92);
        drawWrappedPath(ctx, op.points, width, height, radius * 3.1, terrainColor('land', op.height || 900, op.depth || 0, .55), .98);
        drawWrappedPath(ctx, op.points, width, height, radius * 1.1, terrainColor('mountain', op.height || 1800, 0, .65), .7);
        maskCtx.save();
        maskCtx.globalCompositeOperation = 'source-over';
        drawWrappedPath(maskCtx, op.points, width, height, radius * 3.2, '#fff', 1);
        maskCtx.restore();
      } else if (op.kind === 'channel') {
        drawWrappedPath(ctx, op.points, width, height, radius * 4.8, terrainColor('coastal', 0, op.depth || 800, .4), .98);
        drawWrappedPath(ctx, op.points, width, height, radius * 2.8, terrainColor('deep', 0, op.depth || 2400, .7), 1);
        maskCtx.save();
        maskCtx.globalCompositeOperation = 'destination-out';
        drawWrappedPath(maskCtx, op.points, width, height, radius * 2.7, '#000', 1);
        maskCtx.restore();
      }
    });
  }

  function drawWrappedPath(ctx, points, width, height, lineWidth, color, alpha) {
    if (!points || !points.length) return;
    var unwrapped = [];
    points.forEach(function (point, index) {
      var x = point.x;
      if (index) x = unwrapped[index - 1].x + wrappedDelta(x, points[index - 1].x);
      unwrapped.push({ x: x, y: point.y });
    });
    [-1, 0, 1].forEach(function (wrap) {
      ctx.save();
      ctx.globalAlpha = typeof alpha === 'number' ? alpha : 1;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      unwrapped.forEach(function (point, index) {
        var x = (point.x + wrap) * width;
        var y = point.y * height;
        if (!index) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      if (unwrapped.length === 1) {
        ctx.arc((unwrapped[0].x + wrap) * width, unwrapped[0].y * height, lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
      } else ctx.stroke();
      ctx.restore();
    });
  }

  function applyRoundOperations(ctx, landMask, width, height, operations) {
    if (!operations || !operations.length) return;
    operations.forEach(function (op) {
      var selection = document.createElement('canvas');
      selection.width = width; selection.height = height;
      var selectionCtx = selection.getContext('2d');
      (op.selections || []).forEach(function (stroke) {
        drawStrokeMask(selectionCtx, resolvedAttachedStroke(stroke), width, height, '#fff');
      });
      var radius = Math.max(1, Number(op.sizeKm || 300) / 40075.017 * width * (Number(op.strength || 45) / 100) * .65);
      var blurred = document.createElement('canvas');
      blurred.width = width; blurred.height = height;
      var bctx = blurred.getContext('2d');
      bctx.filter = 'blur(' + radius.toFixed(2) + 'px)';
      bctx.drawImage(landMask, 0, 0);
      bctx.filter = 'none';

      var original = landMask.getContext('2d').getImageData(0, 0, width, height);
      var smooth = bctx.getImageData(0, 0, width, height);
      var selected = selectionCtx.getImageData(0, 0, width, height);
      var patch = document.createElement('canvas');
      patch.width = width; patch.height = height;
      var pctx = patch.getContext('2d');
      var patchData = pctx.createImageData(width, height);
      var seed = Number(op.seed || 1) >>> 0;
      for (var i = 0; i < original.data.length; i += 4) {
        if (selected.data[i + 3] < 12) continue;
        var before = original.data[i + 3] > 70;
        var pixelIndex = i >> 2;
        var noise = hashNoise(pixelIndex, seed) * 18 - 9;
        var roundTypes = op.types && op.types.length ? op.types : ['land','coastal'];
        var roundRestriction = strokeRestriction(roundTypes);
        var threshold = roundRestriction === 'land' ? 76 : (roundRestriction === 'water' ? 184 : 128);
        var after = smooth.data[i + 3] > threshold + noise;
        original.data[i] = 255;
        original.data[i + 1] = 255;
        original.data[i + 2] = 255;
        original.data[i + 3] = after ? 255 : 0;
        if (after === before) continue;
        var y = Math.floor(pixelIndex / width);
        var landType = roundTypes.indexOf('mountain') >= 0 ? 'mountain' : (roundTypes.indexOf('coastal') >= 0 ? 'coastal' : 'land');
        var waterType = roundTypes.indexOf('deep') >= 0 ? 'deep' : 'shallow';
        var color = after ? terrainColorArray(landType, op.height || project.heightMeters, project.depthMeters, hashNoise(pixelIndex + 31, seed)) : terrainColorArray(waterType, 0, op.depth || project.depthMeters, hashNoise(pixelIndex + 93, seed));
        patchData.data[i] = color[0];
        patchData.data[i + 1] = color[1];
        patchData.data[i + 2] = color[2];
        patchData.data[i + 3] = 255;
      }
      landMask.getContext('2d').putImageData(original, 0, 0);
      pctx.putImageData(patchData, 0, 0);
      ctx.drawImage(patch, 0, 0);
      localizedSmudge(ctx, landMask, selection, width, height, Math.max(1, radius * .55), 'mixed');
    });
  }

  function applyTerrainStrokes(ctx, landMask, width, height, strokes) {
    if (!strokes || !strokes.length) return;
    strokes.forEach(function (storedStroke) {
      if (!storedStroke || !storedStroke.points || !storedStroke.points.length) return;
      var stroke = resolvedAttachedStroke(storedStroke);
      if (stroke.kind === 'smudge') {
        var smudgeMask = document.createElement('canvas');
        smudgeMask.width = width; smudgeMask.height = height;
        drawStrokeMask(smudgeMask.getContext('2d'), stroke, width, height, '#fff');
        var mode = strokeRestriction(stroke.types || []);
        localizedSmudge(ctx, landMask, smudgeMask, width, height, Math.max(1, stroke.sizeKm / 40075.017 * width * stroke.strength / 100 * .6), mode);
        return;
      }
      if (stroke.kind !== 'paint') return;
      paintStroke(ctx, landMask, width, height, stroke);
    });
  }

  function paintStroke(ctx, landMask, width, height, stroke) {
    var types = stroke.types && stroke.types.length ? stroke.types : ['land'];
    var maskCtx = landMask.getContext('2d');
    var rng = seededRandom(stroke.seed || 1);
    var allowTopology = stroke.extendBoundaries !== false;
    forEachStrokeDab(stroke, width, height, function (x, y, radius) {
      var type = types[Math.floor(rng() * types.length) % types.length];
      var variation = rng();
      var jitter = (types.length - 1) * .16;
      var jx = (rng() - .5) * radius * jitter;
      var jy = (rng() - .5) * radius * jitter;
      var rr = radius * (.68 + rng() * (.42 + types.length * .05));
      var px = x + jx, py = y + jy;
      drawTerrainDab(ctx, px, py, rr, type, stroke, variation);
      if (allowTopology) updateTopologyMask(maskCtx, px, py, rr, type, variation);
      else if (isLandTerrain(type) || type === 'coastal') {
        ctx.save(); ctx.globalCompositeOperation = 'destination-in'; ctx.drawImage(landMask, 0, 0); ctx.restore();
      }
      if (type === 'mountain' && rng() > .24) drawMountainRidge(ctx, px, py, rr, stroke.height || 0, rng());
    });
  }

  function updateTopologyMask(maskCtx, x, y, radius, type, variation) {
    var addsLand = isLandTerrain(type) || type === 'coastal';
    maskCtx.save();
    maskCtx.globalCompositeOperation = addsLand ? 'source-over' : 'destination-out';
    var gradient = maskCtx.createRadialGradient(x, y, Math.max(1, radius * .12), x, y, radius * (addsLand ? .96 : .88));
    gradient.addColorStop(0, addsLand ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)');
    gradient.addColorStop(.72, addsLand ? 'rgba(255,255,255,.96)' : 'rgba(0,0,0,.95)');
    gradient.addColorStop(1, addsLand ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.05)');
    maskCtx.fillStyle = gradient;
    maskCtx.beginPath(); maskCtx.arc(x, y, radius, 0, Math.PI * 2); maskCtx.fill();
    maskCtx.restore();
  }

  function localizedSmudge(ctx, landMask, strokeMask, width, height, blurRadius, restriction) {
    var source = document.createElement('canvas');
    source.width = width; source.height = height;
    source.getContext('2d').drawImage(ctx.canvas, 0, 0);
    var blurred = document.createElement('canvas');
    blurred.width = width; blurred.height = height;
    var bctx = blurred.getContext('2d');
    bctx.filter = 'blur(' + Math.min(80, blurRadius).toFixed(2) + 'px)';
    bctx.drawImage(source, 0, 0);
    bctx.filter = 'none';
    bctx.globalCompositeOperation = 'destination-in';
    bctx.drawImage(strokeMask, 0, 0);
    if (restriction === 'land') bctx.drawImage(landMask, 0, 0);
    else if (restriction === 'water') {
      bctx.globalCompositeOperation = 'destination-out';
      bctx.drawImage(landMask, 0, 0);
    }
    ctx.drawImage(blurred, 0, 0);
  }

  function drawStrokeMask(ctx, stroke, width, height, color) {
    ctx.save();
    ctx.strokeStyle = color || '#fff';
    ctx.fillStyle = color || '#fff';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    var radius = Math.max(1, Number(stroke.sizeKm || 300) / 40075.017 * width);
    ctx.lineWidth = radius * 2;
    drawWrappedPath(ctx, stroke.points, width, height, radius * 2, color || '#fff', 1);
    ctx.restore();
  }

  function forEachStrokeDab(stroke, width, height, callback) {
    var points = stroke.points || [];
    if (!points.length) return;
    var radius = Math.max(1.25, Number(stroke.sizeKm || 300) / 40075.017 * width);
    var spacing = Math.max(1, radius * .34);
    var index = 0;
    for (var p = 0; p < points.length; p++) {
      var a = points[Math.max(0, p - 1)];
      var b = points[p];
      var dx = wrappedDelta(b.x, a.x) * width;
      var dy = (b.y - a.y) * height;
      var distance = Math.sqrt(dx * dx + dy * dy);
      var steps = p === 0 ? 1 : Math.max(1, Math.ceil(distance / spacing));
      for (var step = 0; step < steps; step++) {
        var t = steps === 1 ? 1 : step / steps;
        var nx = a.x + wrappedDelta(b.x, a.x) * t;
        nx = ((nx % 1) + 1) % 1;
        var ny = a.y + (b.y - a.y) * t;
        [-1, 0, 1].forEach(function (wrap) {
          callback((nx + wrap) * width, ny * height, radius, index);
        });
        index++;
      }
    }
  }

  function drawTerrainDab(ctx, x, y, radius, type, stroke, variation) {
    var height = stroke.useHeight === false ? 0 : Number(stroke.height || 0);
    var depth = stroke.useDepth === false ? 0 : Number(stroke.depth || 0);
    var center = terrainColor(type, height, depth, variation);
    var sampled = stroke.autoMatchTerrain === false ? null : sampleCanvasColor(ctx, x, y, Math.max(2, radius * .82));
    var edge = sampled || terrainColor(type, height * .45, depth * .7, 1 - variation);
    var gradient = ctx.createRadialGradient(x - radius * .18, y - radius * .2, radius * .06, x, y, radius);
    gradient.addColorStop(0, center);
    gradient.addColorStop(.55, center);
    gradient.addColorStop(.86, edge);
    gradient.addColorStop(1, colorWithAlpha(edge, .08));
    ctx.save();
    ctx.globalAlpha = .82 + variation * .16;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function sampleCanvasColor(ctx, x, y, radius) {
    try {
      var canvas = ctx.canvas;
      var sx = Math.max(0, Math.floor(x - radius));
      var sy = Math.max(0, Math.floor(y - radius));
      var sw = Math.max(1, Math.min(canvas.width - sx, Math.ceil(radius * 2)));
      var sh = Math.max(1, Math.min(canvas.height - sy, Math.ceil(radius * 2)));
      var data = ctx.getImageData(sx, sy, sw, sh).data;
      var r = 0, g = 0, b = 0, n = 0, step = Math.max(4, Math.floor(data.length / 900 / 4) * 4);
      for (var i = 0; i < data.length; i += step) { if (data[i + 3] < 24) continue; r += data[i]; g += data[i + 1]; b += data[i + 2]; n++; }
      if (!n) return null;
      return 'rgb(' + Math.round(r / n) + ',' + Math.round(g / n) + ',' + Math.round(b / n) + ')';
    } catch (_err) { return null; }
  }

  function colorWithAlpha(color, alpha) {
    var rgb = colorArray(color);
    return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')';
  }

  function drawMountainRidge(ctx, x, y, radius, height, variation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((variation * 2 - 1) * Math.PI);
    ctx.strokeStyle = height > 5500 ? 'rgba(238,239,224,.78)' : 'rgba(85,70,55,.75)';
    ctx.lineWidth = Math.max(1, radius * .18);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-radius * .72, radius * .1);
    ctx.lineTo(-radius * .26, -radius * .18);
    ctx.lineTo(radius * .12, radius * .04);
    ctx.lineTo(radius * .7, -radius * .16);
    ctx.stroke();
    ctx.restore();
  }

  function strokeRestriction(types) {
    if (!types || !types.length) return 'mixed';
    var land = types.every(isLandTerrain);
    var water = types.every(function (type) { return !isLandTerrain(type); });
    return land ? 'land' : (water ? 'water' : 'mixed');
  }

  function isLandTerrain(type) {
    return type === 'land' || type === 'mountain';
  }

  function terrainColor(type, height, depth, variation) {
    variation = typeof variation === 'number' ? variation : .5;
    height = Number(height || 0);
    depth = Number(depth || 0);
    if (type === 'deep') {
      var deepLight = clamp(31 - depth / 900 + variation * 5, 12, 32);
      return 'hsl(' + Math.round(204 + variation * 8) + ', 70%, ' + deepLight + '%)';
    }
    if (type === 'shallow') {
      var shallowLight = clamp(50 - depth / 1600 + variation * 8, 34, 57);
      return 'hsl(' + Math.round(190 + variation * 9) + ', 64%, ' + shallowLight + '%)';
    }
    if (type === 'coastal') return 'hsl(' + Math.round(167 + variation * 18) + ', 49%, ' + Math.round(43 + variation * 13) + '%)';
    if (type === 'mountain') {
      if (height > 6200) return 'hsl(' + Math.round(40 + variation * 20) + ', 18%, ' + Math.round(76 + variation * 12) + '%)';
      return 'hsl(' + Math.round(26 + variation * 18) + ', ' + Math.round(25 + variation * 18) + '%, ' + Math.round(33 + Math.min(20, height / 500) + variation * 8) + '%)';
    }
    var landHue = 72 + variation * 40 - Math.min(30, height / 350);
    var landLight = clamp(34 + variation * 13 + height / 1500, 31, 60);
    return 'hsl(' + Math.round(landHue) + ', ' + Math.round(30 + variation * 20) + '%, ' + Math.round(landLight) + '%)';
  }

  function terrainColorArray(type, height, depth, variation) {
    variation = typeof variation === 'number' ? variation : .5;
    height = Number(height || 0);
    depth = Number(depth || 0);
    if (type === 'deep') return hslToRgb(204 + variation * 8, 70, clamp(31 - depth / 900 + variation * 5, 12, 32));
    if (type === 'shallow') return hslToRgb(190 + variation * 9, 64, clamp(50 - depth / 1600 + variation * 8, 34, 57));
    if (type === 'coastal') return hslToRgb(167 + variation * 18, 49, 43 + variation * 13);
    if (type === 'mountain') {
      if (height > 6200) return hslToRgb(40 + variation * 20, 18, 76 + variation * 12);
      return hslToRgb(26 + variation * 18, 25 + variation * 18, 33 + Math.min(20, height / 500) + variation * 8);
    }
    return hslToRgb(72 + variation * 40 - Math.min(30, height / 350), 30 + variation * 20, clamp(34 + variation * 13 + height / 1500, 31, 60));
  }

  function oceanColorArray(y, depth, variation) {
    var light = clamp(34 + Math.cos((y - .5) * Math.PI) * 7 - Number(depth || 0) / 1800 + variation * 5, 16, 47);
    return hslToRgb(202 + variation * 8, 66, light);
  }

  function colorArray(css) {
    var canvas = colorArray.canvas || (colorArray.canvas = document.createElement('canvas'));
    canvas.width = canvas.height = 1;
    var c = canvas.getContext('2d');
    c.clearRect(0, 0, 1, 1);
    c.fillStyle = css;
    c.fillRect(0, 0, 1, 1);
    var d = c.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  }

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    s /= 100; l /= 100;
    if (s === 0) { var g = Math.round(l * 255); return [g, g, g]; }
    var q = l < .5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    function hue(t) {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    return [Math.round(hue(h + 1 / 3) * 255), Math.round(hue(h) * 255), Math.round(hue(h - 1 / 3) * 255)];
  }

  function seededRandom(seed) {
    var state = Number(seed || 1) >>> 0;
    return function () {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function hashNoise(index, seed) {
    var x = (index ^ seed) >>> 0;
    x = Math.imul(x ^ (x >>> 16), 2246822507);
    x = Math.imul(x ^ (x >>> 13), 3266489909);
    return ((x ^ (x >>> 16)) >>> 0) / 4294967295;
  }

  function drawFinalOceanBorder(ctx, landMask, width, height, radius) {
    var halo = document.createElement('canvas');
    halo.width = width; halo.height = height;
    var hctx = halo.getContext('2d');
    var samples = Math.max(16, Math.min(36, Math.round(radius * 7)));
    for (var i = 0; i < samples; i++) {
      var angle = i / samples * Math.PI * 2;
      hctx.drawImage(landMask, Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    hctx.globalCompositeOperation = 'destination-out';
    hctx.drawImage(landMask, 0, 0);
    hctx.globalCompositeOperation = 'source-in';
    hctx.fillStyle = '#062b49';
    hctx.fillRect(0, 0, width, height);
    hctx.globalCompositeOperation = 'source-over';
    ctx.save();
    ctx.globalAlpha = .94;
    ctx.drawImage(halo, 0, 0);
    ctx.restore();
  }

  function drawOcean(ctx, width, height, grid) {
    var key = width + 'x' + height + ':' + (grid ? 'g' : 'n');
    if (!runtime.oceanCache[key]) {
      var c = document.createElement('canvas');
      c.width = width; c.height = height;
      var x = c.getContext('2d');
      var gradient = x.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#092841');
      gradient.addColorStop(.18, '#0b4263');
      gradient.addColorStop(.5, '#07517a');
      gradient.addColorStop(.82, '#0a3e61');
      gradient.addColorStop(1, '#08243b');
      x.fillStyle = gradient;
      x.fillRect(0, 0, width, height);

      var seed = 918273 + width;
      function rand() {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      }
      x.save();
      x.globalAlpha = .13;
      for (var i = 0; i < 85; i++) {
        var y = rand() * height;
        var amp = 4 + rand() * height * .018;
        x.beginPath();
        x.moveTo(-20, y);
        for (var px = -20; px <= width + 30; px += Math.max(18, width / 40)) {
          x.lineTo(px, y + Math.sin(px / (35 + rand() * 80) + rand() * 6) * amp);
        }
        x.strokeStyle = i % 3 === 0 ? '#70c9da' : '#031b31';
        x.lineWidth = Math.max(1, width / 2048);
        x.stroke();
      }
      x.restore();

      var vignette = x.createRadialGradient(width / 2, height / 2, height * .1, width / 2, height / 2, width * .63);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,8,17,.42)');
      x.fillStyle = vignette;
      x.fillRect(0, 0, width, height);

      if (grid) drawGrid(x, width, height);
      runtime.oceanCache[key] = c;
    }
    ctx.drawImage(runtime.oceanCache[key], 0, 0);
  }

  function drawGrid(ctx, width, height) {
    ctx.save();
    ctx.lineWidth = Math.max(.5, width / 4096);
    ctx.strokeStyle = 'rgba(195,231,236,.13)';
    ctx.fillStyle = 'rgba(205,235,238,.46)';
    ctx.font = Math.max(8, Math.round(width / 256)) + 'px system-ui, sans-serif';
    for (var lon = -150; lon <= 150; lon += 30) {
      var x = (lon + 180) / 360 * width;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      if (width >= 1800) ctx.fillText((lon === 0 ? '0°' : Math.abs(lon) + '°' + (lon < 0 ? 'W' : 'E')), x + 3, 13 * width / 2048);
    }
    for (var lat = -60; lat <= 60; lat += 30) {
      var y = (90 - lat) / 180 * height;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      if (width >= 1800) ctx.fillText((lat === 0 ? '0°' : Math.abs(lat) + '°' + (lat < 0 ? 'S' : 'N')), 4, y - 4);
    }
    ctx.restore();
  }

  function transformedCenter(continent, width, height) {
    return {
      x: continent.data.sourceCenterX / continent.data.sourceWidth * width + continent.state.lonShift / 360 * width,
      y: continent.data.sourceCenterY / continent.data.sourceHeight * height - continent.state.latShift / 180 * height
    };
  }

  function eachWrap(continent, width, height, callback) {
    var center = transformedCenter(continent, width, height);
    [-width, 0, width].forEach(function (offset) {
      callback(center.x + offset, center.y);
    });
  }

  function drawOceanBuffer(ctx, continent, width, height, radius) {
    var scale = width / continent.data.sourceWidth;
    var dw = continent.data.width * scale;
    var dh = continent.data.height * scale;
    var samples = Math.max(12, Math.min(32, Math.round(radius * 5)));
    eachWrap(continent, width, height, function (cx, cy) {
      for (var i = 0; i < samples; i++) {
        var angle = i / samples * Math.PI * 2;
        ctx.save();
        ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        ctx.rotate(continent.state.rotation * Math.PI / 180);
        ctx.globalAlpha = .98;
        ctx.drawImage(continent.silhouette, -dw / 2, -dh / 2, dw, dh);
        ctx.restore();
      }
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(continent.state.rotation * Math.PI / 180);
      ctx.drawImage(continent.silhouette, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    });
  }

  function drawContinent(ctx, continent, width, height) {
    var scale = width / continent.data.sourceWidth;
    var dw = continent.data.width * scale;
    var dh = continent.data.height * scale;
    eachWrap(continent, width, height, function (cx, cy) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(continent.state.rotation * Math.PI / 180);
      ctx.drawImage(continent.image, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    });
  }

  function drawContinentName(ctx, continent, width, height) {
    var center = transformedCenter(continent, width, height);
    var size = Math.max(11, Math.round(width / 175));
    ctx.save();
    ctx.font = '700 ' + size + 'px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = Math.max(2, size * .28);
    ctx.strokeStyle = 'rgba(2,11,16,.86)';
    ctx.fillStyle = '#f2f4e9';
    [-width, 0, width].forEach(function (offset) {
      ctx.strokeText(continent.state.name || continent.data.defaultName, center.x + offset, center.y);
      ctx.fillText(continent.state.name || continent.data.defaultName, center.x + offset, center.y);
    });
    ctx.restore();
  }

  function drawFeatureLabels(ctx, continent, width, height) {
    var features = continent.state.features || [];
    if (!features.length) return;
    var positioned = features.filter(function (feature) { return featurePosition(feature, continent, width, height); }).slice(0, 160);
    if (!positioned.length) return;
    var fontSize = Math.max(7, Math.round(width / 310));
    ctx.save();
    ctx.font = '600 ' + fontSize + 'px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    positioned.forEach(function (feature) {
      var pos = featurePosition(feature, continent, width, height);
      if (!pos) return;
      [-width, 0, width].forEach(function (wrap) {
        var x = pos.x + wrap;
        var y = pos.y;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(1.5, fontSize * .18), 0, Math.PI * 2);
        ctx.fillStyle = '#7de7ef';
        ctx.fill();
        ctx.lineWidth = Math.max(1.5, fontSize * .26);
        ctx.strokeStyle = 'rgba(1,10,16,.88)';
        ctx.strokeText(feature.name, x + fontSize * .45, y);
        ctx.fillStyle = '#d7f5f4';
        ctx.fillText(feature.name, x + fontSize * .45, y);
      });
    });
    ctx.restore();
  }

  function featurePosition(feature, continent, width, height) {
    var localX, localY;
    var scale = width / continent.data.sourceWidth;
    if (isFiniteNumber(feature.relativeX) && isFiniteNumber(feature.relativeY)) {
      localX = (feature.relativeX - .5) * continent.data.width * scale;
      localY = (feature.relativeY - .5) * continent.data.height * scale;
    } else if (isFiniteNumber(feature.longitude) && isFiniteNumber(feature.latitude)) {
      var sourceX = (feature.longitude + 180) / 360 * continent.data.sourceWidth;
      var sourceY = (90 - feature.latitude) / 180 * continent.data.sourceHeight;
      localX = (sourceX - continent.data.sourceCenterX) * scale;
      localY = (sourceY - continent.data.sourceCenterY) * scale;
    } else {
      return null;
    }
    var angle = continent.state.rotation * Math.PI / 180;
    var rx = localX * Math.cos(angle) - localY * Math.sin(angle);
    var ry = localX * Math.sin(angle) + localY * Math.cos(angle);
    var center = transformedCenter(continent, width, height);
    return { x: center.x + rx, y: center.y + ry };
  }

  function isFiniteNumber(value) { return typeof value === 'number' && isFinite(value); }

  function drawExportLegend(ctx, width, height) {
    var pad = width * .012;
    var boxW = width * .29;
    var boxH = height * .095;
    ctx.save();
    ctx.fillStyle = 'rgba(2,13,21,.78)';
    roundRect(ctx, pad, pad, boxW, boxH, width * .006);
    ctx.fill();
    ctx.strokeStyle = 'rgba(112,211,214,.42)';
    ctx.lineWidth = Math.max(1, width / 2048);
    ctx.stroke();
    ctx.fillStyle = '#f2f6f0';
    ctx.font = '700 ' + Math.max(12, width / 108) + 'px system-ui, sans-serif';
    ctx.fillText(els.title.value || 'My WorldBuilder World', pad * 1.6, pad * 2.15);
    ctx.fillStyle = '#a7cad0';
    ctx.font = Math.max(9, width / 205) + 'px system-ui, sans-serif';
    var bufferLabel = els.oceanUnit.value === 'kilometers' ? '50 km deep-ocean border' : '50 mi / 80.47 km deep-ocean border';
    ctx.fillText(runtime.preset.label + ' · ' + bufferLabel, pad * 1.6, pad * 3.42);
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function renderMapDisplay() {
    mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    mapCtx.drawImage(textureCanvas, 0, 0, mapCanvas.width, mapCanvas.height);
    var selected = selectedContinent();
    if (selected) drawSelectionOutline(selected);
    drawHighlightOverlay();
    drawBrushCursor();
  }

  function drawSelectionOutline(continent) {
    var width = mapCanvas.width, height = mapCanvas.height;
    var scale = width / continent.data.sourceWidth;
    var radius = Math.max(2.5, width / 500);
    var localRadius = Math.max(1, radius / scale);
    var outline = buildLocalOutline(continent, localRadius);
    var margin = outline.margin * scale;
    var dw = outline.canvas.width * scale;
    var dh = outline.canvas.height * scale;
    eachWrap(continent, width, height, function (cx, cy) {
      mapCtx.save();
      mapCtx.translate(cx, cy);
      mapCtx.rotate(continent.state.rotation * Math.PI / 180);
      mapCtx.globalAlpha = .96;
      mapCtx.drawImage(outline.canvas, -continent.data.width * scale / 2 - margin, -continent.data.height * scale / 2 - margin, dw, dh);
      mapCtx.restore();
    });
  }

  function buildLocalOutline(continent, localRadius) {
    var key = Math.max(1, Math.round(localRadius));
    continent.outlineCache = continent.outlineCache || {};
    if (continent.outlineCache[key]) return continent.outlineCache[key];
    var margin = key + 2;
    var c = document.createElement('canvas');
    c.width = continent.data.width + margin * 2;
    c.height = continent.data.height + margin * 2;
    var x = c.getContext('2d');
    var tint = tintedSilhouette(continent, '#f0c87a');
    for (var i = 0; i < 20; i++) {
      var a = i / 20 * Math.PI * 2;
      x.drawImage(tint, margin + Math.cos(a) * key, margin + Math.sin(a) * key);
    }
    x.globalCompositeOperation = 'destination-out';
    x.drawImage(continent.silhouette, margin, margin);
    x.globalCompositeOperation = 'source-over';
    var result = { canvas: c, margin: margin };
    continent.outlineCache[key] = result;
    return result;
  }

  function tintedSilhouette(continent, color) {
    var cacheKey = color || '#f0c87a';
    continent.tintCache = continent.tintCache || {};
    if (continent.tintCache[cacheKey]) return continent.tintCache[cacheKey];
    var c = document.createElement('canvas');
    c.width = continent.data.width; c.height = continent.data.height;
    var x = c.getContext('2d');
    x.drawImage(continent.image, 0, 0);
    x.globalCompositeOperation = 'source-in';
    x.fillStyle = cacheKey;
    x.fillRect(0, 0, c.width, c.height);
    x.globalCompositeOperation = 'source-over';
    continent.tintCache[cacheKey] = c;
    return c;
  }

  function drawHighlightOverlay() {
    var highlights = (runtime.highlight || []).slice();
    if (runtime.activeStroke && runtime.activeStroke.kind === 'highlight') highlights.push(runtime.activeStroke);
    if (!highlights.length) return;
    mapCtx.save();
    mapCtx.globalCompositeOperation = 'source-over';
    highlights.forEach(function (stroke) {
      mapCtx.save();
      mapCtx.globalAlpha = .34;
      drawStrokeMask(mapCtx, stroke, mapCanvas.width, mapCanvas.height, '#ffd876');
      mapCtx.globalAlpha = .88;
      mapCtx.setLineDash([Math.max(4, mapCanvas.width / 260), Math.max(3, mapCanvas.width / 360)]);
      var outlineStroke = { points: stroke.points, sizeKm: Math.max(10, stroke.sizeKm * .96) };
      drawWrappedPath(mapCtx, outlineStroke.points, mapCanvas.width, mapCanvas.height, Math.max(1.5, stroke.sizeKm / 40075.017 * mapCanvas.width * 2), '#ffeab0', .55);
      mapCtx.restore();
    });
    mapCtx.restore();
  }

  function drawBrushCursor() {
    if (!runtime.brushCursor || runtime.tool === 'move') return;
    var radius = Math.max(2, Number(els.brushSize.value || 300) / 40075.017 * mapCanvas.width);
    mapCtx.save();
    mapCtx.strokeStyle = runtime.tool === 'highlight' ? '#ffe29a' : (runtime.tool === 'smudge' ? '#d7b5ff' : '#baf7e6');
    mapCtx.fillStyle = runtime.tool === 'highlight' ? 'rgba(255,220,120,.10)' : 'rgba(101,232,207,.08)';
    mapCtx.lineWidth = Math.max(1.2, mapCanvas.width / 1100);
    mapCtx.setLineDash([5, 4]);
    [-mapCanvas.width, 0, mapCanvas.width].forEach(function (wrap) {
      mapCtx.beginPath();
      mapCtx.arc(runtime.brushCursor.x + wrap, runtime.brushCursor.y, radius, 0, Math.PI * 2);
      mapCtx.fill();
      mapCtx.stroke();
    });
    mapCtx.restore();
  }

  function onMapPointerDown(event) {
    if (!runtime.imagesReady) return;
    var point = mapPoint(event);
    runtime.brushCursor = point;

    if (runtime.tool !== 'move') {
      var types = selectedTerrainTypes();
      if (!types.length && runtime.tool !== 'highlight') {
        toast('Select at least one terrain toggle.');
        return;
      }
      runtime.brushActive = true;
      runtime.activeStroke = {
        kind: runtime.tool,
        points: [normalizeMapPoint(point)],
        sizeKm: Number(els.brushSize.value || 300),
        types: types,
        useHeight: !!els.useHeight.checked,
        height: Number(els.heightValue.value || 0),
        useDepth: !!els.useDepth.checked,
        depth: Number(els.depthValue.value || 0),
        strength: Number(els.smudgeStrength.value || 45),
        extendBoundaries: !els.extendBoundaries || !!els.extendBoundaries.checked,
        autoMatchTerrain: !els.autoMatchTerrain || !!els.autoMatchTerrain.checked,
        attachToSelected: !els.attachNewTerrain || !!els.attachNewTerrain.checked,
        selectedContinentKey: runtime.selectedKey || null,
        seed: Math.floor(Math.random() * 2147483647),
        created: Date.now()
      };
      mapCanvas.classList.add('dragging');
      try { mapCanvas.setPointerCapture(event.pointerId); } catch (captureErr) {}
      queueRender();
      return;
    }

    var hit = hitTest(point.x, point.y);
    if (hit) {
      selectContinent(hit.data.key, true);
      runtime.dragging = true;
      runtime.dragStart = {
        pointerX: point.x,
        pointerY: point.y,
        lon: hit.state.lonShift,
        lat: hit.state.latShift
      };
      mapCanvas.classList.add('dragging');
      try { mapCanvas.setPointerCapture(event.pointerId); } catch (captureErr2) {}
    } else {
      runtime.selectedKey = null;
      updateSelectionUi();
      rebuildContinentList();
      queueRender();
    }
  }

  function onMapPointerMove(event) {
    var point = mapPoint(event);
    runtime.brushCursor = point;

    if (runtime.brushActive && runtime.activeStroke) {
      appendStrokePoint(runtime.activeStroke, normalizeMapPoint(point));
      queueRender();
      return;
    }

    if (!runtime.dragging || !runtime.dragStart) {
      if (runtime.tool !== 'move') queueRender();
      return;
    }
    var selected = selectedContinent();
    if (!selected) return;
    selected.state.lonShift = normalizeLongitude(runtime.dragStart.lon + (point.x - runtime.dragStart.pointerX) / mapCanvas.width * 360);
    selected.state.latShift = clampLatShift(selected, runtime.dragStart.lat - (point.y - runtime.dragStart.pointerY) / mapCanvas.height * 180);
    markPlateCorrectionsStale();
    updateSelectionUi();
    queueRender();
  }

  function onMapPointerUp(event) {
    if (runtime.brushActive && runtime.activeStroke) {
      var stroke = runtime.activeStroke;
      runtime.brushActive = false;
      runtime.activeStroke = null;
      mapCanvas.classList.remove('dragging');
      try { mapCanvas.releasePointerCapture(event.pointerId); } catch (brushErr) {}
      captureStrokeAttachment(stroke);
      if (stroke.kind === 'highlight') {
        runtime.highlight.push(stroke);
        toast('Area highlighted. Use Round out straight edges when ready.');
      } else {
        currentStore().terrainStrokes.push(stroke);
        saveProject();
        toast(stroke.kind === 'smudge' ? 'Smudge stroke added.' : 'Terrain brush stroke added.');
      }
      updateTerrainUi();
      queueRender();
      return;
    }

    if (!runtime.dragging) return;
    runtime.dragging = false;
    runtime.dragStart = null;
    mapCanvas.classList.remove('dragging');
    try { mapCanvas.releasePointerCapture(event.pointerId); } catch (err) {}
    saveProject();
    updateTerrainUi();
  }

  function normalizeMapPoint(point) {
    return { x: clamp(point.x / mapCanvas.width, 0, 1), y: clamp(point.y / mapCanvas.height, 0, 1) };
  }

  function appendStrokePoint(stroke, point) {
    var last = stroke.points[stroke.points.length - 1];
    var min = Math.max(.0015, stroke.sizeKm / 40075.017 * .22);
    var dx = wrappedDelta(point.x, last.x);
    var dy = point.y - last.y;
    if (Math.sqrt(dx * dx + dy * dy) >= min) stroke.points.push(point);
  }

  function wrappedDelta(a, b) {
    var d = a - b;
    if (d > .5) d -= 1;
    if (d < -.5) d += 1;
    return d;
  }

  function mapPoint(event) {
    var rect = mapCanvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width * mapCanvas.width,
      y: (event.clientY - rect.top) / rect.height * mapCanvas.height
    };
  }

  function hitTest(x, y) {
    for (var index = runtime.continents.length - 1; index >= 0; index--) {
      var continent = runtime.continents[index];
      var center = transformedCenter(continent, mapCanvas.width, mapCanvas.height);
      var scale = mapCanvas.width / continent.data.sourceWidth;
      for (var wi = -1; wi <= 1; wi++) {
        var dx = x - (center.x + wi * mapCanvas.width);
        var dy = y - center.y;
        var angle = -continent.state.rotation * Math.PI / 180;
        var rx = dx * Math.cos(angle) - dy * Math.sin(angle);
        var ry = dx * Math.sin(angle) + dy * Math.cos(angle);
        var ix = Math.floor(rx / scale + continent.data.width / 2);
        var iy = Math.floor(ry / scale + continent.data.height / 2);
        if (ix >= 0 && iy >= 0 && ix < continent.data.width && iy < continent.data.height) {
          var alpha = continent.alpha[(iy * continent.data.width + ix) * 4 + 3];
          if (alpha > 28) return continent;
        }
      }
    }
    return null;
  }

  function rebuildContinentList() {
    els.continentList.innerHTML = '';
    runtime.continents.forEach(function (continent) {
      var row = document.createElement('button');
      row.type = 'button';
      row.className = 'continent-row' + (runtime.selectedKey === continent.data.key ? ' selected' : '');
      var dot = document.createElement('i');
      dot.style.background = continent.data.accent;
      dot.style.color = continent.data.accent;
      var name = document.createElement('span');
      name.textContent = continent.state.name || continent.data.defaultName;
      var count = document.createElement('small');
      count.textContent = (continent.state.features || []).length + ' names';
      row.appendChild(dot); row.appendChild(name); row.appendChild(count);
      row.addEventListener('click', function () { selectContinent(continent.data.key, true); });
      els.continentList.appendChild(row);
    });
  }

  function handleFeatureUpload(event) {
    var selected = selectedContinent();
    var file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!selected || !file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var parsed = JSON.parse(reader.result);
        var features = normalizeFeatureCatalog(parsed);
        var priorCount = Array.isArray(selected.state.features) ? selected.state.features.length : 0;
        selected.state.features = mergeFeatureCatalog(selected.state.features, features);
        if (parsed && typeof parsed.continentName === 'string' && parsed.continentName.trim()) {
          selected.state.name = parsed.continentName.trim();
        }
        selected.state.featureCatalogSource = {
          filename: file.name || 'continent-features.json',
          importedAt: new Date().toISOString(),
          incomingCount: features.length,
          priorCount: priorCount,
          mergedCount: selected.state.features.length
        };
        saveProject();
        updateSelectionUi();
        rebuildContinentList();
        queueRender();
        toast('Merged ' + features.length + ' named feature' + (features.length === 1 ? '' : 's') + ' into ' + selected.state.name + '.');
      } catch (err) {
        toast('That file is not valid JSON.');
      }
    };
    reader.readAsText(file);
  }

  function mergeFeatureCatalog(existing, incoming) {
    var merged = {};
    function add(feature) {
      if (!feature || !feature.name) return;
      var normalized = cloneWorldBuilder(feature);
      var key = String(normalized.type || 'feature').toLowerCase() + '|' + String(normalized.name).toLowerCase();
      merged[key] = merged[key] ? deepMergeWorldBuilder(merged[key], normalized) : normalized;
    }
    (Array.isArray(existing) ? existing : []).forEach(add);
    (Array.isArray(incoming) ? incoming : []).forEach(add);
    return Object.keys(merged).map(function (key) { return merged[key]; });
  }

  function normalizeFeatureCatalog(raw) {
    var output = [];
    var reserved = { continent: true, continentName: true, name: true, metadata: true };

    function pushItem(item, fallbackType) {
      if (typeof item === 'string') {
        if (item.trim()) output.push({ type: singular(fallbackType || 'feature'), name: item.trim() });
        return;
      }
      if (!item || typeof item !== 'object') return;
      var name = String(item.name || item.label || item.title || '').trim();
      if (!name) return;
      var feature = {
        type: singular(String(item.type || item.kind || item.category || fallbackType || 'feature')),
        name: name
      };
      var lon = numeric(item.longitude, item.lon, item.lng, item.xLongitude);
      var lat = numeric(item.latitude, item.lat, item.yLatitude);
      var rx = numeric(item.relativeX, item.x);
      var ry = numeric(item.relativeY, item.y);
      if (lon !== null && lat !== null) { feature.longitude = lon; feature.latitude = lat; }
      else if (rx !== null && ry !== null && rx >= 0 && rx <= 1 && ry >= 0 && ry <= 1) { feature.relativeX = rx; feature.relativeY = ry; }
      if (item.notes) feature.notes = String(item.notes);
      output.push(feature);
    }

    if (Array.isArray(raw)) {
      raw.forEach(function (item) { pushItem(item, 'feature'); });
    } else if (raw && Array.isArray(raw.features)) {
      raw.features.forEach(function (item) { pushItem(item, 'feature'); });
    }

    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      Object.keys(raw).forEach(function (key) {
        if (reserved[key] || key === 'features') return;
        var value = raw[key];
        if (Array.isArray(value)) value.forEach(function (item) { pushItem(item, key); });
        else if (value && typeof value === 'object') {
          Object.keys(value).forEach(function (subkey) {
            var sub = value[subkey];
            if (Array.isArray(sub)) sub.forEach(function (item) { pushItem(item, subkey || key); });
          });
        }
      });
    }

    var seen = {};
    return output.filter(function (feature) {
      var key = feature.type.toLowerCase() + '|' + feature.name.toLowerCase();
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function numeric() {
    for (var i = 0; i < arguments.length; i++) {
      var value = arguments[i];
      if (typeof value === 'number' && isFinite(value)) return value;
      if (typeof value === 'string' && value.trim() !== '' && isFinite(Number(value))) return Number(value);
    }
    return null;
  }

  function singular(value) {
    var text = String(value || 'feature').trim().toLowerCase().replace(/_/g, ' ');
    if (text.slice(-3) === 'ies') return text.slice(0, -3) + 'y';
    if (/(shes|ches|xes|zes)$/.test(text)) return text.slice(0, -2);
    if (text.slice(-1) === 's' && text.slice(-2) !== 'ss') return text.slice(0, -1);
    return text;
  }

  function updateFeatureUi() {
    var selected = selectedContinent();
    var features = selected ? (selected.state.features || []) : [];
    els.featureCount.textContent = String(features.length);
    els.clearFeatures.disabled = !selected || !features.length;
    if (!selected) {
      els.featureSummary.className = 'feature-summary empty';
      els.featureSummary.textContent = 'Select a continent, then upload rivers, lakes, streams, bays, gulfs, canals, marshes, reefs, or other named waters.';
      return;
    }
    if (!features.length) {
      els.featureSummary.className = 'feature-summary empty';
      els.featureSummary.textContent = 'No feature catalog is attached to ' + selected.state.name + ' yet.';
      return;
    }
    var groups = {};
    features.forEach(function (feature) {
      var type = feature.type || 'feature';
      if (!groups[type]) groups[type] = [];
      groups[type].push(feature.name);
    });
    els.featureSummary.className = 'feature-summary';
    els.featureSummary.innerHTML = '';
    Object.keys(groups).sort().forEach(function (type) {
      var block = document.createElement('div');
      block.className = 'feature-group';
      var strong = document.createElement('strong');
      strong.textContent = type + ' (' + groups[type].length + ')';
      var text = document.createTextNode(' · ' + groups[type].slice(0, 12).join(', ') + (groups[type].length > 12 ? '…' : ''));
      block.appendChild(strong); block.appendChild(text);
      els.featureSummary.appendChild(block);
    });
  }

  function downloadFeatureTemplate() {
    var selected = selectedContinent();
    if (!selected) return;
    var template = {
      continentName: selected.state.name,
      features: [
        { type: 'river', name: '', longitude: 0, latitude: 0 },
        { type: 'lake', name: '', relativeX: 0.5, relativeY: 0.5 },
        { type: 'stream', name: '' },
        { type: 'bay', name: '' },
        { type: 'gulf', name: '' },
        { type: 'canal', name: '' },
        { type: 'marsh', name: '' },
        { type: 'reef', name: '' }
      ],
      rivers: [], lakes: [], streams: [], bays: [], gulfs: [], canals: [], marshes: [], reefs: []
    };
    downloadBlob(new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' }), safeName(selected.state.name) + '-water-features.json');
  }

  function exportPng() {
    if (!runtime.imagesReady) return;
    var width = Number(els.exportSize.value || 4096);
    var canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = width / 2;
    renderWorld(canvas, { labels: true, grid: els.showGrid.checked, names: els.showNames.checked, features: els.showFeatures.checked, legend: true });
    els.status.textContent = 'Preparing PNG export…';
    canvas.toBlob(function (blob) {
      if (!blob) { toast('The browser could not create the PNG.'); return; }
      downloadBlob(blob, safeName(els.title.value || 'worldbuilder-world') + '-flat-map.png');
      els.status.textContent = 'PNG exported at ' + width + ' × ' + (width / 2) + '.';
      toast('Flat-map PNG exported.');
    }, 'image/png');
  }

  function exportHtml() {
    if (!runtime.imagesReady) return;
    var width = Number(els.exportSize.value || 4096);
    var canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = width / 2;
    renderWorld(canvas, { labels: true, grid: els.showGrid.checked, names: els.showNames.checked, features: els.showFeatures.checked, legend: true });
    var imageData = canvas.toDataURL('image/png');
    var summary = runtime.continents.map(function (continent) {
      var groups = {};
      (continent.state.features || []).forEach(function (feature) { groups[feature.type || 'feature'] = (groups[feature.type || 'feature'] || 0) + 1; });
      return { name: continent.state.name, source: continent.data.defaultName, featureCount: (continent.state.features || []).length, categories: groups };
    });
    var html = buildStandaloneHtml(imageData, summary);
    downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), 'globe.html');
    els.status.textContent = 'Self-contained globe.html exported.';
    toast('globe.html exported.');
  }

  function buildStandaloneHtml(imageData, summary) {
    var title = escapeHtml(els.title.value || 'My WorldBuilder World');
    var frame = escapeHtml(runtime.preset.label);
    var ocean = els.oceanUnit.value === 'kilometers' ? '50 km' : '50 miles / 80.47 km';
    var dataJson = JSON.stringify(summary).replace(/<\//g, '<\\/');
    return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<title>' + title + '</title><style>' + standaloneCss() + '</style></head><body>' +
      '<header><div><span>WorldBuilder globe export</span><h1>' + title + '</h1><p>' + frame + ' · ' + ocean + ' deep-ocean border</p></div><button id="map-save">Save map PNG</button></header>' +
      '<main><section class="globe-card"><canvas id="globe"></canvas><div class="globe-help">Drag to rotate · wheel to zoom · <button id="spin">Pause spin</button></div></section>' +
      '<section class="map-card"><img id="flat" alt="Exported equirectangular world map" src="' + imageData + '"></section>' +
      '<aside><h2>Continents</h2><div id="continents"></div></aside></main>' +
      '<script>var MAP_DATA=' + JSON.stringify(imageData) + ';var CONTINENTS=' + dataJson + ';' + standaloneJs() + '<\/script></body></html>';
  }

  function standaloneCss() {
    return '*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#06111b;color:#edf7f4;font-family:Inter,system-ui,sans-serif}body{background:radial-gradient(circle at 25% 0,#12384a,#06111b 45%)}header{padding:18px 24px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(130,205,215,.2);background:rgba(3,14,22,.88)}header span{color:#53d4c7;text-transform:uppercase;letter-spacing:.14em;font-size:10px;font-weight:800}h1{margin:4px 0;font-size:24px}header p{margin:0;color:#94b3bb;font-size:12px}button{border:1px solid rgba(113,202,214,.35);border-radius:10px;background:#12364a;color:#e8f7f3;padding:9px 12px;cursor:pointer}main{padding:18px;display:grid;grid-template-columns:minmax(420px,1.1fr) minmax(420px,1.6fr) 260px;gap:16px}.globe-card,.map-card,aside{border:1px solid rgba(130,205,215,.2);border-radius:18px;background:rgba(7,27,41,.91);box-shadow:0 22px 60px rgba(0,0,0,.35);overflow:hidden}.globe-card{min-height:520px;display:grid;grid-template-rows:1fr auto}#globe{width:100%;height:100%;display:block;min-height:450px;background:radial-gradient(circle,#12334a,#02070c 70%)}.globe-help{padding:10px 14px;color:#91adb6;font-size:11px;border-top:1px solid rgba(130,205,215,.16)}.globe-help button{padding:3px 7px;margin-left:5px}.map-card{display:grid;place-items:center;padding:10px}.map-card img{display:block;width:100%;height:auto;border-radius:12px}aside{padding:16px;overflow:auto}aside h2{margin:0 0 12px;font-size:15px;color:#57d7cb}.continent{padding:9px 0;border-bottom:1px solid rgba(130,205,215,.14)}.continent strong{display:block;font-size:12px}.continent small{color:#8faeb6}.cats{margin-top:4px;color:#c5dadd;font-size:10px;line-height:1.5}@media(max-width:1100px){main{grid-template-columns:1fr}.globe-card{min-height:480px}}';
  }

  function standaloneJs() {
    return '(function(){var canvas=document.getElementById("globe"),gl=canvas.getContext("webgl",{antialias:true,alpha:false});if(!gl){canvas.outerHTML="<p style=padding:30px>WebGL is unavailable, but the exported flat map and continent catalog remain usable.</p>";document.getElementById("map-save").onclick=function(){var x=document.createElement("a");x.href=MAP_DATA;x.download="worldbuilder-world-map.png";x.click()};var fallbackList=document.getElementById("continents");CONTINENTS.forEach(function(c){var d=document.createElement("div");d.className="continent";var cats=Object.keys(c.categories).map(function(k){return k+": "+c.categories[k]}).join(" · ");d.innerHTML="<strong>"+esc(c.name)+"</strong><small>"+c.featureCount+" named water features</small><div class=cats>"+esc(cats||"No attached catalog")+"</div>";fallbackList.appendChild(d)});return;}var vs="attribute vec2 a;varying vec2 v;void main(){v=(a+1.0)*0.5;gl_Position=vec4(a,0.0,1.0);}";var fs="precision mediump float;varying vec2 v;uniform sampler2D t;uniform float lon;uniform float lat;uniform float zoom;void main(){vec2 p=(v*2.0-1.0)/zoom;float r=dot(p,p);if(r>1.0){gl_FragColor=vec4(0.004,0.02,0.035,1.0);return;}float z=sqrt(1.0-r);vec3 n=vec3(p.x,p.y,z);float c=cos(lat),s=sin(lat);n=vec3(n.x,c*n.y-s*n.z,s*n.y+c*n.z);float lo=atan(n.x,n.z)+lon;float la=asin(clamp(n.y,-1.0,1.0));vec2 uv=vec2(fract(lo/6.2831853+0.5),0.5-la/3.14159265);vec3 col=texture2D(t,uv).rgb;float light=0.32+0.68*max(0.0,dot(normalize(vec3(-0.35,0.5,0.8)),normalize(vec3(p.x,p.y,z))));float rim=pow(1.0-z,3.0);col=col*light+vec3(0.05,0.24,0.3)*rim*0.45;gl_FragColor=vec4(col,1.0);}";function sh(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s}var pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,vs));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(pr);gl.useProgram(pr);var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);var a=gl.getAttribLocation(pr,"a");gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);var ulon=gl.getUniformLocation(pr,"lon"),ulat=gl.getUniformLocation(pr,"lat"),uz=gl.getUniformLocation(pr,"zoom");var tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);var im=new Image(),ready=false;im.onload=function(){gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);ready=true};im.src=MAP_DATA;var lon=0,lat=0,zoom=.88,drag=false,sx=0,sy=0,sl=0,sa=0,spin=true;function resize(){var d=Math.min(devicePixelRatio||1,2),r=canvas.getBoundingClientRect();canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);gl.viewport(0,0,canvas.width,canvas.height)}addEventListener("resize",resize);resize();canvas.onpointerdown=function(e){drag=true;sx=e.clientX;sy=e.clientY;sl=lon;sa=lat;canvas.setPointerCapture(e.pointerId)};canvas.onpointermove=function(e){if(!drag)return;lon=sl-(e.clientX-sx)*.008;lat=Math.max(-1.2,Math.min(1.2,sa+(e.clientY-sy)*.006))};canvas.onpointerup=function(e){drag=false;try{canvas.releasePointerCapture(e.pointerId)}catch(x){}};canvas.onwheel=function(e){e.preventDefault();zoom=Math.max(.55,Math.min(1.25,zoom-e.deltaY*.0005))};document.getElementById("spin").onclick=function(){spin=!spin;this.textContent=spin?"Pause spin":"Resume spin"};document.getElementById("map-save").onclick=function(){var x=document.createElement("a");x.href=MAP_DATA;x.download="worldbuilder-world-map.png";x.click()};var list=document.getElementById("continents");CONTINENTS.forEach(function(c){var d=document.createElement("div");d.className="continent";var cats=Object.keys(c.categories).map(function(k){return k+": "+c.categories[k]}).join(" · ");d.innerHTML="<strong>"+esc(c.name)+"</strong><small>"+c.featureCount+" named water features</small><div class=cats>"+esc(cats||"No attached catalog")+"</div>";list.appendChild(d)});function esc(s){return String(s).replace(/[&<>\"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;","\\\"":"&quot;"}[c]})}function frame(){requestAnimationFrame(frame);if(!ready)return;if(spin&&!drag)lon+=.0018;gl.uniform1f(ulon,lon);gl.uniform1f(ulat,lat);gl.uniform1f(uz,zoom);gl.drawArrays(gl.TRIANGLES,0,6)}frame()})();';
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char];
    });
  }

  function safeName(text) {
    return String(text || 'worldbuilder-world').trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, '-').replace(/\s+/g, '_').slice(0, 90) || 'worldbuilder-world';
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function toast(message) {
    clearTimeout(runtime.toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add('show');
    runtime.toastTimer = setTimeout(function () { els.toast.classList.remove('show'); }, 2600);
  }


  function deepMergeWorldBuilder(base, override) {
    if (Array.isArray(override)) return override.map(function (item) { return cloneWorldBuilder(item); });
    if (!override || typeof override !== 'object') return override;
    var output = (base && typeof base === 'object' && !Array.isArray(base)) ? cloneWorldBuilder(base) : {};
    Object.keys(override).forEach(function (key) {
      var value = override[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) output[key] = deepMergeWorldBuilder(output[key], value);
      else output[key] = cloneWorldBuilder(value);
    });
    return output;
  }

  function cloneWorldBuilder(value) {
    if (typeof structuredClone === 'function') {
      try { return structuredClone(value); } catch (_err) {}
    }
    if (typeof value === 'undefined') return undefined;
    return JSON.parse(JSON.stringify(value));
  }

  function initialCenterFor(data) {
    return {
      lon: (Number(data.sourceCenterX || 0) / Number(data.sourceWidth || runtime.preset.width || 1)) * 360 - 180,
      lat: 90 - (Number(data.sourceCenterY || 0) / Number(data.sourceHeight || runtime.preset.height || 1)) * 180
    };
  }

  function currentCenterFor(continent) {
    var initial = initialCenterFor(continent.data);
    return { lon: normalizeLongitude(initial.lon + Number(continent.state.lonShift || 0)), lat: clamp(initial.lat + Number(continent.state.latShift || 0), -90, 90) };
  }

  function captureStrokeAttachment(stroke) {
    if (!stroke || !stroke.attachToSelected || !stroke.selectedContinentKey || stroke.attachment) return stroke;
    var continent = findWorldBuilderContinent(stroke.selectedContinentKey);
    if (!continent) return stroke;
    var center = currentCenterFor(continent);
    stroke.attachment = { continentKey: continent.data.key, centerLon: center.lon, centerLat: center.lat, rotation: Number(continent.state.rotation || 0), capturedAt: Date.now() };
    return stroke;
  }

  function resolvedAttachedStroke(stroke) {
    if (!stroke || !stroke.points || !stroke.attachToSelected || !stroke.selectedContinentKey) return stroke;
    captureStrokeAttachment(stroke);
    if (!stroke.attachment) return stroke;
    var continent = findWorldBuilderContinent(stroke.selectedContinentKey);
    if (!continent) return stroke;
    var current = currentCenterFor(continent);
    var base = stroke.attachment;
    var delta = (Number(continent.state.rotation || 0) - Number(base.rotation || 0)) * Math.PI / 180;
    var cos = Math.cos(delta), sin = Math.sin(delta);
    var baseX = (Number(base.centerLon || 0) + 180) / 360;
    var baseY = (90 - Number(base.centerLat || 0)) / 180;
    var currentX = (Number(current.lon || 0) + 180) / 360;
    var currentY = (90 - Number(current.lat || 0)) / 180;
    var copy = Object.assign({}, stroke);
    copy.points = stroke.points.map(function (point) {
      var dx = wrappedDelta(Number(point.x || 0), baseX) * 360;
      var dy = (Number(point.y || 0) - baseY) * 180;
      var rx = dx * cos - dy * sin;
      var ry = dx * sin + dy * cos;
      var x = currentX + rx / 360;
      while (x < 0) x += 1;
      while (x >= 1) x -= 1;
      return { x: x, y: clamp(currentY + ry / 180, 0, 1) };
    });
    return copy;
  }

  function buildWorldBuilderSnapshot() {
    var store = runtime.preset ? ensureState(project.currentPreset) : null;
    return {
      version: project.version || 3,
      preset: project.currentPreset,
      frame: runtime.preset ? { year: runtime.preset.year, label: runtime.preset.label, description: runtime.preset.description } : null,
      title: project.title,
      oceanUnit: project.oceanUnit,
      worldBaseline: cloneWorldBuilder(project.worldBaseline),
      nameResolutions: cloneWorldBuilder(project.nameResolutions || []),
      selectedKey: runtime.selectedKey,
      continents: runtime.continents.map(function (continent, index) {
        var initial = initialCenterFor(continent.data);
        var current = currentCenterFor(continent);
        return {
          index: index + 1,
          key: continent.data.key,
          defaultName: continent.data.defaultName,
          name: continent.state.name || continent.data.defaultName,
          initialCenter: initial,
          center: current,
          lonShift: Number(continent.state.lonShift || 0),
          latShift: Number(continent.state.latShift || 0),
          rotation: Number(continent.state.rotation || 0),
          pixelWidth: continent.data.width,
          pixelHeight: continent.data.height,
          sourceWidth: continent.data.sourceWidth,
          sourceHeight: continent.data.sourceHeight,
          relativeArea: (continent.data.width * continent.data.height) / Math.max(1, continent.data.sourceWidth * continent.data.sourceHeight),
          features: cloneWorldBuilder(continent.state.features || []),
          overrideData: cloneWorldBuilder(continent.state.overrideData),
          overrideSource: cloneWorldBuilder(continent.state.overrideSource),
          plateRevision: store ? store.plateRevision : 0
        };
      }),
      terrain: store ? { strokes: cloneWorldBuilder(store.terrainStrokes), roundOperations: cloneWorldBuilder(store.roundOps), plateCorrections: cloneWorldBuilder(store.plateCorrections), plateRevision: store.plateRevision, plateReport: store.plateReport } : null
    };
  }

  function findWorldBuilderContinent(ref) {
    var query = String(ref || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
    if (!query && runtime.selectedKey) return runtime.byKey[runtime.selectedKey];
    return runtime.continents.find(function (continent) {
      return [continent.data.key, continent.data.defaultName, continent.state.name].some(function (value) {
        return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '') === query;
      });
    }) || runtime.continents.find(function (continent) {
      return String(continent.state.name || continent.data.defaultName).toLowerCase().indexOf(String(ref || '').toLowerCase()) >= 0;
    });
  }

  function setWorldBuilderBaseline(data, source) {
    project.worldBaseline = cloneWorldBuilder(data);
    project.importLog = project.importLog || [];
    project.importLog.push({ type: 'docx', source: source || 'world.docx', importedAt: new Date().toISOString() });
    saveProject();
    return buildWorldBuilderSnapshot();
  }

  function applyWorldBuilderOverride(ref, data, source) {
    var continent = findWorldBuilderContinent(ref);
    if (!continent) return { ok: false, error: 'continent-not-found' };
    continent.state.overrideData = deepMergeWorldBuilder(continent.state.overrideData || {}, data || {});
    continent.state.overrideSource = { filename: source || 'continent.json', importedAt: new Date().toISOString() };
    var requestedName = data && (data.continentName || data.continent_name || (data.continent && data.continent.name) || data.name);
    if (typeof requestedName === 'string' && requestedName.trim() && requestedName.trim().length < 100) continent.state.name = requestedName.trim();
    var features = normalizeFeatureCatalog(data || {});
    if (features.length) {
      var existing = {};
      (continent.state.features || []).forEach(function (feature) { existing[(feature.type + '|' + feature.name).toLowerCase()] = feature; });
      features.forEach(function (feature) { existing[(feature.type + '|' + feature.name).toLowerCase()] = feature; });
      continent.state.features = Object.keys(existing).map(function (key) { return existing[key]; });
    }
    project.importLog = project.importLog || [];
    project.importLog.push({ type: 'json', source: source || 'continent.json', continentKey: continent.data.key, importedAt: new Date().toISOString() });
    saveProject(); updateSelectionUi(); rebuildContinentList(); queueRender();
    return { ok: true, continent: continent.data.key, featureCount: continent.state.features.length, snapshot: buildWorldBuilderSnapshot() };
  }

  function renameWorldBuilderContinent(ref, name) {
    var continent = findWorldBuilderContinent(ref);
    name = String(name || '').trim();
    if (!continent || !name) return { ok: false, error: 'continent-or-name-missing' };
    continent.state.name = name.slice(0, 80);
    saveProject(); updateSelectionUi(); rebuildContinentList(); queueRender();
    return { ok: true, key: continent.data.key, name: continent.state.name };
  }

  function moveWorldBuilderContinent(ref, transform) {
    var continent = findWorldBuilderContinent(ref);
    if (!continent) return { ok: false, error: 'continent-not-found' };
    transform = transform || {};
    if (isFinite(Number(transform.lonShift))) continent.state.lonShift = normalizeLongitude(Number(transform.lonShift));
    if (isFinite(Number(transform.latShift))) continent.state.latShift = clampLatShift(continent, Number(transform.latShift));
    if (isFinite(Number(transform.rotation))) continent.state.rotation = normalizeAngle(Number(transform.rotation));
    if (isFinite(Number(transform.dx))) continent.state.lonShift = normalizeLongitude(continent.state.lonShift + Number(transform.dx));
    if (isFinite(Number(transform.dy))) continent.state.latShift = clampLatShift(continent, continent.state.latShift + Number(transform.dy));
    if (isFinite(Number(transform.dr))) continent.state.rotation = normalizeAngle(continent.state.rotation + Number(transform.dr));
    markPlateCorrectionsStale(); saveProject(); updateSelectionUi(); queueRender();
    return { ok: true, key: continent.data.key, center: currentCenterFor(continent), lonShift: continent.state.lonShift, latShift: continent.state.latShift, rotation: continent.state.rotation };
  }

  function removeNamedFeature(continent, name) {
    var target = String(name || '').toLowerCase();
    continent.state.features = (continent.state.features || []).filter(function (feature) { return String(feature.name || '').toLowerCase() !== target; });
  }

  function renameNamedFeature(continent, oldName, newName) {
    var target = String(oldName || '').toLowerCase();
    var found = false;
    (continent.state.features || []).forEach(function (feature) {
      if (!found && String(feature.name || '').toLowerCase() === target) { feature.name = newName; found = true; }
    });
    if (!found && newName) continent.state.features.push({ type: 'water', name: newName, relativeX: 0.5, relativeY: 0.5 });
  }

  function visitBaselineWaterCatalogs(callback) {
    var baseline = project.worldBaseline;
    if (!baseline || typeof baseline !== 'object') return false;
    baseline.catalogs = baseline.catalogs || {};
    var changed = false;
    ['oceans', 'seas', 'bays'].forEach(function (key) {
      var list = baseline.catalogs[key];
      if (!Array.isArray(list)) return;
      var next = [];
      list.forEach(function (item) {
        var result = callback(item, key);
        if (result !== null && typeof result !== 'undefined') next.push(result);
        if (result !== item) changed = true;
      });
      baseline.catalogs[key] = next;
    });
    return changed;
  }

  function removeBaselineWaterName(name) {
    var target = String(name || '').toLowerCase();
    return visitBaselineWaterCatalogs(function (item) {
      var value = typeof item === 'string' ? item : (item && (item.name || item.title || item.label));
      return String(value || '').toLowerCase() === target ? null : item;
    });
  }

  function renameBaselineWaterName(oldName, newName) {
    var target = String(oldName || '').toLowerCase(), found = false;
    visitBaselineWaterCatalogs(function (item) {
      var value = typeof item === 'string' ? item : (item && (item.name || item.title || item.label));
      if (found || String(value || '').toLowerCase() !== target) return item;
      found = true;
      if (typeof item === 'string') return newName;
      var copy = cloneWorldBuilder(item);
      if (Object.prototype.hasOwnProperty.call(copy, 'name')) copy.name = newName;
      else if (Object.prototype.hasOwnProperty.call(copy, 'title')) copy.title = newName;
      else copy.label = newName;
      return copy;
    });
    if (!found && newName) {
      project.worldBaseline = project.worldBaseline || {};
      project.worldBaseline.catalogs = project.worldBaseline.catalogs || {};
      project.worldBaseline.catalogs.bays = project.worldBaseline.catalogs.bays || [];
      project.worldBaseline.catalogs.bays.push(newName);
    }
    return found;
  }

  function resolveWorldBuilderWaterConflict(payload) {
    payload = payload || {};
    var a = findWorldBuilderContinent(payload.continentA);
    var b = findWorldBuilderContinent(payload.continentB);
    if (!a || !b) return { ok: false, error: 'continent-not-found' };
    if (payload.action === 'keepA') { removeNamedFeature(b, payload.nameB); removeBaselineWaterName(payload.nameB); }
    else if (payload.action === 'keepB') { removeNamedFeature(a, payload.nameA); removeBaselineWaterName(payload.nameA); }
    else if (payload.action === 'removeBoth') { removeNamedFeature(a, payload.nameA); removeNamedFeature(b, payload.nameB); removeBaselineWaterName(payload.nameA); removeBaselineWaterName(payload.nameB); }
    else if (payload.action === 'merge') { renameNamedFeature(a, payload.nameA, payload.newName); removeNamedFeature(b, payload.nameB); renameBaselineWaterName(payload.nameA, payload.newName); removeBaselineWaterName(payload.nameB); }
    project.nameResolutions = project.nameResolutions || [];
    project.nameResolutions.push({ id: payload.id || '', action: payload.action, continentA: a.data.key, continentB: b.data.key, nameA: payload.nameA, nameB: payload.nameB, result: payload.newName || null, resolvedAt: new Date().toISOString() });
    saveProject(); updateFeatureUi(); rebuildContinentList(); queueRender();
    return { ok: true, snapshot: buildWorldBuilderSnapshot() };
  }


  function coastlineTargets(scope) {
    if (scope === 'selected') {
      var selected = selectedContinent();
      return selected ? [selected] : [];
    }
    if (Array.isArray(scope)) return scope.map(findWorldBuilderContinent).filter(Boolean);
    if (typeof scope === 'string' && scope !== 'all') {
      var one = findWorldBuilderContinent(scope);
      return one ? [one] : [];
    }
    return runtime.continents.slice();
  }

  function previewCoastlineTransformation(options) {
    options = options || {};
    var targets = coastlineTargets(options.scope || 'all');
    var samples = clamp(Math.round(Number(options.samplesPerContinent || 36)), 12, 72);
    var islandDensity = clamp(Number(options.islandDensity == null ? .32 : options.islandDensity), 0, 1);
    var deltaDensity = clamp(Number(options.deltaDensity == null ? .42 : options.deltaDensity), 0, 1);
    return {
      ok: !!targets.length,
      scope: options.scope || 'all',
      continents: targets.map(function (c) { return c.state.name || c.data.defaultName; }),
      continentCount: targets.length,
      estimatedEdgeDabs: targets.length * samples,
      estimatedDeltas: Math.round(targets.length * samples * deltaDensity),
      estimatedIslands: Math.round(targets.length * samples * islandDensity),
      description: 'Replace visibly straight coastline segments with irregular land/coast/shallow-water transitions, branching delta mouths, and detached tiny islands. The operation is grouped as one undoable edit.'
    };
  }

  function applyCoastlineTransformation(options) {
    options = options || {};
    var preview = previewCoastlineTransformation(options);
    if (!preview.ok) return { ok: false, error: 'no-continent-targets', preview: preview };
    var targets = coastlineTargets(options.scope || 'all');
    var store = currentStore();
    var groupId = 'coastline-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
    store.terrainOperationHistory.push({ groupId: groupId, source: 'superbot-coastline', created: Date.now(), previousPlateCorrections: cloneWorldBuilder(store.plateCorrections || []), previousPlateRevision: Number(store.plateRevision || 0), previousPlateReport: String(store.plateReport || '') });
    if (store.terrainOperationHistory.length > 80) store.terrainOperationHistory.splice(0, store.terrainOperationHistory.length - 80);
    var samples = clamp(Math.round(Number(options.samplesPerContinent || 36)), 12, 72);
    var waviness = clamp(Number(options.waviness == null ? .72 : options.waviness), .05, 1);
    var deltaDensity = clamp(Number(options.deltaDensity == null ? .42 : options.deltaDensity), 0, 1);
    var islandDensity = clamp(Number(options.islandDensity == null ? .32 : options.islandDensity), 0, 1);
    var islandSize = clamp(Number(options.islandSizeKm || 48), 8, 220);
    var seed = Number(options.seed || stringHash(groupId + '|' + targets.map(function (c) { return c.data.key; }).join('|'))) >>> 0;
    var rng = seededRandom(seed);
    var selections = [];
    var strokes = [];
    var width = 2048, height = 1024;

    targets.forEach(function (continent, continentIndex) {
      var boundary = transformedBoundary(continent, width, height);
      if (!boundary.length) return;
      var center = transformedCenter(continent, width, height);
      var stride = Math.max(1, Math.floor(boundary.length / samples));
      var chosen = [];
      for (var i = continentIndex % stride; i < boundary.length && chosen.length < samples; i += stride) chosen.push(boundary[i]);
      chosen.forEach(function (point, index) {
        var dx = point.x - center.x;
        if (dx > width / 2) dx -= width;
        if (dx < -width / 2) dx += width;
        var dy = point.y - center.y;
        var len = Math.hypot(dx, dy) || 1;
        var nx = dx / len, ny = dy / len;
        var tangentX = -ny, tangentY = nx;
        var wave = (Math.sin(index * 2.399 + continentIndex * 1.71) * .55 + (rng() - .5)) * waviness;
        var edgeX = point.x + tangentX * wave * 10 + nx * (rng() - .35) * 9;
        var edgeY = point.y + tangentY * wave * 10 + ny * (rng() - .35) * 9;
        var normalized = { x: ((edgeX / width) % 1 + 1) % 1, y: clamp(edgeY / height, 0, 1) };
        var selectionStroke = { points: [normalized], sizeKm: 180 + waviness * 260, attachToSelected: true, selectedContinentKey: continent.data.key };
        captureStrokeAttachment(selectionStroke);
        selections.push(selectionStroke);

        strokes.push({ kind: 'paint', points: [normalized], sizeKm: 90 + waviness * 170, types: ['land','coastal','shallow'], useHeight: true, height: 180 + rng() * 520, useDepth: true, depth: 80 + rng() * 420, strength: 55, extendBoundaries: true, autoMatchTerrain: true, attachToSelected: true, selectedContinentKey: continent.data.key, seed: Math.floor(rng() * 2147483647), created: Date.now() + index, groupId: groupId, source: 'superbot-coastline', label: 'wavy coastline' });

        if (rng() < deltaDensity) {
          var deltaPoints = [];
          var branches = 2 + Math.floor(rng() * 3);
          for (var b = 0; b < branches; b++) {
            var out = 7 + rng() * 17;
            var spread = (b - (branches - 1) / 2) * (4 + rng() * 5);
            deltaPoints.push({ x: (((edgeX + nx * out + tangentX * spread) / width) % 1 + 1) % 1, y: clamp((edgeY + ny * out + tangentY * spread) / height, 0, 1) });
          }
          strokes.push({ kind: 'paint', points: [normalized].concat(deltaPoints), sizeKm: 45 + rng() * 95, types: ['land','coastal'], useHeight: true, height: 20 + rng() * 130, useDepth: true, depth: 40 + rng() * 160, strength: 62, extendBoundaries: true, autoMatchTerrain: true, attachToSelected: true, selectedContinentKey: continent.data.key, seed: Math.floor(rng() * 2147483647), created: Date.now() + 5000 + index, groupId: groupId, source: 'superbot-coastline', label: 'wavy delta' });
        }

        if (rng() < islandDensity) {
          var distance = 16 + rng() * 34;
          var islandPoint = { x: (((edgeX + nx * distance + tangentX * (rng() - .5) * 18) / width) % 1 + 1) % 1, y: clamp((edgeY + ny * distance + tangentY * (rng() - .5) * 18) / height, 0, 1) };
          strokes.push({ kind: 'paint', points: [islandPoint], sizeKm: islandSize * (.55 + rng() * .9), types: ['land','coastal'], useHeight: true, height: 20 + rng() * 260, useDepth: true, depth: 60 + rng() * 240, strength: 60, extendBoundaries: true, autoMatchTerrain: true, attachToSelected: true, selectedContinentKey: continent.data.key, seed: Math.floor(rng() * 2147483647), created: Date.now() + 10000 + index, groupId: groupId, source: 'superbot-coastline', label: 'tiny coastal island' });
        }
      });
    });

    strokes.forEach(captureStrokeAttachment);
    if (selections.length) store.roundOps.push({ kind: 'round', selections: selections, sizeKm: 240 + waviness * 380, strength: 42 + waviness * 35, types: ['land','coastal','shallow'], extendBoundaries: true, autoMatchTerrain: true, height: 460, depth: 540, seed: seed, created: Date.now(), groupId: groupId, source: 'superbot-coastline', label: 'remove straight coastline edges' });
    Array.prototype.push.apply(store.terrainStrokes, strokes);
    store.plateCorrections = [];
    store.plateReport = 'Coastlines changed after the last plate pass. Review the generated wavy deltas and tiny islands, then save & correct tectonic plates.';
    saveProject(); updateTerrainUi(); queueRender();
    toast('Superbot reshaped ' + targets.length + ' continent coastline' + (targets.length === 1 ? '' : 's') + ' with wavy deltas and tiny islands.');
    return { ok: true, groupId: groupId, continentCount: targets.length, edgeSelections: selections.length, generatedStrokes: strokes.length, estimatedDeltas: preview.estimatedDeltas, estimatedIslands: preview.estimatedIslands, undoable: true, preview: preview };
  }

  function undoLastTerrainOperation() {
    var before = currentStore().terrainStrokes.length + currentStore().roundOps.length + currentStore().plateCorrections.length;
    undoTerrainEdit();
    var after = currentStore().terrainStrokes.length + currentStore().roundOps.length + currentStore().plateCorrections.length;
    return { ok: after < before, removed: before - after };
  }

  function installWorldBuilderApi() {
    window.WorldBuilderEditor = {
      version: '3.1.0',
      getSnapshot: buildWorldBuilderSnapshot,
      getProject: function () { return cloneWorldBuilder(project); },
      getSelectedKey: function () { return runtime.selectedKey; },
      selectContinent: function (ref) { var c = findWorldBuilderContinent(ref); if (!c) return false; selectContinent(c.data.key, false); return true; },
      setWorldBaseline: setWorldBuilderBaseline,
      applyContinentOverride: applyWorldBuilderOverride,
      renameContinent: renameWorldBuilderContinent,
      moveContinent: moveWorldBuilderContinent,
      previewCoastlineTransformation: previewCoastlineTransformation,
      applyCoastlineTransformation: applyCoastlineTransformation,
      undoLastTerrainOperation: undoLastTerrainOperation,
      resolveTerrainStroke: function (stroke) { return cloneWorldBuilder(resolvedAttachedStroke(stroke)); },
      resolveWaterConflict: resolveWorldBuilderWaterConflict,
      normalizeFeatureCatalog: normalizeFeatureCatalog,
      mergeFeatureCatalog: mergeFeatureCatalog,
      deepMerge: deepMergeWorldBuilder,
      save: saveProject,
      render: queueRender,
      toast: toast,
      downloadBlob: downloadBlob,
      findContinent: function (ref) { var c = findWorldBuilderContinent(ref); return c ? c.data.key : null; },
      getGlobeRuntime: function () { return runtime.globe; },
      getTextureCanvas: function () { return textureCanvas; },
      getMapCanvas: function () { return mapCanvas; },
      forceResize: function () { resizeMapCanvas(); resizeGlobe(); queueRender(); },
      setGlobeDistance: function (distance) { if (!runtime.globe) return false; runtime.globe.camera.position.setLength(clamp(Number(distance || 3.15), 1.015, 12)); runtime.globe.controls.update(); return true; }

    };
  }

  function initGlobe() {
    if (!window.THREE || !window.THREE.WebGLRenderer) {
      els.globeWrap.textContent = 'WebGL preview unavailable.';
      return;
    }
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, 1, .005, 100);
    camera.position.z = 3.15;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    } catch (err) {
      els.globeWrap.innerHTML = '<div style="padding:24px;color:#8facb6;font-size:11px;line-height:1.55">Live WebGL preview is unavailable in this browser. Map editing and both exports remain available.</div>';
      return;
    }
    if (!renderer || !renderer.getContext || !renderer.getContext()) {
      els.globeWrap.innerHTML = '<div style="padding:24px;color:#8facb6;font-size:11px;line-height:1.55">Live WebGL preview is unavailable in this browser. Map editing and both exports remain available.</div>';
      return;
    }
    if (renderer.setPixelRatio) renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    els.globeWrap.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x6c8791));
    var light = new THREE.DirectionalLight(0xffffff, 1.15);
    light.position.set(4, 2.8, 5);
    scene.add(light);
    var rim = new THREE.DirectionalLight(0x55bbcc, .44);
    rim.position.set(-4, 1, -3);
    scene.add(rim);

    var texture = new THREE.Texture(textureCanvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    var sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 192, 128), new THREE.MeshPhongMaterial({ map: texture, color: 0xd8e2dc, specular: 0x203f52, shininess: 9, bumpMap: texture, bumpScale: .006 }));
    sphere.rotation.y = -.55;
    scene.add(sphere);

    var atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.018, 128, 96), new THREE.MeshBasicMaterial({ color: 0x4ba8c4, transparent: true, opacity: .08, side: THREE.BackSide }));
    scene.add(atmosphere);

    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 1.015;
    controls.maxDistance = 12;
    controls.noPan = true;
    controls.rotateSpeed = .72;
    controls.zoomSpeed = .7;

    runtime.globe = { scene: scene, camera: camera, renderer: renderer, sphere: sphere, atmosphere: atmosphere, texture: texture, controls: controls, spinning: true, basePositions: new Float32Array(sphere.geometry.attributes.position.array) };
    try { document.dispatchEvent(new CustomEvent('worldbuilder:globe-ready', { detail: { globe: runtime.globe, textureCanvas: textureCanvas } })); } catch (_err) {}
    resizeGlobe();
    (function animate() {
      requestAnimationFrame(animate);
      if (!runtime.globe) return;
      if (runtime.globe.spinning) runtime.globe.sphere.rotation.y += .0015;
      if (runtime.globe.controls) runtime.globe.controls.update();
      runtime.globe.renderer.render(runtime.globe.scene, runtime.globe.camera);
    }());
  }

  function resizeGlobe() {
    if (!runtime.globe) return;
    var rect = els.globeWrap.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    runtime.globe.camera.aspect = rect.width / rect.height;
    runtime.globe.camera.updateProjectionMatrix();
    runtime.globe.renderer.setSize(rect.width, rect.height);
  }

  function updateGlobeTexture() {
    if (runtime.globe && runtime.globe.texture) runtime.globe.texture.needsUpdate = true;
  }

  function toggleSpin() {
    if (!runtime.globe) return;
    runtime.globe.spinning = !runtime.globe.spinning;
    els.toggleSpin.textContent = runtime.globe.spinning ? 'Pause spin' : 'Resume spin';
  }
}());

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.editor","category":"system","sourceFile":"js/editor.js","companionCss":"css/editor.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
