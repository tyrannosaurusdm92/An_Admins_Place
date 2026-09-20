/* Jasper Fanfiction — dialogue-provider adapter. All generation uses Apps Script and carries writer-reference context. */
(function(global){'use strict';
function providers(){const fn=global.JASPER_FANFIC_BACKEND_PROVIDER;return typeof fn==='function'?[fn]:[];}
async function generate(context,options={}){
  const prompt=global.JasperFanfictionCharacterPrompt?.build?.(context,options)||JSON.stringify(context);
  const provider=providers()[0];if(!provider)throw new Error('Jasper fanfiction Apps Script backend provider is not connected.');
  const active=options.series||context?.series||{};
  const refOptions=global.JasperFanfictionCharacterPrompt?.referenceOptions?.(context,active,options.request||'continue dialogue')||{query:prompt,character:active.pairing||''};
  const influence=global.StoryTools?.JasperWriterReference?.buildBridgeInfluencePacket?.(refOptions)||context?.writer_reference||null;
  return provider({prompt,context:{...(context||{}),writer_reference:influence},writerReferenceInfluence:influence,mode:'jasper_fanfiction_dialogue'});
}
global.JasperFanfictionCharacterDialogue=Object.freeze({providers,generate});
})(typeof globalThis!=='undefined'?globalThis:window);
