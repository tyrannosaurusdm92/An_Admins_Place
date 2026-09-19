/* Jasper Fanfiction — deterministic relationship reaction updates for CYOA choices. */
(function(global){'use strict';
const defaultWeights={trust:1,warmth:1,honesty:1,playfulness:1,curiosity:1,insight:1,boundaries:1,resolve:1,momentum:1};
function apply(state={},effect={}){const next={...state};for(const [key,value] of Object.entries(effect||{})){if(typeof value==='number')next[key]=(Number(next[key])||0)+value;else next[key]=value;}return next;}
function describe(effect={}){const changed=Object.entries(effect).filter(([,v])=>v!==0&&v!=null).map(([k,v])=>`${k} ${typeof v==='number'&&v>0?'+':''}${v}`);return changed.join(', ')||'no tracked relationship change';}
global.JasperFanfictionCharacterReactions=Object.freeze({defaultWeights,apply,describe});
})(typeof globalThis!=='undefined'?globalThis:window);
