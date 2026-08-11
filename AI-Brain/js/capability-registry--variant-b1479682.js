(function(global){
"use strict";
const FAMILIES={
 conversation:{tags:["conversation","memory","persona","roleplay","summarization","interviewing"],related:["organization","safety-moderation"]},
 creative:{tags:["writing","story","plot","continuity","character","worldbuilding","timeline","editing","publishing","book"],related:["art-design","language","organization"]},
 visual:{tags:["art","image","3d","layout","branding","maps","studio","brush","crop","shape","effects","layers","typography"],related:["books-publishing","vtt-maps","accessibility"]},
 games:{tags:["game-design","ttrpg","mmorpg","vtt","rules","encounter","quest","npc","simulation","strategy","economy"],related:["worldbuilding","probability","organization"]},
 software:{tags:["code","web","mobile","pwa","api","database","auth","testing","debugging","refactor","schema","automation"],related:["file-intelligence","accessibility","safety-moderation"]},
 organization:{tags:["organize","files","classify","dedupe","merge","version","tags","search","tasks","schedule","workflow","audit"],related:["file-intelligence","strategy"]},
 social:{tags:["social-media","messaging","profiles","community","discovery","moderation","privacy","notifications","permissions"],related:["auth-security","safety-moderation","accessibility"]},
 health:{tags:["healthcare","mental-health","psychiatry","adhd","autism","cbt","dbt","trauma","physical-health","life-events"],related:["accessibility","organization","safety-moderation"]},
 research:{tags:["science","research","evidence","sources","compare","explain","education","reference"],related:["provenance","organization"]},
 safety:{tags:["safety","privacy","consent","accessibility","captions","auditability","human-review"],related:["auth-security","social-community"]}
};
const SYNONYMS={
 "cover":["book-design","art-design","typography","layout","branding","publishing"],
 "tabletop":["ttrpg","rules","character-creation","dice","encounters","campaigns"],
 "rpg":["game-design","progression","character-creation","items","quests","balancing"],
 "map":["vtt-maps","worldbuilding","geometry","layers","navigation"],
 "social network":["social-community","auth-security","messaging","moderation","privacy"],
 "sort files":["file-intelligence","organization","dedupe","versioning","manifest"],
 "3d":["art-design","3d-editing","materials","lighting","camera","transform"],
 "brush":["studio-tools","painting","color","texture","stroke"],
 "crop":["studio-tools","selection","transform","composition"],
 "npc":["persona-agents","worldbuilding","state","goals","knowledge-boundary"]
};
function normalize(x){return String(x||"").toLowerCase().normalize("NFKD").replace(/[^a-z0-9+.#-]+/g," ").trim();}
function allTags(){return [...new Set(Object.values(FAMILIES).flatMap(x=>x.tags))];}
const API={families:FAMILIES,synonyms:SYNONYMS,normalize,allTags};
if(typeof module!=="undefined"&&module.exports)module.exports=API; else global.AIBrainCapabilityRegistry=API;
})(typeof globalThis!=="undefined"?globalThis:this);
