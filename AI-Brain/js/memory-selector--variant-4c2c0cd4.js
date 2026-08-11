(function(global){"use strict";
function tokens(s){return new Set(String(s||"").toLowerCase().match(/[a-z0-9]{3,}/g)||[])}
function select(memories,request,{limit=12,projectId}={}){const q=tokens(request);return (memories||[]).filter(m=>!projectId||!m.projectId||m.projectId===projectId).map(m=>{const t=tokens([m.title,m.text,...(m.tags||[])].join(" "));let s=0;for(const x of q)if(t.has(x))s++;s+=(m.priority||0);return {m,s}}).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,limit).map(x=>x.m)}
const API={select}; if(typeof module!=="undefined"&&module.exports)module.exports=API; else global.AIBrainMemorySelector=API;
})(typeof globalThis!=="undefined"?globalThis:this);
