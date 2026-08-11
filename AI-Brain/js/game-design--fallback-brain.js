/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function () {
  'use strict';
  const LT = window.LifeTalk;
  const U = LT.utils;
  const arr = U.array;

  function isQuestionAboutAttack(text) {
    return /\b(why|who|what|when|where|how)\b[^?!.]{0,80}\b(attack|attacked|fight|fought)\b/i.test(text) ||
      /\b(did|do|does)\s+(you|they|we)\s+(attack|fight)\b/i.test(text);
  }

  function analyzeMessage(message) {
    const value = U.text(message?.text ?? message);
    const question = /\?/.test(value) || /^\s*(who|what|where|when|why|how|do|does|did|is|are|can|could|would)\b/i.test(value);
    let intent = 'statement';
    if (/\b(i|we)\s+(surrender|yield|give up)\b|\baccept (my|our) surrender\b/i.test(value)) intent = 'playerSurrenders';
    else if (/\b(surrender|yield|stand down|drop (your|the) weapons|ceasefire|truce|stop fighting)\b/i.test(value)) intent = 'demandSurrender';
    else if (/\b(god|gods|deity|deities|worship|faith|divine patron|holy name|covenant|edict|anathema)\b/i.test(value)) intent = 'askDeity';
    else if (/\b(class|subclass|discipline|profession|training|bounty)\b/i.test(value)) intent = 'askClass';
    else if (/\b(race|ancestry|lineage|heritage|people|species|creator)\b/i.test(value)) intent = 'askRace';
    else if (/\b(who are you|your name|what are you)\b/i.test(value)) intent = 'askIdentity';
    else if (/\b(pay|price|reward|deal|trade|offer|coin|gold|terms)\b/i.test(value)) intent = 'bargain';
    else if (/\b(hello|hi|hail|greetings|hey)\b/i.test(value)) intent = 'greet';
    else if (/\b(goodbye|farewell|bye)\b/i.test(value)) intent = 'goodbye';
    else if (/\b(kill|hurt|destroy|burn|or else|you'?ll regret)\b/i.test(value) || (!question && /\b(i|we)\s+(will|shall|am going to|are going to)\s+(attack|fight)\b/i.test(value))) intent = 'threaten';
    else if (/\b(liar|you lied|guilty|your fault|accuse)\b/i.test(value)) intent = 'accuse';
    else if (question || isQuestionAboutAttack(value) || /\b(tell me|explain)\b/i.test(value)) intent = 'askInfo';
    else if (/\b(trust me|hear me out|believe me|persuade|convince)\b/i.test(value)) intent = 'persuade';
    const positive = (value.match(/\b(help|please|thank|peace|agree|friend|mercy|truce)\b/gi) || []).length;
    const negative = (value.match(/\b(hate|kill|hurt|liar|idiot|demand|destroy)\b/gi) || []).length;
    return { ...message, text: value, intent, question, sentiment: U.clamp(positive - negative, -5, 5), playerId: message?.playerId || 'player', playerName: message?.playerName || 'Player' };
  }

  function godFromRequest(request, npc) {
    const supplied = request?.payload?.canonicalGod;
    if (supplied?.name) return supplied;
    if (npc?.deity?.name) return npc.deity;
    return null;
  }

  function combatContext(request, npc) {
    const combat = request?.payload?.combat || {};
    const current = Number(combat.currentHp ?? npc.currentHp ?? npc.state?.currentHp ?? 1);
    const max = Math.max(1, Number(combat.maxHp ?? npc.maxHp ?? npc.state?.maxHp ?? current));
    return { active: Boolean(combat.active), round: Number(combat.round || 0), hpRatio: Number.isFinite(Number(combat.hpRatio)) ? Number(combat.hpRatio) : current / max, attackedBy: arr(npc.state?.attackedBy), damageTaken: Number(npc.state?.damageTaken || 0) };
  }

  function alignmentAxes(request, npc) {
    return request?.payload?.homebrewAlignment?.axes || request?.payload?.npc?.homebrewAlignment?.axes || npc.homebrewAlignment?.axes || {};
  }

  function classFromRequest(request, npc) { return request?.payload?.canonicalClass || npc.canonicalClass || null; }
  function raceFromRequest(request, npc) { return request?.payload?.canonicalRace || npc.race || null; }
  function covenantFromRequest(request, npc) { return request?.payload?.covenant || npc.covenant || null; }

  function replyFor(npc, analysis, request) {
    const god = godFromRequest(request, npc);
    const canonicalClass = classFromRequest(request, npc);
    const race = raceFromRequest(request, npc);
    const covenant = covenantFromRequest(request, npc);
    const combat = combatContext(request, npc);
    const axes = alignmentAxes(request, npc);
    const attacked = combat.attackedBy.length > 0 || combat.damageTaken > 0;
    const bloodied = combat.hpRatio <= 0.35;
    const honorable = axes.honor === 'Honorable';
    const cooperative = axes.cooperation === 'Cooperative';
    const selfish = axes.altruism === 'Selfish';
    const merciful = axes.mercy === 'Merciful';
    const ruthless = axes.mercy === 'Ruthless';
    const restrained = axes.restraint === 'Disciplined';
    const unrestrained = axes.restraint === 'Unrestrained';
    const selfDirected = axes.autonomy === 'Self-Directed';

    let text;
    let emotion = 'guarded';
    let reaction = 'attentive';
    switch (analysis.intent) {
      case 'playerSurrenders':
        emotion = honorable || merciful ? 'stern' : 'calculating';
        reaction = merciful || honorable ? 'accepting-surrender' : 'weighing-surrender';
        if (merciful) text = 'Set your weapons down and step away. I accept your surrender; no one needs to die for pride.';
        else if (ruthless) text = 'Weapons first. Then terms. Your surrender is useful only while it improves my position.';
        else text = 'Set your weapons down, keep your hands visible, and honor the terms. I accept.';
        break;
      case 'demandSurrender':
        emotion = bloodied ? 'strained' : 'defiant';
        reaction = bloodied ? 'considering-surrender' : 'rejecting-demand';
        if (bloodied && (honorable || cooperative || merciful)) text = 'Stop advancing. Give my companions safe passage and I will order the weapons lowered.';
        else if (bloodied && (selfish || selfDirected)) text = 'Name the price of walking away alive. I will not surrender without terms.';
        else text = 'You have not earned my surrender. Lower your own weapon if you truly want a ceasefire.';
        break;
      case 'askDeity':
        emotion = 'measured'; reaction = 'answering';
        text = god ? `${god.name} is the divine power bound to this matter${god.domains ? `—keeper of ${god.domains}` : ''}. ${covenant?.resonanceState ? `My covenant resonance is ${covenant.resonanceState}.` : ''}` : 'I claim no divine patron in this encounter, and I will not invent one for your convenience.';
        break;
      case 'askClass':
        emotion = 'measured'; reaction = 'answering';
        text = canonicalClass ? `I follow the discipline of the ${canonicalClass.name}${canonicalClass.subclass?.name || canonicalClass.subclass ? `, specifically ${canonicalClass.subclass?.name || canonicalClass.subclass}` : ''}. Its bounty is earned through action, not title.` : 'I carry no canonical class discipline in this encounter.';
        break;
      case 'askRace':
        emotion = 'neutral'; reaction = 'answering';
        text = race ? `I am counted among the ${race.name}. That names my people and history; it does not dictate my morality, profession, or choices.` : `My kind is ${npc.species || 'not entered in the canonical race register for this encounter'}. Ancestry does not decide what I choose.`;
        break;
      case 'askIdentity':
        emotion = 'neutral'; reaction = 'answering';
        text = `I am ${npc.name}${race?.name ? ` of the ${race.name}` : ''}${canonicalClass?.name ? `, a ${canonicalClass.name}` : (npc.profession ? `, ${npc.profession}` : '')}.`;
        break;
      case 'bargain':
        emotion = 'considering'; reaction = 'calculating';
        text = selfish ? 'Make an offer that improves my position and accounts for the blood already spent.' : 'State the terms, who they protect, and what each side gives up.';
        break;
      case 'threaten':
        emotion = bloodied ? 'desperate' : 'angry'; reaction = 'defensive';
        if (restrained) text = 'That is a threat, not a question. I will answer the danger without wasting lives.';
        else if (unrestrained) text = 'Threaten me again and this becomes larger than either of us can control.';
        else text = bloodied ? 'Enough. Name your terms now, before fear makes this uglier.' : 'Keep your distance and say what outcome you actually want.';
        break;
      case 'accuse': emotion = 'wary'; reaction = 'skeptical'; text = 'Bring evidence or ask a question I can answer. An accusation alone changes nothing.'; break;
      case 'askInfo':
        emotion = attacked ? 'angry' : 'thoughtful'; reaction = 'answering';
        if (/\bwhy\b[^?!.]{0,80}\b(attack|attacked|fight|fought)\b/i.test(analysis.text)) text = attacked ? 'You struck us, and we answered. Whatever began this encounter, your blow made you my immediate threat.' : 'Our objectives crossed. Ask about the objective, not an invented insult.';
        else text = attacked ? 'Ask one precise question. I may answer, but I have not forgotten who drew blood.' : 'Ask one precise question and I will decide what can be answered safely.';
        break;
      case 'greet': emotion = attacked ? 'cold' : 'neutral'; reaction = 'acknowledging'; text = attacked ? 'Greetings are late, but not useless. Speak.' : 'Speak. I am listening for the moment.'; break;
      case 'goodbye': emotion = 'neutral'; reaction = 'farewell'; text = 'Go, then. I will remember how this encounter ended.'; break;
      case 'persuade': emotion = 'considering'; reaction = 'skeptical'; text = 'Give me one fact I can verify and one reason your proposal should survive the next minute.'; break;
      default: emotion = attacked ? 'guarded' : 'attentive'; reaction = attacked ? 'watchful' : 'listening'; text = cooperative ? 'State the outcome you want and what it means for everyone here.' : 'Say what you want before patience becomes another casualty.';
    }
    return { text: U.sentence(text), targetPlayerIds: [], emotion, reaction };
  }

  async function respond(request, state = {}) {
    const suppliedNpc = request?.payload?.npc || {};
    const npc = arr(state.npcs).find((entry) => entry.npcId === suppliedNpc.npcId) || suppliedNpc;
    const pending = arr(request?.payload?.conversation?.pending).map(analyzeMessage);
    const analyses = pending.length ? pending : [analyzeMessage({ text: '', playerId: 'player', playerName: 'Player' })];
    const varied = request?.payload?.behavior?.responseMode === 'varied' || analyses.length > 1;
    const responses = varied ? analyses.map((analysis) => ({ ...replyFor(npc, analysis, request), targetPlayerIds: [analysis.playerId] })) : [replyFor(npc, analyses[0], request)];
    const attackedBy = arr(npc.state?.attackedBy);
    const memoryWrites = analyses.map((analysis) => ({ summary: `${analysis.playerName} spoke with intent ${analysis.intent}${attackedBy.includes(analysis.playerId) ? ' after attacking this NPC' : ''}.`, visibility: 'private', playerId: analysis.playerId }));
    return {
      requestId: request.requestId,
      mode: varied ? 'varied' : 'single', responses, memoryWrites,
      statePatch: { npc: { mood: responses[0]?.emotion || 'guarded', stress: U.clamp(Number(npc.state?.stress || 0) + (analyses.some((entry) => entry.intent === 'threaten') ? 12 : 0), 0, 100) } },
      decisionFactors: ['NPC profile', 'eight-axis alignment', 'canonical race entry', 'canonical class discipline', 'deity covenant and resonance', 'combat injuries', 'attack memory', 'player intent'],
      warnings: ['Dialogue Studio local fallback used.'], engine: 'dialogue-studio-fallback'
    };
  }

  LT.register('fallbackBrain', { respond, analyzeMessage });
}());
