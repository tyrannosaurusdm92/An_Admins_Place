/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
(function(){
  'use strict';
  const LT=window.LifeTalk,U=LT.utils;
  let index=null,signature='';
  function serializeRecord(type,r){
    if(type==='npc')return [r.name,r.aliases,r.species,r.lineage,r.culture,r.profession,r.traits,r.public?.description,r.public?.knownFacts,r.public?.rumors,r.private?.goals,r.private?.needs,r.private?.fears,r.private?.secrets,r.dialogue?.mannerisms,r.dialogue?.vocabulary].flat(Infinity).filter(Boolean).join(' ');
    if(type==='faction')return [r.name,r.aliases,r.public?.description,r.public?.reputation,r.private?.hiddenAgenda,r.private?.secrets,r.goals,r.methods,r.resources].flat(Infinity).filter(Boolean).join(' ');
    return [r.title,r.summary,r.status,r.objectives?.map(o=>o.text),r.hiddenObjectives,r.stages?.map(s=>`${s.title} ${s.description}`),r.rewards,r.consequences].flat(Infinity).filter(Boolean).join(' ');
  }
  function build(state){
    const sig=`${state.npcs.length}:${state.factions.length}:${state.quests.length}:${state.project.modifiedAt||''}:${state.npcs.map(n=>n.provenance?.modifiedAt).join('|')}`;if(index&&sig===signature)return index;signature=sig;
    const docs=[];for(const n of state.npcs)docs.push({id:`npc:${n.npcId}`,type:'npc',recordId:n.npcId,name:n.name,text:serializeRecord('npc',n)});for(const f of state.factions)docs.push({id:`faction:${f.factionId}`,type:'faction',recordId:f.factionId,name:f.name,text:serializeRecord('faction',f)});for(const q of state.quests)docs.push({id:`quest:${q.questId}`,type:'quest',recordId:q.questId,name:q.title,text:serializeRecord('quest',q)});
    if(window.MiniSearch){index=new MiniSearch({fields:['name','text'],storeFields:['type','recordId','name','text'],searchOptions:{boost:{name:3},fuzzy:.22,prefix:true,combineWith:'AND'}});index.addAll(docs);}else index={search(query){const terms=String(query).toLowerCase().split(/\W+/).filter(Boolean);return docs.map(d=>({...d,score:terms.reduce((s,t)=>s+(d.text.toLowerCase().includes(t)?1:0),0)})).filter(d=>d.score).sort((a,b)=>b.score-a.score);}};return index;
  }
  function query(text,state,options={}){const idx=build(state);const limit=options.limit||12;let results=[];try{results=idx.search(String(text||''),{fuzzy:.25,prefix:true});}catch{results=idx.search(String(text||''));}return results.slice(0,limit).map(r=>({...r,text:U.truncate(r.text,900)}));}
  function relatedForNpc(npc,state,messages=[]){
    const factionSet=new Set(npc.factionIds||[]),questSet=new Set(npc.questIds||[]);const factions=state.factions.filter(f=>factionSet.has(f.factionId)||f.memberNpcIds?.includes(npc.npcId)||f.leaderNpcIds?.includes(npc.npcId));const quests=state.quests.filter(q=>questSet.has(q.questId)||q.giverNpcIds?.includes(npc.npcId));const text=messages.map(m=>m.text).join(' ');const discovered=query(text,state,{limit:10});for(const hit of discovered){if(hit.type==='faction'&&!factions.some(f=>f.factionId===hit.recordId)){const f=state.factions.find(x=>x.factionId===hit.recordId);if(f)factions.push(f);}if(hit.type==='quest'&&!quests.some(q=>q.questId===hit.recordId)){const q=state.quests.find(x=>x.questId===hit.recordId);if(q)quests.push(q);}}
    return {factions,quests,hits:discovered};
  }
  LT.register('search',{build,query,relatedForNpc,serializeRecord});
})();
