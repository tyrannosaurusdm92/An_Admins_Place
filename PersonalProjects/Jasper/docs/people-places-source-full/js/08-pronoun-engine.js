(function(g){"use strict";const P=g.PeoplePlaces,C=P.Catalogs;
function byId(id){return C.pronouns.find(x=>x.id===id)||C.pronouns.find(x=>x.id==='they')}
function conjugate(pronoun,verb){const p=typeof pronoun==='string'?byId(pronoun):pronoun;if(!p||p.plural)return verb;const irregular={are:'is',have:'has',do:'does',go:'goes',say:'says',try:'tries',watch:'watches'};if(irregular[verb])return irregular[verb];if(/[^aeiou]y$/i.test(verb))return verb.slice(0,-1)+'ies';if(/(s|x|z|ch|sh)$/i.test(verb))return verb+'es';return verb+'s'}
function subjectSentence(person,verb,rest=''){const p=person.identity?.pronouns||byId('they');return `${p.subject} ${conjugate(p,verb)}${rest?' '+rest:''}`}
P.register('Pronouns',{byId,conjugate,subjectSentence});})(window);