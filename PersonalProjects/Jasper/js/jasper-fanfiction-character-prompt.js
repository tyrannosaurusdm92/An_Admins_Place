/* Jasper Fanfiction — character dialogue prompt builder. */
(function(global){'use strict';
function build(context,{request='continue the scene',explicitMode=false}={}){const reader=global.JasperFanfictionReader?.promptSummary?.()||'Reader-protagonist is Jasper.';const adultRule=explicitMode?'All sexual participants must be confirmed adults 18+. Keep any adult sex scene on-page; do not fade to black.':'Do not initiate explicit sex.';return ['Write in-character dialogue/actions for Jasper’s private fanfiction. ',reader,'Preserve canon characterization and the supplied relationship state.',adultRule,'Do not expose hidden reasoning; return story-facing prose/dialogue only.',`Request: ${request}`,JSON.stringify(context||{})].join('\n\n');}
global.JasperFanfictionCharacterPrompt=Object.freeze({build});
})(typeof globalThis!=='undefined'?globalThis:window);
