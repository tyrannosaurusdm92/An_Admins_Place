/* Jasper Fanfiction — story-first CYOA branch builder with writer-reference/memory requirements. */
(function(global){'use strict';
const templates=Object.freeze([
 {path_key:'direct',label:'Say the honest thing',description:'Choose clarity and let the relationship respond to the truth.',effect:{trust:1,honesty:1}},
 {path_key:'playful',label:'Make it a joke',description:'Use humor or teasing without erasing the feeling underneath it.',effect:{warmth:1,playfulness:1}},
 {path_key:'vulnerable',label:'Let the guard down',description:'Risk a more vulnerable response and let it change the conversation.',effect:{trust:1,vulnerability:1}},
 {path_key:'plot',label:'Follow the story thread',description:'Prioritize the mystery, conflict, task, or external plot currently in motion.',effect:{plot:1}},
 {path_key:'private-handoff',label:'Take the private route',description:'Pause the normal writer at the private-interlude seam, preserve continuity, and hand the bounded interlude to the existing private bridge.',effect:{intimacy:1,trust:1},private_handoff:true}
]);
const STYLE_REQUIREMENTS=Object.freeze(['William-style scene craft/cadence without copying','Jasper first-person POV','canon-specific dialogue voice','slow-build continuity','concrete sensory/physical anchors','emotional consequence and forward pull']);
const MEMORY_REQUIREMENTS=Object.freeze(['selected choice','current dialogue thread','relationship changes','open plot threads','callbacks/favorite details','boundaries/promises','objects/locations','Jasper emotional state']);
function decorate(c,{seriesKey,chapterNumber,index,seed,target,seriesTitle='',fandom='',pairing=''}){
 const query=[fandom,seriesTitle,pairing,`chapter ${chapterNumber}`,c.label,c.description].filter(Boolean).join(' · ');
 return {...c,id:`${seriesKey}-${String(chapterNumber).padStart(2,'0')}-${c.path_key}-${index+1}`,target,generation_hint:c.description,seed_hint:seed||undefined,writer_reference_query:query,style_requirements:[...STYLE_REQUIREMENTS],memory_requirements:[...MEMORY_REQUIREMENTS]};
}
function makeChoices({seriesKey='story',seriesTitle='',fandom='',pairing='',chapterNumber=1,count=4,target='@generate',seed='',includePrivateHandoff=true,relationshipStage=''}={}){
 count=Math.max(3,Math.min(5,Number(count)||4));
 const meta={seriesKey,seriesTitle,fandom,pairing,chapterNumber,seed};
 const low=String(pairing||seriesTitle||'').toLowerCase();
 const lane=low.includes('danse')?'danse':low.includes('snape')||low.includes('severus')?'snape':low.includes('iroh')?'iroh':low.includes('greg')?'greg':(low.includes('aang')||low.includes('katara')||low.includes('toph'))?'polycule':'general';
 const laneTemplates={
  iroh:[{path_key:'direct',label:'Tell Iroh what I actually mean',description:'Choose the truth underneath the joke.',effect:{trust:1,honesty:1}},{path_key:'playful',label:'Tease Iroh and see if he plays back',description:'Use humor as connection rather than escape.',effect:{warmth:1,playfulness:1}},{path_key:'curious',label:'Ask the question beneath the tea',description:'Follow the unresolved emotional thread.',effect:{curiosity:1,insight:1}}],
  greg:[{path_key:'direct',label:'Say the serious part before I make it funny',description:'Choose honesty before humor becomes an escape hatch.',effect:{trust:1,honesty:1}},{path_key:'playful',label:'Make Greg laugh and keep going',description:'Let the joke carry the real feeling instead of replacing it.',effect:{warmth:1,playfulness:1}},{path_key:'plot',label:'Follow the problem outside the van',description:'Keep the external story moving alongside the relationship.',effect:{plot:1}}],
  snape:[{path_key:'direct',label:'Answer Snape plainly',description:'Meet precision with precision.',effect:{trust:1,honesty:1}},{path_key:'careful',label:'Give him silence and watch what he does',description:'Let behavior answer before forcing a declaration.',effect:{patience:1,insight:1}},{path_key:'plot',label:'Follow the practical problem first',description:'Let work, consequence, or danger pressure the relationship naturally.',effect:{plot:1}}],
  danse:[{path_key:'direct',label:'Make Danse explain the plan',description:'Ask for reasoning rather than relying on authority.',effect:{insight:1,honesty:1}},{path_key:'careful',label:'Take the tactical route and watch the cost',description:'Use structure without switching off my own judgment.',effect:{trust:1,plot:1}},{path_key:'plot',label:'Protect the people the mission forgets',description:'Keep the external moral stakes concrete.',effect:{plot:1,resolve:1}}],
  polycule:[{path_key:'direct',label:'Tell them what I need',description:'Keep Jasper’s needs visible inside the group.',effect:{trust:1,honesty:1}},{path_key:'curious',label:'Let everyone answer for themself',description:'Make room for distinct voices instead of group-mind agreement.',effect:{curiosity:1,insight:1}},{path_key:'plot',label:'Solve the problem we actually share',description:'Move the public/work plot without pretending every relationship issue is settled.',effect:{plot:1}}]
 };
 const source=laneTemplates[lane]||templates.filter(c=>!c.private_handoff);
 const privateReady=!relationshipStage||['testing_power_play','established_dynamic','integrated_trust'].includes(String(relationshipStage));
 const includePrivate=Boolean(includePrivateHandoff&&privateReady);
 const ordinaryCount=includePrivate?Math.max(2,count-1):count;
 const expanded=[...source,...templates.filter(c=>!c.private_handoff&&!source.some(s=>s.path_key===c.path_key))];
 const ordinary=expanded.slice(0,ordinaryCount).map((c,i)=>decorate(c,{...meta,index:i,target:'@generate'}));
 if(includePrivate){const c=templates.find(x=>x.private_handoff);ordinary.push(decorate(c,{...meta,index:ordinary.length,target:'@generate-explicit-detailed'}));}
 return ordinary.slice(0,count);
}
global.JasperFanfictionBranches=Object.freeze({templates,STYLE_REQUIREMENTS,MEMORY_REQUIREMENTS,makeChoices});
})(typeof globalThis!=='undefined'?globalThis:window);
