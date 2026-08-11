/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function(global){"use strict";const WF=global.WorldBuilder;
const TYPES=["limestone cavern", "lava tube", "crystal grotto", "karst undercity", "deep fault chamber", "sea cave"], DESCRIPTIONS=["branching chambers linked to the surface by mapped shafts", "an industrial cavern with rail lifts, ventilation and pressure doors", "a wet cave system following folded ancient limestone", "a deep refuge built around geothermal steam vents"];
WF.registerModule("caves_caverns",{label:"Caves & Caverns",category:"subsurface",order:20,apply(ctx){
 const count=9+Math.floor(ctx.options.relief/12); const made=[];
 for(let i=0;i<count;i++){ const p=ctx.randomCoordinate((p)=>(p.elevationM>180)); const type=TYPES[Math.floor(ctx.rng()*TYPES.length)];
   made.push(ctx.addFeature("subsurface",{type,lon:+p.lon.toFixed(4),lat:+p.lat.toFixed(4),elevationM:Math.round(p.elevationM),description:DESCRIPTIONS[Math.floor(ctx.rng()*DESCRIPTIONS.length)]})); }

 return {count:made.length};
}});
})(window);

;/* WorldBuilder immersive detail profile */
(function(global){"use strict";var profile={"id": "caves_caverns", "category": "subsurface", "description": "Caves, caverns, lava tubes, aquifers, underground settlements, and connected depth layers", "capabilities": ["caves", "lava tubes", "aquifers", "subsurface routes", "underground settlements"], "qualityTiers": ["balanced", "high", "ultra"], "accessModel": "front-facing-authoring"};var WF=global.WorldBuilder=global.WorldBuilder||{};WF.ModuleDetailProfiles=WF.ModuleDetailProfiles||{};WF.ModuleDetailProfiles[profile.id]=profile;profile.sample=function(seed,index){var x=((Number(seed)||1)+(Number(index)||0)*2654435761)>>>0;x=(x^x>>>16)*2246822519>>>0;x=(x^x>>>13)*3266489917>>>0;return ((x^x>>>16)>>>0)/4294967295;};profile.describe=function(){return profile.description+" Capabilities: "+profile.capabilities.join(", ")+".";};profile.sceneState=function(intensity){intensity=Math.max(0,Math.min(1,(intensity==null?0.75:Number(intensity))));return {module:profile.id,category:profile.category,intensity:intensity,particles:Math.round(40+intensity*260),detailRadius:Math.round(250+intensity*4750),quality:global.WorldBuilder&&WorldBuilder.Immersion?WorldBuilder.Immersion.qualityProfile().level:"high"};};if(WF.Immersion)WF.Immersion.register(profile.id,profile);else global.addEventListener("worldbuilder:immersion-ready",function(){if(WF.Immersion)WF.Immersion.register(profile.id,profile);},{once:true});})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.caves_caverns","category":"terrain","sourceFile":"js/caves_caverns.js","companionCss":"css/caves_caverns.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
