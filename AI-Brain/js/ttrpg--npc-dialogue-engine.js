/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
(function (global) {
  'use strict';

  const arr = (value) => Array.isArray(value) ? value : (value == null || value === '' ? [] : [value]);
  const text = (value) => String(value ?? '').trim();
  const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
  const clamp = (number, min, max) => Math.min(max, Math.max(min, Number(number) || 0));

  function randomId(prefix = 'dlg') {
    const bytes = new Uint8Array(8);
    if (global.crypto?.getRandomValues) global.crypto.getRandomValues(bytes);
    else bytes.forEach((_, index) => { bytes[index] = Math.floor(Math.random() * 256); });
    return `${prefix}-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`;
  }

  function profileFor(hostile) {
    const alignment = hostile.homebrewAlignment || {};
    const race = hostile.race || null;
    const canonicalClass = hostile.canonicalClass || null;
    const covenant = hostile.covenant || null;
    const identity = [
      canonicalClass?.name,
      canonicalClass?.subclass?.name || canonicalClass?.subclass,
      ...arr(hostile.roles)
    ].filter(Boolean).join(', ');
    const knownFacts = [`Armor Class ${hostile.ac}`, `Challenge rating ${hostile.crLabel}`];
    if (race?.name) knownFacts.push(`Canonical people: ${race.name}`);
    if (canonicalClass?.name) knownFacts.push(`Canonical class: ${canonicalClass.name}`);
    if (hostile.deity?.name) knownFacts.push(`Covenant deity: ${hostile.deity.name}`);
    if (hostile.scheduleContext?.localLabel) knownFacts.push(`Current local time: ${hostile.scheduleContext.localLabel}`);
    if (hostile.scheduleContext?.activity) knownFacts.push(`Current local schedule: ${hostile.scheduleContext.activity}`);
    return {
      npcId: hostile.instanceId || hostile.id,
      name: hostile.displayName || hostile.name,
      species: race?.name || hostile.subtype || hostile.type || '',
      lineage: race?.parentRace || race?.subtypeName || '',
      culture: race?.creatorCategory || '',
      profession: identity,
      public: {
        description: race?.description || hostile.description || `${hostile.name} encountered by the party.`,
        knownFacts
      },
      private: {
        goals: ['Survive the encounter', 'Pursue the encounter objective', ...arr(canonicalClass?.practices).slice(0, 2)],
        needs: covenant?.edicts ? arr(covenant.edicts).slice(0, 2) : [],
        fears: ['Defeat', ...arr(canonicalClass?.hazards).slice(0, 1)],
        secrets: covenant?.shadow ? [covenant.shadow] : []
      },
      traits: [...new Set([...arr(hostile.behaviorTags), ...arr(hostile.roles), ...arr(canonicalClass?.axisFocus)])],
      dialogue: {
        tone: arr(hostile.behaviorTags).includes('aggressive') ? 'hostile and direct' : 'guarded',
        verbosity: 'brief',
        responseMode: 'adaptive'
      },
      state: {
        mood: 'guarded',
        stress: 0,
        trustByPlayer: {},
        attackedBy: [],
        damageTaken: 0,
        memories: []
      },
      currentHp: hostile.currentHp ?? hostile.hp,
      maxHp: hostile.maxHp ?? hostile.hp,
      deity: hostile.deity || null,
      covenant,
      canonicalClass,
      race,
      homebrewAlignment: alignment
    };
  }

  function alignmentGuidance(npc) {
    const axes = npc.homebrewAlignment?.axes || {};
    return Object.entries(axes).map(([axis, value]) => `${axis}: ${value}`).join('; ');
  }

  function buildRequest(npc, messages, context, config) {
    const canonicalGod = npc.deity ? {
      id: npc.deity.id,
      name: npc.deity.name,
      domains: npc.deity.domainsText || npc.deity.domains || ''
    } : null;
    return {
      requestId: randomId('request'),
      systemInstruction: [
        `Generate spoken dialogue for ${npc.name}; do not narrate as an omniscient game master.`,
        'Recognize only the supplied canonical Universal deity. Never invent, substitute, or acknowledge another god.',
        'Use all eight independent alignment axes: altruism, lawfulness, cooperation, honor, mercy, transformation, autonomy, and restraint. The first four select the named profile; the last four control how that profile is expressed.',
        'Treat the supplied canonical class, race entry, deity covenant, resonance, edicts, anathemas, practices, and hazards as active encounter rules. Ancestry never determines morality.',
        'React to attack history, current injuries, surrender demands, threats, trust, the current combat round, the local daypart, and the current encounter objective.',
        'Earth UTC remains the world clock. Local province and settlement offsets are fixed with no daylight saving time; a settlement override supersedes its province.',
        'The encounter objective and clocks create pressure but never dictate a player character action or required solution.',
        'Return strict JSON and no hidden reasoning.'
      ].join('\n'),
      payload: {
        action: 'npc_dialogue',
        npc,
        canonicalGod,
        canonicalClass: npc.canonicalClass || null,
        canonicalRace: npc.race || null,
        covenant: npc.covenant || null,
        homebrewAlignment: npc.homebrewAlignment || null,
        alignmentGuidance: alignmentGuidance(npc),
        conversation: {
          pending: messages,
          recent: arr(context?.recent).slice(-Number(config.memoryTurns || 18))
        },
        combat: context?.combat || null,
        time: context?.time || null,
        scene: context?.scene || null,
        behavior: { responseMode: config.responseMode || 'adaptive' },
        outputContract: {
          mode: 'single|varied',
          responses: [{ text: 'string', targetPlayerIds: [], emotion: 'string', reaction: 'string' }],
          memoryWrites: [],
          statePatch: { npc: {} }
        }
      }
    };
  }

  function normalizeResponse(raw, request, canonicalGod) {
    let value = raw;
    if (typeof value === 'string') {
      try { value = JSON.parse(value); } catch {
        const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i);
        if (fenced) {
          try { value = JSON.parse(fenced[1]); } catch { value = { responses: [{ text: fenced[1] }] }; }
        } else value = { responses: [{ text: value }] };
      }
    }
    value = value?.data || value?.result || value?.response || value;
    const responses = arr(value?.responses || value?.messages || value?.reply).map((entry) => {
      const response = typeof entry === 'string' ? { text: entry } : entry;
      return {
        text: text(response?.text || response?.message || response?.reply),
        targetPlayerIds: arr(response?.targetPlayerIds || response?.targets),
        emotion: text(response?.emotion || 'neutral'),
        reaction: text(response?.reaction || response?.emotion || 'neutral')
      };
    }).filter((entry) => entry.text);
    if (!responses.length && text(value?.text)) responses.push({ text: text(value.text), targetPlayerIds: [], emotion: 'neutral', reaction: 'neutral' });
    if (!responses.length) throw new Error('Dialogue response contained no usable spoken text.');

    const forbidden = /\b(?:lawful good|neutral good|chaotic good|lawful neutral|true neutral|chaotic neutral|lawful evil|neutral evil|chaotic evil)\b/ig;
    responses.forEach((entry) => { entry.text = entry.text.replace(forbidden, 'its current moral profile'); });

    const godQuestion = request.payload.conversation.pending.some((message) => /\b(god|gods|deity|deities|worship|faith|divine patron|holy name)\b/i.test(message.text || message));
    if (godQuestion) {
      responses.splice(1);
      responses[0].text = canonicalGod
        ? `${canonicalGod.name} is the only divine power I recognize in this matter.`
        : 'I claim no divine patron in this encounter, and I will not recognize an outside god.';
      responses[0].emotion = 'measured';
      responses[0].reaction = 'answering';
    }

    return {
      requestId: request.requestId,
      mode: responses.length > 1 ? 'varied' : 'single',
      responses,
      memoryWrites: arr(value?.memoryWrites),
      statePatch: value?.statePatch || {},
      decisionFactors: arr(value?.decisionFactors).slice(0, 8),
      warnings: arr(value?.warnings),
      engine: value?.engine || 'backend'
    };
  }

  class NPCDialogueEngine {
    constructor(options = {}) {
      this.config = options.config || {};
      this.pantheon = options.pantheon || { deities: [] };
      this.sessions = new Map();
      this.studioPromise = null;
    }

    canonicalDeity(value) {
      if (!value) return null;
      const probe = typeof value === 'object' ? (value.id || value.name) : value;
      return arr(this.pantheon.deities).find((deity) => deity.id === probe || deity.name?.toLowerCase() === String(probe).toLowerCase()) || null;
    }

    async studio() {
      const config = this.config.dialogueStudio || {};
      if (config.enabled === false) return null;
      if (global.LifeTalk?.fallbackBrain && global.LifeTalk?.backend) return global.LifeTalk;
      if (!global.RandomEncounterDialogueStudioLoader) return null;
      if (!this.studioPromise) {
        this.studioPromise = global.RandomEncounterDialogueStudioLoader.load({
          basePath: config.basePath || 'assets/RandomEncounters/js/dialogue-studio/'
        }).catch((error) => {
          this.studioPromise = null;
          console.warn('[RandomEncounters] Dialogue Studio runtime unavailable.', error);
          return null;
        });
      }
      return this.studioPromise;
    }

    sessionFor(hostile) {
      const id = hostile.instanceId || hostile.id;
      if (!this.sessions.has(id)) this.sessions.set(id, profileFor(hostile));
      const npc = this.sessions.get(id);
      npc.currentHp = hostile.currentHp ?? npc.currentHp;
      npc.maxHp = hostile.maxHp ?? npc.maxHp;
      npc.deity = this.canonicalDeity(hostile.deity) || null;
      npc.canonicalClass = clone(hostile.canonicalClass || npc.canonicalClass);
      npc.race = clone(hostile.race || npc.race);
      npc.covenant = clone(hostile.covenant || npc.covenant);
      npc.species = npc.race?.name || npc.species;
      npc.profession = [npc.canonicalClass?.name, npc.canonicalClass?.subclass?.name || npc.canonicalClass?.subclass, ...arr(hostile.roles)].filter(Boolean).join(', ');
      npc.homebrewAlignment = clone(hostile.homebrewAlignment || npc.homebrewAlignment);
      return npc;
    }

    stateFor(npc) {
      return { npcs: [npc], factions: [], quests: [], settings: {} };
    }

    applyStatePatch(npc, patch) {
      const change = patch?.npc || {};
      if (change.mood) npc.state.mood = text(change.mood);
      if (Number.isFinite(Number(change.stress))) npc.state.stress = clamp(change.stress, 0, 100);
      if (change.trustByPlayer && typeof change.trustByPlayer === 'object') {
        npc.state.trustByPlayer = { ...npc.state.trustByPlayer, ...change.trustByPlayer };
      }
    }

    applyMemories(npc, memories) {
      const max = Number(this.config.combatMemory?.maxMemoriesPerHostile || 100);
      for (const memory of arr(memories)) {
        const summary = text(memory?.summary || memory?.text || memory);
        if (summary) npc.state.memories.push({ summary, at: new Date().toISOString(), playerId: memory?.playerId || null });
      }
      if (npc.state.memories.length > max) npc.state.memories.splice(0, npc.state.memories.length - max);
    }

    async respond(hostile, incomingMessages, context = {}) {
      const npc = this.sessionFor(hostile);
      const maxChars = Number(this.config.maxMessageChars || 8000);
      const messages = arr(incomingMessages).map((message) => typeof message === 'string' ? {
        playerId: 'player', playerName: 'Player', text: message.slice(0, maxChars)
      } : {
        ...message,
        playerId: message.playerId || 'player',
        playerName: message.playerName || 'Player',
        text: text(message.text).slice(0, maxChars)
      }).filter((message) => message.text);
      if (!messages.length) throw new Error('NPC dialogue requires at least one non-empty player message.');

      const canonicalGod = this.canonicalDeity(npc.deity);
      npc.deity = canonicalGod;
      const combat = {
        active: Boolean(context?.combat?.active),
        round: Number(context?.combat?.round || 0),
        currentHp: Number(hostile.currentHp ?? npc.currentHp),
        maxHp: Number(hostile.maxHp ?? npc.maxHp),
        hpRatio: Number(context?.combat?.hpRatio ?? (Number(hostile.currentHp ?? npc.currentHp) / Math.max(1, Number(hostile.maxHp ?? npc.maxHp))))
      };
      const request = buildRequest(npc, messages, { ...context, combat }, this.config);
      const studio = await this.studio();
      let response;

      if (studio && this.config.backend?.enabled !== false && this.config.dialogueStudio?.useStudioBackend !== false) {
        try {
          response = await studio.backend.post(request, {
            backendEndpoint: this.config.backend.endpoint,
            backendTimeoutMs: this.config.backend.timeoutMs,
            backendLibraryUrl: this.config.backend.libraryUrl
          });
          response = normalizeResponse(response, request, canonicalGod);
          response.engine = 'dialogue-studio-backend';
        } catch (error) {
          console.warn('[RandomEncounters] Dialogue backend failed; using attached local fallback.', error);
        }
      }

      if (!response && studio?.fallbackBrain && this.config.fallbackEnabled !== false) {
        response = await studio.fallbackBrain.respond(request, this.stateFor(npc));
        response = normalizeResponse(response, request, canonicalGod);
        response.engine = 'dialogue-studio-fallback';
      }

      if (!response) throw new Error('No NPC dialogue engine is available.');
      this.applyStatePatch(npc, response.statePatch);
      this.applyMemories(npc, response.memoryWrites);
      global.dispatchEvent(new CustomEvent('randomencounters:npc-dialogue', { detail: { hostile, npc, request, response } }));
      return response;
    }

    recordAttack(hostile, detail = {}) {
      const npc = this.sessionFor(hostile);
      const attackerId = detail.attackerId || 'unknown';
      if (!npc.state.attackedBy.includes(attackerId)) npc.state.attackedBy.push(attackerId);
      npc.state.damageTaken += Math.max(0, Number(detail.damage || 0));
      npc.state.stress = clamp(npc.state.stress + Math.max(4, Math.ceil(Number(detail.damage || 0) / 2)), 0, 100);
      npc.state.mood = 'angry';
      this.applyMemories(npc, [{
        playerId: attackerId,
        summary: `${detail.attackerName || attackerId} attacked ${npc.name}${detail.damage ? ` for ${detail.damage} damage` : ' but did not deal damage'}.`
      }]);
      return npc;
    }

    combatBark(hostile, trigger, context = {}) {
      const npc = this.sessionFor(hostile);
      const god = this.canonicalDeity(npc.deity);
      const axes = npc.homebrewAlignment?.axes || {};
      const merciful = axes.mercy === 'Merciful';
      const disciplined = axes.restraint === 'Disciplined';
      const honorable = axes.honor === 'Honorable';
      const className = npc.canonicalClass?.name;
      const lines = {
        turn: god ? `${god.name}, witness how a ${className || 'covenant-bearer'} answers.` : 'Move. The opening is now.',
        attacked: disciplined ? 'I know your face. I will answer the threat, not lose myself to it.' : 'I know your face now. You are the immediate threat.',
        bloodied: merciful || honorable ? 'This can still end by clear terms and spared lives.' : 'Another step and I take someone with me.',
        defeated: honorable || merciful ? 'The fight is finished. Do not turn victory into slaughter.' : 'Not finished... merely interrupted.'
      };
      const bark = { text: lines[trigger] || 'The encounter changes.', emotion: trigger === 'turn' ? 'focused' : 'angry', reaction: trigger };
      global.dispatchEvent(new CustomEvent('randomencounters:npc-bark', { detail: { hostile, npc, trigger, context, bark } }));
      return bark;
    }
  }

  global.RandomEncounterDialogue = { NPCDialogueEngine, profileFor, buildRequest, normalizeResponse };
}(window));
