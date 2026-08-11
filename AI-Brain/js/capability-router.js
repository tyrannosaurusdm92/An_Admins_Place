(function(root){'use strict';
function detect(route,registry,subtasks=[]){const scores={};const reasons={};const add=(c,w,r)=>{scores[c]=(scores[c]||0)+w;(reasons[c]=reasons[c]||[]).push(r);};for(const x of route?.selected||[]){const id=x.domain||x.tag||x.id,def=registry?.domains?.[id]||registry?.[id]||{};for(const c of def.capabilities||[])add(c,Math.max(.5,Number(x.score)||1),`domain:${id}`);}for(const s of subtasks||[])if(s.kind)add(s.kind,.75,`subtask:${s.id}`);return Object.entries(scores).sort((a,b)=>b[1]-a[1]).map(([capability,score])=>({capability,score:+score.toFixed(3),reasons:reasons[capability]}));}
const API={detect};root.AIBrainCapabilityRouter=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
