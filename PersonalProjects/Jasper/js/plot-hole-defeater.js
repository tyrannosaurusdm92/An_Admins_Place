(function () {
  'use strict';
/**
 * Consolidated story-writing module generated from the user's supplied JavaScript package.
 * Source concepts preserved and refactored for a smaller five-file writing system.
 * No network backend is hard-coded here; callers may send generated request objects to their own backend.
 */

const GLOBAL = typeof globalThis !== 'undefined' ? globalThis : window;
const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
const arr = v => Array.isArray(v)?v:v==null?[]:[v];
const uid = prefix => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`;
function point(v){ if(typeof v==='number'&&Number.isFinite(v))return v; if(v==null||v==='')return null; const n=Date.parse(String(v)); return Number.isFinite(n)?n:null; }
function issue(severity,code,message,meta={}){ return {id:uid('issue'),severity,code,message,...clone(meta)}; }

class PlotHoleDefeater {
  constructor(options={}){ this.options={allowFastTravel:false,requireReciprocalRelationships:false,...options}; }
  audit(input={}){
    const source=input?.snapshot?input.snapshot():input||{}; const issues=[];
    const scenes=clone(source.sceneLedger||source.scenes||source.memory?.scenes||[]); const sceneList=Array.isArray(scenes)?scenes:Object.values(scenes||{});
    const world=source.world||{}; const nodes=world.nodes||source.nodes||[]; const relationships=source.relationships||world.edges||[]; const canon=source.canon||[];
    issues.push(...this.checkDuplicateIds(nodes,sceneList,relationships));
    issues.push(...this.checkChronology(sceneList,world.timeline||[]));
    issues.push(...this.checkCharacterState(sceneList,source.characterStates||{}));
    issues.push(...this.checkLocations(sceneList));
    issues.push(...this.checkRelationships(relationships,nodes));
    issues.push(...this.checkSetupsAndPayoffs(sceneList,source.promises||source.memory?.promises||{}));
    issues.push(...this.checkCanonConflicts(canon));
    issues.push(...this.checkTextDrift(input.text||input.prose||''));
    const bySeverity=issues.reduce((m,x)=>{m[x.severity]=(m[x.severity]||0)+1;return m;},{});
    return {ok:!issues.some(x=>x.severity==='error'),issues,summary:{total:issues.length,errors:bySeverity.error||0,warnings:bySeverity.warning||0,notes:bySeverity.note||0}};
  }
  checkDuplicateIds(...groups){ const seen=new Map(),out=[]; for(const group of groups)for(const item of arr(group)){const id=item?.id||item?.sceneId||item?.relationshipId;if(!id)continue;if(seen.has(id))out.push(issue('error','duplicate-id',`Duplicate ID "${id}" appears in more than one record.`,{recordId:id}));else seen.set(id,item);} return out; }
  checkChronology(scenes,timeline){ const out=[]; const ordered=[...arr(scenes)].sort((a,b)=>Number(a.order??0)-Number(b.order??0)); let previous=null; for(const scene of ordered){const p=point(scene.at??scene.time);if(p!=null&&previous!=null&&p<previous)out.push(issue('error','time-runs-backward',`Scene ${scene.id||scene.sceneId||scene.order} occurs earlier than the previous ordered scene.`,{sceneId:scene.id||scene.sceneId,at:scene.at??scene.time}));if(p!=null)previous=p;} const events=[...arr(timeline)].sort((a,b)=>Number(a.order??0)-Number(b.order??0)); previous=null; for(const e of events){const p=point(e.at);if(p!=null&&previous!=null&&p<previous)out.push(issue('warning','timeline-order-conflict',`Timeline event ${e.id||''} has a timestamp earlier than an event before it in narrative order.`,{eventId:e.id,at:e.at}));if(p!=null)previous=p;} return out; }
  checkCharacterState(scenes,states){ const out=[],deadAt=new Map(),lastKnown=new Map(); const ordered=[...arr(scenes)].sort((a,b)=>Number(a.order??0)-Number(b.order??0)); for(const scene of ordered){for(const id of arr(scene.characterIds)){ if(deadAt.has(id))out.push(issue('error','dead-character-active',`${id} appears in scene ${scene.id||scene.sceneId} after being marked dead.`,{characterId:id,sceneId:scene.id||scene.sceneId,deathSceneId:deadAt.get(id)})); lastKnown.set(id,scene.id||scene.sceneId); } for(const [id,patch] of Object.entries(scene.changes?.characters||{})){if(patch.dead===true||patch.alive===false||String(patch.status||'').toLowerCase()==='dead')deadAt.set(id,scene.id||scene.sceneId);if((patch.dead===false||patch.alive===true)&&deadAt.has(id))out.push(issue('warning','character-resurrection',`${id} changes from dead to alive; confirm this resurrection/revival is intentional.`,{characterId:id,sceneId:scene.id||scene.sceneId}));}} for(const [id,state] of Object.entries(states||{})){if((state.dead===true||state.alive===false)&&!deadAt.has(id))out.push(issue('note','death-not-in-ledger',`${id} is marked dead in final state but no death change appears in the supplied scene ledger.`,{characterId:id}));} return out; }
  checkLocations(scenes){ const out=[],last=new Map(); const ordered=[...arr(scenes)].sort((a,b)=>Number(a.order??0)-Number(b.order??0)); for(const scene of ordered){for(const id of arr(scene.characterIds)){const prior=last.get(id);if(prior&&prior.locationId&&scene.locationId&&prior.locationId!==scene.locationId){const sameTime=point(prior.at)!=null&&point(scene.at)!=null&&point(prior.at)===point(scene.at);const explicitTravel=scene.travel===true||arr(scene.tags).some(t=>/travel|teleport|portal|transit/i.test(String(t)))||arr(scene.facts).some(f=>/travel|arriv|depart|teleport|portal/i.test(typeof f==='string'?f:JSON.stringify(f)));if(sameTime&&!explicitTravel&&!this.options.allowFastTravel)out.push(issue('warning','instant-location-change',`${id} moves from ${prior.locationId} to ${scene.locationId} at the same recorded time without an explicit travel marker.`,{characterId:id,from:prior.locationId,to:scene.locationId,sceneId:scene.id||scene.sceneId}));}last.set(id,{locationId:scene.locationId,at:scene.at,sceneId:scene.id||scene.sceneId});}} return out; }
  checkRelationships(relationships,nodes){ const out=[],ids=new Set(arr(nodes).map(n=>n.id||n.npcId||n.characterId).filter(Boolean)),rels=arr(relationships); for(const r of rels){const from=r.from||r.fromNpcId,to=r.to||r.toNpcId;if(from&&ids.size&&!ids.has(from))out.push(issue('error','relationship-missing-from',`Relationship ${r.id||r.relationshipId||''} references missing entity ${from}.`,{relationshipId:r.id||r.relationshipId}));if(to&&ids.size&&!ids.has(to))out.push(issue('error','relationship-missing-to',`Relationship ${r.id||r.relationshipId||''} references missing entity ${to}.`,{relationshipId:r.id||r.relationshipId}));if(this.options.requireReciprocalRelationships&&r.reciprocalId&&!rels.some(x=>(x.id||x.relationshipId)===r.reciprocalId))out.push(issue('warning','missing-reciprocal-relationship',`Relationship ${r.id||r.relationshipId} points to reciprocal ${r.reciprocalId}, which is absent.`));} return out; }
  checkSetupsAndPayoffs(scenes,promises){ const out=[],setups=new Map(),paid=new Set(); for(const scene of [...arr(scenes)].sort((a,b)=>Number(a.order??0)-Number(b.order??0))){for(const s of arr(scene.setups)){const id=typeof s==='string'?s:(s.id||s.key||s.text);if(id)setups.set(id,{sceneId:scene.id||scene.sceneId,value:s});}for(const p of arr(scene.payoffs)){const id=typeof p==='string'?p:(p.setupId||p.id||p.key||p.text);if(id)paid.add(id);}} for(const [id,row] of setups)if(!paid.has(id))out.push(issue('warning','unresolved-setup',`Setup "${id}" has no payoff in the supplied scene ledger.`,{setupId:id,introducedSceneId:row.sceneId})); const promiseRows=Array.isArray(promises)?promises:Object.values(promises||{});for(const p of promiseRows)if(p.status!=='resolved'&&p.status!=='abandoned')out.push(issue('note','open-promise',`Open story promise: ${p.label||p.summary||p.id}.`,{promiseId:p.id})); return out; }
  checkCanonConflicts(canon){ const out=[],rows=Array.isArray(canon)?canon:Object.entries(canon||{}).map(([key,value])=>({key,value})),seen=new Map(); for(const row of rows){const key=row.key||row.id;if(!key)continue;const value=JSON.stringify(row.value??row.fact??row);if(seen.has(key)&&seen.get(key)!==value)out.push(issue('error','canon-conflict',`Canon key "${key}" has conflicting values.`,{canonKey:key}));else seen.set(key,value);} return out; }
  checkTextDrift(text){ const source=String(text||'');if(!source.trim())return[];const out=[];const paragraphs=source.split(/\n\s*\n/).filter(Boolean);const first=paragraphs.map(p=>(p.match(/\b(I|me|my|mine|we|us|our|ours)\b/gi)||[]).length);const third=paragraphs.map(p=>(p.match(/\b(he|him|his|she|her|hers|they|them|their|theirs)\b/gi)||[]).length);const clearFirst=first.filter((n,i)=>n>=4&&n>third[i]*2).length, clearThird=third.filter((n,i)=>n>=4&&n>first[i]*2).length;if(clearFirst&&clearThird)out.push(issue('warning','pov-drift','The supplied prose contains substantial blocks of both first-person and third-person narration; confirm POV switches are intentional.'));const quoteOpen=(source.match(/[“"]/g)||[]).length;if(quoteOpen%2)out.push(issue('error','unbalanced-quotes','The supplied prose appears to contain an unmatched double quotation mark.'));return out; }
  revisionChecklist(report){ const issues=report?.issues||[]; return issues.map((x,i)=>({order:i+1,priority:x.severity==='error'?1:x.severity==='warning'?2:3,code:x.code,task:this.taskFor(x),issueId:x.id})).sort((a,b)=>a.priority-b.priority||a.order-b.order); }
  taskFor(x){ const map={'duplicate-id':'Give each record a unique stable ID and update references.','time-runs-backward':'Reconcile scene order and timestamps, or explicitly mark the chronology as nonlinear.','dead-character-active':'Either move the scene before the death, remove the character, or establish a deliberate return.','instant-location-change':'Add travel/transit time or establish a canon travel mechanism.','unresolved-setup':'Pay off, intentionally abandon, or carry the setup into the open-promises list.','canon-conflict':'Choose the canon value and update all conflicting records.','pov-drift':'Normalize narrative POV or mark intentional viewpoint changes.','unbalanced-quotes':'Repair the unmatched quotation mark.'}; return map[x.code]||`Review: ${x.message}`; }
}

function defeatPlotHoles(input,options={}){ const engine=new PlotHoleDefeater(options); const report=engine.audit(input); return {...report,revisionChecklist:engine.revisionChecklist(report)}; }
const PlotHoleAPI=Object.freeze({PlotHoleDefeater,defeatPlotHoles});
GLOBAL.StoryTools=GLOBAL.StoryTools||{};GLOBAL.StoryTools.PlotHoleDefeater=PlotHoleAPI;


/* Consolidation provenance:
 * - persona-agents--reactions.js
 * - worldbuilding--generator_core.js
 */


/* ===== Jasper POV / grammar / adult-mode quality gates ===== */
function jwQuoteMask(text){const src=String(text||'');const mask=new Uint8Array(src.length);let quote=null,esc=false;for(let i=0;i<src.length;i++){const c=src[i];if(esc){esc=false;if(quote)mask[i]=1;continue;}if(c==='\\'){esc=true;if(quote)mask[i]=1;continue;}if(!quote&&(c==='"'||c==='“')){quote=c;mask[i]=1;continue;}if(quote){mask[i]=1;if((quote==='"'&&c==='"')||(quote==='“'&&c==='”'))quote=null;}}return mask;}
function jwOutsideQuoteMatches(text,re){const src=String(text||''),mask=jwQuoteMask(src),out=[];for(const m of src.matchAll(re)){if(!mask[m.index||0])out.push({index:m.index,match:m[0]});}return out;}

function lintJasperFirstPerson(text,options={}){
  const src=String(text||''), issues=[];
  const second=[/\byou\s+(?:walked|looked|felt|thought|wanted|smiled|laughed|moved|turned|said|asked|knew)\b/gi,/\byour\s+(?:hands?|breath|body|mouth|thighs?|chest|face|eyes?|voice)\b/gi];
  for(const re of second)for(const hit of jwOutsideQuoteMatches(src,re))issues.push({code:'SECOND_PERSON_NARRATION',...hit,severity:'error'});
  const third=[/\bJasper\s+(?:walked|looked|felt|thought|wanted|smiled|laughed|moved|turned|said|asked|knew)\b/gi,/\b(?:they|she)\s+(?:walked|looked|felt|thought|wanted|smiled|laughed|moved|turned|said|asked|knew)\b/gi];
  for(const re of third)for(const hit of jwOutsideQuoteMatches(src,re))issues.push({code:'THIRD_PERSON_SELF_REFERENCE',...hit,severity:'error'});
  for(const hit of jwOutsideQuoteMatches(src,/\bthey\s+(?:is|has|does)\b/gi))issues.push({code:'SINGULAR_THEY_AGREEMENT',...hit,severity:'error'});
  for(const hit of jwOutsideQuoteMatches(src,/\b(?:their's|her's|themselfs|theirself|hisself)\b/gi))issues.push({code:'PRONOUN_FORM_ERROR',...hit,severity:'error'});
  for(const hit of jwOutsideQuoteMatches(src,/\b(?:to|for|with|beside|behind|around|toward|towards|beneath|through|across|inside|above|below|from|into|over|past|at|on)\s+(?:I|myself)\b/gi))issues.push({code:'OBJECT_CASE_ERROR',...hit,severity:'error'});
  for(const hit of jwOutsideQuoteMatches(src,/\b(?:between|both of|neither of|either of|the two of|three of|each of|one of)\s+I\b/gi))issues.push({code:'GROUP_OBJECT_CASE_ERROR',...hit,severity:'error'});
  for(const hit of jwOutsideQuoteMatches(src,/\b(?:giving|ordering|caught|warned|stopped|studied|considered|letting|correcting)\s+I\b/gi))issues.push({code:'VERB_OBJECT_CASE_ERROR',...hit,severity:'error'});
  const mind=/\b(?:he|she|they|[A-Z][a-z]+)\s+(?:wondered|thought|knew|realized|decided)\s+(?:that|whether|if)\b/gi; for(const hit of jwOutsideQuoteMatches(src,mind))issues.push({code:'POSSIBLE_MIND_READING',...hit,severity:'warning'});
  return {ok:!issues.some(x=>x.severity==='error'),issues};
}

function lintConsentFrame(text,options={}){
  const src=String(text||''),issues=[];const stop=/\b(?:no|stop|don't|do not|I don't want|out of scene|red)\b/i; const override=/\b(?:ignored|kept going|didn't stop|did not stop|only being a brat|didn't mean it|did not mean it)\b/i;
  if(stop.test(src)&&override.test(src))issues.push({code:'POSSIBLE_CONSENT_OVERRIDE',severity:'error'});
  if(/\b(?:froze|freezing|dissociat|real fear|visible distress)\b/i.test(src)&&/\b(?:continued|kept|pushed|forced)\b/i.test(src))issues.push({code:'DISTRESS_NOT_DEESCALATED',severity:'error'});
  return {ok:issues.length===0,issues};
}

function lintAdultParticipantMetadata(participants=[],options={}){const validator=globalThis.StoryTools?.JasperContinuity?.validateAdultStoryWindow;if(!validator)return {ok:false,issues:[{code:'ADULT_VALIDATOR_UNAVAILABLE'}]};const r=validator(participants,{storyDate:options.storyDate,minimumAge:18,allowUnspecified:true});return {ok:r.ok,issues:r.errors||[],resolved:r.resolved};}

function lintFadeToBlack(text,options={}){const src=String(text||'');const issues=[];if(options.intentionalGeneratorHandoff===true)return {ok:true,issues:[],handoff:true};const patterns=[/one thing led to another/i,/the rest was a blur/i,/the night passed in passion/i,/what happened next was private/i,/I woke (?:up )?the next morning/i,/\blater\.\.\./i];for(const re of patterns){const m=src.match(re);if(m)issues.push({code:'POSSIBLE_FADE_TO_BLACK',match:m[0],severity:options.requireOnPageContinuity===false?'warning':'error'});}return {ok:!issues.some(x=>x.severity==='error'),issues};}

function lintCharacterVoice(text,speakerProfiles={},options={}){const parsed=globalThis.StoryTools?.FictionWriter?.parseScript?.(text)||[];const issues=[];for(const line of parsed){if(line.speaker==='Narrator')continue;const p=speakerProfiles[line.speaker]||speakerProfiles[line.speaker.toLowerCase()];if(!p)continue;const forbidden=(p.forbiddenTerms||[]).map(String);for(const term of forbidden){if(term&&line.text.toLowerCase().includes(term.toLowerCase()))issues.push({code:'SPEAKER_FORBIDDEN_TERM',speaker:line.speaker,term,severity:'warning'});} }return {ok:!issues.some(x=>x.severity==='error'),issues};}


function lintJasperProfileMetadata(profile={}){
  const checker=globalThis.StoryTools?.JasperContinuity?.validateJasperProfileLock;
  if(checker)return checker(profile);
  const issues=[]; if(profile.name&&profile.name!=='Jasper')issues.push({code:'JASPER_NAME_DRIFT',severity:'error'});if(profile.birth_year&&Number(profile.birth_year)!==1999)issues.push({code:'BIRTH_YEAR_DRIFT',severity:'error'});return {ok:issues.length===0,issues};
}

function lintJasperCharacterArc(input={},options={}){
  const issues=[]; const memory=input.memory||{}; const unresolved=memory.recentPushPull||input.unresolvedRepairs||[];
  if(options.finalChapter===true&&unresolved.some(x=>x.repairPending!==false))issues.push({code:'UNRESOLVED_PUSH_AWAY_REPAIR',severity:'warning'});
  const details=input.peopleDetails||memory.peopleDetails||{}; const planned=input.openSurprises||memory.openSurprises||[];
  for(const row of planned){if(row.person&&!details[row.person]&&row.detailRef)issues.push({code:'SURPRISE_WITHOUT_REMEMBERED_DETAIL',person:row.person,severity:'warning'});}
  return {ok:!issues.some(x=>x.severity==='error'),issues};
}

function lintWriterReferenceContinuity(input={},options={}){
  const issues=[];
  const ref=input.writerReference||input.writer_reference||input.writerInfluence||input.writer_reference_influence||null;
  if(options.requireWriterReference===true&&!ref)issues.push({code:'WRITER_REFERENCE_MISSING',severity:'warning'});
  const memory=input.memory||{};
  const openDialogue=memory.dialogueThreads||memory.openDialogueThreads||[];
  if(Array.isArray(openDialogue)&&openDialogue.some(x=>x&&x.status!=='closed')&&options.dialogueThreadCarried===false)issues.push({code:'OPEN_DIALOGUE_THREAD_DROPPED',severity:'warning'});
  const openThreads=memory.openStoryThreads||memory.openThreads||[];
  if(Array.isArray(openThreads)&&openThreads.some(x=>x&&x.status!=='resolved')&&options.plotThreadsCarried===false)issues.push({code:'OPEN_PLOT_THREAD_DROPPED',severity:'warning'});
  return {ok:!issues.some(x=>x.severity==='error'),issues};
}

function lintAuthoredContinuation(input={},options={}){
  const issues=[]; const chapter=input.chapter||input||{}; const choices=chapter.choices||[]; const variants=chapter.path_variants||{};
  for(const choice of choices){const key=choice?.path_key||choice?.pathKey;if(key&&!Object.prototype.hasOwnProperty.call(variants,key))issues.push({code:'CHOICE_PATH_VARIANT_MISSING',path_key:key,severity:'error'});}
  const snapshot=chapter.continuity_snapshot||{};
  if(options.requireContinuitySnapshot===true&&!snapshot.closing_anchor)issues.push({code:'CONTINUITY_SNAPSHOT_MISSING',severity:'warning'});
  if(options.requireCanonWindow===true&&!chapter.canon_window)issues.push({code:'CANON_WINDOW_MISSING',severity:'warning'});
  if(options.requireWriterReference===true&&!chapter.writer_reference)issues.push({code:'WRITER_REFERENCE_MISSING',severity:'warning'});
  const labels=choices.map(x=>String(x?.label||'').toLowerCase()).filter(Boolean); if(new Set(labels).size!==labels.length)issues.push({code:'DUPLICATE_CHOICE_LABEL',severity:'warning'});
  return {ok:!issues.some(x=>x.severity==='error'),issues};
}

function auditJasperChapter(input={},options={}){const text=String(input.text||input.prose||input.chapter?.content||'');const reports={pov:lintJasperFirstPerson(text,options),consent:lintConsentFrame(text,options),fade:lintFadeToBlack(text,{requireOnPageContinuity:options.requireOnPageContinuity!==false,intentionalGeneratorHandoff:options.intentionalGeneratorHandoff===true}),adult:lintAdultParticipantMetadata(input.participants||[],options),voice:lintCharacterVoice(text,input.speakerProfiles||{},options),profile:lintJasperProfileMetadata(input.jasperProfile||input.readerProfile||{}),characterArc:lintJasperCharacterArc({memory:input.memory,peopleDetails:input.peopleDetails,openSurprises:input.openSurprises,unresolvedRepairs:input.unresolvedRepairs},options),writerReference:lintWriterReferenceContinuity(input,options),authoredContinuation:lintAuthoredContinuation(input,options)};const issues=Object.values(reports).flatMap(r=>r.issues||r.errors||[]);return {ok:!issues.some(x=>x.severity==='error'||x.code==='UNDERAGE_OR_UNVERIFIED'||x.code==='AGE_AMBIGUOUS'),issues,reports};}

GLOBAL.StoryTools=GLOBAL.StoryTools||{}; GLOBAL.StoryTools.JasperQualityGates=Object.freeze({lintJasperFirstPerson,lintConsentFrame,lintAdultParticipantMetadata,lintFadeToBlack,lintCharacterVoice,lintJasperProfileMetadata,lintJasperCharacterArc,lintWriterReferenceContinuity,lintAuthoredContinuation,auditJasperChapter});

})();
