/* AI-Brain generic capability extraction. Source group: voice-persona-creator. Original UI shell omitted; embedded logic retained. */

  (() => {
    'use strict';

    const BACKEND_URL = atob('aHR0cHM6Ly9zY3JpcHQuZ29vZ2xlLmNvbS9tYWNyb3Mvcy9BS2Z5Y2J5cjRUd0xpbEN1Ym5XbV9nLU44bklaVWlXUjNHSjctbnplVjhkYzF2SmN0Y1BISEZVM2JDZzk2eWk1cmV0T1VlWkdmUS9leGVj');
    Object.freeze({ BACKEND_URL });

    const DEFAULT_PROFILE = Object.freeze({
      pitch: 5.0, speed: 5.0, inflection: 5.0, stutter: 1.0, breath: 3.0, roughness: 2.0,
      resonance: 5.5, formality: 5.5, vowelFlow: 5.0, consonantBite: 5.0, mouthShape: 5.0,
      nasality: 5.0, throatDepth: 5.0, rhythm: 5.0, pauseControl: 5.0, emphasis: 5.0,
      warmth: 5.0, clarity: 6.0, projection: 5.0, humanVariation: 5.0, accentColor: 7.0,
      influenceRace: 1.0, influenceGender: 1.0, influencePersonality: 1.0, influenceBiome: 1.0,
      influenceBaseAudio: 0.45, emotionIntensity: 0.75
    });

    const CORE_SLIDERS = [
      ['Voice Height','pitch',0,10,0.1], ['Speaking Speed','speed',0,10,0.1],
      ['Expression Shape','inflection',0,10,0.1], ['Hesitations','stutter',0,10,0.1],
      ['Softness','breath',0,10,0.1], ['Gruff Edge','roughness',0,10,0.1],
      ['Body / Depth','resonance',0,10,0.1], ['Speech Style','formality',0,10,0.1],
      ['Vowel Flow','vowelFlow',0,10,0.1], ['Consonant Bite','consonantBite',0,10,0.1],
      ['Mouth Shape','mouthShape',0,10,0.1], ['Nasal Color','nasality',0,10,0.1],
      ['Throat Depth','throatDepth',0,10,0.1], ['Speech Rhythm','rhythm',0,10,0.1],
      ['Pause Space','pauseControl',0,10,0.1], ['Word Emphasis','emphasis',0,10,0.1],
      ['Warmth','warmth',0,10,0.1], ['Clarity','clarity',0,10,0.1],
      ['Projection','projection',0,10,0.1], ['Human Variation','humanVariation',0,10,0.1],
      ['Accent Color','accentColor',0,10,0.1]
    ];

    const INFLUENCE_SLIDERS = [
      ['Race / Ancestry Influence','influenceRace',0,100,1],
      ['Gender Identity Influence','influenceGender',0,100,1],
      ['Personality Influence','influencePersonality',0,100,1],
      ['Accent Strength / Remove Accent','influenceBiome',0,100,1],
      ['Uploaded / Recorded Voice Influence','influenceBaseAudio',0,100,1],
      ['Emotion Strength','emotionIntensity',0,100,1]
    ];

    const VOICE_MODELS = Object.freeze({
      stonehollow_echo: { name:'Stonehollow Echo', fantasy:'Deep Cavern / Welsh', langs:['cy-GB','en-GB','en-IE','en-US'], feel:'echoing, ancient, carved-from-stone', delta:{ resonance:1.3, throatDepth:1.2, pauseControl:.8, speed:-.35, formality:.45, accentColor:.9, clarity:.25 } },
      highbranch_lilt: { name:'Highbranch Lilt', fantasy:'Treetops / French', langs:['fr-FR','fr-CA','en-GB','en-US'], feel:'light, elevated, refined, airy', delta:{ pitch:.45, breath:.85, vowelFlow:1.0, consonantBite:-.35, formality:.75, inflection:.55, accentColor:1.0 } },
      rootmere_cant: { name:'Rootmere Cant', fantasy:'Deep Forest / German', langs:['de-DE','de-AT','en-GB','en-US'], feel:'dense, structured, rooted, authoritative', delta:{ consonantBite:1.0, formality:.75, clarity:.5, throatDepth:.45, rhythm:-.2, accentColor:1.0 } },
      bramblewood_burr: { name:'Bramblewood Burr', fantasy:'Hybrid Tree + Forest Floor / English West Country', langs:['en-GB','en-IE','en-US'], feel:'rustic, layered, grounded, woodland', delta:{ warmth:.9, vowelFlow:.65, rhythm:.45, resonance:.35, formality:-.3, accentColor:.75 } },
      ironstep_cant: { name:'Ironstep Cant', fantasy:'Prairie / Russian', langs:['ru-RU','en-GB','en-US'], feel:'strong, wide, grounded, hardy', delta:{ resonance:1.25, roughness:.55, consonantBite:.9, formality:.65, projection:.55, speed:-.25, accentColor:1.0 } },
      cragthane_burr: { name:'Cragthane Burr', fantasy:'Mountain Range / Scottish', langs:['en-GB','en-IE','en-US'], feel:'tough, crisp, resilient', delta:{ resonance:1.35, roughness:.8, consonantBite:.6, projection:.45, speed:-.15, accentColor:.95 } },
      wavebloom_welcome: { name:'Wavebloom Welcome', fantasy:'Beach + Reefs / Hawaiian-influenced English', langs:['en-US','en-AU','en-GB'], feel:'gentle, tropical, wave-like, welcoming', delta:{ warmth:1.35, vowelFlow:1.05, rhythm:.85, consonantBite:-.35, breath:.35, pauseControl:.35, accentColor:.7 } },
      mirecurl_drawl: { name:'Mirecurl Drawl', fantasy:'Marshes + Swamps / Cajun-Creole influenced English', langs:['en-US','fr-FR','en-GB'], feel:'slow, earthy, wet, lived-in', delta:{ speed:-.55, warmth:1.0, rhythm:.75, pauseControl:.85, throatDepth:.5, vowelFlow:.7, accentColor:.8 } },
      vinesong_flow: { name:'Vinesong Flow', fantasy:'Valley / Italian', langs:['it-IT','en-GB','en-US'], feel:'flowing, fertile, elegant, soft', delta:{ vowelFlow:1.3, rhythm:.85, warmth:1.05, inflection:.85, pitch:.25, accentColor:1.0 } },
      tidecrest_cant: { name:'Tidecrest Cant', fantasy:'Ocean Surface Floating Settlement / Portuguese', langs:['pt-PT','pt-BR','en-US','en-GB'], feel:'open, rolling, maritime, lively', delta:{ vowelFlow:1.1, rhythm:.6, warmth:.75, projection:.25, breath:.25, accentColor:1.0 } }
    });

    const RACE_DELTAS = Object.freeze({
      Human:{ clarity:.3, accentColor:-.1 }, 'High Elf':{ breath:.7, vowelFlow:.65, roughness:-.45, formality:.5, inflection:.35 },
      Drow:{ throatDepth:.65, breath:.25, projection:-.35, warmth:-.15 }, Duergar:{ resonance:1.0, roughness:.6, speed:-.3, throatDepth:.5 },
      Kender:{ pitch:.7, speed:.45, rhythm:.8, warmth:.8, humanVariation:.45 }, Hobgoblin:{ consonantBite:.9, formality:.5, projection:.75, emphasis:.4 },
      Goliath:{ pitch:-.35, resonance:1.6, projection:.7, speed:-.2, throatDepth:.6 }, Dragonborn:{ throatDepth:1.2, roughness:1.1, resonance:.9, pitch:-.2, projection:.5 },
      Hexblood:{ breath:.8, inflection:.65, warmth:.2, pauseControl:.35 }, Dhampir:{ breath:1.15, throatDepth:.75, warmth:-.15, pauseControl:.6 },
      Satyr:{ rhythm:1.0, inflection:1.15, warmth:.8, pitch:.35 }, 'Fire Genasi':{ warmth:1.25, projection:.5, roughness:.45, inflection:.35 },
      Warforged:{ humanVariation:-1.2, resonance:1.0, clarity:.9, pauseControl:.5, formality:.5 }, Tabaxi:{ speed:.35, clarity:.5, breath:.3, rhythm:.55, warmth:.35 }
    });

    const CLASS_DELTAS = Object.freeze({
      Bard:{ inflection:1.0, rhythm:.6, emphasis:.45, formality:.2, warmth:.25 }, Wizard:{ formality:1.0, clarity:.85, speed:-.1, consonantBite:.25 },
      Rogue:{ speed:.45, projection:-.55, pauseControl:-.25, consonantBite:.4, breath:.2 }, Artificer:{ clarity:.75, formality:.8, humanVariation:-.2, pauseControl:.25 },
      Ranger:{ rhythm:.5, warmth:.4, clarity:.2, projection:.1 }, Fighter:{ emphasis:.8, projection:.8, pauseControl:-.2, consonantBite:.3 },
      Barbarian:{ roughness:1.45, projection:1.2, emphasis:1.0, formality:-.6, resonance:.6 }, Paladin:{ formality:.8, projection:1.1, emphasis:1.0, clarity:.25 },
      Warlock:{ inflection:.8, breath:.5, pauseControl:.45, throatDepth:.25 }, 'Blood Hunter':{ roughness:.7, throatDepth:.7, emphasis:.5, pauseControl:.25 },
      Sorcerer:{ inflection:.8, warmth:.7, projection:.35, humanVariation:.3 }, Cleric:{ warmth:.8, formality:.7, pauseControl:.6, clarity:.4 },
      Monk:{ speed:-.1, clarity:.7, projection:-.2, pauseControl:.5, breath:.2 }
    });

    const GENDER_DELTAS = Object.freeze({
      'Gender-Flexible':{ inflection:.3, humanVariation:.4 }, 'Demi-Female':{ pitch:.2, warmth:.3, clarity:.1 }, 'Non-Binary':{ resonance:.1, humanVariation:.1 },
      'Gender-Less':{ humanVariation:-.45, formality:.35 }, 'Bi-Gender':{ inflection:.55, pitch:.2, humanVariation:.35 }, 'Cis-Male':{ resonance:.4, pitch:-.2 },
      'Trans-Male':{ resonance:.5, warmth:.3, pitch:-.1 }, 'Poly-Gender':{ inflection:.6, humanVariation:.5, warmth:.2 }, Agender:{ formality:.2, humanVariation:-.1 },
      'Trans-Female':{ warmth:.4, breath:.2, pitch:.15 }, 'Gender-Fluid':{ inflection:.6, rhythm:.3, humanVariation:.45 }, 'Demi-Male':{ resonance:.25, pitch:-.05 },
      Neutrois:{ formality:.2, humanVariation:-.15 }, 'Cis-Female':{ pitch:.3, warmth:.2, clarity:.1 }
    });

    const EMOTIONS = Object.freeze({
      neutral:{ label:'Neutral / Base', delta:{} },
      commanding:{ label:'Commanding', delta:{ projection:1.7, emphasis:1.2, formality:.7, consonantBite:.7, pauseControl:-.2, speed:.15 } },
      fearful:{ label:'Fearful', delta:{ pitch:1.0, speed:.55, stutter:1.3, breath:1.1, projection:-.5, pauseControl:-.35, clarity:-.35 } },
      caring:{ label:'Caring', delta:{ warmth:1.5, breath:.55, speed:-.35, emphasis:-.25, pauseControl:.55, roughness:-.25 } },
      compassionate:{ label:'Compassionate', delta:{ warmth:1.9, breath:.7, speed:-.45, pauseControl:.85, projection:-.2, clarity:.3, inflection:.35 } },
      boisterous:{ label:'Boisterous', delta:{ projection:1.7, rhythm:1.2, emphasis:1.2, speed:.35, warmth:.6, humanVariation:.4 } },
      drunk:{ label:'Drunk', delta:{ speed:-1.0, clarity:-1.6, stutter:1.5, pauseControl:1.0, rhythm:.9, pitch:-.2, humanVariation:1.3 } },
      angry:{ label:'Angry', delta:{ roughness:1.3, projection:1.0, emphasis:1.0, warmth:-.7, consonantBite:.8, speed:.2 } },
      rage:{ label:'Rage', delta:{ roughness:2.0, projection:1.8, emphasis:1.6, speed:.45, clarity:-.5, consonantBite:1.0 } },
      tender:{ label:'Tenderness', delta:{ warmth:1.4, breath:1.0, speed:-.65, projection:-.7, pauseControl:.8, roughness:-.45 } },
      sarcastic:{ label:'Sarcasm', delta:{ inflection:1.2, emphasis:.45, warmth:-.25, speed:-.05, clarity:.35, rhythm:.45 } },
      suspicious:{ label:'Suspicion', delta:{ projection:-.65, speed:-.25, pauseControl:.45, consonantBite:.55, throatDepth:.35, warmth:-.35 } },
      gruff:{ label:'Gruffness', delta:{ roughness:1.6, throatDepth:1.0, resonance:.8, pitch:-.45, warmth:-.2, clarity:-.25 } },
      grief:{ label:'Grief', delta:{ speed:-.85, pitch:-.35, breath:1.1, pauseControl:1.3, projection:-.5, warmth:.2 } },
      panic:{ label:'Panic', delta:{ pitch:1.2, speed:1.0, stutter:1.8, breath:1.4, pauseControl:-.8, clarity:-.7 } },
      courage:{ label:'Courage', delta:{ projection:.9, emphasis:.7, warmth:.7, clarity:.4, pauseControl:.25, resonance:.45 } },
      awe:{ label:'Awe', delta:{ breath:.9, pauseControl:.9, inflection:.75, speed:-.45, warmth:.6, projection:-.1 } },
      flirtation:{ label:'Flirtation', delta:{ warmth:1.0, inflection:1.0, speed:-.25, breath:.55, vowelFlow:.45, rhythm:.35 } },
      menace:{ label:'Menace', delta:{ pitch:-.65, speed:-.55, throatDepth:1.1, roughness:.8, pauseControl:.85, warmth:-.8, projection:.2 } },
      wonder:{ label:'Wonder', delta:{ pitch:.6, inflection:1.0, breath:.6, warmth:.8, speed:-.2, pauseControl:.55 } },
      exhausted:{ label:'Exhaustion', delta:{ speed:-1.1, breath:1.2, projection:-1.0, clarity:-.65, pauseControl:1.2, pitch:-.3 } },
      ritual:{ label:'Ritual / Sacred', delta:{ formality:1.0, pauseControl:1.0, resonance:.6, speed:-.5, clarity:.55, emphasis:.45 } },
      boss:{ label:'Boss Battle', delta:{ projection:1.5, roughness:.8, emphasis:1.2, speed:.2, resonance:.8, clarity:.35 } },
      weapon:{ label:'Weapon Attack', delta:{ speed:.65, projection:1.0, emphasis:1.1, consonantBite:.8, pauseControl:-.5, roughness:.45 } }
    });

    const NPCS = Object.freeze([
      { key:'joeari', initials:'JR', name:'Joeari Ravenwood', pronounce:'jo-ARE-ee RAY-ven-wood', race:'Human', klass:'Bard', gender:'Gender-Flexible', alignment:'Neutral Good', biome:'Deep cavern', accent:'Welsh', modelKey:'stonehollow_echo', sample:'Every story has a weight. If danger comes, place it on my shoulders first.', bio:'Solemn, protective College of Spirits bard. Clear Welsh cavern voice, ritualistic cadence, blunt compassion, and grave-vow tenderness.' },
      { key:'gheaririel', initials:'GL', name:'Ghearir’iel Luneglen', pronounce:'GHEH-ree-ree-EL LOO-neh-glen', race:'High Elf', klass:'Wizard', gender:'Demi-Female', alignment:'Lawful Good', biome:'Treetops / treehouses', accent:'French', modelKey:'highbranch_lilt', sample:'Precision is kindness when a careless spell could cost a life.', bio:'Exacting High Elf bladesinger. Airy French treetop voice, polished softness, crisp wizard precision, and a dry blade of humor.' },
      { key:'thalenael', initials:'TS', name:'Thalenael Silverthorn', pronounce:'thal-eh-NAY-el SIL-ver-thorn', race:'Drow', klass:'Rogue', gender:'Non-Binary', alignment:'Lawful Neutral', biome:'Deep forest', accent:'German', modelKey:'rootmere_cant', sample:'I did not touch the rune. I assessed the rune. The explosion was unrelated.', bio:'High-strung Drow Phantom Rogue. Quiet German forest voice, hushed speed, formal panic, device brilliance, and suspicious precision.' },
      { key:'nimudri', initials:'NI', name:'Nimu’dri Ironvault', pronounce:'nih-MOO-dree EYE-ron-vault', race:'Duergar', klass:'Artificer', gender:'Gender-Less', alignment:'Lawful Neutral', biome:'Deep cavern', accent:'Welsh', modelKey:'stonehollow_echo', sample:'Stand behind the marked line. I marked it for a reason.', bio:'Guarded Duergar Armorer. Heavy Welsh cavern voice, dense subterranean resonance, practical warnings, and protective containment logic.' },
      { key:'rosabin', initials:'RM', name:'Ro’sabin Merryroot', pronounce:'roh-SAH-bin MERR-ee-root', race:'Kender', klass:'Ranger', gender:'Bi-Gender', alignment:'Chaotic Good', biome:'Hybrid tree and forest floor', accent:'English West Country', modelKey:'bramblewood_burr', sample:'Hope is a tool, dear heart. Sharpen it, hide it, and carry it into the dark.', bio:'Bright Kender Fey Wanderer. Warm West Country woodland voice, playful courage, quick curiosity, and rebellion tucked among roots.' },
      { key:'urg', initials:'UM', name:'Urg-U’rgugar Mudgrip', pronounce:'URG-oo-urg-GOO-gar MUD-grip', race:'Hobgoblin', klass:'Fighter', gender:'Cis-Male', alignment:'Lawful Neutral', biome:'Prairie', accent:'Russian', modelKey:'ironstep_cant', sample:'Measure the exits before you speak of victory.', bio:'Disciplined Hobgoblin Battle Master. Russian prairie voice, clipped martial strategy, stern command weight, and controlled ambition.' },
      { key:'valk', initials:'VT', name:'Valk-Minoorvar Thunderheft', pronounce:'vahlk mih-NOR-var THUN-der-heft', race:'Goliath', klass:'Barbarian', gender:'Trans-Male', alignment:'Neutral Good', biome:'Mountain range', accent:'Scottish', modelKey:'cragthane_burr', sample:'I have buried enough mistakes. I will not bury another friend.', bio:'Brooding Goliath Storm Herald. Scottish mountain voice, thunder-deep bursts, hard-earned vulnerability, and grim protective loyalty.' },
      { key:'kethazzun', initials:'KC', name:'Kethazzun Clawcoil', pronounce:'keh-THAZ-zun CLAW-koyl', race:'Dragonborn', klass:'Paladin', gender:'Poly-Gender', alignment:'Chaotic Good', biome:'Beach and reefs with water', accent:'Hawaiian-influenced English', modelKey:'wavebloom_welcome', sample:'Fear is not your master. Break its crown and walk free.', bio:'Untamed Dragonborn Conquest Paladin. Wave-like reef voice roughened by draconic command, ceremonial defiance, and fierce loyalty.' },
      { key:'veyielven', initials:'VA', name:'Veyielven Asharchf', pronounce:'vay-EE-el-ven ash-ARF', race:'Hexblood', klass:'Warlock', gender:'Agender', alignment:'Neutral Good', biome:'Treetops / treehouses', accent:'French', modelKey:'highbranch_lilt', sample:'A bargain is a doorway. Read the thorns before you step through.', bio:'Calm Hexblood Archfey Warlock. Graceful French treetop voice with thorn-soft otherworldliness, quiet leadership, and careful warnings.' },
      { key:'nefumlith', initials:'ND', name:'Nefumlith Duskendirge', pronounce:'neh-FEWM-lith DUSK-en-dirj', race:'Dhampir', klass:'Blood Hunter', gender:'Trans-Female', alignment:'Chaotic Good', biome:'Marshes and swamps', accent:'Louisiana Cajun / Creole-influenced English', modelKey:'mirecurl_drawl', sample:'The dark knows my name. That does not mean it owns me.', bio:'Haunted Dhampir Ghostslayer. Breath-wet swamp voice, restrained intensity, fierce independence, and heroic refusal of inherited darkness.' },
      { key:'tyrylina', initials:'TM', name:'Tyrylina Mirthwink', pronounce:'tie-rih-LEE-nah MIRTH-wink', race:'Satyr', klass:'Bard', gender:'Gender-Fluid', alignment:'Neutral Good', biome:'Valley', accent:'Italian', modelKey:'vinesong_flow', sample:'Give me one honest note, and I can change the whole room around it.', bio:'Magnetic Satyr Glamour Bard. Musical Italian valley voice, theatrical warmth, disciplined charm, and compassion wrapped in applause.' },
      { key:'stoneudor', initials:'SS', name:'Sto’neudor Stormbreath', pronounce:'stoh-noo-DOR STORM-breath', race:'Fire Genasi', klass:'Sorcerer', gender:'Demi-Male', alignment:'Chaotic Good', biome:'Ocean surface floating settlement', accent:'Portuguese', modelKey:'tidecrest_cant', sample:'A cage with a pretty name is still a cage. Burn the lock.', bio:'Focused Fire Genasi Draconic Sorcerer. Warm Portuguese maritime voice, ember-hot restraint, rebel calm, and old fire under every breath.' },
      { key:'arcorven', initials:'AB', name:'Arcorven Brasslock', pronounce:'AR-kor-ven BRASS-lock', race:'Warforged', klass:'Cleric', gender:'Neutrois', alignment:'Neutral Good', biome:'Deep cavern', accent:'Welsh', modelKey:'stonehollow_echo', sample:'Repair is holy work. So is mercy, when it is still possible.', bio:'Gentle Warforged Forge Cleric. Metallic Welsh cavern voice, measured faith, anxious bravery, and a conscience built like steel.' },
      { key:'canielina', initials:'CD', name:'Canielina Dennose', pronounce:'kah-nee-eh-LEE-nah den-NOSE', race:'Tabaxi', klass:'Monk', gender:'Cis-Female', alignment:'Neutral Good', biome:'Deep forest', accent:'German', modelKey:'rootmere_cant', sample:'Every ruin is still speaking. We should listen before we strike.', bio:'Curious Tabaxi Shadow Monk. Agile German forest voice, controlled warmth, quiet observation, and scholar-pilgrim compassion.' }
    ]);

    let selectedNpc = NPCS[0];
    let availableVoices = [];
    let isPaused = false;
    let activeAudio = null;

    const $ = (id) => document.getElementById(id);
    const clamp = (v,min=0,max=10) => Math.max(min, Math.min(max, Number.isFinite(v) ? v : 0));
    const round = (v, d=2) => Number.parseFloat(v).toFixed(d).replace(/\.00$/,'');

    function addDelta(profile, delta = {}, weight = 1) {
      for (const [k,v] of Object.entries(delta)) {
        if (typeof profile[k] === 'number') profile[k] = clamp(profile[k] + v * weight, 0, 10);
      }
      return profile;
    }

    function baseProfileForNpc(npc, influenceOverride = null) {
      const p = JSON.parse(JSON.stringify(DEFAULT_PROFILE));
      if (influenceOverride) Object.assign(p, influenceOverride);
      const model = VOICE_MODELS[npc.modelKey];
      addDelta(p, model.delta, p.influenceBiome);
      addDelta(p, RACE_DELTAS[npc.race], p.influenceRace);
      addDelta(p, CLASS_DELTAS[npc.klass], p.influencePersonality);
      addDelta(p, GENDER_DELTAS[npc.gender], p.influenceGender);
      return p;
    }

    function applyEmotion(profile) {
      const key = $('emotionSelect').value || 'neutral';
      const intensity = Number($('emotionStrength').value || 75) / 100;
      profile.emotionIntensity = intensity;
      addDelta(profile, EMOTIONS[key].delta, intensity);
      return profile;
    }

    function readProfileFromSliders() {
      const p = {};
      for (const [,key] of CORE_SLIDERS) p[key] = Number(document.querySelector(`[data-slider="${key}"]`).value);
      for (const [,key] of INFLUENCE_SLIDERS) p[key] = Number(document.querySelector(`[data-slider="${key}"]`).value) / 100;
      p.emotionIntensity = Number($('emotionStrength').value || 75) / 100;
      return p;
    }

    function resolvedProfile() {
      const p = readProfileFromSliders();
      return applyEmotion(p);
    }

    function profileToInternal(profile, npc) {
      return {
        npc: npc.name,
        selectedVoiceModel: VOICE_MODELS[npc.modelKey].name,
        biome: npc.biome,
        accent: npc.accent,
        f0SemitoneShift: Math.round((profile.pitch - 5) * 2.4 * 10) / 10,
        pitchRange: round(0.55 + profile.inflection / 8, 2),
        speechRate: round(0.55 + profile.speed / 7.2, 2),
        pauseDensity: round(profile.pauseControl / 10, 2),
        breathNoiseMix: round(profile.breath / 10, 2),
        roughnessAmount: round(profile.roughness / 10, 2),
        formantShift: round((profile.resonance - 5) / 5, 2),
        articulationPrecision: round(profile.clarity / 10, 2),
        nasality: round(profile.nasality / 10, 2),
        projection: round(profile.projection / 10, 2),
        warmth: round(profile.warmth / 10, 2),
        humanVariation: round(profile.humanVariation / 10, 2),
        accentStrength: round(profile.accentColor / 10, 2),
        influences: {
          race: round(profile.influenceRace, 2), gender: round(profile.influenceGender, 2),
          personality: round(profile.influencePersonality, 2), biome: round(profile.influenceBiome, 2),
          baseAudio: round(profile.influenceBaseAudio, 2), emotion: round(profile.emotionIntensity, 2)
        }
      };
    }

    function renderNpcList() {
      const q = $('npcSearch').value.trim().toLowerCase();
      const list = $('npcList');
      list.innerHTML = '';
      NPCS.filter(npc => !q || [npc.name,npc.biome,npc.accent,npc.race,npc.klass,npc.gender,VOICE_MODELS[npc.modelKey].name].join(' ').toLowerCase().includes(q))
        .forEach(npc => {
          const div = document.createElement('button');
          div.type = 'button';
          div.className = 'npc-card' + (npc.key === selectedNpc.key ? ' active' : '');
          div.innerHTML = `<div class="avatar">${npc.initials}</div><div><div class="npc-name">${npc.name}</div><div class="npc-meta">${VOICE_MODELS[npc.modelKey].name} · ${npc.accent}<br>${npc.biome}</div></div>`;
          div.addEventListener('click', () => selectNpc(npc));
          list.appendChild(div);
        });
    }

    function renderSelected() {
      const npc = selectedNpc;
      const model = VOICE_MODELS[npc.modelKey];
      $('bigAvatar').textContent = npc.initials;
      $('npcName').textContent = npc.name;
      $('npcPronounce').textContent = npc.pronounce;
      $('npcBio').textContent = npc.bio;
      $('modelName').textContent = `${model.name} — ${model.fantasy}`;
      $('modelDetails').textContent = `Locked single model for this NPC. Feel: ${model.feel}. Preferred browser voices: ${model.langs.join(', ')}.`;
      $('npcTags').innerHTML = [npc.race, npc.klass, npc.gender, npc.alignment, npc.biome, npc.accent].map(t => `<span class="tag">${t}</span>`).join('');
      updateParamBox();
    }

    function makeSlider(label, key, min, max, step, value, scalePercent = false) {
      const wrap = document.createElement('div');
      wrap.className = 'slider';
      const outValue = scalePercent ? Math.round(value * 100) : value;
      wrap.innerHTML = `<label for="sl_${key}">${label}</label><output id="out_${key}">${outValue}${scalePercent ? '%' : ''}</output><input id="sl_${key}" data-slider="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${outValue}">`;
      const input = wrap.querySelector('input');
      const output = wrap.querySelector('output');
      input.addEventListener('input', () => {
        output.textContent = `${input.value}${scalePercent ? '%' : ''}`;
        if (key === 'emotionIntensity') $('emotionStrength').value = input.value;
        updateParamBox();
      });
      return wrap;
    }

    function buildSliders() {
      $('coreSliders').innerHTML = '';
      $('influenceSliders').innerHTML = '';
      const p = baseProfileForNpc(selectedNpc);
      CORE_SLIDERS.forEach(([label,key,min,max,step]) => $('coreSliders').appendChild(makeSlider(label,key,min,max,step,Number(p[key]).toFixed(1))));
      INFLUENCE_SLIDERS.forEach(([label,key,min,max,step]) => $('influenceSliders').appendChild(makeSlider(label,key,min,max,step,p[key],true)));
      $('emotionStrength').value = Math.round(DEFAULT_PROFILE.emotionIntensity * 100);
      const emotionSlider = document.querySelector('[data-slider="emotionIntensity"]');
      const emotionOut = $('out_emotionIntensity');
      if (emotionSlider && emotionOut) {
        emotionSlider.value = $('emotionStrength').value;
        emotionOut.textContent = $('emotionStrength').value + '%';
      }
    }

    function resetToNpcModel() {
      const currentInfluences = {};
      for (const [,key] of INFLUENCE_SLIDERS) {
        const node = document.querySelector(`[data-slider="${key}"]`);
        currentInfluences[key] = node ? Number(node.value) / 100 : DEFAULT_PROFILE[key];
      }
      const p = baseProfileForNpc(selectedNpc, currentInfluences);
      CORE_SLIDERS.forEach(([,key]) => {
        const node = document.querySelector(`[data-slider="${key}"]`);
        const out = $(`out_${key}`);
        if (node && out) { node.value = Number(p[key]).toFixed(1); out.textContent = node.value; }
      });
      updateParamBox();
    }

    function renderEmotionOptions() {
      $('emotionSelect').innerHTML = Object.entries(EMOTIONS).map(([key,e]) => `<option value="${key}">${e.label}</option>`).join('');
      $('emotionSelect').value = 'neutral';
    }

    function selectNpc(npc) {
      selectedNpc = npc;
      window.speechSynthesis.cancel();
      if (activeAudio) { activeAudio.pause(); activeAudio = null; }
      buildSliders();
      renderSelected();
      renderNpcList();
      setStatus(`${npc.name} loaded with locked model: ${VOICE_MODELS[npc.modelKey].name}.`, 'good');
    }

    function setStatus(msg, tone = '') {
      const el = $('status');
      el.textContent = msg;
      el.className = 'status ' + tone;
    }

    function loadVoices() {
      availableVoices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
      const lines = availableVoices.slice(0, 60).map(v => `${v.name} (${v.lang})`).join('<br>');
      $('voiceList').innerHTML = availableVoices.length ? `<strong>${availableVoices.length} browser voices found.</strong><br>${lines}` : 'No browser voices reported yet. Click Speak once or install system voices if speech is silent.';
    }

    function chooseVoice(model, profile) {
      if (!availableVoices.length) loadVoices();
      const preferred = profile.accentColor < 2.5 || profile.influenceBiome < .25 ? ['en-US','en-GB'] : model.langs;
      for (const lang of preferred) {
        const exact = availableVoices.find(v => v.lang.toLowerCase() === lang.toLowerCase());
        if (exact) return exact;
        const prefix = availableVoices.find(v => v.lang.toLowerCase().startsWith(lang.slice(0,2).toLowerCase()));
        if (prefix) return prefix;
      }
      return availableVoices.find(v => /^en-/i.test(v.lang)) || availableVoices[0] || null;
    }

    function maybeStutterWord(word, amount, index) {
      if (amount < 3.5 || word.length < 4 || index % Math.max(2, Math.round(10 - amount)) !== 0) return word;
      const clean = word.replace(/^[^a-zA-Z]+|[^a-zA-Z]+$/g,'');
      if (!clean) return word;
      const first = clean.slice(0,1);
      return `${first}-${word}`;
    }

    function shapeText(text, profile, emotionKey) {
      let t = String(text || '').trim();
      if (!t) t = selectedNpc.sample;
      const words = t.split(/\s+/).map((w,i) => maybeStutterWord(w, profile.stutter, i));
      t = words.join(' ');
      if (profile.pauseControl > 7) t = t.replace(/([,;:])\s*/g, '$1 ... ').replace(/\.\s+/g, '. ... ');
      if (profile.pauseControl < 3) t = t.replace(/[,;:]\s*/g, ' ');
      if (profile.emphasis > 7) t = t.replace(/\b(never|always|must|danger|protect|fight|run|stop|free|mercy|oath|fear|fire|dark)\b/gi, '$1!');
      if (profile.clarity < 3.5) t = t.replace(/\s+/g, ' ... ');
      if (emotionKey === 'drunk') t = t.replace(/\b(and|the|a|to|for)\b/gi, '$1—').replace(/[.!?]$/,'... hic.');
      if (emotionKey === 'ritual' && !/^by\b/i.test(t)) t = 'By oath and echo, ' + t;
      if (emotionKey === 'commanding' && !/[.!?]$/.test(t)) t += '!';
      return t;
    }

    async function tryBackendSynthesis(payload) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4200);
      try {
        const res = await fetch(BACKEND_URL, {
          method:'POST', mode:'cors', cache:'no-store', signal:controller.signal,
          headers:{ 'Content-Type':'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
        clearTimeout(timer);
        if (!res.ok) return null;
        const data = await res.json().catch(() => null);
        return data || null;
      } catch (err) {
        clearTimeout(timer);
        return null;
      }
    }

    function browserSpeak(text, profile) {
      if (!('speechSynthesis' in window)) {
        setStatus('This browser does not expose speechSynthesis. The profile can still be exported as JSON.', 'bad');
        return;
      }
      window.speechSynthesis.cancel();
      if (activeAudio) { activeAudio.pause(); activeAudio = null; }
      loadVoices();
      const model = VOICE_MODELS[selectedNpc.modelKey];
      const emotionKey = $('emotionSelect').value || 'neutral';
      const shaped = shapeText(text, profile, emotionKey);
      const utterance = new SpeechSynthesisUtterance(shaped);
      const voice = chooseVoice(model, profile);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = model.langs[0] || 'en-US';
      }
      utterance.pitch = clamp(.52 + profile.pitch / 7.5, .1, 2);
      utterance.rate = clamp(.48 + profile.speed / 7.0, .1, 2);
      utterance.volume = clamp(.25 + profile.projection / 13, .05, 1);
      utterance.onstart = () => setStatus(`Speaking as ${selectedNpc.name} using ${model.name}${voice ? ` via ${voice.name} (${voice.lang})` : ''}.`, 'good');
      utterance.onerror = (e) => setStatus(`Browser speech error: ${e.error || 'unknown'}. Try another installed system voice.`, 'bad');
      utterance.onend = () => setStatus(`Finished ${selectedNpc.name}'s line.`, '');
      window.speechSynthesis.speak(utterance);
    }

    async function speak() {
      const profile = resolvedProfile();
      const model = VOICE_MODELS[selectedNpc.modelKey];
      const text = $('speechText').value || selectedNpc.sample;
      const internal = profileToInternal(profile, selectedNpc);
      const payload = {
        action:'npcVoiceSynthesize', source:'Universal_NPC_Voice_Lab', npc:selectedNpc.key,
        npcName:selectedNpc.name, voiceModel:model.name, biome:selectedNpc.biome, accent:selectedNpc.accent,
        emotion:$('emotionSelect').value, text, profile, internal
      };
      setStatus('Trying locked backend hook, with instant browser fallback if unavailable...', '');
      const backend = await tryBackendSynthesis(payload);
      if (backend && backend.audioBase64) {
        const mime = backend.mimeType || 'audio/mpeg';
        activeAudio = new Audio(`data:${mime};base64,${backend.audioBase64}`);
        activeAudio.onended = () => setStatus(`Finished backend audio for ${selectedNpc.name}.`, 'good');
        activeAudio.onerror = () => browserSpeak(backend.text || text, profile);
        activeAudio.play().then(() => setStatus(`Speaking as ${selectedNpc.name} through backend audio.`, 'good')).catch(() => browserSpeak(backend.text || text, profile));
      } else if (backend && backend.audioUrl) {
        activeAudio = new Audio(backend.audioUrl);
        activeAudio.onended = () => setStatus(`Finished backend audio for ${selectedNpc.name}.`, 'good');
        activeAudio.onerror = () => browserSpeak(backend.text || text, profile);
        activeAudio.play().then(() => setStatus(`Speaking as ${selectedNpc.name} through backend audio.`, 'good')).catch(() => browserSpeak(backend.text || text, profile));
      } else {
        browserSpeak((backend && backend.text) || text, profile);
      }
    }

    function updateParamBox() {
      try {
        const p = resolvedProfile();
        const internal = profileToInternal(p, selectedNpc);
        $('paramBox').textContent = JSON.stringify(internal, null, 2);
      } catch (err) {
        $('paramBox').textContent = 'Profile will appear after sliders finish loading.';
      }
    }

    function exportProfile() {
      const p = resolvedProfile();
      const model = VOICE_MODELS[selectedNpc.modelKey];
      const data = {
        exportedAt: new Date().toISOString(),
        app:'Universal NPC Voice Model Lab',
        npc:selectedNpc,
        selectedSingleVoiceModel:{ key:selectedNpc.modelKey, ...model },
        emotion:$('emotionSelect').value,
        voiceProfile:p,
        internalParameters:profileToInternal(p, selectedNpc),
        typedText:$('speechText').value
      };
      const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedNpc.key}_${selectedNpc.modelKey}_voice_profile.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus(`Exported ${selectedNpc.name}'s voice profile JSON.`, 'good');
    }

    function init() {
      renderEmotionOptions();
      buildSliders();
      renderNpcList();
      renderSelected();
      loadVoices();
      if ('speechSynthesis' in window) window.speechSynthesis.onvoiceschanged = () => { loadVoices(); updateParamBox(); };

      $('npcSearch').addEventListener('input', renderNpcList);
      $('emotionSelect').addEventListener('change', updateParamBox);
      $('emotionStrength').addEventListener('input', () => {
        const node = document.querySelector('[data-slider="emotionIntensity"]');
        const out = $('out_emotionIntensity');
        if (node) node.value = $('emotionStrength').value;
        if (out) out.textContent = $('emotionStrength').value + '%';
        updateParamBox();
      });
      $('speakBtn').addEventListener('click', speak);
      $('stopBtn').addEventListener('click', () => { window.speechSynthesis.cancel(); if (activeAudio) { activeAudio.pause(); activeAudio = null; } isPaused = false; setStatus('Stopped.', ''); });
      $('pauseBtn').addEventListener('click', () => {
        if (activeAudio) { activeAudio.paused ? activeAudio.play() : activeAudio.pause(); return; }
        if (!('speechSynthesis' in window)) return;
        if (window.speechSynthesis.speaking && !isPaused) { window.speechSynthesis.pause(); isPaused = true; setStatus('Paused browser speech.', ''); }
        else { window.speechSynthesis.resume(); isPaused = false; setStatus('Resumed browser speech.', ''); }
      });
      $('sampleBtn').addEventListener('click', () => { $('speechText').value = selectedNpc.sample; setStatus('NPC sample loaded into the speech box.', ''); });
      $('randomEmotionBtn').addEventListener('click', () => {
        const keys = Object.keys(EMOTIONS).filter(k => k !== 'neutral');
        $('emotionSelect').value = keys[Math.floor(Math.random() * keys.length)];
        updateParamBox();
        setStatus(`Emotion set to ${EMOTIONS[$('emotionSelect').value].label}.`, 'good');
      });
      $('resetBtn').addEventListener('click', resetToNpcModel);
      $('exportBtn').addEventListener('click', exportProfile);
      document.addEventListener('visibilitychange', () => { if (document.hidden && 'speechSynthesis' in window) window.speechSynthesis.cancel(); });
    }

    init();
  })();
  