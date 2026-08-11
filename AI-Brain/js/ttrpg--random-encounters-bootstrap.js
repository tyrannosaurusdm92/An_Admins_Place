/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-c. */
(function(global){
'use strict';
class RandomEncountersAPI{
 constructor(options){this.options=options||{};this.loader=new global.RandomEncounterData.DataLoader(this.options.dataBasePath);this.adapter=new global.RandomEncounterActiveWorkspace.ActiveWorkspaceAdapter(this.options.ActiveWorkspace||{});this.ready=this.loader.loadAll().then(data=>{this.data=data;this.dialogue=new global.RandomEncounterDialogue.NPCDialogueEngine({config:{...data.dialogueConfig,...(this.options.dialogue||{})},pantheon:data.pantheon});this.generator=new global.RandomEncounterGenerator.EncounterGenerator(data);this.combat=new global.RandomEncounterCombat.CombatEngine(this.adapter,{...(this.options.combat||{}),dialogueEngine:this.dialogue});return this;});}
 async generate(options){await this.ready;const supplied=options||{};return this.generator.generate({...supplied,location:supplied.location||this.adapter.getLocation(),worldTime:supplied.worldTime||this.adapter.getWorldTime()});}
 async talk(hostile,messages,context){await this.ready;return this.dialogue.respond(hostile,messages,context);}
 async mount(target){await this.ready;const root=typeof target==='string'?document.querySelector(target):target;if(!root)throw new Error('RandomEncounters mount target not found.');this.ui=new global.RandomEncountersUI.RandomEncountersUI(root,this);await this.ui.init();return this.ui;}
 configure(hooks){Object.assign(this.adapter.options,hooks||{});return this;}
}
const api=new RandomEncountersAPI(global.ActiveWorkspaceRandomEncounterConfig||{});global.ActiveWorkspaceRandomEncounters=api;const auto=()=>{const root=document.querySelector('[data-random-encounters-root],#random-encounters-root');if(root)api.mount(root).catch(e=>{root.innerHTML=`<div class="re-error"><b>RandomEncounters failed to start.</b><pre>${String(e)}</pre></div>`;console.error(e);});};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',auto);else auto();
}(window));
