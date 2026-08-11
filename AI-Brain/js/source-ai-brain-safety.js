const patterns={
  imminent:/\b(kill myself|suicide now|end my life|overdose now|hurt myself now|kill (him|her|them)|hurt (him|her|them) now)\b/i,
  medical:/\b(diagnos|medication|dose|prescription|psychiatr|symptom|treatment|medical|therapy)\b/i,
  abuse:/\b(abuse|assault|domestic violence|stalking|coercion|exploitation)\b/i
};
export function safetyRoute(text){const flags=Object.fromEntries(Object.entries(patterns).map(([k,r])=>[k,r.test(String(text||""))]));return {flags,priority:flags.imminent?"urgent":(flags.medical||flags.abuse?"elevated":"standard"),rules:["do not invent diagnoses","distinguish education from medical advice","use evidence and uncertainty","escalate imminent danger to local emergency/crisis resources","protect privacy","do not roleplay authority you do not have"]};}
