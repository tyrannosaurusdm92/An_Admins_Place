(function(root){'use strict';
const ACTION_CAPS={create:['requirements','design','creation','validation'],organize:['inventory','classification','deduplication','indexing'],find:['query-analysis','retrieval','ranking'],repair:['diagnosis','repair','validation','regression-check'],plan:['goal-analysis','dependency-analysis','prioritization','sequencing'],remember:['scope-selection','memory-retrieval','continuity-check'],compare:['criteria-selection','comparison','tradeoff-analysis'],explain:['concept-selection','explanation','examples'],support:['safety-check','support-selection','next-step-planning']};
function decompose(request,route={},opts={}){const actions=(route.actions||[]).map(x=>x.action),domains=(route.selected||route.labels||[]).map(x=>x.domain||x.id||x.tag).filter(Boolean),steps=[];const seen=new Set();const push=(id,kind,domain,why)=>{const key=[id,domain].join('|');if(seen.has(key))return;seen.add(key);steps.push({id,kind,domain,why,priority:steps.length+1});};
 for(const action of actions.slice(0,3))for(const cap of ACTION_CAPS[action]||[])push(`${action}:${cap}`,cap,null,`implied by ${action}`);
 for(const domain of domains.slice(0,opts.maxDomains||10)){push(`domain:${domain}:retrieve`,'retrieve-knowledge',domain,'selected domain');push(`domain:${domain}:apply`,'apply-specialized-capability',domain,'selected domain');}
 if(domains.length>1)push('cross-domain:synthesize','cross-domain-synthesis',null,'multiple disciplines selected');
 if(!steps.length)push('general:understand','request-analysis',domains[0]||'conversation','fallback');
 return steps;
}
const API={decompose,ACTION_CAPS};root.AIBrainTaskDecomposer=API;root.AIBrain=root.AIBrain||{};root.AIBrain.decomposeTask=decompose;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
