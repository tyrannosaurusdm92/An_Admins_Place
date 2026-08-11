(function(global){"use strict";
const KINDS=["npc","character","world","location","settlement","faction","organization","species","culture","item","quest","scene","outline","plot","language","timeline","encounter","dialogue","lore","document","workflow","component","schema","checklist","record","generic"];
function infer(text){const t=String(text||"").toLowerCase();for(const k of KINDS)if(new RegExp("\\b"+k.replace("-","\\s+")+"s?\\b").test(t))return k;return "generic"}
const API={KINDS,infer};if(typeof module!=="undefined"&&module.exports)module.exports=API;else global.AIBrainGenerationRouter=API;
})(typeof globalThis!=="undefined"?globalThis:this);
