(function(global){"use strict";
const ORDER={private:0,project:1,series:2,universe:3,global:4};
function mayRead(recordScope,currentScope="project",permissions={}){if(recordScope==="private")return !!permissions.private; return (ORDER[recordScope]??1)>=(ORDER[currentScope]??1) || recordScope===currentScope}
function filter(records,ctx={}){return (records||[]).filter(r=>!r.projectId||r.projectId===ctx.projectId).filter(r=>mayRead(r.scope||"project",ctx.scope||"project",ctx.permissions||{}))}
const API={mayRead,filter}; if(typeof module!=="undefined"&&module.exports)module.exports=API; else global.AIBrainProjectScope=API;
})(typeof globalThis!=="undefined"?globalThis:this);
