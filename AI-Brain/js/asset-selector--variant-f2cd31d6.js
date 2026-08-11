(function(global){"use strict";
function tokens(s){return new Set(String(s||"").toLowerCase().match(/[a-z0-9]{2,}/g)||[])}
function score(a,q){const t=tokens([a.name,a.category,...(a.tags||[])].join(" "));let n=0;for(const x of q)if(t.has(x))n++;return n}
function select(index,request,{limit=20,types}={}){const q=tokens(request);return (index||[]).filter(a=>!types||types.includes(a.category)).map(a=>({a,s:score(a,q)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,limit).map(x=>x.a)}
const API={select};if(typeof module!=="undefined"&&module.exports)module.exports=API;else global.AIBrainAssetSelector=API;
})(typeof globalThis!=="undefined"?globalThis:this);
