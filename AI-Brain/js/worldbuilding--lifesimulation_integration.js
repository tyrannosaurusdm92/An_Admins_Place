/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function (global) {
  'use strict';
  const q = id => document.getElementById(id);
  let unsubscribe = null;

  function toast(message) {
    const el = q('toast'); if (!el) return;
    el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2800);
  }

  function updateHeader() {
    const planet = global.WorldBuilderGalaxy?.getSelectedPlanet?.();
    const state = global.LifeSimulation?.store?.get?.();
    let chip = q('lifePlanetChip');
    if (!chip && q('projectChip')) {
      chip = document.createElement('span'); chip.id = 'lifePlanetChip'; chip.className = 'status-chip';
      q('projectChip').insertAdjacentElement('afterend', chip);
    }
    if (chip) chip.textContent = planet ? `Planet: ${planet.name}` : 'No planet selected';
    if (q('projectChip') && state) q('projectChip').textContent = state.project.name;
  }

  function addSyncButton() {
    const actions = document.querySelector('.life-header-actions');
    if (!actions || q('syncGalaxyLifeBtn')) return;
    const button = document.createElement('button'); button.id = 'syncGalaxyLifeBtn'; button.className = 'button accent small'; button.type = 'button'; button.textContent = 'Sync galaxy';
    button.addEventListener('click', () => {
      const result = global.WorldBuilderLifeBridge?.syncToLife?.('manual-life-sync');
      toast(result?.ok ? 'Galaxy, planets, pin bindings, and visitable locations synchronized.' : result?.reason || 'The bridge is unavailable.');
      updateHeader();
    });
    actions.appendChild(button);
  }

  function syncSelectedPlanet() {
    const planet = global.WorldBuilderGalaxy?.getSelectedPlanet?.(), LS = global.LifeSimulation;
    if (!planet || !LS?.store) return;
    LS.store.mutate('selected-planet-scope', state => {
      state.simulation.scope = { type: 'planet', id: planet.id, name: planet.name };
      state.project.era = Number(planet.era ?? state.project.era);
      state.ui.selectedPlanetId = planet.id;
    });
    updateHeader();
  }

  function jumpToWorldBuilderLocation(location) {
    const binding = location?.worldbuilderBinding; if (!binding?.planetId) return false;
    global.WorldBuilderGalaxy?.selectPlanet?.(binding.planetId, false);
    global.WorldBuilderViewerManager?.showPage?.('galaxy');
    global.WorldBuilderGalaxy?.switchTab?.('maps');
    setTimeout(() => global.WorldBuilderPlanetMaps?.selectLocation?.(location.locationId), 120);
    return true;
  }

  function enhanceLocationCards() {
    const directory = q('locationDirectory'); if (!directory) return;
    directory.querySelectorAll('[data-location-id]').forEach(card => {
      if (card.querySelector('.wf-jump-location')) return;
      const id = card.dataset.locationId, location = global.LifeSimulation?.store?.get?.().locations.find(item => item.locationId === id);
      if (!location?.worldbuilderBinding?.planetId) return;
      const button = document.createElement('button'); button.className = 'ghost wf-jump-location'; button.type = 'button'; button.textContent = 'Open on planet map';
      button.addEventListener('click', event => { event.stopPropagation(); jumpToWorldBuilderLocation(location); }); card.appendChild(button);
    });
  }

  function bind() {
    addSyncButton(); updateHeader();
    document.addEventListener('worldbuilder:planet-selected', syncSelectedPlanet);
    document.addEventListener('worldbuilder:bridge-sync', updateHeader);
    if (global.LifeSimulation?.store?.subscribe) unsubscribe = global.LifeSimulation.store.subscribe(() => { updateHeader(); setTimeout(enhanceLocationCards, 0); });
    setTimeout(() => { syncSelectedPlanet(); enhanceLocationCards(); }, 650);
  }

  document.addEventListener('DOMContentLoaded', bind);
  global.WorldBuilderLifeIntegration = { syncSelectedPlanet, jumpToWorldBuilderLocation, refresh: updateHeader, destroy: () => unsubscribe?.() };
})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.lifesimulation_integration","category":"simulation","sourceFile":"js/lifesimulation_integration.js","companionCss":"css/lifesimulation_integration.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
