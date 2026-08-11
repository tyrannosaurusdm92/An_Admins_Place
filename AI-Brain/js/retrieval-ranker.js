(function(root){'use strict';
const A=root.AIBrain=root.AIBrain||{};
const arr=x=>Array.isArray(x)?x:(x==null?[]:[x]);
function routeMap(route){const m=new Map();for(const x of route?.selected||route?.labels||[]){const id=x.domain||x.tag||x.id;if(id)m.set(String(id).toLowerCase(),Number(x.score)||1);}return m;}
function score(entry,route={},opts={}){entry=A.normalizeRecord?A.normalizeRecord(entry):entry;const request=A.norm?A.norm(opts.request||route.request||route.text||''):String(opts.request||'').toLowerCase(),chosen=routeMap(route),fields=[entry.path,entry.title,entry.domain,...arr(entry.domains),...arr(entry.relatedDomains),...arr(entry.capabilities),...arr(entry.tags),...arr(entry.keywords)].filter(Boolean).map(x=>String(x).toLowerCase());let s=0;const why=[];
 const lexical=(A.scoreTerms?A.scoreTerms(request,fields):0);if(lexical){s+=lexical;why.push('lexical');}
 for(const [d,w] of chosen){if(fields.some(x=>x===d||x.includes(d)||d.includes(x))){s+=3*w;why.push(`domain:${d}`);}}
 for(const term of arr(entry.triggers)){const t=String(term).toLowerCase();if(t&&request.includes(t)){s+=3;why.push(`trigger:${t}`);}}
 for(const term of arr(entry.negativeTriggers)){const t=String(term).toLowerCase();if(t&&request.includes(t)){s-=8;why.push(`negative:${t}`);}}
 if(opts.projectType&&arr(entry.projectTypes).map(String).map(x=>x.toLowerCase()).includes(String(opts.projectType).toLowerCase())){s+=1.5;why.push('project-type');}
 if(opts.projectDomains)for(const d of opts.projectDomains)if(fields.includes(String(d).toLowerCase())){s+=2;why.push(`project-domain:${d}`);}
 if(entry.status==='deprecated'||entry.status==='superseded')s-=100;if(entry.priority!=null)s+=Number(entry.priority)||0;const confidence=entry.confidence==null?1:Math.max(.1,Math.min(1,Number(entry.confidence)||1));s*=confidence;return{score:s,why,reasons:why};}
function rank(entries,route={},opts={}){const limit=opts.limit||opts.maxResults||24;return(entries||[]).map(entry=>({entry,...score(entry,route,opts)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||String(a.entry.path||'').localeCompare(String(b.entry.path||''))).slice(0,limit);}
function scoreShard(shard,route,ctx={}){return score(shard,route,ctx).score;}
A.rankKnowledge=function(query,entries,route={},opts={}){return rank(entries,{...route,request:query},{...opts,request:query,limit:opts.maxResults||opts.limit||12});};
const API={score,rank,scoreShard};root.AIBrainRetrievalRanker=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
