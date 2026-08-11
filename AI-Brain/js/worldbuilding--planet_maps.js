/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function (global) {
  'use strict';

  const PM = {};
  const q = id => document.getElementById(id);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, Number(v) || 0));
  const rad = d => d * Math.PI / 180;
  const deep = value => value == null ? value : JSON.parse(JSON.stringify(value));
  let canvas, ctx, selectedLocationId = null;
  let view = { zoom: 1, centerLon: 0, centerLat: 0, dragging: false, lastX: 0, lastY: 0 };
  let rasterCache = new Map();
  let drawQueued = false;

  function hashString(text) {
    let h = 2166136261 >>> 0;
    for (const c of String(text || 'worldbuilder')) {
      h ^= c.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function noise2(x, y, seed) {
    const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 0.000113) * 43758.5453123;
    return n - Math.floor(n);
  }

  function smoothstep(t) { return t * t * (3 - 2 * t); }

  function valueNoise(x, y, seed) {
    const x0 = Math.floor(x), y0 = Math.floor(y), tx = smoothstep(x - x0), ty = smoothstep(y - y0);
    const a = noise2(x0, y0, seed), b = noise2(x0 + 1, y0, seed);
    const c = noise2(x0, y0 + 1, seed), d = noise2(x0 + 1, y0 + 1, seed);
    const ab = a + (b - a) * tx, cd = c + (d - c) * tx;
    return ab + (cd - ab) * ty;
  }

  function fbm(x, y, seed) {
    let total = 0, amp = .55, freq = 1, norm = 0;
    for (let i = 0; i < 5; i++) {
      total += valueNoise(x * freq, y * freq, seed + i * 1013) * amp;
      norm += amp; amp *= .5; freq *= 2.03;
    }
    return total / norm;
  }

  function getGalaxy() { return global.WorldBuilderGalaxy; }
  function getPlanet() { return getGalaxy() && getGalaxy().getSelectedPlanet ? getGalaxy().getSelectedPlanet() : null; }

  function composition(planet, key) { return Math.max(0, Number(planet && planet.composition && planet.composition[key]) || 0); }

  function biomeAt(planet, lon, lat) {
    const seed = hashString(planet.seed || planet.id || planet.name);
    const x = (lon + 180) / 54, y = (lat + 90) / 48;
    const continental = fbm(x, y, seed);
    const ridge = 1 - Math.abs(2 * fbm(x * 1.6 + 7, y * 1.6 - 3, seed + 88) - 1);
    const latitude = Math.abs(lat) / 90;
    const oceanShare = composition(planet, 'ocean') / 100;
    const iceShare = (composition(planet, 'ice') + composition(planet, 'mountainousIce')) / 100;
    const volcanicShare = composition(planet, 'volcanic') / 100;
    const gasShare = composition(planet, 'gas') / 100;
    const seaLevel = .74 - oceanShare * .58;
    const height = (continental - seaLevel) * 2.4 + ridge * .32;
    const polarIce = latitude > (1 - Math.min(.62, iceShare * 1.35));
    const mountain = height > .44 || (ridge > .86 && height > .16);
    const lava = volcanicShare > .08 && fbm(x * 2.7, y * 2.7, seed + 700) > 1 - Math.min(.42, volcanicShare * .65);
    const moisture = clamp(oceanShare * .55 + fbm(x + 13, y - 11, seed + 404) * .65 - latitude * .18, 0, 1);
    const temperature = clamp(1 - latitude * .9 - Math.max(0, height) * .25, 0, 1);
    let biome = 'land';
    if (gasShare > .55 || planet.type === 'gas-giant' || planet.type === 'ice-giant') biome = 'gas';
    else if (height < 0) biome = height < -.34 ? 'abyss' : height < -.12 ? 'deep-water' : 'shallow-water';
    else if (polarIce || (iceShare > .35 && fbm(x * 1.3, y * 1.3, seed + 501) > .48)) biome = mountain ? 'mountainous-ice' : 'ice';
    else if (lava) biome = 'volcanic';
    else if (mountain) biome = 'mountain';
    else if (moisture > .68 && temperature > .48) biome = 'rainforest';
    else if (moisture > .6) biome = 'forest';
    else if (moisture < .26 && temperature > .5) biome = 'desert';
    else if (moisture > .45 && height < .1) biome = 'wetland';
    else biome = 'plains';
    return { biome, height, moisture, temperature, continental, ridge };
  }

  const palette = {
    satellite: {
      gas: [162, 130, 92], abyss: [2, 15, 42], 'deep-water': [4, 47, 91], 'shallow-water': [18, 111, 148],
      ice: [220, 244, 249], 'mountainous-ice': [185, 215, 226], volcanic: [156, 43, 24], mountain: [91, 79, 67],
      rainforest: [25, 94, 48], forest: [41, 107, 57], desert: [186, 145, 86], wetland: [50, 101, 77], plains: [103, 142, 75], land: [115, 122, 81]
    },
    terrain: {
      gas: [143, 128, 116], abyss: [3, 24, 66], 'deep-water': [8, 61, 111], 'shallow-water': [31, 145, 171],
      ice: [238, 252, 255], 'mountainous-ice': [201, 227, 232], volcanic: [120, 48, 35], mountain: [106, 91, 77],
      rainforest: [45, 119, 58], forest: [62, 132, 69], desert: [211, 181, 111], wetland: [70, 135, 103], plains: [144, 173, 94], land: [151, 154, 104]
    },
    bathymetry: {
      gas: [121, 125, 135], abyss: [0, 5, 31], 'deep-water': [0, 30, 87], 'shallow-water': [32, 142, 183],
      ice: [225, 244, 255], 'mountainous-ice': [190, 218, 229], volcanic: [99, 75, 73], mountain: [126, 126, 126],
      rainforest: [190, 196, 185], forest: [180, 188, 176], desert: [201, 194, 175], wetland: [176, 193, 184], plains: [187, 193, 178], land: [185, 185, 174]
    },
    geology: {
      gas: [165, 124, 90], abyss: [15, 35, 47], 'deep-water': [27, 55, 66], 'shallow-water': [58, 108, 113],
      ice: [207, 235, 242], 'mountainous-ice': [169, 199, 210], volcanic: [202, 67, 38], mountain: [124, 85, 59],
      rainforest: [107, 130, 72], forest: [96, 124, 74], desert: [197, 154, 89], wetland: [93, 133, 101], plains: [160, 142, 87], land: [144, 125, 91]
    }
  };

  function climateColor(info, planet) {
    const climate = global.WorldBuilderPlanetClimate && global.WorldBuilderPlanetClimate.derivePlanet(planet, getGalaxy().getState().system.star);
    const t = clamp((info.temperature * 75 + (climate ? climate.surfaceC : 10) + 25) / 100, 0, 1);
    if (info.biome.includes('water') || info.biome === 'abyss') return [10, 70 + Math.round(70 * t), 130 + Math.round(80 * t)];
    if (t < .22) return [215, 237, 247];
    if (t < .42) return [95, 155, 116];
    if (t < .68) return [91, 152, 68];
    if (info.moisture > .58) return [35, 126, 65];
    return [205, 151, 69];
  }

  function politicalColor(lon, lat, planet) {
    const seed = hashString(planet.id || planet.name);
    const region = Math.abs(Math.floor((lon + 180) / 24) * 11 + Math.floor((lat + 90) / 22) * 17 + seed) % 9;
    const colors = [[122,83,160],[69,132,168],[169,82,96],[80,143,95],[179,129,65],[88,99,153],[154,82,132],[74,149,142],[157,111,78]];
    return colors[region];
  }

  function weatherColor(info, lon, lat, planet) {
    const state = getGalaxy().getState();
    const epoch = state.epochDay || 0;
    const cloud = fbm((lon + epoch * .8) / 24, (lat - epoch * .15) / 18, hashString(planet.seed) + 991);
    const storm = cloud > .74 && info.moisture > .38;
    if (storm) return [175, 194, 207];
    if (cloud > .58) return [111, 145, 158];
    const base = palette.satellite[info.biome] || [100, 120, 90];
    return base.map(v => Math.round(v * .78));
  }

  function buildRaster(planet, mode, width = 800, height = 400) {
    const key = [planet.id, planet.seed, mode, JSON.stringify(planet.composition), planet.type].join('|');
    if (rasterCache.has(key)) return rasterCache.get(key);
    const off = document.createElement('canvas'); off.width = width; off.height = height;
    const octx = off.getContext('2d', { alpha: false });
    const img = octx.createImageData(width, height);
    const data = img.data;
    for (let y = 0; y < height; y++) {
      const lat = 90 - y / (height - 1) * 180;
      for (let x = 0; x < width; x++) {
        const lon = x / (width - 1) * 360 - 180;
        const info = biomeAt(planet, lon, lat);
        let rgb;
        if (mode === 'climate') rgb = climateColor(info, planet);
        else if (mode === 'political') {
          const water = info.biome.includes('water') || info.biome === 'abyss';
          rgb = water ? palette.satellite[info.biome] : politicalColor(lon, lat, planet);
        } else if (mode === 'weather') rgb = weatherColor(info, lon, lat, planet);
        else rgb = (palette[mode === 'seismic' ? 'geology' : mode] || palette.satellite)[info.biome] || [100, 120, 90];
        const shade = mode === 'political' ? 1 : clamp(.74 + info.height * .24 + info.ridge * .16, .55, 1.18);
        const i = (y * width + x) * 4;
        data[i] = clamp(rgb[0] * shade, 0, 255);
        data[i + 1] = clamp(rgb[1] * shade, 0, 255);
        data[i + 2] = clamp(rgb[2] * shade, 0, 255);
        data[i + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);
    rasterCache.set(key, off);
    if (rasterCache.size > 18) rasterCache.delete(rasterCache.keys().next().value);
    return off;
  }

  function lonLatToCanvas(lon, lat) {
    const z = view.zoom;
    let dx = lon - view.centerLon;
    while (dx < -180) dx += 360; while (dx > 180) dx -= 360;
    return {
      x: canvas.width / 2 + dx / 360 * canvas.width * z,
      y: canvas.height / 2 - (lat - view.centerLat) / 180 * canvas.height * z
    };
  }

  function canvasToLonLat(x, y) {
    const z = view.zoom;
    let lon = view.centerLon + (x - canvas.width / 2) / (canvas.width * z) * 360;
    while (lon < -180) lon += 360; while (lon > 180) lon -= 360;
    const lat = clamp(view.centerLat - (y - canvas.height / 2) / (canvas.height * z) * 180, -90, 90);
    return { lon, lat };
  }

  function drawRasterWrapped(raster) {
    const z = view.zoom;
    const worldW = canvas.width * z, worldH = canvas.height * z;
    const centerX = canvas.width / 2 - ((view.centerLon + 180) / 360) * worldW;
    const centerY = canvas.height / 2 - ((90 - view.centerLat) / 180) * worldH;
    ctx.imageSmoothingEnabled = true;
    for (let k = -3; k <= 3; k++) ctx.drawImage(raster, centerX + k * worldW, centerY, worldW, worldH);
  }

  function drawGrid() {
    if (!q('map-show-grid')?.checked) return;
    ctx.save(); ctx.strokeStyle = 'rgba(226,252,255,.34)'; ctx.lineWidth = 1;
    ctx.font = '12px system-ui'; ctx.fillStyle = 'rgba(232,255,255,.72)';
    const step = view.zoom >= 6 ? 5 : view.zoom >= 3 ? 10 : 30;
    for (let lon = -180; lon <= 180; lon += step) {
      const a = lonLatToCanvas(lon, -90), b = lonLatToCanvas(lon, 90);
      if (a.x < -2 || a.x > canvas.width + 2) continue;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      if (a.x > 15 && a.x < canvas.width - 35) ctx.fillText(`${Math.abs(lon)}°${lon < 0 ? 'W' : lon > 0 ? 'E' : ''}`, a.x + 3, 16);
    }
    for (let lat = -90; lat <= 90; lat += step) {
      const a = lonLatToCanvas(-180, lat), b = lonLatToCanvas(180, lat);
      ctx.beginPath(); ctx.moveTo(0, a.y); ctx.lineTo(canvas.width, b.y); ctx.stroke();
      if (a.y > 16 && a.y < canvas.height - 8) ctx.fillText(`${Math.abs(lat)}°${lat < 0 ? 'S' : lat > 0 ? 'N' : ''}`, 5, a.y - 3);
    }
    ctx.restore();
  }

  function drawWeather(planet) {
    if (!q('map-show-weather')?.checked) return;
    const state = getGalaxy().getState(), seed = hashString(planet.seed) + Math.floor((state.epochDay || 0) / 2);
    const count = Math.max(4, Math.round((global.WorldBuilderPlanetClimate?.derivePlanet(planet, state.system.star).stormIndex || 30) / 9));
    ctx.save();
    for (let i = 0; i < count; i++) {
      const lon = noise2(i, 4, seed) * 360 - 180;
      const lat = noise2(i, 9, seed) * 130 - 65;
      const p = lonLatToCanvas(lon, lat); if (p.x < -100 || p.x > canvas.width + 100 || p.y < -100 || p.y > canvas.height + 100) continue;
      const r = (18 + noise2(i, 13, seed) * 45) * Math.sqrt(view.zoom);
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      grad.addColorStop(0, 'rgba(235,250,255,.33)'); grad.addColorStop(1, 'rgba(235,250,255,0)');
      ctx.fillStyle = grad; ctx.beginPath(); ctx.ellipse(p.x, p.y, r * 1.7, r, rad(noise2(i, 15, seed) * 180), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawSeismic(planet) {
    const mode = q('planet-map-mode')?.value;
    if (mode !== 'seismic' || !global.WorldBuilderSeismicActivity) return;
    const state = getGalaxy().getState(), events = global.WorldBuilderSeismicActivity.generate(planet, state.epochDay);
    ctx.save();
    for (const event of events) {
      const p = lonLatToCanvas(event.longitude, event.latitude);
      if (p.x < -40 || p.x > canvas.width + 40 || p.y < -40 || p.y > canvas.height + 40) continue;
      const radius = Math.min(28, event.size * Math.sqrt(view.zoom));
      ctx.globalAlpha = .28; ctx.fillStyle = event.color; ctx.beginPath(); ctx.arc(p.x, p.y, radius * 1.8, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = .95; ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(2.5, radius * .38), 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawTransit(planet) {
    if (!q('map-show-transit')?.checked || !Array.isArray(planet.locations) || planet.locations.length < 2) return;
    ctx.save(); ctx.strokeStyle = 'rgba(0,255,255,.72)'; ctx.lineWidth = 2; ctx.setLineDash([8, 5]);
    const sorted = [...planet.locations].sort((a, b) => a.longitude - b.longitude);
    for (let i = 1; i < sorted.length; i++) {
      const a = lonLatToCanvas(sorted[i - 1].longitude, sorted[i - 1].latitude), b = lonLatToCanvas(sorted[i].longitude, sorted[i].latitude);
      if (Math.abs(a.x - b.x) > canvas.width * .6) continue;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); const mx = (a.x + b.x) / 2, my = Math.min(a.y, b.y) - 15 - Math.abs(a.x - b.x) * .04; ctx.quadraticCurveTo(mx, my, b.x, b.y); ctx.stroke();
    }
    ctx.restore();
  }

  function drawLocations(planet) {
    if (!q('map-show-locations')?.checked || !Array.isArray(planet.locations)) return;
    ctx.save(); ctx.font = '600 13px system-ui';
    for (const loc of planet.locations) {
      const p = lonLatToCanvas(loc.longitude, loc.latitude); if (p.x < -40 || p.x > canvas.width + 40 || p.y < -40 || p.y > canvas.height + 40) continue;
      const selected = loc.locationId === selectedLocationId;
      ctx.beginPath(); ctx.arc(p.x, p.y, selected ? 8 : 5, 0, Math.PI * 2); ctx.fillStyle = selected ? '#f1be6a' : '#00ffff'; ctx.fill();
      ctx.strokeStyle = '#061018'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = 'rgba(3,9,15,.82)'; const label = loc.name || loc.type || 'Location'; const w = ctx.measureText(label).width + 12; ctx.fillRect(p.x + 8, p.y - 12, w, 20);
      ctx.fillStyle = '#efffff'; ctx.fillText(label, p.x + 14, p.y + 3);
    }
    ctx.restore();
  }

  function drawDepthContours(planet) {
    if (!q('map-show-depth')?.checked) return;
    ctx.save(); ctx.strokeStyle = 'rgba(180,235,255,.22)'; ctx.lineWidth = 1;
    for (let lat = -80; lat <= 80; lat += 20) {
      ctx.beginPath();
      for (let lon = -180; lon <= 180; lon += 3) {
        const info = biomeAt(planet, lon, lat + Math.sin(rad(lon * 2)) * 2);
        if (info.height >= 0) continue;
        const p = lonLatToCanvas(lon, lat + Math.sin(rad(lon * 2)) * 2);
        if (lon === -180) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function renderLocations(planet) {
    const list = q('location-list-galaxy'); if (!list) return;
    const locations = planet && planet.locations || [];
    list.innerHTML = locations.length ? locations.map(loc => `<button class="location-card${loc.locationId === selectedLocationId ? ' active' : ''}" data-location-id="${escapeHtml(loc.locationId)}" type="button"><strong>${escapeHtml(loc.name)}</strong><small>${escapeHtml(loc.type)} · ${formatCoord(loc.latitude, 'N', 'S')}, ${formatCoord(loc.longitude, 'E', 'W')}</small><small>${escapeHtml(loc.biome || '')} · ${escapeHtml(loc.access || 'surface access')}</small></button>`).join('') : '<div class="location-card"><strong>No visitable locations</strong><small>Open editor workspace and generate locations, or import a scoped location file.</small></div>';
    list.querySelectorAll('[data-location-id]').forEach(button => button.addEventListener('click', () => selectLocation(button.dataset.locationId)));
  }

  function escapeHtml(value) { return String(value == null ? '' : value).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }
  function formatCoord(v, positive, negative) { v = Number(v) || 0; return `${Math.abs(v).toFixed(2)}°${v < 0 ? negative : positive}`; }

  function queueDraw() { if (drawQueued) return; drawQueued = true; requestAnimationFrame(() => { drawQueued = false; draw(); }); }

  function draw() {
    if (!canvas || !ctx) return;
    const planet = getPlanet();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!planet) { ctx.fillStyle = '#06131d'; ctx.fillRect(0, 0, canvas.width, canvas.height); return; }
    const mode = q('planet-map-mode')?.value || 'satellite';
    const raster = buildRaster(planet, mode);
    drawRasterWrapped(raster); drawDepthContours(planet); drawGrid(); drawWeather(planet); drawSeismic(planet); drawTransit(planet); drawLocations(planet);
    renderLocations(planet);
  }

  function selectLocation(id) {
    const planet = getPlanet(); if (!planet) return;
    const loc = (planet.locations || []).find(item => item.locationId === id); if (!loc) return;
    selectedLocationId = id; view.centerLon = Number(loc.longitude) || 0; view.centerLat = Number(loc.latitude) || 0; view.zoom = Math.max(view.zoom, 3);
    const zoom = q('planet-map-zoom'); if (zoom) zoom.value = String(view.zoom);
    const out = q('planet-map-zoom-output'); if (out) out.textContent = `${view.zoom.toFixed(1)}×`;
    queueDraw();
    document.dispatchEvent(new CustomEvent('worldbuilder:location-selected', { detail: { planet: deep(planet), location: deep(loc) } }));
    if (global.WorldBuilderPlanetWalkthrough && global.WorldBuilderPlanetWalkthrough.goToLocation) global.WorldBuilderPlanetWalkthrough.goToLocation(loc);
  }

  function generateLocations() {
    const planet = getPlanet(); const galaxy = getGalaxy(); if (!planet || !galaxy) return;
    const seed = hashString(planet.seed || planet.id), types = ['capital', 'city', 'research station', 'temple', 'spaceport', 'harbor', 'cavern settlement', 'orbital elevator', 'frontier town', 'underwater habitat'];
    const prefixes = ['Astra', 'Cinder', 'Dawn', 'Echo', 'Frost', 'Gale', 'Hollow', 'Iris', 'Lumen', 'Nova', 'Reef', 'Stone', 'Tide', 'Umber', 'Verdant'];
    const suffixes = ['haven', 'reach', 'spire', 'gate', 'fall', 'watch', 'harbor', 'crown', 'deep', 'crossing', 'station', 'enclave'];
    const count = clamp(Math.round(7 + planet.radiusEarth * 3 + (Number(planet.era) || 0) * .9), 6, 32);
    const locations = [];
    for (let i = 0; i < count; i++) {
      let lon = noise2(i, 1, seed) * 360 - 180, lat = noise2(i, 2, seed) * 150 - 75, info = biomeAt(planet, lon, lat), tries = 0;
      while ((info.biome === 'gas' || info.biome === 'abyss') && tries++ < 12) { lon = noise2(i + tries * 17, 5, seed) * 360 - 180; lat = noise2(i + tries * 29, 7, seed) * 150 - 75; info = biomeAt(planet, lon, lat); }
      let type = types[Math.floor(noise2(i, 3, seed) * types.length)];
      if (info.biome.includes('water') || info.biome === 'abyss') type = noise2(i, 8, seed) > .45 ? 'underwater habitat' : 'floating settlement';
      if (info.biome === 'mountain' || info.biome === 'mountainous-ice') type = noise2(i, 8, seed) > .5 ? 'cavern settlement' : 'mountain city';
      if (planet.type === 'gas-giant' || planet.type === 'ice-giant') type = noise2(i, 8, seed) > .5 ? 'cloud city' : 'aerostat habitat';
      locations.push({
        locationId: `loc-${planet.id}-${i + 1}`, planetId: planet.id,
        name: `${prefixes[Math.floor(noise2(i, 10, seed) * prefixes.length)]}${suffixes[Math.floor(noise2(i, 11, seed) * suffixes.length)]}`,
        type, longitude: Number(lon.toFixed(4)), latitude: Number(lat.toFixed(4)), elevationM: Math.round(info.height * 6200),
        biome: info.biome, access: type.includes('underwater') ? 'submarine / pressure lock' : type.includes('cloud') || type.includes('aerostat') ? 'airship / flight' : 'surface transit',
        pinId: `pin-${planet.id}-${i + 1}`, bindingStatus: 'open', protected: false, source: 'WorldBuilder procedural location generator'
      });
    }
    galaxy.applyPatch(planet.id, { locations }, `Generated ${locations.length} visitable locations for ${planet.name}.`);
    selectedLocationId = locations[0]?.locationId || null; rasterCache.clear(); refresh();
    document.dispatchEvent(new CustomEvent('worldbuilder:locations-generated', { detail: { planet: deep(getPlanet()), locations: deep(locations) } }));
  }

  function nearestLocation(x, y) {
    const planet = getPlanet(); if (!planet || !planet.locations) return null;
    let best = null, dist = 22;
    for (const loc of planet.locations) { const p = lonLatToCanvas(loc.longitude, loc.latitude), d = Math.hypot(p.x - x, p.y - y); if (d < dist) { dist = d; best = loc; } }
    return best;
  }

  function updateCoordinate(e) {
    const rect = canvas.getBoundingClientRect(), x = (e.clientX - rect.left) * canvas.width / rect.width, y = (e.clientY - rect.top) * canvas.height / rect.height;
    const ll = canvasToLonLat(x, y), chip = q('planet-map-coordinates');
    if (chip) chip.textContent = `${formatCoord(ll.lat, 'N', 'S')} · ${formatCoord(ll.lon, 'E', 'W')}`;
    return { x, y, ...ll };
  }

  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const targetW = Math.max(800, Math.min(1800, Math.round(rect.width * Math.min(2, global.devicePixelRatio || 1))));
    const targetH = Math.round(targetW / 2);
    if (canvas.width !== targetW || canvas.height !== targetH) { canvas.width = targetW; canvas.height = targetH; queueDraw(); }
  }

  function bind() {
    canvas = q('planet-map-canvas'); if (!canvas) return; ctx = canvas.getContext('2d', { alpha: false });
    ['planet-map-mode', 'map-show-grid', 'map-show-locations', 'map-show-transit', 'map-show-weather', 'map-show-depth'].forEach(id => q(id)?.addEventListener('change', () => { if (id === 'planet-map-mode' && q(id).value === 'weather') rasterCache.clear(); queueDraw(); }));
    q('planet-map-zoom')?.addEventListener('input', e => { view.zoom = clamp(e.target.value, 1, 12); q('planet-map-zoom-output').textContent = `${view.zoom.toFixed(1)}×`; queueDraw(); });
    q('generate-locations')?.addEventListener('click', generateLocations);
    canvas.addEventListener('pointermove', e => { const pt = updateCoordinate(e); if (view.dragging) { const dx = pt.x - view.lastX, dy = pt.y - view.lastY; view.centerLon -= dx / (canvas.width * view.zoom) * 360; view.centerLat = clamp(view.centerLat + dy / (canvas.height * view.zoom) * 180, -90 + 90 / view.zoom, 90 - 90 / view.zoom); view.lastX = pt.x; view.lastY = pt.y; queueDraw(); } });
    canvas.addEventListener('pointerdown', e => { const pt = updateCoordinate(e), loc = nearestLocation(pt.x, pt.y); if (loc) { selectLocation(loc.locationId); return; } view.dragging = true; view.lastX = pt.x; view.lastY = pt.y; canvas.setPointerCapture?.(e.pointerId); });
    canvas.addEventListener('pointerup', e => { view.dragging = false; canvas.releasePointerCapture?.(e.pointerId); });
    canvas.addEventListener('pointerleave', () => { view.dragging = false; });
    canvas.addEventListener('wheel', e => { e.preventDefault(); view.zoom = clamp(view.zoom * (e.deltaY > 0 ? .88 : 1.14), 1, 12); const slider = q('planet-map-zoom'); if (slider) slider.value = String(view.zoom); if (q('planet-map-zoom-output')) q('planet-map-zoom-output').textContent = `${view.zoom.toFixed(1)}×`; queueDraw(); }, { passive: false });
    global.addEventListener('resize', resizeCanvas);
    document.addEventListener('worldbuilder:galaxy-change', () => { rasterCache.clear(); refresh(); });
    document.addEventListener('worldbuilder:planet-selected', () => { selectedLocationId = null; view = { ...view, zoom: 1, centerLon: 0, centerLat: 0 }; rasterCache.clear(); refresh(); });
    resizeCanvas(); refresh();
  }

  function refresh() { resizeCanvas(); const p = getPlanet(); renderLocations(p); queueDraw(); }
  document.addEventListener('DOMContentLoaded', bind);
  Object.assign(PM, { refresh, draw, generateLocations, selectLocation, getSelectedLocation: () => { const p = getPlanet(); return deep((p?.locations || []).find(x => x.locationId === selectedLocationId) || null); }, biomeAt, canvasToLonLat, lonLatToCanvas });
  global.WorldBuilderPlanetMaps = PM;
})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.planet_maps","category":"space","sourceFile":"js/planet_maps.js","companionCss":"css/planet_maps.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
