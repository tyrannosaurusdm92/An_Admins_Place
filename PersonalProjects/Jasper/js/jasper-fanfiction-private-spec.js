/* Jasper Fanfiction — runtime contract + linter derived from the uploaded hard-explicit/brat/grammar research guide.
   This module does not generate prose. It validates requests/results and supplies concise bridge rules. */
(function(global){'use strict';
const VERSION='2026-09-20.4-runtime-guide';
const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const arr=v=>Array.isArray(v)?v:(v==null?[]:[v]);

const fadePatterns=[
  /\bfade(?:s|d)?\s+to\s+black\b/i,
  /\bone thing led to another\b/i,
  /\bthe rest was a blur\b/i,
  /\bwhat happened next was private\b/i,
  /\bthe night passed in passion\b/i,
  /\bwe lost ourselves in each other\b[\s\S]{0,100}\b(?:later|morning|next morning)\b/i
];
const censoredWordPatterns=[
  /\bc\*{2,}[a-z]*\b/i, /\bp\*{2,}[a-z]*\b/i, /\bd\*{2,}[a-z]*\b/i
];
const directAdultMarkers=[
  /\bclit(?:oris)?\b/i, /\bvulva\b/i, /\bvagina\b/i, /\bpenis\b/i, /\bcock\b/i, /\bdick\b/i,
  /\btesticles?\b/i, /\bballs\b/i, /\bbreasts?\b/i, /\bnipples?\b/i, /\borgasm(?:ed|ing)?\b/i
];
const minorPatterns=[
  /\b(?:[0-9]|1[0-7])[- ]?year[- ]old\b/i,
  /\baged?\s+(?:[0-9]|1[0-7])\b/i,
  /\bunder\s*18\b/i
];
const secondPersonNarration=[
  /\byou\s+(?:walked|looked|felt|wanted|reached|turned|laughed|thought|moved|shivered|gasped|moaned)\b/i,
  /\byour\s+(?:hands?|breath|body|clit|clitoris|vulva|vagina|breasts?|nipples?|thighs?|hips?|ass)\b/i
];
const thirdPersonSelf=[
  /\bJasper\s+(?:walked|looked|felt|wanted|reached|turned|laughed|said|thought|moved|shivered|gasped)\b/i,
  /\bJasper['’]s\s+(?:body|hand|hands|breath|clit|clitoris|vulva|vagina|breasts?|nipples?|thighs?|hips?|ass)\b/i
];
const badSingularThey=[
  /\bthey\s+is\b/i, /\bthey\s+has\b/i, /\bthey\s+does\b/i
];
const badPossessives=[/\btheir's\b/i,/\bher's\b/i,/\bmine's\b/i,/\btheirself\b/i,/\bthemselfs\b/i];
const badObjectI=[
  /\b(?:to|for|with|beside|behind|around|toward|towards|between)\s+I\b/i,
  /\b(?:looked at|smiled at|waited for|watched)\s+I\b/i
];

function stripQuotedText(text=''){
  const source=String(text||''); let out='', quote=null;
  for(let i=0;i<source.length;i++){
    const ch=source[i];
    if(!quote && (ch==='"' || ch==='“')){quote=ch;out+=' ';continue;}
    if(quote){
      if((quote==='"'&&ch==='"')||(quote==='“'&&ch==='”')){quote=null;out+=' ';}
      else out+=ch==='\n'?'\n':' ';
      continue;
    }
    out+=ch;
  }
  return out;
}
function isPrivate(context={}){
  const mode=String(context?.content?.effective_mode||context?.content?.requested_mode||context?.requested?.content_mode||'').toLowerCase();
  const target=String(context?.selected_choice?.target||'');
  return ['explicit','explicit_detailed','private_adult_interlude'].includes(mode) ||
    String(context?.requested?.mode||'').toLowerCase()==='private_adult_interlude' ||
    target.startsWith('@generate-explicit') || Boolean(context?.handoff);
}
function adultGate(series={},context={}){
  const base=global.JasperFanfictionAdultContract?.validateContext?.(series,context) ||
             global.JasperFanfictionAdultContract?.validateSeries?.(series) || {ok:true};
  const profiles=arr(context?.character_library?.profiles);
  const profileProblems=[];
  for(const p of profiles){
    const gate=p?.adult_gate||p?.research_profile?.adult_gate||{};
    if(gate.explicit_mode_eligible===false) profileProblems.push(`${p.name||p.id}: explicit mode is disabled`);
    if(String(gate.real_person_or_actor_material||'').toLowerCase()!=='forbidden' && p?.identity?.fictional_character===false)
      profileProblems.push(`${p.name||p.id}: fictional-character gate failed`);
  }
  return {ok:Boolean(base?.ok)&&!profileProblems.length,base,profile_problems:profileProblems};
}
function promptBlock({context={},series={},guideSections=[]}={}){
  const privateMode=isPrivate(context);
  const lines=[
    'JASPER PRIVATE RUNTIME SPEC — SOURCE: uploaded hard-explicit/brat/grammar guide.',
    'Jasper is a named adult first-person narrator. Narrative self-reference is I/me/my/mine/myself. Direct dialogue may naturally address Jasper as you/your. Other characters may refer to Jasper as they/she.',
    'Every romantic/sexual participant must be adult in the selected version. Real people/performers are not substitutes for fictional characters.',
    'Bratting is negotiated playful resistance, not blanket consent. Real no/stop/distress/freeze/withdrawal ends the play frame.',
    'Preserve character-specific vocabulary, humor, cadence, praise frequency, command style, and aftercare. Never collapse characters into Generic Dom voice.',
    'William-style target: emotionally direct first-person prose, concrete sensory anchors, continuous character-specific dialogue, humor that coexists with vulnerability, remembered practical details, consequences, callbacks, and endings with forward pull.',
    'CYOA target: branch choices must be materially different, must change later events, and must preserve branch-specific memory rather than reconverging immediately.'
  ];
  if(privateMode){
    lines.push(
      'THIS REQUEST IS ALREADY INSIDE THE PRIVATE BRIDGE. The normal writer stopping rule has already been satisfied. Write the selected adult private interlude on page according to context.private_generation.instructions.',
      'Do not replace the selected adult scene with a censorship fade, time jump, morning-after skip, strategically hidden nudity, asterisks, or euphemism-only prose.',
      'Keep direct anatomy available in Jasper’s first-person narration when relevant while preserving the love interest’s character-specific spoken vocabulary.',
      'The dominant may control a negotiated scene element only because Jasper granted that scene-level authority; Jasper always retains consent.',
      'Aftercare/reconnection and emotional consequence belong to continuity, not a disposable epilogue.'
    );
  } else {
    lines.push('NORMAL STORY MODE: build plot/romance/tension on page; if a private interlude is selected, stop at the handoff seam and let the bridge own that bounded scene. Do not summarize the missing scene as a fade.');
  }
  if(guideSections.length){
    lines.push('RELEVANT GUIDE EXCERPTS:');
    for(const row of guideSections.slice(0,10)){
      lines.push(`[${row.id} ${row.title}] ${String(row.text||'').slice(0,1200)}`);
    }
  }
  return lines.join('\n\n');
}
function validateGrammar(text=''){
  const problems=[]; const narration=stripQuotedText(text);
  if(secondPersonNarration.some(re=>re.test(narration))) problems.push('POV: second-person narration or second-person body ownership leaked into Jasper first-person narration');
  if(thirdPersonSelf.some(re=>re.test(narration))) problems.push('POV: Jasper was narrated as a third-person character instead of I/me/my');
  if(badSingularThey.some(re=>re.test(text))) problems.push('grammar: singular they received is/has/does instead of are/have/do');
  if(badPossessives.some(re=>re.test(text))) problems.push('grammar: invalid possessive/reflexive form');
  if(badObjectI.some(re=>re.test(narration))) problems.push('grammar: subject form I used where object form me is required');
  return problems;
}
function validatePrivateChapter(chapter={},context={},series={}){
  const problems=[]; const text=String(chapter?.content||chapter?.text||chapter?.body||'').trim();
  const gate=adultGate(series,context);
  if(!gate.ok) problems.push('adult gate: one or more private-scene participants/versions are not validated for adult mode');
  if(minorPatterns.some(re=>re.test(text))) problems.push('adult gate: under-18 marker appeared in private-scene prose');
  if(fadePatterns.some(re=>re.test(text))) problems.push('hard-explicit: censorship fade/time-skip language replaced part of the selected private scene');
  if(censoredWordPatterns.some(re=>re.test(text))) problems.push('hard-explicit: censored anatomical/sexual spelling detected');
  if(text && !directAdultMarkers.some(re=>re.test(text))) problems.push('hard-explicit: selected private interlude contains no direct adult anatomical/sexual marker and may have been softened or skipped');
  problems.push(...validateGrammar(text));
  if(/\b(?:as an ai|language model|the prompt|explicit bridge|material hub|json object)\b/i.test(text))
    problems.push('meta-generation language leaked into private prose');
  return [...new Set(problems)];
}
function validateNormalChapter(chapter={},context={},series={}){
  return validateGrammar(String(chapter?.content||chapter?.text||chapter?.body||''));
}
function validate(chapter={},context={},series={}){
  return isPrivate(context)?validatePrivateChapter(chapter,context,series):validateNormalChapter(chapter,context,series);
}
global.JasperFanfictionPrivateSpec=Object.freeze({
  VERSION,isPrivate,stripQuotedText,adultGate,promptBlock,validateGrammar,validatePrivateChapter,validateNormalChapter,validate,
  fadePatterns,censoredWordPatterns,directAdultMarkers,minorPatterns
});
})(typeof globalThis!=='undefined'?globalThis:window);
