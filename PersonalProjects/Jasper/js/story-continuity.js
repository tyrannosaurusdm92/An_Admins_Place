(function () {
  'use strict';
/**
 * Consolidated story-writing module generated from the user's supplied JavaScript package.
 * Source concepts preserved and refactored for a smaller five-file writing system.
 * No network backend is hard-coded here; callers may send generated request objects to their own backend.
 */

const GLOBAL = typeof globalThis !== 'undefined' ? globalThis : window;
const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
const uid = prefix => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`;
const now = () => new Date().toISOString();
const arr = v => Array.isArray(v)?v:v==null?[]:[v];

class WorldModel {
  constructor(seed={}){ this.nodes=new Map(); this.edges=[]; this.timeline=[]; this.load(seed); }
  upsert(id,type,data={}){ const key=String(id||data.id||uid(type||'node')); const prev=this.nodes.get(key)||{id:key,type:type||data.type||'entity'}; const node={...prev,...clone(data),id:key,type:type||data.type||prev.type}; this.nodes.set(key,node); return clone(node); }
  relate(from,to,relation,data={}){ const edge={id:data.id||uid('edge'),from:String(from),to:String(to),relation:String(relation||'related'),...clone(data)}; this.edges.push(edge); return clone(edge); }
  event(event={}){ const row={id:event.id||uid('event'),at:event.at??event.time??null,order:Number.isFinite(Number(event.order))?Number(event.order):this.timeline.length,...clone(event)}; this.timeline.push(row); this.timeline.sort(compareEvents); return clone(row); }
  query({type,relation,id,at}={}){ let nodes=[...this.nodes.values()]; if(type)nodes=nodes.filter(n=>n.type===type); if(id)nodes=nodes.filter(n=>n.id===id); let edges=this.edges; if(relation)edges=edges.filter(e=>e.relation===relation); let timeline=this.timeline; if(at!=null)timeline=timeline.filter(e=>comparePoint(e.at,at)<=0); return {nodes:clone(nodes),edges:clone(edges),timeline:clone(timeline)}; }
  snapshot(){ return {nodes:[...this.nodes.values()].map(clone),edges:clone(this.edges),timeline:clone(this.timeline)}; }
  load(seed={}){ for(const node of arr(seed.nodes))if(node?.id)this.nodes.set(String(node.id),clone(node)); this.edges=clone(arr(seed.edges)); this.timeline=clone(arr(seed.timeline)).sort(compareEvents); return this; }
}

function numericPoint(value){ if(typeof value==='number'&&Number.isFinite(value))return value; if(value==null||value==='')return null; const n=Date.parse(String(value)); return Number.isFinite(n)?n:null; }
function comparePoint(a,b){ const na=numericPoint(a),nb=numericPoint(b); if(na!=null&&nb!=null)return na-nb; return String(a??'').localeCompare(String(b??'')); }
function compareEvents(a,b){ const p=comparePoint(a?.at,b?.at); if(p)return p; return Number(a?.order||0)-Number(b?.order||0); }

class ContinuityBible {
  constructor(seed={}){
    this.schema='story.continuity.v2'; this.world=new WorldModel(seed.world||seed); this.canon=new Map(); this.characterStates=new Map(); this.locationStates=new Map(); this.relationships=[]; this.sceneLedger=[]; this.rules=[]; this.meta=clone(seed.meta||{});
    for(const fact of arr(seed.canon))if(fact?.key)this.canon.set(fact.key,clone(fact));
    for(const [id,state] of Object.entries(seed.characterStates||{}))this.characterStates.set(id,clone(state));
    for(const [id,state] of Object.entries(seed.locationStates||{}))this.locationStates.set(id,clone(state));
    this.relationships=clone(arr(seed.relationships)); this.sceneLedger=clone(arr(seed.sceneLedger)); this.rules=clone(arr(seed.rules));
  }
  setCanon(key,value,meta={}){ const row={key:String(key),value:clone(value),scope:meta.scope||'global',source:meta.source||'writer',locked:meta.locked!==false,createdAt:meta.createdAt||now(),updatedAt:now(),...clone(meta)}; this.canon.set(row.key,row); return clone(row); }
  getCanon(key,fallback=null){ return clone(this.canon.get(String(key))?.value??fallback); }
  addRule(rule){ const row=typeof rule==='string'?{id:uid('rule'),text:rule}:{id:rule.id||uid('rule'),...clone(rule)}; this.rules.push(row); return clone(row); }
  upsertEntity(id,type,data={}){ return this.world.upsert(id,type,data); }
  relate(from,to,type,meta={}){ const row={id:meta.id||uid('relationship'),from:String(from),to:String(to),type:String(type||'related'),reciprocalType:meta.reciprocalType||null,status:meta.status||'active',start:meta.start??null,end:meta.end??null,publicity:meta.publicity||'private',...clone(meta)}; this.relationships.push(row); this.world.relate(from,to,type,row); return clone(row); }
  stateForCharacter(id){ return clone(this.characterStates.get(String(id))||{}); }
  updateCharacter(id,patch={},event={}){ const key=String(id); const prior=this.characterStates.get(key)||{}; const next={...prior,...clone(patch),id:key,updatedAt:now()}; this.characterStates.set(key,next); if(event.record!==false)this.world.event({type:'character-state',characterId:key,changes:clone(patch),...clone(event)}); return clone(next); }
  updateLocation(id,patch={},event={}){ const key=String(id); const next={...(this.locationStates.get(key)||{}),...clone(patch),id:key,updatedAt:now()}; this.locationStates.set(key,next); if(event.record!==false)this.world.event({type:'location-state',locationId:key,changes:clone(patch),...clone(event)}); return clone(next); }
  recordScene(scene={}){ const row={id:scene.id||scene.sceneId||uid('scene'),chapterId:scene.chapterId||null,order:Number.isFinite(Number(scene.order))?Number(scene.order):this.sceneLedger.length,at:scene.at??scene.time??null,locationId:scene.locationId||null,characterIds:arr(scene.characterIds),summary:String(scene.summary||''),facts:clone(arr(scene.facts)),changes:clone(scene.changes||{}),setups:clone(arr(scene.setups)),payoffs:clone(arr(scene.payoffs)),...clone(scene)}; this.sceneLedger.push(row); this.sceneLedger.sort((a,b)=>Number(a.order||0)-Number(b.order||0)); this.world.event({id:`event_${row.id}`,type:'scene',sceneId:row.id,chapterId:row.chapterId,at:row.at,order:row.order,locationId:row.locationId,characterIds:row.characterIds,summary:row.summary}); for(const [characterId,patch] of Object.entries(row.changes?.characters||{}))this.updateCharacter(characterId,patch,{sceneId:row.id,at:row.at,order:row.order}); for(const [locationId,patch] of Object.entries(row.changes?.locations||{}))this.updateLocation(locationId,patch,{sceneId:row.id,at:row.at,order:row.order}); return clone(row); }
  characterHistory(id){ const key=String(id); return this.world.timeline.filter(e=>e.characterId===key||arr(e.characterIds).includes(key)).map(clone); }
  locationHistory(id){ const key=String(id); return this.world.timeline.filter(e=>e.locationId===key).map(clone); }
  activeRelationships(characterId,at=null){ return this.relationships.filter(r=>(r.from===characterId||r.to===characterId)&&r.status!=='ended'&&(at==null||r.start==null||comparePoint(r.start,at)<=0)&&(at==null||r.end==null||comparePoint(r.end,at)>=0)).map(clone); }
  snapshot(){ return {schema:this.schema,meta:clone(this.meta),world:this.world.snapshot(),canon:[...this.canon.values()].map(clone),characterStates:Object.fromEntries([...this.characterStates]),locationStates:Object.fromEntries([...this.locationStates]),relationships:clone(this.relationships),sceneLedger:clone(this.sceneLedger),rules:clone(this.rules)}; }
}

function normalizeSpeaker(raw){ let s=String(raw||'').trim().replace(/^the\s+/i,'').replace(/[.,!?:;"'“”]+$/g,'').trim(); if(!s)return 'Narrator'; return s.split(/\s+/).map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' '); }
const TAG_VERBS='said|asked|replied|answered|whispered|shouted|murmured|cried|added|continued|muttered|exclaimed|called|yelled|laughed|sighed|began|growled|responded|declared';
function attributionName(before,after){ const V=TAG_VERBS; const tests=[new RegExp(`^[\\s,]*(?:${V})\\s+(?:the\\s+)?([A-Za-z][A-Za-z'-]*)`,'i'),new RegExp(`^[\\s,]*(?:the\\s+)?([A-Za-z][A-Za-z'-]*)\\s+(?:${V})`,'i'),new RegExp(`(?:the\\s+)?([A-Za-z][A-Za-z'-]*)\\s+(?:${V})\\s*[,:]?\\s*$`,'i'),new RegExp(`(?:${V})\\s+(?:the\\s+)?([A-Za-z][A-Za-z'-]*)\\s*[,:]?\\s*$`,'i')]; const hit=tests.map((r,i)=> (i<2?after:before).match(r)).find(Boolean); return hit?hit[1]:null; }
function parseScript(text){ const out=[]; const src=String(text||'').replace(/\r\n/g,'\n').trim(); if(!src)return out; const paras=src.split(/\n\s*\n/).flatMap(p=>p.split(/\n/)).map(s=>s.trim()).filter(Boolean); for(const para of paras){ const sp=para.match(/^([A-Za-z][A-Za-z0-9 ._'-]{0,30}):\s+(.+)$/); if(sp&&!/^https?$/i.test(sp[1].trim())){out.push({speaker:normalizeSpeaker(sp[1]),text:sp[2].trim()});continue;} const quoteRe=/["“„]([^"“”„]+)["”]/g; let last=0,m,found=false; const segs=[]; while((m=quoteRe.exec(para))!==null){found=true;const before=para.slice(last,m.index),quote=(m[1]||'').trim(),after=para.slice(quoteRe.lastIndex);if(before.trim())segs.push({speaker:'Narrator',text:before.trim()});const name=attributionName(before,after);if(quote)segs.push({speaker:name?normalizeSpeaker(name):'Narrator',text:quote});last=quoteRe.lastIndex;} if(!found){out.push({speaker:'Narrator',text:para});continue;} const tail=para.slice(last).trim();if(tail)segs.push({speaker:'Narrator',text:tail});out.push(...segs.filter(s=>s.text)); } return out; }

function relationshipPair(from,to,type,options={}){ const a={id:options.id||uid('rel'),from:String(from),to:String(to),type:type||'related',reciprocalType:options.reciprocalType||type||'related',...clone(options)}; const b={...clone(a),id:uid('rel'),from:String(to),to:String(from),type:a.reciprocalType,reciprocalType:a.type}; a.reciprocalId=b.id;b.reciprocalId=a.id;return [a,b]; }

const StoryContinuity=Object.freeze({WorldModel,ContinuityBible,comparePoint,compareEvents,normalizeSpeaker,parseScript,relationshipPair});
GLOBAL.StoryTools=GLOBAL.StoryTools||{}; GLOBAL.StoryTools.Continuity=StoryContinuity;


/* Consolidation provenance:
 * - ai-brain-world-model.js
 * - persona-agents--relationship-engine.js
 * - worldbuilding--era-engine.js
 * - worldbuilding--homeworld-context.js
 * - worldbuilding--world_lore.js
 */


/* ===== Jasper adult-fiction continuity extensions ===== */
function ageAtStoryDate(character={}, storyDate=null){
  if(Number.isFinite(Number(character.age))) return Number(character.age);
  const y=storyDate?new Date(storyDate).getUTCFullYear():Number(character.story_year||character.storyYear||0);
  const by=Number(character.birth_year||character.birthYear||0);
  if(!y||!by) return null;
  if(character.birth_date||character.birthDate){ const b=new Date(character.birth_date||character.birthDate), d=storyDate?new Date(storyDate):new Date(Date.UTC(y,11,31)); let a=d.getUTCFullYear()-b.getUTCFullYear(); const before=(d.getUTCMonth()<b.getUTCMonth())||(d.getUTCMonth()===b.getUTCMonth()&&d.getUTCDate()<b.getUTCDate()); return a-(before?1:0); }
  return {min:y-by-1,max:y-by,ambiguous:true};
}

function validateAdultStoryWindow(participants=[], options={}){
  const min=Number(options.minimumAge||18), errors=[], resolved=[];
  const allowUnspecified=options.allowUnspecified!==false;
  for(const raw of participants){
    const c=typeof raw==='string'?{name:raw}:raw||{};
    const name=String(c.name||c.id||'unknown');
    const isJasper=name.trim().toLowerCase()==='jasper';
    const age=ageAtStoryDate(c,options.storyDate||options.story_year||options.storyYear);
    let adult=null, ambiguous=false;
    if(isJasper && (Number(c.birth_year||c.birthYear||1999)===1999 || c.adult===true)) adult=true;
    else if(typeof age==='number') adult=age>=min;
    else if(age&&typeof age==='object'){adult=age.min>=min; ambiguous=age.min<min&&age.max>=min;}
    else if(c.adult===true||c.age_verified_18_plus===true||c.adult_status==='explicitly_18_plus') adult=true;
    else if(c.adult===false||c.age_verified_18_plus===false||c.adult_status==='minor') adult=false;
    if(adult===false) errors.push({code:'UNDERAGE_EXPLICITLY_STATED',name,age});
    else if(ambiguous&&!allowUnspecified) errors.push({code:'AGE_AMBIGUOUS',name,age});
    else if(adult==null&&!allowUnspecified) errors.push({code:'UNDERAGE_OR_UNVERIFIED',name,age});
    resolved.push({name,age,adult,ambiguous,automatic_project_gate:adult==null&&allowUnspecified});
  }
  return {ok:errors.length===0,minimumAge:min,errors,resolved,allowUnspecified};
}

class IntimacyContinuityLedger {
  constructor(seed={}){ this.schema='jasper.intimacy.ledger.v3'; this.relationshipStage=seed.relationshipStage||'chemistry'; this.boundaries={ordinary_no_means_stop:true,...(seed.boundaries||{})}; this.preferences={...(seed.preferences||{})}; this.rituals=[...(seed.rituals||[])]; this.languageBySpeaker={...(seed.languageBySpeaker||{})}; this.events=[...(seed.events||[])]; this.lastConsentState=seed.lastConsentState||'not_in_scene'; }
  setStage(stage){this.relationshipStage=String(stage||this.relationshipStage);return this;}
  setBoundary(key,value=true){this.boundaries[String(key)]=value;return this;}
  setPreference(key,value=true){this.preferences[String(key)]=value;return this;}
  setSpeakerLanguage(name,profile={}){this.languageBySpeaker[String(name)]={...(this.languageBySpeaker[String(name)]||{}),...profile};return this;}
  addRitual(ritual){this.rituals.push(typeof ritual==='string'?{name:ritual}:ritual);return this;}
  record(event={}){const e={id:event.id||`intimacy_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,at:event.at||new Date().toISOString(),kind:event.kind||'continuity',...event};this.events.push(e);if(event.consentState)this.lastConsentState=event.consentState;return e;}
  canEscalate(next={}){ if(this.lastConsentState==='withdrawn'||this.lastConsentState==='stop'||this.lastConsentState==='distress') return {ok:false,reason:'consent_state_requires_deescalation'}; const order=['chemistry','flirting','boundary_conversations','testing_power_play','established_dynamic','integrated_trust']; const a=order.indexOf(this.relationshipStage), b=order.indexOf(next.requiredStage||this.relationshipStage); return {ok:b<=a||b<0,current:this.relationshipStage,required:next.requiredStage||null}; }
  snapshot(){return JSON.parse(JSON.stringify({schema:this.schema,relationshipStage:this.relationshipStage,boundaries:this.boundaries,preferences:this.preferences,rituals:this.rituals,languageBySpeaker:this.languageBySpeaker,events:this.events,lastConsentState:this.lastConsentState}));}
}

function recommendedRelationshipStage(chapter=1,total=40){ const p=Math.max(1,Number(chapter))/Math.max(1,Number(total)); if(p<=.125)return'chemistry'; if(p<=.25)return'flirting'; if(p<=.375)return'boundary_conversations'; if(p<=.5)return'testing_power_play'; if(p<=.75)return'established_dynamic'; return'integrated_trust'; }

function assertJasperContinuity(snapshot={},options={}){
  const issues=[]; const profile=options.profile||globalThis.StoryTools?.JasperWriterReference?.profile||{};
  if(profile.name!=='Jasper')issues.push({code:'JASPER_NAME_DRIFT'});
  if(profile.fictional_character!==true)issues.push({code:'FICTIONAL_STATUS_REQUIRED'});
  if(profile.birth_year!==1999)issues.push({code:'BIRTH_YEAR_DRIFT',expected:1999,actual:profile.birth_year});
  if(profile.pov!=='first_person')issues.push({code:'POV_PROFILE_DRIFT'});
  const participants=options.participants||snapshot.participants||[]; if(participants.length){const age=validateAdultStoryWindow(participants,{storyDate:options.storyDate,minimumAge:18,allowUnspecified:true});if(!age.ok)issues.push(...age.errors);}
  return {ok:issues.length===0,issues};
}


class JasperCharacterContinuityLedger {
  constructor(seed={}){
    this.schema='jasper.character.continuity.v4';
    this.appearance={race_ethnicity:'white',height:'5\'5"',build:'chubby',hair:{base_color:'red',lowlights:['brown'],highlights:['blonde']},eyes:'light green',freckles:true,...(seed.appearance||{})};
    this.personality={surface:['goofy','chaotic','witty'],core:['kind','compassionate','intelligent','well-spoken','empathic','fiercely loyal','loves hard'],hiddenWound:'self-loathing often masked with humor/chaos/sass',...(seed.personality||{})};
    this.peopleDetails={...(seed.peopleDetails||{})}; this.surprises=[...(seed.surprises||[])]; this.pushPull=[...(seed.pushPull||[])];
    this.dialogueThreads=[...(seed.dialogueThreads||[])]; this.styleContinuity=[...(seed.styleContinuity||[])]; this.openStoryThreads=[...(seed.openStoryThreads||[])];
  }
  rememberDetail(person,detail,value,meta={}){const key=String(person||'Unknown');const row={detail:String(detail||'detail'),value,sourceSceneId:meta.sceneId||null,learnedAt:meta.learnedAt||new Date().toISOString(),...meta};(this.peopleDetails[key]||(this.peopleDetails[key]=[])).push(row);return row;}
  planSurprise(person,detail,idea,meta={}){const row={id:meta.id||`surprise_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,person:String(person||'Unknown'),detail:String(detail||''),idea:String(idea||''),status:'planned',plannedChapter:meta.chapter||null,...meta};this.surprises.push(row);return row;}
  recordPushAway(meta={}){const row={kind:'push_away',trigger:meta.trigger||'self-worth spiral',mask:meta.mask||'humor/chaos/deflection',target:meta.target||null,sceneId:meta.sceneId||null,repairPending:true,...meta};this.pushPull.push(row);return row;}
  recordRepair(meta={}){const pending=[...this.pushPull].reverse().find(x=>x.kind==='push_away'&&x.repairPending);const row={kind:'repair',target:meta.target||pending?.target||null,sceneId:meta.sceneId||null,method:meta.method||'honest reconnection',...meta};if(pending){pending.repairPending=false;pending.repair=row;}this.pushPull.push(row);return row;}
  unresolvedRepairs(){return this.pushPull.filter(x=>x.kind==='push_away'&&x.repairPending).map(x=>JSON.parse(JSON.stringify(x)));}
  recordDialogueThread(meta={}){const row={id:meta.id||`dialogue_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,speakers:[...(meta.speakers||[])],openLine:meta.openLine||'',unansweredQuestion:meta.unansweredQuestion||'',subtext:meta.subtext||'',sceneId:meta.sceneId||null,status:meta.status||'open',...meta};this.dialogueThreads.push(row);return row;}
  closeDialogueThread(id,meta={}){const row=this.dialogueThreads.find(x=>x.id===id);if(!row)return null;row.status='closed';row.closedAt=meta.closedAt||new Date().toISOString();row.resolution=meta.resolution||row.resolution||'';return row;}
  recordStyleContinuity(meta={}){const row={id:meta.id||`style_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,sceneId:meta.sceneId||null,signals:[...(meta.signals||[])],voiceNotes:{...(meta.voiceNotes||{})},sensoryAnchors:[...(meta.sensoryAnchors||[])],callbacks:[...(meta.callbacks||[])],emotionalTurn:meta.emotionalTurn||'',closingImage:meta.closingImage||'',...meta};this.styleContinuity.push(row);return row;}
  openThread(text,meta={}){const row={id:meta.id||`thread_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`,text:String(text||''),kind:meta.kind||'plot',status:'open',openedChapter:meta.chapter||null,...meta};this.openStoryThreads.push(row);return row;}
  resolveThread(id,meta={}){const row=this.openStoryThreads.find(x=>x.id===id);if(!row)return null;row.status='resolved';row.resolvedChapter=meta.chapter||null;row.resolution=meta.resolution||'';return row;}
  snapshot(){return JSON.parse(JSON.stringify({schema:this.schema,appearance:this.appearance,personality:this.personality,peopleDetails:this.peopleDetails,surprises:this.surprises,pushPull:this.pushPull,dialogueThreads:this.dialogueThreads,styleContinuity:this.styleContinuity,openStoryThreads:this.openStoryThreads}));}
}

function validateJasperProfileLock(profile={}){
  const issues=[]; const a=profile.appearance||{}; const hair=a.hair||{};
  if(profile.fictional_character!==true)issues.push({code:'FICTIONAL_STATUS_REQUIRED'});
  if(profile.name!=='Jasper')issues.push({code:'JASPER_NAME_DRIFT'});
  if(Number(profile.birth_year)!==1999)issues.push({code:'BIRTH_YEAR_DRIFT'});
  if(a.race_ethnicity!=='white')issues.push({code:'APPEARANCE_RACE_DRIFT'});
  if(a.height!==`5'5"`)issues.push({code:'APPEARANCE_HEIGHT_DRIFT'});
  if(a.build!=='chubby')issues.push({code:'APPEARANCE_BUILD_DRIFT'});
  if(hair.base_color!=='red'||!Array.isArray(hair.lowlights)||!hair.lowlights.includes('brown')||!Array.isArray(hair.highlights)||!hair.highlights.includes('blonde'))issues.push({code:'APPEARANCE_HAIR_DRIFT'});
  if(a.eyes!=='light green')issues.push({code:'APPEARANCE_EYE_DRIFT'});
  if(a.freckles!==true)issues.push({code:'APPEARANCE_FRECKLE_DRIFT'});
  return {ok:issues.length===0,issues};
}

GLOBAL.StoryTools=GLOBAL.StoryTools||{}; GLOBAL.StoryTools.JasperContinuity=Object.freeze({ageAtStoryDate,validateAdultStoryWindow,IntimacyContinuityLedger,JasperCharacterContinuityLedger,recommendedRelationshipStage,assertJasperContinuity,validateJasperProfileLock});

})();
