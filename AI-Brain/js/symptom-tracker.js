import { nowIso, clamp } from "./health-utils.js";
export function makeCheckIn(input={}){
  const scale=v=>v===undefined||v===null?null:clamp(Number(v),0,10);
  return {timestamp:input.timestamp||nowIso(), mood:scale(input.mood), anxiety:scale(input.anxiety), pain:scale(input.pain), fatigue:scale(input.fatigue), sleepHours:input.sleepHours==null?null:Number(input.sleepHours), notes:String(input.notes||"").slice(0,2000), tags:Array.isArray(input.tags)?input.tags.slice(0,20):[]};
}
export function trend(entries,key){ const vals=(entries||[]).map(e=>Number(e[key])).filter(Number.isFinite); if(vals.length<2) return {direction:"insufficient_data",change:null}; const change=vals.at(-1)-vals[0]; return {direction:change>1?"up":change<-1?"down":"stable",change}; }
