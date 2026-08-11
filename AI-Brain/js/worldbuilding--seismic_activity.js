/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
/*
 * WorldBuilder fictional seismic layer.
 * Magnitude/depth visualization is adapted from Real-Time-Earthquake-Globe (MIT).
 */
(function (global) {
  'use strict';
  const S = {};
  const cache = new Map();
  function hash(text) { let h = 2166136261; for (const c of String(text || 'seismic')) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function random(a, b, seed) { const n = Math.sin(a * 12.9898 + b * 78.233 + seed * .00017) * 43758.5453; return n - Math.floor(n); }
  function magnitudeColor(mag) { if (mag >= 7) return '#e43b32'; if (mag >= 6) return '#f17839'; if (mag >= 4.5) return '#f5b84b'; if (mag >= 3) return '#e8e36d'; if (mag >= 2) return '#8be3c5'; return '#e9fbff'; }
  function magnitudeLabel(mag) { if (mag >= 7) return 'Great'; if (mag >= 6) return 'Major'; if (mag >= 4.5) return 'Strong'; if (mag >= 3) return 'Moderate'; if (mag >= 2) return 'Light'; return 'Minor'; }
  function depthLabel(depthKm) { return depthKm < 70 ? 'Shallow' : depthKm < 300 ? 'Intermediate' : 'Deep'; }
  function magnitudeSize(mag) { return Math.max(2, 2 * Math.pow(1.45, Math.max(0, mag))); }
  function generate(planet, epochDay, count) {
    if (!planet) return [];
    const key = `${planet.id}|${Math.floor(Number(epochDay || 0) / 3)}|${count || ''}|${planet.composition?.volcanic || 0}`;
    if (cache.has(key)) return cache.get(key);
    const seed = hash(key), tectonic = Math.max(.15, ((Number(planet.composition?.volcanic) || 0) + (Number(planet.terrain?.mountainShareOfLand) || 0)) / 55);
    const total = Math.max(4, Math.min(80, count || Math.round(8 + tectonic * 28)));
    const rows = [];
    for (let i = 0; i < total; i++) {
      const belt = Math.floor(random(i, 1, seed) * 6), baseLon = belt * 60 - 180;
      const lon = baseLon + (random(i, 2, seed) - .5) * 38 + Math.sin(i * .77) * 7;
      const lat = Math.sin((lon + belt * 29) * Math.PI / 70) * (24 + random(i, 3, seed) * 38) + (random(i, 4, seed) - .5) * 18;
      const mag = Math.min(9.5, .4 + Math.pow(random(i, 5, seed), 3.2) * 8.8 * Math.max(.55, tectonic));
      const depth = Math.round(Math.pow(random(i, 6, seed), 1.7) * 700);
      rows.push({ eventId: `quake-${planet.id}-${i}`, longitude: ((lon + 540) % 360) - 180, latitude: Math.max(-85, Math.min(85, lat)), depthKm: depth, magnitude: Number(mag.toFixed(1)), label: magnitudeLabel(mag), depthLabel: depthLabel(depth), color: magnitudeColor(mag), size: magnitudeSize(mag) });
    }
    cache.set(key, rows); if (cache.size > 20) cache.delete(cache.keys().next().value);
    return rows;
  }
  Object.assign(S, { generate, magnitudeColor, magnitudeLabel, depthLabel, magnitudeSize, clear: () => cache.clear() });
  global.WorldBuilderSeismicActivity = S;
})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.seismic_activity","category":"system","sourceFile":"js/seismic_activity.js","companionCss":"css/seismic_activity.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
