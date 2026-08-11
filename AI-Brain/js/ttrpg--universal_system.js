/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function (global) {
  "use strict";

  const LS = (global.UniversalSimulator = global.UniversalSimulator || global.LifeSimulation || {});
  global.LifeSimulation = LS;
  const runtime = global.UNIVERSAL_SYSTEM_RUNTIME || { classes: [], alignmentProfiles: [], deities: [], files: [] };
  const basePath = "json/universal_system/";
  const full = {};
  let loadPromise;

  function byId(values, id) { return (values || []).find(value => value.id === id) || null; }
  function pick(values, random) { return values?.length ? values[Math.floor((random || Math.random)() * values.length)] : null; }
  function dieSize(value) { return Number(String(value || "d8").replace(/\D/g, "")) || 8; }
  function proficiency(level) { return 2 + Math.floor((Math.max(1, level) - 1) / 4); }

  async function loadFullData() {
    if (loadPromise) return loadPromise;
    loadPromise = Promise.all((runtime.files || []).map(async file => {
      const response = await fetch(basePath + file);
      if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
      full[file.replace(/\.json$/i, "")] = await response.json();
    })).then(() => full).catch(error => {
      console.warn("Universal full rules data could not be loaded. The built-in runtime index remains available.", error);
      return full;
    });
    return loadPromise;
  }

  function createNpcProfile(options = {}) {
    const random = options.random || Math.random;
    const requestedLevel = Math.max(0, Math.min(20, Math.round(Number(options.level) || 0)));
    const classRecord = options.classId === "civilian" || requestedLevel === 0 ? null : byId(runtime.classes, options.classId) || pick(runtime.classes, random);
    const level = classRecord ? Math.max(1, requestedLevel || 8) : 0;
    const deity = options.deityId === "none" ? null : byId(runtime.deities, options.deityId) || (random() < 0.45 ? pick(runtime.deities, random) : null);
    const alignment = LS.covenantAlignment.generate({ profileId: options.alignmentProfileId, axes: options.alignmentAxes, random });
    const pb = proficiency(level || 1);
    const subclass = classRecord?.paths?.length ? pick(classRecord.paths, random) : null;
    const classPlan = classRecord ? LS.advancement.startingPlan(classRecord.id, options.secondaryClassId || null, options.startingSplit || "8/0") : null;
    if (classPlan && level !== 8) { classPlan.totalLevel = level; classPlan.primaryLevel = level; classPlan.secondaryLevel = 0; classPlan.xp = LS.advancement.thresholds()[Math.max(0, level - 1)] || 0; }
    return {
      schema: "universal.covenant-engine.npc-profile.v8",
      classId: classRecord?.id || null, className: classRecord?.name || "Civilian / unclassed",
      subclassId: subclass?.id || null, subclassName: subclass?.name || null,
      classPlan, level, hitDie: classRecord?.hitDie || "d6",
      maxHP: Math.max(1, dieSize(classRecord?.hitDie || "d6") + Math.max(0, level - 1) * Math.ceil((dieSize(classRecord?.hitDie || "d6") + 1) / 2)),
      proficiencyBonus: pb, guard: classRecord ? pb : 0, stressCapacity: 3 + pb, composure: 8 + pb, resolve: classRecord ? Math.max(3, pb + 1) : 2,
      alignmentProfileId: alignment.profileId, alignmentProfile: alignment.profileName,
      alignmentProfileDescription: alignment.profileDescription, alignmentAxes: alignment.axes, alignmentPhases: alignment.phases, alignmentAudit: alignment.audit,
      deityId: deity?.id || null, deityName: deity?.name || null, covenantResonance: deity ? 3 : null, divineClaim: deity ? 0 : null,
      ichorMaximum: classRecord ? Math.max(2, pb) : 0, classResource: classRecord?.resourceName || null,
      reputation: LS.covenantAlignment.reputation(),
      notes: "Generated from current canonical 22-class/66-subclass and eight-axis Covenant Alignment registries."
    };
  }

  function classOptions() { return runtime.classes || []; }
  function alignmentOptions() { return runtime.alignmentProfiles || []; }
  function deityOptions() { return runtime.deities || []; }
  function titleFromId(value) { return String(value || "").replace(/^theme_\d+_/, "").replace(/_hook_\d+$/, "").split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "); }
  function installPlayerSafeContent(state) {
    state.factions = state.factions || [];
    state.quests = state.quests || [];
    for (const seed of runtime.publicFactionSeeds || []) {
      const factionId = `universal-faction-${seed.id}`;
      if (state.factions.some(item => item.factionId === factionId)) continue;
      state.factions.push({ factionId, name: titleFromId(seed.id), aliases: [], goals: [seed.public_role].filter(Boolean), methods: seed.possible_relationships || [], leaderNpcIds: [], memberNpcIds: [], visibility: "public", public: { description: seed.public_role || "Player-safe Universal faction seed.", approved: true }, private: { notes: "" }, source: "universal-player-safe-rules" });
    }
    for (const hook of runtime.questHooks || []) {
      const questId = `universal-hook-${hook.id}`;
      if (state.quests.some(item => item.questId === questId)) continue;
      state.quests.push({ questId, title: `${titleFromId(hook.id)} Hook`, summary: hook.public_prompt || "Player-safe Universal quest hook.", status: "available", giverNpcIds: [], factionIds: [], objectives: [], stages: [], currentStageId: null, rewards: [], consequences: [], visibility: "public", approaches: hook.approaches || [], declinable: hook.declinable !== false, source: "universal-player-safe-rules" });
    }
    return state;
  }
  function status() {
    return { ready: true, fullDataLoaded: Object.keys(full).length === (runtime.files || []).length, classes: classOptions().length, alignments: alignmentOptions().length, deities: deityOptions().length, files: (runtime.files || []).length, eraMin: 3, eraMax: 10 };
  }

  LS.system = Object.freeze({ runtime, full, loadFullData, createNpcProfile, classOptions, alignmentOptions, deityOptions, installPlayerSafeContent, status });
  global.UniversalRules = LS.system;
  loadFullData();
})(window);
