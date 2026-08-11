/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-c. */
(function(global){"use strict";const WF=global.WorldBuilder;
const TYPES=["beach-grass-water mosaic", "beach-reef-water complex", "tree canopy and forest floor", "farming-forest-grassland mosaic", "marsh-upland transition", "volcanic coast forest"], DESCRIPTIONS=["blended ecotone generated from neighboring physical systems", "multi-level habitat supporting land, water and elevated construction", "coastal transition with beaches, reefs, wetlands and higher ground", "managed mosaic in which farming and natural habitat interlock"];
WF.registerModule("hybrids",{label:"Hybrid Environments",category:"biome",order:63,apply(ctx){
 const count=14+Math.floor(ctx.options.fantasy/14); const made=[];
 for(let i=0;i<count;i++){ const p=ctx.randomCoordinate((p)=>(p.elevationM>-80 && p.elevationM<1200)); const type=TYPES[Math.floor(ctx.rng()*TYPES.length)];
   made.push(ctx.addFeature("biome",{type,lon:+p.lon.toFixed(4),lat:+p.lat.toFixed(4),elevationM:Math.round(p.elevationM),description:DESCRIPTIONS[Math.floor(ctx.rng()*DESCRIPTIONS.length)]})); }

 return {count:made.length};
}});
})(window);

;/* WorldBuilder immersive detail profile */
(function(global){"use strict";var profile={"id": "hybrids", "category": "terrain", "description": "Natural transition biomes combining coast, forest, reef, farming, grassland, wetland, and elevation", "capabilities": ["ecotones", "beach grass", "reef coast", "forest farms", "vertical layering"], "qualityTiers": ["balanced", "high", "ultra"], "accessModel": "front-facing-authoring"};var WF=global.WorldBuilder=global.WorldBuilder||{};WF.ModuleDetailProfiles=WF.ModuleDetailProfiles||{};WF.ModuleDetailProfiles[profile.id]=profile;profile.sample=function(seed,index){var x=((Number(seed)||1)+(Number(index)||0)*2654435761)>>>0;x=(x^x>>>16)*2246822519>>>0;x=(x^x>>>13)*3266489917>>>0;return ((x^x>>>16)>>>0)/4294967295;};profile.describe=function(){return profile.description+" Capabilities: "+profile.capabilities.join(", ")+".";};profile.sceneState=function(intensity){intensity=Math.max(0,Math.min(1,(intensity==null?0.75:Number(intensity))));return {module:profile.id,category:profile.category,intensity:intensity,particles:Math.round(40+intensity*260),detailRadius:Math.round(250+intensity*4750),quality:global.WorldBuilder&&WorldBuilder.Immersion?WorldBuilder.Immersion.qualityProfile().level:"high"};};if(WF.Immersion)WF.Immersion.register(profile.id,profile);else global.addEventListener("worldbuilder:immersion-ready",function(){if(WF.Immersion)WF.Immersion.register(profile.id,profile);},{once:true});})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.hybrids","category":"system","sourceFile":"js/hybrids.js","companionCss":"css/hybrids.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
