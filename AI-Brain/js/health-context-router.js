const ROUTES=[
 ['crisis',/suicid|kill myself|end my life|self[- ]?harm|overdose|kill (him|her|them|someone)|hurt (him|her|them|someone)/i],
 ['physical_health',/chest pain|can.?t breathe|shortness of breath|stroke|seizure|faint|passed out|blood pressure|fever|vomit|pain|medication side effect/i],
 ['adhd',/adhd|attention|focus|executive function|time blindness|procrastinat|task initiation|hyperfocus/i],
 ['autism',/autis|sensory|stimming|meltdown|shutdown|masking|social cue|routine change/i],
 ['dbt',/dbt|distress tolerance|wise mind|radical acceptance|opposite action|interpersonal effectiveness/i],
 ['cbt',/cbt|cognitive distortion|thought record|automatic thought|behavioral experiment/i],
 ['psychiatry',/psychiatr|diagnos|medication|antidepress|antipsych|mood stabil|stimulant|mania|psychosis|depress|anxiety/i]
];
export function routeText(text='') { for (const [r,re] of ROUTES) if(re.test(text)) return r; return 'mental_health'; }
export function routeMany(text='') { return ROUTES.filter(([,re])=>re.test(text)).map(([r])=>r); }
