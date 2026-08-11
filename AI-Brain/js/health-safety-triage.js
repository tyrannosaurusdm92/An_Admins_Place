const IMMINENT=/\b(suicid(e|al)|kill myself|end my life|want to die|self[- ]?harm)\b.*\b(plan|tonight|now|means|gun|knife|pills|overdose|method)\b|\b(overdose|poison(ed|ing))\b/i;
const VIOLENCE=/\b(kill|shoot|stab|attack)\b.{0,40}\b(someone|him|her|them|people)\b/i;
const MEDICAL=/\b(chest pain|can(?:not|'t) breathe|severe shortness of breath|face droop|one[- ]sided weakness|new slurred speech|unresponsive|seizure lasting)\b/i;
export function triage(text=''){
  if(IMMINENT.test(text)) return {level:'emergency',route:'self_harm_crisis'};
  if(VIOLENCE.test(text)) return {level:'emergency',route:'violence_crisis'};
  if(MEDICAL.test(text)) return {level:'emergency',route:'medical_emergency'};
  return {level:'standard',route:null};
}
export function crisisResponse(route,country='US'){
  const us=country==='US'?' If you are in the U.S. or its territories, call or text 988.':'';
  if(route==='medical_emergency') return 'This may need urgent medical attention. Contact local emergency services or go to the nearest emergency department now.';
  return 'Immediate safety comes first. Contact local emergency services or a crisis service now, and stay with a trusted person if possible.'+us;
}
