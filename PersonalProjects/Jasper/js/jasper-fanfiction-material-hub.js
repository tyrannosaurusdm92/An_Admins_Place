/* Jasper Fanfiction Material Hub
   Relevance-aware integration layer shared by normal generation and explicit-bridge generation.
   All source systems remain addressable; each request receives the relevant subset plus runtime specialist outputs. */
(function(global){'use strict';
const VERSION='2026-09-20.4-full-integration';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const state={manifest:null,characterSupport:null,guide:null,loading:null,lastPacket:null};
async function json(path){const r=await fetch(path,{cache:'no-cache'});if(!r.ok)throw new Error(`Material load failed: ${path} (${r.status})`);return r.json();}
async function load(){
  if(state.manifest&&state.characterSupport&&state.guide)return snapshot();
  if(!state.loading)state.loading=Promise.all([
    json('json/materials/materials-manifest.json'),
    global.JasperFanfictionCharacterLibrary?.loadSupportMaterials?.()||Promise.resolve({}),
    json('json/materials/hard-explicit-brat-grammar-guide.json')
  ]).then(([manifest,characterSupport,guide])=>{
    state.manifest=manifest;state.characterSupport=characterSupport||{};state.guide=guide||{};
    return snapshot();
  }).finally(()=>state.loading=null);
  return state.loading;
}
function currentSeries(request={}){
  const c=request.context||{},engine=global.JasperFanfictionApp?.engine||global.JASPER_CYOA||null;
  const key=c?.series?.key||engine?.currentSeriesKey||'';
  return engine?.getSeries?.(key)||c.series||{};
}
function queryFor(request={},series={}){
  const c=request.context||{};
  return [series.fandom,series.title,series.pairing,series.premise,c.parent?.title,c.parent?.content,
    c.selected_choice?.label,c.selected_choice?.description,c.selected_choice?.generation_hint,
    c.requested?.direction,String(request.prompt||'').slice(0,1200)].filter(Boolean).join(' ');
}
function parentContinuity(parent){
  if(!parent)return null;
  return {id:parent.id||null,chapter_number:parent.chapter_number||null,title:parent.title||'',
    continuity_snapshot:clone(parent.continuity_snapshot||null),chapter_writer_context:clone(parent.chapter_writer_context||null),
    authored_sequence:clone(parent.authored_sequence||null),path_variants:clone(parent.path_variants||{}),
    closing_excerpt:String(parent.content||'').slice(-3000)};
}
function selectGuideSections(request={}){
  const privateMode=Boolean(global.JasperFanfictionPrivateSpec?.isPrivate?.(request.context||{}));
  const wanted=privateMode
    ? new Set(['1','2','4A','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','24','25','26','29','31'])
    : new Set(['1','2','5','10','14','19','20','24','25','26','29','31']);
  return (state.guide?.sections||[]).filter(s=>wanted.has(String(s.id))).map(s=>({
    id:s.id,title:s.title,tags:s.tags,text:String(s.text||'').slice(0,privateMode?1800:1200)
  }));
}
async function characterPacket(request={},series={}){
  const L=global.JasperFanfictionCharacterLibrary;if(!L?.ensureForContext)return null;
  const c=request.context||{};
  return L.ensureForContext({
    seriesKey:series.key||series.series_slug||c.series?.key||'',
    fandom:series.fandom||c.series?.fandom||'',
    pairing:series.pairing||c.series?.pairing||'',
    content:[c.parent?.title,c.parent?.content].filter(Boolean).join(' '),
    choice:[c.selected_choice?.label,c.selected_choice?.description,c.selected_choice?.generation_hint].filter(Boolean).join(' '),
    query:queryFor(request,series),
    profileIds:series.character_profile_ids||c.character_profile_ids||c.series?.character_profile_ids||[]
  }).catch(()=>null);
}
function specialistContext(request={},series={}){
  const c=request.context||{},parent=c.parent||null,choice=c.selected_choice||null;
  const memory=c.continuity?.memory||{};
  let fandom=null,character=null,setting=null,beats=null,adult=null,reader=null,writerReference=null,writerPrompt='',runtime=null,runtimeSnapshot=null,writingContext=null,writingPrompt='',characterPrompt='',branches=[],dialogue=[],lore=[],reaction='';
  try{fandom=global.JasperFanfictionFandomContext?.build?.(series,parent)||c.fandom||null}catch(_e){}
  try{character=global.JasperFanfictionCharacterContext?.build?.({series,chapter:parent,choice,memory,characters:series.character_bible||[]})||c.character||null}catch(_e){}
  try{setting=c.setting||global.JasperFanfictionSetting?.generate?.({fandom:series.fandom||'',location:parent?.location||'',tone:series.tone||'',canonWindow:series.canon_window||'',seed:`${series.key||'story'}:${parent?.id||'opening'}:${choice?.id||'continue'}`})||null}catch(_e){}
  try{beats=global.JasperFanfictionSceneBeats?.select?.({series,chapter:parent,choice})||c.scene_beats||null}catch(_e){}
  try{adult=global.JasperFanfictionAdultContract?.contractForSeries?.(series)||c.adult_contract||null}catch(_e){}
  try{reader=global.JasperFanfictionReader?.get?.()||global.JasperFanfictionReader?.profile||c.reader||null}catch(_e){}
  try{
    const opts={query:queryFor(request,series),sceneGoal:c.requested?.direction||choice?.description||'',character:String(series.pairing||''),theme:series.theme||'',dynamic:series.relationship_dynamic||'',seriesKey:series.key||'',fandom:series.fandom||'',content:parent?.content||'',guideLimit:6,guideChars:900,referenceLimit:7,passageLimit:6};
    writerReference=global.StoryTools?.JasperWriterReference?.buildBridgeInfluencePacket?.(opts)||c.writer_reference||null;
    writerPrompt=global.StoryTools?.JasperWriterReference?.buildJasperWriterReferencePrompt?.(opts)||c.writer_reference_prompt||'';
  }catch(_e){}
  try{runtime=global.JasperFanfictionRuntime?.context?.({series,parent,choice,memory,extra:{direction:c.requested?.direction||choice?.generation_hint||choice?.description||''}})||c.specialist_runtime||null}catch(_e){}
  try{runtimeSnapshot=global.JasperFanfictionRuntime?.snapshot?.(series.key||series.series_slug||'story')||null}catch(_e){}
  try{
    writingContext=global.JasperFanfictionWriting?.buildStoryContext?.(series,parent,choice,memory,{direction:c.requested?.direction||'',contentMode:c.content?.effective_mode})||c.writing_style_runtime||null;
    writingPrompt=global.JasperFanfictionWriting?.buildStoryPrompt?.(writingContext)||'';
  }catch(_e){}
  try{
    characterPrompt=global.JasperFanfictionCharacterPrompt?.build?.({series,parent,chapter:parent,choice,selected_choice:choice,continuity:c.continuity||{},character},{request:c.requested?.direction||choice?.generation_hint||choice?.description||'continue',explicitMode:Boolean(global.JasperFanfictionPrivateSpec?.isPrivate?.(c)),series})||c.character_prompt_runtime||'';
  }catch(_e){}
  try{branches=global.JasperFanfictionBranches?.makeChoices?.({seriesKey:series.key||'story',seriesTitle:series.title||'',fandom:series.fandom||'',pairing:series.pairing||'',chapterNumber:Number(parent?.chapter_number||0)+1,count:Number(series.choice_count||4),seed:`${series.key||'story'}:${parent?.id||'opening'}`,includePrivateHandoff:Boolean(series.adult_characters_confirmed),relationshipStage:parent?.chapter_writer_context?.relationship_stage||''})||c.branch_runtime?.suggested_choices||[]}catch(_e){}
  try{dialogue=global.JasperFanfictionDialogueParser?.parseScript?.(String(parent?.content||'')).slice(-16)||[]}catch(_e){}
  try{lore=global.JasperFanfictionLore?.list?.(series.key||series.series_slug||'story')?.slice(-24)||c.lore||[]}catch(_e){}
  try{reaction=global.JasperFanfictionCharacterReactions?.describe?.(choice?.effect||{})||''}catch(_e){}
  return {
    fandom,character,setting,scene_beats:beats,adult_contract:adult,reader,
    writer_reference:writerReference,writer_reference_prompt:String(writerPrompt||'').slice(0,12000),
    writing_style_context:writingContext,writing_style_prompt:String(writingPrompt||'').slice(0,9000),
    character_prompt:String(characterPrompt||'').slice(0,9000),
    specialist_runtime:runtime,runtime_snapshot:runtimeSnapshot,
    branch_suggestions:clone(branches).slice(0,5),selected_choice_reaction:reaction,
    recent_dialogue:clone(dialogue),lore:clone(lore),
    continuity:c.continuity||null,writer_runtime:c.writer_runtime||null,relationship:c.relationship||null,
    quality_gate_available:Boolean(global.StoryTools?.JasperQualityGates),
    plot_hole_defeater_available:Boolean(global.StoryTools?.PlotHoleDefeater),
    fiction_writer_available:Boolean(global.StoryTools?.FictionalJasperFanfic)
  };
}
function compactMaterials(packet){
  return {
    schema:packet.schema,availability:packet.availability,character_library:packet.character_library,
    character_rules:packet.character_rules,continuation_template:packet.continuation_template,
    creation_sources:packet.creation_sources,authored_continuity:packet.authored_continuity,
    guide_sections:packet.guide_sections,private_spec:packet.private_spec,specialist_context:packet.specialist_context
  };
}
async function packetForRequest(request={}){
  await load();
  const c=request.context||{},series=currentSeries(request),cp=await characterPacket(request,series);
  const creation=c.creation_sources||series.creation_sources||global.JasperFanfictionCreationSources?.contextPacket?.(series)||null;
  const guideSections=selectGuideSections(request);
  const packet={
    schema:'jasper.material-packet.v2-full-integration',
    availability:{
      manifest:clone(state.manifest),
      character_profile_count:Number(state.manifest?.character_library?.unified_profile_count||0),
      research_guide_section_count:Number(state.guide?.section_count||0),
      people_places_runtime_module_count:Number(state.manifest?.people_places?.runtime_module_count||0),
      people_places_capabilities:clone(creation?.people_places_capabilities||creation?.original_support?.runtime_capabilities||[]),
      source_policy:'All source systems remain available/searchable; the provider receives a request-relevant subset rather than an indiscriminate dump.'
    },
    character_library:cp,
    character_rules:clone(state.characterSupport?.rules||null),
    continuation_template:clone(state.characterSupport?.continuation||null),
    creation_sources:clone(creation),
    authored_continuity:clone(c.authored_library||parentContinuity(c.parent)||null),
    guide_sections:guideSections,
    private_spec:global.JasperFanfictionPrivateSpec?.promptBlock?.({context:c,series,guideSections})||'',
    specialist_context:specialistContext(request,series)
  };
  state.lastPacket=packet;return packet;
}
function promptFor(packet){
  if(!packet)return'';
  const L=global.JasperFanfictionCharacterLibrary,charPrompt=L?.promptForPacket?.(packet.character_library)||'';
  const rules=packet.character_rules||{},creation=packet.creation_sources||{},originals=creation.original_support||{};
  const supportPeople=(originals.people||[]).slice(0,8).map(p=>`${p.name} (${p.age}; ${p.setting?.sentientType||p.setting?.mode||'person'})`).join('; ');
  const supportPlaces=(originals.places||[]).slice(0,10).map(p=>`${p.name} [${p.kind}]`).join('; ');
  const s=packet.specialist_context||{};
  const lines=[
    'FULL MATERIAL HUB — binding integration context for this request.',
    packet.private_spec||'',
    charPrompt,
    rules?.sappy_smut_target?.core?`CHARACTER-LIBRARY TARGET: ${rules.sappy_smut_target.core}`:'',
    rules?.character_selection_rules?`CHARACTER SELECTION RULES: ${rules.character_selection_rules.join(' ')}`:'',
    s.writer_reference_prompt?`WILLIAM WRITER REFERENCE:\n${s.writer_reference_prompt}`:'',
    s.writing_style_prompt?`WRITING-STYLE RUNTIME:\n${s.writing_style_prompt}`:'',
    s.character_prompt?`CHARACTER/STORY RUNTIME:\n${s.character_prompt}`:'',
    s.branch_suggestions?.length?`CYOA BRANCH SUGGESTIONS: ${JSON.stringify(s.branch_suggestions)}`:'',
    s.recent_dialogue?.length?`RECENT DIALOGUE THREAD: ${JSON.stringify(s.recent_dialogue)}`:'',
    supportPeople?`OPTIONAL ORIGINAL SUPPORTING ADULTS: ${supportPeople}`:'',
    supportPlaces?`OPTIONAL ORIGINAL LOCATIONS: ${supportPlaces}`:'',
    packet.authored_continuity?`AUTHORED CONTINUITY PACKET: ${JSON.stringify(packet.authored_continuity)}`:''
  ].filter(Boolean);
  return lines.join('\n\n').slice(0,26000);
}
async function hydrateRequest(request={}){
  const next=clone(request||{});next.context=next.context||{};
  const packet=await packetForRequest(next);
  next.context.materials=compactMaterials(packet);
  next.context.materials_prompt=promptFor(packet);
  next.context.guide_runtime={source:'hard-explicit-brat-grammar-guide',sections:clone(packet.guide_sections||[])};
  if(packet.character_library?.profiles?.length){
    next.context.character_library=packet.character_library;
    next.context.character_profile_ids=packet.character_library.profile_ids||[];
  }
  if(packet.creation_sources&&!next.context.creation_sources)next.context.creation_sources=clone(packet.creation_sources);
  if(next.context.private_generation){
    next.context.private_generation.materials=compactMaterials(packet);
    next.context.private_generation.materials_prompt=next.context.materials_prompt;
    next.context.private_generation.runtime_spec=packet.private_spec;
    next.context.private_generation.source_policy={...(next.context.private_generation.source_policy||{}),
      full_material_hub:'JasperFanfictionMaterialHub',hard_explicit_guide:'uploaded guide runtime index',
      character_library:'unified fandom+character resolver',people_places:'optional original support/world generator',
      authored_story:'binding continuation history',writer_reference:'William style/reference system',cyoa:'branch runtime + story graph + continuity memory'};
  }
  return next;
}
function snapshot(){return clone({version:VERSION,manifest:state.manifest,characterSupport:state.characterSupport,guide:state.guide,lastPacket:state.lastPacket});}
global.JasperFanfictionMaterialHub=Object.freeze({VERSION,load,packetForRequest,promptFor,hydrateRequest,selectGuideSections,snapshot});
})(typeof globalThis!=='undefined'?globalThis:window);
