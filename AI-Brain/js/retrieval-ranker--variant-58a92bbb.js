(function(global){"use strict";
function set(x){return new Set((x||[]).map(v=>String(v).toLowerCase()))}
function overlap(a,b){let n=0;for(const x of a)if(b.has(x))n++;return n}
function scoreShard(shard,route,ctx={}){
 const wanted=set((route?.selected||[]).map(x=>x.tag)); const tags=set([shard.domain,...(shard.tags||[]),...(shard.capabilities||[]),...(shard.intents||[])]);
 let s=overlap(wanted,tags)*5;
 const txt=String(ctx.request||route?.request||"").toLowerCase();
 (shard.triggers||[]).forEach(t=>{if(txt.includes(String(t).toLowerCase()))s+=3});
 (shard.negativeTriggers||[]).forEach(t=>{if(txt.includes(String(t).toLowerCase()))s-=8});
 if(shard.priority)s+=Number(shard.priority)||0;
 if(ctx.projectDomains) s+=overlap(set(ctx.projectDomains),tags)*2;
 if(shard.status==="deprecated")s-=100;
 return s;
}
function rank(shards,route,ctx={},limit=12){return (shards||[]).map(shard=>({shard,score:scoreShard(shard,route,ctx)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit)}
const API={scoreShard,rank}; if(typeof module!=="undefined"&&module.exports)module.exports=API; else global.AIBrainRetrievalRanker=API;
})(typeof globalThis!=="undefined"?globalThis:this);
