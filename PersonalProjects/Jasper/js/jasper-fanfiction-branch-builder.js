/* Jasper Fanfiction — material CYOA branch/choice builder. */
(function(global){'use strict';
const templates=[
 {path_key:'direct',label:'Say what I actually mean',description:'Choose honesty and let the next scene deal with the consequence.',effect:{trust:1,honesty:1}},
 {path_key:'playful',label:'Make it playful',description:'Use humor or flirtation without dodging what matters.',effect:{warmth:1,playfulness:1}},
 {path_key:'curious',label:'Ask the question underneath it',description:'Follow the unresolved thread and learn what the safer route would miss.',effect:{curiosity:1,insight:1}},
 {path_key:'careful',label:'Slow down and set the boundary',description:'Protect consent, pacing, and clarity before the next step.',effect:{boundaries:1,trust:1}},
 {path_key:'act',label:'Stop circling it and act',description:'Turn emotion into a concrete action that changes the immediate situation.',effect:{resolve:1,momentum:1}}
];
function makeChoices({seriesKey='story',chapterNumber=1,count=3,target='@generate',seed=''}={}){count=Math.max(3,Math.min(5,Number(count)||3));return templates.slice(0,count).map((c,i)=>({...c,id:`${seriesKey}-${String(chapterNumber).padStart(2,'0')}-${c.path_key}-${i+1}`,target,generation_hint:c.description,seed_hint:seed||undefined}));}
function bridge(choice){return choice?`Carry forward the concrete consequence of “${choice.label},” including its effect on trust, knowledge, boundaries, location, and the unresolved problem.`:'';}
global.JasperFanfictionBranches=Object.freeze({templates,makeChoices,bridge});
})(typeof globalThis!=='undefined'?globalThis:window);
