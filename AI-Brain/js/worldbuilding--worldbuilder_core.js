/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-c. */
(function (global) {
  "use strict";
  const WF = global.WorldBuilder = global.WorldBuilder || {};
  const modules = WF._modules = WF._modules || new Map();
  const listeners = WF._listeners = WF._listeners || new Map();

  WF.VERSION = "3.1.0-tested-superbot-coastlines";
  WF.BACKEND = Object.freeze({
    endpoint: "https://script.google.com/macros/s/AKfycbxe3P6MBofPEhPfTAaz05TWEYhScX9QgpHzBKCdwPGnvzvVoyfllu0bAghZKqHs4E3hGg/exec",
    libraryId: "1v06thwdjlv-j82hqHibJF3_gik7i8p9fFfK9nj0EOfi8VHhwT11jK5Eb",
    libraryVersion: 4,
    libraryUrl: "https://script.google.com/macros/library/d/1v06thwdjlv-j82hqHibJF3_gik7i8p9fFfK9nj0EOfi8VHhwT11jK5Eb/4"
  });

  WF.registerModule = function registerModule(id, definition) {
    if (!id || !definition || typeof definition.apply !== "function") {
      throw new TypeError("WorldBuilder modules require an id and apply(context) function");
    }
    modules.set(id, Object.freeze({ id, order: 100, category: "system", ...definition }));
  };
  WF.getModules = () => [...modules.values()].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  WF.applyRegisteredModules = function applyRegisteredModules(world, context) {
    world.moduleManifest = [];
    for (const mod of WF.getModules()) {
      try {
        const before = context.featureCount();
        const result = mod.apply({ ...context, world, module: mod }) || null;
        world.moduleManifest.push({
          id: mod.id, label: mod.label || mod.id, category: mod.category,
          generatedFeatures: context.featureCount() - before,
          status: "active", result
        });
      } catch (error) {
        console.error(`Module ${mod.id} failed`, error);
        world.moduleManifest.push({ id: mod.id, label: mod.label || mod.id, category: mod.category, status: "error", error: error.message });
      }
    }
  };

  WF.on = function on(type, listener) {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type).add(listener);
    return () => listeners.get(type)?.delete(listener);
  };
  WF.emit = function emit(type, detail) {
    listeners.get(type)?.forEach((listener) => { try { listener(detail); } catch (error) { console.error(error); } });
  };

  const U = WF.util = WF.util || {};
  U.clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  U.wrapLon = (lon) => { let value = Number(lon) || 0; while (value < -180) value += 360; while (value >= 180) value -= 360; return value; };
  U.distanceKm = (a, b) => {
    const r = Math.PI / 180, p1 = a.lat * r, p2 = b.lat * r;
    const dp = (b.lat - a.lat) * r, dl = U.wrapLon(b.lon - a.lon) * r;
    const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
  };
  U.slug = (value) => String(value || "world").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "world";
  U.escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  U.pickWeighted = (rng, rows) => {
    const total = rows.reduce((s, row) => s + (row.weight || 1), 0);
    let cursor = rng() * total;
    for (const row of rows) { cursor -= row.weight || 1; if (cursor <= 0) return row.value; }
    return rows.at(-1)?.value;
  };
  U.pointInPolygon = (point, polygon) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1], xj = polygon[j][0], yj = polygon[j][1];
      const crosses = ((yi > point.lat) !== (yj > point.lat)) && (point.lon < (xj - xi) * (point.lat - yi) / ((yj - yi) || 1e-12) + xi);
      if (crosses) inside = !inside;
    }
    return inside;
  };
  U.download = (blob, filename) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  U.debounce = (fn, delay = 150) => { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; };
  U.hashString = (value) => {
    let h = 2166136261;
    for (const ch of String(value)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };

  WF.makeModuleContext = function makeModuleContext({ world, rng, options, heightMap, width, height }) {
    world.features = world.features || {};
    let featureCounter = 0;
    const heightAt = (lon, lat) => {
      const x = ((U.wrapLon(lon) + 180) / 360) * width;
      const y = ((90 - U.clamp(lat, -90, 90)) / 180) * height;
      return heightMap[U.clamp(Math.floor(y), 0, height - 1) * width + (Math.floor(x + width) % width)];
    };
    const randomCoordinate = (predicate, attempts = 1600) => {
      for (let i = 0; i < attempts; i += 1) {
        const p = { lon: -180 + rng() * 360, lat: -78 + rng() * 156 };
        p.elevationM = heightAt(p.lon, p.lat);
        if (!predicate || predicate(p)) return p;
      }
      return { lon: 0, lat: 0, elevationM: heightAt(0, 0) };
    };
    const addFeature = (category, feature) => {
      world.features[category] = world.features[category] || [];
      const enriched = { id: `${category}-${world.features[category].length + 1}`, category, ...feature };
      world.features[category].push(enriched); featureCounter += 1; return enriched;
    };
    return { world, rng, options, heightMap, width, height, heightAt, randomCoordinate, addFeature, featureCount: () => featureCounter };
  };
})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.worldbuilder_core","category":"system","sourceFile":"js/worldbuilder_core.js","companionCss":"css/worldbuilder_core.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
