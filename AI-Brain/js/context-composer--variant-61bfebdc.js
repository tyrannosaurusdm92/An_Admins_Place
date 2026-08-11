(function(global){"use strict";
function estimate(x){return Math.ceil(JSON.stringify(x??"").length/4)}
function compose(parts={},budget=24000){const order=["system","project","memory","persona","knowledge","tools","request"];let used=0,out={};for(const key of order){const v=parts[key];if(v==null)continue;const cost=estimate(v);if(used+cost<=budget){out[key]=v;used+=cost}else if(Array.isArray(v)){const a=[];for(const item of v){const c=estimate(item);if(used+c>budget)break;a.push(item);used+=c}out[key]=a}}return {context:out,estimatedTokens:used,budget,truncated:used>=budget}}
const API={compose,estimate}; if(typeof module!=="undefined"&&module.exports)module.exports=API; else global.AIBrainContextComposer=API;
})(typeof globalThis!=="undefined"?globalThis:this);
