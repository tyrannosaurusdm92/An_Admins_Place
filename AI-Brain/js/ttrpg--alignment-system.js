/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-c. */
(function (global) {
  'use strict';

  const DEFAULT_AXES = [
    { id: 'altruism', name: 'Altruism', low: 'Selfish', neutral: 'Balanced', high: 'Altruistic', profile_axis: true },
    { id: 'lawfulness', name: 'Lawfulness', low: 'Chaotic', neutral: 'Independent', high: 'Lawful', profile_axis: true },
    { id: 'cooperation', name: 'Cooperation', low: 'Combative', neutral: 'Independent', high: 'Cooperative', profile_axis: true },
    { id: 'honor', name: 'Honor', low: 'Dishonorable', neutral: 'Situational', high: 'Honorable', profile_axis: true },
    { id: 'mercy', name: 'Mercy', low: 'Ruthless', neutral: 'Tempered', high: 'Merciful', profile_axis: false },
    { id: 'transformation', name: 'Transformation', low: 'Preservative', neutral: 'Adaptive', high: 'Transformative', profile_axis: false },
    { id: 'autonomy', name: 'Autonomy', low: 'Duty-Bound', neutral: 'Balanced', high: 'Self-Directed', profile_axis: false },
    { id: 'restraint', name: 'Restraint', low: 'Unrestrained', neutral: 'Measured', high: 'Disciplined', profile_axis: false }
  ];

  const AXES = DEFAULT_AXES.map((axis) => axis.id);
  const PROFILE_AXES = DEFAULT_AXES.filter((axis) => axis.profile_axis).map((axis) => axis.id);
  const EXPRESSION_AXES = DEFAULT_AXES.filter((axis) => !axis.profile_axis).map((axis) => axis.id);
  const CATEGORY_LABELS = Object.fromEntries(DEFAULT_AXES.map((axis) => [axis.id, { low: axis.low, neutral: axis.neutral, high: axis.high }]));

  function slug(value) {
    return String(value || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'unknown';
  }

  function clamp(value, minimum = 0, maximum = 3000, center = 1500) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, number)) : center;
  }

  function categoryFromDefinition(axis, score, minimum = 0, maximum = 3000, center = 1500) {
    const value = clamp(score, minimum, maximum, center);
    if (value <= 999) return axis.low;
    if (value >= 2000) return axis.high;
    return axis.neutral;
  }

  function category(axisId, score, axes = DEFAULT_AXES) {
    const definition = axes.find((axis) => axis.id === axisId) || DEFAULT_AXES[0];
    return categoryFromDefinition(definition, score);
  }

  function phase(score) {
    const value = clamp(score);
    if (value <= 749) return { phase: 1, name: 'Defining Low', range: '0-749' };
    if (value <= 1499) return { phase: 2, name: 'Contested Low', range: '750-1499' };
    if (value === 1500) return { phase: 0, name: 'Pivot', range: '1500' };
    if (value <= 2249) return { phase: 3, name: 'Contested High', range: '1501-2249' };
    return { phase: 4, name: 'Defining High', range: '2250-3000' };
  }

  function stepName(score) {
    const value = clamp(score);
    if (value <= 249) return 'Absolute Low';
    if (value <= 499) return 'Deep Low';
    if (value <= 749) return 'Established Low';
    if (value <= 999) return 'Low-Leaning';
    if (value <= 1249) return 'Contested Low';
    if (value <= 1499) return 'Edge Low';
    if (value === 1500) return 'Exact Pivot';
    if (value <= 1749) return 'Edge High';
    if (value <= 1999) return 'Contested High';
    if (value <= 2249) return 'High-Leaning';
    if (value <= 2499) return 'Established High';
    if (value <= 2749) return 'Deep High';
    return 'Absolute High';
  }

  function position(score, step = 250) {
    const value = clamp(score);
    const distance = Math.abs(value - 1500);
    return {
      direction: value === 1500 ? 'pivot' : (value > 1500 ? 'high' : 'low'),
      steps: Math.ceil(distance / Math.max(1, Number(step) || 250)),
      stepName: stepName(value),
      ...phase(value)
    };
  }

  function parseProfileAxes(profile, profileAxes) {
    if (profile?.axes && typeof profile.axes === 'object') return { ...profile.axes };
    const parts = String(profile?.profile || '').split(/\s*[—–|]\s*/).map((value) => value.trim()).filter(Boolean);
    return Object.fromEntries(profileAxes.map((axis, index) => [axis, parts[index]]));
  }

  function shuffled(values, rng) {
    const copy = values.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const random = rng?.random ? rng.random() : Math.random();
      const target = Math.floor(random * (index + 1));
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  class AlignmentSystem {
    constructor(data) {
      this.data = data || {};
      this.axisDefinitions = Array.isArray(this.data.axes) && this.data.axes.length === 8 ? this.data.axes : DEFAULT_AXES;
      this.axes = this.axisDefinitions.map((axis) => axis.id);
      this.profileAxes = this.axisDefinitions.filter((axis) => axis.profile_axis).map((axis) => axis.id);
      this.expressionAxes = this.axisDefinitions.filter((axis) => !axis.profile_axis).map((axis) => axis.id);
      this.minimum = 0;
      this.maximum = 3000;
      this.center = 1500;
      this.step = 250;
      this.profiles = (this.data.profiles || []).map((profile) => ({
        ...profile,
        id: profile.id || slug(profile.name),
        axes: parseProfileAxes(profile, this.profileAxes)
      }));
    }

    axisDefinition(axisId) {
      return this.axisDefinitions.find((axis) => axis.id === axisId) || DEFAULT_AXES.find((axis) => axis.id === axisId) || DEFAULT_AXES[0];
    }

    cleanScores(scores) {
      return Object.fromEntries(this.axes.map((axis) => [axis, clamp(scores?.[axis], this.minimum, this.maximum, this.center)]));
    }

    resolveScores(scores) {
      const clean = this.cleanScores(scores);
      const categories = Object.fromEntries(this.axes.map((axis) => [axis, categoryFromDefinition(this.axisDefinition(axis), clean[axis], this.minimum, this.maximum, this.center)]));
      let best = null;
      let bestDistance = Infinity;

      for (const profile of this.profiles) {
        let distance = 0;
        for (const axis of this.profileAxes) {
          const expected = profile.axes?.[axis];
          const actual = categories[axis];
          distance += expected === actual ? 0 : 1;
        }
        if (distance < bestDistance) {
          best = profile;
          bestDistance = distance;
        }
        if (distance === 0) break;
      }

      const profileLine = this.profileAxes.map((axis) => categories[axis]).join(' — ');
      const expressionLine = this.expressionAxes.map((axis) => `${this.axisDefinition(axis).name}: ${categories[axis]}`).join(' · ');
      return {
        schema: 'worldbuilder.universal.alignment-instance.v3',
        profileId: best?.id || 'neutral-adapter',
        name: best?.name || 'Neutral Adapter',
        profile: best?.profile || profileLine,
        profileLine,
        expressionLine,
        axes: categories,
        scores: clean,
        profileAxes: this.profileAxes.slice(),
        expressionAxes: this.expressionAxes.slice(),
        phases: Object.fromEntries(this.axes.map((axis) => [axis, phase(clean[axis])])),
        positions: Object.fromEntries(this.axes.map((axis) => [axis, position(clean[axis], this.step)])),
        description: best?.description || ''
      };
    }

    normalize(value) {
      if (value?.scores) return this.resolveScores(value.scores);
      return this.resolveScores(Object.fromEntries(this.axes.map((axis) => [axis, this.center])));
    }

    influenced(value, options = {}) {
      const base = this.normalize(value);
      const scores = { ...base.scores };
      const changes = [];
      const deity = options.deity || null;
      const classProfile = options.classProfile || null;
      const pressures = deity?.covenant?.pressures || deity?.alignment_covenant?.pressures || {};
      const pressureEntries = shuffled(Object.entries(pressures).filter(([, direction]) => Number(direction) !== 0), options.rng).slice(0, 3);
      for (const [axis, direction] of pressureEntries) {
        if (!this.axes.includes(axis)) continue;
        const before = scores[axis];
        scores[axis] = clamp(before + Math.sign(Number(direction)) * 250, this.minimum, this.maximum, this.center);
        if (scores[axis] !== before) changes.push({ source: 'deity covenant', axis, amount: scores[axis] - before });
      }

      const focus = classProfile?.alignment_profile?.axis_focus || classProfile?.effects?.alignmentAxes || classProfile?.axis_focus || [];
      for (const axis of shuffled([...new Set(focus)].filter((entry) => this.axes.includes(entry)), options.rng).slice(0, 2)) {
        const before = scores[axis];
        let direction = Math.sign(before - this.center);
        if (!direction) direction = Math.sign(Number(pressures[axis] || 0));
        if (!direction) continue;
        scores[axis] = clamp(before + direction * 125, this.minimum, this.maximum, this.center);
        if (scores[axis] !== before) changes.push({ source: 'class discipline', axis, amount: scores[axis] - before });
      }

      return {
        ...this.resolveScores(scores),
        baseScores: base.scores,
        influences: changes,
        covenantDeity: deity?.name || null,
        canonicalClass: classProfile?.name || classProfile?.label || null
      };
    }

    behaviorTags(value) {
      const profile = this.normalize(value);
      const axes = profile.axes;
      const tags = [];
      if (axes.altruism === 'Selfish') tags.push('self-preserving');
      if (axes.altruism === 'Altruistic') tags.push('protective');
      if (axes.lawfulness === 'Lawful') tags.push('disciplined');
      if (axes.lawfulness === 'Chaotic') tags.push('unpredictable');
      if (axes.cooperation === 'Cooperative') tags.push('coordinated', 'focus-fire');
      if (axes.cooperation === 'Combative') tags.push('aggressive');
      if (axes.honor === 'Honorable') tags.push('honorable');
      if (axes.honor === 'Dishonorable') tags.push('deceptive', 'opportunistic');
      if (axes.honor === 'Situational') tags.push('situational-honor');
      if (axes.mercy === 'Merciful') tags.push('mercy-minded', 'accepts-surrender');
      if (axes.mercy === 'Ruthless') tags.push('ruthless');
      if (axes.transformation === 'Transformative') tags.push('transformative');
      if (axes.transformation === 'Preservative') tags.push('preservative');
      if (axes.transformation === 'Adaptive') tags.push('adaptive');
      if (axes.autonomy === 'Self-Directed') tags.push('self-directed');
      if (axes.autonomy === 'Duty-Bound') tags.push('duty-bound');
      if (axes.restraint === 'Disciplined') tags.push('restrained');
      if (axes.restraint === 'Unrestrained') tags.push('unrestrained');
      if (axes.restraint === 'Measured') tags.push('measured');
      return [...new Set(tags)];
    }
  }

  global.RandomEncounterAlignment = {
    AlignmentSystem,
    AXES,
    PROFILE_AXES,
    EXPRESSION_AXES,
    CATEGORY_LABELS,
    DEFAULT_AXES,
    clamp,
    phase,
    category,
    position,
    stepName,
    slug
  };
}(window));
