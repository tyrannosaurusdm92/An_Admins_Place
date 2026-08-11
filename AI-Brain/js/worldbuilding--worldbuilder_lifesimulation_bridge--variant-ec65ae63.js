/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function (global) {
  'use strict';
  function lifeMutate(reason, fn){
    var LS=global.LifeSimulation; if(!LS||!LS.store)return;
    if(typeof LS.store.mutate==='function') return LS.store.mutate(reason,fn);
    if(typeof LS.store.update==='function') return LS.store.update(function(state){
      state.worldbuilder=state.worldbuilder||{manifest:null,viewerState:{},pinSlots:[]};
      state.bridge=state.bridge||{provenance:[]}; state.species=state.species||[]; fn(state); return state;
    });
  }

  const BRIDGE_SCHEMA = 'universal.simulator-galaxy-bridge.v1';
  const deep = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const now = () => new Date().toISOString();
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  let lastSync = null;

  function galaxy() { return global.WorldBuilderGalaxy?.getState?.() || null; }
  function life() { return global.LifeSimulation?.store?.get?.() || null; }

  function selectedPlanetRecord() {
    const state = galaxy(); if (!state) return null;
    return state.system.planets.find(p => p.id === state.selectedPlanetId) || state.system.planets[0] || null;
  }

  function climateRecord(planet) {
    const state = galaxy();
    return planet && state && global.WorldBuilderPlanetClimate ? global.WorldBuilderPlanetClimate.derivePlanet(planet, state.system.star) : null;
  }

  function createManifest() {
    const g = galaxy(); if (!g) return null;
    const planets = g.system.planets.map(planet => ({
      planetId: planet.id,
      name: planet.name,
      type: planet.type,
      order: planet.order,
      parentSystemId: g.system.id,
      orbit: {
        semiMajorAxisAU: planet.semiMajorAxisAU, eccentricity: planet.eccentricity,
        inclinationDeg: planet.inclinationDeg, orbitDirection: planet.orbitDirection,
        orbitalPeriodDays: global.WorldBuilderOrbitalMechanics?.orbitalPeriodDays?.(planet.semiMajorAxisAU, g.system.star.massSolar, planet.massEarth)
      },
      physical: { radiusEarth: planet.radiusEarth, massEarth: planet.massEarth, axialTiltDeg: planet.axialTiltDeg, rotationHours: planet.rotationHours },
      composition: deep(planet.composition), atmosphere: deep(planet.atmosphere), rings: deep(planet.rings), moonCount: planet.moons?.length || 0,
      climate: climateRecord(planet),
      era: planet.era, magicLevel: planet.magicLevel, locations: deep(planet.locations || [])
    }));
    return {
      schema: BRIDGE_SCHEMA, schemaVersion: 1, generatedAt: now(),
      projectId: g.projectId, projectName: g.projectName, genre: g.genre,
      galaxy: { name: g.projectName, systemCount: 1 },
      campaignEraRange: { minimum: 3, maximum: 10 },
      ruleset: { id: 'universal-covenant-engine', classes: 22, alignmentProfiles: 81, pantheonEntries: 22, jsonFiles: 9 },
      systems: [{ systemId: g.system.id, name: g.system.name, star: deep(g.system.star), planetIds: planets.map(p => p.planetId) }],
      planets,
      sourcePrecedence: ['protected user records', 'world or project sources', 'scoped sources', 'manual edits', 'generated defaults'],
      integrity: { protectedFieldsRetained: ['secrets', 'hidden relationships', 'private notes', 'protected state'] }
    };
  }

  function toLifeLocation(planet, location) {
    return {
      locationId: location.locationId || uid('location'),
      name: location.name || 'Unnamed location',
      type: location.type || 'location',
      category: location.type || 'location',
      status: 'active', schemaVersion: global.LifeSimulation?.CONFIG?.schemaVersion || '2.0.0',
      source: { type: location.source || 'WorldBuilder galaxy bridge', importedAt: now(), scope: { type: 'planet', id: planet.id } },
      protected: Boolean(location.protected), visibility: { workspace: true },
      classification: { genre: galaxy()?.genre || 'user-defined', era: planet.era, biome: location.biome, habitat: location.biome, tags: [planet.name, planet.type, location.access].filter(Boolean) },
      worldbuilderBinding: {
        pinId: location.pinId || `pin-${location.locationId}`, planetId: planet.id, systemId: galaxy()?.system?.id,
        layerId: 'planet-surface', confidence: 1, status: location.bindingStatus === 'open' ? 'bound' : location.bindingStatus || 'bound',
        coordinates: { longitude: location.longitude, latitude: location.latitude, elevationM: location.elevationM || 0 }, placementConstraints: { biome: location.biome, access: location.access }
      },
      description: `${location.type || 'Location'} on ${planet.name}, in ${location.biome || 'mixed terrain'}.`,
      public: { name: location.name, description: `${location.type || 'Location'} on ${planet.name}.`, services: [], goods: [], hours: null, accessibility: [location.access].filter(Boolean), rumors: [] },
      protectedData: { secrets: [], hiddenOwnership: null, illegalGoods: [], concealedFactions: [], privateNotes: '' },
      relationships: { owners: [], employees: [], residents: [], serviceLinks: [], scheduleAnchors: [] },
      schedules: [], services: [], goods: [], population: null, cultureIds: [], factionIds: [], npcIds: [],
      validation: { issues: [], exportReady: true }, createdAt: now(), modifiedAt: now()
    };
  }

  function normalizeSpeciesDraft(draft) {
    const planet = selectedPlanetRecord(), state = galaxy(), climate = climateRecord(planet);
    const speciesId = draft.speciesId || uid('species');
    return {
      speciesId, name: draft.name || 'Unnamed species', status: draft.status || 'candidate', concept: draft.concept || `Species adapted to ${planet?.name || 'an imported planet'}`,
      source: { type: 'worldbuilder-superbot-planet-draft', createdAt: now(), planetId: planet?.id }, schemaVersion: global.LifeSimulation?.CONFIG?.schemaVersion || '2.0.0',
      projectScope: { type: 'planet', id: planet?.id || null }, protected: false,
      origin: { homeworld: planet?.name || 'Unspecified', system: state?.system?.name || 'Unspecified', type: draft.origin?.type || 'evolved', migrationHistory: draft.origin?.migrationHistory || 'User-editable' },
      environment: {
        gravity: draft.environment?.gravity || `${climate?.gravityG || '?'} g`, atmosphere: draft.environment?.atmosphere || JSON.stringify(planet?.atmosphere?.composition || {}),
        pressure: draft.environment?.pressure || `${planet?.atmosphere?.pressureBar || 0} bar`, temperature: draft.environment?.temperature || `${climate?.surfaceC || '?'} °C mean`,
        radiation: draft.environment?.radiation || (planet?.magneticField > .5 ? 'magnetically shielded' : 'elevated surface radiation'), light: draft.environment?.light || `${state?.system?.star?.temperatureK || '?'} K stellar spectrum`,
        solvent: draft.environment?.solvent || ((planet?.composition?.ocean || 0) > 10 ? 'water-compatible' : 'user-defined'), terrain: draft.environment?.terrain || planet?.type || 'mixed', niche: draft.environment?.niche || 'environment-linked'
      },
      bodyPlan: {
        scale: draft.bodyPlan?.scale || 'environment-derived', symmetry: draft.bodyPlan?.symmetry || 'user-editable', limbs: draft.bodyPlan?.limbs || 'variable',
        locomotion: draft.bodyPlan?.locomotion || 'habitat-adapted', integument: draft.bodyPlan?.integument || 'environment-adapted', respiration: draft.bodyPlan?.respiration || 'atmosphere-linked',
        senses: Array.isArray(draft.bodyPlan?.senses) ? draft.bodyPlan.senses : [draft.bodyPlan?.senses || 'stellar-spectrum adapted'],
        communication: Array.isArray(draft.bodyPlan?.communication) ? draft.bodyPlan.communication : [draft.bodyPlan?.communication || 'user-defined'], lifeCycle: draft.bodyPlan?.lifeCycle || 'user-editable', lifespan: draft.bodyPlan?.lifespan || 'user-editable'
      },
      biochemistry: draft.biochemistry || { basis: 'environment-compatible', metabolism: 'environment-linked', needs: [], toxins: [], medicalCompatibility: 'requires project review', dependencies: [] },
      mind: draft.mind || { cognition: 'individual variation', memory: 'individual variation', languages: [], assistiveInterfaces: [] },
      cultures: draft.cultures || [], variants: draft.variants || [],
      playableTraits: draft.playableTraits || { major: draft.adaptations?.slice?.(0, 2) || ['Environmental adaptation'], minor: draft.adaptations?.slice?.(2, 5) || [], vulnerabilities: draft.vulnerabilities || [], equipmentInterfaces: [], systemAdapter: 'unassigned' },
      hybridization: draft.hybridization || { allowed: false, modes: [] },
      LifeSimulationHooks: draft.LifeSimulationHooks || { namePatterns: [], demographics: { weight: 1, rarity: 'user-defined' }, habitats: [planet?.type].filter(Boolean), professions: [], needs: [], schedules: [], relationships: [], accessibility: [], goodsServices: [], factions: [], plotHooks: [] },
      generation: { weight: 1, rarity: 'user-defined', enabled: false }, visibility: { workspace: true }, locks: [],
      review: { environmentalPlausibility: 'derived — review', internalConsistency: 'review', gameplayBalance: 'review', duplication: 'review', stereotypeSafety: 'review', moralEssentialism: 'pass — species does not determine morality, intelligence, profession, gender, politics, or culture' }
    };
  }

  function syncToLife(reason) {
    const g = galaxy(), LS = global.LifeSimulation;
    if (!g || !LS?.store) return { ok: false, reason: 'UniversalSimulator is not ready.' };
    const manifest = createManifest();
    LS.store.mutate(reason || 'worldbuilder-galaxy-sync', state => {
      state.project.name = g.projectName || state.project.name;
      state.project.genre = g.genre || state.project.genre;
      state.project.galaxy = { name: g.projectName, type: g.genre, notes: `${g.system.name}; ${g.system.planets.length} planets` };
      state.project.development = state.project.development || {};
      state.worldbuilder.manifest = manifest;
      state.worldbuilder.viewerState = { selectedPlanetId: g.selectedPlanetId, epochDay: g.epochDay, systemId: g.system.id, view: 'galaxy' };
      state.worldbuilder.pinSlots = [];
      const existingById = new Map((state.locations || []).map(item => [item.locationId, item]));
      for (const planet of g.system.planets) {
        for (const location of planet.locations || []) {
          const record = toLifeLocation(planet, location);
          if (existingById.has(record.locationId)) Object.assign(existingById.get(record.locationId), record, { modifiedAt: now() });
          else { state.locations.push(record); existingById.set(record.locationId, record); }
          state.worldbuilder.pinSlots.push({ pinId: record.worldbuilderBinding.pinId, locationId: record.locationId, planetId: planet.id, state: 'bound', layerId: 'planet-surface', coordinates: record.worldbuilderBinding.coordinates });
        }
      }
      state.bridge.provenance = state.bridge.provenance || [];
      state.bridge.provenance.unshift({ provenanceId: uid('prov'), at: now(), source: 'UniversalSimulator Medieval-to-Interstellar Campaign Edition', reason: reason || 'sync', manifestSchema: BRIDGE_SCHEMA });
      state.bridge.provenance = state.bridge.provenance.slice(0, 100);
    });
    LS.store.save?.(); lastSync = now();
    document.dispatchEvent(new CustomEvent('worldbuilder:bridge-sync', { detail: { manifest: deep(manifest), at: lastSync } }));
    return { ok: true, manifest };
  }

  function addSpeciesDraft(draft) {
    const LS = global.LifeSimulation; if (!LS?.store) return { ok: false, reason: 'UniversalSimulator is not ready.' };
    const record = normalizeSpeciesDraft(draft);
    if (LS.species?.saveCandidate) LS.species.saveCandidate(record);
    else LS.store.mutate('worldbuilder-species-draft', state => { const index = state.species.findIndex(s => s.speciesId === record.speciesId); if (index >= 0) state.species[index] = record; else state.species.push(record); });
    LS.store.save?.();
    return { ok: true, species: record };
  }

  function applyClimateToWorldBuilder(detail) {
    const climate = detail?.climate, planet = detail?.planet; if (!climate || !planet) return;
    try {
      localStorage.setItem('worldbuilder.galaxy.active-climate', JSON.stringify({ at: now(), planetId: planet.id, climate }));
    } catch (_) {}
    const wet = document.getElementById('world-moisture'); if (wet) { wet.value = String(Math.round(climate.humidityPct)); wet.dispatchEvent(new Event('input', { bubbles: true })); }
    const temp = document.getElementById('world-temperature'); if (temp) { temp.value = String(Math.round(climate.surfaceC)); temp.dispatchEvent(new Event('input', { bubbles: true })); }
  }

  function validateBridge() {
    const manifest = createManifest(); const issues = [];
    if (!manifest) issues.push({ severity: 'error', message: 'Galaxy state is unavailable.' });
    else {
      const ids = new Set();
      for (const planet of manifest.planets) {
        if (ids.has(planet.planetId)) issues.push({ severity: 'error', message: `Duplicate planet ID ${planet.planetId}.` }); ids.add(planet.planetId);
        const locationIds = new Set(); for (const location of planet.locations || []) { if (locationIds.has(location.locationId)) issues.push({ severity: 'error', message: `Duplicate location ID ${location.locationId} on ${planet.name}.` }); locationIds.add(location.locationId); }
      }
    }
    return { ready: !issues.some(i => i.severity === 'error'), issues, manifest };
  }

  function bind() {
    document.addEventListener('worldbuilder:species-draft', event => {
      const result = addSpeciesDraft(event.detail?.species || {});
      const toast = document.getElementById('life-toast') || document.getElementById('toast');
      if (toast && result.ok) { toast.textContent = `${result.species.name} was saved as a UniversalSimulator species candidate.`; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000); }
    });
    document.addEventListener('worldbuilder:locations-generated', () => syncToLife('planet-locations-generated'));
    document.addEventListener('worldbuilder:planet-climate-apply', event => applyClimateToWorldBuilder(event.detail));
    document.addEventListener('worldbuilder:galaxy-change', event => { if (event.detail?.reason && /import|generate|apply|delete|clone|random/i.test(event.detail.reason)) syncToLife('galaxy-change'); });
    setTimeout(() => syncToLife('initial-galaxy-bridge'), 500);
  }

  document.addEventListener('DOMContentLoaded', bind);
  global.WorldBuilderLifeBridge = { schema: BRIDGE_SCHEMA, createManifest, syncToLife, addSpeciesDraft, normalizeSpeciesDraft, validate: validateBridge, getLastSync: () => lastSync };
})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.worldbuilder_lifesimulation_bridge","category":"simulation","sourceFile":"js/worldbuilder_lifesimulation_bridge.js","companionCss":"css/worldbuilder_lifesimulation_bridge.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
