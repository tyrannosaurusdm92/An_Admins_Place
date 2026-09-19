/* Jasper Fanfiction — interprets freeform reader directions into continuation intent. */
(function(global){'use strict';
function analyze(text){const v=String(text||'').trim();const lower=v.toLowerCase();const tags=[];if(/slow\s*burn/.test(lower))tags.push('slow burn');if(/poly|polycule/.test(lower))tags.push('polyamory');if(/flirt|kiss|romance|date/.test(lower))tags.push('romance');if(/fight|battle|attack|danger/.test(lower))tags.push('action');if(/mystery|investigate|secret/.test(lower))tags.push('mystery');if(/sex|explicit|nsfw|smut|oral|penetrat|orgasm|masturbat/.test(lower))tags.push('adult-explicit');return {raw:v,intent:tags.includes('adult-explicit')?'adult-intimacy':(/continue|next|after/.test(lower)?'continue':'direction'),tags,requiresAdultGate:tags.includes('adult-explicit')};}
global.JasperFanfictionIntent=Object.freeze({analyze});
})(typeof globalThis!=='undefined'?globalThis:window);
