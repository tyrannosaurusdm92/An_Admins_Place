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
const arr = v => Array.isArray(v)?v:v==null?[]:[v];
const pick = values => values[Math.floor(Math.random()*values.length)];

function creativeToolset(kind='book'){
  const common=['requirements','references','constraints','iterations','continuity','memory','plot_holes'];
  const map={book:['outline','characters','worldbuilding','chapters','editing','voice','publishing'],story:['premise','characters','beats','scenes','dialogue','continuity','revision'],fanfiction:['canon','characters','voice','relationship_arcs','scenes','continuity','revision'],cyoa:['premise','state','choices','branches','convergence','continuity','memory'],poem:['form','imagery','voice','rhythm','revision']};
  return [...new Set([...common,...(map[kind]||map.story)])];
}

const PLOT_TABLES=Object.freeze({
  hooks:['A message arrives for someone who should not exist.','A familiar person asks for help but refuses to explain in public.','The protagonist receives payment for a job they never accepted.','A routine place contains a room that was not there yesterday.','A long-buried secret becomes useful at exactly the wrong moment.','An apparently minor promise suddenly becomes impossible to keep.'],
  objectives:['protect someone until a deadline','recover something with emotional value','learn why an old event was misremembered','make a choice that damages one relationship to save another','reach a place before an irreversible change','convince someone who has good reason not to trust the protagonist'],
  complications:['the obvious antagonist is protecting something worse','the protagonist has incomplete or false information','two allies need mutually exclusive outcomes','the solution requires revisiting an earlier mistake','a private truth becomes public at the worst moment','success creates a new obligation'],
  twists:['the apparent reward caused the original problem','a former opponent becomes the only reliable ally','the missing information was deliberately withheld by someone sympathetic','the protagonist succeeds but misunderstands what success changed','an earlier background detail becomes the key to the outcome','the final choice resolves the plot but leaves the emotional conflict open']
});

function generatePlotSeed(options={}){ return {id:uid('plot'),title:options.title||`${pick(['Broken','Hidden','Last','Second','Silent','Unfinished'])} ${pick(['Promise','Door','Name','Road','Letter','Truth'])}`,hook:options.hook||pick(PLOT_TABLES.hooks),objective:options.objective||pick(PLOT_TABLES.objectives),complication:options.complication||pick(PLOT_TABLES.complications),twist:options.twist||pick(PLOT_TABLES.twists),genre:options.genre||'character-driven fiction',tone:options.tone||'emotionally grounded'}; }

function normalizeSpeaker(raw){ let s=String(raw||'').trim().replace(/^the\s+/i,'').replace(/[.,!?:;"'“”]+$/g,'').trim(); if(!s)return 'Narrator'; return s.split(/\s+/).map(w=>w.charAt(0).toUpperCase()+w.slice(1).toLowerCase()).join(' '); }
const TAG_VERBS='said|asked|replied|answered|whispered|shouted|murmured|cried|added|continued|muttered|exclaimed|called|yelled|laughed|sighed|began|growled|responded|declared';
function attributionName(before,after){const V=TAG_VERBS;const tests=[new RegExp(`^[\\s,]*(?:${V})\\s+(?:the\\s+)?([A-Za-z][A-Za-z'-]*)`,'i'),new RegExp(`^[\\s,]*(?:the\\s+)?([A-Za-z][A-Za-z'-]*)\\s+(?:${V})`,'i'),new RegExp(`(?:the\\s+)?([A-Za-z][A-Za-z'-]*)\\s+(?:${V})\\s*[,:]?\\s*$`,'i'),new RegExp(`(?:${V})\\s+(?:the\\s+)?([A-Za-z][A-Za-z'-]*)\\s*[,:]?\\s*$`,'i')];const hit=tests.map((r,i)=>(i<2?after:before).match(r)).find(Boolean);return hit?hit[1]:null;}
function parseScript(text){const out=[];const src=String(text||'').replace(/\r\n/g,'\n').trim();if(!src)return out;const paras=src.split(/\n\s*\n/).flatMap(p=>p.split(/\n/)).map(s=>s.trim()).filter(Boolean);for(const para of paras){const sp=para.match(/^([A-Za-z][A-Za-z0-9 ._'-]{0,30}):\s+(.+)$/);if(sp&&!/^https?$/i.test(sp[1].trim())){out.push({speaker:normalizeSpeaker(sp[1]),text:sp[2].trim()});continue;}const quoteRe=/["“„]([^"“”„]+)["”]/g;let last=0,m,found=false;const segs=[];while((m=quoteRe.exec(para))!==null){found=true;const before=para.slice(last,m.index),quote=(m[1]||'').trim(),after=para.slice(quoteRe.lastIndex);if(before.trim())segs.push({speaker:'Narrator',text:before.trim()});const name=attributionName(before,after);if(quote)segs.push({speaker:name?normalizeSpeaker(name):'Narrator',text:quote});last=quoteRe.lastIndex;}if(!found){out.push({speaker:'Narrator',text:para});continue;}const tail=para.slice(last).trim();if(tail)segs.push({speaker:'Narrator',text:tail});out.push(...segs.filter(s=>s.text));}return out;}

function splitSSEBuffer(buffer){const lines=[];let rest=String(buffer||'');while(true){const i=rest.indexOf('\n\n');if(i<0)break;lines.push(rest.slice(0,i));rest=rest.slice(i+2);}return {lines,rest};}
function parseSSELine(chunk){const lines=String(chunk||'').split(/\n/);const data=lines.filter(l=>l.startsWith('data:')).map(l=>l.slice(5).trim()).join('\n');if(!data)return null;try{return JSON.parse(data)}catch{return {type:'message',data};}}
async function consumeLongformStream(res,onEvent,{isAborted}={}){if(!res||!res.body)throw new Error('no response stream');const reader=res.body.getReader(),decoder=new TextDecoder();let buffer='';while(true){if(isAborted&&isAborted())break;const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true}).replace(/\r\n/g,'\n');const parsed=splitSSEBuffer(buffer);buffer=parsed.rest;for(const chunk of parsed.lines){const evt=parseSSELine(chunk);if(evt)onEvent(evt);}}if(buffer.trim()){const evt=parseSSELine(buffer);if(evt)onEvent(evt);}}

function buildScenePlan(options={}){
  const chars=arr(options.characters).map(c=>typeof c==='string'?{name:c}:c);
  const beats=arr(options.beats); const count=Math.max(1,Number(options.sceneCount||Math.max(3,beats.length||5)));
  const scenes=[];
  for(let i=0;i<count;i++){const beat=beats[i]||{};scenes.push({id:beat.id||uid('scene'),order:i+1,purpose:beat.purpose||beat.summary||['establish pressure','force a choice','reveal information','complicate a relationship','pay off earlier setup'][Math.min(i,4)]||'advance the story',location:beat.location||options.location||null,characters:beat.characters||chars.map(c=>c.name||c.id).filter(Boolean),entryState:clone(beat.entryState||{}),turn:beat.turn||null,exitState:clone(beat.exitState||{}),setups:arr(beat.setups),payoffs:arr(beat.payoffs),choice:beat.choice||null});}
  return scenes;
}

function makeCYOAChoices(scene={},options={}){const count=Math.max(2,Math.min(5,Number(options.count||3)));const base=arr(scene.possibleChoices);if(base.length>=count)return base.slice(0,count);const templates=['Ask the difficult question instead of avoiding it.','Act now before there is enough information.','Protect the relationship, even if it costs progress.','Follow the clue that makes the least emotional sense.','Refuse the expected choice and create a third option.'];return [...base,...templates].slice(0,count).map((text,index)=>({id:`choice_${scene.id||'scene'}_${index+1}`,text,consequenceHint:options.hideConsequences?'':null}));}

function buildGenerationRequest(options={}){
  const tools=GLOBAL.StoryTools||{};
  const referenceQuery=[options.prompt,options.sceneGoal,options.theme,options.dynamic,(options.characters||[]).map?.(x=>x?.name||x)?.join?.(' ')].filter(Boolean).join(' ');
  const ref=options.writerReference || tools.WriterReference?.buildWriterReference?.({query:referenceQuery,genre:options.genre,sceneGoal:options.sceneGoal,workType:options.workType||'short_story',referenceLimit:options.referenceLimit||6,passageLimit:options.passageLimit||7}) || null;
  const refPrompt=options.writerReferencePrompt || tools.WriterReference?.buildWriterReferencePrompt?.({query:referenceQuery,genre:options.genre,sceneGoal:options.sceneGoal,character:(options.characters||[]).map?.(x=>x?.name||x)?.join?.(' ')||'',workType:options.workType||'short_story'}) || '';
  const jasperInfluence=options.jasperWriterInfluence || (options.jasperProject!==false ? tools.JasperWriterReference?.buildBridgeInfluencePacket?.({query:referenceQuery,sceneGoal:options.sceneGoal,theme:options.theme,dynamic:options.dynamic,character:(options.characters||[]).map?.(x=>x?.name||x)?.join?.(' ')||'',profileOverrides:options.jasper||{}}) : null);
  const memory=options.memory?.buildJasperContext?options.memory.buildJasperContext(referenceQuery,{storyId:options.storyId,characterId:options.characterId}):(options.memory?.buildContext?options.memory.buildContext(referenceQuery,{storyId:options.storyId,characterId:options.characterId}):clone(options.memory||{}));
  const continuity=options.continuity?.snapshot?options.continuity.snapshot():clone(options.continuity||{});
  const plotAudit=tools.PlotHoleDefeater?.defeatPlotHoles?.({...(continuity||{}),memory:memory?.memory||memory,text:options.existingText||''})||null;
  return {
    requestId:uid('write'),action:options.action||'write_fiction',schemaVersion:'writer.request.v3',createdAt:new Date().toISOString(),
    project:{storyId:options.storyId||null,title:options.title||null,genre:options.genre||null,rating:options.rating||null,workType:options.workType||'short_story'},
    instruction:String(options.prompt||options.sceneGoal||'Continue the story.'),scene:clone(options.scene||{}),characters:clone(arr(options.characters)),
    constraints:{pov:options.pov||null,tense:options.tense||null,targetWords:options.targetWords||null,avoid:arr(options.avoid),required:arr(options.required),branching:Boolean(options.branching),choices:options.branching?makeCYOAChoices(options.scene||{},options.choiceOptions||{}):[]},
    writerReference:ref,writerReferencePrompt:refPrompt,jasperWriterInfluence:jasperInfluence,
    memory,continuity,plotAudit,
    outputContract:{prose:'string',sceneSummary:'string',factsEstablished:[],characterChanges:{},locationChanges:{},setups:[],payoffs:[],openQuestions:[],choices:options.branching?'array':'optional array'}
  };
}

function applyGenerationResult(result,context={}){
  if(!result||typeof result!=='object')throw new TypeError('Generation result must be an object.'); const memory=context.memory,continuity=context.continuity; const sceneId=result.sceneId||context.sceneId||uid('scene');
  const scene={id:sceneId,chapterId:context.chapterId||null,order:context.order,at:context.at||null,locationId:context.locationId||null,characterIds:arr(context.characterIds),summary:result.sceneSummary||'',facts:arr(result.factsEstablished),changes:{characters:clone(result.characterChanges||{}),locations:clone(result.locationChanges||{})},setups:arr(result.setups),payoffs:arr(result.payoffs),prose:result.prose||''};
  if(memory?.rememberScene)memory.rememberScene({...scene,storyId:context.storyId}); if(continuity?.recordScene)continuity.recordScene(scene); return scene;
}

function buildRevisionRequest(options={}){const tools=GLOBAL.StoryTools||{};const audit=options.audit||tools.PlotHoleDefeater?.defeatPlotHoles?.({...(options.continuity?.snapshot?options.continuity.snapshot():options.continuity||{}),text:options.text||''})||null;return {requestId:uid('revise'),action:'revise_fiction',schemaVersion:'writer.request.v2',text:String(options.text||''),goal:options.goal||'Improve clarity, continuity, pacing, and voice while preserving story intent.',audit,writerReferencePrompt:tools.WriterReference?.buildWriterReferencePrompt?.({query:options.goal||'',workType:options.workType||'short_story'})||'',constraints:clone(options.constraints||{})};}

class FictionWriter {
  constructor(options={}){this.memory=options.memory||null;this.continuity=options.continuity||null;this.defaults=clone(options.defaults||{});}
  request(options={}){return buildGenerationRequest({...this.defaults,...options,memory:options.memory||this.memory,continuity:options.continuity||this.continuity});}
  commit(result,context={}){return applyGenerationResult(result,{...context,memory:context.memory||this.memory,continuity:context.continuity||this.continuity});}
  plan(options={}){return buildScenePlan({...this.defaults,...options});}
  seed(options={}){return generatePlotSeed({...this.defaults,...options});}
}

const FictionWriterAPI=Object.freeze({creativeToolset,generatePlotSeed,normalizeSpeaker,parseScript,consumeLongformStream,buildScenePlan,makeCYOAChoices,buildGenerationRequest,applyGenerationResult,buildRevisionRequest,FictionWriter});
GLOBAL.StoryTools=GLOBAL.StoryTools||{};GLOBAL.StoryTools.FictionWriter=FictionWriterAPI;


/* Consolidation provenance:
 * - ai-brain-creative.js
 * - books-publishing--src_0063.js
 * - books-publishing--src_0067.js
 * - game-design--fallback-brain.js
 * - game-design--quest-builder.js
 * - persona-agents--dialogue-engine.js
 * - persona-agents--prompt.js
 */


/* ===== Jasper fanfiction request / branching engine ===== */
const JASPER_RELATIONSHIP_ARC_40 = Object.freeze(Array.from({length:40},(_,i)=>{
  const chapter=i+1;
  let stage='foundation';
  if(chapter>5)stage='growing_trust';
  if(chapter>10)stage='flirting_and_vulnerability';
  if(chapter>15)stage='boundary_and_relationship_conversations';
  if(chapter>20)stage='established_relationship';
  if(chapter>30)stage='deepened_commitment';
  const goals={
    foundation:['real plot','character chemistry','humor','individual goals','safe attention'],
    growing_trust:['friendship','callbacks','shared problems','earned trust','slow-burn chemistry'],
    flirting_and_vulnerability:['clearer attraction','emotional risk','repair','nonsexual affection','relationship stakes'],
    boundary_and_relationship_conversations:['honest wants','boundaries','consent language','relationship definition','optional intimacy setup'],
    established_relationship:['ongoing plot','domestic texture','optional private-interlude handoffs','earned rituals','consequences and aftercare when relevant'],
    deepened_commitment:['long-arc payoffs','old rituals with new meaning','future choices','relationship thesis','story climax/resolution']
  };
  return {chapter,stage,goals:goals[stage],private_handoff_allowed:chapter>=16,private_handoff_required:false,explicit_handoff_allowed:chapter>=16,explicit_handoff_required:false};
}));

class FanficChoiceEngine {
  constructor(options={}){this.turn=0;this.history=[];this.stats=new Map();this.skipTokens=Number(options.skipTokens??3);this.random=options.random||Math.random;}
  weightedPick(items=[]){const rows=items.map(x=>typeof x==='string'?{value:x,weight:1}:x).filter(x=>Number(x.weight??1)>0);const total=rows.reduce((n,x)=>n+Number(x.weight??1),0);if(!total)return null;let r=this.random()*total;for(const row of rows){r-=Number(row.weight??1);if(r<=0)return row.value??row;}return rows.at(-1)?.value??rows.at(-1);}
  compatiblePartners(actor,participants=[]){return participants.filter(p=>p!==actor&&p.id!==actor?.id).filter(p=>p.adult===true||p.age_verified_18_plus===true||Number(p.age)>=18);}
  next({actor,participants=[],beats=[],allowSkip=true}={}){const partners=this.compatiblePartners(actor,participants);if(!partners.length)throw new Error('No verified adult partner is available for this fictional scene turn.');const partner=this.weightedPick(partners.map(p=>({value:p,weight:p.sceneWeight||1})));const beat=this.weightedPick(beats.length?beats:[{value:'banter',weight:2},{value:'choice',weight:2},{value:'callback',weight:1},{value:'vulnerability',weight:1},{value:'reconnection',weight:1}]);const row={turn:++this.turn,actor:actor?.id||actor?.name||'Jasper',partner:partner?.id||partner?.name,beat,canSkip:allowSkip&&this.skipTokens>0};this.history.push(row);const key=String(row.partner);this.stats.set(key,(this.stats.get(key)||0)+1);return row;}
  skip(){if(this.skipTokens<=0)return false;this.skipTokens--;return true;}
  snapshot(){return {turn:this.turn,skipTokens:this.skipTokens,history:clone(this.history),stats:Object.fromEntries(this.stats)};}
}

function fictionalJasperProfile(overrides={}){const ref=globalThis.StoryTools?.JasperWriterReference;return ref?.buildFictionalJasperProfile?ref.buildFictionalJasperProfile(overrides):{fictional_character:true,name:'Jasper',birth_year:1999,adult:true,pov:'first_person',...overrides};}

function normalizeJasperAdultSceneMode(mode='mature_on_page'){
  const m=String(mode||'mature_on_page').trim().toLowerCase();
  if(['explicit','explicit_detailed'].includes(m))return 'explicit_detailed';
  return 'mature_on_page';
}

function createJasperFanficRequest(options={}){
  const profile=fictionalJasperProfile(options.jasper||{});
  const chapter=Math.max(1,Number(options.chapter||1));
  const arc=JASPER_RELATIONSHIP_ARC_40[Math.min(39,chapter-1)];
  const characters=arr(options.characters).map(c=>typeof c==='string'?{name:c}:c);
  const participants=[profile,...characters];
  const ageGate=globalThis.StoryTools?.JasperContinuity?.validateAdultStoryWindow?.(participants,{storyDate:options.storyDate,minimumAge:18,allowUnspecified:true})||{ok:true,errors:[],resolved:[]};
  if(!ageGate.ok){const e=new Error('The private adult-only project blocked an explicitly under-18 participant.');e.details=ageGate;throw e;}
  const profileGate=globalThis.StoryTools?.JasperContinuity?.validateJasperProfileLock?.(profile)||{ok:true,issues:[]};
  if(!profileGate.ok){const e=new Error('Jasper profile lock failed.');e.details=profileGate;throw e;}
  const requestedMode=normalizeJasperAdultSceneMode(options.explicitnessMode||options.contentMode||'mature_on_page');
  const explicitHandoff=Boolean(options.explicitHandoff||options.intimacyHandoff||options.privateHandoff||requestedMode==='explicit_detailed');
  const referenceOptions={query:options.prompt,sceneGoal:options.sceneGoal,theme:options.theme,dynamic:options.dynamic,character:characters.map(c=>c.name||c).join(' '),profileOverrides:options.jasper||{}};
  const referencePrompt=globalThis.StoryTools?.JasperWriterReference?.buildJasperWriterReferencePrompt?.(referenceOptions)||'';
  const influence=globalThis.StoryTools?.JasperWriterReference?.buildBridgeInfluencePacket?.(referenceOptions)||null;
  const base=buildGenerationRequest({...options,jasperProject:true,jasperWriterInfluence:influence,workType:'short_story',pov:'first_person',tense:options.tense||'past',characters:participants,required:[
    ...arr(options.required),
    'Jasper is the named adult viewpoint character, born in 1999.',
    'Narrative self-reference is I/me/my/mine/myself; external Jasper pronouns may be they/she with clear antecedents.',
    'Use the supplied William Saville writer-reference packet for cadence, sensory grounding, emotional directness, dialogue rhythm, callbacks, scene endings, and slow-build relationship craft without copying source lines.',
    'Prioritize plot, characterization, continuous dialogue, banter, humor, relationship development, grammar, memory, continuity, open-thread follow-through, and genuine emotional consequences.',
    'Private interludes are optional and never required by chapter number or relationship stage.',
    'The normal writer stops before nudity or sexual action. When a private handoff is deliberately selected, preserve exact voice/memory/plot state for the existing bridge and resume afterward with reconnection, consequences, callbacks, and plot progression.',
    'Real refusal/stop/distress immediately ends or de-escalates any playful power dynamic.',
    'Keep each canon character recognizably character-specific.'
  ],writerReferencePrompt:referencePrompt});
  base.profile=profile;
  base.relationshipArc=arc;
  base.adultGate=ageGate;
  base.profileGate=profileGate;
  base.writerInfluence=influence;
  base.adultFiction={enabled:options.adultContent!==false,explicitnessMode:requestedMode,explicitHandoff,privateHandoff:explicitHandoff,fadeToBlackAllowedInAuthoredProse:false,normalWriterBoundary:'before nudity or sexual action',generatorHandoffAllowed:true,privateInterludeRequired:false,allParticipantsAdultByProjectInvariant:true,fictionalJasper:true};
  base.storyFirst={enabled:true,slowBuild:true,privateInterludeEveryChapter:false,relationshipStage:arc.stage,privateHandoffRequired:false,explicitHandoffRequired:false,carryForward:['open plot threads','dialogue thread','relationship changes','callbacks','promises','boundaries','setting facts','choice consequences']};
  base.outputContract.validation=['adult_gate','jasper_profile_lock','first_person_pov','pronoun_grammar','object_pronoun_grammar','tense_lock','consent_frame','character_voice','william_style_reference','memory','continuity','plot_holes','story_first_pacing'];
  return base;
}

function buildJasperChoiceChapter(options={}){const request=createJasperFanficRequest({...options,branching:true});const scene=request.scene||{};const choices=makeCYOAChoices({...scene,possibleChoices:options.choices||scene.possibleChoices},{count:options.choiceCount||3,hideConsequences:true});return {...request,choices,choiceState:{persist:true,createNewBranchFiles:true,continuationUsesPreviousJSON:true}};}

async function validateGeneratedJasperChapter(result={},request={}){const audit=globalThis.StoryTools?.JasperQualityGates?.auditJasperChapter?.({text:result.prose||result.text||'',participants:request.characters||[],speakerProfiles:request.speakerProfiles||{}},{storyDate:request.storyDate,requireOnPageContinuity:false,normalWriterBoundary:!request.adultFiction?.privateHandoff})||{ok:true,issues:[]};return {ok:audit.ok,audit,result};}

let ACTIVE_JASPER_SCENE_BRIDGE=null;
function registerJasperSceneBridge(bridge){if(!bridge||typeof bridge!=='object')throw new TypeError('bridge must be an object');ACTIVE_JASPER_SCENE_BRIDGE=bridge;return bridge;}
function getJasperSceneBridge(){return ACTIVE_JASPER_SCENE_BRIDGE;}
async function createJasperFanficViaBridge(options={}){if(!ACTIVE_JASPER_SCENE_BRIDGE?.create)throw new Error('No Jasper scene bridge is registered. Load explicit-bridge.js after fiction-writer.js.');return ACTIVE_JASPER_SCENE_BRIDGE.create(options);}
async function continueJasperFanficViaBridge(options={}){if(!ACTIVE_JASPER_SCENE_BRIDGE?.continue)throw new Error('No Jasper scene bridge is registered.');return ACTIVE_JASPER_SCENE_BRIDGE.continue(options);}
async function branchJasperFanficViaBridge(options={}){if(!ACTIVE_JASPER_SCENE_BRIDGE?.branch)throw new Error('No Jasper scene bridge is registered.');return ACTIVE_JASPER_SCENE_BRIDGE.branch(options);}

const FictionalJasperFanficAPI=Object.freeze({profile:fictionalJasperProfile,arc40:JASPER_RELATIONSHIP_ARC_40,FanficChoiceEngine,normalizeJasperAdultSceneMode,createJasperFanficRequest,buildJasperChoiceChapter,validateGeneratedJasperChapter,registerJasperSceneBridge,getJasperSceneBridge,createJasperFanficViaBridge,continueJasperFanficViaBridge,branchJasperFanficViaBridge});
GLOBAL.StoryTools=GLOBAL.StoryTools||{}; GLOBAL.StoryTools.FictionalJasperFanfic=FictionalJasperFanficAPI;

})();
