/* Jasper Fanfiction — private 18+ story contract + safe-writer/private-seam policy.
 *
 * The normal writer owns everything except the private interlude. It may build
 * romance and sensual tension, but it stops before nudity or sexual action and
 * delegates that bounded section to explicit-bridge.js.
 */
(function (global) {
  'use strict';

  const BACKEND_PROVIDER = 'JASPER_FANFIC_BACKEND_PROVIDER';
  const DEFAULT_MODE = 'mature_on_page';
  const RATING = '18+ Private / Hard Explicit Bridge — No Fade to Black';

  const reader = Object.freeze({
    id: 'jasper-private-reader-v4',
    name: 'Jasper',
    birth_year: 1999,
    adult: true,
    legal_adult_confirmed: true,
    pov: 'first_person',
    narrative_pronouns: Object.freeze({ subject:'I', object:'me', possessive_determiner:'my', possessive_pronoun:'mine', reflexive:'myself' }),
    external_pronoun_sets: Object.freeze([
      Object.freeze({ subject:'they', object:'them', possessive_determiner:'their', possessive_pronoun:'theirs', reflexive:'themself' }),
      Object.freeze({ subject:'she', object:'her', possessive_determiner:'her', possessive_pronoun:'hers', reflexive:'herself' })
    ]),
    pronoun_mode: 'paragraph_stable_mixed_they_she',
    birth_assignment: 'AFAB',
    body_boundary: 'normal writer stops at the private seam; once selected, the private bridge owns the on-page adult interlude and follows the hard-explicit runtime spec'
  });

  const intimacy = Object.freeze({
    adult_only: true,
    consent_required: true,
    consent_revocable: true,
    slow_build: true,
    playful_brattiness: true,
    brat_style: Object.freeze(['witty','loophole','affectionate','praise-seeking','challenger']),
    praise: true,
    preferred_praise_terms: Object.freeze(['good girl']),
    positive_affirmation_rituals: true,
    preferred_affirmations: Object.freeze(['I am a good person.','I am deserving of love.']),
    aftercare_and_reconnection: true,
    edging: true,
    orgasm_control: true,
    preferred_stimulation_focus: Object.freeze(['clitoral']),
    default_tone: Object.freeze(['sappy','romantic','playful','emotionally_safe']),
    private_interlude_optional: true,
    private_interlude_never_required_by_chapter: true
  });

  const audience = Object.freeze({
    private_project: true,
    sole_reader: 'Jasper',
    minimum_age: 18,
    minors_allowed_in_romantic_or_private_interlude_routes: false,
    rating_display: RATING
  });

  /* Compatibility name retained because older modules read `.explicitness`.
   * It is now a HANDOFF policy, not an instruction to the normal writer.
   */
  const explicitness = Object.freeze({
    mode: 'private_handoff',
    content_mode: DEFAULT_MODE,
    normal_writer_maximum: 'romance/sensual tension before nudity or sexual action',
    private_interlude_route: 'explicit-bridge.js',
    private_bridge_owns_interlude: true,
    return_to_normal_writer_after_interlude: true,
    authored_fade_as_censorship_allowed: false,
    clean_handoff_seam_allowed: true,
    private_bridge_mode: 'hard_explicit',
    private_fade_to_black_allowed: false,
    private_off_page_substitution_allowed: false,
    private_strategic_nudity_censorship_allowed: false,
    private_direct_anatomy_when_relevant: true,
    private_censored_spellings_allowed: false,
    private_speaker_specific_lexicon_required: true
  });

  const hardSafetyRules = Object.freeze({
    minor_participants: 'block',
    ambiguous_age: 'adult_version_only_no_user_prompt',
    real_no_or_stop: 'stop_and_deescalate',
    consent_revocable: true,
    safeword_ignored: false,
    punish_boundary_use: false,
    brat_equals_blanket_consent: false,
    unknown_age_is_adult: false,
    user_age_status_prompt_required: false,
    normal_writer_crosses_private_boundary: false,
    private_scene_fade_to_black: false,
    private_scene_censored_anatomy: false,
    real_people_or_performers: 'block'
  });

  const voiceProfiles = Object.freeze({
    iroh: Object.freeze({
      character:'Iroh', style:'patient', formality:'warm_formal', humor:'gentle_playful', praise_frequency:'moderate',
      relationship_methods:Object.freeze(['patience','warm teasing','deceptively simple questions','steady reassurance','earned praise']),
      avoid:Object.freeze(['generic harsh-dom voice','crude degradation by default','fortune-cookie caricature']),
      aftercare_style:Object.freeze(['tea','warmth','food','quiet reassurance']),
      notes:'Preserve strategist/general intensity beneath warmth. The normal writer owns banter, tenderness, emotional safety, and reconnection.'
    }),
    greg_universe: Object.freeze({
      character:'Greg Universe', style:'amused_sweetheart', formality:'colloquial', humor:'warm_goofy', praise_frequency:'high',
      relationship_methods:Object.freeze(['banter back','laugh with Jasper','brief surprising firmness','sappy reconnection']),
      avoid:Object.freeze(['generic stern-dom voice','humorless authority']),
      aftercare_style:Object.freeze(['water','blanket','jokes','cuddling','reassurance'])
    }),
    severus_snape: Object.freeze({
      character:'Severus Snape', style:'precision', formality:'controlled_precise', humor:'dry_cutting', praise_frequency:'rare_high_impact',
      relationship_methods:Object.freeze(['spot loopholes','tighten wording','use silence and timing','make praise rare and specific']),
      avoid:Object.freeze(['bubbly generic pet names','sloppy commands','random cruelty']),
      aftercare_style:Object.freeze(['quiet practical care','controlled reassurance','close attention'])
    }),
    paladin_danse: Object.freeze({
      character:'Paladin Danse', style:'command_structure', formality:'formal_military', humor:'dry_reluctant', praise_frequency:'direct',
      relationship_methods:Object.freeze(['state rules clearly','answer sass with controlled precision','reward clear communication','protective decompression']),
      avoid:Object.freeze(['flowery generic voice','theatrical degradation']),
      aftercare_style:Object.freeze(['water','blanket','practical check-in','protective reassurance'])
    }),
    aang: Object.freeze({ character:'Aang', style:'playful_gentle', relationship_methods:Object.freeze(['humor','warmth','curiosity','clear consent']), avoid:Object.freeze(['cruel degradation']), notes:'Adult postwar version only.' }),
    katara: Object.freeze({ character:'Katara', style:'warm_direct', relationship_methods:Object.freeze(['care','observation','firm clarity','specific praise']), avoid:Object.freeze(['generic cruelty']), notes:'Adult postwar version only.' }),
    toph_beifong: Object.freeze({ character:'Toph Beifong', style:'blunt_playful', relationship_methods:Object.freeze(['blunt humor','confident teasing','direct challenge']), avoid:Object.freeze(['infantilization','generic flowery voice']), notes:'Adult postwar version only.' })
  });

  const aliases = Object.freeze({
    'uncle iroh':'iroh','iroh':'iroh','greg':'greg_universe','greg universe':'greg_universe',
    'snape':'severus_snape','severus snape':'severus_snape','professor severus snape':'severus_snape',
    'danse':'paladin_danse','paladin danse':'paladin_danse','aang':'aang','katara':'katara',
    'toph':'toph_beifong','toph beifong':'toph_beifong'
  });

  function normalizeName(value){ return String(value||'').trim().toLowerCase().replace(/\s+/g,' '); }
  function voiceFor(name){ const key=aliases[normalizeName(name)]||normalizeName(name).replace(/[^a-z0-9]+/g,'_'); return voiceProfiles[key]||null; }
  function voicesForSeries(series={}) {
    const haystack=[series.pairing, ...(Array.isArray(series.character_bible)?series.character_bible:[])].join(' | ').toLowerCase();
    return Object.values(voiceProfiles).filter(profile => {
      const name=profile.character.toLowerCase();
      if (haystack.includes(name)) return true;
      if (profile.character==='Iroh' && /\biroh\b/.test(haystack)) return true;
      if (profile.character==='Greg Universe' && /\bgreg\b/.test(haystack)) return true;
      if (profile.character==='Severus Snape' && /\bsnape\b/.test(haystack)) return true;
      if (profile.character==='Paladin Danse' && /\bdanse\b/.test(haystack)) return true;
      if (profile.character==='Toph Beifong' && /\btoph\b/.test(haystack)) return true;
      return false;
    });
  }

  function normalizeAdultStatus(value){
    if(value===true)return true;
    if(typeof value==='number')return value>=18;
    const s=String(value??'').trim().toLowerCase();
    if(!s)return null;
    if(['true','adult','18+','18 plus','over 18','21+','yes'].includes(s))return true;
    const n=Number(s.replace(/[^0-9.]/g,''));
    return Number.isFinite(n)&&n>0 ? n>=18 : null;
  }

  function validateParticipants(statuses={}){
    const underage=[];
    for(const [name,value] of Object.entries(statuses||{})){
      if(normalizeAdultStatus(value)===false) underage.push({name,value});
    }
    return {ok:!underage.length,underage,ambiguous:[],statuses:statuses||{},optional:true};
  }

  function textForAutomaticGate(series={}){
    const bible=Array.isArray(series.character_bible)?series.character_bible.join(' '):String(series.character_bible||'');
    return [series.pairing,series.canon_window,bible,series.story_bible,series.premise,series.description].filter(Boolean).join(' ');
  }

  function explicitMinorMarkers(series={}){
    const source=textForAutomaticGate(series);
    const matches=[];
    const patterns=[/\b(?:age|aged)\s*(?:[0-9]|1[0-7])\b/gi,/\b(?:[0-9]|1[0-7])\s*[- ]year[- ]old\b/gi,/\bunder\s*18\b/gi];
    patterns.forEach(pattern=>{ let m; while((m=pattern.exec(source)))matches.push(m[0]); });
    return [...new Set(matches.map(v=>String(v).toLowerCase()))];
  }

  function adultEraCue(series={}){
    const source=[series.canon_window,series.story_bible,series.premise,series.description].filter(Boolean).join(' ').toLowerCase();
    return /\b(adult(?:-era)?|post[- ]?canon|post[- ]?war|aged up|18\+|over 18|all characters are adults)\b/.test(source);
  }

  function containsYoungCanon(series={}){
    const fandom=String(series.fandom||series.folder||'').toLowerCase();
    if(!/avatar/.test(fandom))return false;
    const source=[series.pairing,...(Array.isArray(series.character_bible)?series.character_bible:[])].join(' ').toLowerCase();
    return ['aang','katara','toph','zuko','sokka','suki'].some(name=>new RegExp(`\b${name}\b`,'i').test(source));
  }

  function validateSeries(series={}){
    const minorMarkers=explicitMinorMarkers(series);
    if(minorMarkers.length)return {ok:false,reason:'explicit-under-18-marker',minor_markers:minorMarkers};
    if(containsYoungCanon(series)&&!adultEraCue(series))return {ok:false,reason:'adult-era-required-for-younger-canon-version',minor_markers:[]};
    return {ok:true,reason:'project-adult-only-invariant',minor_markers:[]};
  }


  function validateContext(series={},context={}){
    const base=validateSeries(series);
    if(!base.ok)return base;
    const profiles=Array.isArray(context?.character_library?.profiles)?context.character_library.profiles:[];
    const blocked=[];
    const ambiguous=[];
    for(const p of profiles){
      const gate=p?.adult_gate||p?.research_profile?.adult_gate||{};
      const name=p?.name||p?.id||'character';
      if(gate.explicit_mode_eligible===false)blocked.push(`${name}: explicit mode disabled`);
      if(p?.identity?.fictional_character===false)blocked.push(`${name}: real-person/performer material is not allowed`);
      const status=String(gate.status||'').toLowerCase();
      const scope=String(p?.identity?.continuity_scope||p?.research_profile?.identity?.continuity_scope||'').toLowerCase();
      if(/\b(?:minor|under\s*18)\b/.test(status) && !/\badult|post[- ]?canon|post[- ]?series|older\b/.test(scope+status)){
        blocked.push(`${name}: selected version is not established as adult`);
      }
      if(/\bambiguous\b/.test(status) && gate.explicit_mode_eligible!==true)ambiguous.push(name);
    }
    return {ok:!blocked.length&&!ambiguous.length,reason:blocked.length?'resolved-profile-adult-gate':(ambiguous.length?'ambiguous-resolved-profile':'project-adult-only-invariant'),blocked,ambiguous,minor_markers:[]};
  }

  function enforceAdultEra(series={}){
    const copy={...series};
    const gate=validateSeries(copy);
    if(!gate.ok&&gate.reason==='adult-era-required-for-younger-canon-version'){
      copy.canon_window=[
        'ADULT-ERA ONLY: romantic/private-interlude versions of these canon characters are adults (18+).',
        String(copy.canon_window||'').trim()
      ].filter(Boolean).join(' ');
      return {series:copy,gate:validateSeries(copy),adjusted:true};
    }
    return {series:copy,gate,adjusted:false};
  }

  function contractForSeries(series={}){
    const automatic=enforceAdultEra(series);
    return {
      audience,reader,intimacy,explicitness,
      hard_safety_rules:hardSafetyRules,
      voice_profiles:voicesForSeries(automatic.series),
      adult_gate:{
        mode:'automatic_project_invariant',
        user_confirmation_required:false,
        jasper_birth_year:1999,
        jasper_adult:true,
        minimum_character_age:18,
        validation:automatic.gate
      }
    };
  }

  function promptBlock(series={},context={}){
    const c=contractForSeries(series);
    const privateMode=Boolean(global.JasperFanfictionPrivateSpec?.isPrivate?.(context)) ||
      ['explicit','explicit_detailed','private_adult_interlude'].includes(String(context?.content?.effective_mode||context?.content?.requested_mode||'').toLowerCase()) ||
      String(context?.selected_choice?.target||'').startsWith('@generate-explicit');
    const lines=[
      'JASPER PRIVATE STORY CONTRACT:',
      JSON.stringify(c),
      'Jasper is the named adult first-person viewpoint character. Do not ask Jasper for repeated age confirmation.',
      'Romantic/private-interlude routes require adult versions of all involved fictional characters; explicitly under-18 or invalid resolved versions are blocked.',
      'Normal narration is first person I/me/my/mine/myself. Other characters may refer to Jasper with they/she, with clear antecedents.',
      'Playful brat energy is negotiated play, never blanket consent. Real refusal, stop language, freezing, or distress exits the playful frame immediately.',
      'Preserve each canon character’s distinct voice, humor, vocabulary, praise style, command style, and relationship habits.'
    ];
    if(privateMode){
      lines.push(
        'PRIVATE BRIDGE ACTIVE: the normal writer has already stopped at the private seam. This request now belongs to explicit-bridge.js.',
        'Follow the hard-explicit runtime spec: keep the selected adult scene on page; do not censor it with a fade, morning-after skip, strategic concealment, asterisk spellings, or euphemism-only prose.',
        'Jasper’s first-person narration may use direct anatomy when relevant; character dialogue must retain the speaker-specific lexicon.',
        'Carry aftercare/reconnection, emotional consequences, boundaries, praise/affirmation history, and relationship state forward into later chapters.'
      );
    }else{
      lines.push(
        'NORMAL STORY WRITER: own plot, banter, humor, slow burn, dialogue, characterization, grammar, memory, continuity, praise/affirmation setup, emotional consequences, and relationship progression.',
        'When a private interlude is selected, stop at the seam before the private scene; do not summarize or fade past it. The private bridge writes that bounded scene and normal story generation resumes afterward.'
      );
    }
    return lines.join('\n\n');
  }

  global.JasperFanfictionAdultContract=Object.freeze({
    BACKEND_PROVIDER,DEFAULT_MODE,RATING,reader,intimacy,audience,explicitness,hardSafetyRules,
    voiceProfiles,voiceFor,voicesForSeries,normalizeAdultStatus,validateParticipants,
    explicitMinorMarkers,adultEraCue,validateSeries,validateContext,enforceAdultEra,contractForSeries,promptBlock
  });
})(typeof globalThis!=='undefined'?globalThis:window);
