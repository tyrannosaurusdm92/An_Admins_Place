/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
(function(global){"use strict";const WF=global.WorldBuilder;
const TYPES=["abyssal plain", "ocean trench", "icy depth pocket", "hydrothermal field", "underwater volcano", "submarine canyon", "brine basin"], DESCRIPTIONS=["deep-sea province modeled with pressure, darkness and cold-water circulation", "tectonically active floor crossed by submersible routes", "biologically rich vent field supporting chemosynthetic ecosystems", "hadal terrain with gradual slopes, scarps and sediment fans rather than spikes"];
WF.registerModule("abyssal_water",{label:"Abyssal Water",category:"hydrology",order:33,apply(ctx){
 const count=15+Math.floor(ctx.options.relief/9); const made=[];
 for(let i=0;i<count;i++){ const p=ctx.randomCoordinate((p)=>(p.elevationM<-2200)); const type=TYPES[Math.floor(ctx.rng()*TYPES.length)];
   made.push(ctx.addFeature("hydrology",{type,lon:+p.lon.toFixed(4),lat:+p.lat.toFixed(4),elevationM:Math.round(p.elevationM),description:DESCRIPTIONS[Math.floor(ctx.rng()*DESCRIPTIONS.length)]})); }

 return {count:made.length};
}});
})(window);

;/* WorldBuilder immersive detail profile */
(function(global){"use strict";var profile={"id": "abyssal_water", "category": "water", "description": "Abyssal plains, trenches, hadal zones, hydrothermal vents, icy depths, and seamounts", "capabilities": ["trenches", "vents", "hadal zones", "seamounts", "abyssal ecology"], "qualityTiers": ["balanced", "high", "ultra"], "accessModel": "front-facing-authoring"};var WF=global.WorldBuilder=global.WorldBuilder||{};WF.ModuleDetailProfiles=WF.ModuleDetailProfiles||{};WF.ModuleDetailProfiles[profile.id]=profile;profile.sample=function(seed,index){var x=((Number(seed)||1)+(Number(index)||0)*2654435761)>>>0;x=(x^x>>>16)*2246822519>>>0;x=(x^x>>>13)*3266489917>>>0;return ((x^x>>>16)>>>0)/4294967295;};profile.describe=function(){return profile.description+" Capabilities: "+profile.capabilities.join(", ")+".";};profile.sceneState=function(intensity){intensity=Math.max(0,Math.min(1,(intensity==null?0.75:Number(intensity))));return {module:profile.id,category:profile.category,intensity:intensity,particles:Math.round(40+intensity*260),detailRadius:Math.round(250+intensity*4750),quality:global.WorldBuilder&&WorldBuilder.Immersion?WorldBuilder.Immersion.qualityProfile().level:"high"};};if(WF.Immersion)WF.Immersion.register(profile.id,profile);else global.addEventListener("worldbuilder:immersion-ready",function(){if(WF.Immersion)WF.Immersion.register(profile.id,profile);},{once:true});})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.abyssal_water","category":"water","sourceFile":"js/abyssal_water.js","companionCss":"css/abyssal_water.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
