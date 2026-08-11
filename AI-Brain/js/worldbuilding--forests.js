/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-c. */
(function(global){"use strict";const WF=global.WorldBuilder;
const TYPES=["deep forest", "partial forest", "rainforest", "treetop settlement forest", "marsh forest", "swamp woodland", "conifer-fern forest"], DESCRIPTIONS=["dense primeval woodland with layered canopy and giant ferns", "working forest crossed by narrow-gauge rail and elevated walkways", "humid rainforest with river and swamp mosaics", "treehouse-capable canopy biome with realistic roots, soils and drainage"];
WF.registerModule("forests",{label:"Forests",category:"biome",order:62,apply(ctx){
 const count=17+Math.floor(ctx.options.fantasy/10); const made=[];
 for(let i=0;i<count;i++){ const p=ctx.randomCoordinate((p)=>(p.elevationM>-20 && p.elevationM<1800)); const type=TYPES[Math.floor(ctx.rng()*TYPES.length)];
   made.push(ctx.addFeature("biome",{type,lon:+p.lon.toFixed(4),lat:+p.lat.toFixed(4),elevationM:Math.round(p.elevationM),description:DESCRIPTIONS[Math.floor(ctx.rng()*DESCRIPTIONS.length)]})); }

 return {count:made.length};
}});
})(window);

;/* WorldBuilder immersive detail profile */
(function(global){"use strict";var profile={"id": "forests", "category": "terrain", "description": "Deep forests, partial forests, rainforests, treetop settlements, wetlands, canopy, and succession", "capabilities": ["canopy", "understory", "treetop settlements", "succession", "wet forests"], "qualityTiers": ["balanced", "high", "ultra"], "accessModel": "front-facing-authoring"};var WF=global.WorldBuilder=global.WorldBuilder||{};WF.ModuleDetailProfiles=WF.ModuleDetailProfiles||{};WF.ModuleDetailProfiles[profile.id]=profile;profile.sample=function(seed,index){var x=((Number(seed)||1)+(Number(index)||0)*2654435761)>>>0;x=(x^x>>>16)*2246822519>>>0;x=(x^x>>>13)*3266489917>>>0;return ((x^x>>>16)>>>0)/4294967295;};profile.describe=function(){return profile.description+" Capabilities: "+profile.capabilities.join(", ")+".";};profile.sceneState=function(intensity){intensity=Math.max(0,Math.min(1,(intensity==null?0.75:Number(intensity))));return {module:profile.id,category:profile.category,intensity:intensity,particles:Math.round(40+intensity*260),detailRadius:Math.round(250+intensity*4750),quality:global.WorldBuilder&&WorldBuilder.Immersion?WorldBuilder.Immersion.qualityProfile().level:"high"};};if(WF.Immersion)WF.Immersion.register(profile.id,profile);else global.addEventListener("worldbuilder:immersion-ready",function(){if(WF.Immersion)WF.Immersion.register(profile.id,profile);},{once:true});})(window);

;/* WorldBuilder companion metadata */
(function(g){"use strict";var m={"module":"js.forests","category":"system","sourceFile":"js/forests.js","companionCss":"css/forests.css","accessModel":"front-facing-authoring"};g.WorldBuilderCompanions=g.WorldBuilderCompanions||{};g.WorldBuilderCompanions[m.module]=m;if(g.dispatchEvent)g.dispatchEvent(new CustomEvent("worldbuilder:script-ready",{detail:m}));})(window);
