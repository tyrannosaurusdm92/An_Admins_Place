/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
(function(global){"use strict";const WF=global.WorldBuilder;
const TYPES=["bay", "lagoon", "gulf", "sound", "strait", "fjord", "reef passage"], DESCRIPTIONS=["shelf-water basin with strong two-moon currents", "deep coastal indentation used by ironclads and floating docks", "reef-edged waterway with hazardous tidal standing waves", "storm-sheltered basin connected to the world ocean"];
WF.registerModule("deep_water",{label:"Deep Water",category:"hydrology",order:32,apply(ctx){
 const count=11+Math.floor(ctx.options.tides/13); const made=[];
 for(let i=0;i<count;i++){ const p=ctx.randomCoordinate((p)=>(p.elevationM<-20 && p.elevationM>-1800)); const type=TYPES[Math.floor(ctx.rng()*TYPES.length)];
   made.push(ctx.addFeature("hydrology",{type,lon:+p.lon.toFixed(4),lat:+p.lat.toFixed(4),elevationM:Math.round(p.elevationM),description:DESCRIPTIONS[Math.floor(ctx.rng()*DESCRIPTIONS.length)]})); }

 return {count:made.length};
}});
})(window);

;/* WorldBuilder immersive detail profile */
(function(global){"use strict";var profile={"id": "deep_water", "category": "water", "description": "Bays, lagoons, gulfs, sounds, shelf seas, straits, and deep coastal circulation", "capabilities": ["bays", "lagoons", "gulfs", "straits", "shelf circulation"], "qualityTiers": ["balanced", "high", "ultra"], "accessModel": "front-facing-authoring"};var WF=global.WorldBuilder=global.WorldBuilder||{};WF.ModuleDetailProfiles=WF.ModuleDetailProfiles||{};WF.ModuleDetailProfiles[profile.id]=profile;profile.sample=function(seed,index){var x=((Number(seed)||1)+(Number(index)||0)*2654435761)>>>0;x=(x^x>>>16)*2246822519>>>0;x=(x^x>>>13)*3266489917>>>0;return ((x^x>>>16)>>>0)/4294967295;};profile.describe=function(){return profile.description+" Capabilities: "+profile.capabilities.join(", ")+".";};profile.sceneState=function(intensity){intensity=Math.max(0,Math.min(1,(intensity==null?0.75:Number(intensity))));return {module:profile.id,category:profile.category,intensity:intensity,particles:Math.round(40+intensity*260),detailRadius:Math.round(250+intensity*4750),quality:global.WorldBuilder&&WorldBuilder.Immersion?WorldBuilder.Immersion.qualityProfile().level:"high"};};if(WF.Immersion)WF.Immersion.register(profile.id,profile);else global.addEventListener("worldbuilder:immersion-ready",function(){if(WF.Immersion)WF.Immersion.register(profile.id,profile);},{once:true});})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.deep_water","category":"water","sourceFile":"js/deep_water.js","companionCss":"css/deep_water.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
