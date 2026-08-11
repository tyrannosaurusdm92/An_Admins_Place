/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-c. */
(function (global) {
  'use strict';

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
  const arr = (value) => Array.isArray(value) ? value : (value == null ? [] : [value]);

  class RandomEncountersUI {
    constructor(root, api) {
      this.root = root;
      this.api = api;
      this.encounter = null;
      this.party = [];
      this.partySource = 'fallback';
      this.activeTab = 'encounter';
      this.dialogueHostileId = null;
      this.dialogueLog = [];
      this.location = {};
      this.worldTime = { year: 1, month: 1, day: 1, hour: 12, minute: 0, leapDay: false };
      this.bindEngine();
    }

    bindEngine() {
      ['started', 'state', 'turn', 'ended', 'log'].forEach((eventName) => this.api.combat.on(eventName, () => this.render()));
      global.addEventListener('randomencounters:npc-dialogue', (event) => {
        const detail = event.detail;
        if (!detail?.response) return;
        for (const response of detail.response.responses || []) {
          this.dialogueLog.push({ speaker: detail.npc?.name || 'NPC', text: response.text, emotion: response.emotion });
        }
        if (this.activeTab === 'dialogue') this.render();
      });
      global.addEventListener('randomencounters:npc-bark', (event) => {
        const detail = event.detail;
        if (!detail?.bark?.text) return;
        this.dialogueLog.push({ speaker: detail.npc?.name || 'NPC', text: detail.bark.text, emotion: detail.bark.emotion });
      });
      global.addEventListener('activeworkspace:party-updated', () => {
        const connected = this.api.adapter.getParty();
        if (connected.length) {
          this.party = connected;
          this.partySource = 'activeworkspace';
          this.render();
        }
      });
      global.addEventListener('activeworkspace:location-updated', () => {
        this.location = this.api.adapter.getLocation();
        this.render();
      });
      global.addEventListener('activeworkspace:world-time-updated', () => {
        this.worldTime = this.api.adapter.getWorldTime();
        this.render();
      });
    }

    async init() {
      await this.api.ready;
      const connectedParty = this.api.adapter.getParty();
      if (connectedParty.length) {
        this.party = connectedParty;
        this.partySource = 'activeworkspace';
      } else {
        this.party = this.defaultParty(4, 8);
        this.partySource = 'fallback';
        this.api.adapter.setFallbackParty(this.party);
      }
      this.location = this.api.adapter.getLocation();
      this.worldTime = this.api.adapter.getWorldTime();
      this.render();
    }

    defaultParty(size, level) {
      const safeLevel = Math.max(8, Math.min(30, Number(level) || 8));
      const canonical = this.api.data?.classRegistry?.map((entry) => entry.name) || [];
      const classNames = canonical.length ? canonical : ['Covenant Aegis', 'Ashen Lifebringer', 'Chaoswheel Oracle', 'Mindknife Mirage'];
      const roles = ['frontliner', 'healer', 'caster', 'skirmisher'];
      return Array.from({ length: Math.max(1, Number(size) || 4) }, (_, index) => ({
        id: `pc-${index + 1}`,
        name: `Adventurer ${index + 1}`,
        level: safeLevel,
        totalLevel: safeLevel,
        classes: [{ name: classNames[index % classNames.length], level: safeLevel }],
        ac: 13 + Math.floor(safeLevel / 4),
        maxHp: 12 + safeLevel * 6,
        currentHp: 12 + safeLevel * 6,
        initiativeBonus: 2,
        roles: [roles[index % roles.length]],
        distanceFt: 30
      }));
    }

    readOptions() {
      const query = (selector) => this.root.querySelector(selector);
      if (this.partySource === 'activeworkspace') {
        const connected = this.api.adapter.getParty();
        if (connected.length) this.party = connected;
      } else {
        const size = Math.max(1, Math.min(12, Number(query('[name=partySize]')?.value || 4)));
        const level = Math.max(8, Math.min(30, Number(query('[name=averageLevel]')?.value || 8)));
        if (this.party.length !== size || this.party.some((member) => member.totalLevel !== level)) {
          this.party = this.defaultParty(size, level);
          this.api.adapter.setFallbackParty(this.party);
        }
      }

      const location = {
        semanticId: query('[name=semanticId]')?.value.trim() || '',
        provinceId: query('[name=provinceId]')?.value.trim() || '',
        provinceName: query('[name=provinceName]')?.value.trim() || '',
        settlementId: query('[name=settlementId]')?.value.trim() || '',
        settlementName: query('[name=settlementName]')?.value.trim() || '',
        longitude: query('[name=longitude]')?.value === '' ? null : Number(query('[name=longitude]')?.value),
        latitude: query('[name=latitude]')?.value === '' ? null : Number(query('[name=latitude]')?.value),
        provinceUtcOffsetHours: query('[name=provinceUtcOffsetHours]')?.value === '' ? null : Number(query('[name=provinceUtcOffsetHours]')?.value),
        settlementUtcOffsetHours: query('[name=settlementUtcOffsetHours]')?.value === '' ? null : Number(query('[name=settlementUtcOffsetHours]')?.value),
        timezoneId: query('[name=timezoneId]')?.value.trim() || ''
      };
      const worldTime = {
        year: Math.max(1, Number(query('[name=worldYear]')?.value || 1)),
        month: Math.max(1, Math.min(11, Number(query('[name=worldMonth]')?.value || 1))),
        day: Math.max(1, Math.min(30, Number(query('[name=worldDay]')?.value || 1))),
        hour: Math.max(0, Math.min(23, Number(query('[name=worldHour]')?.value || 0))),
        minute: Math.max(0, Math.min(59, Number(query('[name=worldMinute]')?.value || 0))),
        leapDay: Boolean(query('[name=leapDay]')?.checked)
      };
      this.location = location;
      this.worldTime = worldTime;
      this.api.adapter.setFallbackLocation(location);
      this.api.adapter.setFallbackWorldTime(worldTime);

      return {
        party: this.party,
        difficulty: query('[name=difficulty]')?.value || 'standard',
        environment: query('[name=environment]')?.value || 'any',
        objective: query('[name=objective]')?.value || 'random',
        seed: query('[name=seed]')?.value || '',
        ichorChance: Number(query('[name=ichorChance]')?.value || 25) / 100,
        deity: query('[name=deity]')?.value || 'random',
        className: query('[name=className]')?.value || 'random',
        race: query('[name=race]')?.value || 'random',
        startingDistance: Number(query('[name=distance]')?.value || 30),
        terrainThreat: Number(query('[name=terrainThreat]')?.value || 0),
        alliedSupport: Number(query('[name=alliedSupport]')?.value || 0),
        preparedAdvantage: Number(query('[name=preparedAdvantage]')?.value || 0),
        destinationUtcOffsetHours: query('[name=destinationUtcOffsetHours]')?.value === '' ? null : Number(query('[name=destinationUtcOffsetHours]')?.value),
        location,
        worldTime,
        randomizeHp: true
      };
    }

    generate() {
      try {
        const options = this.readOptions();
        this.formState = options;
        this.encounter = this.api.generator.generate(options);
        this.dialogueHostileId = this.encounter.hostiles[0]?.instanceId || null;
        this.api.adapter.emit('encounter-generated', this.encounter);
        if (this.encounter.grid) this.api.adapter.emit('grid-selected', this.encounter.grid);
        this.render();
      } catch (error) {
        this.root.querySelector('.re-shell')?.insertAdjacentHTML('afterbegin', `<div class="re-error"><b>Encounter generation failed:</b> ${esc(error.message)}</div>`);
        console.error(error);
      }
    }

    startCombat() {
      if (!this.encounter) this.generate();
      if (this.encounter) this.api.combat.start(this.encounter, this.party);
    }

    download(object, name) {
      const blob = new Blob([JSON.stringify(object, null, 2)], { type: 'application/json' });
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(blob);
      anchor.download = name;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
    }

    registerAttack(hostileId) {
      const state = this.api.combat.state;
      if (!state) return;
      const attackerId = this.root.querySelector('[name=attacker]')?.value;
      const attacker = state.party.find((member) => member.id === attackerId) || state.party[0];
      const attackRoll = Number(global.prompt('Attack roll total against this hostile:', '15') || 0);
      const damage = Number(global.prompt('Damage dealt if the attack hits:', '5') || 0);
      const melee = global.confirm('Was this a melee attack?');
      const metalWeapon = melee ? global.confirm('Was it made with a metal weapon?') : false;
      this.api.combat.playerAttack({ hostileId, attackerId: attacker.id, attackerName: attacker.name, attackRoll, damage, melee, metalWeapon });
    }

    hostileCard(hostile, inCombat) {
      const deity = hostile.deity ? `<div class="re-meta"><b>Deity:</b> ${esc(hostile.deity.name)} — ${esc(hostile.deity.domainsText)}</div>` : '';
      const race = hostile.race ? `<div class="re-meta"><b>Race:</b> ${esc(hostile.race.name)} <small>${esc(hostile.race.entryType)} · created by ${esc(hostile.race.creatorDeity)}</small></div>` : '';
      const classInfo = hostile.canonicalClass ? `<div class="re-class"><b>${esc(hostile.canonicalClass.name)}</b><span>${esc(hostile.canonicalClass.subclass?.name || 'No subclass assigned')} · ${esc(hostile.canonicalClass.deityName)}</span></div>` : '';
      const ichor = hostile.ichorWeapon ? `<div class="re-ichor"><b>${esc(hostile.ichorWeapon.name)}</b><span>${hostile.ichorWeapon.currentCharges}/${hostile.ichorWeapon.charges} charges</span></div>` : '';
      const alignment = hostile.homebrewAlignment ? `<div class="re-alignment"><b>${esc(hostile.homebrewAlignment.name)}</b><span>${esc(hostile.homebrewAlignment.profileLine || hostile.homebrewAlignment.profile || '')}</span><small>${esc(hostile.homebrewAlignment.expressionLine || '')}</small></div>` : '';
      const covenant = hostile.covenant ? `<div class="re-covenant"><b>Covenant: ${esc(hostile.covenant.resonanceState)}</b><span>Resonance ${esc(hostile.covenant.resonance)}/6 · ${esc(hostile.covenant.virtue || '')}</span></div>` : '';
      const influence = arr(hostile.homebrewAlignment?.influences).map((entry) => `${entry.source}: ${entry.axis} ${entry.amount > 0 ? '+' : ''}${entry.amount}`).join('; ');
      const threat = hostile.threatRating ? `<div class="re-meta"><b>Threat:</b> ${esc(hostile.threatRating.points)} TP · ${esc(hostile.threatRating.tier)}${hostile.initiativeSlots > 1 ? ` · ${esc(hostile.initiativeSlots)} initiative slots` : ''}</div>` : '';
      const schedule = hostile.scheduleContext ? `<div class="re-meta"><b>Local schedule:</b> ${esc(hostile.scheduleContext.daypart?.name)} — ${esc(hostile.scheduleContext.activity)}</div>` : '';
      return `<article class="re-hostile ${hostile.defeated ? 'is-defeated' : ''}" data-hostile="${esc(hostile.instanceId)}">
        <img class="re-token" data-token-id="${esc(hostile.instanceId)}" src="${esc(hostile.token || '')}" alt="${esc(hostile.displayName)} token">
        <div class="re-hostile-body">
          <div class="re-hostile-title"><h4>${esc(hostile.displayName)}</h4><span>CR ${esc(hostile.crLabel)}</span></div>
          <div class="re-statline"><span>AC ${hostile.ac}</span><span>HP ${hostile.currentHp ?? hostile.hp}/${hostile.maxHp ?? hostile.hp}</span><span>Init ${hostile.initiativeBonus >= 0 ? '+' : ''}${hostile.initiativeBonus}</span></div>
          <div class="re-tags">${(hostile.roles || []).map((role) => `<span>${esc(role)}</span>`).join('')}</div>
          ${threat}${schedule}${race}${classInfo}${alignment}${deity}${covenant}${ichor}
          <details><summary>Actions, covenant & behavior</summary>
            <p>${esc((hostile.actions || []).filter((action) => action.averageDamage > 0).slice(0, 4).map((action) => action.name).join(', ') || 'Improvised attack')}</p>
            <p><b>AI:</b> ${esc((hostile.behaviorTags || []).join(', '))}</p>
            ${hostile.canonicalClass?.bountyTrigger ? `<p><b>Bounty trigger:</b> ${esc(hostile.canonicalClass.bountyTrigger)}</p><p><b>Deity boon:</b> ${esc(hostile.canonicalClass.deityBoon)}</p>` : ''}
            ${hostile.covenant ? `<p><b>Edicts:</b> ${esc(arr(hostile.covenant.edicts).join(' • '))}</p><p><b>Anathemas:</b> ${esc(arr(hostile.covenant.anathemas).join(' • '))}</p>` : ''}
            ${influence ? `<p><b>Generated alignment influences:</b> ${esc(influence)}</p>` : ''}
          </details>
          <button data-talk="${esc(hostile.instanceId)}">Talk</button>
          ${inCombat && !hostile.defeated ? `<button data-attack="${esc(hostile.instanceId)}">Record player attack</button>` : ''}
        </div>
      </article>`;
    }

    renderEncounter() {
      if (!this.encounter) return '<div class="re-empty">Generate an encounter to populate this area.</div>';
      const encounter = this.encounter;
      const grid = encounter.grid ? `<div class="re-grid-card" style="--re-grid:url('${esc(encounter.grid.path)}')"><b>Encounter grid:</b> ${esc(encounter.grid.name)}</div>` : '';
      const warnings = (encounter.partyWarnings || []).length ? `<div class="re-warning">${encounter.partyWarnings.map(esc).join('<br>')}</div>` : '';
      const canon = [
        encounter.canonicalRace ? `Race: ${encounter.canonicalRace.name}` : '',
        encounter.canonicalClass ? `Class: ${encounter.canonicalClass.name}` : '',
        encounter.patron ? `Deity: ${encounter.patron.name}` : ''
      ].filter(Boolean).join(' · ');
      const time = encounter.time;
      const meridian = time?.zone?.nearestMeridian?.name || 'No longitude supplied';
      const parallel = time?.zone?.nearestParallel?.name || 'No latitude supplied';
      const destination = time?.destination ? `<p><b>Nearby timezone crossing:</b> ${esc(time.destination.label)} (${time.destination.shiftHours >= 0 ? '+' : ''}${esc(time.destination.shiftHours)} local hours)</p>` : '';
      const timeCard = time ? `<section class="re-scene-card"><h4>World time & local schedule</h4><p><b>World UTC:</b> ${esc(time.utcLabel)}</p><p><b>Encounter local time:</b> ${esc(time.localLabel)} · ${esc(time.daypart.name)}</p><p><b>Timezone source:</b> ${esc(time.zone.source)} · fixed ${esc(time.zone.label)} · no DST</p><p><b>Coordinate lines:</b> ${esc(meridian)} · ${esc(parallel)}</p><p><b>Activity:</b> ${esc(time.daypart.scheduleState)}</p>${destination}</section>` : '';
      const scene = encounter.scene;
      const objective = encounter.objective ? `<section class="re-scene-card"><h4>Objective: ${esc(encounter.objective.label)}</h4><p>${esc(encounter.objective.progress)}</p><p><b>Danger:</b> ${esc(encounter.objective.danger)}</p><p><b>Progress clock:</b> ${esc(scene?.progressClocks?.[0]?.segments || 0)} segments · <b>Danger clock:</b> ${esc(scene?.dangerClocks?.[0]?.segments || 0)} segments</p><details><summary>Valid approaches & autonomy</summary><p>${arr(scene?.approaches).map(esc).join('<br>')}</p><p><b>Rule:</b> ${esc(scene?.autonomyRule)}</p></details></section>` : '';
      const budget = encounter.threatBudget || {};
      return `<article class="re-encounter"><header><div><p class="re-kicker">${esc(encounter.template.title)}</p><h3>${esc(encounter.title)}</h3><p>${esc(encounter.opening)}</p>${canon ? `<p class="re-canon-line">${esc(canon)}</p>` : ''}</div><div class="re-xp"><strong>${esc(encounter.threat?.total ?? encounter.budget)}</strong><span>Threat Points</span><small>${esc(encounter.difficulty)} · budget ${esc(encounter.budget)}</small><small>${esc(encounter.xp.adjusted)} adjusted XP (legacy display only)</small></div></header>${warnings}${timeCard}${objective}<section class="re-scene-card"><h4>Threat budget</h4><p>Base ${esc(budget.base)} + objective ${esc(budget.objective)} + terrain ${esc(budget.terrain)} − support ${esc(budget.alliedSupport)} − preparation ${esc(budget.preparedAdvantage)} = <b>${esc(budget.total)}</b> TP</p><p>Conflict uses alternating-side initiative, 3 Beats per turn, and 1 Reaction.</p></section>${grid}<div class="re-hostile-grid">${encounter.hostiles.map((hostile) => this.hostileCard(hostile, false)).join('')}</div><footer><button data-action="start" class="re-primary">Start 3-Beat conflict</button><button data-action="export-encounter">Export encounter JSON</button></footer></article>`;
    }

    renderCombat() {
      const state = this.api.combat.state;
      if (!state) return '<div class="re-empty">Conflict has not started.</div>';
      const current = this.api.combat.current();
      const progress = arr(state.progressClocks).map((clock) => `${clock.name}: ${clock.filled}/${clock.segments}`).join(' · ');
      const danger = arr(state.dangerClocks).map((clock) => `${clock.name}: ${clock.filled}/${clock.segments}`).join(' · ');
      return `<section class="re-combat"><header><div><p class="re-kicker">Round ${state.round} · alternating sides</p><h3>${state.ended ? `Conflict ended: ${esc(state.result)}` : `Current turn: ${esc(current?.displayName || current?.name || '—')}`}</h3><p>${state.ended ? '' : `${esc(current?.beatsRemaining ?? 0)} of 3 Beats remain · Reaction ${current?.reactionAvailable ? 'available' : 'unavailable until turn ends'}`}</p><p><b>Objective:</b> ${esc(state.objective?.label || 'Open resolution')} · ${esc(progress)} · ${esc(danger)}</p></div><label class="re-toggle"><input type="checkbox" name="autoHostiles" ${this.api.combat.autoHostiles ? 'checked' : ''}> Auto-run hostile turns</label></header><div class="re-combat-layout"><div><h4>Alternating initiative slots</h4><ol class="re-initiative">${state.participants.map((participant, index) => `<li class="${index === state.turnIndex ? 'is-current' : ''} ${participant.defeated ? 'is-defeated' : ''}"><b>${participant.initiative}</b><span>${esc(participant.displayName || participant.name)}</span><small>${participant.type}${participant.initiativeSlots > 1 ? ' · boss slot' : ''}</small></li>`).join('')}</ol>${!state.ended && current?.type === 'player' ? '<button class="re-primary" data-action="next">Complete player turn</button>' : ''}<button data-action="export-combat">Export conflict state</button></div><div><div class="re-combat-toolbar"><label>Attacker<select name="attacker">${state.party.map((member) => `<option value="${esc(member.id)}">${esc(member.name)} (level ${member.totalLevel}${member.multiclassed ? ', multiclass' : ''})</option>`).join('')}</select></label><small>A recorded Strike costs 2 Beats when that character owns the current slot.</small></div><div class="re-hostile-grid">${state.hostiles.map((hostile) => this.hostileCard(hostile, true)).join('')}</div></div></div><div class="re-log"><h4>Conflict log</h4>${state.log.slice().reverse().map((entry) => `<p class="re-log-${esc(entry.type)}"><time>R${entry.round}</time>${esc(entry.message)}</p>`).join('')}</div></section>`;
    }

    renderDialogue() {
      const hostiles = this.api.combat.state?.hostiles || this.encounter?.hostiles || [];
      const selected = hostiles.find((hostile) => hostile.instanceId === this.dialogueHostileId) || hostiles[0];
      if (!selected) return '<div class="re-empty">Generate an encounter before opening dialogue.</div>';
      const maximum = Number(this.api.data?.dialogueConfig?.maxMessageChars || 8000);
      return `<section class="re-dialogue"><header><div><p class="re-kicker">NPC dialogue</p><h3>Speak with ${esc(selected.displayName)}</h3><p>The Dialogue Studio receives the NPC’s race, deity-bound class, covenant, eight-axis profile, injuries, and attack memory.</p></div><select name="dialogueHostile">${hostiles.map((hostile) => `<option value="${esc(hostile.instanceId)}" ${hostile.instanceId === selected.instanceId ? 'selected' : ''}>${esc(hostile.displayName)}</option>`).join('')}</select></header><div class="re-dialogue-log">${this.dialogueLog.length ? this.dialogueLog.slice(-30).map((entry) => `<p><b>${esc(entry.speaker)}:</b> ${esc(entry.text)} <small>${esc(entry.emotion || '')}</small></p>`).join('') : '<p class="re-muted">No dialogue yet.</p>'}</div><form data-dialogue-form><label>Player message<textarea name="dialogueMessage" maxlength="${maximum}" required placeholder="Speak to the selected NPC..."></textarea></label><button class="re-primary" type="submit">Send</button></form></section>`;
    }

    renderPantheon() {
      const deities = this.api.data?.pantheon?.deities || [];
      return `<div class="re-pantheon-grid">${deities.map((deity) => `<article><img src="${esc(deity.token)}" alt="${esc(deity.name)} token"><h4>${deity.officialOrder}. ${esc(deity.name)}</h4><p>${esc(deity.domainsText)}</p><p><b>Class:</b> ${esc(deity.canonicalClass)}</p><p><b>Covenant virtue:</b> ${esc(deity.virtue)}</p><small>${esc(deity.creatorCategory)}</small><details><summary>Edicts, anathemas & shadow</summary><p><b>Edicts:</b> ${esc(arr(deity.covenant?.edicts).join(' • '))}</p><p><b>Anathemas:</b> ${esc(arr(deity.covenant?.anathemas).join(' • '))}</p><p><b>Shadow:</b> ${esc(deity.covenant?.shadow || '')}</p></details></article>`).join('')}</div>`;
    }

    renderClasses() {
      const classes = this.api.data?.classRegistry || [];
      return `<div class="re-canon-grid">${classes.map((entry) => `<article><p class="re-kicker">${esc(entry.deityName)}</p><h4>${esc(entry.name)}</h4><p>${esc(entry.description)}</p><p><b>Axis focus:</b> ${esc(entry.axisFocus.join(', '))}</p><p><b>Bounty:</b> ${esc(entry.bountyTrigger)}</p><details><summary>Subclasses & covenant practice</summary><p>${entry.subclasses.map((subclass) => `<b>${esc(subclass.name)}</b> — ${esc(subclass.castingType || '')}: ${esc(subclass.description || '')}`).join('<br><br>')}</p><p><b>Practices:</b> ${esc(entry.practices.join(' • '))}</p><p><b>Hazards:</b> ${esc(entry.hazards.join(' • '))}</p><p><b>Deity boon:</b> ${esc(entry.deityBoon)}</p></details></article>`).join('')}</div>`;
    }

    raceGroups() {
      const groups = new Map();
      for (const race of this.api.data?.raceRegistry || []) {
        const key = `${race.pantheonOrder || 99}|${race.creatorDeity}|${race.creatorCategory}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(race);
      }
      return [...groups.entries()].sort((a, b) => Number(a[0].split('|')[0]) - Number(b[0].split('|')[0]));
    }

    raceOptions() {
      return this.raceGroups().map(([key, races]) => {
        const [, deity, category] = key.split('|');
        return `<optgroup label="${esc(`${deity} — ${category}`)}">${races.map((race) => `<option value="${esc(race.id)}">${esc(race.name)} (${esc(race.entryType)})</option>`).join('')}</optgroup>`;
      }).join('');
    }

    renderRaces() {
      return `<div class="re-race-groups">${this.raceGroups().map(([key, races]) => {
        const [order, deity, category] = key.split('|');
        return `<details><summary><b>${esc(order)}. ${esc(deity)}</b> — ${esc(category)} <span>${races.length} entries</span></summary><div class="re-race-list">${races.map((race) => `<article><h5>${esc(race.name)}</h5><small>${esc(race.entryType)}${race.parent_race ? ` · ${esc(race.parent_race)}` : ''}</small><p>${esc(race.description)}</p></article>`).join('')}</div></details>`;
      }).join('')}</div>`;
    }

    render() {
      const data = this.api.data;
      const deities = data?.pantheon?.deities || [];
      const classes = data?.classRegistry || [];
      const races = data?.raceRegistry || [];
      const connected = this.partySource === 'activeworkspace';
      const average = this.party.length ? Math.round(this.party.reduce((sum, member) => sum + member.totalLevel, 0) / this.party.length) : 8;
      const form = this.formState || {};
      const location = { ...this.location, ...(form.location || {}) };
      const worldTime = { ...this.worldTime, ...(form.worldTime || {}) };
      const difficulty = form.difficulty || 'standard';
      const objective = form.objective || 'random';
      const objectives = data?.tables?.objectives || [
        { id: 'rescue', label: 'Rescue' }, { id: 'escape', label: 'Escape' }, { id: 'hold', label: 'Hold' },
        { id: 'disable', label: 'Disable' }, { id: 'expose', label: 'Expose' }, { id: 'steal', label: 'Steal' },
        { id: 'seal', label: 'Seal' }, { id: 'negotiate', label: 'Negotiate' }, { id: 'survive', label: 'Survive' },
        { id: 'choose-cost', label: 'Choose Between Costs' }
      ];
      const selected = (value, expected) => String(value) === String(expected) ? 'selected' : '';
      const checked = (value) => value ? 'checked' : '';
      const numValue = (value) => value == null ? '' : esc(value);
      this.root.innerHTML = `<div class="re-shell"><header class="re-module-head"><div><p class="re-kicker">ActiveWorkspace Covenant Engine module</p><h2>Random Encounter Director</h2><p>Creates level-8+ encounters using Threat Points, non-HP objectives, alternating-side initiative, three-Beat turns, eight-axis alignment, covenant-bound classes, and fixed UTC local schedules for every province and settlement.</p></div><div class="re-status"><span>${data?.monsters?.length || 0} hostiles</span><span>${deities.length} deities</span><span>${classes.length} classes</span><span>${races.length} race entries</span><span>11 × 30-day calendar</span><span>no DST</span></div></header>
      <section class="re-controls">
        <label>Party size<input name="partySize" type="number" min="1" max="12" value="${this.party.length || 4}" ${connected ? 'disabled' : ''}><small>${connected ? 'Read from ActiveWorkspace; never overwritten.' : 'Fallback party only.'}</small></label>
        <label>Total level per character<input name="averageLevel" type="number" min="8" max="30" value="${average}" ${connected ? 'disabled' : ''}><small>${connected ? 'Each ActiveWorkspace character keeps their own classes and levels.' : 'Minimum 8; multiclass levels are summed.'}</small></label>
        <label>Conflict difficulty<select name="difficulty"><option value="light" ${selected(difficulty, 'light')}>Light · 3 TP/character</option><option value="standard" ${selected(difficulty, 'standard')}>Standard · 4 TP/character</option><option value="hard" ${selected(difficulty, 'hard')}>Hard · 5 TP/character</option><option value="extreme" ${selected(difficulty, 'extreme')}>Extreme · 6 TP/character</option></select></label>
        <label>Non-HP objective<select name="objective"><option value="random" ${selected(objective, 'random')}>Random objective</option>${objectives.map((entry) => `<option value="${esc(entry.id)}" ${selected(objective, entry.id)}>${esc(entry.label)}</option>`).join('')}</select><small>Objectives consume actions and affect the TP budget.</small></label>
        <label>Environment<select name="environment">${(data?.tables?.environments || ['any', 'wilds', 'urban', 'forest', 'aquatic', 'underground', 'sky']).map((environment) => `<option value="${esc(environment)}" ${selected(form.environment || 'any', environment)}>${esc(environment)}</option>`).join('')}</select></label>
        <label>Severe terrain TP<input name="terrainThreat" type="number" min="0" max="4" value="${esc(form.terrainThreat ?? 0)}"><small>Add 0–4.</small></label>
        <label>Allied support TP<input name="alliedSupport" type="number" min="0" max="4" value="${esc(form.alliedSupport ?? 0)}"><small>Subtract 0–4.</small></label>
        <label>Prepared advantage TP<input name="preparedAdvantage" type="number" min="0" max="4" value="${esc(form.preparedAdvantage ?? 0)}"><small>Subtract 0–4.</small></label>
        <label>Canonical class<select name="className"><option value="random" ${selected(form.className || 'random', 'random')}>Random deity-bound class</option><option value="none" ${selected(form.className, 'none')}>No class overlay</option>${classes.map((entry) => `<option value="${esc(entry.id)}" ${selected(form.className, entry.id)}>${esc(entry.name)} — ${esc(entry.deityName)}</option>`).join('')}</select><small>A selected class forces its one canonical deity.</small></label>
        <label>Canonical race<select name="race"><option value="random" ${selected(form.race || 'random', 'random')}>Random canonical race</option><option value="none" ${selected(form.race, 'none')}>No assigned race</option>${this.raceOptions()}</select><small>Race never sets morality or personality.</small></label>
        <label>Recognized deity<select name="deity"><option value="random" ${selected(form.deity || 'random', 'random')}>Random canonical deity</option><option value="none" ${selected(form.deity, 'none')}>No assigned deity</option>${deities.map((deity) => `<option value="${esc(deity.id)}" ${selected(form.deity, deity.id)}>${esc(deity.officialOrder)}. ${esc(deity.name)} — ${esc(deity.canonicalClass)}</option>`).join('')}</select></label>
        <label>Starting distance<input name="distance" type="number" min="5" max="300" step="5" value="${esc(form.startingDistance ?? 30)}"></label>
        <label>Ichor-equipped humanoids<input name="ichorChance" type="range" min="0" max="100" value="${esc(Math.round((form.ichorChance ?? 0.25) * 100))}"><output>${esc(Math.round((form.ichorChance ?? 0.25) * 100))}%</output></label>
        <label>Seed<input name="seed" value="${esc(form.seed || '')}" placeholder="blank = cryptographic random"></label>

        <details class="re-control-group" open>
          <summary>Province, settlement & fixed timezone</summary>
          <div class="re-control-grid">
            <label>Province name<input name="provinceName" value="${esc(location.provinceName || '')}" placeholder="Province"></label>
            <label>Province ID<input name="provinceId" value="${esc(location.provinceId || '')}" placeholder="optional semantic ID"></label>
            <label>Province UTC offset (hours)<input name="provinceUtcOffsetHours" type="number" min="-12" max="12" step="0.25" value="${numValue(location.provinceUtcOffsetHours ?? (location.provinceUtcOffsetMinutes != null ? Number(location.provinceUtcOffsetMinutes) / 60 : null))}" placeholder="blank = derive from longitude"></label>
            <label>Settlement name<input name="settlementName" value="${esc(location.settlementName || '')}" placeholder="Settlement"></label>
            <label>Settlement ID<input name="settlementId" value="${esc(location.settlementId || '')}" placeholder="optional semantic ID"></label>
            <label>Settlement UTC offset (hours)<input name="settlementUtcOffsetHours" type="number" min="-12" max="12" step="0.25" value="${numValue(location.settlementUtcOffsetHours ?? (location.settlementUtcOffsetMinutes != null ? Number(location.settlementUtcOffsetMinutes) / 60 : null))}" placeholder="blank = inherit province"></label>
            <label>Longitude<input name="longitude" type="number" min="-180" max="180" step="0.0001" value="${numValue(location.longitude)}" placeholder="-180 to 180"></label>
            <label>Latitude<input name="latitude" type="number" min="-90" max="90" step="0.0001" value="${numValue(location.latitude)}" placeholder="-90 to 90"></label>
            <label>Timezone ID<input name="timezoneId" value="${esc(location.timezoneId || '')}" placeholder="optional world identifier"></label>
            <label>Semantic location ID<input name="semanticId" value="${esc(location.semanticId || '')}" placeholder="WorldBuilder/LifeSimulation ID"></label>
            <label>Nearby destination UTC offset (hours)<input name="destinationUtcOffsetHours" type="number" min="-12" max="12" step="0.25" value="${numValue(form.destinationUtcOffsetHours)}" placeholder="optional crossing"></label>
          </div>
          <p class="re-muted">Priority: settlement offset → province offset → explicit longitude-derived offset → UTC. No location uses daylight saving time.</p>
        </details>

        <details class="re-control-group" open>
          <summary>Universal world UTC date</summary>
          <div class="re-control-grid">
            <label>Year<input name="worldYear" type="number" min="1" value="${esc(worldTime.year || 1)}"></label>
            <label>Month<input name="worldMonth" type="number" min="1" max="11" value="${esc(worldTime.month || 1)}"></label>
            <label>Day<input name="worldDay" type="number" min="1" max="30" value="${esc(worldTime.day || 1)}"></label>
            <label>UTC hour<input name="worldHour" type="number" min="0" max="23" value="${esc(worldTime.hour ?? 12)}"></label>
            <label>UTC minute<input name="worldMinute" type="number" min="0" max="59" value="${esc(worldTime.minute ?? 0)}"></label>
            <label class="re-toggle"><input name="leapDay" type="checkbox" ${checked(worldTime.leapDay)}> Intercalary leap day</label>
          </div>
          <p class="re-muted">11 months × 30 days. Year 7 and every seventh year has one intercalary leap day. A 330.15-day Universal year equals 365.2422 Earth days.</p>
        </details>

        <button class="re-primary" data-action="generate">Generate Covenant Engine encounter</button>
      </section>
      <nav class="re-tabs"><button data-tab="encounter" class="${this.activeTab === 'encounter' ? 'is-active' : ''}">Encounter</button><button data-tab="combat" class="${this.activeTab === 'combat' ? 'is-active' : ''}">Conflict</button><button data-tab="dialogue" class="${this.activeTab === 'dialogue' ? 'is-active' : ''}">Dialogue</button><button data-tab="pantheon" class="${this.activeTab === 'pantheon' ? 'is-active' : ''}">Pantheon</button><button data-tab="classes" class="${this.activeTab === 'classes' ? 'is-active' : ''}">Classes</button><button data-tab="races" class="${this.activeTab === 'races' ? 'is-active' : ''}">Races</button></nav>
      <div class="re-panel" data-panel="encounter" ${this.activeTab === 'encounter' ? '' : 'hidden'}>${this.renderEncounter()}</div>
      <div class="re-panel" data-panel="combat" ${this.activeTab === 'combat' ? '' : 'hidden'}>${this.renderCombat()}</div>
      <div class="re-panel" data-panel="dialogue" ${this.activeTab === 'dialogue' ? '' : 'hidden'}>${this.renderDialogue()}</div>
      <div class="re-panel" data-panel="pantheon" ${this.activeTab === 'pantheon' ? '' : 'hidden'}>${this.renderPantheon()}</div>
      <div class="re-panel" data-panel="classes" ${this.activeTab === 'classes' ? '' : 'hidden'}>${this.renderClasses()}</div>
      <div class="re-panel" data-panel="races" ${this.activeTab === 'races' ? '' : 'hidden'}>${this.renderRaces()}</div></div>`;
      this.bindDom();
      this.bindTokens();
    }

    bindTokens() {
      const all = [...(this.encounter?.hostiles || []), ...(this.api.combat.state?.hostiles || [])];
      this.root.querySelectorAll('img[data-token-id]').forEach((image) => {
        const hostile = all.find((entry) => entry.instanceId === image.dataset.tokenId);
        if (hostile) global.RandomEncounterTokens.bindImage(image, hostile);
      });
    }

    bindDom() {
      this.root.querySelector('[data-action=generate]')?.addEventListener('click', () => this.generate());
      this.root.querySelector('[data-action=start]')?.addEventListener('click', () => { this.startCombat(); this.showTab('combat'); });
      this.root.querySelector('[data-action=next]')?.addEventListener('click', () => this.api.combat.advance());
      this.root.querySelector('[data-action=export-encounter]')?.addEventListener('click', () => this.download(this.encounter, `${this.encounter.id}.json`));
      this.root.querySelector('[data-action=export-combat]')?.addEventListener('click', () => this.download(this.api.combat.exportState(), `${this.api.combat.state.encounter.id}-combat.json`));
      this.root.querySelectorAll('[data-attack]').forEach((button) => button.addEventListener('click', () => this.registerAttack(button.dataset.attack)));
      this.root.querySelectorAll('[data-talk]').forEach((button) => button.addEventListener('click', () => { this.dialogueHostileId = button.dataset.talk; this.activeTab = 'dialogue'; this.render(); }));
      this.root.querySelector('[name=dialogueHostile]')?.addEventListener('change', (event) => { this.dialogueHostileId = event.target.value; });
      this.root.querySelector('[data-dialogue-form]')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const hostile = (this.api.combat.state?.hostiles || this.encounter?.hostiles || []).find((entry) => entry.instanceId === this.dialogueHostileId);
        const input = event.currentTarget.elements.dialogueMessage;
        if (!hostile || !input.value.trim()) return;
        const message = input.value.trim();
        this.dialogueLog.push({ speaker: 'Player', text: message });
        input.value = '';
        this.render();
        try {
          await this.api.talk(hostile, { playerId: 'player', playerName: 'Player', text: message }, {
            combat: this.api.combat.state ? { round: this.api.combat.state.round, hpRatio: hostile.currentHp / Math.max(1, hostile.maxHp), active: !this.api.combat.state.ended } : null,
            time: this.api.combat.state?.encounter?.time || this.encounter?.time || null,
            scene: this.api.combat.state?.encounter?.scene || this.encounter?.scene || null
          });
        } catch (error) {
          this.dialogueLog.push({ speaker: 'System', text: `Dialogue failed: ${error.message}`, emotion: 'error' });
          this.render();
        }
      });
      this.root.querySelector('[name=autoHostiles]')?.addEventListener('change', (event) => {
        this.api.combat.autoHostiles = event.target.checked;
        if (event.target.checked && this.api.combat.current()?.type === 'hostile') this.api.combat.handleCurrent();
      });
      this.root.querySelector('[name=ichorChance]')?.addEventListener('input', (event) => { event.target.nextElementSibling.value = `${event.target.value}%`; });
      this.root.querySelectorAll('[data-tab]').forEach((button) => button.addEventListener('click', () => this.showTab(button.dataset.tab)));
    }

    showTab(name) {
      this.activeTab = name;
      this.root.querySelectorAll('[data-tab]').forEach((button) => button.classList.toggle('is-active', button.dataset.tab === name));
      this.root.querySelectorAll('[data-panel]').forEach((panel) => { panel.hidden = panel.dataset.panel !== name; });
    }
  }

  global.RandomEncountersUI = { RandomEncountersUI };
}(window));
