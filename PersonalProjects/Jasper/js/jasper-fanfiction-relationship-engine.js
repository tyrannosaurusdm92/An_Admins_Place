/* Jasper Fanfiction — relationship-state helper for branches and continuity. */
(function(global){'use strict';
class JasperFanfictionRelationshipEngine{constructor(seed={}){this.state={trust:0,warmth:0,honesty:0,playfulness:0,boundaries:0,intimacy:0,...seed};}apply(effect={}){this.state=global.JasperFanfictionCharacterReactions?.apply?.(this.state,effect)||{...this.state,...effect};return this.snapshot();}set(name,value){this.state[name]=value;return this.snapshot();}get(name){return this.state[name];}snapshot(){return JSON.parse(JSON.stringify(this.state));}}
global.JasperFanfictionRelationshipEngine=JasperFanfictionRelationshipEngine;
})(typeof globalThis!=='undefined'?globalThis:window);
