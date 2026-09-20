/* Jasper Fanfiction — story-writing style helpers with William-reference influence + private-handoff routing. */
(function(global){'use strict';
const JASPER_READER_PROFILE=global.JasperFanfictionAdultContract?.reader||global.JasperFanfictionReader?.profile||{};
const FALLBACK_STYLE=Object.freeze({priorities:Object.freeze(['emotion','character voice','continuous dialogue','specific sensory detail','humor','slow build','memory callbacks','consequences']),avoid:Object.freeze(['generic dialogue','instant intimacy','plotless repetition','POV drift','character voice flattening'])});
function williamStyleDNA(){return global.StoryTools?.JasperWriterReference?.styleDNA||global.StoryTools?.WriterReference?.styleDNA?.()||null;}
const STORY_CONTENT_MODES=Object.freeze({
 general:Object.freeze({id:'general',label:'General',adult_required:false,instruction:'Write plot and character development; romance may exist but no private interlude is requested.'}),
 romance:Object.freeze({id:'romance',label:'Romance',adult_required:false,instruction:'Write on-page romance, affection, kissing, banter, vulnerability, and slow-burn relationship development.'}),
 mature_on_page:Object.freeze({id:'mature_on_page',label:'Mature story',adult_required:true,instruction:'Write mature relationship material, plot, banter, kissing, vulnerability, and tension; if the private scene is selected, stop at the private-handoff seam without summarizing or fading past it.'}),
 private_handoff:Object.freeze({id:'explicit_detailed',label:'Private bridge interlude',adult_required:true,instruction:'The normal writer seam is already satisfied. explicit-bridge.js now owns the selected adult interlude: preserve William-style cadence, first-person grammar, character-specific voice, continuity, consent state, hard-explicit runtime rules, and return at a clean story seam.'})
});
const STORY_TAG_TAXONOMY=Object.freeze({source:'Jasper private project',default_tags:Object.freeze(['romance','slow-burn','character-voice','teasing','praise','aftercare','continuity'])});
function normalizeMode(value){const id=String(value?.id||value||'mature_on_page').toLowerCase();if(['explicit','explicit_detailed','adult_explicit','private_handoff'].includes(id))return STORY_CONTENT_MODES.private_handoff;return STORY_CONTENT_MODES[id]||STORY_CONTENT_MODES.mature_on_page;}
function analyzeStoryStyle(samples=[]){const text=(Array.isArray(samples)?samples:[samples]).map(v=>String(v||'')).join('\n');const dna=williamStyleDNA();return {sample_chars:text.length,dialogue_heavy:(text.match(/[“"]/g)||[]).length>10,style_dna:dna,priorities:dna?.prose_fingerprint||FALLBACK_STYLE.priorities};}
function adultsEligible(series={}){const v=global.JasperFanfictionAdultContract?.validateSeries?.(series);return v?Boolean(v.ok):true;}
function buildStoryContext(series={},parent=null,choice=null,memory={},extra={}){
 const mode=normalizeMode(extra.contentMode||extra.mode||series.content_mode||'mature_on_page');
 const query=[series.fandom,series.title,series.pairing,parent?.title,choice?.label,choice?.description,extra.direction].filter(Boolean).join(' ');
 const writer_reference=global.StoryTools?.JasperWriterReference?.buildBridgeInfluencePacket?.({query,sceneGoal:extra.direction||choice?.description||'',character:String(series.pairing||''),theme:series.theme||'',dynamic:series.relationship_dynamic||'',referenceLimit:5,passageLimit:4,guideLimit:4,guideChars:700})||null;
 return {series:{key:series.key,title:series.title,fandom:series.fandom,pairing:series.pairing,canon_window:series.canon_window||'',writer_style:series.writer_style||null},private_bridge_active:mode.id==='explicit_detailed',reader:JASPER_READER_PROFILE,content:{requested_mode:mode.id,effective_mode:mode.id,adult_characters_confirmed:adultsEligible(series),instruction:mode.instruction},adult_contract:global.JasperFanfictionAdultContract?.contractForSeries?.(series)||{},scene_beats:global.JasperFanfictionSceneBeats?.select?.({series,chapter:parent,choice})||[],writer_reference,parent,choice,memory,extra};
}
function buildStoryPrompt(context={}){
 const series=context?.series||{};
 const ref=global.StoryTools?.JasperWriterReference?.buildJasperWriterReferencePrompt?.({query:[context?.parent?.title,context?.choice?.description,context?.extra?.direction].filter(Boolean).join(' '),sceneGoal:context?.extra?.direction||context?.choice?.description||'',character:String(series.pairing||''),referenceLimit:5,passageLimit:4,guideLimit:4,guideChars:700})||'';
 return ['STORY-FIRST FANFICTION WRITER',context?.content?.instruction||'',ref,'Carry forward dialogue, memory, callbacks, open plot threads, relationship changes, boundaries, objects/locations, and emotional consequences. Do not reset after a generated scene or bridge return.',global.JasperFanfictionAdultContract?.promptBlock?.(series, context)||'',JSON.stringify(context||{})].filter(Boolean).join('\n\n');
}
global.JasperFanfictionWriting=Object.freeze({WILLIAM_SAVILLE_STYLE:FALLBACK_STYLE,JASPER_READER_PROFILE,STORY_CONTENT_MODES,STORY_TAG_TAXONOMY,williamStyleDNA,normalizeMode,analyzeStoryStyle,adultsEligible,buildStoryContext,buildStoryPrompt});
})(typeof globalThis!=='undefined'?globalThis:window);
