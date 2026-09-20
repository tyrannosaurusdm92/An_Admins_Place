/* Jasper Fanfiction — unified character-profile loader.
   Resolves by fandom + character, supports merged research profiles, and keeps same-name characters in different fandoms distinct. */
(function(global){'use strict';
const BASE='json/characters/';
const state={index:null,profiles:new Map(),loading:null,support:null,supportLoading:null};
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const norm=s=>String(s||'').toLowerCase().replace(/[’]/g,"'").replace(/&/g,' and ').replace(/[^a-z0-9' -]+/g,' ').replace(/\s+/g,' ').trim();
const fandomNorm=s=>{
  const n=norm(s).replace(/\s+/g,' ');
  const map={
    'avatar the last airbender':'avatar','avatar':'avatar','fallout 4':'fallout4','harry potter':'harrypotter',
    'steven universe':'stevenuniverse','hazbin hotel':'hazbinhotel','palia':'palia','coral island':'coralisland',
    'resident evil':'residentevil','fallout 76':'fallout76','marvel movies':'marvelmovies','dc movies':'dcmovies','disney movies':'disneymovies'
  };
  if(map[n])return map[n];
  for(const [k,v] of Object.entries(map))if(n.startsWith(k+' '))return n.replace(/[^a-z0-9]/g,'');
  return n.replace(/[^a-z0-9]/g,'');
};
async function fetchJson(path){const r=await fetch(path,{cache:'no-cache'});if(!r.ok)throw new Error(`Character library load failed: ${path} (${r.status})`);return r.json();}
async function loadIndex(){if(state.index)return state.index;if(!state.loading)state.loading=fetchJson(BASE+'index.json').then(x=>(state.index=x,x)).finally(()=>state.loading=null);return state.loading;}
async function loadSupportMaterials(){
  if(state.support)return clone(state.support);
  if(!state.supportLoading)state.supportLoading=Promise.all([
    fetchJson('json/materials/character-library-rules.json'),
    fetchJson('json/materials/continuation-context-template.json'),
    fetchJson('json/materials/research-character-manifest.json')
  ]).then(([rules,continuation,researchManifest])=>{
    state.support={rules,continuation,researchManifest};
    return state.support;
  }).finally(()=>state.supportLoading=null);
  return clone(await state.supportLoading);
}
async function materialCatalog(){
  const idx=await loadIndex();
  const support=await loadSupportMaterials().catch(()=>({}));
  return {
    profile_count:Number(idx?.profile_count||0),
    fandoms:Object.keys(idx?.fandom_profiles||{}),
    duplicate_policy:'fandom + fictional character identity',
    rules:support?.rules||null,
    continuation_template:support?.continuation||null,
    research_profile_count:Number(support?.researchManifest?.profile_count||0)
  };
}

async function loadProfile(id){if(state.profiles.has(id))return state.profiles.get(id);const idx=await loadIndex();const row=(idx.profiles||[]).find(x=>x.id===id);if(!row)return null;const p=await fetchJson(BASE+row.file);state.profiles.set(id,p);return p;}
function aliasRows(idx){if(Array.isArray(idx?.alias_records))return idx.alias_records;return Object.entries(idx?.aliases||{}).map(([alias,id])=>({alias,normalized:norm(alias),id,fandom_key:''}));}
function idsForContextSync({seriesKey='',fandom='',pairing='',content='',choice='',query='',profileIds=[]}={}){
  const idx=state.index;if(!idx)return[];
  const ids=new Set([...(idx.series_cast?.[seriesKey]||[]),...(Array.isArray(profileIds)?profileIds:[])]);
  const hay=norm([pairing,content,choice,query].join(' '));
  const fk=fandomNorm(fandom);
  const rows=aliasRows(idx);
  for(const row of rows){
    const a=norm(row.alias||row.normalized);
    if(!a||a.length<3||!hay.includes(a))continue;
    if(fk&&row.fandom_key&&row.fandom_key!==fk)continue;
    ids.add(row.id);
  }
  return [...ids];
}
async function ensureForContext(opts={}){await loadIndex();const ids=idsForContextSync(opts);await Promise.all(ids.map(loadProfile));return contextPacketSync(opts);}
async function search({fandom='',query='',limit=24}={}){
  const idx=await loadIndex(),fk=fandomNorm(fandom),q=norm(query);
  const scores=new Map();
  const rows=aliasRows(idx);
  for(const row of rows){
    if(fk&&row.fandom_key&&row.fandom_key!==fk)continue;
    const a=norm(row.alias||row.normalized);
    let score=0;
    if(q){
      if(a===q)score=100;
      else if(a.startsWith(q)||q.startsWith(a))score=80;
      else if(a.includes(q)||q.includes(a))score=60;
      else continue;
    } else score=20;
    scores.set(row.id,Math.max(scores.get(row.id)||0,score));
  }
  if(fk&&!q)for(const id of idx.fandom_profiles?.[fk]||[])scores.set(id,Math.max(scores.get(id)||0,15));
  const ranked=[...scores.entries()].sort((a,b)=>b[1]-a[1]).slice(0,Math.max(1,limit));
  await Promise.all(ranked.map(([id])=>loadProfile(id)));
  return ranked.map(([id,score])=>({score,profile:clone(state.profiles.get(id))})).filter(x=>x.profile);
}
function compact(p){return {
  id:p.id,name:p.name,fandom:p.fandom,provenance:p.provenance,age_status:p.age_status,adult_gate:p.adult_gate,
  identity:p.identity,personality:p.personality,voice:p.voice,capabilities:p.capabilities,relationships:p.relationships,
  appearance_and_presence:p.appearance_and_presence,generator_use:p.generator_use,jasper_interaction:p.jasper_interaction,
  retrieval:p.retrieval,merged_profile:p.merged_profile,continuation_profile:p.continuation_profile,
  research_profile:p.research_profile,sources:p.sources
};}
function contextPacketSync(opts={}){
  const ids=idsForContextSync(opts),profiles=ids.map(id=>state.profiles.get(id)).filter(Boolean);
  return {schema_version:'jasper.character-context.v2-merged',series_key:opts.seriesKey||'',fandom:opts.fandom||'',
    profile_ids:profiles.map(p=>p.id),profiles:profiles.map(compact),
    rules:[
      'Resolve identity by fandom plus character; same-name characters in different fandoms are distinct.',
      'Merged records combine Pass-3 story-facing canon constraints with expanded research rather than choosing one source.',
      'Canon character profiles constrain voice, motivations, relationships, knowledge, age era, and behavior.',
      'Authored story continuity outranks generic canon assumptions where the fic deliberately extends canon.',
      'Story-original profiles are grounded only in authored chapters; never import unrelated same-name lore.',
      'Do not flatten multiple characters into one romance, humor, sexual diction, or authority voice.',
      'All romantic/sexual participants must be explicitly adult.'
    ]};
}
function promptForPacket(packet){
  if(!packet?.profiles?.length)return'';
  return ['CHARACTER LIBRARY — active canon/continuity constraints. Duplicates have already been merged by fandom + character.',
    ...packet.profiles.map(p=>{
      const traits=p.personality?.core_traits?.join(', ')||'';
      const v=[p.voice?.register,...(p.voice?.dialogue_tendencies||[])].filter(Boolean).join('; ');
      const avoid=p.generator_use?.avoid?.join('; ')||'';
      const romance=p.jasper_interaction?.romance_writer_profile||p.research_profile?.romance_writer_profile||{};
      const brat=p.jasper_interaction?.brat_tamer_profile||p.research_profile?.brat_tamer_profile||{};
      const adult=p.jasper_interaction?.adult_intimacy_voice||p.research_profile?.adult_intimacy_voice||{};
      const after=p.jasper_interaction?.aftercare_profile||p.research_profile?.aftercare_profile||{};
      return `CHARACTER ${p.name} [${p.fandom}; ${p.provenance}]
Role: ${p.identity?.role||''}
Core traits: ${traits}
Voice: ${v}
Relationships: ${JSON.stringify(p.relationships||{})}
Story uses: ${(p.generator_use?.best_story_functions||[]).join('; ')}
Romance guidance: ${JSON.stringify(romance)}
Brat/tamer guidance: ${JSON.stringify(brat)}
Adult diction guidance: ${JSON.stringify(adult)}
Aftercare guidance: ${JSON.stringify(after)}
Avoid: ${avoid}`;
    })
  ].join('\n\n');
}
async function preloadAll(){const idx=await loadIndex();await Promise.all((idx.profiles||[]).map(x=>loadProfile(x.id)));return state.profiles.size;}
const api=Object.freeze({loadIndex,loadSupportMaterials,materialCatalog,loadProfile,ensureForContext,contextPacketSync,promptForPacket,preloadAll,search,idsForContextSync,fandomNorm,get index(){return clone(state.index)},get loadedCount(){return state.profiles.size}});
global.JasperFanfictionCharacterLibrary=api;
loadIndex().then(preloadAll).catch(()=>{});
})(typeof globalThis!=='undefined'?globalThis:window);
