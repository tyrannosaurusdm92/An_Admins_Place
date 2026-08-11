(function(root){'use strict';
function toMap(scores){const out={};if(Array.isArray(scores))for(const x of scores){const id=x.domain||x.tag||x.id;if(id)out[id]=Number(x.score)||1;}else for(const [k,v] of Object.entries(scores||{}))out[k]=typeof v==='number'?v:Number(v?.score)||0;return out;}
function expand(scores,registry,{depth=1,decay=.12,min=.2}={}){const base=toMap(scores),out={...base},queue=Object.entries(base).map(([id,score])=>({id,score,level:0}));while(queue.length){const cur=queue.shift();if(cur.level>=depth)continue;const def=registry?.domains?.[cur.id]||registry?.[cur.id];if(!def)continue;for(const rel of [...(def.related||[]),...(def.implies||[])]){const next=cur.score*Math.pow(decay,cur.level+1);if(next<min)continue;out[rel]=(out[rel]||0)+next;if(cur.level+1<depth)queue.push({id:rel,score:next,level:cur.level+1});}}return out;}
function neighbors(id,registry){const d=registry?.domains?.[id]||registry?.[id]||{};return[...new Set([...(d.related||[]),...(d.implies||[])])];}
const API={expand,neighbors};root.AIBrainDomainGraph=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
