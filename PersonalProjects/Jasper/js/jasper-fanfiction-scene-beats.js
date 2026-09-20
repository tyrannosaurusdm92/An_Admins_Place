/* Jasper Fanfiction — story-first scene beat selector.
 * Private-interlude content is deliberately excluded from the normal writer.
 */
(function(global){'use strict';
const beats=Object.freeze([
 {id:'plot-motion',tags:['plot','story'],level:0,prompt:'Move the actual plot forward; do not let romance replace the story.'},
 {id:'banter',tags:['banter','humor'],level:0,prompt:'Use character-specific banter and humor that sounds like these people, not generic flirting.'},
 {id:'callback',tags:['memory','continuity'],level:0,prompt:'Pay off a remembered detail, promise, preference, joke, fear, or earlier choice.'},
 {id:'vulnerability',tags:['emotion','slow-burn'],level:1,prompt:'Allow earned vulnerability without forcing a confession before the relationship is ready.'},
 {id:'brat-play',tags:['teasing','dynamic'],level:1,prompt:'Use Jasper’s witty/loophole-loving playful resistance as active consensual participation; preserve competence and agency.'},
 {id:'praise',tags:['praise','relationship'],level:1,prompt:'Make praise specific to what the character actually noticed; preserve each speaker’s voice.'},
 {id:'affirmation',tags:['affirmation','care'],level:1,prompt:'Positive affirmations may appear as a consensual relationship ritual; keep them character-specific and never frame them as therapy.'},
 {id:'boundary-talk',tags:['consent','trust'],level:1,prompt:'Let boundaries and wants be discussed clearly. Real refusal/stop/distress immediately ends playful framing.'},
 {id:'handoff-seam',tags:['private','handoff'],level:2,prompt:'If the scene reaches the private boundary, stop before nudity or sexual action and offer the private-interlude handoff rather than fading past it.'},
 {id:'aftercare-reconnection',tags:['aftercare','reconnection'],level:2,prompt:'After a returned private interlude, resume with care, banter, continuous dialogue, emotional consequences, memory updates, and the next plot beat.'}
]);
function select({series={},chapter={},choice={}}={}){
 const number=Number(chapter?.chapter_number||1);
 const stage=number<=5?0:number<=15?1:2;
 const choiceText=`${choice?.path_key||''} ${choice?.label||''} ${choice?.description||''}`.toLowerCase();
 return beats.filter(b=>b.level<=stage || (b.id==='handoff-seam'&&/(private|intimat|explicit)/.test(choiceText)) || (b.id==='aftercare-reconnection'&&/(return|reconnect|aftercare)/.test(choiceText)));
}
function prompt(input={}){return select(input).map(b=>`SCENE BEAT — ${b.id}: ${b.prompt}`).join('\n');}
global.JasperFanfictionSceneBeats=Object.freeze({beats,select,prompt});
})(typeof globalThis!=='undefined'?globalThis:window);
