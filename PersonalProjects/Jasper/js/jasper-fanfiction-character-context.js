/* Jasper Fanfiction — character/relationship context assembler with William-style reference influence. */
(function(global){'use strict';const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
function build({series={},chapter=null,choice=null,memory={},characters=[]}={}){
  const query=[series.fandom,series.title,series.pairing,chapter?.title,choice?.label,choice?.description,choice?.generation_hint].filter(Boolean).join(' ');
  const writer_reference=global.StoryTools?.JasperWriterReference?.buildBridgeInfluencePacket?.({query,sceneGoal:choice?.description||choice?.generation_hint||'',character:String(series.pairing||''),theme:series.theme||'',dynamic:series.relationship_dynamic||'',referenceLimit:5,passageLimit:4,guideLimit:4,guideChars:700})||null;
  return {
    schema:'jasper.fanfiction.character-context.v2',
    reader:global.JasperFanfictionReader?.get?.()||null,
    fandom:series.fandom||'',series:series.title||'',pairing:series.pairing||'',canon_window:series.canon_window||'',story_bible:series.story_bible||'',
    characters:clone(characters.length?characters:series.character_bible||[]),
    character_profile_ids:clone(series.character_profile_ids||[]),
    creation_sources:clone(series.creation_sources||null),
    relationship_state:clone(memory?.values||{}),flags:clone(memory?.flags||{}),
    chapter:chapter?{id:chapter.id,title:chapter.title,number:chapter.chapter_number,ending:String(chapter.content||'').slice(-2400),writer_context:clone(chapter.chapter_writer_context||null)}:null,
    choice:clone(choice),
    writer_reference,
    continuity_carry:['canon voice','current dialogue thread','relationship changes','open plot threads','callbacks/favorite details','boundaries/promises','objects/locations','Jasper emotional state','William-style cadence']
  };
}
global.JasperFanfictionCharacterContext=Object.freeze({build});
})(typeof globalThis!=='undefined'?globalThis:window);
