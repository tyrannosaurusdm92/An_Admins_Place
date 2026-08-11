/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function (global) {
  'use strict';

  const { RNG } = global.RandomEncounterDice;
  const Canon = global.ActiveWorkspaceCanon;
  const MULTIPLIERS = [[1, 1], [2, 1.5], [6, 2], [10, 2.5], [14, 3], [Infinity, 4]];
  const DIFFICULTY_ALIASES = { trivial: 'light', easy: 'light', medium: 'standard', deadly: 'extreme' };
  const THREAT_PER_CHARACTER = { light: 3, standard: 4, hard: 5, extreme: 6 };

  function normalizeDifficulty(value) {
    const key = String(value || 'standard').toLowerCase();
    return DIFFICULTY_ALIASES[key] || (THREAT_PER_CHARACTER[key] ? key : 'standard');
  }

  function multiplier(count, partySize) {
    let index = MULTIPLIERS.findIndex(([maximum]) => count <= maximum);
    if (index < 0) index = MULTIPLIERS.length - 1;
    if (partySize < 3) index = Math.min(MULTIPLIERS.length - 1, index + 1);
    if (partySize >= 6) index = Math.max(0, index - 1);
    return MULTIPLIERS[index][1];
  }

  function adjustedXp(monsters, partySize) {
    const raw = monsters.reduce((sum, monster) => sum + Number(monster.xp || 0), 0);
    const factor = multiplier(monsters.length, partySize);
    return { raw, multiplier: factor, adjusted: Math.round(raw * factor), compatibilityOnly: true };
  }

  function averagePartyLevel(party) {
    if (!party.length) return 8;
    return party.reduce((sum, member) => sum + Number(member.totalLevel || member.level || 8), 0) / party.length;
  }

  function enemyThreatPoints(monster, partyLevel) {
    const effectiveLevel = Number(monster.cr || 0);
    const delta = effectiveLevel - Number(partyLevel || 8);
    const legendary = Array.isArray(monster.legendaryActions) && monster.legendaryActions.length > 0;
    const twoStrongTurns = legendary || Number(monster.multiattackCount || 1) >= 4;
    let points;
    let tier;
    if (delta <= -4) { points = 1; tier = 'minion'; }
    else if (delta <= -2) { points = 2; tier = 'minor'; }
    else if (delta <= 1 && !twoStrongTurns) { points = 4; tier = 'peer'; }
    else if (delta <= 2 && !legendary) { points = 7; tier = 'elite'; }
    else {
      points = Math.max(10, Math.min(16, 10 + Math.max(0, Math.floor(delta - 3)) + (legendary ? 2 : 0)));
      tier = 'boss';
    }
    return { points, tier, effectiveLevel, levelDelta: delta, legendary, twoStrongTurns };
  }

  function threatBudgetForParty(party, difficulty, modifiers = {}) {
    const normalized = normalizeDifficulty(difficulty);
    const base = party.length * THREAT_PER_CHARACTER[normalized];
    const objective = Math.max(0, Math.min(4, Number(modifiers.objectiveThreat || 0)));
    const terrain = Math.max(0, Math.min(4, Number(modifiers.terrainThreat || 0)));
    const alliedSupport = Math.max(0, Math.min(4, Number(modifiers.alliedSupport || 0)));
    const preparedAdvantage = Math.max(0, Math.min(4, Number(modifiers.preparedAdvantage || 0)));
    const total = Math.max(1, base + objective + terrain - alliedSupport - preparedAdvantage);
    return { system: 'Covenant Engine Threat Points', difficulty: normalized, perCharacter: THREAT_PER_CHARACTER[normalized], base, objective, terrain, alliedSupport, preparedAdvantage, total };
  }

  function encounterThreat(monsters, party) {
    const level = averagePartyLevel(party);
    const entries = monsters.map((monster) => ({ monsterId: monster.id, monsterName: monster.name, ...enemyThreatPoints(monster, level) }));
    return { total: entries.reduce((sum, entry) => sum + entry.points, 0), averagePartyLevel: level, entries };
  }

  function budgetForParty(party, difficulty, config, modifiers = {}) {
    return threatBudgetForParty(party, difficulty, modifiers).total;
  }

  function environmentWeight(monster, environment, biome=null) {
    if ((!environment || environment === 'any') && !biome) return 1;
    const environments = (monster.environments || []).map((entry) => String(entry).toLowerCase());
    const tags=[environment,biome?.name,biome?.group,...(biome?.tags||[])].filter(Boolean).map(x=>String(x).toLowerCase());if(environments.some(e=>tags.some(t=>e.includes(t)||t.includes(e)))) return 7;
    if (environment === 'wilds' && environments.some((entry) => ['forest', 'grassland', 'mountain', 'swamp', 'desert', 'arctic', 'wilds'].includes(entry))) return 3;
    return 0.15;
  }

  function subtypeWords(monster) {
    return new Set(String(monster?.subtype || '').toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2));
  }

  function creatureFamily(monster) {
    const type = String(monster?.type || 'unknown').toLowerCase();
    const name = String(monster?.name || '').toLowerCase();
    const subtype = String(monster?.subtype || '').toLowerCase().trim();
    const has = (expression) => expression.test(name);

    if (type === 'humanoid') {
      if (subtype && subtype !== 'any race') return `humanoid:${subtype}`;
      if (has(/cult|fanatic|acolyte|priest/)) return 'humanoid:religious-order';
      if (has(/bandit|berserker|thug|gladiator/)) return 'humanoid:raiders';
      if (has(/guard|knight|veteran|noble/)) return 'humanoid:civic-martial';
      if (has(/mage|archmage/)) return 'humanoid:arcane';
      if (has(/assassin|spy|scout/)) return 'humanoid:covert';
      if (has(/druid|tribal/)) return 'humanoid:wild-clan';
      if (has(/werebear|wereboar|wererat|weretiger|werewolf/)) return 'humanoid:lycanthrope';
      return `humanoid:${slugFamily(name)}`;
    }

    if (type === 'dragon') {
      const color = name.match(/\b(black|blue|brass|bronze|copper|gold|green|red|silver|white)\b/)?.[1];
      if (color) return `dragon:${color}`;
      if (has(/dragon turtle/)) return 'dragon:turtle';
      if (has(/pseudodragon/)) return 'dragon:pseudodragon';
      if (has(/wyvern/)) return 'dragon:wyvern';
      return `dragon:${slugFamily(name)}`;
    }

    if (type === 'undead') {
      if (has(/zombie/)) return 'undead:zombie';
      if (has(/skeleton|flameskull/)) return 'undead:skeletal';
      if (has(/ghost|specter|shadow|wraith|will-o|wight/)) return 'undead:spirit';
      if (has(/vampire/)) return 'undead:vampire';
      if (has(/mummy/)) return 'undead:mummy';
      if (has(/ghast|ghoul/)) return 'undead:ghoul';
      if (has(/lich/)) return 'undead:lich';
      return `undead:${slugFamily(name)}`;
    }

    if (type === 'beast') {
      const families = [
        ['shark', /shark/], ['whale', /whale/], ['octopus', /octopus/], ['crab', /crab/], ['quipper', /quipper/], ['sea-horse', /sea horse/],
        ['wolf', /wolf|worg/], ['bear', /bear/], ['cat', /lion|tiger|panther|cat/], ['snake', /snake/], ['spider', /spider/],
        ['bird', /eagle|hawk|owl|raven|vulture|blood hawk/], ['horse', /horse|pony|mule|camel/], ['ape', /ape|baboon/],
        ['boar', /boar/], ['rodent', /rat|weasel|badger/], ['insect', /centipede|beetle|wasp|scorpion|stirge/],
        ['dinosaur', /plesiosaurus|triceratops|tyrannosaurus/], ['crocodile', /crocodile/], ['frog', /frog|toad/],
        ['herd', /deer|elk|goat|rhinoceros|elephant|mammoth/]
      ];
      const family = families.find(([, expression]) => expression.test(name))?.[0];
      return `beast:${family || slugFamily(name)}`;
    }

    if (type.includes('swarm')) {
      if (has(/rat/)) return 'swarm:rat';
      if (has(/quipper/)) return 'swarm:quipper';
      if (has(/spider/)) return 'swarm:spider';
      if (has(/wasp|insect|bat|raven/)) return 'swarm:flying';
      return `swarm:${slugFamily(name)}`;
    }

    if (type === 'monstrosity') {
      if (has(/griffon|hippogriff|harpy|roc/)) return 'monstrosity:avian';
      if (has(/spider|ettercap/)) return 'monstrosity:arachnid';
      if (has(/naga/)) return 'monstrosity:naga';
      if (has(/sphinx/)) return 'monstrosity:sphinx';
      if (has(/winter wolf|worg|death dog/)) return 'monstrosity:predatory-canine';
      return `monstrosity:${slugFamily(name)}`;
    }

    return `${type}:${subtype || type}`;
  }

  function slugFamily(value) {
    return String(value || 'unknown').toLowerCase().replace(/\b(adult|ancient|young|giant|swarm of|diseased)\b/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown';
  }

  function sharedEnvironment(a, b) {
    const first = new Set((a.environments || []).map((value) => String(value).toLowerCase()));
    return (b.environments || []).some((value) => first.has(String(value).toLowerCase()));
  }

  function compatibilityWeight(anchor, candidate, selected, environment) {
    let weight = environmentWeight(candidate, environment);
    if (candidate.id === anchor.id) weight *= 8;
    else if (String(candidate.type).toLowerCase() === String(anchor.type).toLowerCase()) weight *= 4;
    if (sharedEnvironment(anchor, candidate)) weight *= 2;

    const anchorSubtype = subtypeWords(anchor);
    const candidateSubtype = subtypeWords(candidate);
    if ([...anchorSubtype].some((word) => candidateSubtype.has(word))) weight *= 2;

    const uniqueIds = new Set(selected.map((monster) => monster.id));
    if (uniqueIds.has(candidate.id)) weight *= 2.5;
    else if (uniqueIds.size >= 3) weight *= 0.03;

    const roles = new Set(selected.flatMap((monster) => monster.roles || []));
    if ((candidate.roles || []).some((role) => !roles.has(role))) weight *= 1.35;
    if (candidate.divineCandidate === anchor.divineCandidate) weight *= 1.15;
    return Math.max(0.001, weight);
  }

  function encounterEligible(monster, config, options) {
    if (!monster || Number(monster.xp) < 0) return false;
    if (options.allowPassiveCreatures) return true;
    const passive = new Set(config.passiveCreatureIds || []);
    if (passive.has(monster.id)) return false;
    if (Number(monster.cr) === 0 && !['undead', 'construct', 'ooze', 'fiend'].includes(String(monster.type).toLowerCase())) return false;
    return true;
  }

  function chooseIchor(monster, data, rng, chance) {
    if (!monster.hasHands || String(monster.type).toLowerCase() !== 'humanoid') return null;
    if (rng.random() >= chance) return null;
    const weapons = (data.ichorWeapons.weapons || []).filter((weapon) =>
      weapon.requiresHands !== false && (weapon.id !== 'coil-array' || Number(monster.cr || 0) >= 5)
    );
    if (!weapons.length) return null;

    const dexterity = Number(monster.abilities?.DEX || 10);
    const strength = Number(monster.abilities?.STR || 10);
    const chosen = rng.weighted(weapons, (weapon) => {
      const ranged = weapon.rangeType === 'ranged' || weapon.rangeType === 'area';
      let weight = ranged ? Math.max(1, dexterity - 7) : Math.max(1, strength - 7);
      if (weapon.hands === 2 && monster.size === 'Small') weight *= 0.6;
      if ((monster.roles || []).includes('artillery') && ranged) weight *= 2;
      if ((monster.roles || []).includes('brute') && !ranged) weight *= 2;
      return weight;
    });

    return chosen ? {
      ...chosen,
      currentCharges: Number(chosen.charges || 0),
      overloadsRemaining: chosen.overload ? Number(chosen.overload.usesPerEncounter || 0) : 0
    } : null;
  }

  function behaviorFor(monster, deity, classProfile, covenant) {
    const tags = new Set();
    if ((monster.roles || []).includes('brute')) tags.add('aggressive');
    if ((monster.roles || []).includes('controller')) tags.add('cunning');
    if ((monster.roles || []).includes('leader')) tags.add('protective');
    (deity?.behaviorTags || []).forEach((tag) => tags.add(tag));
    (classProfile?.axisFocus || []).forEach((axis) => tags.add(`class-focus-${axis}`));
    Object.entries(covenant?.pressures || {}).forEach(([axis, direction]) => {
      if (Number(direction) > 0) tags.add(`covenant-high-${axis}`);
      if (Number(direction) < 0) tags.add(`covenant-low-${axis}`);
    });
    if (!tags.size) tags.add('balanced');
    return [...tags];
  }

  function suitableForCanonOverlay(monster) {
    return String(monster?.type || '').toLowerCase() === 'humanoid' || Boolean(monster?.divineCandidate);
  }

  function selectEncounterPatron(data, rng, requested, anchor, requestedClass) {
    if (requestedClass) {
      const classDeity = data.resolveDeity(requestedClass.deityName);
      if (!classDeity) throw new Error(`Class ${requestedClass.name} has no valid canonical deity.`);
      if (requested === 'none') throw new Error(`${requestedClass.name} is deity-bound to ${classDeity.name}; a deity-bound class cannot use “No assigned deity”.`);
      if (requested && requested !== 'random') {
        const explicit = data.resolveDeity(requested);
        if (!explicit) throw new Error(`Unrecognized deity "${requested}". Only the canonical 22-god Universal pantheon is accepted.`);
        if (explicit.id !== classDeity.id) throw new Error(`${requestedClass.name} is canonically bound to ${classDeity.name}, not ${explicit.name}.`);
      }
      return classDeity;
    }
    if (requested && !['random', 'none'].includes(requested)) {
      const deity = data.resolveDeity(requested);
      if (!deity) throw new Error(`Unrecognized deity "${requested}". Only the canonical 22-god Universal pantheon is accepted.`);
      return deity;
    }
    if (requested === 'none') return null;
    const chance = anchor.divineCandidate ? 0.9 : (String(anchor.type).toLowerCase() === 'humanoid' ? 0.3 : 0.04);
    return rng.random() < chance ? rng.pick(data.pantheon.deities) : null;
  }

  function selectEncounterClass(data, rng, requested, patron, anchor, deitySetting) {
    if (requested && !['random', 'none'].includes(requested)) {
      const profile = data.resolveClass(requested);
      if (!profile) throw new Error(`Unrecognized class "${requested}". Only the 22 canonical merged classes are accepted.`);
      return profile;
    }
    if (requested === 'none' || deitySetting === 'none' || !suitableForCanonOverlay(anchor)) return null;
    if (patron) return data.classForDeity(patron);
    return rng.random() < 0.35 ? rng.pick(data.classRegistry) : null;
  }

  function selectEncounterRace(data, rng, requested, anchor) {
    if (requested && !['random', 'none'].includes(requested)) {
      const race = data.resolveRace(requested);
      if (!race) throw new Error(`Unrecognized race "${requested}". Only the canonical Universal race register is accepted.`);
      return race;
    }
    if (requested === 'none' || String(anchor.type).toLowerCase() !== 'humanoid') return null;
    const subtype = String(anchor.subtype || '').toLowerCase();
    const words = subtype.split(/[^a-z0-9]+/).filter((word) => word.length > 2 && !['any', 'race'].includes(word));
    const matching = data.raceRegistry.filter((race) => words.some((word) => String(race.name).toLowerCase().includes(word)));
    const pool = matching.length ? matching : data.raceRegistry;
    return rng.weighted(pool, (race) => race.entryType === 'parent_race' ? 4 : (race.entryType === 'lineage' || race.entryType === 'ancestry' ? 2 : 1));
  }

  function materializeClass(profile, rng) {
    if (!profile) return null;
    const subclass = rng.pick(profile.subclasses || []) || null;
    return {
      id: profile.id,
      name: profile.name,
      deityName: profile.deityName,
      description: profile.description,
      coreIdentity: profile.coreIdentity,
      axisFocus: profile.axisFocus || [],
      practices: profile.practices || [],
      hazards: profile.hazards || [],
      bountyTrigger: profile.bountyTrigger,
      deityBoon: profile.deityBoon,
      subclass
    };
  }

  function materializeRace(race,settings={}) {
    return race ? {
      id: race.id,
      name: race.name,
      entryType: race.entryType,
      description: race.description,
      parentRace: race.parent_race || null,
      subtypeName: race.subtype_name || null,
      creatorCategory: race.creatorCategory,
      creatorDeity: race.creatorDeity,
      pantheonOrder: race.pantheonOrder,subtypeName: settings.raceOption||null,subtypeId: settings.raceOptionId||null,heritage: settings.heritage||null,biomes: settings.biome?[settings.biome]:[]
    } : null;
  }

  function covenantFor(deity) {
    if (!deity?.covenant) return null;
    return {
      ...JSON.parse(JSON.stringify(deity.covenant)),
      resonance: 3,
      resonanceState: 'Attuned',
      rule: 'Resonance begins at 3. Edicts and class bounty triggers may raise it; anathemas or repeated shadow behavior may lower it.'
    };
  }

  function shouldReceivePatron(monster, patron, rng, anchor) {
    if (!patron) return false;
    if (monster.id === anchor.id && suitableForCanonOverlay(monster)) return true;
    if (monster.divineCandidate) return true;
    return String(monster.type).toLowerCase() === 'humanoid' && rng.random() < 0.75;
  }

  function shouldReceiveOverlay(monster, overlay, rng, anchor) {
    if (!overlay || !suitableForCanonOverlay(monster)) return false;
    if (monster.id === anchor.id) return true;
    return rng.random() < 0.82;
  }

  function shouldReceiveRace(monster, race, rng, anchor) {
    if (!race || String(monster.type).toLowerCase() !== 'humanoid') return false;
    if (monster.id === anchor.id) return true;
    return rng.random() < 0.9;
  }

  function chooseTemplate(data, rng, environment, anchor, classProfile, race) {
    let templates = (data.tables.templates || []).filter((template) =>
      !template.environments || template.environments.includes('any') || template.environments.includes(environment)
    );
    if (classProfile?.bountyTrigger) {
      const bounty = templates.filter((template) => template.id === 'bounty-pursuit');
      if (bounty.length && rng.random() < 0.48) return rng.pick(bounty);
    }
    if (anchor.divineCandidate) {
      const rituals = templates.filter((template) => ['ritual', 'covenant-test'].includes(template.id));
      if (rituals.length && rng.random() < 0.62) return rng.pick(rituals);
    }
    if (race) {
      const heritage = templates.filter((template) => template.id === 'heritage-dispute');
      if (heritage.length && rng.random() < 0.22) return rng.pick(heritage);
    }
    if (String(anchor.type).toLowerCase() === 'beast') {
      const hunts = templates.filter((template) => template.id === 'hunt');
      if (hunts.length) return rng.pick(hunts);
    }
    if (String(anchor.type).toLowerCase() === 'humanoid') {
      const organized = templates.filter((template) => ['ambush', 'patrol', 'boarding', 'ruins'].includes(template.id));
      if (organized.length) templates = organized;
    }
    return rng.pick(templates) || { id: 'meeting', title: 'Hostile Meeting', opening: 'Hostiles block the party’s path.' };
  }

  function scheduleWeight(monster, timeContext) {
    const daypart = timeContext?.daypart?.id || 'midday';
    const type = String(monster.type || '').toLowerCase();
    const name = String(monster.name || '').toLowerCase();
    const roles = new Set(monster.roles || []);
    let weight = 1;
    const dark = ['deep-night', 'night'].includes(daypart);
    const publicHours = ['morning', 'midday', 'afternoon'].includes(daypart);
    if (dark && /owl|bat|wolf|vampire|shadow|specter|wraith|night/.test(name)) weight *= 2.2;
    if (dark && ['undead', 'fiend', 'aberration'].includes(type)) weight *= 1.45;
    if (publicHours && type === 'humanoid') weight *= 1.35;
    if (dark && type === 'humanoid' && !roles.has('scout') && !roles.has('skirmisher') && !roles.has('controller')) weight *= 0.78;
    if (['dawn', 'dusk'].includes(daypart) && (roles.has('scout') || roles.has('leader'))) weight *= 1.35;
    return Math.max(0.2, weight);
  }

  function objectivePool(data, environment, template) {
    const defaults = [
      { id: 'rescue', label: 'Rescue', pressure: 2, progress: 'Reach and extract the endangered people', danger: 'Captives are moved, harmed, or separated' },
      { id: 'escape', label: 'Escape', pressure: 1, progress: 'Open and reach a viable escape route', danger: 'Routes close or pursuit gains ground' },
      { id: 'hold', label: 'Hold', pressure: 2, progress: 'Maintain the position until relief or completion', danger: 'The position, civilians, or critical system is overrun' },
      { id: 'disable', label: 'Disable', pressure: 2, progress: 'Disable the device, ritual, vehicle, or weapon', danger: 'The hostile system reaches full effect' },
      { id: 'expose', label: 'Expose', pressure: 1, progress: 'Reveal evidence, identity, or hidden mechanism', danger: 'Evidence is destroyed or witnesses are silenced' },
      { id: 'steal', label: 'Steal', pressure: 1, progress: 'Secure the target and create an exit', danger: 'The target is moved, locked down, or damaged' },
      { id: 'seal', label: 'Seal', pressure: 3, progress: 'Complete the seal before the breach stabilizes', danger: 'The breach expands or changes the scene' },
      { id: 'negotiate', label: 'Negotiate', pressure: 1, progress: 'Establish terms acceptable to the involved parties', danger: 'Trust collapses and violence becomes harder to stop' },
      { id: 'survive', label: 'Survive', pressure: 2, progress: 'Endure until the hazard passes or an opening appears', danger: 'Resources, cover, or safe ground are lost' },
      { id: 'choose-cost', label: 'Choose Between Costs', pressure: 2, progress: 'Create enough leverage to choose rather than merely react', danger: 'The least harmful options disappear' }
    ];
    const supplied = Array.isArray(data.tables.objectives) && data.tables.objectives.length ? data.tables.objectives : defaults;
    return supplied.filter((entry) => !entry.environments || entry.environments.includes('any') || entry.environments.includes(environment) || entry.templates?.includes(template?.id));
  }

  function selectObjective(data, rng, requested, environment, template) {
    const pool = objectivePool(data, environment, template);
    if (requested && requested !== 'random') {
      const selected = pool.find((entry) => entry.id === requested || String(entry.label).toLowerCase() === String(requested).toLowerCase());
      if (!selected) throw new Error(`Unrecognized Covenant Engine encounter objective "${requested}".`);
      return selected;
    }
    const templateBias = {
      ritual: 'disable', boarding: 'hold', hunt: 'survive', ambush: 'escape', patrol: 'negotiate',
      'covenant-test': 'choose-cost', 'bounty-pursuit': 'expose', 'heritage-dispute': 'negotiate', ruins: 'rescue'
    }[template?.id];
    const biased = pool.filter((entry) => entry.id === templateBias);
    return rng.pick(biased.length && rng.random() < 0.62 ? biased : pool);
  }

  function clockSegments(difficulty, objective) {
    const normalized = normalizeDifficulty(difficulty);
    if (objective?.id === 'seal' || normalized === 'extreme') return 8;
    if (normalized === 'light') return 4;
    return 6;
  }

  function buildScene(objective, difficulty, environment, timeContext, settings) {
    const segments = clockSegments(difficulty, objective);
    return {
      mode: 'Conflict',
      roundSeconds: 6,
      beatsPerTurn: 3,
      reactionsPerCreature: 1,
      objective,
      environmentTags: [...new Set([environment, ...(timeContext?.encounterTags || [])].filter(Boolean))],
      era: settings.era ?? null,
      scale: settings.scale || 'personal',
      location: {
        semanticId: timeContext?.location?.semanticId || '',
        provinceId: timeContext?.location?.provinceId || '',
        provinceName: timeContext?.location?.provinceName || '',
        settlementId: timeContext?.location?.settlementId || '',
        settlementName: timeContext?.location?.settlementName || '',
        longitude: timeContext?.location?.longitude ?? null,
        latitude: timeContext?.location?.latitude ?? null,
        timezone: timeContext?.zone || null
      },
      progressClocks: [{ id: 'encounter-progress', name: objective.progress || objective.label, segments, filled: 0 }],
      dangerClocks: [{ id: 'encounter-danger', name: objective.danger || 'The situation worsens', segments, filled: 0 }],
      approaches: [
        'Social: bargain, surrender, mediation, command, or exposing shared interests.',
        'Investigative: identify the true objective, leverage, weak point, or hidden participant.',
        'Covert: bypass, infiltrate, steal, rescue, sabotage, or change positions without open battle.',
        'Ritual or technical: disrupt, seal, repair, counter, redirect, or reconfigure the source of pressure.',
        'Direct: fight, hold, break through, protect, capture, or force retreat.',
        'Player-created: accept any credible sixth approach supported by the fiction.'
      ],
      consequenceLadder: [
        'Reveal trouble or a hard choice.',
        'Spend time, Supply, position, secrecy, or opportunity.',
        'Add Stress, Wear, Instability, or faction Heat.',
        'Advance the Danger clock or separate allies.',
        'Inflict damage, a condition, a Wound, or loss of access.',
        'Change a relationship, institution, region, or divine state.'
      ],
      autonomyRule: 'The objective, clocks, and hooks create pressure, not a required solution. Resolve the outcome from player choices and current conditions.'
    };
  }

  function timeOpening(timeContext) {
    if (!timeContext) return '';
    const meridian = timeContext.zone?.nearestMeridian?.name ? ` near ${timeContext.zone.nearestMeridian.name}` : '';
    const parallel = timeContext.zone?.nearestParallel?.name ? ` and ${timeContext.zone.nearestParallel.name}` : '';
    const crossing = timeContext.destination ? ` A nearby route crosses into ${timeContext.destination.label}, shifting local schedules by ${timeContext.destination.shiftHours >= 0 ? '+' : ''}${timeContext.destination.shiftHours} hours without changing elapsed time.` : '';
    return `${timeContext.daypart.name} at ${timeContext.placeLabel}${meridian}${parallel}: ${timeContext.daypart.scheduleState}. ${timeContext.timeZoneNote}${crossing}`;
  }

  class EncounterGenerator {
    constructor(data) {
      this.data = data;
    }

    generate(options = {}) {
      const settings = {
        difficulty: 'standard',
        environment: 'any',
        biome: null,
        objective: 'random',
        party: [],
        seed: '',
        ichorChance: 0.25,
        maxHostiles: 12,
        deity: 'random',
        className: 'random',
        race: 'random',
        raceOption: '',
        mixedHeritage: false,
        secondRace: '',
        secondRaceOption: '',
        heritageMethod: 'automatic',
        objectiveThreat: null,
        terrainThreat: 0,
        alliedSupport: 0,
        preparedAdvantage: 0,
        worldTime: { year: 1, month: 1, day: 1, hour: 12, minute: 0, leapDay: false },
        location: {},
        destinationUtcOffsetMinutes: null,
        ...options
      };
      settings.difficulty = normalizeDifficulty(settings.difficulty);
      settings.maxHostiles = Math.max(1, Math.min(12, Number(settings.maxHostiles || 12)));
      const rng = new RNG(settings.seed);
      const requestedClass = settings.className && !['random', 'none'].includes(settings.className) ? this.data.resolveClass(settings.className) : null;
      if (settings.className && !['random', 'none'].includes(settings.className) && !requestedClass) throw new Error(`Unrecognized class "${settings.className}".`);
      const selectedBiome=this.data.resolveBiome(settings.biome||settings.environment);if(settings.biome&&!selectedBiome)throw new Error(`Unrecognized biome "${settings.biome}".`);settings.biome=selectedBiome||null;settings.environment=selectedBiome?.name||settings.environment;const requestedRace = settings.race && !['random', 'none'].includes(settings.race) ? this.data.resolveRace(settings.race) : null;
      if (settings.race && !['random', 'none'].includes(settings.race) && !requestedRace) throw new Error(`Unrecognized race "${settings.race}".`);

      const rawParty = settings.party?.length
        ? settings.party
        : Array.from({ length: Number(settings.partySize || 4) }, (_, index) => ({
          id: `pc-${index + 1}`,
          name: `Adventurer ${index + 1}`,
          level: Number(settings.averageLevel || 8)
        }));
      const partyCheck = global.RandomEncounterPartyLevels.validateParty(rawParty);
      if (!partyCheck.valid) throw new Error('Random encounters require at least one party member, and every character must be total level 8 or higher.');
      const party = partyCheck.party;
      const partyLevel = averagePartyLevel(party);

      const locationOptions = {
        ...(settings.location || {}),
        semanticId: settings.semanticId ?? settings.location?.semanticId,
        provinceId: settings.provinceId ?? settings.location?.provinceId,
        provinceName: settings.provinceName ?? settings.province ?? settings.location?.provinceName,
        settlementId: settings.settlementId ?? settings.location?.settlementId,
        settlementName: settings.settlementName ?? settings.settlement ?? settings.location?.settlementName,
        longitude: settings.longitude ?? settings.location?.longitude,
        latitude: settings.latitude ?? settings.location?.latitude,
        provinceUtcOffsetMinutes: settings.provinceUtcOffsetMinutes ?? settings.location?.provinceUtcOffsetMinutes,
        provinceUtcOffsetHours: settings.provinceUtcOffsetHours ?? settings.location?.provinceUtcOffsetHours,
        settlementUtcOffsetMinutes: settings.settlementUtcOffsetMinutes ?? settings.location?.settlementUtcOffsetMinutes,
        settlementUtcOffsetHours: settings.settlementUtcOffsetHours ?? settings.location?.settlementUtcOffsetHours,
        utcOffsetMinutes: settings.utcOffsetMinutes ?? settings.location?.utcOffsetMinutes,
        utcOffsetHours: settings.utcOffsetHours ?? settings.location?.utcOffsetHours,
        timezoneId: settings.timezoneId ?? settings.location?.timezoneId,
        worldTime: settings.worldTime,
        destinationUtcOffsetMinutes: settings.destinationUtcOffsetMinutes,
        destinationUtcOffsetHours: settings.destinationUtcOffsetHours
      };
      const timeContext = this.data.timeSystem
        ? this.data.timeSystem.resolveEncounterContext(locationOptions)
        : null;

      // Objectives are selected before hostile budgeting because Covenant Engine
      // treats time pressure and non-HP objectives as part of encounter difficulty.
      const objective = selectObjective(this.data, rng, settings.objective, settings.environment, null);
      const objectiveThreat = settings.objectiveThreat == null ? Number(objective.pressure || 0) : Number(settings.objectiveThreat);
      const threatBudget = threatBudgetForParty(party, settings.difficulty, {
        objectiveThreat,
        terrainThreat: settings.terrainThreat,
        alliedSupport: settings.alliedSupport,
        preparedAdvantage: settings.preparedAdvantage
      });

      let candidates = this.data.monsters.filter((monster) =>
        encounterEligible(monster, this.data.config, settings) &&
        Number(monster.cr) <= Number(settings.maxCr || 30)
      );
      if (settings.types?.length) {
        const allowedTypes = new Set(settings.types.map((type) => String(type).toLowerCase()));
        candidates = candidates.filter((monster) => allowedTypes.has(String(monster.type).toLowerCase()));
      }
      if (settings.environment && settings.environment !== 'any') {
        const matchingEnvironment = candidates.filter((monster) => environmentWeight(monster, settings.environment, selectedBiome) >= 1);
        if (matchingEnvironment.length) candidates = matchingEnvironment;
      }
      if (requestedClass || requestedRace) {
        const canonSuitable = candidates.filter((monster) => requestedRace ? String(monster.type).toLowerCase() === 'humanoid' : suitableForCanonOverlay(monster));
        if (canonSuitable.length) candidates = canonSuitable;
      }
      if (!candidates.length) throw new Error('No eligible hostiles match the requested encounter filters.');

      const permittedOverage = settings.difficulty === 'extreme' ? 4 : 2;
      let anchorCandidates = candidates.filter((monster) => enemyThreatPoints(monster, partyLevel).points <= threatBudget.total + permittedOverage);
      if (!anchorCandidates.length) {
        anchorCandidates = candidates.slice().sort((a, b) =>
          enemyThreatPoints(a, partyLevel).points - enemyThreatPoints(b, partyLevel).points
        ).slice(0, 30);
      }
      const anchor = rng.weighted(anchorCandidates, (monster) => {
        const rating = enemyThreatPoints(monster, partyLevel);
        const anchorTarget = Math.max(2, threatBudget.total * 0.45);
        const closeness = 1 / (1 + Math.abs(anchorTarget - rating.points) / Math.max(1, threatBudget.total));
        const requestedEnvironment = environmentWeight(monster, settings.environment, selectedBiome);
        const divineBoost = settings.deity && !['random', 'none'].includes(settings.deity) && monster.divineCandidate ? 3 : 1;
        const classBoost = requestedClass && suitableForCanonOverlay(monster) ? 5 : 1;
        const raceBoost = requestedRace && String(monster.type).toLowerCase() === 'humanoid' ? 6 : 1;
        return requestedEnvironment * closeness * divineBoost * classBoost * raceBoost * scheduleWeight(monster, timeContext);
      });

      const cohort = creatureFamily(anchor);
      const cohortCandidates = candidates.filter((monster) => creatureFamily(monster) === cohort);
      const selected = [anchor];
      const targetLow = threatBudget.total * (settings.difficulty === 'light' ? 0.65 : 0.82);
      const targetHigh = threatBudget.total + permittedOverage;
      let guard = 0;
      while (selected.length < settings.maxHostiles && guard++ < 300) {
        const current = encounterThreat(selected, party).total;
        if (current >= targetLow && (current >= threatBudget.total || rng.random() < 0.48)) break;
        const maximumKinds = Math.max(1, Number(this.data.config.maxUniqueHostileKinds || 3));
        const selectedKinds = new Set(selected.map((monster) => monster.id));
        const viable = cohortCandidates.filter((monster) => {
          if (!selectedKinds.has(monster.id) && selectedKinds.size >= maximumKinds) return false;
          const projected = encounterThreat([...selected, monster], party).total;
          return projected <= targetHigh;
        });
        if (!viable.length) break;
        const pick = rng.weighted(viable, (monster) => {
          const projected = encounterThreat([...selected, monster], party).total;
          const closeness = 1 / (1 + Math.abs(threatBudget.total - projected) / Math.max(1, threatBudget.total));
          return compatibilityWeight(anchor, monster, selected, settings.environment) * closeness * scheduleWeight(monster, timeContext);
        });
        if (!pick) break;
        selected.push(pick);
      }

      let patron = selectEncounterPatron(this.data, rng, settings.deity, anchor, requestedClass);
      let encounterClassProfile = selectEncounterClass(this.data, rng, settings.className, patron, anchor, settings.deity);
      if (encounterClassProfile && !patron) patron = this.data.resolveDeity(encounterClassProfile.deityName);
      if (encounterClassProfile && patron && encounterClassProfile.deityName.toLowerCase() !== patron.name.toLowerCase()) {
        throw new Error(`${encounterClassProfile.name} is canonically bound to ${encounterClassProfile.deityName}, not ${patron.name}.`);
      }
      const encounterRaceProfile = selectEncounterRace(this.data, rng, settings.race, anchor);const secondRace=settings.mixedHeritage?this.data.resolveRace(settings.secondRace):null;if(settings.mixedHeritage&&!secondRace)throw new Error('Mixed heritage requires a canonical second parent race.');const heritageRecord=encounterRaceProfile&&secondRace?{...this.data.resolveHeritage(encounterRaceProfile.id,secondRace.id),mixedHeritage:true,parentA:encounterRaceProfile.name,parentB:secondRace.name,subtypeA:settings.raceOption||'',subtypeB:settings.secondRaceOption||'',method:settings.heritageMethod||'automatic'}:null;
      const counts = {};
      const hostiles = selected.map((monster, index) => {
        counts[monster.id] = (counts[monster.id] || 0) + 1;
        const receivesClass = shouldReceiveOverlay(monster, encounterClassProfile, rng, anchor);
        const canonicalClass = receivesClass ? materializeClass(encounterClassProfile, rng) : null;
        const classDeity = canonicalClass ? this.data.resolveDeity(canonicalClass.deityName) : null;
        const deity = classDeity || (shouldReceivePatron(monster, patron, rng, anchor) ? patron : null);
        const race = shouldReceiveRace(monster, encounterRaceProfile, rng, anchor) ? materializeRace(encounterRaceProfile,{raceOption:settings.raceOption,heritage:heritageRecord,biome:selectedBiome}) : null;
        const covenant = covenantFor(deity);
        const ichorWeapon = chooseIchor(monster, this.data, rng, Math.max(0, Math.min(1, Number(settings.ichorChance))));
        const homebrewAlignment = this.data.alignmentSystem.influenced(monster.homebrewAlignment, { deity, classProfile: receivesClass ? encounterClassProfile : null, rng });
        const hpVariance = settings.randomizeHp === false
          ? Number(monster.hp)
          : Math.max(1, Math.round(Number(monster.hp) * (0.85 + rng.random() * 0.3)));
        const tokenCandidates = global.RandomEncounterTokens.candidates(monster);
        const token = global.RandomEncounterTokens.preferred(monster);
        const threatRating = enemyThreatPoints(monster, partyLevel);
        return {
          ...JSON.parse(JSON.stringify(monster)),
          instanceId: `${monster.id}-${Date.now().toString(36)}-${index}-${rng.int(1000, 9999)}`,
          displayName: counts[monster.id] > 1 ? `${monster.name} ${counts[monster.id]}` : monster.name,
          maxHp: hpVariance,
          currentHp: hpVariance,
          temporaryHp: 0,
          deity,
          covenant,
          canonicalClass,
          race,
          ichorWeapon,
          homebrewAlignment,
          behaviorTags: [...new Set([
            ...behaviorFor(monster, deity, receivesClass ? encounterClassProfile : null, covenant),
            ...this.data.alignmentSystem.behaviorTags(homebrewAlignment),
            ...(timeContext?.encounterTags || [])
          ])],
          token,
          tokenCandidates,
          threatRating,
          threat: {},
          lastAttackerId: null,
          reactionAvailable: true,
          reactionsPerRound: 1,
          beatsPerTurn: 3,
          initiativeSlots: threatRating.tier === 'boss' ? 2 : 1,
          defeated: false,
          conditions: [],
          startingDistanceFt: Number(settings.startingDistance || 30),
          distanceByTarget: {},
          scheduleContext: timeContext ? {
            daypart: timeContext.daypart,
            localTime: timeContext.local,
            localLabel: timeContext.localLabel,
            timezone: timeContext.zone,
            activity: timeContext.daypart.scheduleState
          } : null
        };
      });

      const threat = encounterThreat(hostiles, party);
      const xp = adjustedXp(hostiles, party.length);
      const grid = this.data.gridResolver.choose({
        partySize: party.length,
        startingDistance: settings.startingDistance,
        seedHash: rng.int(0, 999999)
      });
      hostiles.forEach((hostile) => {
        hostile.dialogueProfile = global.RandomEncounterDialogue.profileFor(hostile, { timeContext });
      });
      const template = chooseTemplate(this.data, rng, settings.environment, anchor, encounterClassProfile, encounterRaceProfile);
      const scene = buildScene(objective, settings.difficulty, settings.environment, timeContext, settings);
      const uniqueNames = [...new Set(hostiles.map((hostile) => hostile.name))];
      const groupLabel = uniqueNames.length <= 3
        ? uniqueNames.join(', ')
        : `${uniqueNames.slice(0, 2).join(', ')} and allies`;
      const temporalOpening = timeOpening(timeContext);

      return {
        id: `enc-${Date.now().toString(36)}-${rng.int(10000, 99999)}`,
        seed: settings.seed || null,
        createdAt: new Date().toISOString(),
        ruleset: {
          name: this.data.howToPlay?.system?.name || this.data.howToPlay?.system_name || 'Universal Covenant Engine',
          version: this.data.howToPlay?.system?.version || this.data.howToPlay?.version || 'latest',
          outcomeBands: 5,
          combat: { roundSeconds: 6, beatsPerTurn: 3, reactionsPerCreature: 1, initiative: 'alternating sides' },
          legacy5eCompatibility: { statBlocks: true, xpDisplayOnly: true }
        },
        difficulty: settings.difficulty,
        environment: settings.environment,
        biome: selectedBiome,
        partySnapshot: party,
        partyWarnings: partyCheck.warnings,
        budget: threatBudget.total,
        threatBudget,
        threat,
        xp,
        objective,
        scene,
        time: timeContext,
        template,
        grid,
        patron,
        canonicalClass: encounterClassProfile ? materializeClass(encounterClassProfile, rng) : null,
        canonicalRace: materializeRace(encounterRaceProfile,{raceOption:settings.raceOption,heritage:heritageRecord,biome:selectedBiome}),
        canonicalHeritage: heritageRecord,
        coherentGroup: { anchorId: anchor.id, family: cohort },
        title: `${template.title}: ${groupLabel}`,
        opening: [temporalOpening, template.opening].filter(Boolean).join(' '),
        hostiles: hostiles.map(h=>Canon?Canon.normalizeHostile(h):h),
        settings: {
          ichorChance: Number(settings.ichorChance),
          deity: settings.deity,
          className: settings.className,
          race: settings.race,
          raceOption: settings.raceOption,
          mixedHeritage: !!settings.mixedHeritage,
          secondRace: settings.secondRace,
          secondRaceOption: settings.secondRaceOption,
          heritageMethod: settings.heritageMethod,
          biome: selectedBiome?.id||null,
          objective: objective.id,
          objectiveThreat,
          terrainThreat: threatBudget.terrain,
          alliedSupport: threatBudget.alliedSupport,
          preparedAdvantage: threatBudget.preparedAdvantage,
          autonomousHostiles: true,
          coherentGroups: true,
          allowPassiveCreatures: Boolean(settings.allowPassiveCreatures),
          location: scene.location,
          worldTime: timeContext?.utc || settings.worldTime,
          destinationUtcOffsetMinutes: settings.destinationUtcOffsetMinutes
        }
      };
    }
  }

  global.RandomEncounterGenerator = {
    EncounterGenerator,
    adjustedXp,
    budgetForParty,
    environmentWeight,
    compatibilityWeight,
    encounterEligible,
    creatureFamily,
    suitableForCanonOverlay,
    selectEncounterClass,
    selectEncounterRace,
    covenantFor,
    normalizeDifficulty,
    threatBudgetForParty,
    encounterThreat,
    enemyThreatPoints,
    averagePartyLevel,
    selectObjective,
    buildScene,
    timeOpening,
    scheduleWeight
  };
}(window));
