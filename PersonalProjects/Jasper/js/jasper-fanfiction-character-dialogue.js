/* Jasper Fanfiction — dialogue-provider adapter. */
(function(global){'use strict';
function providers(){return [global.JASPER_FANFIC_DIALOGUE_PROVIDER,global.JASPER_FANFIC_PROVIDER,global.StoryGenerationProvider?.generate,global.StoryAI?.generate].filter(fn=>typeof fn==='function');}
async function generate(context,options={}){const prompt=global.JasperFanfictionCharacterPrompt?.build?.(context,options)||JSON.stringify(context);for(const provider of providers()){try{const result=await provider({prompt,context,mode:'jasper_fanfiction_dialogue'});if(result!=null)return result;}catch(error){console.warn('Jasper fanfiction dialogue provider failed.',error);}}return null;}
global.JasperFanfictionCharacterDialogue=Object.freeze({providers,generate});
})(typeof globalThis!=='undefined'?globalThis:window);
