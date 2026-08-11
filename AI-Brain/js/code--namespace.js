/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function(){
  'use strict';
  const root = window.LifeTalk = window.LifeTalk || {};
  root.version = '1.0.0';
  root.modules = root.modules || {};
  root.register = function(name, api){ root.modules[name] = api; root[name] = api; return api; };
  root.events = new EventTarget();
  root.emit = function(type, detail){ root.events.dispatchEvent(new CustomEvent(type,{detail})); };
  root.on = function(type, listener){ root.events.addEventListener(type, listener); return ()=>root.events.removeEventListener(type,listener); };
})();
