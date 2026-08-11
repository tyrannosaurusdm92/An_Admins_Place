/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-c. */
(function(){
  'use strict';
  const U=window.PZUtils,D=window.ActiveWorkspaceDice,API=window.ActiveWorkspaceAPI,Canon=window.ActiveWorkspaceCanon;
  const history=[];
  const MAX_HISTORY=18;
  const MECHANICAL=/\b(?:roll|throw|cast)\b[^.!?]*(?:\d*d(?:%|\d+)|initiative)|(?:^|\s)\d*d(?:%|\d+)(?:(?:kh|kl|dh|dl)\d+)?(?:\s|$)/i;
  const INTENTS=[
    ['greeting',/\b(?:hello|hi|hey|greetings|good morning|good evening)\b/i],
    ['thanks',/\b(?:thanks|thank you|appreciate)\b/i],
    ['farewell',/\b(?:bye|goodbye|good night|see you|later)\b/i],
    ['joke',/\b(?:joke|funny|make me laugh)\b/i],
    ['edge_burden',/\b(?:edge|burden|advantage|disadvantage)\b/i],
    ['outcome_bands',/\b(?:breakthrough|clean success|costly opening|setback|crisis|outcome band)\b/i],
    ['experiences',/\bexperiences?\b/i],
    ['beats',/\bbeats?\b/i],
    ['press',/\bpress\b/i],
    ['guard',/\b(?:guard|armor wear)\b/i],
    ['stress_composure',/\b(?:stress|composure|overwhelmed)\b/i],
    ['rests',/\b(?:breather|field rest|haven rest|recuperation)\b/i],
    ['last_threshold',/\b(?:last threshold|dying track|zero hp|death save)\b/i],
    ['conditions',/\bconditions?\b/i],
    ['agency',/\b(?:agency|autonomy|player choice)\b/i],
    ['class_lore',/\b(?:class|path|subclass|discipline)\b/i],
    ['deity_lore',/\b(?:deity|god|goddess|pantheon|covenant)\b/i],
    ['alignment_lore',/\b(?:alignment|axis|axes|profile)\b/i],
    ['spell_lore',/\b(?:spell|cantrip|magic school)\b/i],
    ['race_lore',/\b(?:race|ancestry|bloodline|heritage)\b/i],
    ['strategy',/\b(?:plan|strategy|tactic|advice|should we|what should)\b/i],
    ['fear',/\b(?:afraid|fear|scared|terrified|anxious)\b/i],
    ['dry_humor',/\b(?:bored|boring|idle|waiting)\b/i]
  ];
  const persona=id=>(window.DICE_BOT_PERSONAS||[]).find(x=>x.id===id)||(window.DICE_BOT_PERSONAS||[])[0]||{id:'neutral',name:'DiceBot',intro:'The dice are ready.'};
  const bank=id=>(window.DICE_BOT_RESPONSE_BANKS||{})[id]||null;
  const push=(role,text)=>{history.push({role,text:String(text||'').slice(0,2400),at:new Date().toISOString()});while(history.length>MAX_HISTORY)history.shift()};
  const template=(line,vars={})=>String(line||'').replace(/\{([a-z0-9_]+)\}/gi,(_,key)=>vars[key]==null?'':String(vars[key])).replace(/\s+([,.!?;:])/g,'$1').replace(/\s{2,}/g,' ').trim();
  function choosePersonaLine(personaId,intent='ready_greeting',vars={}){
    const p=persona(personaId),b=bank(p.id),sets=b?.responses||b?.intents||{},fallbackSets=b?.intents||{};
    const aliases={critical:'natural_20',fumble:'natural_1',roll_result:'roll_result',idle:'idle_flavor'};
    const key=aliases[intent]||intent;
    const rows=sets[key]||fallbackSets[key]||sets.roll_result||sets.ready_greeting||[];
    const selected=U?.pick?U.pick(rows):(rows[Math.floor(Math.random()*rows.length)]||'');
    return template(selected||p.intro||`${p.name} is ready.`,{name:p.name,...vars});
  }
  function inferIntent(message){for(const [name,re] of INTENTS)if(re.test(message))return name;return'ready_greeting'}
  function plainCanon(message,personaId){
    try{
      const result=window.DiceBotCanon?.detect?.(message,persona(personaId));
      if(!result)return null;
      const text=window.DiceBotCanon?.plainText?.(result.html)||String(result.html||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
      return text?{type:result.type||'canon',text}:null;
    }catch(_){return null}
  }
  function classText(ch){
    const primary=ch?.primaryClass||{name:ch?.className,path:ch?.subclass,level:ch?.level};
    const secondary=ch?.secondaryClass||{};
    const p=[primary?.name,primary?.path].filter(Boolean).join(' — '),s=[secondary?.name,secondary?.path].filter(Boolean).join(' — ');
    return [p&&`${p} ${primary?.level?`(level ${primary.level})`:''}`,s&&`${s} ${secondary?.level?`(level ${secondary.level})`:''}`].filter(Boolean).join('; ');
  }
  function characterAnswer(message,ch){
    if(!ch)return null;
    const m=String(message||'').toLowerCase(),summary=Canon.characterSummary(ch),race=summary.race?.name||ch.bodyHeritage?.race||ch.race||'unrecorded race',subtype=summary.subtype?.name||ch.bodyHeritage?.subtype||ch.raceOption||'',second=summary.secondRace?.name||'',heritage=summary.heritage,deity=summary.deity?.name||ch.covenant?.deity||ch.patronDeity||'no selected Covenant deity',align=summary.alignment?.name||'unresolved alignment',scores=summary.alignment?.scores||{};
    const biomeText=(summary.biomes||[]).map(b=>b.name).join(', ')||'no recorded biome';const ancestry=`${race}${subtype?` — ${subtype}`:''}${second?` with ${second} heritage`:''}${heritage?` (${heritage.mode})`:''}`;
    if(/\b(?:my|this) (?:class|path|subclass)\b|\bwhat class am i\b/.test(m))return `${ch.name}'s classes are ${classText(ch)||'not yet recorded'}. All selected paths resolve through the current 22-class, 66-path registry.`;
    if(/\b(?:my|this) (?:biome|biomes|habitat|origin)\b/.test(m))return `${ch.name}'s canonical biome cache is ${biomeText}. Biomes describe origin or affinity and never determine race, class, or alignment.`;
    if(/\b(?:my|this) (?:race|ancestry|bloodline|heritage)\b/.test(m))return `${ch.name} is ${ancestry}. ${heritage?.ruleBasis||''} Their creator relationship begins with ${summary.race?.creatorDeity||ch.creatorDeity||'the recorded canonical creator deity'}.`;
    if(/\b(?:my|this) (?:deity|covenant|patron)\b/.test(m))return `${ch.name}'s Covenant deity is ${deity}. Resolve ${ch.covenant?.resolve??0}, Resonance ${ch.covenant?.resonance??0}, Divine Claim ${ch.covenant?.divineClaim??0}, and Conviction Strain ${ch.covenant?.convictionStrain??0}.`;
    if(/\b(?:my|this) alignment\b/.test(m))return `${ch.name}'s current alignment is ${align}. Eight-axis scores: ${Canon.axisIds.map(id=>`${id} ${scores[id]}`).join(', ')}.`;
    if(/\b(?:my|this) (?:hp|health|guard|stress|wounds|composure)\b/.test(m))return `${ch.name}: ${ch.hp}/${ch.maxHp} HP, ${ch.guard}/${ch.guardMax} Guard, ${ch.stress}/${ch.stressCapacity} Stress, ${ch.wounds}/${ch.woundLimit} Wounds, and ${ch.composure} Composure.`;
    if(/\b(?:my|this) experiences?\b/.test(m))return `${ch.name}'s Experiences are ${(ch.experiences||[]).filter(Boolean).join(' and ')||'not yet recorded'}.`;
    if(/\b(?:summarize|scan|read) (?:my|this) character\b|\bwho am i\b/.test(m))return canonicalCharacterContext(ch)+` Current resources: ${ch.hp}/${ch.maxHp} HP, ${ch.guard}/${ch.guardMax} Guard, ${ch.stress}/${ch.stressCapacity} Stress.`;
    return null;
  }
  function mechanicalExpression(message,ch){
    const text=String(message||'').trim();if(!MECHANICAL.test(text))return'';let expression=D.command(text);if(/\binitiative\b/i.test(text)&&!/[+\-]\s*\d+\s*$/.test(text)){const bonus=Number(ch?.initiativeBonus||0);expression=`1d20${bonus>=0?'+':''}${bonus}`}try{D.parse(expression);return expression}catch(_){return''}
  }
  function canonicalCharacterContext(ch){if(!ch)return'';const s=Canon.characterSummary(ch),parents=[s.race?.name,s.subtype?.name,s.secondRace?.name].filter(Boolean).join(' / '),herit=s.heritage?` Heritage compatibility: ${s.heritage.mode}.`:'';return`${ch.name||'Character'} is ${parents||'an unresolved ancestry'}, ${s.primaryClass?.name||ch.primaryClass?.name||'unclassed'}${ch.secondaryClass?.name?` / ${ch.secondaryClass.name}`:''}, aligned ${s.alignment.name}, with Covenant ${s.deity?.name||'unselected'}.${herit}`}
  function safeCharacter(ch){
    if(!ch)return null;
    return{id:ch.id,name:ch.name,level:ch.level,xp:ch.xp,race:ch.bodyHeritage?.race||ch.race,raceOption:ch.bodyHeritage?.subtype||ch.raceOption,biomes:Canon.normalizeBiomes(ch.bodyHeritage?.biomes||[]),heritage:{mixed:!!ch.bodyHeritage?.mixedHeritage,secondParentRace:ch.bodyHeritage?.secondParentRace||'',secondParentSubtype:ch.bodyHeritage?.secondParentSubtype||'',method:ch.bodyHeritage?.heritageMethod||'',compatibility:Canon.characterSummary(ch).heritage?.mode||'single-parent'},creatorDeity:ch.creatorDeity,classes:classText(ch),alignment:ch.alignment?.name||ch.alignmentName,covenant:{deity:ch.covenant?.deity||ch.patronDeity,resolve:ch.covenant?.resolve,resonance:ch.covenant?.resonance,divineClaim:ch.covenant?.divineClaim,convictionStrain:ch.covenant?.convictionStrain},resources:{hp:ch.hp,maxHp:ch.maxHp,guard:ch.guard,guardMax:ch.guardMax,stress:ch.stress,stressCapacity:ch.stressCapacity,wounds:ch.wounds,woundLimit:ch.woundLimit,composure:ch.composure},experiences:(ch.experiences||[]).slice(0,2),actions:(ch.actions||ch.attacks||[]).slice(0,24).map(a=>({name:a.name,kind:a.kind,beatCost:a.beatCost,rangeFeet:a.rangeFeet})),spells:(ch.spells||[]).slice(0,40).map(s=>typeof s==='string'?s:{name:s.name,rank:s.rank,beatCost:s.beatCost})}
  }
  function backendReplyValue(raw){
    const row=raw?.data&&typeof raw.data==='object'?raw.data:raw||{};
    const reply=row.reply||row.message||row.text||row.output_text||row.result?.reply||'';
    const roll=row.roll||row.dice||row.action?.roll||(row.action?.type==='roll'?row.action:null);
    return{reply:String(reply||'').trim(),rollExpression:typeof roll==='string'?roll:String(roll?.expression||roll?.notation||'').trim()}
  }
  async function respond(message,{personaId='',character=null,backendEnabled=false,encounter=null}={}){
    const text=String(message||'').trim();if(!text)return{reply:'Tell me what you want to know or roll.',source:'local'};
    push('user',text);
    const expression=mechanicalExpression(text,character);
    if(expression){const reply=choosePersonaLine(personaId,/\binitiative\b/i.test(text)?'initiative':'roll_start',{actor:character?.name||'the player',notation:expression,expression});push('assistant',reply);return{reply,rollExpression:expression,label:/\binitiative\b/i.test(text)?'Initiative':'DiceBot roll',source:'local-roll'}}
    const characterReply=characterAnswer(text,character);
    if(characterReply){push('assistant',characterReply);return{reply:characterReply,source:'character'}}
    const canon=plainCanon(text,personaId);
    if(canon){push('assistant',canon.text);return{reply:canon.text,source:`canon:${canon.type}`}}
    if(backendEnabled&&API?.user){
      try{
        const result=await API.call('diceBotChat',{message:text,prompt:text,persona:persona(personaId),character:safeCharacter(character),encounter:encounter?{id:encounter.id,name:encounter.name,round:encounter.initiative?.round,currentActorId:encounter.initiative?.order?.[encounter.initiative?.index]}:null,history:history.slice(-12),rules:{system:'Universal Covenant Engine',beatsPerTurn:3,reactionsPerRound:1,edgeBurden:true,fiveOutcomeBands:true,audio:false},instruction:'Reply in the selected DiceBot persona. Use packaged Universal canon. Preserve player agency. Never invent a dice total. You may request a local roll using roll.expression.'});
        const parsed=backendReplyValue(result);
        if(parsed.reply||parsed.rollExpression){const reply=parsed.reply||choosePersonaLine(personaId,'roll_start',{actor:character?.name||'the player',notation:parsed.rollExpression});push('assistant',reply);return{reply,rollExpression:parsed.rollExpression,label:'DiceBot requested roll',source:'backend'}}
      }catch(_){/* local fallback below */}
    }
    const reply=choosePersonaLine(personaId,inferIntent(text),{actor:character?.name||'the player'});push('assistant',reply);return{reply,source:'persona-local'}
  }
  function rollComment(roll,{personaId='',character=null,label='Roll'}={}){
    const intent=roll?.critical?'natural_20':roll?.fumble?'natural_1':roll?.total>=18?'roll_high':roll?.total<=5?'roll_low':'roll_result';
    return choosePersonaLine(personaId,intent,{actor:character?.name||'the player',notation:roll?.expression||'',expression:roll?.expression||'',total:roll?.total??'',result:roll?.total??'',rolls:(roll?.terms||[]).flatMap(t=>t.values||[]).join(', '),label})
  }
  function idle(personaId='',character=null){return choosePersonaLine(personaId,'idle_flavor',{actor:character?.name||'the player'})}
  function clearHistory(){history.splice(0,history.length)}
  window.ActiveWorkspaceDiceBot=Object.freeze({respond,rollComment,idle,clearHistory,history:()=>history.slice(),characterAnswer,mechanicalExpression});

  window.ActiveWorkspaceDiceBotCanon=Object.freeze({counts:Canon.counts,characterContext:canonicalCharacterContext});
})();
