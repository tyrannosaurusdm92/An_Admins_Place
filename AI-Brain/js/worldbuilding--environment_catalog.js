/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function (global) {
  'use strict';
  var E = global.WorldBuilderEnvironment = global.WorldBuilderEnvironment || {};
  E.catalog = Object.freeze({
    caves: ['limestone cavern','lava tube','crystal grotto','karst undercity','deep fault chamber','sea cave'],
    shallowWater: ['stream','canal','pond','swamp','marsh','tidal creek','oxbow','reed lake'],
    mediumWater: ['lake','river','delta','estuary','reservoir','braided channel'],
    deepWater: ['bay','lagoon','gulf','sound','strait','fjord','reef passage'],
    abyssalWater: ['abyssal plain','ocean trench','icy depth pocket','hydrothermal field','underwater volcano','submarine canyon','brine basin'],
    wetWeather: ['frontal rain','monsoon rainband','drizzle coast','orographic rain','snow-rain mix'],
    dryWeather: ['continental dry spell','rain-shadow wind','dust front','dry thunderstorm','subtropical subsidence'],
    humidWeather: ['equatorial humidity plume','coastal fog belt','steam haze','mangrove humidity','jungle convection'],
    variableWeather: ['cutoff low','wandering convergence line','compound-tide squall','polar maritime burst','volcanic ash-weather interaction'],
    predictableWeather: ['trade-wind belt','seasonal monsoon','sea-breeze cycle','midlatitude storm track','polar easterly'],
    severeWeather: ['tropical cyclone','extratropical cyclone','derecho','hail supercell','storm surge','flash-flood complex'],
    terrain: ['plain','savanna','steppe','river plain','plateau','mountain range','volcanic arc','forest','rainforest','mangrove','peatland','hybrid biome'],
    transit: ['footpath','caravan','canal barge','rail','ferry','steamship','submarine','airship','portal','orbital shuttle']
  });
  E.pick = function (category, rng) { var bank = E.catalog[category] || []; return bank.length ? bank[Math.floor((rng || Math.random)() * bank.length)] : ''; };
  E.tideState = function (day, amplification) {
    if (global.WorldBuilderCelestial && global.WorldBuilderCelestial.getTidalState) {
      var dynamic = global.WorldBuilderCelestial.getTidalState(day);
      var scale = amplification == null ? 0.72 : Number(amplification);
      var first = dynamic.components && dynamic.components[0];
      var second = dynamic.components && dynamic.components[1];
      return Object.assign({}, dynamic, {
        moon: first ? first.phase : 0,
        moonlet: second ? second.phase : 0,
        heightFactor: 1 + (dynamic.heightFactor - 1) * scale,
        moonCount: dynamic.components ? dynamic.components.length : 0
      });
    }
    var moon = (((day % 19.2) + 19.2) % 19.2) / 19.2;
    var moonlet = (((day % 2.02) + 2.02) % 2.02) / 2.02;
    var alignment = (Math.cos(moon * Math.PI * 2) + 0.38 * Math.cos(moonlet * Math.PI * 2)) / 1.38;
    return { moon: moon, moonlet: moonlet, moonCount: 2, alignment: alignment, heightFactor: 1 + alignment * 0.42 * (amplification == null ? 0.72 : amplification), label: alignment > 0.55 ? 'compound spring tide' : (alignment < -0.45 ? 'compound neap tide' : 'mixed lunar beat') };
  };
}(window));

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.environment_catalog","category":"system","sourceFile":"js/environment_catalog.js","companionCss":"css/environment_catalog.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
