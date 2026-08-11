(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const CONFIG = window.STUDIO_CONFIG || {};
  const BACKEND = CONFIG.backendUrl || '';
  const MAP_SCHEMA = 'universal.project-canvas.v2';
  const MAX_HISTORY = 15;

  const TERRAIN = {
    ocean: {label: 'Ocean', icon: '≈', color: '#2f79b8', accent: '#83c7e8', texture: 'waves'},
    deepwater: {label: 'Deep Water', icon: '≋', color: '#174a78', accent: '#2d79a8', texture: 'waves'},
    beach: {label: 'Beach', icon: '⌁', color: '#d9bf78', accent: '#f1daa0', texture: 'speckle'},
    grass: {label: 'Grassland', icon: '⌇', color: '#79a85b', accent: '#b2cf7a', texture: 'grass'},
    forest: {label: 'Forest', icon: '♠', color: '#315d37', accent: '#6d9a55', texture: 'trees'},
    mountain: {label: 'Mountain', icon: '▲', color: '#806e5c', accent: '#c5b7a3', texture: 'mountains'},
    snow: {label: 'Snow', icon: '✧', color: '#e8edf1', accent: '#b9cfdd', texture: 'snow'},
    desert: {label: 'Desert', icon: '∿', color: '#c99d55', accent: '#e6c77f', texture: 'dunes'},
    swamp: {label: 'Swamp', icon: '♣', color: '#596d43', accent: '#8f9b57', texture: 'marsh'},
    farmland: {label: 'Farmland', icon: '▥', color: '#a7844c', accent: '#d0b66e', texture: 'rows'},
    stone: {label: 'Stone', icon: '▧', color: '#777777', accent: '#a7a7a7', texture: 'stone'},
    cave: {label: 'Cave', icon: '◒', color: '#3c3735', accent: '#665d57', texture: 'stone'},
    lava: {label: 'Lava', icon: '♨', color: '#8d291c', accent: '#ff8b22', texture: 'lava'},
    void: {label: 'Void', icon: '✦', color: '#19152c', accent: '#6753a5', texture: 'stars'}
  };

  const SYMBOLS = [
    ['folder','Folder','▱'], ['file','File','▤'], ['database','Database','◫'],
    ['service','Service','⚙'], ['user','User','●'], ['device','Device','▣'],
    ['cloud','Cloud','☁'], ['link','Link','⌁'], ['flag','Flag','⚑'],
    ['note','Note','▧'], ['image','Image','▥'], ['table','Table','▦'],
    ['chart','Chart','▥'], ['warning','Warning','⚠'], ['connector','Connector','◎'],
    ['milestone','Milestone','◆'], ['tool','Tool','⌘'], ['pin','Pin','●']
  ];

  const SURFACE_PATHS = {
    parchment: 'assets/map/textures/pergamena-small.jpg',
    antique: 'assets/map/textures/antique-big.jpg',
    folded: 'assets/map/textures/folded-paper-big.jpg',
    marble: 'assets/map/textures/marble-big.jpg',
    timber: 'assets/map/textures/timbercut-big.jpg',
    plaster: 'assets/map/textures/plaster.jpg',
    ocean: 'assets/map/textures/ocean.jpg',
    'gray-paper': 'assets/map/textures/gray-paper.jpg'
  };

  const state = {
    initialized: false,
    mode: 'object',
    width: 1600,
    height: 1000,
    layers: [],
    activeLayerId: null,
    activeTool: 'paint',
    terrain: 'grass',
    drawing: false,
    startPoint: null,
    lastPoint: null,
    panStart: null,
    history: [],
    redo: [],
    zoom: 0.7,
    selectedSymbol: 'castle',
    customSymbol: null,
    markers: [],
    previewDirty: true,
    objectProjectName: 'No object',
    projectLoaded: false,
    preview: {
      initialized: false,
      scene: null,
      camera: null,
      renderer: null,
      controls: null,
      plane: null,
      mapTexture: null,
      heightTexture: null,
      waterPlane: null,
      waterTexture: null,
      cloudGroup: null,
      weather: null,
      markerGroup: null,
      ambient: null,
      sun: null,
      clock: null,
      resizeObserver: null
    },
    originalHandlers: {}
  };

  const compositeCanvas = $('#mapCompositeCanvas');
  const compositeCtx = compositeCanvas.getContext('2d', {willReadFrequently: true});
  const interactionCanvas = $('#mapInteractionCanvas');
  const interactionCtx = interactionCanvas.getContext('2d');
  const heightCanvas = $('#mapHeightCanvas');
  const heightCtx = heightCanvas.getContext('2d', {willReadFrequently: true});
  const heightInteraction = $('#mapHeightInteraction');
  const heightInteractionCtx = heightInteraction.getContext('2d');

  function toast(message, type = '') {
    const root = $('#toastRoot');
    if (!root) return;
    const item = document.createElement('div');
    item.className = `toast ${type}`.trim();
    item.textContent = message;
    root.appendChild(item);
    requestAnimationFrame(() => item.classList.add('show'));
    setTimeout(() => {
      item.classList.remove('show');
      setTimeout(() => item.remove(), 250);
    }, 3300);
  }

  function safeName(value) {
    return String(value || 'stationary-map')
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
      .replace(/[. ]+$/g, '')
      .replace(/\s+/g, '_') || 'stationary-map';
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function clonePlain(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function hashSeed(text) {
    let h = 2166136261 >>> 0;
    for (const char of String(text)) {
      h ^= char.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function activeLayer() {
    return state.layers.find(layer => layer.id === state.activeLayerId) || state.layers[state.layers.length - 1] || null;
  }

  function makeLayer(name, options = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = state.width;
    canvas.height = state.height;
    return {
      id: `layer_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: name || `Layer ${state.layers.length + 1}`,
      canvas,
      ctx: canvas.getContext('2d', {willReadFrequently: true}),
      visible: options.visible !== false,
      opacity: options.opacity ?? 1,
      blend: options.blend || 'source-over',
      locked: Boolean(options.locked)
    };
  }

  function addLayer(name, options = {}) {
    const layer = makeLayer(name, options);
    state.layers.push(layer);
    state.activeLayerId = layer.id;
    renderLayerList();
    renderComposite();
    return layer;
  }

  function selectLayer(id) {
    if (!state.layers.some(layer => layer.id === id)) return;
    state.activeLayerId = id;
    renderLayerList();
    syncLayerControls();
  }

  function renderLayerList() {
    const list = $('#mapLayerList');
    list.innerHTML = '';
    [...state.layers].reverse().forEach(layer => {
      const row = document.createElement('div');
      row.className = `layer-row${layer.id === state.activeLayerId ? ' is-active' : ''}`;
      row.dataset.layerId = layer.id;
      const visibility = document.createElement('button');
      visibility.title = layer.visible ? 'Hide layer' : 'Show layer';
      visibility.textContent = layer.visible ? '◉' : '○';
      visibility.addEventListener('click', event => {
        event.stopPropagation();
        layer.visible = !layer.visible;
        renderLayerList();
        renderComposite();
      });
      const name = document.createElement('button');
      name.className = 'layer-name';
      name.innerHTML = `${escapeHTML(layer.name)}<span class="layer-meta">${Math.round(layer.opacity * 100)}% · ${layer.blend === 'source-over' ? 'Normal' : layer.blend}</span>`;
      name.addEventListener('dblclick', event => {
        event.stopPropagation();
        const next = prompt('Layer name', layer.name);
        if (next && next.trim()) {
          layer.name = next.trim();
          renderLayerList();
        }
      });
      const lock = document.createElement('button');
      lock.title = layer.locked ? 'Unlock layer' : 'Lock layer';
      lock.textContent = layer.locked ? '🔒' : '🔓';
      lock.addEventListener('click', event => {
        event.stopPropagation();
        layer.locked = !layer.locked;
        renderLayerList();
      });
      row.append(visibility, name, lock);
      row.addEventListener('click', () => selectLayer(layer.id));
      list.appendChild(row);
    });
    $('#mapLayerCount').textContent = `${state.layers.length} layer${state.layers.length === 1 ? '' : 's'}`;
    $('#mapSummaryLayers').textContent = String(state.layers.length);
    syncLayerControls();
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[char]));
  }

  function syncLayerControls() {
    const layer = activeLayer();
    if (!layer) return;
    $('#mapLayerOpacity').value = Math.round(layer.opacity * 100);
    $('#mapLayerBlend').value = layer.blend;
  }

  function renderComposite() {
    compositeCtx.save();
    compositeCtx.setTransform(1, 0, 0, 1, 0, 0);
    compositeCtx.clearRect(0, 0, state.width, state.height);
    for (const layer of state.layers) {
      if (!layer.visible) continue;
      compositeCtx.globalAlpha = layer.opacity;
      compositeCtx.globalCompositeOperation = layer.blend;
      compositeCtx.drawImage(layer.canvas, 0, 0);
    }
    compositeCtx.restore();
    renderOverlay();
    state.previewDirty = true;
    if (state.preview.mapTexture) state.preview.mapTexture.needsUpdate = true;
    updateSummary();
  }

  function renderOverlay(preview = null) {
    interactionCtx.clearRect(0, 0, state.width, state.height);
    heightInteractionCtx.clearRect(0, 0, state.width, state.height);
    if ($('#mapGridEnabled').checked) drawGrid(interactionCtx, false);
    drawEffectPointOverlay(interactionCtx);
    if (preview) drawShapePreview(interactionCtx, preview);
  }

  function drawGrid(ctx, exportMode) {
    const type = $('#mapGridType').value;
    const size = Math.max(8, Number($('#mapGridSize').value) || 64);
    const color = $('#mapGridColor').value;
    const opacity = (Number($('#mapGridOpacity').value) || 35) / 100;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1, state.width / 2400);
    if (type === 'square') {
      ctx.beginPath();
      for (let x = 0; x <= state.width; x += size) { ctx.moveTo(x, 0); ctx.lineTo(x, state.height); }
      for (let y = 0; y <= state.height; y += size) { ctx.moveTo(0, y); ctx.lineTo(state.width, y); }
      ctx.stroke();
    } else if (type === 'dots') {
      const radius = Math.max(1.2, size / 30);
      for (let y = 0; y <= state.height; y += size) {
        for (let x = 0; x <= state.width; x += size) {
          ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
        }
      }
    } else {
      const h = Math.sqrt(3) * size / 2;
      ctx.beginPath();
      for (let row = -1; row <= state.height / h + 1; row++) {
        const y = row * h;
        const offset = row % 2 ? size * 0.75 : 0;
        for (let col = -1; col <= state.width / (size * 1.5) + 1; col++) {
          const cx = col * size * 1.5 + offset;
          for (let side = 0; side < 6; side++) {
            const a1 = Math.PI / 3 * side;
            const a2 = Math.PI / 3 * (side + 1);
            ctx.moveTo(cx + Math.cos(a1) * size, y + Math.sin(a1) * size);
            ctx.lineTo(cx + Math.cos(a2) * size, y + Math.sin(a2) * size);
          }
        }
      }
      ctx.stroke();
    }
    ctx.restore();
    if (!exportMode) $('#mapGridEnabled').setAttribute('aria-label', `${type} grid`);
  }

  function drawEffectPointOverlay(ctx) {
    ctx.save();
    for (const marker of state.markers) {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = marker.color;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(2, state.width / 800);
      ctx.beginPath();
      ctx.arc(marker.x, marker.y, Math.max(7, state.width / 180), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = `${Math.max(12, state.width / 100)}px Segoe UI Symbol`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✦', marker.x, marker.y + 1);
    }
    ctx.restore();
  }

  function updateSummary() {
    $('#mapSummarySize').textContent = `${state.width} × ${state.height}`;
    $('#mapSummaryLayers').textContent = String(state.layers.length);
    $('#mapSummaryMarkers').textContent = String(state.markers.length);
    $('#mapCanvasInfo').textContent = `${state.width} × ${state.height}`;
    $('#mapSummaryEffects').textContent = activeEffectNames().join(', ') || 'None';
    $('#mapLayerCount').textContent = `${state.layers.length} layer${state.layers.length === 1 ? '' : 's'}`;
  }

  function activeEffectNames() {
    const names = [];
    if ($('#mapReliefStrength').value > 0) names.push('Relief');
    if ($('#mapWaterEffect').checked) names.push('Water');
    if ($('#mapCloudEffect').checked) names.push('Clouds');
    if ($('#mapFogEffect').checked) names.push('Fog');
    if ($('#mapWeatherType').value !== 'none') names.push($('#mapWeatherType').selectedOptions[0].textContent);
    if (state.markers.length) names.push(`${state.markers.length} points`);
    return names;
  }

  function setCanvasSize(width, height, preserve = false) {
    width = Math.max(256, Math.min(8192, Math.round(width)));
    height = Math.max(256, Math.min(8192, Math.round(height)));
    const oldLayers = preserve ? state.layers.map(layer => ({layer, image: layer.canvas})) : [];
    const oldHeight = preserve ? copyCanvas(heightCanvas) : null;
    state.width = width;
    state.height = height;
    compositeCanvas.width = interactionCanvas.width = heightCanvas.width = heightInteraction.width = width;
    compositeCanvas.height = interactionCanvas.height = heightCanvas.height = heightInteraction.height = height;
    for (const layer of state.layers) {
      const old = preserve ? copyCanvas(layer.canvas) : null;
      layer.canvas.width = width;
      layer.canvas.height = height;
      layer.ctx = layer.canvas.getContext('2d', {willReadFrequently: true});
      if (old) layer.ctx.drawImage(old, 0, 0, width, height);
    }
    heightCtx.fillStyle = '#000000';
    heightCtx.fillRect(0, 0, width, height);
    if (oldHeight) heightCtx.drawImage(oldHeight, 0, 0, width, height);
    setZoom(state.zoom);
    renderLayerList();
    renderComposite();
    if (state.preview.initialized) rebuildPreviewPlane();
  }

  function copyCanvas(source) {
    const copy = document.createElement('canvas');
    copy.width = source.width;
    copy.height = source.height;
    copy.getContext('2d').drawImage(source, 0, 0);
    return copy;
  }

  function setZoom(value) {
    state.zoom = Math.max(0.1, Math.min(3, Number(value)));
    const width = Math.round(state.width * state.zoom);
    const height = Math.round(state.height * state.zoom);
    for (const wrap of [$('#mapCanvasWrap'), $('#mapHeightWrap')]) {
      wrap.style.width = `${width}px`;
      wrap.style.height = `${height}px`;
    }
    $('#mapZoom').value = Math.round(state.zoom * 100);
    $('#mapZoomOut').value = `${Math.round(state.zoom * 100)}%`;
    $('#mapZoomInfo').textContent = `${Math.round(state.zoom * 100)}%`;
  }

  function fitMap() {
    const scroller = $('#mapCanvasScroller');
    const availableW = Math.max(100, scroller.clientWidth - 60);
    const availableH = Math.max(100, scroller.clientHeight - 60);
    setZoom(Math.min(availableW / state.width, availableH / state.height, 1));
  }

  function createMap(width = 1600, height = 1000, template = 'parchment', silent = false) {
    state.layers = [];
    state.markers = [];
    state.history = [];
    state.redo = [];
    state.width = Math.max(256, Math.min(8192, Math.round(width)));
    state.height = Math.max(256, Math.min(8192, Math.round(height)));
    compositeCanvas.width = interactionCanvas.width = heightCanvas.width = heightInteraction.width = state.width;
    compositeCanvas.height = interactionCanvas.height = heightCanvas.height = heightInteraction.height = state.height;
    heightCtx.fillStyle = '#000000';
    heightCtx.fillRect(0, 0, state.width, state.height);
    const background = addLayer('Background');
    applyTemplate(background, template);
    addLayer('Terrain & Drawing');
    state.projectLoaded = true;
    state.activeTool = 'paint';
    updateToolButtons();
    setZoom(Number($('#mapZoom').value) / 100 || 0.7);
    renderLayerList();
    renderComposite();
    setTimeout(fitMap, 50);
    if (!silent) toast('Stationary map created.', 'success');
  }

  function applyTemplate(layer, template) {
    const ctx = layer.ctx;
    ctx.clearRect(0, 0, state.width, state.height);
    if (template === 'transparent') return;
    if (template === 'blank') {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, state.width, state.height); return;
    }
    if (template === 'ocean') {
      const gradient = ctx.createLinearGradient(0, 0, 0, state.height);
      gradient.addColorStop(0, '#4f98c7'); gradient.addColorStop(1, '#173e65');
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, state.width, state.height);
      drawNoise(ctx, 0.055, '#c4ecff', 1700, hashSeed('ocean-template'));
      return;
    }
    if (template === 'grass') {
      ctx.fillStyle = '#7da45b'; ctx.fillRect(0, 0, state.width, state.height);
      drawNoise(ctx, 0.07, '#3f6e3c', 2100, hashSeed('grass-template'));
      return;
    }
    if (template === 'stone') {
      ctx.fillStyle = '#77736d'; ctx.fillRect(0, 0, state.width, state.height);
      drawStonePattern(ctx, 0, 0, state.width, state.height, Math.max(32, state.width / 30));
      return;
    }
    if (template === 'space') {
      ctx.fillStyle = '#111326'; ctx.fillRect(0, 0, state.width, state.height);
      drawNoise(ctx, 0.9, '#ffffff', Math.round(state.width * state.height / 4500), hashSeed('space-template'), 0.3, 2.4);
      return;
    }
    fillWithSurfaceTexture(layer, 'parchment', false);
  }

  function drawNoise(ctx, alpha, color, count, seed, minRadius = 0.4, maxRadius = 2.2) {
    const rng = mulberry32(seed);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    for (let i = 0; i < count; i++) {
      const radius = minRadius + rng() * (maxRadius - minRadius);
      ctx.beginPath();
      ctx.arc(rng() * state.width, rng() * state.height, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  async function fillWithSurfaceTexture(layer, key, recordHistory = true) {
    const path = SURFACE_PATHS[key];
    if (!path) return;
    if (recordHistory) pushHistory();
    try {
      const image = await loadImage(path);
      const pattern = layer.ctx.createPattern(image, 'repeat');
      layer.ctx.save();
      layer.ctx.globalAlpha = 1;
      layer.ctx.globalCompositeOperation = 'source-over';
      layer.ctx.fillStyle = pattern;
      layer.ctx.fillRect(0, 0, state.width, state.height);
      layer.ctx.restore();
      renderComposite();
      toast(`${key.replace(/-/g, ' ')} surface applied.`, 'success');
    } catch (error) {
      console.warn(error);
      toast('Surface texture could not be loaded.', 'error');
    }
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Could not load ${src}`));
      image.src = src;
    });
  }

  function showStudio() {
    $('#welcomeScreen').hidden = true;
    $('#studioScreen').hidden = false;
  }

  function setMode(mode) {
    state.mode = mode;
    const mapMode = mode === 'map';
    document.body.classList.toggle('map-mode', mapMode);
    $('#modeObjectBtn').classList.toggle('is-active', !mapMode);
    $('#modeMapBtn').classList.toggle('is-active', mapMode);
    $('#objectWorkspace').hidden = mapMode;
    $('#mapWorkspace').hidden = !mapMode;
    $$('[data-map-only]').forEach(element => { element.hidden = !mapMode; });
    $$('[data-object-only]').forEach(element => { element.hidden = mapMode; });
    if (mapMode) {
      state.objectProjectName = $('#projectName').textContent;
      $('#projectName').textContent = $('#mapProjectTitle').value || 'Untitled Map';
      $('#modeBadge').textContent = 'STATIONARY MAP + 3D EFFECTS';
      restoreMapToolbarHandlers();
      showStudio();
      if (!state.projectLoaded) createMap(Number($('#newMapWidth').value), Number($('#newMapHeight').value), $('#newMapTemplate').value);
      requestAnimationFrame(() => {
        fitMap();
        if (state.preview.initialized) resizePreview();
      });
    } else {
      $('#projectName').textContent = state.objectProjectName || 'No object';
      $('#modeBadge').textContent = 'IMPORT-ONLY 3D EDITOR';
      restoreObjectToolbarHandlers();
      showStudio();
      window.dispatchEvent(new Event('resize'));
    }
  }

  function captureToolbarHandlers() {
    for (const id of ['quickImport', 'quickExport', 'cloudSave', 'undoBtn', 'redoBtn']) {
      state.originalHandlers[id] = $(`#${id}`).onclick;
    }
  }

  function restoreMapToolbarHandlers() {
    $('#quickImport').onclick = () => $('#mapImageInput').click();
    $('#quickExport').onclick = exportMapImage;
    $('#cloudSave').onclick = saveMapBackend;
    $('#undoBtn').onclick = mapUndo;
    $('#redoBtn').onclick = mapRedo;
  }

  function restoreObjectToolbarHandlers() {
    for (const [id, handler] of Object.entries(state.originalHandlers)) $(`#${id}`).onclick = handler;
  }

  function showMapProperty(name) {
    $$('[data-map-property]').forEach(button => button.classList.toggle('is-active', button.dataset.mapProperty === name));
    $$('[data-map-property-page]').forEach(page => page.classList.toggle('is-active', page.dataset.mapPropertyPage === name));
  }

  function showMapStage(name) {
    $$('[data-map-stage]').forEach(button => button.classList.toggle('is-active', button.dataset.mapStage === name));
    $('#mapCanvasStage').hidden = name !== 'canvas';
    $('#mapPreviewStage').hidden = name !== 'preview';
    $('#mapHeightStage').hidden = name !== 'height';
    if (name === 'preview') {
      initPreview();
      rebuildPreviewPlane();
      resizePreview();
    }
    if (name === 'height') {
      setZoom(state.zoom);
      $('#mapHeightWrap').classList.add('height-editing');
    }
  }

  function setActiveTool(tool) {
    state.activeTool = tool;
    updateToolButtons();
    const labels = {
      select: 'PAN / SELECT', paint: `PAINT: ${TERRAIN[state.terrain]?.label || 'Brush'}`, erase: 'ERASER',
      text: 'ADD TEXT', stamp: 'MAP SYMBOL', eyedropper: 'EYEDROPPER', line: 'LINE', rectangle: 'RECTANGLE',
      ellipse: 'ELLIPSE', road: 'ROAD', river: 'RIVER', wall: 'WALL', room: 'ROOM', height: 'HEIGHT BRUSH',
      'effect-marker': '3D EFFECT POINT'
    };
    $('#mapStatusMessage').textContent = labels[tool] || tool.toUpperCase();
  }

  function updateToolButtons() {
    if (state.mode !== 'map') return;
    $$('[data-tool]').forEach(button => button.classList.toggle('is-active', button.dataset.tool === state.activeTool));
    $$('[data-map-tool]').forEach(button => button.classList.toggle('is-active', button.dataset.mapTool === state.activeTool));
  }

  function pointerPoint(event, canvas = interactionCanvas) {
    const rect = canvas.getBoundingClientRect();
    let x = (event.clientX - rect.left) * (canvas.width / rect.width);
    let y = (event.clientY - rect.top) * (canvas.height / rect.height);
    if ($('#mapSnapGrid').checked && !event.altKey) {
      const grid = Math.max(8, Number($('#mapGridSize').value) || 64);
      x = Math.round(x / grid) * grid;
      y = Math.round(y / grid) * grid;
    }
    return {x: Math.max(0, Math.min(state.width, x)), y: Math.max(0, Math.min(state.height, y))};
  }

  function pushHistory() {
    const layer = activeLayer();
    if (!layer) return;
    state.history.push({
      layerId: layer.id,
      layerData: layer.canvas.toDataURL('image/png'),
      heightData: heightCanvas.toDataURL('image/png'),
      markers: clonePlain(state.markers)
    });
    if (state.history.length > MAX_HISTORY) state.history.shift();
    state.redo = [];
    updateUndoState();
  }

  function currentSnapshot() {
    const layer = activeLayer();
    if (!layer) return null;
    return {
      layerId: layer.id,
      layerData: layer.canvas.toDataURL('image/png'),
      heightData: heightCanvas.toDataURL('image/png'),
      markers: clonePlain(state.markers)
    };
  }

  async function restoreSnapshot(snapshot) {
    if (!snapshot) return;
    const layer = state.layers.find(item => item.id === snapshot.layerId) || activeLayer();
    if (layer && snapshot.layerData) {
      const image = await loadImage(snapshot.layerData);
      layer.ctx.clearRect(0, 0, state.width, state.height);
      layer.ctx.drawImage(image, 0, 0, state.width, state.height);
      state.activeLayerId = layer.id;
    }
    if (snapshot.heightData) {
      const image = await loadImage(snapshot.heightData);
      heightCtx.clearRect(0, 0, state.width, state.height);
      heightCtx.drawImage(image, 0, 0, state.width, state.height);
    }
    state.markers = clonePlain(snapshot.markers || []);
    renderLayerList();
    renderComposite();
  }

  async function mapUndo() {
    if (!state.history.length) return;
    const snapshot = state.history.pop();
    const current = currentSnapshot();
    if (current) state.redo.push(current);
    await restoreSnapshot(snapshot);
    updateUndoState();
  }

  async function mapRedo() {
    if (!state.redo.length) return;
    const snapshot = state.redo.pop();
    const current = currentSnapshot();
    if (current) state.history.push(current);
    await restoreSnapshot(snapshot);
    updateUndoState();
  }

  function updateUndoState() {
    if (state.mode !== 'map') return;
    $('#undoBtn').disabled = state.history.length === 0;
    $('#redoBtn').disabled = state.redo.length === 0;
  }

  function startDrawing(event, canvas = interactionCanvas, forcedHeight = false) {
    if (state.mode !== 'map') return;
    const layer = activeLayer();
    if (!layer) return;
    const point = pointerPoint(event, canvas);
    $('#mapCursorInfo').textContent = `${Math.round(point.x)}, ${Math.round(point.y)}`;
    const tool = forcedHeight ? 'height' : state.activeTool;
    if (tool === 'select') {
      state.panStart = {x: event.clientX, y: event.clientY, left: $('#mapCanvasScroller').scrollLeft, top: $('#mapCanvasScroller').scrollTop};
      $('#mapCanvasWrap').classList.add('is-panning');
      canvas.setPointerCapture?.(event.pointerId);
      return;
    }
    if (layer.locked && tool !== 'height' && tool !== 'effect-marker') {
      toast('The active layer is locked.', 'error');
      return;
    }
    if (tool === 'eyedropper') {
      pickMapColor(point);
      return;
    }
    pushHistory();
    if (tool === 'text') {
      drawMapText(point.x, point.y);
      renderComposite();
      return;
    }
    if (tool === 'stamp') {
      drawMapSymbol(point.x, point.y);
      renderComposite();
      return;
    }
    if (tool === 'effect-marker') {
      state.markers.push({
        x: point.x, y: point.y,
        type: $('#mapEffectPointType').value,
        color: $('#mapEffectPointColor').value
      });
      renderComposite();
      rebuildMarkerEffects();
      toast('3D effect point placed.', 'success');
      return;
    }
    state.drawing = true;
    state.startPoint = point;
    state.lastPoint = point;
    canvas.setPointerCapture?.(event.pointerId);
    if (tool === 'paint' || tool === 'erase') paintMapLine(point, point, tool);
    if (tool === 'height') paintHeight(point);
  }

  function moveDrawing(event, canvas = interactionCanvas, forcedHeight = false) {
    if (state.mode !== 'map') return;
    const point = pointerPoint(event, canvas);
    $('#mapCursorInfo').textContent = `${Math.round(point.x)}, ${Math.round(point.y)}`;
    if (state.panStart) {
      const scroller = forcedHeight ? $('#mapHeightStage .map-canvas-scroller') : $('#mapCanvasScroller');
      scroller.scrollLeft = state.panStart.left - (event.clientX - state.panStart.x);
      scroller.scrollTop = state.panStart.top - (event.clientY - state.panStart.y);
      return;
    }
    if (!state.drawing) return;
    const tool = forcedHeight ? 'height' : state.activeTool;
    if (tool === 'paint' || tool === 'erase') {
      paintMapLine(state.lastPoint, point, tool);
      state.lastPoint = point;
      renderComposite();
    } else if (tool === 'height') {
      paintHeightLine(state.lastPoint, point);
      state.lastPoint = point;
      state.previewDirty = true;
    } else {
      renderOverlay({tool, start: state.startPoint, end: point});
    }
  }

  function endDrawing(event, canvas = interactionCanvas, forcedHeight = false) {
    if (state.panStart) {
      state.panStart = null;
      $('#mapCanvasWrap').classList.remove('is-panning');
      return;
    }
    if (!state.drawing) return;
    const point = pointerPoint(event, canvas);
    const tool = forcedHeight ? 'height' : state.activeTool;
    if (!['paint', 'erase', 'height'].includes(tool)) drawMapShape(tool, state.startPoint, point);
    state.drawing = false;
    state.startPoint = null;
    state.lastPoint = null;
    renderComposite();
    if (tool === 'height' && state.preview.heightTexture) state.preview.heightTexture.needsUpdate = true;
  }

  function brushSize() { return Math.max(1, Number($('#brushSize').value) || 28); }
  function brushOpacity() { return Math.max(0.01, Number($('#brushOpacity').value) / 100 || 1); }

  function paintMapLine(from, to, tool) {
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const step = Math.max(1, brushSize() / 5);
    const count = Math.max(1, Math.ceil(distance / step));
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      paintMapPoint(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t, tool);
    }
  }

  function paintMapPoint(x, y, tool) {
    const layer = activeLayer();
    if (!layer) return;
    const ctx = layer.ctx;
    const size = brushSize();
    if (tool === 'erase') {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.globalAlpha = brushOpacity();
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size / 2);
      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gradient;
      ctx.beginPath(); ctx.arc(x, y, size / 2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      return;
    }
    drawTerrainDot(ctx, x, y, size, TERRAIN[state.terrain] || TERRAIN.grass);
  }

  function drawTerrainDot(ctx, x, y, size, terrain) {
    const opacity = brushOpacity();
    const softness = Number($('#terrainEdgeSoftness').value) / 100;
    const textureAmount = Number($('#terrainTextureAmount').value) / 100;
    const radius = size / 2;
    ctx.save();
    ctx.globalAlpha = opacity;
    const gradient = ctx.createRadialGradient(x, y, radius * Math.max(0, 1 - softness), x, y, radius);
    gradient.addColorStop(0, terrain.color);
    gradient.addColorStop(Math.max(0.05, 1 - softness * 0.8), terrain.color);
    gradient.addColorStop(1, hexWithAlpha(terrain.color, softness > 0 ? 0 : 1));
    ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.clip();
    ctx.globalAlpha = opacity * textureAmount;
    renderTerrainTexture(ctx, x, y, size, terrain);
    ctx.restore();
  }

  function renderTerrainTexture(ctx, x, y, size, terrain) {
    const rng = mulberry32(hashSeed(`${terrain.label}:${Math.round(x)}:${Math.round(y)}`));
    ctx.strokeStyle = terrain.accent;
    ctx.fillStyle = terrain.accent;
    ctx.lineWidth = Math.max(1, size / 35);
    const left = x - size / 2, top = y - size / 2;
    if (terrain.texture === 'waves') {
      for (let yy = top; yy < top + size; yy += Math.max(5, size / 6)) {
        ctx.beginPath();
        for (let xx = left; xx < left + size; xx += Math.max(4, size / 10)) {
          const waveY = yy + Math.sin((xx - left) / Math.max(4, size / 8)) * size / 25;
          if (xx === left) ctx.moveTo(xx, waveY); else ctx.lineTo(xx, waveY);
        }
        ctx.stroke();
      }
    } else if (terrain.texture === 'trees') {
      for (let i = 0; i < Math.max(2, size / 10); i++) {
        const px = left + rng() * size, py = top + rng() * size;
        const r = Math.max(2, size / 18);
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#213c25'; ctx.beginPath(); ctx.moveTo(px, py + r / 2); ctx.lineTo(px, py + r * 1.8); ctx.stroke();
        ctx.strokeStyle = terrain.accent;
      }
    } else if (terrain.texture === 'mountains') {
      for (let i = 0; i < Math.max(1, size / 18); i++) {
        const px = left + rng() * size, py = top + rng() * size;
        const r = Math.max(5, size / 8 * (0.5 + rng() * 0.5));
        ctx.beginPath(); ctx.moveTo(px - r, py + r * 0.6); ctx.lineTo(px, py - r); ctx.lineTo(px + r, py + r * 0.6); ctx.closePath(); ctx.stroke();
      }
    } else if (terrain.texture === 'rows') {
      for (let xx = left; xx < left + size; xx += Math.max(6, size / 8)) {
        ctx.beginPath(); ctx.moveTo(xx, top); ctx.lineTo(xx + size / 4, top + size); ctx.stroke();
      }
    } else if (terrain.texture === 'dunes') {
      for (let i = 0; i < 6; i++) {
        const px = left + rng() * size, py = top + rng() * size;
        ctx.beginPath(); ctx.arc(px, py, size / 8, Math.PI, Math.PI * 2); ctx.stroke();
      }
    } else if (terrain.texture === 'marsh') {
      for (let i = 0; i < 12; i++) {
        const px = left + rng() * size, py = top + rng() * size;
        ctx.beginPath(); ctx.moveTo(px, py + size / 20); ctx.lineTo(px + (rng() - 0.5) * size / 8, py - size / 10); ctx.stroke();
      }
    } else if (terrain.texture === 'stone') {
      for (let i = 0; i < 10; i++) {
        const px = left + rng() * size, py = top + rng() * size, r = 2 + rng() * size / 10;
        ctx.strokeRect(px, py, r * 1.5, r);
      }
    } else if (terrain.texture === 'lava') {
      ctx.strokeStyle = '#ffd54d'; ctx.lineWidth = Math.max(2, size / 18);
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(left + rng() * size, top);
        ctx.bezierCurveTo(left + rng() * size, top + size / 3, left + rng() * size, top + size * 2 / 3, left + rng() * size, top + size);
        ctx.stroke();
      }
    } else if (terrain.texture === 'stars' || terrain.texture === 'snow' || terrain.texture === 'speckle' || terrain.texture === 'grass') {
      const count = Math.max(5, Math.round(size * size / 180));
      for (let i = 0; i < count; i++) {
        const px = left + rng() * size, py = top + rng() * size;
        const r = terrain.texture === 'stars' ? 0.8 + rng() * 2 : 0.5 + rng() * 1.4;
        ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  function hexWithAlpha(hex, alpha) {
    const value = hex.replace('#', '');
    const full = value.length === 3 ? value.split('').map(c => c + c).join('') : value;
    const r = parseInt(full.slice(0, 2), 16), g = parseInt(full.slice(2, 4), 16), b = parseInt(full.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function drawShapePreview(ctx, preview) {
    const {tool, start, end} = preview;
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.strokeStyle = $('#primaryColor').value;
    ctx.fillStyle = hexWithAlpha((TERRAIN[state.terrain] || TERRAIN.grass).color, 0.22);
    ctx.lineWidth = Math.max(2, state.width / 900);
    ctx.setLineDash([10, 7]);
    drawShapePath(ctx, tool, start, end, true);
    ctx.restore();
  }

  function drawMapShape(tool, start, end) {
    const layer = activeLayer();
    if (!layer || layer.locked) return;
    const ctx = layer.ctx;
    ctx.save();
    ctx.globalAlpha = brushOpacity();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    drawShapePath(ctx, tool, start, end, false);
    ctx.restore();
  }

  function drawShapePath(ctx, tool, start, end, preview) {
    const terrain = TERRAIN[state.terrain] || TERRAIN.grass;
    const x = Math.min(start.x, end.x), y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x), height = Math.abs(end.y - start.y);
    if (tool === 'line') {
      ctx.strokeStyle = $('#primaryColor').value;
      ctx.lineWidth = Math.max(1, Number($('#mapPathWidth').value) / 4);
      ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    } else if (tool === 'rectangle' || tool === 'ellipse') {
      ctx.fillStyle = preview ? hexWithAlpha(terrain.color, 0.25) : terrain.color;
      ctx.strokeStyle = $('#primaryColor').value;
      ctx.lineWidth = Math.max(1, Number($('#mapPathWidth').value) / 5);
      ctx.beginPath();
      if (tool === 'rectangle') ctx.rect(x, y, width, height);
      else ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    } else if (tool === 'road') {
      const path = Math.max(2, Number($('#mapPathWidth').value));
      strokeDouble(ctx, start, end, path + Math.max(4, path * 0.35), '#4c4035', path, '#c4a66b', preview);
    } else if (tool === 'river') {
      const path = Math.max(2, Number($('#mapPathWidth').value));
      strokeCurved(ctx, start, end, path + Math.max(4, path * 0.4), '#154a70', path, '#3b91c8', preview);
    } else if (tool === 'wall') {
      const wall = Math.max(1, Number($('#mapWallWidth').value));
      strokeDouble(ctx, start, end, wall + 4, '#2a2725', wall, '#8d8379', preview);
      if (!preview) {
        ctx.strokeStyle = '#d7cec4'; ctx.lineWidth = Math.max(1, wall / 5); ctx.setLineDash([wall * 1.8, wall]);
        ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke(); ctx.setLineDash([]);
      }
    } else if (tool === 'room') {
      ctx.fillStyle = preview ? 'rgba(185,174,156,.28)' : '#b9ae9c';
      ctx.strokeStyle = '#332f2a';
      ctx.lineWidth = Math.max(4, Number($('#mapWallWidth').value));
      ctx.fillRect(x, y, width, height); ctx.strokeRect(x, y, width, height);
      if (!preview) drawStonePattern(ctx, x, y, width, height, Math.max(24, Number($('#mapGridSize').value) / 2));
    }
  }

  function strokeDouble(ctx, start, end, outerWidth, outerColor, innerWidth, innerColor, preview) {
    ctx.strokeStyle = outerColor; ctx.lineWidth = outerWidth;
    ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    ctx.strokeStyle = innerColor; ctx.lineWidth = innerWidth;
    ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(end.x, end.y); ctx.stroke();
    if (preview) ctx.globalAlpha *= 0.7;
  }

  function strokeCurved(ctx, start, end, outerWidth, outerColor, innerWidth, innerColor, preview) {
    const dx = end.x - start.x, dy = end.y - start.y;
    const normalX = -dy * 0.16, normalY = dx * 0.16;
    const c1 = {x: start.x + dx / 3 + normalX, y: start.y + dy / 3 + normalY};
    const c2 = {x: start.x + dx * 2 / 3 - normalX, y: start.y + dy * 2 / 3 - normalY};
    for (const [width, color] of [[outerWidth, outerColor], [innerWidth, innerColor]]) {
      ctx.strokeStyle = color; ctx.lineWidth = width;
      ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, end.x, end.y); ctx.stroke();
    }
    if (preview) ctx.globalAlpha *= 0.7;
  }

  function drawStonePattern(ctx, x, y, width, height, cell) {
    ctx.save();
    ctx.globalAlpha *= 0.28;
    ctx.strokeStyle = '#393531';
    ctx.lineWidth = Math.max(1, cell / 18);
    for (let yy = y; yy < y + height; yy += cell) {
      const offset = Math.round((yy - y) / cell) % 2 ? cell / 2 : 0;
      for (let xx = x - offset; xx < x + width; xx += cell) ctx.strokeRect(xx, yy, cell, cell);
    }
    ctx.restore();
  }

  function drawMapText(x, y) {
    const layer = activeLayer();
    if (!layer || layer.locked) return;
    const ctx = layer.ctx;
    const text = $('#mapTextValue').value || 'Map Label';
    const size = Math.max(6, Number($('#mapTextSize').value) || 58);
    const rotation = Number($('#mapTextRotation').value) * Math.PI / 180;
    const bold = $('#mapTextBold').classList.contains('is-active') ? 'bold ' : '';
    const italic = $('#mapTextItalic').classList.contains('is-active') ? 'italic ' : '';
    const font = $('#mapTextFont').value;
    const lines = text.split(/\r?\n/);
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rotation);
    ctx.globalAlpha = Number($('#mapTextOpacity').value) / 100;
    ctx.font = `${italic}${bold}${size}px ${font}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lineHeight = size * 1.12;
    const startY = -(lines.length - 1) * lineHeight / 2;
    lines.forEach((line, index) => {
      const yy = startY + index * lineHeight;
      if ($('#mapTextShadow').classList.contains('is-active')) {
        ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = Math.max(2, size / 12); ctx.shadowOffsetX = size / 18; ctx.shadowOffsetY = size / 18;
      }
      if ($('#mapTextOutline').classList.contains('is-active')) {
        ctx.lineWidth = Math.max(1, Number($('#mapTextOutlineWidth').value));
        ctx.strokeStyle = $('#mapTextOutlineColor').value;
        ctx.strokeText(line, 0, yy);
      }
      ctx.fillStyle = $('#primaryColor').value;
      ctx.fillText(line, 0, yy);
      ctx.shadowColor = 'transparent';
    });
    ctx.restore();
  }

  function drawMapSymbol(x, y) {
    const layer = activeLayer();
    if (!layer || layer.locked) return;
    const size = Math.max(12, Number($('#mapSymbolSize').value) || 96);
    const rotation = Number($('#mapSymbolRotation').value) * Math.PI / 180;
    const opacity = Number($('#mapSymbolOpacity').value) / 100;
    const ctx = layer.ctx;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rotation); ctx.globalAlpha = opacity;
    if (state.customSymbol) {
      ctx.drawImage(state.customSymbol, -size / 2, -size / 2, size, size);
    } else {
      drawVectorSymbol(ctx, state.selectedSymbol, size);
    }
    ctx.restore();
  }

  function drawVectorSymbol(ctx, symbol, size) {
    const entry = SYMBOLS.find(item => item[0] === symbol) || SYMBOLS[0];
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `bold ${size * 0.75}px Georgia, Segoe UI Symbol`;
    ctx.lineWidth = Math.max(2, size / 18);
    ctx.strokeStyle = $('#secondaryColor').value;
    ctx.fillStyle = $('#primaryColor').value;
    ctx.strokeText(entry[2], 0, 0);
    ctx.fillText(entry[2], 0, 0);
  }

  function pickMapColor(point) {
    const pixel = compositeCtx.getImageData(Math.floor(point.x), Math.floor(point.y), 1, 1).data;
    const hex = `#${[pixel[0], pixel[1], pixel[2]].map(value => value.toString(16).padStart(2, '0')).join('')}`;
    $('#primaryColor').value = hex;
    toast(`Picked ${hex}.`);
  }

  function paintHeight(point) {
    paintHeightLine(point, point);
  }

  function paintHeightLine(from, to) {
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const step = Math.max(2, brushSize() / 5);
    const count = Math.max(1, Math.ceil(distance / step));
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      paintHeightPoint(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
    }
    if (state.preview.heightTexture) state.preview.heightTexture.needsUpdate = true;
  }

  function paintHeightPoint(x, y) {
    const radius = Math.max(1, brushSize() / 2);
    const left = Math.max(0, Math.floor(x - radius));
    const top = Math.max(0, Math.floor(y - radius));
    const right = Math.min(state.width, Math.ceil(x + radius));
    const bottom = Math.min(state.height, Math.ceil(y + radius));
    const width = right - left, height = bottom - top;
    if (width <= 0 || height <= 0) return;
    const data = heightCtx.getImageData(left, top, width, height);
    const mode = $('#heightBrushMode').value;
    const amount = Number($('#heightBrushAmount').value) * 2.55 * brushOpacity();
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const dx = left + px - x, dy = top + py - y;
        const distance = Math.hypot(dx, dy);
        if (distance > radius) continue;
        const falloff = Math.pow(1 - distance / radius, 1.5);
        const index = (py * width + px) * 4;
        const current = data.data[index];
        let value = current;
        if (mode === 'raise') value = current + amount * falloff;
        if (mode === 'lower') value = current - amount * falloff;
        if (mode === 'flatten') value = current + (128 - current) * Math.min(1, falloff * amount / 60);
        if (mode === 'smooth') {
          const target = 128;
          value = current + (target - current) * falloff * 0.08;
        }
        value = Math.max(0, Math.min(255, value));
        data.data[index] = data.data[index + 1] = data.data[index + 2] = value;
        data.data[index + 3] = 255;
      }
    }
    heightCtx.putImageData(data, left, top);
  }

  function autoHeightFromTerrain() {
    pushHistory();
    renderComposite();
    const source = compositeCtx.getImageData(0, 0, state.width, state.height);
    const output = heightCtx.createImageData(state.width, state.height);
    for (let i = 0; i < source.data.length; i += 4) {
      const r = source.data[i], g = source.data[i + 1], b = source.data[i + 2], a = source.data[i + 3];
      let value = 72;
      if (a < 10) value = 0;
      else if (b > r * 1.12 && b > g * 1.05) value = 18;
      else if (r > g * 1.12 && g > b * 1.08) value = Math.min(235, 150 + (r - b) * 0.65);
      else if (g > r * 1.04 && g > b * 1.04) value = 90 + Math.min(55, (g - Math.min(r, b)) * 0.7);
      else if (r + g + b > 650) value = 185;
      else if (r + g + b < 180) value = 45;
      else value = Math.round((r + g + b) / 3 * 0.6);
      output.data[i] = output.data[i + 1] = output.data[i + 2] = value;
      output.data[i + 3] = 255;
    }
    heightCtx.putImageData(output, 0, 0);
    blurHeight(4, false);
    if (state.preview.heightTexture) state.preview.heightTexture.needsUpdate = true;
    state.previewDirty = true;
    toast('Height map generated from terrain colors.', 'success');
  }

  function blurHeight(radius = 8, record = true) {
    if (record) pushHistory();
    const temp = copyCanvas(heightCanvas);
    heightCtx.clearRect(0, 0, state.width, state.height);
    heightCtx.save();
    heightCtx.filter = `blur(${radius}px)`;
    heightCtx.drawImage(temp, 0, 0);
    heightCtx.restore();
    if (state.preview.heightTexture) state.preview.heightTexture.needsUpdate = true;
  }

  function invertHeight() {
    pushHistory();
    const image = heightCtx.getImageData(0, 0, state.width, state.height);
    for (let i = 0; i < image.data.length; i += 4) {
      const value = 255 - image.data[i];
      image.data[i] = image.data[i + 1] = image.data[i + 2] = value;
    }
    heightCtx.putImageData(image, 0, 0);
    if (state.preview.heightTexture) state.preview.heightTexture.needsUpdate = true;
  }

  function clearHeight() {
    pushHistory();
    heightCtx.fillStyle = '#000000';
    heightCtx.fillRect(0, 0, state.width, state.height);
    if (state.preview.heightTexture) state.preview.heightTexture.needsUpdate = true;
  }

  function runGenerator(kind) {
    const layer = activeLayer();
    if (!layer || layer.locked) { toast('Choose an unlocked layer first.', 'error'); return; }
    pushHistory();
    const seed = `${$('#mapSeed').value}:${kind}`;
    const rng = mulberry32(hashSeed(seed));
    const complexity = Number($('#mapComplexity').value) / 100;
    const count = Math.max(1, Number($('#mapFeatureCount').value) || 18);
    if (kind === 'continent') generateContinent(layer.ctx, rng, complexity, false);
    if (kind === 'archipelago') generateArchipelago(layer.ctx, rng, complexity, count);
    if (kind === 'mountains') generateMountains(layer.ctx, rng, count);
    if (kind === 'river') generateRiverSystem(layer.ctx, rng, Math.max(1, Math.round(count / 6)));
    if (kind === 'layout') generateLayout(layer.ctx, rng, count, complexity);
    if (kind === 'city') generateCity(layer.ctx, rng, count, complexity);
    if (kind === 'forest') generateForest(layer.ctx, rng, count * 6);
    if (kind === 'coast') roughenCoast(layer.ctx, rng, complexity);
    renderComposite();
    const generatorLabel = kind.replace(/-/g, ' ');
    $('#mapStatusMessage').textContent = `${generatorLabel.charAt(0).toUpperCase() + generatorLabel.slice(1)} generated on ${layer.name}.`;
    toast(`${generatorLabel} generated on the active layer.`, 'success');
  }

  function irregularPolygon(cx, cy, rx, ry, points, rng, roughness = 0.25) {
    const result = [];
    for (let i = 0; i < points; i++) {
      const angle = i / points * Math.PI * 2;
      const jitter = 1 + (rng() - 0.5) * roughness * 2;
      result.push({x: cx + Math.cos(angle) * rx * jitter, y: cy + Math.sin(angle) * ry * jitter});
    }
    return result;
  }

  function drawPolygon(ctx, points, fill, stroke, width = 4) {
    ctx.save();
    ctx.beginPath();
    points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
    ctx.restore();
  }

  function generateContinent(ctx, rng, complexity, island = false) {
    const cx = state.width * (0.44 + rng() * 0.12), cy = state.height * (0.43 + rng() * 0.14);
    const rx = state.width * (island ? 0.08 + rng() * 0.1 : 0.23 + rng() * 0.12);
    const ry = state.height * (island ? 0.08 + rng() * 0.1 : 0.25 + rng() * 0.14);
    const points = irregularPolygon(cx, cy, rx, ry, 32 + Math.round(complexity * 48), rng, 0.18 + complexity * 0.32);
    drawPolygon(ctx, points, TERRAIN.beach.color, '#9b7d47', Math.max(4, state.width / 500));
    const inner = points.map(point => ({x: cx + (point.x - cx) * 0.93, y: cy + (point.y - cy) * 0.93}));
    drawPolygon(ctx, inner, TERRAIN.grass.color, '#5a823f', Math.max(2, state.width / 1000));
    ctx.save(); ctx.beginPath(); inner.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath(); ctx.clip();
    drawNoise(ctx, 0.18, '#2f5f38', Math.round((rx * ry) / 1600), Math.floor(rng() * 1e9), 1, 4);
    ctx.restore();
  }

  function generateArchipelago(ctx, rng, complexity, count) {
    const islands = Math.max(3, Math.min(30, Math.round(count / 2)));
    for (let i = 0; i < islands; i++) {
      const cx = state.width * (0.15 + rng() * 0.7), cy = state.height * (0.15 + rng() * 0.7);
      const rx = state.width * (0.025 + rng() * 0.07), ry = state.height * (0.025 + rng() * 0.08);
      const points = irregularPolygon(cx, cy, rx, ry, 18 + Math.round(complexity * 24), rng, 0.25 + complexity * 0.3);
      drawPolygon(ctx, points, TERRAIN.beach.color, '#9b7d47', Math.max(2, state.width / 800));
      const inner = points.map(p => ({x: cx + (p.x - cx) * 0.88, y: cy + (p.y - cy) * 0.88}));
      drawPolygon(ctx, inner, rng() > 0.2 ? TERRAIN.grass.color : TERRAIN.mountain.color, null);
    }
  }

  function generateMountains(ctx, rng, count) {
    const start = {x: state.width * (0.12 + rng() * 0.2), y: state.height * (0.25 + rng() * 0.5)};
    const end = {x: state.width * (0.68 + rng() * 0.2), y: state.height * (0.25 + rng() * 0.5)};
    ctx.save();
    for (let i = 0; i < Math.max(3, count); i++) {
      const t = i / Math.max(1, count - 1);
      const x = start.x + (end.x - start.x) * t + (rng() - 0.5) * state.width * 0.035;
      const y = start.y + (end.y - start.y) * t + Math.sin(t * Math.PI * 3) * state.height * 0.035 + (rng() - 0.5) * state.height * 0.04;
      const size = state.width * (0.018 + rng() * 0.022);
      ctx.fillStyle = TERRAIN.mountain.color; ctx.strokeStyle = '#55483e'; ctx.lineWidth = Math.max(2, size / 15);
      ctx.beginPath(); ctx.moveTo(x - size, y + size * 0.65); ctx.lineTo(x, y - size); ctx.lineTo(x + size, y + size * 0.65); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = TERRAIN.snow.color; ctx.beginPath(); ctx.moveTo(x - size * 0.25, y - size * 0.5); ctx.lineTo(x, y - size); ctx.lineTo(x + size * 0.27, y - size * 0.48); ctx.lineTo(x, y - size * 0.58); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function generateRiverSystem(ctx, rng, branches) {
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let branch = 0; branch < branches; branch++) {
      const start = {x: state.width * (0.2 + rng() * 0.6), y: state.height * (0.08 + rng() * 0.18)};
      const end = {x: state.width * (0.08 + rng() * 0.84), y: state.height * (0.78 + rng() * 0.16)};
      const width = Math.max(8, state.width * (0.006 + rng() * 0.006));
      const c1 = {x: start.x + (rng() - 0.5) * state.width * 0.35, y: state.height * (0.32 + rng() * 0.16)};
      const c2 = {x: end.x + (rng() - 0.5) * state.width * 0.3, y: state.height * (0.56 + rng() * 0.16)};
      for (const [strokeWidth, color] of [[width + 7, '#154a70'], [width, '#4aa4d5']]) {
        ctx.strokeStyle = color; ctx.lineWidth = strokeWidth; ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, end.x, end.y); ctx.stroke();
      }
    }
    ctx.restore();
  }

  function generateLayout(ctx, rng, count, complexity) {
    const roomCount = Math.max(4, Math.min(50, count));
    const margin = Math.max(20, state.width * 0.04);
    const rooms = [];
    const attempts = roomCount * 20;
    for (let attempt = 0; attempt < attempts && rooms.length < roomCount; attempt++) {
      const w = state.width * (0.055 + rng() * (0.08 + complexity * 0.04));
      const h = state.height * (0.055 + rng() * (0.09 + complexity * 0.04));
      const room = {x: margin + rng() * Math.max(1, state.width - margin * 2 - w), y: margin + rng() * Math.max(1, state.height - margin * 2 - h), w, h};
      if (rooms.every(other => room.x + room.w + 18 < other.x || other.x + other.w + 18 < room.x || room.y + room.h + 18 < other.y || other.y + other.h + 18 < room.y)) rooms.push(room);
    }
    ctx.save();
    ctx.fillStyle = '#aaa096'; ctx.strokeStyle = '#2f2b28'; ctx.lineWidth = Math.max(5, state.width / 250);
    rooms.forEach((room, index) => {
      if (index) {
        const previous = rooms[index - 1];
        const a = {x: previous.x + previous.w / 2, y: previous.y + previous.h / 2};
        const b = {x: room.x + room.w / 2, y: room.y + room.h / 2};
        ctx.strokeStyle = '#2f2b28'; ctx.lineWidth = Math.max(18, state.width / 45); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.strokeStyle = '#aaa096'; ctx.lineWidth = Math.max(10, state.width / 60); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    });
    rooms.forEach(room => {
      ctx.fillStyle = '#aaa096'; ctx.strokeStyle = '#2f2b28'; ctx.lineWidth = Math.max(5, state.width / 250);
      ctx.fillRect(room.x, room.y, room.w, room.h); ctx.strokeRect(room.x, room.y, room.w, room.h);
      drawStonePattern(ctx, room.x, room.y, room.w, room.h, Math.max(18, state.width / 55));
    });
    ctx.restore();
  }

  function generateCity(ctx, rng, count, complexity) {
    const cols = Math.max(3, Math.round(Math.sqrt(count) + complexity * 3));
    const rows = Math.max(3, Math.round(cols * state.height / state.width));
    const margin = state.width * 0.06;
    const road = Math.max(12, state.width * 0.015);
    const cellW = (state.width - margin * 2) / cols;
    const cellH = (state.height - margin * 2) / rows;
    ctx.save();
    ctx.fillStyle = '#b9b09e';
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (rng() < 0.12) continue;
        const x = margin + col * cellW + road / 2;
        const y = margin + row * cellH + road / 2;
        const w = cellW - road, h = cellH - road;
        ctx.fillStyle = rng() < 0.15 ? '#869a6d' : '#b9b09e';
        ctx.fillRect(x, y, w, h);
        if (rng() >= 0.15) {
          const buildings = 1 + Math.floor(rng() * 4);
          for (let i = 0; i < buildings; i++) {
            const bw = w * (0.22 + rng() * 0.35), bh = h * (0.22 + rng() * 0.35);
            const bx = x + rng() * Math.max(1, w - bw), by = y + rng() * Math.max(1, h - bh);
            ctx.fillStyle = ['#8a6f55', '#6e6256', '#9a8167'][Math.floor(rng() * 3)];
            ctx.strokeStyle = '#3b342f'; ctx.lineWidth = Math.max(1, state.width / 1200);
            ctx.fillRect(bx, by, bw, bh); ctx.strokeRect(bx, by, bw, bh);
          }
        }
      }
    }
    ctx.strokeStyle = '#4c4035'; ctx.lineWidth = road; ctx.beginPath();
    for (let col = 0; col <= cols; col++) { const x = margin + col * cellW; ctx.moveTo(x, margin); ctx.lineTo(x, state.height - margin); }
    for (let row = 0; row <= rows; row++) { const y = margin + row * cellH; ctx.moveTo(margin, y); ctx.lineTo(state.width - margin, y); }
    ctx.stroke();
    ctx.restore();
  }

  function generateForest(ctx, rng, count) {
    ctx.save();
    for (let i = 0; i < count; i++) {
      const x = state.width * (0.05 + rng() * 0.9), y = state.height * (0.05 + rng() * 0.9), size = state.width * (0.004 + rng() * 0.008);
      ctx.fillStyle = rng() > 0.35 ? '#315d37' : '#466f3d';
      ctx.strokeStyle = '#1f3f25'; ctx.lineWidth = Math.max(1, size / 6);
      ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y + size * 0.4); ctx.lineTo(x, y + size * 1.7); ctx.stroke();
    }
    ctx.restore();
  }

  function roughenCoast(ctx, rng, complexity) {
    const image = ctx.getImageData(0, 0, state.width, state.height);
    const sampleStep = Math.max(3, Math.round(8 - complexity * 5));
    ctx.save(); ctx.fillStyle = TERRAIN.beach.accent; ctx.globalAlpha = 0.55;
    for (let y = sampleStep; y < state.height - sampleStep; y += sampleStep) {
      for (let x = sampleStep; x < state.width - sampleStep; x += sampleStep) {
        const i = (y * state.width + x) * 4;
        const r = image.data[i], g = image.data[i + 1], b = image.data[i + 2];
        const isLand = g > b * 0.9 && g > 70;
        if (!isLand) continue;
        const neighbors = [[x - sampleStep, y], [x + sampleStep, y], [x, y - sampleStep], [x, y + sampleStep]];
        const touchesWater = neighbors.some(([nx, ny]) => {
          const ni = (ny * state.width + nx) * 4;
          return image.data[ni + 2] > image.data[ni] * 1.08;
        });
        if (touchesWater && rng() < 0.75) {
          const radius = 1 + rng() * sampleStep * 0.7;
          ctx.beginPath(); ctx.arc(x + (rng() - 0.5) * sampleStep, y + (rng() - 0.5) * sampleStep, radius, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  async function importMapImage(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    try {
      const image = await loadImage(url);
      const maxDimension = 8192;
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      createMap(Math.round(image.naturalWidth * scale), Math.round(image.naturalHeight * scale), 'transparent');
      state.layers = [];
      const imported = addLayer(file.name.replace(/\.[^.]+$/, '') || 'Imported Map');
      imported.ctx.drawImage(image, 0, 0, state.width, state.height);
      addLayer('Map Effects & Labels');
      $('#mapProjectTitle').value = file.name.replace(/\.[^.]+$/, '') || 'Imported Map';
      $('#projectName').textContent = $('#mapProjectTitle').value;
      renderComposite();
      fitMap();
      toast('Stationary map image imported.', 'success');
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function clearActiveLayer() {
    const layer = activeLayer();
    if (!layer || layer.locked) { toast('Choose an unlocked layer.', 'error'); return; }
    pushHistory();
    layer.ctx.clearRect(0, 0, state.width, state.height);
    renderComposite();
  }

  function duplicateLayer() {
    const source = activeLayer();
    if (!source) return;
    const copy = makeLayer(`${source.name} Copy`, {opacity: source.opacity, blend: source.blend, visible: source.visible});
    copy.ctx.drawImage(source.canvas, 0, 0);
    const index = state.layers.indexOf(source);
    state.layers.splice(index + 1, 0, copy);
    state.activeLayerId = copy.id;
    renderLayerList(); renderComposite();
  }

  function deleteLayer() {
    if (state.layers.length <= 1) { toast('A map needs at least one layer.', 'error'); return; }
    const index = state.layers.findIndex(layer => layer.id === state.activeLayerId);
    if (index < 0) return;
    state.layers.splice(index, 1);
    state.activeLayerId = state.layers[Math.max(0, index - 1)].id;
    renderLayerList(); renderComposite();
  }

  function moveLayer(direction) {
    const index = state.layers.findIndex(layer => layer.id === state.activeLayerId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= state.layers.length) return;
    [state.layers[index], state.layers[target]] = [state.layers[target], state.layers[index]];
    renderLayerList(); renderComposite();
  }

  function mergeLayerDown() {
    const index = state.layers.findIndex(layer => layer.id === state.activeLayerId);
    if (index <= 0) { toast('There is no layer below to merge into.', 'error'); return; }
    const top = state.layers[index], bottom = state.layers[index - 1];
    bottom.ctx.save(); bottom.ctx.globalAlpha = top.opacity; bottom.ctx.globalCompositeOperation = top.blend; bottom.ctx.drawImage(top.canvas, 0, 0); bottom.ctx.restore();
    state.layers.splice(index, 1); state.activeLayerId = bottom.id;
    renderLayerList(); renderComposite();
  }

  function addCompassRose() {
    const layer = activeLayer(); if (!layer || layer.locked) return;
    pushHistory();
    const x = state.width * 0.88, y = state.height * 0.16, size = Math.min(state.width, state.height) * 0.09;
    const ctx = layer.ctx; ctx.save(); ctx.translate(x, y); ctx.strokeStyle = $('#primaryColor').value; ctx.fillStyle = $('#secondaryColor').value; ctx.lineWidth = Math.max(2, size / 24);
    for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i * Math.PI / 4); ctx.beginPath(); ctx.moveTo(0, -size); ctx.lineTo(size * 0.18, 0); ctx.lineTo(0, -size * 0.25); ctx.lineTo(-size * 0.18, 0); ctx.closePath(); if (i % 2) ctx.fill(); else ctx.stroke(); ctx.restore(); }
    ctx.font = `bold ${size * 0.28}px Georgia`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = $('#primaryColor').value; ctx.fillText('N', 0, -size * 1.18); ctx.restore(); renderComposite();
  }

  function addScaleBar() {
    const layer = activeLayer(); if (!layer || layer.locked) return;
    pushHistory(); const ctx = layer.ctx; const x = state.width * 0.08, y = state.height * 0.9, width = state.width * 0.24, h = Math.max(12, state.height * 0.022); const segments = 4;
    ctx.save(); ctx.strokeStyle = '#111'; ctx.lineWidth = Math.max(2, state.width / 1000); for (let i = 0; i < segments; i++) { ctx.fillStyle = i % 2 ? '#fff' : '#111'; ctx.fillRect(x + width / segments * i, y, width / segments, h); ctx.strokeRect(x + width / segments * i, y, width / segments, h); } ctx.fillStyle = '#111'; ctx.font = `${Math.max(14, h)}px Segoe UI`; ctx.fillText($('#mapScale').selectedOptions[0].textContent, x, y - 8); ctx.restore(); renderComposite();
  }

  function addMapBorder() {
    const layer = activeLayer(); if (!layer || layer.locked) return;
    pushHistory(); const ctx = layer.ctx; const pad = Math.max(16, Math.min(state.width, state.height) * 0.025);
    ctx.save(); ctx.strokeStyle = $('#primaryColor').value; ctx.lineWidth = Math.max(3, pad / 5); ctx.strokeRect(pad, pad, state.width - pad * 2, state.height - pad * 2); ctx.lineWidth = Math.max(1, pad / 15); ctx.strokeRect(pad * 1.35, pad * 1.35, state.width - pad * 2.7, state.height - pad * 2.7); ctx.restore(); renderComposite();
  }

  function addLegendBox() {
    const layer = activeLayer(); if (!layer || layer.locked) return;
    pushHistory(); const ctx = layer.ctx; const w = state.width * 0.22, h = state.height * 0.22, x = state.width - w - state.width * 0.04, y = state.height - h - state.height * 0.04;
    ctx.save(); ctx.fillStyle = 'rgba(248,238,211,.88)'; ctx.strokeStyle = '#3d3428'; ctx.lineWidth = Math.max(2, state.width / 1000); ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h); ctx.fillStyle = '#2d2924'; ctx.font = `bold ${Math.max(20, state.width / 60)}px Georgia`; ctx.fillText('Legend', x + w * 0.08, y + h * 0.18); ctx.font = `${Math.max(14, state.width / 85)}px Georgia`; ['Location', 'Route', 'Landmark'].forEach((label, i) => { ctx.beginPath(); ctx.arc(x + w * 0.12, y + h * (0.38 + i * 0.2), w * 0.025, 0, Math.PI * 2); ctx.fill(); ctx.fillText(label, x + w * 0.2, y + h * (0.4 + i * 0.2)); }); ctx.restore(); renderComposite();
  }

  function initPreview() {
    if (state.preview.initialized || !window.THREE) return;
    const viewport = $('#mapPreviewViewport');
    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x20242b);
      const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 100);
      camera.position.set(0, 7.5, 9.5);
      const renderer = new THREE.WebGLRenderer({antialias: true, alpha: false, preserveDrawingBuffer: true});
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true;
      viewport.replaceChildren(renderer.domElement);
      const controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; controls.dampingFactor = 0.08; controls.target.set(0, 0, 0);
      controls.maxPolarAngle = Math.PI / 2.05; controls.minDistance = 3; controls.maxDistance = 25;
      const ambient = new THREE.AmbientLight(0xffffff, 1.25);
      const sun = new THREE.DirectionalLight(0xffffff, 2.1);
      sun.position.set(5, 8, 4); sun.castShadow = true;
      scene.add(ambient, sun);
      const grid = new THREE.GridHelper(18, 36, 0x66707d, 0x343a43); grid.position.y = -0.25; scene.add(grid);
      state.preview = {...state.preview, initialized: true, scene, camera, renderer, controls, ambient, sun, clock: new THREE.Clock()};
      state.preview.resizeObserver = new ResizeObserver(resizePreview);
      state.preview.resizeObserver.observe(viewport);
      rebuildPreviewPlane();
      animatePreview();
    } catch (error) {
      console.warn('3D map preview unavailable', error);
      viewport.innerHTML = '<div class="map-preview-fallback"><b>3D preview is unavailable in this browser session.</b><span>The editable 2D map, height map, project save, and image exports still work. Enable WebGL or hardware acceleration to view animated relief and weather.</span></div>';
      $('#mapPreviewStatus').textContent = 'WEBGL UNAVAILABLE';
      toast('3D preview needs WebGL or hardware acceleration.', 'error');
    }
  }

  function resizePreview() {
    if (!state.preview.initialized) return;
    const viewport = $('#mapPreviewViewport');
    const width = Math.max(1, viewport.clientWidth), height = Math.max(1, viewport.clientHeight);
    state.preview.renderer.setSize(width, height, false);
    state.preview.camera.aspect = width / height;
    state.preview.camera.updateProjectionMatrix();
  }

  function rebuildPreviewPlane() {
    if (!state.preview.initialized) return;
    const p = state.preview;
    for (const object of [p.plane, p.waterPlane]) {
      if (object) { p.scene.remove(object); object.geometry?.dispose(); object.material?.dispose(); }
    }
    if (p.mapTexture) p.mapTexture.dispose();
    if (p.heightTexture) p.heightTexture.dispose();
    if (p.waterTexture) p.waterTexture.dispose();
    const aspect = state.width / state.height;
    const planeWidth = 12;
    const planeDepth = 12 / aspect;
    const segmentsX = Math.min(256, Math.max(32, Math.round(state.width / 10)));
    const segmentsY = Math.min(256, Math.max(24, Math.round(state.height / 10)));
    const geometry = new THREE.PlaneGeometry(planeWidth, planeDepth, segmentsX, segmentsY);
    geometry.rotateX(-Math.PI / 2);
    const mapTexture = new THREE.CanvasTexture(compositeCanvas);
    mapTexture.colorSpace = THREE.SRGBColorSpace; mapTexture.anisotropy = Math.min(8, state.preview.renderer.capabilities.getMaxAnisotropy());
    const heightTexture = new THREE.CanvasTexture(heightCanvas);
    const material = new THREE.MeshStandardMaterial({
      map: mapTexture,
      displacementMap: heightTexture,
      displacementScale: Number($('#mapReliefStrength').value) / 100,
      displacementBias: -Number($('#mapReliefStrength').value) / 260,
      roughness: 0.78,
      metalness: 0.02,
      side: THREE.DoubleSide
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true; plane.castShadow = false;
    p.scene.add(plane);
    p.plane = plane; p.mapTexture = mapTexture; p.heightTexture = heightTexture;
    const waterMask = makeWaterMaskCanvas();
    const waterTexture = new THREE.CanvasTexture(waterMask);
    const waterGeometry = geometry.clone();
    const waterMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x48a8d8, transparent: true,
      opacity: Number($('#mapWaterStrength').value) / 200,
      alphaMap: waterTexture,
      displacementMap: heightTexture,
      displacementScale: Number($('#mapReliefStrength').value) / 100,
      displacementBias: -Number($('#mapReliefStrength').value) / 260 + 0.025,
      roughness: 0.22, metalness: 0.08, clearcoat: 0.55, clearcoatRoughness: 0.25,
      side: THREE.DoubleSide, depthWrite: false
    });
    const waterPlane = new THREE.Mesh(waterGeometry, waterMaterial);
    waterPlane.visible = $('#mapWaterEffect').checked;
    p.scene.add(waterPlane);
    p.waterPlane = waterPlane; p.waterTexture = waterTexture;
    rebuildClouds(); rebuildWeather(); rebuildMarkerEffects(); applyPreviewLighting();
    state.previewDirty = false;
  }

  function makeWaterMaskCanvas() {
    const mask = document.createElement('canvas'); mask.width = state.width; mask.height = state.height;
    const ctx = mask.getContext('2d');
    const source = compositeCtx.getImageData(0, 0, state.width, state.height);
    const output = ctx.createImageData(state.width, state.height);
    for (let i = 0; i < source.data.length; i += 4) {
      const r = source.data[i], g = source.data[i + 1], b = source.data[i + 2], a = source.data[i + 3];
      const water = a > 0 && b > r * 1.1 && b > g * 1.02;
      const value = water ? Math.min(255, 120 + (b - r) * 1.6) : 0;
      output.data[i] = output.data[i + 1] = output.data[i + 2] = 255;
      output.data[i + 3] = value;
    }
    ctx.putImageData(output, 0, 0);
    return mask;
  }

  function cloudTexture() {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(128, 128, 20, 128, 128, 120);
    gradient.addColorStop(0, 'rgba(255,255,255,.8)'); gradient.addColorStop(0.5, 'rgba(255,255,255,.45)'); gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.arc(128, 128, 120, 0, Math.PI * 2); ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }

  function rebuildClouds() {
    const p = state.preview; if (!p.initialized) return;
    if (p.cloudGroup) { p.scene.remove(p.cloudGroup); p.cloudGroup.traverse(object => object.material?.dispose?.()); }
    const group = new THREE.Group(); group.visible = $('#mapCloudEffect').checked;
    const coverage = Number($('#mapCloudCoverage').value) / 100;
    const count = Math.round(8 + coverage * 32);
    const texture = cloudTexture();
    const rng = mulberry32(hashSeed(`clouds:${state.width}:${state.height}`));
    for (let i = 0; i < count; i++) {
      const material = new THREE.SpriteMaterial({map: texture, transparent: true, opacity: 0.22 + rng() * 0.25, depthWrite: false});
      const sprite = new THREE.Sprite(material);
      sprite.position.set((rng() - 0.5) * 12, 1.1 + rng() * 1.4, (rng() - 0.5) * (12 / (state.width / state.height)));
      const scale = 1.4 + rng() * 2.5; sprite.scale.set(scale, scale * 0.55, 1); sprite.userData.speed = 0.1 + rng() * 0.3;
      group.add(sprite);
    }
    p.scene.add(group); p.cloudGroup = group;
  }

  function rebuildWeather() {
    const p = state.preview; if (!p.initialized) return;
    if (p.weather) { p.scene.remove(p.weather); p.weather.geometry?.dispose(); p.weather.material?.dispose(); }
    const type = $('#mapWeatherType').value;
    if (type === 'none') { p.weather = null; return; }
    const amount = Number($('#mapWeatherAmount').value) / 100;
    const count = Math.round(180 + amount * 1200);
    const positions = new Float32Array(count * 3);
    const rng = mulberry32(hashSeed(`weather:${type}:${count}`));
    const depth = 12 / (state.width / state.height);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rng() - 0.5) * 13;
      positions[i * 3 + 1] = 0.2 + rng() * 5.5;
      positions[i * 3 + 2] = (rng() - 0.5) * (depth + 1);
    }
    const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const colors = {rain: 0x9bd5ff, snow: 0xffffff, embers: 0xff6b22, fireflies: 0xeaff70};
    const material = new THREE.PointsMaterial({color: colors[type], size: type === 'snow' ? 0.07 : type === 'rain' ? 0.035 : 0.055, transparent: true, opacity: 0.82, depthWrite: false});
    const points = new THREE.Points(geometry, material); points.userData.weatherType = type;
    p.scene.add(points); p.weather = points;
  }

  function rebuildMarkerEffects() {
    const p = state.preview; if (!p.initialized) return;
    if (p.markerGroup) { p.scene.remove(p.markerGroup); p.markerGroup.traverse(object => { object.material?.dispose?.(); object.geometry?.dispose?.(); }); }
    const group = new THREE.Group();
    const aspect = state.width / state.height;
    for (const marker of state.markers) {
      const x = (marker.x / state.width - 0.5) * 12;
      const z = (marker.y / state.height - 0.5) * (12 / aspect);
      const color = new THREE.Color(marker.color);
      const geometry = marker.type === 'portal' ? new THREE.TorusGeometry(0.18, 0.045, 10, 28) : new THREE.SphereGeometry(marker.type === 'beacon' ? 0.07 : 0.11, 14, 10);
      const material = new THREE.MeshBasicMaterial({color, transparent: true, opacity: 0.9});
      const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, marker.type === 'beacon' ? 0.6 : 0.35, z); mesh.rotation.x = marker.type === 'portal' ? -Math.PI / 2 : 0; mesh.userData.baseY = mesh.position.y; mesh.userData.markerType = marker.type;
      group.add(mesh);
      const light = new THREE.PointLight(color, marker.type === 'fire' ? 2.2 : 1.6, 2.4); light.position.copy(mesh.position); light.position.y += 0.2; group.add(light);
    }
    p.scene.add(group); p.markerGroup = group;
  }

  function applyPreviewLighting() {
    const p = state.preview; if (!p.initialized) return;
    const preset = $('#mapLightingPreset').value;
    const settings = {
      day: {bg: 0x8aa7bd, ambient: 1.3, sun: 2.2, color: 0xffffff},
      golden: {bg: 0xb56d4f, ambient: 0.95, sun: 2.5, color: 0xffc37a},
      night: {bg: 0x0b1123, ambient: 0.35, sun: 0.65, color: 0x8ca8ff},
      moonlit: {bg: 0x16223a, ambient: 0.55, sun: 1.15, color: 0xb9d4ff},
      storm: {bg: 0x39414b, ambient: 0.5, sun: 0.85, color: 0xb9c9d5}
    }[preset];
    p.scene.background = new THREE.Color(settings.bg);
    p.ambient.intensity = settings.ambient * Number($('#mapAmbientLight').value) / 65;
    p.sun.intensity = settings.sun; p.sun.color.setHex(settings.color);
    const angle = Number($('#mapSunAngle').value) * Math.PI / 180;
    p.sun.position.set(Math.cos(angle) * 7, 8, Math.sin(angle) * 7);
    const fogOn = $('#mapFogEffect').checked;
    p.scene.fog = fogOn ? new THREE.FogExp2(settings.bg, 0.025 + Number($('#mapFogDensity').value) / 1200) : null;
  }

  function animatePreview() {
    if (!state.preview.initialized) return;
    requestAnimationFrame(animatePreview);
    const p = state.preview;
    const delta = Math.min(0.05, p.clock.getDelta());
    const elapsed = p.clock.elapsedTime;
    p.controls.update();
    if (p.waterPlane) {
      p.waterPlane.visible = $('#mapWaterEffect').checked;
      p.waterPlane.material.opacity = Number($('#mapWaterStrength').value) / 220 * (0.78 + Math.sin(elapsed * 1.7) * 0.16);
      p.waterPlane.material.clearcoat = 0.45 + Math.sin(elapsed * 0.8) * 0.18;
    }
    if (p.cloudGroup) {
      p.cloudGroup.visible = $('#mapCloudEffect').checked;
      const speed = Number($('#mapCloudSpeed').value) / 100;
      p.cloudGroup.children.forEach(sprite => {
        sprite.position.x += delta * speed * sprite.userData.speed;
        if (sprite.position.x > 7.2) sprite.position.x = -7.2;
      });
    }
    if (p.weather) {
      const positions = p.weather.geometry.attributes.position;
      const type = p.weather.userData.weatherType;
      for (let i = 0; i < positions.count; i++) {
        let y = positions.getY(i);
        if (type === 'fireflies') {
          positions.setY(i, y + Math.sin(elapsed * 1.7 + i) * 0.0015);
          positions.setX(i, positions.getX(i) + Math.sin(elapsed + i * 0.1) * 0.0008);
        } else {
          y -= delta * (type === 'rain' ? 5.5 : type === 'snow' ? 0.9 : -0.65);
          if (type === 'embers' && y > 5.8) y = 0.2;
          if (type !== 'embers' && y < 0.05) y = 5.5;
          positions.setY(i, y);
        }
      }
      positions.needsUpdate = true;
    }
    if (p.markerGroup) {
      p.markerGroup.children.forEach((object, index) => {
        if (object.isMesh) {
          object.scale.setScalar(0.9 + Math.sin(elapsed * 2.5 + index) * 0.16);
          object.position.y = object.userData.baseY + Math.sin(elapsed * 1.8 + index) * 0.04;
          if (object.userData.markerType === 'portal') object.rotation.z += delta * 0.7;
        }
      });
    }
    p.renderer.render(p.scene, p.camera);
  }

  function refreshPreviewEffects() {
    if (!state.preview.initialized) return;
    if (state.preview.plane) {
      const strength = Number($('#mapReliefStrength').value);
      state.preview.plane.material.displacementScale = strength / 100;
      state.preview.plane.material.displacementBias = -strength / 260;
      if (state.preview.waterPlane) {
        state.preview.waterPlane.material.displacementScale = strength / 100;
        state.preview.waterPlane.material.displacementBias = -strength / 260 + 0.025;
      }
    }
    applyPreviewLighting();
    updateSummary();
  }

  function composeExportCanvas(includeGrid = $('#mapExportGrid').checked) {
    const canvas = document.createElement('canvas'); canvas.width = state.width; canvas.height = state.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, state.width, state.height);
    for (const layer of state.layers) {
      if (!layer.visible) continue;
      ctx.save(); ctx.globalAlpha = layer.opacity; ctx.globalCompositeOperation = layer.blend; ctx.drawImage(layer.canvas, 0, 0); ctx.restore();
    }
    if (includeGrid && $('#mapGridEnabled').checked) drawGrid(ctx, true);
    return canvas;
  }

  function exportMapImage() {
    const format = $('#mapExportFormat').value;
    const quality = Number($('#mapExportQuality').value) / 100;
    const canvas = composeExportCanvas(true);
    if (format === 'jpeg') {
      const flattened = document.createElement('canvas'); flattened.width = canvas.width; flattened.height = canvas.height;
      const ctx = flattened.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, flattened.width, flattened.height); ctx.drawImage(canvas, 0, 0);
      flattened.toBlob(blob => downloadBlob(blob, `${safeName($('#mapProjectTitle').value)}.jpg`), 'image/jpeg', quality);
    } else {
      canvas.toBlob(blob => downloadBlob(blob, `${safeName($('#mapProjectTitle').value)}.${format === 'png' ? 'png' : 'webp'}`), `image/${format}`, quality);
    }
    toast('Stationary map image exported.', 'success');
  }

  function exportHeightMap() {
    heightCanvas.toBlob(blob => downloadBlob(blob, `${safeName($('#mapProjectTitle').value)}_height.png`), 'image/png');
  }

  function exportPreviewCapture() {
    showMapStage('preview');
    setTimeout(() => {
      state.preview.renderer.domElement.toBlob(blob => {
        if (blob) downloadBlob(blob, `${safeName($('#mapProjectTitle').value)}_3d_preview.png`);
      }, 'image/png');
    }, 120);
  }

  function serializeMapProject() {
    return {
      schema: MAP_SCHEMA,
      version: 1,
      title: $('#mapProjectTitle').value || 'Untitled Map',
      mapType: $('#mapType').value,
      mapScale: $('#mapScale').value,
      width: state.width,
      height: state.height,
      grid: {
        enabled: $('#mapGridEnabled').checked,
        type: $('#mapGridType').value,
        size: Number($('#mapGridSize').value),
        color: $('#mapGridColor').value,
        opacity: Number($('#mapGridOpacity').value),
        snap: $('#mapSnapGrid').checked,
        export: $('#mapExportGrid').checked
      },
      effects: {
        relief: Number($('#mapReliefStrength').value),
        water: $('#mapWaterEffect').checked,
        waterStrength: Number($('#mapWaterStrength').value),
        clouds: $('#mapCloudEffect').checked,
        cloudCoverage: Number($('#mapCloudCoverage').value),
        cloudSpeed: Number($('#mapCloudSpeed').value),
        fog: $('#mapFogEffect').checked,
        fogDensity: Number($('#mapFogDensity').value),
        weather: $('#mapWeatherType').value,
        weatherAmount: Number($('#mapWeatherAmount').value),
        lighting: $('#mapLightingPreset').value,
        ambient: Number($('#mapAmbientLight').value),
        sunAngle: Number($('#mapSunAngle').value)
      },
      markers: clonePlain(state.markers),
      heightMap: heightCanvas.toDataURL('image/png'),
      layers: state.layers.map(layer => ({
        id: layer.id, name: layer.name, visible: layer.visible, opacity: layer.opacity,
        blend: layer.blend, locked: layer.locked, image: layer.canvas.toDataURL('image/png')
      })),
      sources: [
        'Azgaar Fantasy Map Generator (MIT) — map surface references and map-making concepts',
        'Layout Map Generator by Ben Damer (MIT) — room and corridor generation concepts',
        'VTT Maps (CC0) — stationary VTT map workflow references',
        'World Anvil and Worldbuilding Foundry modules (MIT) — lore and map metadata workflow references',
        'Three.js (MIT) — 3D preview rendering'
      ],
      backendLibrary: CONFIG.backendLibrary || '',
      savedAt: new Date().toISOString()
    };
  }

  function exportMapProject() {
    const project = serializeMapProject();
    downloadBlob(new Blob([JSON.stringify(project, null, 2)], {type: 'application/json'}), `${safeName(project.title)}.projectmap.json`);
    toast('Editable map project saved.', 'success');
  }

  async function importMapProject(file) {
    if (!file) return;
    let project;
    try { project = JSON.parse(await file.text()); }
    catch { toast('The selected map project is not valid JSON.', 'error'); return; }
    if (project.schema !== MAP_SCHEMA || !Array.isArray(project.layers)) { toast('This is not a supported Universal project canvas.', 'error'); return; }
    state.width = Math.max(256, Math.min(8192, Number(project.width) || 1600));
    state.height = Math.max(256, Math.min(8192, Number(project.height) || 1000));
    state.layers = [];
    compositeCanvas.width = interactionCanvas.width = heightCanvas.width = heightInteraction.width = state.width;
    compositeCanvas.height = interactionCanvas.height = heightCanvas.height = heightInteraction.height = state.height;
    for (const item of project.layers) {
      const layer = makeLayer(item.name, item);
      layer.id = item.id || layer.id;
      if (item.image) { const image = await loadImage(item.image); layer.ctx.drawImage(image, 0, 0, state.width, state.height); }
      state.layers.push(layer);
    }
    if (!state.layers.length) addLayer('Background');
    state.activeLayerId = state.layers[state.layers.length - 1].id;
    if (project.heightMap) { const image = await loadImage(project.heightMap); heightCtx.drawImage(image, 0, 0, state.width, state.height); }
    else { heightCtx.fillStyle = '#000'; heightCtx.fillRect(0, 0, state.width, state.height); }
    state.markers = clonePlain(project.markers || []);
    $('#mapProjectTitle').value = project.title || file.name.replace(/\.projectmap\.json$/i, '');
    $('#mapType').value = project.mapType || 'canvas'; $('#mapScale').value = project.mapScale || 'none';
    applyProjectControls(project);
    state.projectLoaded = true; state.history = []; state.redo = [];
    $('#projectName').textContent = $('#mapProjectTitle').value;
    renderLayerList(); renderComposite(); setZoom(0.7); setTimeout(fitMap, 40);
    if (state.preview.initialized) rebuildPreviewPlane();
    toast('Editable stationary map project opened.', 'success');
  }

  function applyProjectControls(project) {
    const grid = project.grid || {};
    $('#mapGridEnabled').checked = Boolean(grid.enabled); $('#mapGridType').value = grid.type || 'square'; $('#mapGridSize').value = grid.size || 64; $('#mapGridColor').value = grid.color || '#4b4653'; $('#mapGridOpacity').value = grid.opacity || 35; $('#mapSnapGrid').checked = Boolean(grid.snap); $('#mapExportGrid').checked = Boolean(grid.export);
    const effects = project.effects || {};
    $('#mapReliefStrength').value = effects.relief ?? 65; $('#mapWaterEffect').checked = effects.water ?? true; $('#mapWaterStrength').value = effects.waterStrength ?? 45; $('#mapCloudEffect').checked = Boolean(effects.clouds); $('#mapCloudCoverage').value = effects.cloudCoverage ?? 35; $('#mapCloudSpeed').value = effects.cloudSpeed ?? 25; $('#mapFogEffect').checked = Boolean(effects.fog); $('#mapFogDensity').value = effects.fogDensity ?? 28; $('#mapWeatherType').value = effects.weather || 'none'; $('#mapWeatherAmount').value = effects.weatherAmount ?? 45; $('#mapLightingPreset').value = effects.lighting || 'day'; $('#mapAmbientLight').value = effects.ambient ?? 65; $('#mapSunAngle').value = effects.sunAngle ?? 135;
  }

  async function saveMapBackend() {
    if (!BACKEND) { toast('No backend endpoint is configured.', 'error'); return; }
    const thumbnailCanvas = document.createElement('canvas');
    const scale = Math.min(1, 480 / state.width); thumbnailCanvas.width = Math.round(state.width * scale); thumbnailCanvas.height = Math.round(state.height * scale);
    thumbnailCanvas.getContext('2d').drawImage(composeExportCanvas(false), 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
    const payload = {
      action: 'saveUniversalProjectCanvas',
      studio: CONFIG.id || 'AI_Brain_Map_Studio',
      title: $('#mapProjectTitle').value || 'Untitled Map',
      mapType: $('#mapType').value,
      mapScale: $('#mapScale').value,
      width: state.width,
      height: state.height,
      layerCount: state.layers.length,
      markerCount: state.markers.length,
      effects: serializeMapProject().effects,
      grid: serializeMapProject().grid,
      thumbnail: thumbnailCanvas.toDataURL('image/jpeg', 0.72),
      backendLibrary: CONFIG.backendLibrary || '',
      updatedAt: new Date().toISOString()
    };
    try {
      const response = await fetch(BACKEND, {method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify(payload)});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      toast('Map metadata and preview saved to the configured backend.', 'success');
    } catch (error) {
      console.warn(error);
      try {
        await fetch(BACKEND, {method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain;charset=utf-8'}, body: JSON.stringify(payload)});
        toast('Map save request was sent; the browser could not read the cross-origin response.', 'success');
      } catch {
        toast('Backend save failed. Local map exports remain available.', 'error');
      }
    }
  }

  function copyMapSummary() {
    const summary = [
      `Map: ${$('#mapProjectTitle').value || 'Untitled Map'}`,
      `Type: ${$('#mapType').selectedOptions[0].textContent}`,
      `Size: ${state.width} × ${state.height}`,
      `Layers: ${state.layers.length}`,
      `Scale: ${$('#mapScale').selectedOptions[0].textContent}`,
      `3D effects: ${activeEffectNames().join(', ') || 'None'}`,
      `Effect points: ${state.markers.length}`
    ].join('\n');
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(summary).then(() => toast('Map summary copied.', 'success'));
    else { const area = document.createElement('textarea'); area.value = summary; document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove(); toast('Map summary copied.', 'success'); }
  }

  function renderTerrainButtons() {
    const grid = $('#terrainBrushGrid'); grid.innerHTML = '';
    for (const [key, terrain] of Object.entries(TERRAIN)) {
      const button = document.createElement('button'); button.dataset.terrain = key; button.innerHTML = `<span>${terrain.icon}</span><i style="background:${terrain.color}"></i>${terrain.label}`;
      button.classList.toggle('is-active', state.terrain === key);
      button.addEventListener('click', () => {
        state.terrain = key; setActiveTool('paint');
        $$('#terrainBrushGrid button').forEach(item => item.classList.toggle('is-active', item.dataset.terrain === key));
        $('#primaryColor').value = terrain.color;
      });
      grid.appendChild(button);
    }
  }

  function renderSymbolButtons() {
    const grid = $('#mapSymbolGrid'); grid.innerHTML = '';
    for (const [key, label, glyph] of SYMBOLS) {
      const button = document.createElement('button'); button.dataset.symbol = key; button.innerHTML = `<span>${glyph}</span>${label}`;
      button.classList.toggle('is-active', state.selectedSymbol === key && !state.customSymbol);
      button.addEventListener('click', () => {
        state.selectedSymbol = key; state.customSymbol = null; setActiveTool('stamp');
        $$('#mapSymbolGrid button').forEach(item => item.classList.toggle('is-active', item.dataset.symbol === key));
        $('#mapSelectedSymbol').textContent = `Selected symbol: ${label}`;
      });
      grid.appendChild(button);
    }
  }

  function bindMapCommands() {
    $$('[data-map-command]').forEach(button => button.addEventListener('click', () => {
      $$('.dropdown-menu').forEach(menu => menu.classList.remove('open'));
      const command = button.dataset.mapCommand;
      const actions = {
        'new-map': () => { setMode('map'); showMapProperty('map'); },
        'open-map-image': () => { setMode('map'); $('#mapImageInput').click(); },
        'open-map-project': () => { setMode('map'); $('#mapProjectInput').click(); },
        'export-map': exportMapImage,
        'export-map-project': exportMapProject,
        'cloud-save-map': saveMapBackend,
        'map-undo': mapUndo,
        'map-redo': mapRedo,
        'clear-map-layer': clearActiveLayer,
        'view-map-2d': () => showMapStage('canvas'),
        'view-map-3d': () => showMapStage('preview'),
        'view-map-height': () => showMapStage('height'),
        'toggle-map-grid': () => { $('#mapGridEnabled').checked = !$('#mapGridEnabled').checked; renderOverlay(); }
      };
      actions[command]?.();
    }));
  }

  function bindUI() {
    captureToolbarHandlers();
    $('#modeMapBtn').addEventListener('click', () => setMode('map'));
    $('#modeObjectBtn').addEventListener('click', () => setMode('object'));
    $('#welcomeNewMap').addEventListener('click', () => { setMode('map'); showMapProperty('map'); });
    $('#welcomeMapSecondary').addEventListener('click', () => { setMode('map'); showMapProperty('map'); });
    $('#welcomeOpenMap').addEventListener('click', () => { setMode('map'); $('#mapImageInput').click(); });
    $('#newMapRibbon').addEventListener('click', () => { setMode('map'); showMapProperty('map'); });
    $('#importMapRibbon').addEventListener('click', () => $('#mapImageInput').click());
    $('#openMapProjectRibbon').addEventListener('click', () => $('#mapProjectInput').click());
    $('#saveMapProjectRibbon').addEventListener('click', exportMapProject);
    $('#mapToolsRibbon').addEventListener('click', () => showMapProperty('build'));
    $('#mapPreviewRibbon').addEventListener('click', () => showMapStage('preview'));
    $('#exportMapRibbon').addEventListener('click', exportMapImage);
    $('#textPanelButton').addEventListener('click', () => { if (state.mode === 'map') showMapProperty('labels'); });
    $('#effectsPanelButton').addEventListener('click', () => { if (state.mode === 'map') showMapProperty('effects3d'); });
    $$('[data-tool]').forEach(button => button.addEventListener('click', () => { if (state.mode === 'map') setActiveTool(button.dataset.tool); }));
    $$('[data-map-tool]').forEach(button => button.addEventListener('click', () => setActiveTool(button.dataset.mapTool)));
    $$('[data-map-stage]').forEach(button => button.addEventListener('click', () => showMapStage(button.dataset.mapStage)));
    $$('[data-map-property]').forEach(button => button.addEventListener('click', () => showMapProperty(button.dataset.mapProperty)));
    $$('[data-map-generator]').forEach(button => button.addEventListener('click', () => runGenerator(button.dataset.mapGenerator)));
    $$('[data-map-surface]').forEach(button => button.addEventListener('click', () => fillWithSurfaceTexture(activeLayer(), button.dataset.mapSurface)));
    bindMapCommands();

    $('#createNewMap').addEventListener('click', () => createMap(Number($('#newMapWidth').value), Number($('#newMapHeight').value), $('#newMapTemplate').value));
    $('#resizeMapProject').addEventListener('click', () => { pushHistory(); setCanvasSize(Number($('#newMapWidth').value), Number($('#newMapHeight').value), true); toast('Map resized with layers preserved.', 'success'); });
    $('#importMapImage').addEventListener('click', () => $('#mapImageInput').click());
    $('#openMapProject').addEventListener('click', () => $('#mapProjectInput').click());
    $('#mapImageInput').addEventListener('change', event => { importMapImage(event.target.files[0]); event.target.value = ''; });
    $('#mapProjectInput').addEventListener('change', event => { importMapProject(event.target.files[0]); event.target.value = ''; });
    $('#mapProjectTitle').addEventListener('input', event => { if (state.mode === 'map') $('#projectName').textContent = event.target.value || 'Untitled Map'; });

    $('#addMapLayer').addEventListener('click', () => addLayer(`Layer ${state.layers.length + 1}`));
    $('#duplicateMapLayer').addEventListener('click', duplicateLayer);
    $('#deleteMapLayer').addEventListener('click', deleteLayer);
    $('#mapLayerUp').addEventListener('click', () => moveLayer(1));
    $('#mapLayerDown').addEventListener('click', () => moveLayer(-1));
    $('#mergeMapLayerDown').addEventListener('click', mergeLayerDown);
    $('#clearMapLayer').addEventListener('click', clearActiveLayer);
    $('#mapLayerOpacity').addEventListener('input', event => { const layer = activeLayer(); if (layer) { layer.opacity = Number(event.target.value) / 100; renderLayerList(); renderComposite(); } });
    $('#mapLayerBlend').addEventListener('change', event => { const layer = activeLayer(); if (layer) { layer.blend = event.target.value; renderLayerList(); renderComposite(); } });

    for (const id of ['mapGridEnabled', 'mapGridType', 'mapGridSize', 'mapGridColor', 'mapGridOpacity']) $(`#${id}`).addEventListener(id === 'mapGridEnabled' ? 'change' : 'input', renderOverlay);
    $('#mapZoom').addEventListener('input', event => setZoom(Number(event.target.value) / 100));
    $('#fitMapCanvas').addEventListener('click', fitMap);
    $('#mapActualSize').addEventListener('click', () => setZoom(1));

    interactionCanvas.addEventListener('pointerdown', event => startDrawing(event, interactionCanvas, false));
    interactionCanvas.addEventListener('pointermove', event => moveDrawing(event, interactionCanvas, false));
    interactionCanvas.addEventListener('pointerup', event => endDrawing(event, interactionCanvas, false));
    interactionCanvas.addEventListener('pointercancel', event => endDrawing(event, interactionCanvas, false));
    heightInteraction.addEventListener('pointerdown', event => startDrawing(event, heightInteraction, true));
    heightInteraction.addEventListener('pointermove', event => moveDrawing(event, heightInteraction, true));
    heightInteraction.addEventListener('pointerup', event => endDrawing(event, heightInteraction, true));
    heightInteraction.addEventListener('pointercancel', event => endDrawing(event, heightInteraction, true));

    const drop = $('#mapCanvasStage');
    for (const eventName of ['dragenter', 'dragover']) drop.addEventListener(eventName, event => { event.preventDefault(); drop.classList.add('dragging'); });
    for (const eventName of ['dragleave', 'drop']) drop.addEventListener(eventName, event => { event.preventDefault(); drop.classList.remove('dragging'); });
    drop.addEventListener('drop', event => {
      const file = event.dataTransfer.files[0];
      if (!file) return;
      if (/\.json$/i.test(file.name)) importMapProject(file); else if (file.type.startsWith('image/')) importMapImage(file); else toast('Drop a map image or .projectmap.json project.', 'error');
    });

    $('#addCompassRose').addEventListener('click', addCompassRose);
    $('#addScaleBar').addEventListener('click', addScaleBar);
    $('#addMapBorder').addEventListener('click', addMapBorder);
    $('#addLegendBox').addEventListener('click', addLegendBox);
    $('#activateMapText').addEventListener('click', () => setActiveTool('text'));
    $('#mapTextRotation').addEventListener('input', event => { $('#mapTextRotationOut').value = `${event.target.value}°`; });
    for (const id of ['mapTextBold', 'mapTextItalic', 'mapTextOutline', 'mapTextShadow', 'mapTextCurve']) $(`#${id}`).addEventListener('click', event => event.currentTarget.classList.toggle('is-active'));
    $('#uploadMapStamp').addEventListener('click', () => $('#mapStampInput').click());
    $('#mapStampInput').addEventListener('change', async event => {
      const file = event.target.files[0]; if (!file) return;
      const url = URL.createObjectURL(file);
      try { state.customSymbol = await loadImage(url); setActiveTool('stamp'); $$('#mapSymbolGrid button').forEach(button => button.classList.remove('is-active')); $('#mapSelectedSymbol').textContent = `Selected custom symbol: ${file.name}`; }
      finally { URL.revokeObjectURL(url); event.target.value = ''; }
    });

    $('#autoHeightFromTerrain').addEventListener('click', autoHeightFromTerrain);
    $('#autoHeightButton').addEventListener('click', autoHeightFromTerrain);
    $('#clearHeightMap').addEventListener('click', clearHeight);
    $('#invertHeightMap').addEventListener('click', invertHeight);
    $('#blurHeightMap').addEventListener('click', () => blurHeight(8, true));
    $('#previewMap3D').addEventListener('click', () => showMapStage('preview'));
    $('#clearEffectPoints').addEventListener('click', () => { pushHistory(); state.markers = []; renderComposite(); rebuildMarkerEffects(); });

    for (const id of ['mapReliefStrength', 'mapWaterStrength', 'mapFogDensity', 'mapAmbientLight', 'mapSunAngle']) $(`#${id}`).addEventListener('input', refreshPreviewEffects);
    $('#mapWaterEffect').addEventListener('change', refreshPreviewEffects);
    $('#mapFogEffect').addEventListener('change', refreshPreviewEffects);
    $('#mapLightingPreset').addEventListener('change', refreshPreviewEffects);
    $('#mapCloudEffect').addEventListener('change', () => { if (state.preview.initialized) rebuildClouds(); updateSummary(); });
    $('#mapCloudCoverage').addEventListener('input', () => { if (state.preview.initialized) rebuildClouds(); });
    $('#mapCloudSpeed').addEventListener('input', updateSummary);
    $('#mapWeatherType').addEventListener('change', () => { if (state.preview.initialized) rebuildWeather(); updateSummary(); });
    $('#mapWeatherAmount').addEventListener('input', () => { if (state.preview.initialized) rebuildWeather(); });

    $('#exportMapImage').addEventListener('click', exportMapImage);
    $('#exportMapHeight').addEventListener('click', exportHeightMap);
    $('#exportMapPreview').addEventListener('click', exportPreviewCapture);
    $('#exportMapProject').addEventListener('click', exportMapProject);
    $('#saveMapBackend').addEventListener('click', saveMapBackend);
    $('#copyMapSummary').addEventListener('click', copyMapSummary);

    document.addEventListener('keydown', event => {
      if (state.mode !== 'map' || ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? mapRedo() : mapUndo(); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); exportMapProject(); }
      const keys = {b: 'paint', e: 'erase', t: 'text', v: 'select', l: 'line', r: 'rectangle', o: 'ellipse', h: 'height'};
      if (keys[event.key.toLowerCase()]) setActiveTool(keys[event.key.toLowerCase()]);
    });
  }

  function init() {
    if (state.initialized) return;
    state.initialized = true;
    renderTerrainButtons();
    renderSymbolButtons();
    bindUI();
    createMap(1600, 1000, 'parchment', true);
    setMode('object');
    $('#welcomeScreen').hidden = false;
    $('#studioScreen').hidden = true;
    updateSummary();
    window.MapStudio = {
      setMode,
      createMap,
      importMapImage,
      importMapProject,
      exportMapImage,
      exportMapProject,
      serializeMapProject
    };
  }

  init();
})();
