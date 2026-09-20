/* Jasper Fanfiction — full creation-source adapter.
Canon characters come from JasperFanfictionCharacterLibrary.
People+Places supplies optional original adult supporting cast, locations, relationships, routines, events and world-state tools. */
(function(global){'use strict';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const cache=new Map();
function keyFor(spec={}){
  return ['jasper-fanfic',spec.fandom,spec.title,spec.pairing,spec.premise,spec.canon_window].filter(Boolean).join('|')||'jasper-fanfic-original-support';
}
function inferModes(fandom='',text=''){
  const hay=(String(fandom)+' '+String(text)).toLowerCase();
  if(/fallout|resident evil|marvel|dc|steven universe|star|space|sci[- ]?fi|station|ship|cyber|future/.test(hay))
    return {realistic:true,scifi:true,fantasy:/marvel|dc|steven universe/.test(hay)};
  if(/avatar|harry potter|palia|hazbin|disney|magic|fantasy|kingdom|tavern|dragon/.test(hay))
    return {realistic:false,fantasy:true,scifi:false};
  return {realistic:true,fantasy:false,scifi:false};
}
function compactPerson(p){
  return {id:p.id,name:p.name?.full||[p.name?.first,p.name?.last].filter(Boolean).join(' '),age:p.life?.age,
    setting:p.settingProfile,identity:p.identity,personality:p.personality,interests:p.interests,
    physicalDescription:p.physicalDescription,workEducation:p.life?.workEducation,
    currentPlaceId:p.currentPlaceId,routine:p.routine,knowledge:p.knowledge,
    memory:Array.isArray(p.memory?.records)?p.memory.records.slice(-12):[]};
}
function compactPlace(p){
  return {id:p.id,name:p.name,kind:p.kind,mode:p.mode,genre:p.genre,category:p.category,
    geography:p.geography,descriptors:p.descriptors,accessibility:p.accessibility,ambience:p.ambience,
    assignmentKind:p.assignmentKind,defaultAssignment:p.defaultAssignment,
    residents:p.residents,workers:p.workers,students:p.students,useRoles:p.useRoles};
}
function generateWorld(spec={}){
  const P=global.PeoplePlaces;
  if(!P?.WorldGenerator?.generate)return null;
  const seed=keyFor(spec);
  if(cache.has(seed))return cache.get(seed);
  const modes=inferModes(spec.fandom,[spec.premise,spec.tone,spec.canon_window].join(' '));
  const world=P.WorldGenerator.generate(seed,{peopleCount:18,modes,personDefaults:{age:{min:18,max:80}}});
  // Hard adult filter for fanfiction support cast.
  world.people=(world.people||[]).filter(x=>Number(x.life?.age)>=18);
  cache.set(seed,world);
  return world;
}
function buildOriginalSupport(spec={}){
  const P=global.PeoplePlaces;
  const world=generateWorld(spec);
  if(!world)return null;
  const index=P?.SearchIndex?.build?.(world)||[];
  const adults=(world.people||[]).slice(0,16).map(compactPerson);
  const places=(world.places||[]).slice(0,24).map(compactPlace);
  return {
    schema:'jasper.original-support.v2-full-runtime',
    seed:world.seed||keyFor(spec),
    world_id:world.id||null,
    modes:world.settings?.modes||inferModes(spec.fandom,spec.premise),
    policy:'OPTIONAL ORIGINAL SUPPORT ONLY. Named canon characters always use the canon library. Never merge an OC into a canon character merely because names resemble one another.',
    people:adults,
    places,
    relationships:clone((world.relationships||[]).slice(0,40)),
    events:clone((world.events||[]).slice(-20)),
    search_index:index.slice(0,80),
    statistics:P?.Statistics?.world?.(world)||null,
    runtime_capabilities:[
      'culturally-aware name generation','pronouns and identity','physical descriptions','personality','interests and skills',
      'mood','life history','work and education','realistic/fantasy/scifi locations','routines','relationships','social graph',
      'memory retrieval','knowledge ledger','conversation planning and dialogue','group conversation','events','world model',
      'person generation','world generation','world simulation','command parser','search index','statistics','browser persistence','import/export'
    ]
  };
}
function searchOriginalSupport(spec={},query='',limit=12){
  const P=global.PeoplePlaces,world=generateWorld(spec);
  if(!world||!P?.SearchIndex?.build||!P?.SearchIndex?.query)return[];
  return P.SearchIndex.query(P.SearchIndex.build(world),query,limit);
}
function simulateOriginalSupport(spec={},minutes=60){
  const P=global.PeoplePlaces,world=generateWorld(spec);
  if(!world||!P?.WorldSimulator?.advance)return null;
  P.WorldSimulator.advance(world,minutes);
  return buildOriginalSupport(spec);
}
async function canonSupport(spec={}){
  const L=global.JasperFanfictionCharacterLibrary;
  if(!L?.search)return {profile_ids:[],profiles:[]};
  const candidates=[];
  const add=value=>{
    String(value||'').split(/\s*(?:\/|&|\+|\bx\b|\band\b)\s*/i).map(x=>x.trim()).filter(Boolean).forEach(x=>candidates.push(x));
  };
  add(spec.pairing);
  for(const row of (Array.isArray(spec.character_bible)?spec.character_bible:[])){
    const text=typeof row==='string'?row:(row?.name||row?.character||'');
    add(text);
  }
  const unique=[...new Set(candidates.map(x=>x.toLowerCase()))].map(low=>candidates.find(x=>x.toLowerCase()===low));
  const found=new Map();
  for(const query of unique.slice(0,16)){
    const results=await L.search({fandom:spec.fandom||'',query,limit:8}).catch(()=>[]);
    for(const item of results){
      if(item?.score>=60&&item?.profile?.id){
        const prev=found.get(item.profile.id);
        if(!prev||item.score>prev.score)found.set(item.profile.id,item);
      }
    }
  }
  // Recall fallback for unusual pairings/aliases.
  if(!found.size){
    const query=[spec.pairing,...(Array.isArray(spec.character_bible)?spec.character_bible:[])].filter(Boolean).join(' ');
    const results=await L.search({fandom:spec.fandom||'',query,limit:24}).catch(()=>[]);
    for(const item of results)if(item?.score>=60&&item?.profile?.id)found.set(item.profile.id,item);
  }
  const selected=[...found.values()].sort((a,b)=>b.score-a.score);
  return {profile_ids:selected.map(x=>x.profile.id),profiles:selected.map(x=>({
    id:x.profile.id,name:x.profile.name,fandom:x.profile.fandom,age_status:x.profile.age_status,
    adult_gate:x.profile.adult_gate,identity:x.profile.identity,personality:x.profile.personality,
    voice:x.profile.voice,relationships:x.profile.relationships,generator_use:x.profile.generator_use,
    jasper_interaction:x.profile.jasper_interaction,retrieval:x.profile.retrieval
  }))};
}
async function enrichSpec(spec={}){
  const canon=await canonSupport(spec);
  const originals=buildOriginalSupport(spec);
  return {...spec,
    character_profile_ids:Array.from(new Set([...(spec.character_profile_ids||[]),...canon.profile_ids])),
    creation_sources:{
      schema:'jasper.fanfic.creation-sources.v2-full-runtime',
      canon_characters:canon,
      original_support:originals,
      people_places_capabilities:originals?.runtime_capabilities||[],
      rules:[
        'Canon character profiles override generated-person inspiration for named canon characters.',
        'Generated people/places are optional supporting material, never mandatory cast.',
        'Do not merge generated OCs with canon characters merely because names are similar.',
        'All generated romantic/sexual participants must be adult; support people are filtered to age 18+.',
        'Preserve established canon locations; use generated locations only where canon leaves room or the premise requests an original place.',
        'Reuse this stored support world during continuation; do not regenerate a different supporting cast every chapter.'
      ]
    }
  };
}
function contextPacket(series={}){
  return clone(series.creation_sources||null);
}
global.JasperFanfictionCreationSources=Object.freeze({
  inferModes,generateWorld,buildOriginalSupport,searchOriginalSupport,simulateOriginalSupport,
  canonSupport,enrichSpec,contextPacket
});
})(typeof globalThis!=='undefined'?globalThis:window);
