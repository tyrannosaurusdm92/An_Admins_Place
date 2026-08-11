/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function(){
  'use strict';
  const LT=window.LifeTalk,U=LT.utils;
  function compactNpc(npc){return {npcId:npc.npcId,name:npc.name,aliases:npc.aliases,pronouns:npc.pronouns,genderIdentity:npc.genderIdentity,species:npc.species,lineage:npc.lineage,culture:npc.culture,profession:npc.profession,public:npc.public,private:npc.private,factionIds:npc.factionIds,questIds:npc.questIds,traits:npc.traits,dialogue:npc.dialogue,state:npc.state,visibility:npc.visibility,protected:npc.protected,deity:npc.deity,covenant:npc.covenant,canonicalClass:npc.canonicalClass,race:npc.race,homebrewAlignment:npc.homebrewAlignment};}
  function compactFaction(f){return {factionId:f.factionId,name:f.name,public:f.public,private:f.private,goals:f.goals,methods:f.methods,resources:f.resources,leaderNpcIds:f.leaderNpcIds,memberNpcIds:f.memberNpcIds,relationships:f.relationships,exceptions:f.exceptions,visibility:f.visibility,protected:f.protected};}
  function compactQuest(q){return {questId:q.questId,title:q.title,summary:q.summary,status:q.status,giverNpcIds:q.giverNpcIds,factionIds:q.factionIds,objectives:q.objectives,hiddenObjectives:q.hiddenObjectives,stages:q.stages,currentStageId:q.currentStageId,triggers:q.triggers,rewards:q.rewards,consequences:q.consequences,knowledgeRules:q.knowledgeRules,visibility:q.visibility,protected:q.protected};}
  function recentConversation(state,npcId,turns){return state.conversations.filter(c=>c.npcId===npcId).slice(-turns).map(c=>({role:c.role,playerId:c.playerId||null,playerName:c.playerName||null,text:c.text,timestamp:c.timestamp,targetPlayerIds:c.targetPlayerIds||[]}));}
  function buildDialogueRequest(npc,messages,state,options={}){
    const related=LT.search.relatedForNpc(npc,state,messages),settings=state.settings;const requestId=U.randomId('request');const payload={
      requestId,action:'npc_dialogue',schemaVersion:LT.config.schemaVersion,createdAt:U.nowIso(),
      project:{projectId:state.project.projectId,name:state.project.name,genre:state.project.genre,era:state.project.era,language:state.project.language||settings.language,visibilityMode:'player'},
      npc:compactNpc(npc),factions:related.factions.map(compactFaction),quests:related.quests.map(compactQuest),
      conversation:{recent:recentConversation(state,npc.npcId,settings.memoryTurns||18),pending:messages.map(m=>({messageId:m.messageId,playerId:m.playerId,playerName:m.playerName,text:m.text,timestamp:m.timestamp})),participantCount:new Set(messages.map(m=>m.playerId)).size},
      behavior:{responseMode:npc.dialogue?.responseMode||settings.defaultResponseMode||'adaptive',multiPlayerStrategy:npc.dialogue?.multiPlayerStrategy||'synthesize',allowSingleResponse:true,allowVariedResponses:true,requireProfileConsistency:true,doNotRevealPrivateReasoning:true,doNotRevealDMOnlyDataUnlessKnowledgeRulesPermit:true,requireStructuredJson:true,statePatchReview:settings.statePatchReview!==false},
      outputContract:{mode:'single|varied',responses:[{text:'string',targetPlayerIds:['player ids or empty for group'],emotion:'string',reaction:'short token reaction label'}],memoryWrites:[{summary:'short factual memory',visibility:'private|public'}],statePatch:{npc:{mood:'optional',stress:'optional',trustByPlayer:'optional'},quests:[],factions:[]},decisionFactors:['brief non-secret factors only'],warnings:[]},
      retrieval:related.hits.map(h=>({type:h.type,recordId:h.recordId,name:h.name,score:h.score}))
    };
    const systemInstruction=[
      `You are generating spoken dialogue for ${npc.name}, not narrating as an omniscient game master.`,
      'Use the NPC profile, faction context, quest state, memories, relationships, current mood, and every pending player message.',
      'The NPC may answer the group once or answer players separately. Use separate responses when messages conflict, require different privacy levels, or the NPC would naturally address people differently.',
      'Never expose secrets, hidden agendas, DM-only notes, protected records, or private reasoning merely because they are present in context. Reveal information only when the NPC knows it and the current situation supports disclosure.',
      'Use the supplied canonical Universal race entry, class discipline and subclass, deity covenant, resonance, edicts, anathemas, practices, hazards, and all eight alignment axes as active rules. The first four axes select the named profile; mercy, transformation, autonomy, and restraint control its expression.',
      'Ancestry, species, gender identity, or lineage never determines morality, intelligence, profession, politics, or personality. Follow the explicit profile instead.',
      'Do not return chain-of-thought. Return only strict JSON matching outputContract. decisionFactors must be brief, observable, and non-secret.',
      'Quest, faction, and protected-record changes are proposals; do not assume they are committed.'
    ].join('\n');
    return {requestId,systemInstruction,payload};
  }
  function fitForBackend(request,maxChars=LT.config.limits.maxBackendContextChars){let text=JSON.stringify(request);if(text.length<=maxChars)return request;const copy=U.clone(request);copy.payload.conversation.recent=copy.payload.conversation.recent.slice(-8);copy.payload.retrieval=copy.payload.retrieval.slice(0,5);for(const f of copy.payload.factions||[])delete f.relationships;for(const q of copy.payload.quests||[])q.stages=(q.stages||[]).filter(s=>String(s.stageId)===String(q.currentStageId)).slice(0,2);text=JSON.stringify(copy);if(text.length>maxChars){copy.payload.npc.private.memories=U.array(copy.payload.npc.private.memories).slice(-10);copy.payload.npc.private.relationships=U.array(copy.payload.npc.private.relationships).slice(0,20);}return copy;}
  LT.register('prompt',{buildDialogueRequest,fitForBackend,compactNpc,compactFaction,compactQuest});
})();
