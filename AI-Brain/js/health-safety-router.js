import { normalizeText } from "./health-utils.js";

const PATTERNS = {
  selfHarmIntent: /(i (?:want|plan|intend|am going) to (?:die|kill myself|end my life)|suicide plan|i can't stay safe|i cannot stay safe|i have the (?:pills|gun|weapon|means))/i,
  selfHarmConcern: /(suicid|self[- ]?harm|cut myself|wish i were dead|don't want to be alive|do not want to be alive)/i,
  violenceIntent: /(i (?:want|plan|intend|am going) to (?:kill|shoot|stab|hurt) (?:him|her|them|someone|people)|homicid)/i,
  overdose: /(overdose|took too many|double dose|swallowed a bottle|poisoning)/i,
  severeBreathing: /(can't breathe|cannot breathe|stopped breathing|severe shortness of breath|blue lips|turning blue)/i,
  severeChest: /(severe chest (?:pain|pressure)|crushing chest|chest pain.*(?:sweat|shortness of breath|dizz|nausea))/i,
  strokeLike: /(face droop|sudden.*(?:arm|leg).*weak|sudden.*slurred speech|suddenly can't speak|suddenly cannot speak)/i,
  alteredMentalStatus: /(unresponsive|won't wake|will not wake|passed out and won't|sudden confusion|can't tell what is real and.*danger)/i,
  severeAllergy: /(anaphyl|throat closing|severe allergic.*(?:breath|swelling))/i
};

export function assessImmediateRisk(message) {
  const text = normalizeText(message);
  const hits = Object.entries(PATTERNS).filter(([,re])=>re.test(text)).map(([k])=>k);
  const emergency = hits.some(h => ["selfHarmIntent","violenceIntent","overdose","severeBreathing","severeChest","strokeLike","alteredMentalStatus","severeAllergy"].includes(h));
  const elevated = emergency || hits.includes("selfHarmConcern");
  return { emergency, elevated, hits, action: emergency ? "emergency_escalation" : elevated ? "support_and_direct_assessment" : "normal_support" };
}

export function emergencyMessage({country="", us988=false}={}) {
  const lines = [
    "This could be an emergency. Please contact your local emergency service or go to the nearest emergency department now if there is immediate danger, a possible overdose, severe breathing trouble, severe chest pain/pressure, sudden stroke-like symptoms, or someone cannot be kept safe.",
    "If you can, stay with the person, move away from immediate hazards, and involve a trusted person or clinician while help is being contacted."
  ];
  if (us988 && String(country).toUpperCase()==="US") lines.push("In the United States, call or text 988 for suicide, mental-health, or substance-use crisis support; use 911 for life-threatening emergencies.");
  return lines.join(" ");
}
