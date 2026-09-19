/* Jasper Fanfiction — fixed private reader profile. */
(function(global){'use strict';
  const profile = Object.freeze({
    id:'jasper-private-reader-v1', name:'Jasper', birth_year:1999, legal_adult_confirmed:true,
    gender:'nonbinary', pronouns:Object.freeze({subject:'they',object:'them',possessive_adjective:'their',possessive_pronoun:'theirs',reflexive:'themself'}),
    assigned_sex_at_birth:'AFAB', point_of_view:'first-person reader protagonist using I / me / my / myself',
    anatomy:Object.freeze({profile:'AFAB',chest:'chest',external_genitals:['vulva','clitoris'],internal_genitals:['vagina'],reproductive_anatomy:['uterus'],rule:'Use only anatomy established as applicable to Jasper; never infer anatomy from gender stereotypes.'}),
    privacy:'private single-reader project'
  });
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  function get(){return clone(profile);}
  function promptSummary(){return 'Reader-protagonist: Jasper, legal adult born in 1999, nonbinary, they/them when referenced by others, first-person I/me narration, AFAB anatomy. Other characters may address the protagonist as Jasper.';}
  function assertAdult(){return profile.legal_adult_confirmed===true && Number(profile.birth_year)<=new Date().getFullYear()-18;}
  global.JasperFanfictionReader=Object.freeze({profile,get,promptSummary,assertAdult});
})(typeof globalThis!=='undefined'?globalThis:window);
