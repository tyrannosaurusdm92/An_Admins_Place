/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-c. */
/* ActiveWorkspace Random Encounters: deterministic + cryptographic dice utilities. */
(function (global) {
  'use strict';
  function hashString(value) {
    let h = 2166136261 >>> 0;
    const s = String(value ?? '');
    for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  class RNG {
    constructor(seed) {
      this.seed = seed === undefined || seed === null || seed === '' ? null : hashString(seed);
      this.state = this.seed === null ? 0 : this.seed || 0x6d2b79f5;
    }
    random() {
      if (this.seed === null && global.crypto && typeof global.crypto.getRandomValues === 'function') {
        const n = new Uint32Array(1); global.crypto.getRandomValues(n); return n[0] / 4294967296;
      }
      let t = this.state += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
    int(min, max) { const lo = Math.ceil(min); const hi = Math.floor(max); return Math.floor(this.random() * (hi - lo + 1)) + lo; }
    pick(items) { return Array.isArray(items) && items.length ? items[this.int(0, items.length - 1)] : null; }
    weighted(items, weightFn) {
      if (!items || !items.length) return null;
      const weights = items.map((x) => Math.max(0, Number(weightFn(x)) || 0));
      const total = weights.reduce((a, b) => a + b, 0);
      if (total <= 0) return this.pick(items);
      let roll = this.random() * total;
      for (let i = 0; i < items.length; i += 1) { roll -= weights[i]; if (roll <= 0) return items[i]; }
      return items[items.length - 1];
    }
    shuffle(items) {
      const arr = Array.from(items || []);
      for (let i = arr.length - 1; i > 0; i -= 1) { const j = this.int(0, i); [arr[i], arr[j]] = [arr[j], arr[i]]; }
      return arr;
    }
    d(sides) { return this.int(1, Math.max(1, Number(sides) || 1)); }
    roll(expr) {
      const source = String(expr || '0').replace(/\s+/g, '');
      const terms = source.match(/[+-]?[^+-]+/g) || [];
      let total = 0; const dice = [];
      terms.forEach((term) => {
        const sign = term.startsWith('-') ? -1 : 1;
        const body = term.replace(/^[+-]/, '');
        const match = body.match(/^(\d*)d(\d+)$/i);
        if (match) {
          const count = Number(match[1] || 1); const sides = Number(match[2]);
          for (let i = 0; i < count; i += 1) { const value = this.d(sides); dice.push({ sides, value, sign }); total += sign * value; }
        } else if (/^\d+$/.test(body)) total += sign * Number(body);
      });
      return { expression: source, total, dice };
    }
  }
  global.RandomEncounterDice = { RNG, hashString };
}(typeof window !== 'undefined' ? window : globalThis));
