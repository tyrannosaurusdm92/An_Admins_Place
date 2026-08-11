(function(root){'use strict';
const A=root.AIBrain=root.AIBrain||{};
function idsOf(labels){return(labels||[]).map(x=>typeof x==='string'?x:(x.domain||x.id||x.tag)).filter(Boolean);}
function infer(labels,relationsOrRegistry,opts={}){const ids=idsOf(labels),selected=new Set(ids),out=new Map(),reg=relationsOrRegistry?.domains||relationsOrRegistry||{};for(const id of ids){const r=reg[id]||relationsOrRegistry?.relations?.[id]||{};for(const d of r.implies||r.requires||[])if(!selected.has(d)){const x=out.get(d)||{weight:0,reasons:[]};x.weight+=2;x.reasons.push(`implied/required by ${id}`);out.set(d,x);}for(const d of r.related||[])if(!selected.has(d)){const x=out.get(d)||{weight:0,reasons:[]};x.weight+=.3;x.reasons.push(`related to ${id}`);out.set(d,x);}}
 return[...out].filter(([,x])=>x.weight>=(opts.relatedThreshold||.6)).sort((a,b)=>b[1].weight-a[1].weight).slice(0,opts.limit||20).map(([id,x])=>({id,domain:id,weight:x.weight,score:x.weight,reason:x.reasons.join('; '),reasons:x.reasons}));}
A.inferDependencies=infer;root.AIBrainDependencyInference={infer};if(typeof module!=='undefined'&&module.exports)module.exports=root.AIBrainDependencyInference;
})(typeof globalThis!=='undefined'?globalThis:this);
