/* Jasper Fanfiction — integration diagnostics.
   Non-destructive runtime self-test for the merged CYOA/material/bridge stack. */
(function(global){'use strict';
const VERSION='2026-09-20.4-full-integration';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
let last=null;
function check(name,ok,detail=''){return {name,ok:Boolean(ok),detail:String(detail||'')};}
async function run(){
  const rows=[];
  rows.push(check('adult contract',global.JasperFanfictionAdultContract,'JasperFanfictionAdultContract'));
  rows.push(check('private runtime spec',global.JasperFanfictionPrivateSpec,'JasperFanfictionPrivateSpec'));
  rows.push(check('William writing-style helper',global.JasperFanfictionWriting,'JasperFanfictionWriting'));
  rows.push(check('William writer-reference corpus',global.StoryTools?.JasperWriterReference,'StoryTools.JasperWriterReference'));
  rows.push(check('CYOA branch builder',global.JasperFanfictionBranches,'JasperFanfictionBranches'));
  rows.push(check('specialist runtime',global.JasperFanfictionRuntime,'JasperFanfictionRuntime'));
  rows.push(check('character library',global.JasperFanfictionCharacterLibrary,'JasperFanfictionCharacterLibrary'));
  rows.push(check('People+Places runtime',global.PeoplePlaces,'PeoplePlaces'));
  rows.push(check('Material Hub',global.JasperFanfictionMaterialHub,'JasperFanfictionMaterialHub'));
  rows.push(check('backend provider',typeof global.JASPER_FANFIC_BACKEND_PROVIDER==='function','JASPER_FANFIC_BACKEND_PROVIDER'));
  rows.push(check('explicit bridge',global.JasperExplicitBridge,'JasperExplicitBridge'));
  rows.push(check('CYOA story engine',global.CYOAStoryEngine,'CYOAStoryEngine'));
  rows.push(check('output validator',global.JasperFanfictionOutputValidator,'JasperFanfictionOutputValidator'));
  rows.push(check('continuity memory',global.JasperFanfictionContinuityMemory,'JasperFanfictionContinuityMemory'));
  rows.push(check('story graph',global.JasperFanfictionStoryGraph,'JasperFanfictionStoryGraph'));
  rows.push(check('relationship engine',global.JasperFanfictionRelationshipEngine,'JasperFanfictionRelationshipEngine'));
  rows.push(check('character prompt',global.JasperFanfictionCharacterPrompt,'JasperFanfictionCharacterPrompt'));

  let material=null,catalog=null;
  try{material=await global.JasperFanfictionMaterialHub?.load?.();}catch(error){rows.push(check('Material Hub load',false,error?.message||error));}
  if(material) rows.push(check('Material Hub load',true,'manifest + character support + uploaded guide loaded'));
  try{catalog=await global.JasperFanfictionCharacterLibrary?.materialCatalog?.();}catch(error){rows.push(check('character catalog load',false,error?.message||error));}
  if(catalog){
    rows.push(check('159 unified profiles',Number(catalog.profile_count)===159,`count=${catalog.profile_count}`));
    rows.push(check('134 research profiles',Number(catalog.research_profile_count)===134,`count=${catalog.research_profile_count}`));
  }
  const guideCount=Number(material?.guide?.section_count||global.JasperFanfictionMaterialHub?.snapshot?.()?.guide?.section_count||0);
  rows.push(check('uploaded research guide runtime index',guideCount>=30,`sections=${guideCount}`));

  const bridge=global.JasperExplicitBridge?.snapshot?.()||{};
  rows.push(check('bridge provider wrapper installed',bridge.providerWrapped===true,`wrapped=${bridge.providerWrapped}`));
  rows.push(check('private instructions configured',bridge.privateInstructionsConfigured===true,`configured=${bridge.privateInstructionsConfigured}`));

  const failed=rows.filter(x=>!x.ok);
  last={version:VERSION,ok:failed.length===0,checked_at:new Date().toISOString(),checks:rows,failed};
  try{global.dispatchEvent(new CustomEvent('jasper:integration-diagnostics',{detail:clone(last)}));}catch(_e){}
  if(failed.length)console.warn('Jasper fanfiction integration diagnostics found issues.',last);
  else console.info('Jasper fanfiction integration diagnostics passed.',last);
  return clone(last);
}
function snapshot(){return clone(last);}
global.JasperFanfictionIntegrationDiagnostics=Object.freeze({VERSION,run,snapshot});
if(global.addEventListener)global.addEventListener('load',()=>{setTimeout(()=>run().catch(error=>console.warn('Jasper diagnostics failed.',error)),100);},{once:true});
})(typeof globalThis!=='undefined'?globalThis:window);
