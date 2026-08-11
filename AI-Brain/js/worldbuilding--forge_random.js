/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
(function(global){"use strict";
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function seedHash() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(seed) {
  return function random() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createRng(seedText) {
  const seedFactory = xmur3(String(seedText));
  return mulberry32(seedFactory());
}

function randomBetween(rng, min, max) {
  return min + (max - min) * rng();
}

function randomInt(rng, min, maxInclusive) {
  return Math.floor(randomBetween(rng, min, maxInclusive + 1));
}

function pick(rng, values) {
  return values[Math.floor(rng() * values.length) % values.length];
}

function shuffle(rng, values) {
  const out = [...values];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const onset = [
  "Aer", "Aeth", "Bel", "Bryn", "Cael", "Cyr", "Dra", "Eld", "Ery", "Fal", "Ghal", "Ily",
  "Kael", "Khar", "Lun", "Myr", "Nym", "Or", "Pel", "Rhae", "Syl", "Tal", "Vael", "Vor", "Zha"
];
const middle = [
  "a", "ae", "ara", "el", "en", "eri", "eth", "ia", "ion", "ora", "ori", "ryn", "the", "u", "yra"
];
const ending = [
  "dor", "dros", "fall", "gard", "heim", "ia", "ion", "mere", "ora", "os", "reach", "ria", "ryn", "th", "vale", "var", "wyn"
];

function fantasyName(rng, minParts = 2, maxParts = 3) {
  const parts = randomInt(rng, minParts, maxParts);
  let value = pick(rng, onset);
  if (parts >= 3) value += pick(rng, middle);
  value += pick(rng, ending);
  return value
    .replace(/aa/g, "a")
    .replace(/ii/g, "i")
    .replace(/yy/g, "y")
    .replace(/([a-z])\1\1/gi, "$1$1");
}

function uniqueNames(rng, count, suffixes = []) {
  const names = [];
  const seen = new Set();
  while (names.length < count) {
    const base = fantasyName(rng);
    const suffix = suffixes.length ? ` ${pick(rng, suffixes)}` : "";
    const name = `${base}${suffix}`;
    if (!seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }
  return names;
}

function hashNoise2d(x, y, seed = 0) {
  let n = Math.imul((x | 0) ^ seed, 0x27d4eb2d) ^ Math.imul((y | 0) + 0x165667b1, 0x85ebca6b);
  n ^= n >>> 15;
  n = Math.imul(n, 0x2c1b3c6d);
  n ^= n >>> 12;
  n = Math.imul(n, 0x297a2d39);
  n ^= n >>> 15;
  return (n >>> 0) / 4294967295;
}

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function valueNoise(x, y, seed = 0) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = smoothstep(x - x0);
  const ty = smoothstep(y - y0);
  const a = hashNoise2d(x0, y0, seed);
  const b = hashNoise2d(x0 + 1, y0, seed);
  const c = hashNoise2d(x0, y0 + 1, seed);
  const d = hashNoise2d(x0 + 1, y0 + 1, seed);
  const ab = a + (b - a) * tx;
  const cd = c + (d - c) * tx;
  return ab + (cd - ab) * ty;
}

function fbm(x, y, seed = 0, octaves = 5) {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let normalizer = 0;
  for (let i = 0; i < octaves; i += 1) {
    value += valueNoise(x * frequency, y * frequency, seed + i * 173) * amplitude;
    normalizer += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value / normalizer;
}

Object.assign((global.WorldBuilder.Random=global.WorldBuilder.Random||{}),{xmur3,mulberry32,createRng,randomBetween,randomInt,pick,shuffle,fantasyName,uniqueNames,hashNoise2d,valueNoise,fbm});
})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.forge_random","category":"system","sourceFile":"js/forge_random.js","companionCss":"css/forge_random.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
