/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
(function (global) {
  "use strict";
  const LS = (global.UniversalSimulator = global.UniversalSimulator || global.LifeSimulation || {});
  global.LifeSimulation = LS; // Legacy namespace retained for imported v5 projects and bridge modules.
  const lock = global.LifeSimulation_BACKEND_LOCK || {};
  const genders = Object.freeze([
    "Agender", "Bi-Gender", "Cis-Female", "Cis-Male", "Demi-Female", "Demi-Male",
    "Gender-Flexible", "Gender-Fluid", "Gender-Less", "Neutrois", "Non-Binary",
    "Poly-Gender", "Trans-Female", "Trans-Male"
  ]);
  LS.CONFIG = Object.freeze({
    appName: "UniversalSimulator",
    schemaVersion: "8.0.0",
    stateKey: "universal.simulator.integrated.v8",
    legacyStateKeys: Object.freeze(["universal.simulator.integrated.v6", "lifesimulation.integrated.v5"]),
    dialogueStorageVersion: 2,
    backend: lock.deployment || "https://script.google.com/macros/s/AKfycbxe3P6MBofPEhPfTAaz05TWEYhScX9QgpHzBKCdwPGnvzvVoyfllu0bAghZKqHs4E3hGg/exec",
    backendLibrary: lock.library || "https://script.google.com/macros/library/d/1v06thwdjlv-j82hqHibJF3_gik7i8p9fFfK9nj0EOfi8VHhwT11jK5Eb/4",
    backendLibraryId: "1v06thwdjlv-j82hqHibJF3_gik7i8p9fFfK9nj0EOfi8VHhwT11jK5Eb",
    backendLibraryVersion: 4,
    dialogueLimits: Object.freeze({ maxMessageChars: 8000, maxContextChars: 120000, maxTurnsPerNpc: 500, maxPlayers: 24, timeoutMs: 30000 }),
    acceptedExtensions: Object.freeze(["json", "csv", "tsv", "txt", "md", "html", "htm", "pdf", "docx", "svg", "png", "jpg", "jpeg", "webp", "zip", "lifesim", "worldbuilder"]),
    precedence: Object.freeze({ generated: 10, project: 30, scoped: 50, manual: 70, locked: 100 }),
    genderIdentities: genders,
    eraMin: 3,
    eraMax: 10,
    eras: Object.freeze([
      Object.freeze({ value: 3, label: "Medieval" }),
      Object.freeze({ value: 4, label: "Renaissance / Early Modern" }),
      Object.freeze({ value: 5, label: "Industrial / Steam" }),
      Object.freeze({ value: 6, label: "Electrified / Modern" }),
      Object.freeze({ value: 7, label: "Digital / Atomic" }),
      Object.freeze({ value: 8, label: "Planetary / Orbital" }),
      Object.freeze({ value: 9, label: "Interplanetary" }),
      Object.freeze({ value: 10, label: "Spacefaring / Interstellar" })
    ]),
    eraLabels: Object.freeze({
      3: "Medieval", 4: "Renaissance / Early Modern", 5: "Industrial / Steam",
      6: "Electrified / Modern", 7: "Digital / Atomic", 8: "Planetary / Orbital",
      9: "Interplanetary", 10: "Spacefaring / Interstellar"
    }),
    developmentAxes: Object.freeze([
      "Materials & fabrication", "Energy", "Transportation", "Communications", "Medicine",
      "Computing & automation", "Robotics & synthetic life", "Biotechnology & genetic engineering",
      "Orbital capacity", "Interplanetary capacity", "Interstellar capacity", "Magic availability",
      "Magical industrialization", "Divine intervention", "Psionics", "Planar travel",
      "Supernatural ecology", "Political centralization", "Settlement density", "Education",
      "Inequality", "Ecological stewardship", "Public access"
    ]),
    tokenAssetRoot: "token_assets",
    reactionRoot: "assets/reactions/core",
    homeworldReactionRoot: "assets/reactions/expansions/universal_homeworld/schedule_visuals",
    borderRoot: "assets/token_borders"
  });

  LS.util = Object.freeze({
    uid(prefix) {
      const value = global.crypto && global.crypto.randomUUID
        ? global.crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
      return `${prefix}-${value}`;
    },
    now() { return new Date().toISOString(); },
    clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); },
    slug(value) {
      return String(value || "record").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "record";
    },
    escape(value) {
      return String(value == null ? "" : value).replace(/[&<>'"]/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
      })[character]);
    },
    hash(value) {
      let hash = 2166136261;
      const text = String(value || "");
      for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
      }
      return hash >>> 0;
    },
    seeded(seed) {
      let state = LS.util.hash(seed) || 1;
      return function random() {
        state += 0x6D2B79F5;
        let value = state;
        value = Math.imul(value ^ (value >>> 15), value | 1);
        value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
        return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
      };
    },
    pick(values, random = Math.random) {
      return values && values.length ? values[Math.floor(random() * values.length)] : null;
    },
    sample(values, count, random = Math.random) {
      const pool = [...(values || [])];
      const result = [];
      while (pool.length && result.length < count) result.push(pool.splice(Math.floor(random() * pool.length), 1)[0]);
      return result;
    },
    safeFileName(value) { return String(value || "export").replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").trim() || "export"; },
    download(name, content, type = "application/json") {
      const blob = content instanceof Blob ? content : new Blob([content], { type });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = LS.util.safeFileName(name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    },
    formatBytes(bytes) {
      if (!bytes) return "0 B";
      const units = ["B", "KB", "MB", "GB"];
      const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
      return `${(bytes / (1024 ** index)).toFixed(index ? 1 : 0)} ${units[index]}`;
    },
    debounce(callback, delay = 180) {
      let timer;
      return (...args) => { clearTimeout(timer); timer = setTimeout(() => callback(...args), delay); };
    }
  });
})(window);
