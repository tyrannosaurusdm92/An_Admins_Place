(function(global){"use strict";
const HIGH_IMPACT=["medical diagnosis","prescribe","emergency","ban user","legal verdict","financial trade"];
function assess(request,ctx={}){const t=String(request||"").toLowerCase();const flags=[];HIGH_IMPACT.forEach(x=>{if(t.includes(x))flags.push(x)});if(ctx.minor)flags.push("minor-context");if(ctx.privateData)flags.push("private-data");return {humanReview:flags.length>0,flags,principles:["consent","privacy","provenance","appealability","least-privilege"]}}
const API={assess};if(typeof module!=="undefined"&&module.exports)module.exports=API;else global.AIBrainSafetyRouter=API;
})(typeof globalThis!=="undefined"?globalThis:this);
