(function(root){'use strict';
const A=root.AIBrain=root.AIBrain||{};
const ACTIONS={create:['create','make','build','design','generate','write','draw','model','develop'],organize:['organize','sort','catalog','index','track','merge','consolidate','dedupe'],find:['find','search','locate','lookup','discover','retrieve'],repair:['fix','repair','debug','validate','audit','test','troubleshoot'],plan:['plan','strategy','roadmap','workflow','prioritize','decompose'],remember:['remember','continue','track state','keep track','continuity'],explain:['explain','teach','learn','understand'],compare:['compare','versus','difference','tradeoff'],support:['help me cope','support','check in','grounding','manage symptoms']};
const OBJECT_HINTS=[
 [/\b(book cover|cover design)\b/i,['books-publishing','art-design','typography','layout']],
 [/\b(ttrpg|tabletop rpg|character sheet|campaign|dice)\b/i,['ttrpg','game-design','worldbuilding','vtt-maps','strategy']],
 [/\b(mmorpg|persistent world|online rpg)\b/i,['mmorpg','game-design','simulation','worldbuilding','social-community','database-design']],
 [/\b(social (?:network|media)|community platform|messaging app)\b/i,['social-community','auth-security','privacy','safety-moderation','accessibility','web-apps']],
 [/\b(plot hole|continuity|canon|series timeline|character knowledge)\b/i,['story-intelligence','creative-writing','memory','project-scope']],
 [/\b(map|fog of war|battlemap|grid|pathfinding|token)\b/i,['vtt-maps','art-design','3d']],
 [/\b(3d|mesh|geometry|material|texture|render)\b/i,['3d','studio-tools','art-design']],
 [/\b(file|folder|directory|archive|dedup|duplicate versions?)\b/i,['file-intelligence','organization','project-management']],
 [/\b(autis|sensory|masking|meltdown|shutdown)\b/i,['autism','mental-health','accessibility']],
 [/\b(adhd|time blindness|executive function|task initiation)\b/i,['adhd','mental-health','organization','accessibility']],
 [/\b(dbt|wise mind|tipp|dear man|distress tolerance)\b/i,['dbt','mental-health']],
 [/\b(cbt|thought record|cognitive distortion|behavioral activation)\b/i,['cbt','mental-health']],
 [/\b(psychiatr|psychosis|mania|medication|clinician)\b/i,['psychiatry','healthcare','mental-health']],
 [/\b(symptom|injury|illness|pain|fatigue|physical health)\b/i,['physical-health','healthcare']],
 [/\b(conlang|phonology|lexicon|fictional language)\b/i,['language','worldbuilding','creative-writing']]
];
function compileRegistry(registry){if(registry?.domains)return registry;if(root.AIBrainCapabilityRegistry?.compile)return root.AIBrainCapabilityRegistry.compile(registry);return{domains:registry||{},aliases:{}};}
function add(scores,id,delta,reason){if(!id)return;if(!scores[id])scores[id]={score:0,reasons:[]};scores[id].score+=delta;if(reason&&!scores[id].reasons.includes(reason))scores[id].reasons.push(reason);}
function route(request,registry,opts={}){const reg=compileRegistry(registry),text=A.norm?A.norm(request):String(request||'').toLowerCase(),scores={},actions=[];
 for(const [action,terms] of Object.entries(ACTIONS)){let s=0;for(const term of terms){const q=A.norm?A.norm(term):term;if(text.includes(q))s+=q.includes(' ')?3:1.5;}if(s)actions.push({action,score:s});}
 for(const [id,d] of Object.entries(reg.domains||{})){let s=0;for(const phrase of [id,...(d.aliases||[]),...(d.synonyms||[]),...(d.keywords||[])]){const q=A.norm?A.norm(phrase):String(phrase).toLowerCase();if(!q)continue;if(text===q)s+=8;else if(text.includes(q))s+=q.includes(' ')?4:2;}if(s)add(scores,id,s,'explicit/alias match');for(const neg of d.negativeTriggers||[]){const q=A.norm?A.norm(neg):String(neg).toLowerCase();if(q&&text.includes(q))add(scores,id,-5,'negative trigger');}}
 for(const [rx,domains] of OBJECT_HINTS)if(rx.test(String(request||'')))domains.forEach((d,i)=>add(scores,d,3-Math.min(i*.15,1.2),'implied requirement'));
 for(const d of opts.projectDomains||opts.context?.projectDomains||[])add(scores,d,.8,'project context');
 for(const d of opts.requiredCapabilities||[])add(scores,d,10,'required by caller');
 for(const d of opts.excludedCapabilities||opts.negative||[])add(scores,d,-100,'excluded by caller');
 let expanded={};if(opts.expand!==false&&root.AIBrainDomainGraph?.expand)expanded=root.AIBrainDomainGraph.expand(Object.fromEntries(Object.entries(scores).map(([k,v])=>[k,v.score])),reg,{depth:opts.depth??1,decay:opts.decay??.12});
 for(const [id,s] of Object.entries(expanded))if(!scores[id]&&s>1.0)add(scores,id,s,'related-domain expansion');
 let selected=Object.entries(scores).filter(([,v])=>v.score>.35).sort((a,b)=>b[1].score-a[1].score).slice(0,opts.maxDomains||16).map(([domain,v])=>({domain,tag:domain,id:domain,score:+v.score.toFixed(3),why:v.reasons,reasons:v.reasons}));
 if(!selected.length)selected=[{domain:'conversation',tag:'conversation',id:'conversation',score:1,why:['fallback'],reasons:['fallback']}];
 actions.sort((a,b)=>b.score-a.score);return{request:String(request||''),text,primaryIntent:selected[0].domain,primary:selected[0].domain,selected,labels:selected,actions,aliases:[],registry:reg};}
A.classifyIntent=function(request,registries={}){return route(request,registries,{maxDomains:20});};
const API={route,classify:A.classifyIntent,ACTIONS,OBJECT_HINTS};root.AIBrainIntentRouter=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
