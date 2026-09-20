/* Jasper Fanfiction — sole private reader profile. */
(function(global){'use strict';
const base=global.JasperFanfictionAdultContract?.reader||{};
const profile=Object.freeze({...base,
  id:'jasper-private-reader-v4',name:'Jasper',birth_year:1999,legal_adult_confirmed:true,adult:true,
  gender:'nonbinary',pronouns:Object.freeze(['they/them','she/her']),birth_assignment:'AFAB',pov:'first_person',
  relationship_profile:global.JasperFanfictionAdultContract?.intimacy||{},
  private_interlude_policy:Object.freeze({normal_writer_boundary:'before nudity or sexual action',bridge:'explicit-bridge.js'})
});
function get(){return profile;}
function promptSummary(){return [
  'The viewpoint character is Jasper, the sole adult reader of this private project.',
  'Narration is locked first person: I/me/my/mine/myself. Other characters may address Jasper as you/your and may refer to Jasper with they/she.',
  'Jasper is a confirmed adult born in 1999.',
  'For the normal writer, emphasize Jasper’s witty/loophole-loving playful brat energy, praise preferences including “good girl,” positive affirmations, humor, emotional safety, clear consent, strong aftercare/reconnection, and character-specific relationship dynamics.',
  'The normal writer does not generate nudity or sexual action. If the story reaches that private boundary, preserve the exact scene state and hand off through explicit-bridge.js; resume afterward with dialogue, consequences, memory, and plot.'
].join(' ')}
global.JasperFanfictionReader=Object.freeze({profile,get,promptSummary});
})(typeof globalThis!=='undefined'?globalThis:window);
