(function(global){"use strict";
const ROLES={editor:["continuity","plot","character","world","timeline","developmental","line","copy","pov","series"],creator:["art-director","worldbuilder","game-designer","writer"],technical:["coder","architect","debugger","auditor"],agent:["npc","companion","tutor","strategist","organizer"]};
function route(request,allowed=[]){const t=String(request||"").toLowerCase();for(const [family,roles] of Object.entries(ROLES))for(const role of roles)if(t.includes(role.replace(/-/g," "))&&(!allowed.length||allowed.includes(role)))return {family,role};return {family:"assistant",role:"general"}}
const API={ROLES,route}; if(typeof module!=="undefined"&&module.exports)module.exports=API; else global.AIBrainPersonaRouter=API;
})(typeof globalThis!=="undefined"?globalThis:this);
