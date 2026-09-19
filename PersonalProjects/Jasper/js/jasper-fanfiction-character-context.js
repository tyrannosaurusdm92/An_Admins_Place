/* Jasper Fanfiction — character/relationship context assembler. */
(function(global){'use strict';const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
function build({series={},chapter=null,choice=null,memory={},characters=[]}={}){return {schema:'jasper.fanfiction.character-context.v1',reader:global.JasperFanfictionReader?.get?.()||null,fandom:series.fandom||'',series:series.title||'',pairing:series.pairing||'',canon_window:series.canon_window||'',story_bible:series.story_bible||'',characters:clone(characters.length?characters:series.character_bible||[]),relationship_state:clone(memory?.values||{}),flags:clone(memory?.flags||{}),chapter:chapter?{id:chapter.id,title:chapter.title,ending:String(chapter.content||'').slice(-2200)}:null,choice:clone(choice)};}
global.JasperFanfictionCharacterContext=Object.freeze({build});
})(typeof globalThis!=='undefined'?globalThis:window);
