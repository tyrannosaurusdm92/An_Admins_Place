/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function (global) {
  'use strict';
  var form = document.getElementById('bot-form');
  var input = document.getElementById('bot-input');
  var transcript = document.getElementById('bot-transcript');

  function add(role, text) {
    if (!transcript) return;
    var node = document.createElement('div');
    node.className = 'bot-message ' + role;
    node.textContent = text;
    transcript.appendChild(node);
    transcript.scrollTop = transcript.scrollHeight;
  }

  async function submit(message) {
    add('user', message);
    add('assistant working', 'Working…');
    var working = transcript.lastElementChild;
    try {
      var result = await global.WorldBuilderSuperbotBrain.respond(message);
      working.className = 'bot-message assistant';
      working.textContent = result.reply;
    } catch (error) {
      working.className = 'bot-message assistant error';
      working.textContent = 'Superbot error: ' + (error.message || String(error));
    }
    transcript.scrollTop = transcript.scrollHeight;
  }

  if (form && input) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var message = input.value.trim();
      if (!message) return;
      input.value = '';
      submit(message);
    });
    input.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); form.requestSubmit(); }
    });
  }

  global.WorldBuilderSuperbot = { submit: submit, addMessage: add };
}(window));

;/* WorldBuilder immersive detail profile */
(function(global){"use strict";var profile={"id": "superbot_main_functions", "category": "superbot", "description": "Conversation interface, proposal lifecycle, command history, approval boundaries, and error recovery", "capabilities": ["conversation", "proposal lifecycle", "history", "approval", "recovery"], "qualityTiers": ["balanced", "high", "ultra"], "accessModel": "front-facing-authoring"};var WF=global.WorldBuilder=global.WorldBuilder||{};WF.ModuleDetailProfiles=WF.ModuleDetailProfiles||{};WF.ModuleDetailProfiles[profile.id]=profile;profile.sample=function(seed,index){var x=((Number(seed)||1)+(Number(index)||0)*2654435761)>>>0;x=(x^x>>>16)*2246822519>>>0;x=(x^x>>>13)*3266489917>>>0;return ((x^x>>>16)>>>0)/4294967295;};profile.describe=function(){return profile.description+" Capabilities: "+profile.capabilities.join(", ")+".";};profile.sceneState=function(intensity){intensity=Math.max(0,Math.min(1,(intensity==null?0.75:Number(intensity))));return {module:profile.id,category:profile.category,intensity:intensity,particles:Math.round(40+intensity*260),detailRadius:Math.round(250+intensity*4750),quality:global.WorldBuilder&&WorldBuilder.Immersion?WorldBuilder.Immersion.qualityProfile().level:"high"};};if(WF.Immersion)WF.Immersion.register(profile.id,profile);else global.addEventListener("worldbuilder:immersion-ready",function(){if(WF.Immersion)WF.Immersion.register(profile.id,profile);},{once:true});})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.superbot_main_functions","category":"superbot","sourceFile":"js/superbot_main_functions.js","companionCss":"css/superbot_main_functions.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
