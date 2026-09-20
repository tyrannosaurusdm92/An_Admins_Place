(function () {
  'use strict';
/**
 * Consolidated story-writing module generated from the user's supplied JavaScript package.
 * Source concepts preserved and refactored for a smaller five-file writing system.
 * No network backend is hard-coded here; callers may send generated request objects to their own backend.
 */

const GLOBAL = typeof globalThis !== 'undefined' ? globalThis : window;
const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
const now = () => new Date().toISOString();
const uid = prefix => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`;
const asArray = value => Array.isArray(value) ? value : value == null ? [] : [value];
const words = text => String(text || '').toLowerCase().match(/\b[\w’'-]+\b/g) || [];

class SessionMemory {
  constructor({maxTurns=24,persist=false,storage=null,key='writer-session'}={}) {
    this.maxTurns=Math.max(1,Number(maxTurns)||24); this.persist=Boolean(persist); this.storage=storage || (typeof localStorage!=='undefined'?localStorage:null); this.key=key; this.turns=[];
    if(this.persist) this.load();
  }
  add(role,text,meta={}){ this.turns.push({id:meta.id||uid('turn'),role:String(role||'user'),text:String(text||'').slice(0,24000),meta:clone(meta),at:meta.at||now()}); this.turns=this.turns.slice(-this.maxTurns); this.save(); return this.turns.at(-1); }
  clear(){ this.turns=[]; if(this.storage) try{this.storage.removeItem(this.key)}catch{} return this; }
  save(){ if(this.persist&&this.storage) try{this.storage.setItem(this.key,JSON.stringify(this.turns))}catch{} return this; }
  load(){ if(this.storage) try{const v=JSON.parse(this.storage.getItem(this.key)||'[]'); if(Array.isArray(v))this.turns=v.slice(-this.maxTurns)}catch{} return this; }
  context(limit=this.maxTurns){ return this.turns.slice(-limit).map(t=>({role:t.role,content:t.text,meta:clone(t.meta)})); }
}

class WriterMemory {
  constructor(seed={}){
    this.state={
      schema:'writer.memory.v2', project:{}, stories:{}, characters:{}, locations:{}, factions:{}, items:{}, relationships:{},
      chapters:{}, scenes:{}, beats:{}, promises:{}, callbacks:{}, facts:[], notes:[], revisions:[], preferences:{}, ...clone(seed)
    };
    this._ensure();
  }
  _ensure(){ for(const k of ['stories','characters','locations','factions','items','relationships','chapters','scenes','beats','promises','callbacks','preferences']) if(!this.state[k]||Array.isArray(this.state[k]))this.state[k]={}; for(const k of ['facts','notes','revisions']) if(!Array.isArray(this.state[k]))this.state[k]=[]; return this; }
  upsert(bucket,id,value={}){ this._ensure(); if(!this.state[bucket]||Array.isArray(this.state[bucket]))this.state[bucket]={}; const key=String(id||value.id||uid(bucket)); const prev=this.state[bucket][key]||{}; this.state[bucket][key]={...prev,...clone(value),id:key,updatedAt:now(),createdAt:prev.createdAt||value.createdAt||now()}; return clone(this.state[bucket][key]); }
  remove(bucket,id){ if(this.state[bucket]&&!Array.isArray(this.state[bucket])) delete this.state[bucket][id]; return this; }
  remember(fact,meta={}){ const item={id:meta.id||uid('fact'),fact:String(fact||'').trim(),tags:asArray(meta.tags).map(String),scope:meta.scope||'general',storyId:meta.storyId||null,chapterId:meta.chapterId||null,sceneId:meta.sceneId||null,characterIds:asArray(meta.characterIds),confidence:meta.confidence==null?1:Number(meta.confidence),source:meta.source||'writer',createdAt:meta.createdAt||now(),updatedAt:now()}; if(item.fact)this.state.facts.push(item); return clone(item); }
  note(text,meta={}){ const item={id:meta.id||uid('note'),text:String(text||''),kind:meta.kind||'note',tags:asArray(meta.tags),createdAt:now(),...clone(meta)}; this.state.notes.push(item); return clone(item); }
  rememberCharacter(character){ const id=character.id||character.characterId||uid('character'); return this.upsert('characters',id,{...character,id}); }
  rememberScene(scene){ const id=scene.id||scene.sceneId||uid('scene'); const row=this.upsert('scenes',id,{...scene,id}); for(const fact of asArray(scene.facts))this.remember(typeof fact==='string'?fact:fact.fact||JSON.stringify(fact),{scope:'scene',sceneId:id,storyId:scene.storyId,chapterId:scene.chapterId,tags:fact.tags||[]}); return row; }
  rememberPromise(promise){ const id=promise.id||uid('promise'); return this.upsert('promises',id,{status:'open',introducedAt:now(),...promise,id}); }
  resolvePromise(id,resolution={}){ const current=this.state.promises[id]||{id}; return this.upsert('promises',id,{...current,status:'resolved',resolution:clone(resolution),resolvedAt:now()}); }
  addRelationship(a,b,type,meta={}){ const ids=[String(a),String(b)].sort(); const id=meta.id||`${ids[0]}__${type||'related'}__${ids[1]}`; return this.upsert('relationships',id,{from:String(a),to:String(b),type:type||'related',...meta,id}); }
  recall(query='',options={}){
    const terms=words(query).filter(Boolean); const limit=Math.max(1,Number(options.limit||30)); const scope=options.scope||null;
    const pool=[...this.state.facts.map(x=>({...x,_bucket:'facts',_text:x.fact})),...this.state.notes.map(x=>({...x,_bucket:'notes',_text:x.text}))];
    for(const bucket of ['characters','locations','factions','items','relationships','chapters','scenes','beats','promises','callbacks']) for(const value of Object.values(this.state[bucket]||{})) pool.push({...value,_bucket:bucket,_text:JSON.stringify(value)});
    return pool.map(item=>{ const hay=String(item._text||'').toLowerCase(); const tags=asArray(item.tags).map(v=>String(v).toLowerCase()); let score=terms.reduce((n,t)=>n+(hay.includes(t)?1:0)+(tags.some(tag=>tag.includes(t))?2:0),0); if(options.storyId&&item.storyId===options.storyId)score+=2; if(options.characterId&&asArray(item.characterIds).includes(options.characterId))score+=3; return {item,score}; }).filter(r=>(!scope||r.item.scope===scope||r.item._bucket===scope)&&(r.score||!terms.length)).sort((a,b)=>b.score-a.score).slice(0,limit).map(r=>clone(r.item));
  }
  buildContext(query='',options={}){
    const recalled=this.recall(query,options); return {project:clone(this.state.project),preferences:clone(this.state.preferences),recalled,openPromises:Object.values(this.state.promises).filter(p=>p.status!=='resolved'),recentScenes:Object.values(this.state.scenes).sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||''))).slice(0,options.recentSceneLimit||8)};
  }
  merge(snapshot={}){ const other=new WriterMemory(snapshot); for(const bucket of ['stories','characters','locations','factions','items','relationships','chapters','scenes','beats','promises','callbacks','preferences']) Object.assign(this.state[bucket],clone(other.state[bucket]||{})); for(const bucket of ['facts','notes','revisions']){ const seen=new Set(this.state[bucket].map(x=>x.id)); for(const item of other.state[bucket]||[]) if(!seen.has(item.id))this.state[bucket].push(clone(item)); } return this; }
  snapshot(){ return clone(this.state); }
  load(snapshot){ this.state=clone(snapshot||{}); this._ensure(); return this; }
  serialize(){ return JSON.stringify(this.snapshot()); }
  static deserialize(text){ return new WriterMemory(JSON.parse(String(text||'{}'))); }
  save(storage,key='writer-memory'){ const target=storage||(typeof localStorage!=='undefined'?localStorage:null); if(target)target.setItem(key,this.serialize()); return this; }
  static fromStorage(storage,key='writer-memory'){ const target=storage||(typeof localStorage!=='undefined'?localStorage:null); if(!target)return new WriterMemory(); try{return WriterMemory.deserialize(target.getItem(key)||'{}')}catch{return new WriterMemory()} }
}

class MemoryEngine extends WriterMemory {
  constructor(seed={}){ super(seed); }
}

class WriterMemoryHub {
  constructor(options={}){ this.longTerm=options.longTerm instanceof WriterMemory?options.longTerm:new WriterMemory(options.seed||{}); this.session=options.session instanceof SessionMemory?options.session:new SessionMemory(options.sessionOptions||{}); }
  addTurn(role,text,meta={}){ return this.session.add(role,text,meta); }
  remember(fact,meta={}){ return this.longTerm.remember(fact,meta); }
  context(query='',options={}){ return {session:this.session.context(options.turns||12),memory:this.longTerm.buildContext(query,options)}; }
  snapshot(){ return {longTerm:this.longTerm.snapshot(),session:clone(this.session.turns)}; }
}

const WriterMemoryAPI=Object.freeze({SessionMemory,WriterMemory,MemoryEngine,WriterMemoryHub});
GLOBAL.StoryTools=GLOBAL.StoryTools||{}; GLOBAL.StoryTools.WriterMemory=WriterMemoryAPI;


/* Consolidation provenance:
 * - memory-engine.js
 * - session-memory.js
 * - persona-manager.js
 * - persona-agents--dialogue-context.js
 */


/* ===== Jasper fictional-character memory extensions ===== */
class JasperStoryMemory extends WriterMemory {
  constructor(seed={}){ super(seed); const profile=globalThis.StoryTools?.JasperWriterReference?.buildFictionalJasperProfile?.()||{fictional_character:true,name:'Jasper',birth_year:1999,adult:true,pov:'first_person',external_pronouns:['they','she'],appearance:{race_ethnicity:'white',height:'5\'5\"',build:'chubby',hair:{base_color:'red',lowlights:['brown'],highlights:['blonde']},eyes:'light green',freckles:true},personality:{surface_energy:['goofy','chaotic'],core_traits:['kind','compassionate','intelligent','well-spoken','empathic','fiercely loyal','loves hard']}}; this.state.jasper=this.state.jasper||clone(profile); this.state.relationshipPreferences=this.state.relationshipPreferences||{}; this.state.boundaryHistory=this.state.boundaryHistory||[]; this.state.voiceHistory=this.state.voiceHistory||{}; this.state.affirmationCallbacks=this.state.affirmationCallbacks||[]; this.state.choiceHistory=this.state.choiceHistory||[]; this.state.peopleDetails=this.state.peopleDetails||{}; this.state.surpriseSeeds=this.state.surpriseSeeds||[]; this.state.pushPullHistory=this.state.pushPullHistory||[]; this.state.styleContinuity=this.state.styleContinuity||[]; this.state.sceneFingerprints=this.state.sceneFingerprints||[]; this.state.dialogueThreads=this.state.dialogueThreads||[]; }
  rememberPreference(key,value=true,meta={}){this.state.relationshipPreferences[String(key)]={value,updatedAt:now(),...clone(meta)};return clone(this.state.relationshipPreferences[String(key)]);}
  rememberBoundary(boundary={}){const row={id:boundary.id||uid('boundary'),kind:boundary.kind||'limit',status:boundary.status||'active',meaning:boundary.meaning||'',sceneId:boundary.sceneId||null,establishedAt:boundary.establishedAt||now(),...clone(boundary)};this.state.boundaryHistory.push(row);return clone(row);}
  rememberVoiceUse(speaker,entry={}){const key=String(speaker||'Unknown');(this.state.voiceHistory[key]||(this.state.voiceHistory[key]=[])).push({at:now(),...clone(entry)});return clone(this.state.voiceHistory[key].at(-1));}
  rememberAffirmation(text,meta={}){const row={id:meta.id||uid('affirmation'),text:String(text||''),firstUsedAt:meta.firstUsedAt||now(),meaning:meta.meaning||'',relationshipStage:meta.relationshipStage||null,...clone(meta)};this.state.affirmationCallbacks.push(row);return clone(row);}
  rememberChoice(choice={}){const row={id:choice.id||uid('choice'),sceneId:choice.sceneId||null,text:String(choice.text||''),branch:choice.branch||null,consequences:clone(choice.consequences||{}),at:choice.at||now()};this.state.choiceHistory.push(row);return clone(row);}
  rememberPersonDetail(person,detail,value,meta={}){const key=String(person||'Unknown');const bucket=this.state.peopleDetails[key]||(this.state.peopleDetails[key]=[]);const row={id:meta.id||uid('detail'),detail:String(detail||'detail'),value:clone(value),importance:meta.importance||'normal',sourceSceneId:meta.sceneId||null,learnedAt:meta.learnedAt||now(),...clone(meta)};bucket.push(row);return clone(row);}
  personDetails(person,options={}){const rows=clone(this.state.peopleDetails[String(person||'Unknown')]||[]);return options.limit?rows.slice(-Number(options.limit)):rows;}
  queueSurprise(person,detailRef,idea='',meta={}){const row={id:meta.id||uid('surprise'),person:String(person||'Unknown'),detailRef:detailRef||null,idea:String(idea||''),status:'planned',plannedAt:now(),payoffChapter:meta.payoffChapter||null,...clone(meta)};this.state.surpriseSeeds.push(row);return clone(row);}
  paySurprise(id,meta={}){const row=this.state.surpriseSeeds.find(x=>x.id===id);if(!row)return null;row.status='paid';row.paidAt=now();Object.assign(row,clone(meta));return clone(row);}
  rememberPushPull(event={}){const row={id:event.id||uid('pushpull'),kind:event.kind||'distance',trigger:event.trigger||'unworthiness/self-loathing spike',visibleMask:event.visibleMask||'humor/chaos/deflection',repair:event.repair||null,sceneId:event.sceneId||null,at:event.at||now(),...clone(event)};this.state.pushPullHistory.push(row);return clone(row);}
  rememberStyleContinuity(entry={}){const row={id:entry.id||uid('style'),at:entry.at||now(),sceneId:entry.sceneId||null,chapterId:entry.chapterId||null,signals:clone(entry.signals||[]),cadence:clone(entry.cadence||{}),voiceNotes:clone(entry.voiceNotes||{}),callbackNotes:clone(entry.callbackNotes||[]),...clone(entry)};this.state.styleContinuity.push(row);return clone(row);}
  rememberSceneFingerprint(entry={}){const row={id:entry.id||uid('fingerprint'),at:entry.at||now(),sceneId:entry.sceneId||null,location:entry.location||null,objects:clone(entry.objects||[]),sensoryAnchors:clone(entry.sensoryAnchors||[]),emotionalTurn:entry.emotionalTurn||'',closingImage:entry.closingImage||'',...clone(entry)};this.state.sceneFingerprints.push(row);return clone(row);}
  rememberDialogueThread(entry={}){const row={id:entry.id||uid('dialogue'),at:entry.at||now(),sceneId:entry.sceneId||null,speakers:clone(entry.speakers||[]),openLine:entry.openLine||'',unansweredQuestion:entry.unansweredQuestion||'',subtext:entry.subtext||'',...clone(entry)};this.state.dialogueThreads.push(row);return clone(row);}
  buildJasperContext(query='',options={}){
    const writerReference=globalThis.StoryTools?.JasperWriterReference?.buildBridgeInfluencePacket?.({query,sceneGoal:options.sceneGoal||query,character:options.character||options.characterId||'',theme:options.theme||'',dynamic:options.dynamic||'',referenceLimit:5,passageLimit:4,guideLimit:4,guideChars:700})||null;
    return {...this.buildContext(query,options),jasper:clone(this.state.jasper),relationshipPreferences:clone(this.state.relationshipPreferences),recentBoundaries:this.state.boundaryHistory.slice(-(options.boundaryLimit||20)),voiceHistory:clone(this.state.voiceHistory),affirmationCallbacks:this.state.affirmationCallbacks.slice(-(options.affirmationLimit||20)),choiceHistory:this.state.choiceHistory.slice(-(options.choiceLimit||30)),peopleDetails:clone(this.state.peopleDetails),openSurprises:this.state.surpriseSeeds.filter(x=>x.status!=='paid').slice(-(options.surpriseLimit||20)).map(clone),recentPushPull:this.state.pushPullHistory.slice(-(options.pushPullLimit||20)).map(clone),styleContinuity:this.state.styleContinuity.slice(-(options.styleLimit||16)).map(clone),sceneFingerprints:this.state.sceneFingerprints.slice(-(options.fingerprintLimit||16)).map(clone),dialogueThreads:this.state.dialogueThreads.slice(-(options.dialogueLimit||16)).map(clone),writerReference};
  }
}

class CallbackTracker {
  constructor(seed=[]){this.items=Array.isArray(seed)?clone(seed):[];}
  plant(text,meta={}){const item={id:meta.id||uid('callback'),text:String(text||''),kind:meta.kind||'setup',introducedChapter:meta.chapter||null,eligibleAfter:meta.eligibleAfter||null,payoff:null,status:'open',...clone(meta)};this.items.push(item);return clone(item);}
  pay(id,payoff={}){const item=this.items.find(x=>x.id===id);if(!item)return null;item.status='paid';item.payoff={at:now(),...clone(payoff)};return clone(item);}
  open(options={}){return this.items.filter(x=>x.status==='open'&&(!options.chapter||!x.eligibleAfter||Number(options.chapter)>=Number(x.eligibleAfter))).map(clone);}
  suggest(query='',limit=8){const terms=words(query);return this.open().map(x=>({x,score:terms.reduce((n,t)=>n+(JSON.stringify(x).toLowerCase().includes(t)?1:0),0)})).sort((a,b)=>b.score-a.score).slice(0,limit).map(v=>clone(v.x));}
}

function createDefaultJasperMemory(seed={}){const m=new JasperStoryMemory(seed);m.rememberPreference('character_specific_voice',true);m.rememberPreference('real_no_means_stop',true);m.rememberPreference('preserve_jasper_spark',true);m.rememberPreference('praise_specific_not_generic',true);m.rememberPreference('aftercare_matters',true);m.rememberPreference('remember_people_favorite_details',true);m.rememberPreference('use_details_for_later_surprises',true);m.rememberPreference('self_loathing_is_hidden_not_totalizing',true);m.rememberPreference('push_away_requires_emotional_cause_and_repair_continuity',true);return m;}

GLOBAL.StoryTools=GLOBAL.StoryTools||{}; GLOBAL.StoryTools.JasperMemory=Object.freeze({JasperStoryMemory,CallbackTracker,createDefaultJasperMemory});

})();
