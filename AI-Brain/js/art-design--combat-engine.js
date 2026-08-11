/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-b. */
(function (global) {
  'use strict';

  const { RNG } = global.RandomEncounterDice;
  const { HostileAI, isAlive, distanceTo } = global.RandomEncounterAI;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function abilityMod(score) {
    return Math.floor((Number(score || 10) - 10) / 2);
  }

  function limitedUsesFromName(name) {
    const match = String(name || '').match(/\((\d+)\s*\/\s*day\)/i);
    return match ? Number(match[1]) : null;
  }

  function rechargeThreshold(name) {
    const match = String(name || '').match(/recharge\s*(\d)(?:\s*[-–]\s*(\d))?/i);
    return match ? Number(match[1]) : null;
  }


  function alternatingParticipants(party, hostiles) {
    const players = [...party].sort((a, b) => b.initiative - a.initiative || Number(b.initiativeBonus || 0) - Number(a.initiativeBonus || 0));
    const hostileSlots = [...hostiles]
      .sort((a, b) => b.initiative - a.initiative || Number(b.initiativeBonus || 0) - Number(a.initiativeBonus || 0))
      .flatMap((hostile) => Array.from({ length: Math.max(1, Number(hostile.initiativeSlots || 1)) }, () => hostile));
    const highestPlayer = players[0]?.initiative ?? -Infinity;
    const highestHostile = hostileSlots[0]?.initiative ?? -Infinity;
    let nextSide = highestPlayer >= highestHostile ? 'player' : 'hostile';
    const order = [];
    while (players.length || hostileSlots.length) {
      const queue = nextSide === 'player' ? players : hostileSlots;
      const other = nextSide === 'player' ? hostileSlots : players;
      if (queue.length) order.push(queue.shift());
      else if (other.length) order.push(other.shift());
      nextSide = nextSide === 'player' ? 'hostile' : 'player';
      if (!(nextSide === 'player' ? players : hostileSlots).length && (nextSide === 'player' ? hostileSlots : players).length) {
        nextSide = nextSide === 'player' ? 'hostile' : 'player';
      }
    }
    return order;
  }

  class CombatEngine {
    constructor(adapter, options) {
      this.adapter = adapter;
      this.options = { hostileDelay: 550, ...options };
      this.adapter.bindEngine(this);
      this.state = null;
      this.listeners = new Map();
      this.rng = new RNG();
      this.ai = new HostileAI(this.rng);
      this.autoHostiles = this.options.autoHostiles !== false;
      this.dialogue = this.options.dialogueEngine || null;
    }

    on(name, listener) {
      if (!this.listeners.has(name)) this.listeners.set(name, new Set());
      this.listeners.get(name).add(listener);
      return () => this.listeners.get(name).delete(listener);
    }

    emit(name, detail) {
      (this.listeners.get(name) || []).forEach((listener) => listener(detail));
      this.adapter.emit(name, detail);
    }

    log(message, type = 'info', data = null) {
      const entry = { time: new Date().toISOString(), round: this.state?.round || 0, message, type, data };
      if (this.state) this.state.log.push(entry);
      this.emit('log', entry);
      return entry;
    }

    prepareHostile(hostile, party) {
      const prepared = { ...clone(hostile), combatId: hostile.instanceId, type: 'hostile', initiative: null };
      prepared.distanceByTarget = prepared.distanceByTarget || {};
      for (const target of party) {
        prepared.distanceByTarget[target.id] = Number(prepared.distanceByTarget[target.id] ?? prepared.startingDistanceFt ?? target.distanceFt ?? 30);
      }
      prepared.actionUses = prepared.actionUses || {};
      prepared.actionRecharge = prepared.actionRecharge || {};
      for (const action of prepared.actions || []) {
        const uses = limitedUsesFromName(action.name);
        if (uses !== null) prepared.actionUses[action.name] = uses;
        if (rechargeThreshold(action.name) !== null) prepared.actionRecharge[action.name] = true;
      }
      return prepared;
    }

    start(encounter, party) {
      this.rng = new RNG(encounter.seed || `${encounter.id}-combat`);
      this.ai = new HostileAI(this.rng);
      const pcs = (party || this.adapter.getParty()).map((member) => ({
        ...clone(member),
        combatId: member.id,
        type: 'player',
        initiative: null,
        reactionAvailable: false,
        reactionsPerRound: 1,
        beatsPerTurn: 3,
        beatsRemaining: 0,
        guardAcBonus: 0,
        conditions: member.conditions || []
      }));
      const hostiles = encounter.hostiles.map((hostile) => {
        const prepared = this.prepareHostile(hostile, pcs);
        prepared.reactionAvailable = false;
        prepared.beatsPerTurn = Math.max(1, Number(prepared.beatsPerTurn || 3));
        prepared.beatsRemaining = 0;
        prepared.guardAcBonus = 0;
        return prepared;
      });
      [...pcs, ...hostiles].forEach((participant) => {
        participant.initiative = this.rng.d(20) + Number(participant.initiativeBonus || 0);
      });
      const participants = alternatingParticipants(pcs, hostiles);

      this.state = {
        encounter: clone(encounter),
        party: pcs,
        hostiles,
        participants,
        initiativeMode: 'alternating sides',
        beatsPerTurn: 3,
        reactionsPerCreature: 1,
        turnIndex: 0,
        round: 1,
        started: true,
        ended: false,
        result: null,
        progressClocks: clone(encounter.scene?.progressClocks || []),
        dangerClocks: clone(encounter.scene?.dangerClocks || []),
        objective: clone(encounter.objective || encounter.scene?.objective || null),
        log: []
      };
      const first = participants[0];
      this.log(`Conflict begins with alternating-side initiative. ${first?.displayName || first?.name || 'No combatant'} has the first 3-Beat turn.`, 'system');
      this.emit('started', this.state);
      this.handleCurrent();
      return this.state;
    }

    current() {
      return this.state?.participants[this.state.turnIndex] || null;
    }

    living(side) {
      return (side === 'hostile' ? this.state.hostiles : this.state.party).filter(isAlive);
    }

    resetRoundState() {
      [...this.state.party, ...this.state.hostiles].forEach((participant) => {
        participant.hasPressed = false;
      });
    }

    finishCurrentTurn() {
      const actor = this.current();
      if (!actor || !isAlive(actor)) return;
      actor.reactionAvailable = true;
      actor.beatsRemaining = 0;
    }

    refreshRecharge(actor) {
      for (const action of actor.actions || []) {
        const threshold = rechargeThreshold(action.name);
        if (threshold === null || actor.actionRecharge?.[action.name] !== false) continue;
        const roll = this.rng.d(6);
        if (roll >= threshold) {
          actor.actionRecharge[action.name] = true;
          this.log(`${actor.displayName} recharges ${action.name}.`, 'resource');
        }
      }
    }

    advance() {
      if (!this.state || this.state.ended) return;
      this.finishCurrentTurn();
      let guard = 0;
      do {
        this.state.turnIndex += 1;
        if (this.state.turnIndex >= this.state.participants.length) {
          this.state.turnIndex = 0;
          this.state.round += 1;
          this.resetRoundState();
          this.log(`Round ${this.state.round} begins. Initiative continues to alternate between sides.`, 'round');
        }
        guard += 1;
      } while (guard < this.state.participants.length + 1 && !isAlive(this.current()));

      this.checkEnd();
      if (!this.state.ended) this.handleCurrent();
      this.emit('state', this.state);
    }

    handleCurrent() {
      const actor = this.current();
      if (!actor || this.state.ended) return;
      // A Reaction exists from the end of the prior turn until the start of this one.
      actor.reactionAvailable = false;
      actor.beatsRemaining = Math.max(1, Number(actor.beatsPerTurn || 3));
      actor.guardAcBonus = 0;
      this.log(`${actor.displayName || actor.name}'s turn begins with ${actor.beatsRemaining} Beats.`, 'turn', { combatId: actor.combatId, beats: actor.beatsRemaining });
      if (actor.type === 'hostile') {
        this.refreshRecharge(actor);
        if (this.dialogue) this.dialogue.combatBark(actor, 'turn', { combat: this.state, time: this.state.encounter?.time });
      }
      this.emit('turn', actor);

      if (actor.type === 'hostile' && this.autoHostiles) {
        setTimeout(() => {
          if (this.current() === actor && !this.state.ended) {
            this.runHostileTurn(actor);
            this.advance();
          }
        }, Math.max(0, Number(this.options.hostileDelay || 0)));
      }
    }

    runHostileTurn(actor) {
      const turn = this.ai.decideTurn(actor, this.living('player'), this.state);
      const results = [];
      for (const decision of turn.steps || []) {
        const cost = Math.max(0, Number(decision.cost || 0));
        if (cost > actor.beatsRemaining) break;
        actor.beatsRemaining -= cost;
        if (decision.type === 'flee') {
          actor.defeated = true;
          actor.fled = true;
          this.log(`${actor.displayName} spends its turn escaping the encounter.`, 'movement');
          results.push(decision);
          break;
        }
        if (decision.type === 'move') {
          actor.distanceByTarget = actor.distanceByTarget || {};
          actor.distanceByTarget[decision.target.id] = Math.max(5, Number(decision.distance || 5));
          this.log(`${actor.displayName} spends 1 Beat to Step toward ${decision.target.name}, closing to ${actor.distanceByTarget[decision.target.id]} feet.`, 'movement');
          results.push(decision);
          continue;
        }
        if (decision.type === 'guard') {
          actor.guardAcBonus = Math.max(Number(actor.guardAcBonus || 0), Number(decision.acBonus || 2));
          this.log(`${actor.displayName} spends 1 Beat to Guard, gaining +${actor.guardAcBonus} AC until its next turn.`, 'action');
          results.push(decision);
          continue;
        }
        if (decision.type === 'wait') {
          this.log(`${actor.displayName} holds position and leaves no further Beat action unresolved.`, 'action');
          results.push(decision);
          continue;
        }
        if (decision.type === 'action') {
          this.log(`${actor.displayName} spends ${cost} Beats on ${decision.actionName || 'Strike'}.`, 'action');
          results.push(decision.plan?.length
            ? this.resolveActionPlan(actor, decision.target, decision.plan)
            : this.resolveHostileAction(actor, decision.target, decision.action));
        }
        if (this.state.ended) break;
      }
      this.checkEnd();
      return { type: 'turn-plan', plan: turn, results };
    }

    consumeActionResource(actor, action) {
      if (action.source === 'ichor' && actor.ichorWeapon) {
        actor.ichorWeapon.currentCharges = Math.max(0, Number(actor.ichorWeapon.currentCharges || 0) - 1);
      }
      if (actor.actionUses?.[action.name] !== undefined) {
        actor.actionUses[action.name] = Math.max(0, Number(actor.actionUses[action.name]) - 1);
      }
      if (rechargeThreshold(action.name) !== null) actor.actionRecharge[action.name] = false;
    }

    resolveActionPlan(actor, initialTarget, plan) {
      const results = [];
      let target = initialTarget;
      for (const action of plan) {
        if (!isAlive(target)) target = this.ai.chooseTarget(actor, this.living('player'), this.state);
        if (!target) break;
        if (Number(action.rangeFt || 5) < distanceTo(actor, target)) break;
        results.push(this.resolveHostileAction(actor, target, { ...action, multiattackCount: 1 }, { deferEndCheck: true }));
      }
      this.checkEnd();
      return { type: 'multiattack', results };
    }

    resolveHostileAction(actor, target, action, options = {}) {
      if (!action || !isAlive(target)) return null;
      this.consumeActionResource(actor, action);

      if (action.category === 'save' && action.saveDc) {
        const ability = String(action.saveAbility || '').toUpperCase();
        const modifier = Number(target.saves?.[ability] ?? target[`${ability.toLowerCase()}Save`] ?? 0);
        const roll = this.rng.d(20) + modifier;
        const success = roll >= Number(action.saveDc);
        let damage = this.rng.roll(action.damageDice || '1d6').total + Number(action.damageBonus || 0);
        if (success) damage = Math.floor(damage / 2);
        if (action.riderDice && !success) damage += this.rng.roll(action.riderDice).total;
        this.adapter.applyDamage(target, damage, {
          sourceId: actor.combatId,
          sourceName: actor.displayName,
          action: action.name,
          save: { ability, roll, dc: action.saveDc, success }
        });
        this.log(`${actor.displayName} uses ${action.name}. ${target.name} rolls ${roll} vs DC ${action.saveDc} and ${success ? 'succeeds' : 'fails'}, taking ${damage} ${action.damageType} damage.`, 'attack');
        const result = { actor, target, action, damage, saveRoll: roll, success };
        this.emit('hostile-action', result);
        if (!options.deferEndCheck) this.checkEnd();
        return result;
      }

      const repeats = Math.max(1, Math.min(4, Number(action.multiattackCount || 1)));
      const results = [];
      for (let index = 0; index < repeats && isAlive(target); index += 1) {
        const d20 = this.rng.d(20);
        const total = d20 + Number(action.attackBonus ?? (abilityMod(actor.abilities?.STR) + 2));
        const critical = d20 === 20;
        const hit = d20 !== 1 && (critical || total >= Number(target.ac || 10));
        let damage = 0;
        if (hit) {
          damage = this.rng.roll(action.damageDice || '1d4').total + Number(action.damageBonus || 0);
          if (critical) damage += this.rng.roll(action.damageDice || '1d4').total;
          if (action.riderDice) damage += this.rng.roll(action.riderDice).total;
          this.adapter.applyDamage(target, damage, {
            sourceId: actor.combatId,
            sourceName: actor.displayName,
            action: action.name,
            attackRoll: total,
            critical
          });
        }
        this.log(`${actor.displayName} ${hit ? 'hits' : 'misses'} ${target.name} with ${action.name} (${total} vs AC ${target.ac})${hit ? ` for ${damage} ${action.damageType} damage` : ''}.`, hit ? 'attack' : 'miss');
        const result = { actor, target, action, attackRoll: total, hit, critical, damage };
        results.push(result);
        this.emit('hostile-action', result);
      }
      if (!options.deferEndCheck) this.checkEnd();
      return results.length === 1 ? results[0] : results;
    }

    playerAttack(detail) {
      if (!this.state || this.state.ended) return { ok: false, reason: 'No active combat' };
      const hostile = this.state.hostiles.find((entry) => entry.instanceId === detail.hostileId || entry.combatId === detail.hostileId);
      const attacker = this.state.party.find((entry) => entry.id === detail.attackerId) || {
        id: detail.attackerId || 'unknown',
        name: detail.attackerName || 'Player',
        currentHp: Number(detail.attackerCurrentHp || 1),
        maxHp: Number(detail.attackerMaxHp || 1),
        defeated: false
      };
      if (!hostile || !isAlive(hostile)) return { ok: false, reason: 'Hostile not found or defeated' };

      const incoming = {
        melee: Boolean(detail.melee),
        metalWeapon: Boolean(detail.metalWeapon),
        attackRoll: Number(detail.attackRoll || 0),
        damage: Math.max(0, Number(detail.damage || 0))
      };
      const currentActor = this.current();
      if (currentActor?.type === 'player' && currentActor.id === attacker.id) {
        if (Number(currentActor.beatsRemaining || 0) < 2) return { ok: false, reason: 'A Strike costs 2 Beats and this character has fewer than 2 remaining.' };
        currentActor.beatsRemaining -= 2;
        this.log(`${attacker.name} spends 2 Beats on a Strike; ${currentActor.beatsRemaining} Beat${currentActor.beatsRemaining === 1 ? '' : 's'} remain.`, 'player-action');
      }
      const reaction = this.ai.reaction(hostile, incoming);
      const effectiveAc = Number(hostile.ac || 10) + Number(hostile.guardAcBonus || 0) + Number(reaction.acBonus || 0);
      const hit = detail.autoHit === true || (incoming.attackRoll > 0 && incoming.attackRoll >= effectiveAc);
      let retaliation = 0;

      if (reaction.used) this.log(`${hostile.displayName} reacts with ${reaction.name}, raising AC to ${effectiveAc}.`, 'reaction');
      if (hit) {
        hostile.currentHp = Math.max(0, Number(hostile.currentHp) - incoming.damage);
        hostile.defeated = hostile.currentHp <= 0;
        this.ai.registerAttack(hostile, attacker.id, incoming.damage);
        this.log(`${attacker.name} hits ${hostile.displayName} for ${incoming.damage} damage. ${hostile.currentHp}/${hostile.maxHp} HP remains.`, 'player-attack');
      } else {
        this.ai.registerAttack(hostile, attacker.id, 0);
        this.log(`${attacker.name}'s attack misses ${hostile.displayName}${reaction.used ? ' because of its reaction' : ''}.`, 'miss');
        if (reaction.used && reaction.retaliationDice) {
          retaliation = this.rng.roll(reaction.retaliationDice).total;
          this.adapter.applyDamage(attacker, retaliation, {
            sourceId: hostile.instanceId,
            sourceName: hostile.displayName,
            action: reaction.name,
            reaction: true
          });
          this.log(`${reaction.name} shocks ${attacker.name} for ${retaliation} ${reaction.retaliationType} damage.`, 'reaction');
        }
      }

      if (this.dialogue) {
        this.dialogue.recordAttack(hostile, {
          ...detail,
          attackerId: attacker.id,
          attackerName: attacker.name,
          damage: hit ? incoming.damage : 0
        });
        this.dialogue.combatBark(hostile, hostile.currentHp <= hostile.maxHp * 0.35 ? 'bloodied' : 'attacked', { combat: this.state });
      }
      const payload = { hostile, attacker, detail, reaction, hit, retaliation };
      this.emit('hostile-attacked', payload);
      this.checkEnd();
      this.emit('state', this.state);
      return { ok: true, ...payload };
    }

    healHostile(hostileId, amount) {
      const hostile = this.state?.hostiles.find((entry) => entry.instanceId === hostileId);
      if (!hostile) return null;
      hostile.currentHp = Math.min(hostile.maxHp, Number(hostile.currentHp) + Number(amount || 0));
      hostile.defeated = false;
      hostile.defeatBarkSent = false;
      this.emit('state', this.state);
      return hostile;
    }

    checkEnd() {
      if (!this.state || this.state.ended) return;
      if (!this.living('hostile').length) {
        this.state.hostiles.forEach((hostile) => {
          if (this.dialogue && !hostile.defeatBarkSent) {
            hostile.defeatBarkSent = true;
            this.dialogue.combatBark(hostile, 'defeated', { combat: this.state });
          }
        });
        this.state.ended = true;
        this.state.result = 'victory';
        this.log('All hostiles are defeated or have fled.', 'result');
        this.emit('ended', this.state);
      } else if (!this.living('player').length) {
        this.state.ended = true;
        this.state.result = 'defeat';
        this.log('The party has no combatants still standing.', 'result');
        this.emit('ended', this.state);
      }
    }

    exportState() {
      return clone(this.state);
    }
  }

  global.RandomEncounterCombat = { CombatEngine, alternatingParticipants };
}(window));
