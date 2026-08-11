/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function(global){
  "use strict"; const LS=global.LifeSimulation; const data=global.UNIVERSAL_HOMEWORLD_REACTIONS||{assets:[],coreSemanticMappings:{}};
  const assets=new Map((data.assets||[]).map(x=>[x.activityId,x])); const mappings=data.coreSemanticMappings||{};
  const lower=v=>String(v||"").toLowerCase();
  function contextFor(state,npc,block){
    const locationId=block?.locationId||npc?.simulation?.currentLocationId||npc?.workplaceLocationId||npc?.residenceLocationId;
    const location=(state?.locations||[]).find(x=>x.locationId===locationId)||{};
    const settlement=(state?.settlements||[]).find(x=>x.settlementId===(location.settlementId||npc?.settlementId))||{};
    return {...(state?.worldContext||state?.project?.worldContext||{}),...(settlement.worldContext||{}),...(location.worldContext||{}),...(block?.worldContext||{}), contextLocationId:locationId||null};
  }
  function isHomeworldSurface(context){
    context=context||{}; const disqualify=context.isOrbital||context.isMoon||context.isStation||context.isColony||context.offworld===true||["orbit","orbital","moon","station","colony","ship","asteroid","other_planet"].includes(lower(context.bodyType||context.scopeType));
    if(disqualify)return false;
    const id=lower(context.contextWorldId||context.worldId||context.planetId||context.canonicalWorldId);
    const exact=id==="universal-homeworld"||id==="universal"||id==="universal_planet";
    const surface=["planet","planet_surface","surface","homeworld"].includes(lower(context.bodyType||context.scopeType||"planet_surface"));
    return Boolean((context.isUniversalHomeworld===true||exact)&&surface);
  }
  function corePath(semanticId,state){const r=LS.reactions?.get?.(semanticId,state,true); return r?LS.reactions.iconPath(r):"";}
  function resolve({state,npc,block,semanticReactionId,activityId,explicitVisualPath,coreVisualPath}={}){
    const context=contextFor(state,npc,block); const home=isHomeworldSurface(context);
    if(explicitVisualPath)return {semanticReactionId,visualNamespace:"explicit",visualPath:explicitVisualPath,visualSource:"explicit-record-override",visualConfidence:1,contextWorldId:context.contextWorldId||context.worldId||context.planetId||null,isUniversalHomeworldSurface:home};
    const fallback=coreVisualPath||corePath(semanticReactionId,state);
    if(!home)return {semanticReactionId,visualNamespace:"core-or-context",visualPath:fallback,visualSource:"offworld-core-fallback",visualConfidence:1,contextWorldId:context.contextWorldId||context.worldId||context.planetId||null,isUniversalHomeworldSurface:false};
    const direct=assets.get(activityId); const mapped=mappings[semanticReactionId]; const chosen=direct||mapped;
    if(chosen)return {semanticReactionId,visualNamespace:"universal_homeworld",visualPath:chosen.path,visualSource:direct?"supplied-homeworld-schedule-activity":"supplied-homeworld-core-match",visualConfidence:Number(direct?1:chosen.confidence||0),homeworldActivityId:direct?.activityId||chosen.activityId,contextWorldId:context.contextWorldId||context.worldId||context.planetId||"universal-homeworld",isUniversalHomeworldSurface:true};
    return {semanticReactionId,visualNamespace:"core",visualPath:fallback,visualSource:"low-confidence-core-fallback",visualConfidence:1,contextWorldId:context.contextWorldId||context.worldId||context.planetId||"universal-homeworld",isUniversalHomeworldSurface:true};
  }
  LS.homeworldContext=Object.freeze({data,assets,mappings,contextFor,isHomeworldSurface,resolve});
})(window);