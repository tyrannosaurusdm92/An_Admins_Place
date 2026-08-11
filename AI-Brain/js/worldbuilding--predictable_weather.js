/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-c. */
(function(global){"use strict";const WF=global.WorldBuilder;
const TYPES=["trade-wind belt", "seasonal monsoon", "sea-breeze cycle", "midlatitude storm track", "polar easterly"], DESCRIPTIONS=["repeating circulation feature suitable for navigation calendars", "seasonal wind regime tracked by observatories and mechanical forecast engines", "daily coastal circulation tied to solar heating", "persistent broad-scale wind field shaped by latitude and continent placement"];
WF.registerModule("predictable_weather",{label:"Predictable Weather",category:"weather",order:44,apply(ctx){
 const count=8; const made=[];
 for(let i=0;i<count;i++){ const p=ctx.randomCoordinate((p)=>(true)); const type=TYPES[Math.floor(ctx.rng()*TYPES.length)];
   made.push(ctx.addFeature("weather",{type,lon:+p.lon.toFixed(4),lat:+p.lat.toFixed(4),elevationM:Math.round(p.elevationM),description:DESCRIPTIONS[Math.floor(ctx.rng()*DESCRIPTIONS.length)]})); }

 return {count:made.length};
}});
})(window);

;/* WorldBuilder immersive detail profile */
(function(global){"use strict";var profile={"id": "predictable_weather", "category": "weather", "description": "Stable seasonal cycles, repeatable circulation, forecast confidence, and climatological normals", "capabilities": ["seasonality", "forecast confidence", "stable circulation", "normals"], "qualityTiers": ["balanced", "high", "ultra"], "accessModel": "front-facing-authoring"};var WF=global.WorldBuilder=global.WorldBuilder||{};WF.ModuleDetailProfiles=WF.ModuleDetailProfiles||{};WF.ModuleDetailProfiles[profile.id]=profile;profile.sample=function(seed,index){var x=((Number(seed)||1)+(Number(index)||0)*2654435761)>>>0;x=(x^x>>>16)*2246822519>>>0;x=(x^x>>>13)*3266489917>>>0;return ((x^x>>>16)>>>0)/4294967295;};profile.describe=function(){return profile.description+" Capabilities: "+profile.capabilities.join(", ")+".";};profile.sceneState=function(intensity){intensity=Math.max(0,Math.min(1,(intensity==null?0.75:Number(intensity))));return {module:profile.id,category:profile.category,intensity:intensity,particles:Math.round(40+intensity*260),detailRadius:Math.round(250+intensity*4750),quality:global.WorldBuilder&&WorldBuilder.Immersion?WorldBuilder.Immersion.qualityProfile().level:"high"};};if(WF.Immersion)WF.Immersion.register(profile.id,profile);else global.addEventListener("worldbuilder:immersion-ready",function(){if(WF.Immersion)WF.Immersion.register(profile.id,profile);},{once:true});})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.predictable_weather","category":"weather","sourceFile":"js/predictable_weather.js","companionCss":"css/predictable_weather.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
