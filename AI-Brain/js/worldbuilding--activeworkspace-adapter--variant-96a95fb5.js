/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-c. */
(function (global) {
  'use strict';
  const Canon=global.ActiveWorkspaceCanon;

  const Levels = global.RandomEncounterPartyLevels;

  function normalizePartyMember(member, index) {
    const base = Levels.normalizeMember(member, index);
    const level = base.totalLevel;
    const maxHp = Number(base.maxHp || 10 + level * 5);
    const currentHp = Number(base.currentHp ?? maxHp);
    const roles = Array.isArray(base.roles) ? base.roles : [base.role || (base.spellcasting ? 'caster' : 'adventurer')];
    return {
      ...base,
      maxHp,
      currentHp,
      ac: Number(base.ac || base.armorClass || 10 + Math.min(8, Math.floor(level / 2))),
      initiativeBonus: Number(base.initiativeBonus ?? base.initiative ?? base.dexterityModifier ?? 0),
      roles,
      distanceFt: Number(base.distanceFt || 30),
      defeated: currentHp <= 0,
      type: 'player'
    };
  }

  class ActiveWorkspaceAdapter {
    constructor(options) {
      this.options = options || {};
      this.engine = null;
      this.party = [];
      this.location = {};
      this.worldTime = { year: 1, month: 1, day: 1, hour: 12, minute: 0, leapDay: false };
      this.bindEvents();
    }

    bindEngine(engine) {
      this.engine = engine;
    }

    getParty() {
      let party = null;
      try {
        if (typeof this.options.getParty === 'function') party = this.options.getParty();
        else if (global.ActiveWorkspace && typeof global.ActiveWorkspace.getParty === 'function') party = global.ActiveWorkspace.getParty();
        else if (Array.isArray(global.ActiveWorkspaceParty)) party = global.ActiveWorkspaceParty;
      } catch (error) {
        console.warn('[RandomEncounters] ActiveWorkspace getParty hook failed.', error);
      }
      if (!Array.isArray(party) || !party.length) party = this.party;
      const normalized = (party || []).map(normalizePartyMember);
      const adjusted = normalized.filter((member) => member.levelAdjusted);
      if (adjusted.length) {
        global.dispatchEvent(new CustomEvent('randomencounters:party-level-adjusted', {
          detail: { minimumLevel: Levels.MIN_LEVEL, members: adjusted }
        }));
      }
      return normalized;
    }

    setFallbackParty(party) {
      this.party = (party || []).map(normalizePartyMember);
    }

    getLocation() {
      let location = null;
      try {
        if (typeof this.options.getLocation === 'function') location = this.options.getLocation();
        else if (global.ActiveWorkspace && typeof global.ActiveWorkspace.getLocation === 'function') location = global.ActiveWorkspace.getLocation();
        else if (global.ActiveWorkspaceLocation && typeof global.ActiveWorkspaceLocation === 'object') location = global.ActiveWorkspaceLocation;
      } catch (error) {
        console.warn('[RandomEncounters] ActiveWorkspace getLocation hook failed.', error);
      }
      return { ...this.location, ...(location && typeof location === 'object' ? location : {}) };
    }

    setFallbackLocation(location) {
      this.location = location && typeof location === 'object' ? { ...location } : {};
    }

    getWorldTime() {
      let worldTime = null;
      try {
        if (typeof this.options.getWorldTime === 'function') worldTime = this.options.getWorldTime();
        else if (global.ActiveWorkspace && typeof global.ActiveWorkspace.getWorldTime === 'function') worldTime = global.ActiveWorkspace.getWorldTime();
        else if (global.ActiveWorkspaceWorldTime && typeof global.ActiveWorkspaceWorldTime === 'object') worldTime = global.ActiveWorkspaceWorldTime;
      } catch (error) {
        console.warn('[RandomEncounters] ActiveWorkspace getWorldTime hook failed.', error);
      }
      return { ...this.worldTime, ...(worldTime && typeof worldTime === 'object' ? worldTime : {}) };
    }

    setFallbackWorldTime(worldTime) {
      if (worldTime && typeof worldTime === 'object') this.worldTime = { ...this.worldTime, ...worldTime };
    }

    callDamageHook(payload) {
      if (typeof this.options.applyDamage === 'function') return this.options.applyDamage(payload);
      if (global.ActiveWorkspace && typeof global.ActiveWorkspace.applyDamage === 'function') return global.ActiveWorkspace.applyDamage(payload);
      return null;
    }

    applyDamage(target, amount, context) {
      const damage = Math.max(0, Number(amount || 0));
      const before = Number(target.currentHp ?? target.maxHp ?? 0);
      const after = Math.max(0, before - damage);
      target.currentHp = after;
      target.defeated = after <= 0;

      const payload = {
        targetId: target.id,
        targetName: target.name,
        amount: damage,
        beforeHp: before,
        currentHp: after,
        maxHp: Number(target.maxHp || before),
        defeated: target.defeated,
        context
      };

      try {
        const result = this.callDamageHook(payload);
        if (result && typeof result.then === 'function') {
          result.then((resolved) => this.applyAuthoritativeState(target, resolved)).catch((error) => {
            console.warn('[RandomEncounters] Asynchronous ActiveWorkspace damage hook failed.', error);
          });
        } else {
          this.applyAuthoritativeState(target, result);
        }
      } catch (error) {
        console.warn('[RandomEncounters] ActiveWorkspace applyDamage hook failed.', error);
      }

      global.dispatchEvent(new CustomEvent('randomencounters:damage-request', { detail: payload }));
      return payload;
    }

    applyAuthoritativeState(target, state) {
      if (!state || typeof state !== 'object') return;
      const currentHp = state.currentHp ?? state.hp ?? state.current_hp;
      const maxHp = state.maxHp ?? state.max_hp;
      if (Number.isFinite(Number(currentHp))) target.currentHp = Math.max(0, Number(currentHp));
      if (Number.isFinite(Number(maxHp))) target.maxHp = Math.max(1, Number(maxHp));
      if (typeof state.defeated === 'boolean') target.defeated = state.defeated;
      else target.defeated = Number(target.currentHp) <= 0;
    }

    emit(name, detail) {
      global.dispatchEvent(new CustomEvent(`randomencounters:${name}`, { detail }));
    }

    bindEvents() {
      global.addEventListener('activeworkspace:party-updated', (event) => {
        if (Array.isArray(event.detail)) this.setFallbackParty(event.detail);
      });
      global.addEventListener('activeworkspace:location-updated', (event) => {
        if (event.detail && typeof event.detail === 'object') this.setFallbackLocation(event.detail);
      });
      global.addEventListener('activeworkspace:world-time-updated', (event) => {
        if (event.detail && typeof event.detail === 'object') this.setFallbackWorldTime(event.detail);
      });
      global.addEventListener('activeworkspace:hostile-attacked', (event) => {
        if (this.engine && event.detail) this.engine.playerAttack(event.detail);
      });
      global.addEventListener('activeworkspace:next-combat-turn', () => {
        if (this.engine) this.engine.advance();
      });
      global.addEventListener('activeworkspace:npc-dialogue', (event) => {
        if (!this.engine?.dialogue || !event.detail?.hostileId) return;
        const hostile = this.engine.state?.hostiles.find((entry) => entry.instanceId === event.detail.hostileId) || event.detail.hostile;
        if (!hostile) return;
        this.engine.dialogue.respond(hostile, event.detail.messages || event.detail.message, { combat: this.engine.state }).catch(console.error);
      });
    }
  }

  global.RandomEncounterActiveWorkspace = { ActiveWorkspaceAdapter, normalizePartyMember };
}(window));
