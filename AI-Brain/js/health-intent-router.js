import { normalizeText, unique } from "./health-utils.js";

const ROUTES = [
  ["crisis", /(suicid|kill myself|end my life|self[- ]?harm|overdose|can't stay safe|cannot stay safe|hurt someone|kill someone)/i, 100],
  ["physical_health", /(chest pain|breath|faint|seizure|stroke|oxygen|pain|fever|vomit|diarrhea|dizzy|weakness|medical|symptom|mobility|wheelchair|fatigue)/i, 45],
  ["autism", /(autis|sensory|meltdown|shutdown|masking|special interest|routine change|social communication|interoception)/i, 35],
  ["adhd", /(adhd|executive function|time blindness|procrastinat|task initiation|focus|hyperfocus|body doubl|working memory)/i, 35],
  ["dbt", /(dbt|distress tolerance|wise mind|opposite action|dear man|emotion regulation|chain analysis|radical acceptance|tipp)/i, 30],
  ["cbt", /(cbt|thought record|cognitive distort|behavioral activation|automatic thought|exposure|reframe|core belief)/i, 30],
  ["psychiatric", /(psychiatr|medication|antidepress|antipsych|mood stabil|mania|psychosis|hallucin|paranoi|ocd|ptsd|depression|anxiety|panic)/i, 30],
  ["sleep", /(sleep|insomnia|nightmare|bedtime|circadian)/i, 18],
  ["care_coordination", /(appointment|doctor|therapist|psychiatrist|clinician|provider|care plan|what should i tell)/i, 16]
];

export function routeIntent(message, context={}) {
  const text = normalizeText(message);
  const scored = [];
  for (const [name, re, weight] of ROUTES) if (re.test(text)) scored.push({name, score:weight});
  const declared = Array.isArray(context.supportAreas) ? context.supportAreas : [];
  for (const name of declared) scored.push({name, score:12});
  scored.sort((a,b)=>b.score-a.score);
  const categories = unique(scored.map(x=>x.name));
  if (!categories.length) categories.push("general_mental_health");
  return { primary: categories[0], categories, scored, text };
}
