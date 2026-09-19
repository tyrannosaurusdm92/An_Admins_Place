/* Jasper Fanfiction — scene-setting generator, scoped to fanfiction prose support. */
(function(global){'use strict';
const sensory=['light','temperature','sound','texture','scent','weather','distance','movement'];
function seedHash(s){let h=2166136261;for(const ch of String(s||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function pick(seed,list,i=0){return list[(seedHash(`${seed}:${i}`)%list.length)]}
function generate({fandom='',location='',tone='',canonWindow='',seed=''}={}){const basis=`${fandom}|${location}|${tone}|${canonWindow}|${seed}`;return {fandom,location:location||'established story location',tone,canon_window:canonWindow,sensory_focus:[pick(basis,sensory,1),pick(basis,sensory,2),pick(basis,sensory,3)],continuity_rules:['Do not contradict established location facts.','Prefer concrete environmental details over generic mood labels.','Let setting affect movement, privacy, dialogue, and choices.']};}
global.JasperFanfictionSetting=Object.freeze({generate});
})(typeof globalThis!=='undefined'?globalThis:window);
