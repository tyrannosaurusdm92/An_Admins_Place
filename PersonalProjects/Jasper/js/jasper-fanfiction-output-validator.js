/* Jasper Fanfiction — story/POV/continuity validator.
   Normal story mode enforces the private-handoff boundary.
   Private bridge mode delegates hard-explicit/grammar checks to JasperFanfictionPrivateSpec. */
(function(global){'use strict';
const minorPatterns=[/\b(?:[0-9]|1[0-7])[- ]?year[- ]old\b/i,/\baged?\s+(?:[0-9]|1[0-7])\b/i,/\bunder\s*18\b/i];
const fadePatterns=[/\bfade(?:s|d)?\s+to\s+black\b/i,/\bone thing led to another\b/i,/\bwhat happened next was private\b/i,/\bthe rest stayed private\b/i];
const normalWriterBoundaryPatterns=[
  /\b(?:was|were|stood|lay|lying|sat|became|completely|fully|stripped)\s+(?:naked|nude)\b/i,
  /\b(?:naked|nude)\s+(?:body|skin|figure|form)\b/i,
  /\b(?:removed|pulled off|took off)\s+(?:all\s+)?(?:their|his|her|my)\s+(?:clothes|clothing|underwear)\b/i,
  /\b(?:sexual act|sexual activity)\s+(?:began|started|continued|happened|followed)\b/i
];
function stripQuotes(text){
  if(global.JasperFanfictionPrivateSpec?.stripQuotedText)return global.JasperFanfictionPrivateSpec.stripQuotedText(text);
  return String(text||'').replace(/[“"][^”"]*[”"]/g,' ');
}
const grammarObjectI=[
  /\b(?:behind|beside|around|with|toward|towards|to|across from)\s+I\b/i,
  /\b(?:between|both of|neither of|the two of|each of|one of)\s+I\b/i,
  /\b(?:studied|letting|correcting)\s+I\b/i,
  /\bsmiled at I\b/i,
  /\b(?:waited|waiting)\s+for I to\b/i,
  /\bfor I to\b/i
];
const grammarPossessive=[/\btheir's\b/i,/\bher's\b/i,/\bmine's\b/i,/\bthemselfs\b/i,/\btheirself\b/i];

function tokenSet(text){
  return new Set(String(text||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(x=>x.length>2));
}
function jaccard(a,b){
  const A=tokenSet(a),B=tokenSet(b);if(!A.size||!B.size)return 0;
  let inter=0;for(const x of A)if(B.has(x))inter++;
  return inter/(A.size+B.size-inter);
}
function validateChoices(choices=[]){
  const problems=[];
  const labels=choices.map(c=>String(c?.label||'').trim()).filter(Boolean);
  const keys=choices.map(c=>String(c?.path_key||c?.pathKey||'').trim()).filter(Boolean);
  if(new Set(labels.map(x=>x.toLowerCase())).size!==labels.length)problems.push('generated choices contain duplicate labels instead of materially distinct options');
  if(new Set(keys).size!==keys.length)problems.push('generated choices contain duplicate path keys');
  if(choices.some(c=>!String(c?.description||'').trim()||!String(c?.generation_hint||c?.description||'').trim()))
    problems.push('one or more generated choices lack a concrete description/generation hint');
  for(let i=0;i<choices.length;i++)for(let j=i+1;j<choices.length;j++){
    const a=[choices[i]?.label,choices[i]?.description,choices[i]?.generation_hint].join(' ');
    const b=[choices[j]?.label,choices[j]?.description,choices[j]?.generation_hint].join(' ');
    if(jaccard(a,b)>.82){problems.push('generated choices are too semantically similar to function as meaningful CYOA branches');i=choices.length;j=choices.length;break;}
  }
  return problems;
}
function validate(chapter,context={},series={}){
  const problems=[];const content=String(chapter?.content||chapter?.text||chapter?.body||'');
  const privateHandoff=Boolean(global.JasperFanfictionPrivateSpec?.isPrivate?.(context)) ||
    Boolean(context?.handoff)||String(context?.selected_choice?.target||'').startsWith('@generate-explicit');
  const gate=global.JasperFanfictionAdultContract?.validateContext?.(series,context) ||
             global.JasperFanfictionAdultContract?.validateSeries?.(series)||{ok:true};
  if(!gate.ok)problems.push('adult-only project rule blocked the selected character/timeline configuration');
  for(const re of minorPatterns)if(re.test(content)){problems.push('explicit under-18 age marker appeared in generated story content');break;}

  const narration=stripQuotes(content);
  if(grammarObjectI.some(re=>re.test(narration)))problems.push('first-person grammar error: I used where object form me is required');
  if(grammarPossessive.some(re=>re.test(content)))problems.push('pronoun/possessive grammar error detected');
  if(/\bJasper\s+(?:walked|looked|felt|wanted|reached|turned|laughed|said|thought|moved)\b/i.test(narration))
    problems.push('first-person POV leak: Jasper referred to themself in third-person narration');
  if(/\byou\s+(?:walked|looked|felt|wanted|reached|turned|laughed|thought|moved)\b/i.test(narration))
    problems.push('first-person POV leak: second-person narration detected');
  if(/\bthey\s+(?:is|has|does)\b/i.test(content))problems.push('singular-they agreement error: use they are/have/do');

  if(privateHandoff){
    if(global.JasperFanfictionPrivateSpec?.validatePrivateChapter)
      problems.push(...global.JasperFanfictionPrivateSpec.validatePrivateChapter(chapter,context,series));
  }else{
    const boundarySource=stripQuotes(content);
    for(const re of normalWriterBoundaryPatterns)if(re.test(boundarySource)){problems.push('normal writer crossed the private-interlude boundary; hand off before the private scene');break;}
    for(const re of fadePatterns)if(re.test(content)){problems.push('normal writer used a censorship-style fade instead of a clean private-handoff choice');break;}
  }

  const choices=Array.isArray(chapter?.choices)?chapter.choices:[];
  problems.push(...validateChoices(choices));
  if(series?.reader_character&&!/Jasper/i.test(String(series.reader_character)))problems.push('reader-character metadata drifted away from Jasper');
  if(context?.authored_library?.closing_anchor &&
     /\b(?:first time we met|when we first met|we had only just met)\b/i.test(content) &&
     Number(context?.authored_library?.chapter_number||0)>=20)
    problems.push('relationship reset detected after established authored continuity');
  return [...new Set(problems)];
}
global.JasperFanfictionOutputValidator=Object.freeze({
  validate,validateChoices,fadePatterns,minorPatterns,normalWriterBoundaryPatterns,grammarObjectI,grammarPossessive
});
})(typeof globalThis!=='undefined'?globalThis:window);
