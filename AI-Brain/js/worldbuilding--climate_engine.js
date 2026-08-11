/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
(function (global) {
  'use strict';

  var C = global.WorldBuilderClimate = global.WorldBuilderClimate || {};
  var latest = null;
  var timer = null;
  var animationFrame = null;
  var phase = 0;

  function q(id) { return document.getElementById(id); }
  function wrapLon(value) { var n = Number(value || 0); while (n > 180) n -= 360; while (n < -180) n += 360; return n; }
  function lonDelta(a, b) { return wrapLon(Number(a) - Number(b)); }
  function angularDistance(a, b) {
    var meanLat = ((a.lat + b.lat) / 2) * Math.PI / 180;
    return Math.hypot(lonDelta(a.lon, b.lon) * Math.max(0.25, Math.cos(meanLat)), a.lat - b.lat);
  }
  function cap(text) { return text ? text.charAt(0).toUpperCase() + text.slice(1) : text; }

  function areaClass(continent, sorted) {
    var index = sorted.indexOf(continent.relativeArea);
    var ratio = sorted.length < 2 ? 0.5 : index / (sorted.length - 1);
    return ratio > 0.7 ? 'large' : (ratio < 0.3 ? 'small' : 'medium');
  }

  function latitudeZone(lat) {
    var a = Math.abs(lat);
    if (a < 8) return 'equatorial convergence';
    if (a < 23.5) return 'tropical trade-wind';
    if (a < 36) return 'subtropical high-pressure';
    if (a < 60) return 'temperate westerly';
    if (a < 72) return 'subpolar storm';
    return 'polar maritime';
  }

  function windFor(lat) {
    var a = Math.abs(lat);
    if (a < 8) return lat >= 0 ? 'converging northeast and southeast trades' : 'converging southeast and northeast trades';
    if (a < 30) return lat >= 0 ? 'northeasterly trades' : 'southeasterly trades';
    if (a < 65) return 'prevailing westerlies';
    return 'polar easterlies';
  }

  function featureText(continent) {
    return (continent.features || []).map(function (f) { return (f.type || '') + ' ' + (f.name || ''); }).join(' ').toLowerCase();
  }

  function calculate(snapshot) {
    if (!snapshot || !snapshot.continents) return null;
    var galaxy = global.WorldBuilderGalaxy && WorldBuilderGalaxy.getState ? WorldBuilderGalaxy.getState() : null;
    var mainPlanet = galaxy && galaxy.system && galaxy.system.planets.find(function (planet) { return planet.isMainWorld; });
    var planetClimate = mainPlanet && global.WorldBuilderPlanetClimate ? WorldBuilderPlanetClimate.derivePlanet(mainPlanet, galaxy.system.star) : null;
    var lunarForcing = planetClimate ? Number(planetClimate.lunarForcing || 0) : 0;
    var sortedAreas = snapshot.continents.map(function (c) { return c.relativeArea; }).sort(function (a, b) { return a - b; });
    var blocked = [];
    for (var i = 0; i < snapshot.continents.length; i += 1) {
      for (var j = i + 1; j < snapshot.continents.length; j += 1) {
        var a = snapshot.continents[i], b = snapshot.continents[j];
        var radiusA = Math.max(a.pixelWidth / a.sourceWidth * 180, a.pixelHeight / a.sourceHeight * 90) * 0.42;
        var radiusB = Math.max(b.pixelWidth / b.sourceWidth * 180, b.pixelHeight / b.sourceHeight * 90) * 0.42;
        var distance = angularDistance(a.center, b.center);
        if (distance < radiusA + radiusB + 10) blocked.push({ a: a.key, b: b.key, distance: distance, severity: Math.max(0, Math.min(1, 1 - distance / (radiusA + radiusB + 10))) });
      }
    }

    var systems = snapshot.continents.map(function (continent) {
      var nearby = snapshot.continents.filter(function (other) { return other.key !== continent.key; }).map(function (other) { return { key: other.key, name: other.name, distance: angularDistance(continent.center, other.center) }; }).sort(function (x, y) { return x.distance - y.distance; });
      var nearest = nearby[0] || { distance: 180, name: 'none' };
      var size = areaClass(continent, sortedAreas);
      var zone = latitudeZone(continent.center.lat);
      var text = featureText(continent);
      var mountainous = /(mountain|peak|range|highland|volcan|ridge)/.test(text);
      var forested = /(forest|wood|jungle|grove|rainforest)/.test(text);
      var wetlands = /(river|lake|marsh|swamp|delta|bay|gulf|sea|ocean)/.test(text);
      var tropical = Math.abs(continent.center.lat) < 30;
      var continentality = Math.max(0, Math.min(100, (size === 'large' ? 64 : size === 'medium' ? 42 : 24) + Math.min(24, nearest.distance * 0.28) - (wetlands ? 8 : 0)));
      var monsoon = Math.max(0, Math.min(100, (tropical ? 58 : 20) + (size === 'large' ? 18 : 5) + (wetlands ? 13 : 0) + (mountainous ? 8 : 0)));
      var storm = Math.max(0, Math.min(100, (Math.abs(continent.center.lat) > 34 && Math.abs(continent.center.lat) < 68 ? 62 : 28) + (nearest.distance < 25 ? 12 : 0) + (blocked.some(function (x) { return x.a === continent.key || x.b === continent.key; }) ? 14 : 0) + lunarForcing * 2.4));
      var patterns = [windFor(continent.center.lat)];
      if (monsoon > 60) patterns.push('seasonal monsoon reversal');
      if (continentality > 60) patterns.push('dry interior pressure swings');
      if (mountainous) patterns.push('orographic rain and lee rain shadows');
      if (forested && tropical) patterns.push('daily humid convection');
      if (wetlands) patterns.push('coastal fog, sea breezes, and moisture recycling');
      if (storm > 62) patterns.push('intensified storm-track cyclogenesis');
      return {
        key: continent.key,
        name: continent.name,
        center: continent.center,
        zone: zone,
        size: size,
        wind: windFor(continent.center.lat),
        continentality: Math.round(continentality),
        monsoonPotential: Math.round(monsoon),
        stormPotential: Math.round(storm),
        nearestContinent: nearest,
        patterns: patterns,
        changedFromInitialLatitude: Math.abs(continent.center.lat - continent.initialCenter.lat) > 2
      };
    });

    latest = {
      generatedAt: new Date().toISOString(),
      frame: snapshot.frame,
      lunarInfluence: { moonCount: mainPlanet && mainPlanet.moons ? mainPlanet.moons.length : 0, forcing: lunarForcing, mainWorld: mainPlanet && mainPlanet.name || null },
      systems: systems,
      blockedOceanCorridors: blocked,
      globalPatterns: [
        'Equatorial convergence follows the geographic equator, while rainfall maxima shift toward the largest nearby tropical landmasses.',
        'Subtropical dry belts weaken beside open warm oceans and strengthen over large inland interiors.',
        'Midlatitude storm tracks bend around moved continents and intensify where new narrow seas funnel temperature contrasts.',
        'Ocean-current continuity is reduced wherever relocated continents narrow or close a former basin.',
        (mainPlanet ? mainPlanet.name + '\u2019s ' + mainPlanet.moons.length + '-moon system contributes ' + lunarForcing.toFixed(2) + '\u00d7 modeled tidal forcing to coastal mixing and storm-surge potential.' : 'No main-world lunar forcing has been assigned yet.')
      ]
    };
    try { document.dispatchEvent(new CustomEvent('worldbuilder:climate-change', { detail: { climate: latest } })); } catch (_err) {}
    return latest;
  }

  function syncOverlaySize() {
    var map = q('map-canvas'), overlay = q('weather-overlay');
    if (!map || !overlay) return false;
    if (overlay.width !== map.width || overlay.height !== map.height) { overlay.width = map.width; overlay.height = map.height; }
    return true;
  }

  function xy(center, width, height) {
    return { x: ((wrapLon(center.lon) + 180) / 360) * width, y: ((90 - center.lat) / 180) * height };
  }

  function drawArrow(ctx, x1, y1, x2, y2, width, alpha) {
    var dx = x2 - x1;
    if (Math.abs(dx) > width / 2) x2 += dx > 0 ? -width : width;
    var midX = (x1 + x2) / 2, midY = (y1 + y2) / 2 - Math.min(42, Math.abs(x2 - x1) * 0.08);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo(midX, midY, x2, y2);
    ctx.strokeStyle = 'rgba(0,255,255,' + alpha + ')'; ctx.lineWidth = 2; ctx.stroke();
    var angle = Math.atan2(y2 - midY, x2 - midX);
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 10 * Math.cos(angle - 0.45), y2 - 10 * Math.sin(angle - 0.45)); ctx.lineTo(x2 - 10 * Math.cos(angle + 0.45), y2 - 10 * Math.sin(angle + 0.45)); ctx.closePath(); ctx.fillStyle = 'rgba(0,255,255,' + Math.min(0.9, alpha + 0.2) + ')'; ctx.fill();
  }

  function drawOverlay() {
    animationFrame = null;
    if (!latest || !syncOverlaySize()) return;
    var overlay = q('weather-overlay');
    var show = q('show-weather');
    overlay.hidden = !!show && !show.checked;
    if (overlay.hidden) return;
    var ctx = overlay.getContext('2d'), width = overlay.width, height = overlay.height;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.setLineDash([8, 12]);
    [-60, -30, 0, 30, 60].forEach(function (lat) {
      var y = ((90 - lat) / 180) * height;
      ctx.strokeStyle = lat === 0 ? 'rgba(0,255,255,.24)' : 'rgba(123,232,242,.11)';
      ctx.lineWidth = lat === 0 ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    });
    ctx.setLineDash([]);

    latest.systems.forEach(function (system, index) {
      var p = xy(system.center, width, height);
      var direction = Math.abs(system.center.lat) < 30 ? -1 : 1;
      var length = width * (0.045 + system.stormPotential / 1800);
      drawArrow(ctx, p.x - direction * length * 0.45, p.y - 14, p.x + direction * length * 0.55, p.y - 14 + Math.sin(phase + index) * 5, width, 0.32 + system.stormPotential / 260);
      ctx.font = '700 ' + Math.max(9, Math.round(width / 145)) + 'px system-ui,sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(10,12,17,.82)'; ctx.fillStyle = 'rgba(239,255,255,.88)';
      var label = system.zone.replace(/-wind|-pressure/g, '');
      ctx.strokeText(label, p.x, p.y + 8); ctx.fillText(label, p.x, p.y + 8);
    });

    latest.blockedOceanCorridors.forEach(function (block) {
      var a = latest.systems.find(function (x) { return x.key === block.a; });
      var b = latest.systems.find(function (x) { return x.key === block.b; });
      if (!a || !b) return;
      var pa = xy(a.center, width, height), pb = xy(b.center, width, height);
      ctx.setLineDash([5, 5]); ctx.strokeStyle = 'rgba(193,178,90,' + (0.35 + block.severity * 0.45) + ')'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke(); ctx.setLineDash([]);
    });
    ctx.restore();
    phase += 0.025;
  }

  function scheduleDraw() {
    if (animationFrame) return;
    animationFrame = requestAnimationFrame(drawOverlay);
  }

  function updateUi(climate) {
    if (!climate) return;
    var summary = q('weather-summary');
    var detail = q('weather-detail');
    var health = q('weather-health');
    if (health) health.textContent = climate.blockedOceanCorridors.length ? climate.blockedOceanCorridors.length + ' corridor change' + (climate.blockedOceanCorridors.length === 1 ? '' : 's') : 'Open circulation';
    if (summary) {
      var strongest = climate.systems.slice().sort(function (a, b) { return b.stormPotential - a.stormPotential; })[0];
      summary.innerHTML = '<strong>' + climate.systems.length + ' continent climates recalculated.</strong> ' + (strongest ? strongest.name + ' currently has the strongest storm potential (' + strongest.stormPotential + '%).' : '');
    }
    if (detail) {
      detail.innerHTML = climate.systems.map(function (system) {
        return '<article><strong>' + cap(system.name) + '</strong><span>' + cap(system.zone) + ' · ' + system.wind + '</span><small>Monsoon ' + system.monsoonPotential + '% · Storm ' + system.stormPotential + '% · Continentality ' + system.continentality + '%</small><p>' + system.patterns.join('; ') + '.</p></article>';
      }).join('') + (climate.blockedOceanCorridors.length ? '<article class="weather-warning"><strong>Changed ocean corridors</strong><p>' + climate.blockedOceanCorridors.map(function (b) { return b.a + ' ↔ ' + b.b; }).join(', ') + '</p></article>' : '');
    }
  }

  function recalculate(snapshot) {
    var climate = calculate(snapshot || (global.WorldBuilderEditor && global.WorldBuilderEditor.getSnapshot()));
    updateUi(climate); scheduleDraw();
    return climate;
  }

  function debounceRecalculate(snapshot) {
    clearTimeout(timer);
    timer = setTimeout(function () { recalculate(snapshot); }, 110);
  }

  C.calculate = calculate;
  C.recalculate = recalculate;
  C.getLatest = function () { return latest ? JSON.parse(JSON.stringify(latest)) : null; };

  document.addEventListener('worldbuilder:ready', function (event) { recalculate(event.detail && event.detail.snapshot); });
  document.addEventListener('worldbuilder:project-change', function (event) { debounceRecalculate(event.detail && event.detail.snapshot); });
  document.addEventListener('worldbuilder:celestial-change', function () { debounceRecalculate(global.WorldBuilderEditor && WorldBuilderEditor.getSnapshot()); });
  window.addEventListener('resize', scheduleDraw);
  if (q('show-weather')) q('show-weather').addEventListener('change', scheduleDraw);
}(window));

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.climate_engine","category":"weather","sourceFile":"js/climate_engine.js","companionCss":"css/climate_engine.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
