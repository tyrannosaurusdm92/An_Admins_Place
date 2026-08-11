/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
(function(global){"use strict";const WF=global.WorldBuilder;
const TYPES=["frontal rain", "monsoon rainband", "drizzle coast", "orographic rain", "snow-rain mix"], DESCRIPTIONS=["moisture-bearing system fed by warm regional seas", "persistent precipitation focused by mountain slopes", "coastal rain regime intensified by tidal mixing and fog", "seasonal convergence zone with heavy but physically plausible rainfall"];
WF.registerModule("wet_weather",{label:"Wet Weather",category:"weather",order:40,apply(ctx){
 const count=7+Math.floor(ctx.options.tides/18); const made=[];
 for(let i=0;i<count;i++){ const p=ctx.randomCoordinate((p)=>(p.elevationM>-300)); const type=TYPES[Math.floor(ctx.rng()*TYPES.length)];
   made.push(ctx.addFeature("weather",{type,lon:+p.lon.toFixed(4),lat:+p.lat.toFixed(4),elevationM:Math.round(p.elevationM),description:DESCRIPTIONS[Math.floor(ctx.rng()*DESCRIPTIONS.length)]})); }

 return {count:made.length};
}});
})(window);

;/* WorldBuilder immersive detail profile */
(function(global){"use strict";var profile={"id": "wet_weather", "category": "weather", "description": "Rain bands, frontal precipitation, monsoons, snow, sleet, cloud microphysics, and runoff", "capabilities": ["rain", "snow", "monsoons", "fronts", "runoff"], "qualityTiers": ["balanced", "high", "ultra"], "accessModel": "front-facing-authoring"};var WF=global.WorldBuilder=global.WorldBuilder||{};WF.ModuleDetailProfiles=WF.ModuleDetailProfiles||{};WF.ModuleDetailProfiles[profile.id]=profile;profile.sample=function(seed,index){var x=((Number(seed)||1)+(Number(index)||0)*2654435761)>>>0;x=(x^x>>>16)*2246822519>>>0;x=(x^x>>>13)*3266489917>>>0;return ((x^x>>>16)>>>0)/4294967295;};profile.describe=function(){return profile.description+" Capabilities: "+profile.capabilities.join(", ")+".";};profile.sceneState=function(intensity){intensity=Math.max(0,Math.min(1,(intensity==null?0.75:Number(intensity))));return {module:profile.id,category:profile.category,intensity:intensity,particles:Math.round(40+intensity*260),detailRadius:Math.round(250+intensity*4750),quality:global.WorldBuilder&&WorldBuilder.Immersion?WorldBuilder.Immersion.qualityProfile().level:"high"};};if(WF.Immersion)WF.Immersion.register(profile.id,profile);else global.addEventListener("worldbuilder:immersion-ready",function(){if(WF.Immersion)WF.Immersion.register(profile.id,profile);},{once:true});})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.wet_weather","category":"weather","sourceFile":"js/wet_weather.js","companionCss":"css/wet_weather.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
