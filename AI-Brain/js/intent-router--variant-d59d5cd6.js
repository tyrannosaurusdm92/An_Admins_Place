(function(global){"use strict";
const R=global.AIBrainCapabilityRegistry||{families:{},synonyms:{},normalize:s=>String(s||"").toLowerCase()};
const IMPLICIT=[
 {test:/book|novel|cover|publishing/,add:["books-publishing","typography","layout","art-design"]},
 {test:/ttrpg|tabletop|campaign|dice|character sheet/,add:["ttrpg","game-design","rules","worldbuilding","vtt-maps","balancing"]},
 {test:/social media|social network|community|messaging/,add:["social-community","auth-security","privacy","safety-moderation","accessibility"]},
 {test:/game|mmorpg|rpg/,add:["game-design","simulation","strategy","progression","balancing"]},
 {test:/world|galaxy|planet|city|settlement|culture/,add:["worldbuilding","simulation","timeline","organization"]},
 {test:/code|javascript|html|css|api|backend|frontend|debug/,add:["code","web-apps","testing","accessibility"]},
 {test:/image|art|paint|brush|crop|shape|layer|effect|3d|perspective|texture/,add:["art-design","studio-tools","composition","transform"]},
 {test:/file|folder|merge|dedup|version|organize|sort/,add:["file-intelligence","organization","provenance"]},
 {test:/npc|character persona|bot|agent|companion/,add:["persona-agents","state","goals","knowledge-boundary"]},
 {test:/map|grid|fog|lighting|route|geojson|svg/,add:["vtt-maps","geometry","layers"]},
 {test:/memory|remember|continuity|canon|timeline/,add:["memory","story-intelligence","project-scope","provenance"]},
 {test:/health|psychiatr|therapy|autism|adhd|dbt|cbt|trauma/,add:["healthcare","mental-health","safety-moderation","accessibility"]}
];
function route(request,ctx={}){
 const text=R.normalize(request); const scores=new Map(),reasons=new Map();
 const add=(tag,n,why)=>{scores.set(tag,(scores.get(tag)||0)+n); if(why){const a=reasons.get(tag)||[];a.push(why);reasons.set(tag,a)}};
 Object.entries(R.families||{}).forEach(([fam,data])=>data.tags.forEach(tag=>{if(text.includes(tag.replace(/-/g," "))||text.includes(tag)){add(tag,5,"explicit token");add(fam,1,"family match")}}));
 Object.entries(R.synonyms||{}).forEach(([phrase,tags])=>{if(text.includes(phrase))tags.forEach(t=>add(t,4,"synonym/compound: "+phrase))});
 IMPLICIT.forEach(r=>{if(r.test.test(text))r.add.forEach(t=>add(t,2,"implied dependency"))});
 (ctx.projectTags||[]).forEach(t=>add(t,1.5,"project context"));
 (ctx.requiredCapabilities||[]).forEach(t=>add(t,8,"required capability"));
 (ctx.excludedCapabilities||[]).forEach(t=>add(t,-100,"explicit exclusion"));
 const selected=[...scores].filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([tag,score])=>({tag,score,reasons:reasons.get(tag)||[]}));
 return {request:String(request||""),primary:selected[0]?.tag||"conversation",selected:selected.slice(0,24),debug:{candidateCount:scores.size,context:ctx}};
}
const API={route}; if(typeof module!=="undefined"&&module.exports)module.exports=API; else global.AIBrainIntentRouter=API;
})(typeof globalThis!=="undefined"?globalThis:this);
