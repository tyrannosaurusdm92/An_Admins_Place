/* Genericized for AI-Brain capability use. Provenance group: player-reference-runtime-b. */

(function (global) {
  'use strict';
  const DATA = global.UNIVERSAL_CANONICAL || {};
  const KEYS = {
    registry: 'universal.unified.registry.v1',
    characters: 'universal.activeworkspace.characters.v1',
    sessions: 'universal.activeworkspace.sessions.v1',
    worlds: 'universal.mol.worlds.v1',
    playerNotes: 'universal.player.lore-notes.v1'
  };
  const CHANNEL_NAME = 'universal-unified-system-v1';

  const deepClone = (value) => JSON.parse(JSON.stringify(value));
  const uid = (prefix='id') => {
    if (global.crypto && typeof global.crypto.randomUUID === 'function') return `${prefix}_${global.crypto.randomUUID()}`;
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`;
  };
  const safeParse = (text, fallback) => { try { return JSON.parse(text); } catch (_) { return fallback; } };
  const getLocal = (key, fallback) => safeParse(global.localStorage ? localStorage.getItem(key) : '', fallback);
  const setLocal = (key, value) => { if (global.localStorage) localStorage.setItem(key, JSON.stringify(value)); };
  const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const slug = (value) => String(value || 'content').normalize('NFKD').replace(/[^\w\s-]/g,'').trim().toLowerCase().replace(/[\s_-]+/g,'-').slice(0,70) || 'content';
  const clamp = (n, min, max) => Math.max(min, Math.min(max, Number(n) || 0));
  const mod = (score) => Math.floor((Number(score || 10) - 10) / 2);
  const pb = (level) => 2 + Math.floor((clamp(level,1,20) - 1) / 4);

  class RNG {
    constructor(seed) {
      let h = 2166136261 >>> 0;
      for (const ch of String(seed || 'Universal')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
      this.state = h || 0x9e3779b9;
    }
    next() { let x=this.state; x^=x<<13; x^=x>>>17; x^=x<<5; this.state=x>>>0; return this.state/4294967296; }
    int(min,max) { return min + Math.floor(this.next() * (max-min+1)); }
    pick(list) { return list && list.length ? list[this.int(0,list.length-1)] : undefined; }
    shuffle(list) { const a=[...list]; for(let i=a.length-1;i>0;i--){const j=this.int(0,i);[a[i],a[j]]=[a[j],a[i]];} return a; }
  }

  const Canonical = {
    raw: DATA,
    version: DATA['01_architect_truth']?.version || '1.4.0',
    core: DATA['02_core_rules'] || {},
    character: DATA['03_character_creation_skills'] || {},
    racesData: DATA['04_races_60'] || {},
    deitiesData: DATA['04b_deities_22'] || {},
    classesData: DATA['06_classes_22x6'] || {},
    expression: DATA['06b_class_expression_point_buy'] || {},
    alignmentData: DATA['07_alignment_8_axes_81_profiles'] || {},
    magic: DATA['08_magic_psionics_ichor'] || {},
    galaxy: DATA['09_multiera_galaxy_worldbuilder'] || {},
    equipment: DATA['10_equipment_thundercoils'] || {},
    factions: DATA['11_projects_factions_dm_solo'] || {},
    bridge: DATA['12_online_boardgame_bridge'] || {},
    conditions: DATA['13_quick_reference_conditions'] || {},
    audit: DATA['14_content_scope_audit'] || {},
    validation: DATA['15_validation_report'] || {},
    races() { return [...(this.racesData.homeworld_races || []), ...(this.racesData.alien_folk || [])]; },
    classes() { return this.classesData.classes || []; },
    alignments() { return this.alignmentData.profiles || []; },
    deities() { return this.deitiesData.deities || []; },
    classById(id) { return this.classes().find(x => x.id === id); },
    raceById(id) { return this.races().find(x => x.id === id); },
    alignmentByName(name) { return this.alignments().find(x => x.name === name); },
    path(classId, family) { return this.classById(classId)?.paths?.find(x => x.family === family); },
    eraLabels() {
      const labels = this.core.era_scale?.era_labels || {};
      return Object.entries(labels).map(([id,label]) => ({id, label}));
    }
  };

  class UnifiedRegistry {
    constructor() {
      this.channel = null;
      this.listeners = new Set();
      try {
        if ('BroadcastChannel' in global) {
          this.channel = new BroadcastChannel(CHANNEL_NAME);
          this.channel.onmessage = event => this._notify(event.data || {type:'sync'});
        }
      } catch (_) {}
      this.ensure();
      global.addEventListener?.('storage', event => {
        if (event.key === KEYS.registry) this._notify({type:'registry_sync', source:'storage'});
      });
    }
    ensure() {
      const current = getLocal(KEYS.registry, null);
      if (!current || current.schema !== 'universal.unified.registry.v1') {
        this.save({
          schema: 'universal.unified.registry.v1',
          rulesVersion: Canonical.version,
          revision: 1,
          generatedContent: [],
          auditLog: [{id:uid('event'), at:new Date().toISOString(), type:'registry_created', reason:'Initialized unified registry'}]
        }, false);
      }
    }
    load() { return getLocal(KEYS.registry, {schema:'universal.unified.registry.v1', rulesVersion:Canonical.version, revision:1, generatedContent:[], auditLog:[]}); }
    save(registry, broadcast=true) {
      registry.rulesVersion = Canonical.version;
      registry.updatedAt = new Date().toISOString();
      setLocal(KEYS.registry, registry);
      if (broadcast) this.broadcast({type:'registry_sync', revision:registry.revision});
      this._notify({type:'registry_sync', revision:registry.revision, source:'local'});
      return registry;
    }
    list(type='all') {
      const rows = this.load().generatedContent || [];
      return type === 'all' ? rows : rows.filter(x => x.contentType === type);
    }
    upsert(item, reason='Content generated and validated') {
      const registry = this.load();
      const index = registry.generatedContent.findIndex(x => x.id === item.id);
      if (index >= 0) registry.generatedContent[index] = item; else registry.generatedContent.unshift(item);
      registry.revision = (registry.revision || 0) + 1;
      registry.auditLog.unshift({id:uid('event'), at:new Date().toISOString(), type:index>=0?'content_updated':'content_created', contentId:item.id, reason});
      registry.auditLog = registry.auditLog.slice(0,500);
      return this.save(registry);
    }
    remove(id) {
      const registry = this.load();
      const before = registry.generatedContent.length;
      registry.generatedContent = registry.generatedContent.filter(x => x.id !== id);
      if (registry.generatedContent.length !== before) {
        registry.revision = (registry.revision || 0) + 1;
        registry.auditLog.unshift({id:uid('event'), at:new Date().toISOString(), type:'content_removed', contentId:id, reason:'Removed through unified registry'});
        this.save(registry);
      }
    }
    import(pack) {
      const incoming = Array.isArray(pack) ? pack : pack.generatedContent;
      if (!Array.isArray(incoming)) throw new Error('This file does not contain generatedContent.');
      const registry = this.load();
      const map = new Map(registry.generatedContent.map(x => [x.id,x]));
      let accepted = 0;
      for (const item of incoming) {
        const report = Forge.validate(item);
        if (report.valid) { map.set(item.id || uid(item.contentType || 'content'), {...item, validation:report}); accepted++; }
      }
      registry.generatedContent = [...map.values()].sort((a,b) => String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
      registry.revision = (registry.revision || 0) + 1;
      registry.auditLog.unshift({id:uid('event'), at:new Date().toISOString(), type:'registry_imported', reason:`Imported ${accepted} validated records`});
      this.save(registry);
      return accepted;
    }
    export() { return deepClone(this.load()); }
    subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
    broadcast(message) { try { this.channel?.postMessage(message); } catch (_) {} }
    _notify(message) { for (const fn of this.listeners) { try { fn(message); } catch (error) { console.error(error); } } }
  }

  const themes = {
    Abjuration:['Aegis','Ward','Seal','Bulwark','Bastion'],
    Conjuration:['Gate','Call','Bridge','Beacon','Summons'],
    Divination:['Eye','Omen','Lens','Revelation','Thread'],
    Enchantment:['Covenant','Accord','Whisper','Bond','Chorus'],
    Evocation:['Storm','Flare','Bolt','Torrent','Detonation'],
    Illusion:['Veil','Mirage','Echo','Mask','Phantom'],
    Necromancy:['Grave','Requiem','Memory','Ash','Soul'],
    Transmutation:['Shift','Forge','Bloom','Metamorph','Current']
  };
  const effectWords = {
    Attack:['Strike','Lance','Rend','Burst'], Control:['Snare','Anchor','Lock','Dominion'], Create:['Forge','Weave','Shape','Seed'], Detect:['Sight','Sense','Witness','Trace'], Heal:['Mend','Renewal','Cautery','Restoration'], Move:['Step','Surge','Current','Leap'], Protect:['Guard','Shelter','Aegis','Refuge'], Summon:['Call','Convergence','Arrival','Host'], Transform:['Change','Mantle','Form','Transfiguration'], Communicate:['Whisper','Concord','Message','Resonance'], Travel:['Gate','Road','Passage','Crossing']
  };
  const damageDice = ['1d6','2d6','2d8','4d6','5d6','6d6','8d6','10d6','12d6','15d6'];

  function sourceLabel(family) {
    if (family === 'half_psi' || family === 'full_psi') return 'psionic discipline';
    if (family === 'hybrid_psicaster') return 'spell-psionic convergence';
    if (family === 'melee_non_caster') return 'class technique';
    return 'spell';
  }

  function maxRank(path, level) {
    const map = path?.progression?.max_spell_rank_by_level || {};
    return Number(map[String(clamp(level,1,20))] || 0);
  }

  function rankScope(rank) {
    const row = (Canonical.magic.rank_budget || []).find(x => Number(x.rank) === Number(rank));
    return row?.typical_scope || 'encounter-scale effect';
  }

  function rangeFor(rank, effect) {
    if (effect === 'Protect' || effect === 'Transform') return rank < 2 ? 'Self or touch' : `${30 + rank*10} feet`;
    if (effect === 'Travel') return rank < 3 ? '30 feet' : rank < 7 ? 'Within the current scene' : 'Regional or interplanetary ritual link';
    return rank === 0 ? '30 feet' : `${30 + rank*15} feet`;
  }

  function durationFor(rank, effect) {
    if (['Attack','Heal','Move','Detect'].includes(effect)) return 'Instantaneous';
    if (rank <= 1) return 'Until the start of your next turn';
    if (rank <= 4) return 'Concentration, up to 1 minute';
    if (rank <= 6) return 'Concentration, up to 10 minutes';
    return 'Ritual duration set by the scene clock';
  }

  function effectText({rank,effect,school,className,area,rng}) {
    const die = damageDice[clamp(rank,0,9)];
    const amount = area ? damageDice[Math.max(0, clamp(rank,0,9)-1)] : die;
    const save = `the ${className} class save DC`;
    const target = area ? `creatures in a ${Math.max(5, 5 + rank*5)}-foot zone` : 'one creature or object';
    switch (effect) {
      case 'Attack': return `${target} within ${rng} makes an appropriate saving throw against ${save} or takes ${amount} class-appropriate damage; on a success it takes half. The effect never ignores immunity.`;
      case 'Control': return `${target} within ${rng} makes an appropriate saving throw against ${save}. On a failure, choose one bounded rider: speed reduced by 10 feet, moved ${5+rank*5} feet, unable to take reactions, or one Edge granted against it until the start of your next turn. No generated result takes control of a player character's decisions.`;
      case 'Create': return `Create a stable, nonliving construct or environmental feature appropriate to ${school.toLowerCase()} with ${rankScope(rank)}. It cannot create permanent wealth, sentient life, or unrestricted technology.`;
      case 'Detect': return `Reveal one category of hidden information within ${rng}. Essential clues are always found; the test determines speed, cost, danger, or completeness rather than deleting the clue.`;
      case 'Heal': return `One willing creature within ${rng} restores ${amount} hit points or removes one temporary, rank-appropriate condition. It cannot erase scars, identity, or consequences without an explicit higher-rank ritual.`;
      case 'Move': return `Move yourself or one willing creature up to ${15+rank*10} feet without provoking from the first space left. An unwilling target receives a save against ${save}.`;
      case 'Protect': return `Grant ${target} Guard ${Math.max(1,Math.ceil(rank/2))} or resistance to one declared damage type until the effect ends. It does not stack with itself.`;
      case 'Summon': return `Call a temporary allied manifestation appropriate to ${school.toLowerCase()}. It acts on your turn, uses one bounded action, and disappears at 0 HP or when concentration ends. It never provides extra full turns beyond the action-economy budget.`;
      case 'Transform': return `Transform one willing target or unattended object within ${rng} in a way appropriate to ${rankScope(rank)}. Unwilling creatures receive a save, and the effect cannot remove personhood or force beliefs.`;
      case 'Communicate': return `Create a consent-aware communication link with up to ${Math.max(2,rank+1)} willing creatures within ${rng}. It conveys meaning but does not compel agreement or reveal private thoughts without a contested test and explicit campaign consent.`;
      case 'Travel': return `Open a bounded route appropriate to ${rankScope(rank)}. The route requires a known destination or anchor, cannot bypass a sealed campaign boundary without a clock, and carries every declared traveler together.`;
      default: return `Resolve a ${rankScope(rank)} effect using ${school}.`;
    }
  }

  const Forge = {
    generate(config={}) {
      const rng = new RNG(config.seed || `${Date.now()}-${config.classId}-${config.contentType}`);
      const cls = Canonical.classById(config.classId) || Canonical.classes()[0];
      if (!cls) throw new Error('No canonical classes are loaded.');
      const family = config.family || cls.paths?.[0]?.family;
      const path = Canonical.path(cls.id, family) || cls.paths?.[0];
      const level = clamp(config.level || 8, 1, 20);
      let contentType = config.contentType || 'spell';
      if (path.family === 'melee_non_caster' && contentType === 'spell') contentType = 'ability';
      const alignment = Canonical.alignmentByName(config.alignment) || rng.pick(Canonical.alignments());
      const era = config.era || rng.pick(Canonical.eraLabels())?.id || 'medieval';
      const createdAt = new Date().toISOString();
      const base = {
        id: uid(contentType),
        schema: `universal.generated-${contentType}.v1`,
        rulesVersion: Canonical.version,
        contentType,
        createdAt,
        updatedAt: createdAt,
        status: 'generated',
        classBinding: {classId:cls.id, className:cls.name, pathId:path.id, pathName:path.name, family:path.family, familyLabel:path.family_label},
        alignmentLens: alignment ? {name:alignment.name, profile:alignment.profile, description:alignment.description} : null,
        era,
        sourceRefs: ['02_core_rules.json','06_classes_22x6.json','06b_class_expression_point_buy.json','07_alignment_8_axes_81_profiles.json','08_magic_psionics_ichor.json','10_equipment_thundercoils.json'],
        safety: 'Fictional tabletop content only; contains no real-world construction, chemistry, electronics, or weapon instructions.'
      };
      let item;
      if (contentType === 'spell') item = this._spell(base, config, rng, cls, path, level);
      else if (contentType === 'ability') item = this._ability(base, config, rng, cls, path, level);
      else if (contentType === 'weapon') item = this._weapon(base, config, rng, cls, path, level);
      else if (contentType === 'armor') item = this._armor(base, config, rng, cls, path, level);
      else throw new Error(`Unsupported content type: ${contentType}`);
      item.validation = this.validate(item);
      item.status = item.validation.valid ? 'validated' : 'rejected';
      return item;
    },
    _spell(base, config, rng, cls, path, level) {
      const allowed = path.progression?.allowed_schools || cls.magic_school_assignment || (Canonical.magic.spell_schools || []).map(x=>x.name);
      const school = allowed.includes(config.school) ? config.school : rng.pick(allowed);
      const effect = (Canonical.magic.effects || []).includes(config.effect) ? config.effect : rng.pick(Canonical.magic.effects || ['Protect']);
      const cap = maxRank(path, level);
      const rank = clamp(config.rank ?? Math.min(cap, Math.max(0, Math.floor(level/4))), 0, cap);
      const area = config.area === true || (rank >= 3 && rng.next() > .62);
      const beats = rank >= 6 ? 3 : rank <= 1 && rng.next() > .75 ? 1 : 2;
      const lead = rng.pick(themes[school] || ['Arcane']);
      const tail = rng.pick(effectWords[effect] || ['Working']);
      const kind = sourceLabel(path.family);
      const rngText = rangeFor(rank,effect);
      return {...base,
        name: `${lead} ${tail}`,
        level,
        rank,
        school,
        effect,
        kind,
        summary: `A rank ${rank} ${kind} for ${path.name}, shaped through ${school} and the ${effect.toLowerCase()} effect family.`,
        mechanics: {
          activation: rank >= 7 ? `${beats} Beats plus a progress clock when used at strategic scale` : `${beats} Beat${beats===1?'':'s'}`,
          range: rngText,
          area: area ? `${Math.max(5,5+rank*5)}-foot zone` : 'single target or bounded object',
          duration: durationFor(rank,effect),
          cost: rank === 0 ? 'No slot; follows cantrip/grade limits' : `One rank ${rank} slot or equivalent Focus expenditure`,
          attackOrSave: ['Attack'].includes(effect) ? cls.attack_bonus : cls.save_dc,
          effect: effectText({rank,effect,school,className:cls.name,area,rng:rngText}),
          scaling: rank < cap ? `When prepared in a higher available rank, increase one numeric magnitude by one budget step per additional rank; do not add an extra full effect.` : 'Already at the selected character’s maximum available rank.'
        },
        constraints: [
          `Maximum rank at level ${level} for ${path.family_label}: ${cap}.`,
          `Allowed schools: ${allowed.join(', ')}.`,
          'Uses the existing action economy, concentration, attack, saving-throw, slot, and Focus rules.',
          'Does not override player agency or consent rules.'
        ]
      };
    },
    _ability(base, config, rng, cls, path, level) {
      const gates = [1,3,6,10,14,18];
      const gate = gates.filter(x=>x<=level).at(-1) || 1;
      const roles = cls.role_tags || ['support'];
      const role = config.effect || rng.pick(roles);
      const beats = gate >= 14 ? 3 : gate >= 6 ? 2 : 1;
      const noun = rng.pick(['Maneuver','Stance','Counter','Field','Relay','Invocation','Technique']);
      const prefix = rng.pick((cls.name.match(/[A-Z][a-z]+/g) || [cls.name]).slice(0,2));
      const ichor = gate >= 10 ? 2 : gate >= 3 ? 1 : 0;
      return {...base,
        name: `${prefix} ${noun}`,
        level,
        featureGate: gate,
        role,
        summary: `A level-${gate} compatible ${path.name} ability emphasizing ${String(role).replaceAll('_',' ')}.`,
        mechanics: {
          activation: `${beats} Beat${beats===1?'':'s'}`,
          cost: ichor ? `${ichor} Bounty Ichor` : 'No Ichor; once per round',
          range: gate >= 10 ? '60 feet or a 20-foot class field' : 'Self, weapon reach, or 30 feet',
          duration: gate >= 14 ? '1 minute, once per Haven Rest unless the Ichor cost is paid' : 'Until the start of your next turn',
          effect: gate < 3 ? `Gain one Edge on a class-appropriate test or add PB to one bounded defense.` : gate < 10 ? `Choose one: deal 1d8 + PB class-appropriate damage, reduce incoming damage by 1d8 + PB, move a willing creature 10 feet, or grant temporary HP equal to PB. Only one option applies.` : `Create a bounded class field. Once per round, one creature in the field gains one benefit or suffers one saving-throw rider; the field does not add extra turns.`,
          recharge: gate >= 14 ? 'Haven Rest, or pay the listed Ichor cost' : gate >= 6 ? 'Once per round while resources remain' : 'Once per turn'
        },
        constraints: ['One reaction maximum per round.','No extra full turn or unbounded extra attack.','Bounty Ichor remains separate from spell slots, Focus, and Thundercoil Charge.']
      };
    },
    _weapon(base, config, rng, cls, path, level) {
      const allTags = Canonical.equipment.tags || [];
      const eraText = Canonical.eraLabels().find(x=>x.id===base.era)?.label || base.era;
      const category = config.category || rng.pick(['melee','ranged','thrown','thundercoil']);
      const tier = clamp(Math.floor((level-1)/5),0,3);
      const diceByCategory = {melee:['1d6','1d8','1d10','2d6'], ranged:['1d6','1d8','1d10','2d6'], thrown:['1d4','1d6','1d8','1d10'], thundercoil:['1d8','1d10','2d6','2d8']};
      const candidateTags = category==='melee' ? ['defensive','heavy','reach','reliable','stunning'] : category==='thundercoil' ? ['accurate','area','piercing','volatile','vehicle'] : ['accurate','concealable','piercing','silent','reliable'];
      const tags = rng.shuffle(candidateTags.filter(x=>allTags.includes(x))).slice(0, category==='thundercoil'?3:2);
      const classWord = rng.pick((cls.name.match(/[A-Z][a-z]+/g) || [cls.name]));
      const noun = rng.pick(category==='melee'?['Blade','Hammer','Spear','Glaive']:category==='thrown'?['Disk','Knife','Dart','Javelin']:category==='thundercoil'?['Coil','Arc','Emitter','Driver']:['Bow','Caster','Carbine','Slinger']);
      return {...base,
        name: `${classWord} ${noun}`,
        level,
        category,
        summary: `A fictional ${eraText} ${category} weapon profile compatible with ${path.name}.`,
        functionProfile: {
          purpose: config.effect || rng.pick(cls.role_tags || ['combat utility']), era:eraText, scale:'personal',
          damageOrEffect:diceByCategory[category][tier], range:category==='melee'?'Reach or adjacent':category==='thrown'?'20/60 feet':category==='thundercoil'?'80/240 feet':'60/180 feet',
          handsOrStations:tags.includes('heavy')?'Two hands':'One or two hands', tags, reliability:tags.includes('volatile')?'Reliable until overloaded; overload advances danger':'Reliable',
          supply:category==='thundercoil'?'Thundercoil Charge tracked separately':'Era-appropriate abstract ammunition or none', maintenance:'Field service during a Field Rest; major repair during a Haven Rest', legality:'Campaign and settlement dependent'
        },
        mechanics: {attack:cls.attack_bonus, damage:diceByCategory[category][tier], special:tags.includes('area')?'Area mode lowers the damage die one step and affects a bounded zone.':'One bounded tag rider per hit.', guard:tags.includes('defensive')?1:0},
        constraints:['No real-world construction details.','Weapon tags must come from the canonical equipment list.','Thundercoil Charge, Heat, maintenance, and overload remain separate tracked costs.']
      };
    },
    _armor(base, config, rng, cls, path, level) {
      const category = config.category || rng.pick(['light','medium','heavy','environmental']);
      const profiles = {
        light:{ac:'12 + Dexterity modifier',guard:0,mobility:'No movement penalty',cost:'Low supply and maintenance burden'},
        medium:{ac:'14 + Dexterity modifier (maximum +2)',guard:2,mobility:'Balanced mobility',cost:'Moderate maintenance'},
        heavy:{ac:'16',guard:4,mobility:'Burden on stealth, heat, or access tests when fiction applies',cost:'High maintenance and access burden'},
        environmental:{ac:'13 + Dexterity modifier (maximum +2)',guard:2,mobility:'Sealed movement profile',cost:'Consumes or checks environment supply in vacuum, pressure, toxin, radiation, or magical hazards'}
      };
      const p = profiles[category];
      const word = rng.pick((cls.name.match(/[A-Z][a-z]+/g) || [cls.name]));
      const noun = rng.pick(category==='light'?['Weave','Mantle','Coat']:category==='medium'?['Harness','Cuirass','Ward']:category==='heavy'?['Plate','Bulwark','Shell']:['Seal','Voidskin','Hazard Mantle']);
      return {...base,
        name:`${word} ${noun}`,
        level,
        category,
        summary:`A ${category} armor profile that preserves the canonical defense–mobility tradeoff.`,
        mechanics:{armorClass:p.ac, guard:p.guard, mobility:p.mobility, burden:p.cost, training:`Use only when ${cls.name} or the current class-expression Martial Practice band grants ${category} armor training.`},
        constraints:['Armor does not stack with another base armor profile.','Guard is reduced before HP only when the active rules mode uses Guard.','Environmental protection requires the matching sealed or hazard tag.']
      };
    },
    validate(item) {
      const errors=[]; const warnings=[];
      if (!item || typeof item !== 'object') return {valid:false, errors:['Record is not an object.'], warnings:[], checkedAt:new Date().toISOString()};
      const allowedTypes=['spell','ability','weapon','armor'];
      if (!allowedTypes.includes(item.contentType)) errors.push('Unsupported content type.');
      if (item.rulesVersion !== Canonical.version) warnings.push(`Rules version ${item.rulesVersion || 'missing'} differs from canonical ${Canonical.version}.`);
      const cls=Canonical.classById(item.classBinding?.classId);
      if (!cls) errors.push('Class binding does not resolve to a canonical class.');
      const path=cls?.paths?.find(x=>x.id===item.classBinding?.pathId || x.family===item.classBinding?.family);
      if (!path) errors.push('Path binding does not resolve inside the selected class.');
      if (!item.name || String(item.name).trim().length<3) errors.push('Name is missing or too short.');
      if (item.contentType==='spell') {
        const cap=maxRank(path,item.level);
        if (path?.family==='melee_non_caster') errors.push('Melee / Non-Caster paths cannot receive generated spells.');
        if (Number(item.rank)>cap) errors.push(`Rank ${item.rank} exceeds level/path maximum ${cap}.`);
        const schools=path?.progression?.allowed_schools || [];
        if (schools.length && !schools.includes(item.school)) errors.push('School is not allowed for this path.');
        if (!(Canonical.magic.effects || []).includes(item.effect)) errors.push('Effect family is not canonical.');
      }
      if (item.contentType==='weapon') {
        const tags=item.functionProfile?.tags || [];
        for (const tag of tags) if (!(Canonical.equipment.tags || []).includes(tag)) errors.push(`Unknown equipment tag: ${tag}`);
        if (tags.length>3) errors.push('Weapon exceeds the three-tag generation cap.');
      }
      if (item.contentType==='armor' && !['light','medium','heavy','environmental'].includes(item.category)) errors.push('Armor category is not canonical.');
      const text=JSON.stringify(item).toLowerCase();
      if (/force(s|d)? (a player|the player|player character) to (choose|believe|obey)/.test(text)) errors.push('Generated content overrides player agency.');
      if (text.includes('real-world construction')) warnings.push('Safety declaration present; content remains abstract and fictional.');
      return {valid:errors.length===0, errors, warnings, checkedAt:new Date().toISOString(), rulesVersion:Canonical.version};
    }
  };

  const CharacterMath = {
    proficiencyBonus: pb,
    modifier: mod,
    hitPoints(cls, level, conScore=10) {
      const die=Number(String(cls?.chassis?.hit_die || 'd8').replace(/\D/g,'')) || 8;
      const con=mod(conScore); const lv=clamp(level,1,20);
      return Math.max(lv, die+con+(lv-1)*(Math.floor(die/2)+1+con));
    },
    ichor(cls, level, abilityScore=10) { return Math.max(2,pb(level)+mod(abilityScore)); },
    pathFeatures(path, level) { return (path?.features_by_level || []).filter(x=>Number(x.level)<=Number(level)); },
    derive(character) {
      const cls=Canonical.classById(character.classId); const path=Canonical.path(character.classId,character.family);
      const ability=cls?.chassis?.casting_ability || 'Intelligence';
      const score=Number(character.abilities?.[ability] || 10);
      return {
        proficiencyBonus:pb(character.level),
        hp:this.hitPoints(cls,character.level,character.abilities?.Constitution || 10),
        ichor:this.ichor(cls,character.level,score),
        spellAttack:pb(character.level)+mod(score),
        saveDC:8+pb(character.level)+mod(score),
        maxRank:maxRank(path,character.level),
        activeFeatures:this.pathFeatures(path,character.level)
      };
    }
  };

  function downloadJson(filename, value) {
    const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  function downloadText(filename, text, type='text/plain') {
    const blob=new Blob([text],{type}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  function readJsonFile(file) { return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{try{resolve(JSON.parse(r.result));}catch(e){reject(e)}};r.onerror=()=>reject(r.error);r.readAsText(file);}); }

  global.Universal = {Canonical, UnifiedRegistry, Forge, CharacterMath, RNG, KEYS, utils:{uid,esc,slug,clamp,mod,pb,getLocal,setLocal,downloadJson,downloadText,readJsonFile,deepClone}};
})(window);
