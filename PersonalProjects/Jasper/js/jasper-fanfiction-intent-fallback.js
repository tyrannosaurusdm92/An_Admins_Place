/* Jasper Fanfiction — lightweight intent fallback. */
(function(global){'use strict';
function analyze(text){
 const v=String(text||'').trim();const lower=v.toLowerCase();const tags=[];
 if(/brat|teas|sass|loophole/.test(lower))tags.push('playful-brat-dynamic');
 if(/praise|good girl|affirm/.test(lower))tags.push('praise');
 if(/aftercare|cuddle|water|blanket|reconnect/.test(lower))tags.push('aftercare-reconnection');
 const privateHandoff=/(private interlude|intimacy|explicit|nsfw|smut|sex|nudity)/.test(lower);
 if(privateHandoff)tags.push('private-handoff');
 return {
   raw:v,
   intent:privateHandoff?'private-handoff':'story-continuation',
   tags,
   requiresAdultGate:privateHandoff,
   contentMode:privateHandoff?'explicit_detailed':'mature_on_page',
   normalWriterBoundary:'before nudity or sexual action'
 };
}
global.JasperFanfictionIntentFallback=Object.freeze({analyze});
})(typeof globalThis!=='undefined'?globalThis:window);
