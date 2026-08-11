/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-c. */
(function (global) {
  'use strict';
  function q(id) { return document.getElementById(id); }
  function activatePage(pageId) {
    var target = pageId || 'galaxy';
    document.querySelectorAll('.page').forEach(function (page) {
      page.classList.toggle('active', page.id === 'page-' + target);
    });
    document.querySelectorAll('[data-page]').forEach(function (button) {
      var active = button.getAttribute('data-page') === target;
      button.classList.toggle('active', active);
      button.setAttribute('aria-current', active ? 'page' : 'false');
    });
    document.body.setAttribute('data-workspace-page', target);
    global.dispatchEvent(new CustomEvent('worldbuilder:page-change', { detail: { page: target, access: 'front-facing-authoring' } }));
  }
  function applyEditorWorkspace() {
    document.body.classList.add('editor-workspace');
    document.body.setAttribute('data-access-model', 'front-facing-authoring');
    document.querySelectorAll('.editor-controls').forEach(function (el) { el.hidden = false; });
    var chip = q('modeChip');
    if (chip) chip.textContent = 'Editor workspace';
  }
  function bindMainNavigation() {
    document.querySelectorAll('[data-page]').forEach(function (button) {
      button.addEventListener('click', function () { activatePage(button.getAttribute('data-page')); });
    });
  }
  function bindHeader() {
    var reset = q('reset-world');
    if (reset) reset.addEventListener('click', function () {
      global.dispatchEvent(new CustomEvent('worldbuilder:reset-request'));
    });
  }
  function bindKeyboard() {
    document.addEventListener('keydown', function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        var prompt = q('bot-input') || q('superbotPrompt');
        var dock = q('global-superbot-dock'), toggle = q('superbot-dock-toggle');
        if (dock && !dock.classList.contains('open') && toggle) toggle.click();
        if (prompt) prompt.focus();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        var save = q('saveBtn'); if (save) save.click();
      }
    });
  }
  function boot() {
    bindMainNavigation(); bindHeader(); bindKeyboard(); applyEditorWorkspace();
    var active = document.querySelector('[data-page].active');
    activatePage(active ? active.getAttribute('data-page') : 'galaxy');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  global.WorldBuilderGalaxyNavigation = { activatePage: activatePage, applyEditorWorkspace: applyEditorWorkspace, accessModel: 'front-facing-authoring' };
}(window));

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.galaxy_navigation","category":"space","sourceFile":"js/galaxy_navigation.js","companionCss":"css/galaxy_navigation.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
