/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
(function(global){
'use strict';
// Compatibility-only seeded selector for encounter generation. Actual table rolls remain ActiveWorkspaceDice rolls.
if(!global.RandomEncounterDice){
  function hashString(value){let h=2166136261>>>0;for(const ch of String(value??'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
  class RNG{
    constructor(seed){this.seed=seed===undefined||seed===null||seed===''?null:hashString(seed);this.state=this.seed===null?0:(this.seed||0x6d2b79f5)}
    random(){if(this.seed===null&&global.crypto?.getRandomValues){const n=new Uint32Array(1);global.crypto.getRandomValues(n);return n[0]/4294967296}let t=this.state+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}
    int(min,max){const lo=Math.ceil(min),hi=Math.floor(max);return Math.floor(this.random()*(hi-lo+1))+lo}
    pick(items){return Array.isArray(items)&&items.length?items[this.int(0,items.length-1)]:null}
    weighted(items,weightFn){if(!items?.length)return null;const weights=items.map(x=>Math.max(0,Number(weightFn(x))||0)),total=weights.reduce((a,b)=>a+b,0);if(total<=0)return this.pick(items);let roll=this.random()*total;for(let i=0;i<items.length;i++){roll-=weights[i];if(roll<=0)return items[i]}return items.at(-1)}
    shuffle(items){const out=Array.from(items||[]);for(let i=out.length-1;i>0;i--){const j=this.int(0,i);[out[i],out[j]]=[out[j],out[i]]}return out}
  }
  global.RandomEncounterDice={RNG,hashString,compatibilityOnly:true};
}
const DEFAULT_BASE='assets/RandomEncounters/json/';
const slug=v=>String(v||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'unknown';
async function fetchJson(url,fallback={}){try{const r=await fetch(url,{cache:'no-cache'});if(!r.ok)throw new Error(`HTTP ${r.status}: ${url}`);return await r.json()}catch(err){console.warn('[RandomEncounters] Optional shared JSON unavailable:',url,err.message);return fallback}}
const arr=v=>Array.isArray(v)?v:(v==null?[]:[v]);
function normalizeClasses(rows=[]){return arr(rows).map((c,index)=>({...c,id:c.id||slug(c.name),index,label:c.name,deityName:c.deityName||c.canonicalDeity||c.deity||'',subclasses:arr(c.subclasses).map(x=>typeof x==='string'?{name:x}:x),alignment_profile:{axis_focus:c.axisFocus||c.roleTags||[]},effects:{alignmentAxes:c.axisFocus||[],coreIdentity:c.coreIdentity||c.description||'',deity:c.deityName||c.canonicalDeity||''}}))}
function normalizeRaces(rows=[]){return arr(rows).map((r,index)=>({...r,id:r.id||`race-${index+1}-${slug(r.name)}`,index,displayName:r.name,creatorCategory:r.family||r.creatorCategory||'',creatorDeity:r.creatorDeity||'',entryType:'parent-race',options:arr(r.options).map(o=>({...o,parentRaceId:r.id,parentRaceName:r.name}))}))}
function normalizeBiomes(rows=[]){return arr(rows).map((b,index)=>({...b,index,displayName:b.name,environmentTags:[b.group,b.name,...arr(b.tags)]}))}
class AlignmentSystem{
 constructor(data={}){this.data=data;this.axes=data.axes||[];this.axisIds=data.axisNames||this.axes.map(x=>x.id);this.profileAxes=data.profileAxes||this.axes.filter(x=>x.profileAxis||x.profile_axis).map(x=>x.id);this.profiles=data.profiles||[]}
 clean(scores={}){return Object.fromEntries(this.axisIds.map(id=>[id,Math.max(0,Math.min(3000,Number(scores[id]??1500)))]))}
 category(id,value){const a=this.axes.find(x=>x.id===id)||{};return value<1000?a.low:value>=2000?a.high:(a.neutral||'Neutral')}
 resolveScores(scores={}){const clean=this.clean(scores),cats=Object.fromEntries(this.axisIds.map(id=>[id,this.category(id,clean[id])])),key=this.profileAxes.map(id=>cats[id]).join(' — '),p=this.profiles.find(x=>x.profile===key)||this.profiles[0]||{id:'unregistered',name:'Unregistered Profile',description:''};return{schema:'worldbuilder.universal.alignment-instance.v4',profileId:p.id,name:p.name,profile:p.profile||key,description:p.description||'',scores:clean,axes:cats,profileLine:key,expressionLine:this.axisIds.filter(id=>!this.profileAxes.includes(id)).map(id=>`${(this.axes.find(x=>x.id===id)||{}).name||id}: ${cats[id]}`).join(' · ')}}
 normalize(value){return this.resolveScores(value?.scores||value||{})}
 influenced(value,{deity=null,classProfile=null,rng=null}={}){const base=this.normalize(value),scores={...base.scores},focus=arr(classProfile?.axisFocus||classProfile?.alignment_profile?.axis_focus||classProfile?.effects?.alignmentAxes).filter(x=>this.axisIds.includes(x));for(const axis of focus.slice(0,2)){let dir=Math.sign(scores[axis]-1500)||((rng?.random?.()??Math.random())>.5?1:-1);scores[axis]=Math.max(0,Math.min(3000,scores[axis]+dir*125))}const result=this.resolveScores(scores);return{...result,baseScores:base.scores,influences:focus.slice(0,2).map(axis=>({source:'class discipline',axis,amount:scores[axis]-base.scores[axis]})),covenantDeity:deity?.name||null,canonicalClass:classProfile?.name||null}}
 behaviorTags(value){const a=this.normalize(value).axes,t=[];if(a.altruism==='Altruistic')t.push('protective');if(a.altruism==='Selfish')t.push('self-preserving');if(a.lawfulness==='Lawful')t.push('disciplined');if(a.lawfulness==='Chaotic')t.push('unpredictable');if(a.cooperation==='Cooperative')t.push('coordinated','focus-fire');if(a.cooperation==='Combative')t.push('aggressive');if(a.honor==='Honorable')t.push('honorable');if(a.honor==='Dishonorable')t.push('deceptive','opportunistic');if(a.mercy==='Merciful')t.push('mercy-minded','accepts-surrender');if(a.mercy==='Ruthless')t.push('ruthless');if(a.restraint==='Disciplined')t.push('restrained');if(a.restraint==='Unrestrained')t.push('unrestrained');return[...new Set(t)]}
}
class GridResolver{constructor(manifest={}){this.grids=manifest.grids||manifest.profiles||[]}choose(o={}){if(!this.grids.length)return null;const large=Number(o.partySize||4)>=5||Number(o.startingDistance||30)>60,ids=large?['landscape-22x17','large-portrait-17x22-inch','seamless-3x3']:['portrait-17x22','seamless-2x2','seamless-1x1'];return this.grids.find(g=>ids.includes(g.id))||this.grids[0]}}
class DataLoader{
 constructor(basePath=DEFAULT_BASE){this.basePath=basePath;this.cache=null}
 async loadAll(){if(this.cache)return this.cache;const P=global.ActiveWorkspace_DATA;if(!P)throw new Error('ActiveWorkspace shared canonical data is not loaded.');const [ichorWeapons,config,tables,dialogueConfig,gridManifest]=await Promise.all([fetchJson(this.basePath+'ichor_weapons.json',{weapons:[]}),fetchJson(this.basePath+'encounter_config.json',{}),fetchJson(this.basePath+'encounter_tables.json',{templates:[],objectives:[]}),fetchJson(this.basePath+'npc_dialogue_config.json',{fallbackEnabled:true}),fetchJson('json/canonical_grid_profiles.json',{profiles:[]})]);
 const deities=arr(P.deities),classes=normalizeClasses(P.classes),races=normalizeRaces(P.races),biomes=normalizeBiomes(P.biomes?.all),alignmentSystem=new AlignmentSystem(P.alignment),timeSystem=global.RandomEncounterTime?new global.RandomEncounterTime.TimeSystem(P.time||{}):null,gridResolver=new GridResolver(gridManifest),byName=(rows,q)=>rows.find(x=>String(x.id).toLowerCase()===String(q).toLowerCase()||String(x.name).toLowerCase()===String(q).toLowerCase());
 this.cache={monsters:arr(P.monsters),pantheon:{deities},pantheonFull:{deities},races:{canonical_race_register:races},raceRegistry:races,biomes:{groups:P.biomes?.groups||{},all:biomes},biomeRegistry:biomes,ichorWeapons,config,tables,spells:{spells:Array.isArray(P.spells)?P.spells:Object.values(P.spells||{})},classes:{classes},classRegistry:classes,alignments:P.alignment,dialogueConfig,howToPlay:P.howToPlay||{system:{name:P.metadata?.system||P.systemIdentity?.name||'Universal Covenant Engine',version:P.metadata?.version||'4.0.0'},quickstart:P.quickstart||{},universalClassRules:P.universalClassRules||{}},timeConversion:P.time||{},alignmentSystem,timeSystem,gridResolver,gridManifest,tokenManifest:{tokens:[]},tokenCatalog:{entries:[]},source:'activeworkspace-shared',resolveDeity:q=>byName(deities,q),resolveClass:q=>byName(classes,q),resolveRace:q=>byName(races,q),resolveBiome:q=>byName(biomes,q),resolveHeritage:(a,b)=>global.ActiveWorkspaceCanon.heritage(a,b),classForDeity:d=>classes.find(c=>String(c.deityName).toLowerCase()===String(d?.name||d).toLowerCase())||null};
 if(biomes.length!==18)throw new Error('ActiveWorkspace canonical biome registry is incomplete.');if(!this.cache.monsters.length)throw new Error('ActiveWorkspace shared hostile catalog is empty.');if(deities.length!==22||classes.length!==22||P.alignment?.axes?.length!==8||P.alignment?.profiles?.length!==81)throw new Error('ActiveWorkspace canonical counts are incomplete.');return this.cache}
}
global.RandomEncounterData={DataLoader,normalizeClasses,normalizeRaces,normalizeBiomes,AlignmentSystem,GridResolver};
}(window));
if(window.RandomEncounterData){
 const Canon=window.ActiveWorkspaceCanon;
 window.RandomEncounterData.canon=Canon;
 window.RandomEncounterData.resolveRace=value=>Canon.resolveRace(value);
 window.RandomEncounterData.resolveHeritage=(a,b)=>Canon.heritage(a,b);
 window.RandomEncounterData.resolveBiome=value=>Canon.resolveBiome(value);
 window.RandomEncounterData.normalizeHostile=h=>Canon.normalizeHostile(h);
 window.RandomEncounterData.canonicalCounts=Canon.counts;
}

