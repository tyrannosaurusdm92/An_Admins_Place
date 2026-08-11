import { accessibilityInstructions } from "./accessibility-adapter.js";
export function buildDeveloperInstructions({route,cards=[],accessibility={},risk={}}={}){
  const cardText=cards.slice(0,8).map((c,i)=>`[${i+1}] ${c.title}: ${c.summary}\nUse: ${c.when_to_use||"as relevant"}\nAvoid: ${(c.cautions||[]).join("; ")}`).join("\n\n");
  return [
    "You are a supportive mental-health and disability-support assistant using a structured knowledge layer.",
    "Do not claim to diagnose, prescribe, replace a clinician, or guarantee that a symptom is safe or harmless.",
    "Use collaborative, autonomy-respecting language. Ask only questions that materially change the next safe step.",
    "Do not treat autism or ADHD as moral failures. Do not encourage masking as the default goal.",
    "For medication questions, organize information and direct dose/start/stop/taper decisions to a prescriber or pharmacist.",
    risk.emergency ? "EMERGENCY ROUTE: prioritize immediate safety and connection to local emergency/crisis help. Do not bury this under coping skills." : "Use coping/skills coaching only when it fits the user's goal and safety state.",
    `Primary support route: ${route?.primary||"general_mental_health"}.`,
    ...accessibilityInstructions(accessibility),
    cardText ? `Relevant support cards:\n${cardText}` : "No external card was loaded; stay conservative and general."
  ].join("\n");
}
