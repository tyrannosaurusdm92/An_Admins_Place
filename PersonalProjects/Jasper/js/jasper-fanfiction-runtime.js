/* Jasper Fanfiction — merged specialist runtime for the Virtual Book reader. */
(function(global){'use strict';
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const session=global.JasperFanfictionSessionMemory?new global.JasperFanfictionSessionMemory({key:'jasper-fanfiction-session-v2',maxTurns:120,persist:true}):null;
  const continuity=global.JasperFanfictionContinuityMemory?new global.JasperFanfictionContinuityMemory():null;
  const graphs=new Map();
  const relationships=new Map();
  function graph(key='story'){if(!graphs.has(key)&&global.JasperFanfictionStoryGraph)graphs.set(key,new global.JasperFanfictionStoryGraph());return graphs.get(key)||null;}
  function relationship(key='story',seed={}){if(!relationships.has(key)&&global.JasperFanfictionRelationshipEngine)relationships.set(key,new global.JasperFanfictionRelationshipEngine(seed));return relationships.get(key)||null;}
  function context({series={},parent=null,choice=null,memory={},extra={}}={}){
    const key=series.key||series.series_slug||'story';
    const fandom=global.JasperFanfictionFandomContext?.build?.(series,parent)||null;
    const character=global.JasperFanfictionCharacterContext?.build?.({series,chapter:parent,choice,memory,characters:series.character_bible||[]})||null;
    const setting=global.JasperFanfictionSetting?.generate?.({fandom:series.fandom||'',location:parent?.location||'',tone:series.tone||'',canonWindow:series.canon_window||parent?.canon_window||'',seed:`${key}:${parent?.id||'opening'}:${choice?.id||extra.direction||'continue'}`})||null;
    const lore=global.JasperFanfictionLore?.list?.(key)?.slice(-24)||[];
    const intent=global.JasperFanfictionIntent?.analyze?.(extra.privateSeed||choice?.generation_hint||choice?.description||'')||null;
    const relEngine=relationship(key,memory?.values||{});if(relEngine&&memory?.values)for(const [name,value] of Object.entries(memory.values))relEngine.set(name,value);const rel=relEngine?.snapshot?.()||clone(memory?.values||{});
    const continuityStory=continuity?.story?.(key)||null;
    const refOptions={query:[extra.direction,choice?.generation_hint,choice?.description,parent?.title,series.title].filter(Boolean).join(' '),sceneGoal:extra.direction||choice?.description||'',character:String(series.pairing||''),theme:series.theme||'',dynamic:series.relationship_dynamic||'',guideLimit:5,guideChars:900,referenceLimit:6,passageLimit:5};
    const writerReference=global.StoryTools?.JasperWriterReference?.buildBridgeInfluencePacket?.(refOptions)||null;
    const writerPrompt=global.StoryTools?.JasperWriterReference?.buildJasperWriterReferencePrompt?.(refOptions)||'';
    return {
      reader:global.JasperFanfictionReader?.get?.()||null,fandom,character,setting,lore,intent,relationship:rel,
      creation_sources:global.JasperFanfictionCreationSources?.contextPacket?.(series)||clone(series.creation_sources||null),
      character_profile_ids:clone(series.character_profile_ids||[]),
      material_hub_available:Boolean(global.JasperFanfictionMaterialHub),
      people_places_available:Boolean(global.PeoplePlaces),
      session:session?.recent?.(24)||[],continuity:clone(continuityStory),
      writer_reference:writerReference,writer_reference_prompt:writerPrompt,
      story_carry:{seriesKey:key,parentId:parent?.id||null,parentTitle:parent?.title||'',selectedChoice:clone(choice||null),direction:extra.direction||'',openThreads:clone(continuityStory?.open_threads||continuityStory?.openThreads||[])}
    };
  }
  function recordChoice(series,chapter,choice,memory){if(!series||!choice)return;const key=series.key||series.series_slug||'story';continuity?.rememberChoice?.(key,choice);const rel=relationship(key,memory?.values||{});if(rel&&memory?.values)for(const [name,value] of Object.entries(memory.values))rel.set(name,value);session?.add?.({type:'choice',seriesKey:key,chapterId:chapter?.id||null,choiceId:choice.id||null,label:choice.label||'',pathKey:choice.path_key||null});graph(key)?.event?.({type:'choice',seriesKey:key,chapterId:chapter?.id||null,choiceId:choice.id||null,pathKey:choice.path_key||null});}
  function recordChapter(series,chapter,from={}){if(!series||!chapter)return;const key=series.key||series.series_slug||'story';continuity?.rememberChapter?.(key,chapter);session?.add?.({type:'chapter',seriesKey:key,chapterId:chapter.id||null,chapterNumber:chapter.chapter_number||null,title:chapter.title||'',generated:Boolean(chapter.generated)});graph(key)?.ingestChapter?.(chapter,{seriesKey:key,choiceFrom:from});}
  function recordVisit(series,chapter){if(!series||!chapter)return;const key=series.key||series.series_slug||'story';session?.add?.({type:'visit',seriesKey:key,chapterId:chapter.id||null,chapterNumber:chapter.chapter_number||null,title:chapter.title||''});graph(key)?.ingestChapter?.(chapter,{seriesKey:key});}
  function snapshot(key='story'){return {session:session?.recent?.(120)||[],continuity:continuity?.snapshot?.()||null,graph:graph(key)?.snapshot?.()||null,relationship:relationship(key)?.snapshot?.()||null};}
  global.JasperFanfictionRuntime=Object.freeze({session,continuity,graph,relationship,context,recordChoice,recordChapter,recordVisit,snapshot});
})(typeof globalThis!=='undefined'?globalThis:window);
