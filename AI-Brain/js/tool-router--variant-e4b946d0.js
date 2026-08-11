(function(global){"use strict";
const RULES=[[/calculate|math|probabil|odds/,"calculator"],[/latest|current|research|source|verify/,"web-search"],[/image|illustrat|cover|visual/,"image"],[/file|folder|merge|dedup|archive/,"file-ops"],[/code|debug|test|refactor/,"code"],[/map|route|geojson/,"map"],[/3d|mesh|material|render/,"3d"],[/memory|remember|previous/,"memory"],[/project|canon|character|npc|world/,"project-search"]];
function route(request,available=[]){const t=String(request||"").toLowerCase();return RULES.filter(([r,n])=>r.test(t)&&(!available.length||available.includes(n))).map(([,name])=>name)}
const API={route}; if(typeof module!=="undefined"&&module.exports)module.exports=API; else global.AIBrainToolRouter=API;
})(typeof globalThis!=="undefined"?globalThis:this);
