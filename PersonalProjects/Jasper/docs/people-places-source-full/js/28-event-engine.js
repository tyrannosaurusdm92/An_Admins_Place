(function(g){"use strict";const P=g.PeoplePlaces,U=P.Utils;
const events=[
 {id:'good-conversation',valence:.55,arousal:.35,summary:'had a satisfying conversation',tags:['social']},
 {id:'deadline',valence:-.45,arousal:.78,summary:'felt pressure from a deadline',tags:['work']},
 {id:'quiet-evening',valence:.45,arousal:.15,summary:'had a quiet evening to decompress',tags:['home']},
 {id:'unexpected-expense',valence:-.5,arousal:.6,summary:'dealt with an unexpected expense',tags:['money']},
 {id:'creative-breakthrough',valence:.82,arousal:.7,summary:'made a breakthrough on a creative project',tags:['hobby','achievement']},
 {id:'missed-connection',valence:-.3,arousal:.4,summary:'missed a chance to connect with someone',tags:['social']},
 {id:'good-news',valence:.85,arousal:.72,summary:'received good news',tags:['life']},
 {id:'small-kindness',valence:.62,arousal:.3,summary:'experienced a small act of kindness',tags:['social']},
 {id:'household-annoyance',valence:-.22,arousal:.45,summary:'dealt with an annoying household problem',tags:['home']},
 {id:'learned-something',valence:.5,arousal:.45,summary:'learned something genuinely useful',tags:['learning']}
];
function generate(world,person,random){const e={...random.pick(events),at:new Date(world.clock).toISOString(),personId:person.id,id:U.uid('evt')};return e}
function apply(world,event){const p=world.people.find(x=>x.id===event.personId);if(!p)return;p.mood=P.MoodEngine.apply(p,{valence:event.valence,arousal:event.arousal,weight:.22,summary:event.summary});P.MemoryStore.add(p,{kind:event.tags.includes('achievement')?'achievement':'episodic',summary:event.summary,tags:event.tags,emotionalWeight:Math.min(1,Math.abs(event.valence)+.15),salience:.45,createdAt:event.at});world.events.push(event);world.events=world.events.slice(-2000)}
P.register('EventEngine',{events,generate,apply});})(window);