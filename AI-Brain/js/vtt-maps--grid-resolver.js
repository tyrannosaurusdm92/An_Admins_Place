/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function(global){
'use strict';
class GridResolver{
 constructor(manifest){this.grids=manifest?.grids||[];}
 choose(options={}){if(!this.grids.length)return null;const landscape=Number(options.partySize||4)>=5||Number(options.startingDistance||30)>60;const hints=landscape?['22x17','17x22']:['8-5x11','1x1','2x2'];let found=this.grids.find(g=>hints.some(h=>g.id.includes(h)));if(!found)found=this.grids[Math.abs(Number(options.seedHash||0))%this.grids.length];return found;}
}
global.RandomEncounterGrids={GridResolver};
}(window));
