(function(g){"use strict";const P=g.PeoplePlaces,U=P.Utils;
function ensure(person){person.knowledge=person.knowledge||{facts:{},people:{},places:{},topics:{}};return person.knowledge}
function learn(person,key,value,confidence=.8,source='observation'){const k=ensure(person),path=key.split('.');let node=k;while(path.length>1){const p=path.shift();node[p]=node[p]||{};node=node[p]}node[path[0]]={value,confidence:U.clamp(confidence,0,1),source,learnedAt:U.nowISO()};return node[path[0]]}
function knows(person,key){let n=ensure(person);for(const p of key.split('.')){n=n?.[p];if(n==null)return null}return n}
P.register('KnowledgeLedger',{ensure,learn,knows});})(window);