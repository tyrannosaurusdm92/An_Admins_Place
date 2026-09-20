/* Jasper Fanfiction — dialogue-provider adapter. */
(function(global){'use strict';
function providers(){return [...new Set([global.JASPER_FANFIC_BACKEND_PROVIDER,global.JASPER_FANFIC_DIALOGUE_PROVIDER,global.JASPER_FANFIC_PROVIDER].filter(fn=>typeof fn==='function'))];}
async function generate(context,options={}){const prompt=global.JasperFanfictionCharacterPrompt?.build?.(context,options)||JSON.stringify(context);const list=providers();if(!list.length)throw new Error('Jasper fanfiction backend provider is not connected.');let last=null;for(const provider of list){try{const result=await provider({prompt,context,mode:'jasper_fanfiction_dialogue'});if(result!=null)return result;}catch(error){last=error;console.warn('Jasper fanfiction backend dialogue generation failed.',error);}}throw last||new Error('Jasper fanfiction backend returned no dialogue generation result.');}
global.JasperFanfictionCharacterDialogue=Object.freeze({providers,generate});
})(typeof globalThis!=='undefined'?globalThis:window);
