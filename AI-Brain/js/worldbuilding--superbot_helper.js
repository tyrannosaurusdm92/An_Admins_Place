/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-c. */
(function (global) {
  'use strict';
  var H = global.WorldBuilderSuperbotHelper = global.WorldBuilderSuperbotHelper || {};
  var ENDPOINT = global.WorldBuilder_BACKEND_URL;

  function normalize(value) { return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  function hash(value) { var h = 2166136261; for (var i = 0; i < String(value).length; i += 1) { h ^= String(value).charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rngFor(seed) { var a = hash(seed); return function () { a += 0x6D2B79F5; var t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function pick(rng, list) { return list[Math.floor(rng() * list.length)] || ''; }
  function cap(value) { return value ? value.charAt(0).toUpperCase() + value.slice(1) : ''; }

  var banks = {
    neutral: { onset: ['b','br','c','d','dr','f','g','h','k','l','m','n','p','r','s','t','v','w','z'], vowel: ['a','e','i','o','u','ae','ai','ea','ia','io','oa','ou'], coda: ['','n','r','s','th','l','m','nd','rn','sh','v'] },
    lyrical: { onset: ['l','m','n','r','s','v','el','al','ser','val','thal','mir'], vowel: ['a','e','i','o','u','ae','ia','iel','ora','ara','eri'], coda: ['','l','n','r','s','th','riel','wyn','vane','mere'] },
    rugged: { onset: ['br','dr','gr','kr','sk','st','th','vr','z','kh','g','r'], vowel: ['a','o','u','aa','or','ur'], coda: ['k','g','r','n','th','sk','dr','m','v','gar','dun'] },
    oceanic: { onset: ['a','h','k','l','m','n','p','r','s','t','v','wa'], vowel: ['a','e','i','o','u','ai','ao','ia','ua'], coda: ['','a','i','n','l','m','ra','kai','mo','na'] }
  };

  function localName(seed, style, suffix) {
    var rng = rngFor(seed), bank = banks[style] || banks.neutral;
    var count = 2 + Math.floor(rng() * 2), parts = [];
    for (var i = 0; i < count; i += 1) parts.push(pick(rng, bank.onset) + pick(rng, bank.vowel) + pick(rng, bank.coda));
    return cap(parts.join('').replace(/(.)\1\1+/g, '$1$1')) + (suffix ? ' ' + suffix : '');
  }

  async function api(payload) {
    if (!ENDPOINT) return { ok: false, error: 'Backend endpoint is not configured.' };
    try {
      var response = await fetch(ENDPOINT, { method: 'POST', body: new URLSearchParams({ payload: JSON.stringify(payload) }) });
      var text = await response.text();
      var data = JSON.parse(text);
      if (!data || data.ok === false) throw new Error(data && data.error || 'Backend action failed.');
      return data;
    } catch (error) {
      return { ok: false, error: error.message || String(error) };
    }
  }

  function findContinent(text) {
    var snapshot = global.WorldBuilderEditor && global.WorldBuilderEditor.getSnapshot();
    if (!snapshot) return null;
    var query = normalize(text);
    if (!query || /selected|this continent/.test(query)) return snapshot.continents.find(function (c) { return c.key === snapshot.selectedKey; }) || null;
    var exact = snapshot.continents.find(function (c) { return [c.key,c.name,c.defaultName].map(normalize).indexOf(query) >= 0; });
    if (exact) return exact;
    return snapshot.continents.slice().sort(function (a, b) { return normalize(b.name).length - normalize(a.name).length; }).find(function (c) {
      var names = [c.key,c.name,c.defaultName].map(normalize);
      return names.some(function (name) { return name && (query.indexOf(name) >= 0 || name.indexOf(query) >= 0); });
    }) || null;
  }


  function findPlanet(text) {
    var api = global.WorldBuilderGalaxy;
    var state = api && api.getState && api.getState();
    if (!state || !state.system || !state.system.planets) return null;
    var query = normalize(text);
    var planets = state.system.planets;
    var ordinal = String(text || '').match(/\b(\d+)(?:st|nd|rd|th)\s+(?:planet|world|body)?\s*from\s+(?:the\s+)?sun\b/i) || String(text || '').match(/\b(\d+)(?:st|nd|rd|th)\s+(?:planet|world|body)\b/i) || String(text || '').match(/\b(?:planet|world|body)\s+(?:number\s+)?(\d+)\b/i);
    if (ordinal) {
      var index = Math.max(0, Number(ordinal[1]) - 1);
      return planets.slice().sort(function(a,b){ return Number(a.semiMajorAxisAU)-Number(b.semiMajorAxisAU); })[index] || null;
    }
    if (/\b(selected|this|current)\s+(?:planet|world|body)\b/i.test(String(text || ''))) return planets.find(function(p){return p.id===state.selectedPlanetId;}) || planets[0] || null;
    var exact = planets.find(function (p) { return normalize(p.name) === query; });
    if (exact) return exact;
    var named = planets.slice().sort(function(a,b){return normalize(b.name).length-normalize(a.name).length;}).find(function(p){var name=normalize(p.name);return name && query.indexOf(name)>=0;});
    return named || null;
  }

  function worldContext() {
    var snapshot = global.WorldBuilderEditor && global.WorldBuilderEditor.getSnapshot();
    var climate = global.WorldBuilderClimate && global.WorldBuilderClimate.getLatest();
    return {
      title: snapshot && snapshot.title,
      frame: snapshot && snapshot.frame,
      continents: snapshot && snapshot.continents.map(function (c) { return { key: c.key, name: c.name, center: c.center, shift: [c.lonShift,c.latShift,c.rotation], overrideSource: c.overrideSource, featureCount: c.features.length }; }),
      climate: climate,
      importedBaseline: !!(snapshot && snapshot.worldBaseline),
      galaxy: global.WorldBuilderGalaxy && global.WorldBuilderGalaxy.getState ? global.WorldBuilderGalaxy.getState() : null,
      selectedPlanet: global.WorldBuilderGalaxy && global.WorldBuilderGalaxy.getSelectedPlanet ? global.WorldBuilderGalaxy.getSelectedPlanet() : null
    };
  }

  H.normalize = normalize;
  H.api = api;
  H.findContinent = findContinent;
  H.findPlanet = findPlanet;
  H.localName = localName;
  H.worldContext = worldContext;
  H.rngFor = rngFor;
}(window));

;/* WorldBuilder immersive detail profile */
(function(global){"use strict";var profile={"id": "superbot_helper", "category": "superbot", "description": "Prompt normalization, schema context, change previews, provenance, safety, and reusable command helpers", "capabilities": ["prompt parsing", "schema context", "previews", "provenance", "validation"], "qualityTiers": ["balanced", "high", "ultra"], "accessModel": "front-facing-authoring"};var WF=global.WorldBuilder=global.WorldBuilder||{};WF.ModuleDetailProfiles=WF.ModuleDetailProfiles||{};WF.ModuleDetailProfiles[profile.id]=profile;profile.sample=function(seed,index){var x=((Number(seed)||1)+(Number(index)||0)*2654435761)>>>0;x=(x^x>>>16)*2246822519>>>0;x=(x^x>>>13)*3266489917>>>0;return ((x^x>>>16)>>>0)/4294967295;};profile.describe=function(){return profile.description+" Capabilities: "+profile.capabilities.join(", ")+".";};profile.sceneState=function(intensity){intensity=Math.max(0,Math.min(1,(intensity==null?0.75:Number(intensity))));return {module:profile.id,category:profile.category,intensity:intensity,particles:Math.round(40+intensity*260),detailRadius:Math.round(250+intensity*4750),quality:global.WorldBuilder&&WorldBuilder.Immersion?WorldBuilder.Immersion.qualityProfile().level:"high"};};if(WF.Immersion)WF.Immersion.register(profile.id,profile);else global.addEventListener("worldbuilder:immersion-ready",function(){if(WF.Immersion)WF.Immersion.register(profile.id,profile);},{once:true});})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.superbot_helper","category":"superbot","sourceFile":"js/superbot_helper.js","companionCss":"css/superbot_helper.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
