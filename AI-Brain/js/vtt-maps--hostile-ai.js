/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function(){
  'use strict';
  const U=window.PZUtils,PF=window.ActiveWorkspacePathfinding,D=window.ActiveWorkspaceDice,E=window.ActiveWorkspaceEncounter,CE=window.ActiveWorkspaceCombat,C=window.ActiveWorkspace_CONFIG;
  const AI={timer:null,processing:false,lastTurnKey:'',memory:{}};
  const arr=v=>Array.isArray(v)?v:(v==null?[]:[v]);
  function average(expr){try{return D.parse(expr||'0').terms.reduce((sum,t)=>sum+(t.kind==='flat'?t.sign*t.value:t.sign*t.count*(t.sides+1)/2),0)}catch(_){return 0}}
  function hasCondition(t,name){return arr(t.conditions).some(c=>String(typeof c==='string'?c:c?.name||'').toLowerCase()===name)}
  function actionList(token){const rows=CE.actionOptions(token);return rows.length?rows:[CE.normalizeAction({id:'primary-attack',name:'Attack',kind:'attack_roll',toHit:U.num(token.attackBonus||token.atk,3),rangeFeet:U.num(token.rangeFeet,5),damageRoll:token.damage||token.dmg||'1d6+1',damageType:token.damageType||'physical'})]}
  function immuneTo(target,action){return CE.damageMultiplier(target,action.damageType)===0}
  function targetRoleScore(target){const tags=[target.className,target.class,target.role,...arr(target.tags)].join(' ').toLowerCase();let score=0;if(/cleric|healer|paladin|druid|support/.test(tags))score+=15;if(/wizard|sorcerer|warlock|caster|mage/.test(tags))score+=12;if(target.concentration||hasCondition(target,'concentration'))score+=24;score+=U.num(target.threat?.damageDealt)*.25+U.num(target.threat?.healingDone)*.38;return score}
  function targetScore(hostile,target,action,state){
    const dist=PF.distanceFeet(hostile,target,5),hpRatio=U.num(target.hp)/Math.max(1,U.num(target.maxHp,1)),mode=hostile.ai?.mode||'balanced';
    let score=70-dist*.75+(1-hpRatio)*55+targetRoleScore(target)+U.num(action.priority)*4;
    if(action.kind.includes('save')||action.saveDC){const bonus=CE.saveBonus(target,action.saveAbility||'dex');score+=(10-bonus)*3}else score+=(18-CE.effectiveAC(target))*2.2;
    const mult=CE.damageMultiplier(target,action.damageType);score+=mult===2?35:mult===.5?-22:mult===0?-100:0;
    if(hasCondition(target,'marked')||target.markedBy===hostile.id)score+=28;
    if(mode==='brutal')score+=(1-hpRatio)*45;
    if(mode==='controller'&&action.effects.length)score+=25;
    if(mode==='defender')score+=Math.max(0,35-dist)*.4;
    if(mode==='coward')score-=Math.max(0,25-dist)*.8;
    const memo=AI.memory[hostile.id];score+=U.num(memo?.targetBias?.[target.id]);
    if(action.requiresLineOfSight&&!PF.hasLineOfSight(state.map,hostile,target))score-=25;
    return score;
  }
  function expectedActionScore(hostile,target,action,state){
    const dist=PF.distanceFeet(hostile,target,5),inRange=dist<=action.rangeFeet,base=average(action.damageRoll||action.healingRoll),mult=CE.damageMultiplier(target,action.damageType);
    let chance=.65;if(action.kind.includes('save')||action.saveDC){chance=Math.max(.15,Math.min(.9,(action.saveDC-(10+CE.saveBonus(target,action.saveAbility||'dex')))*.05+.5))}else{chance=Math.max(.1,Math.min(.95,(21+action.toHit-CE.effectiveAC(target))/20))}
    let score=base*chance*mult+action.effects.length*7+action.priority*5+(inRange?20:0);
    if(action.targeting.includes('area')||action.radiusFeet>0){const count=state.tokens.filter(t=>t.type==='player'&&t.hp>0&&PF.distanceFeet(target,t,5)<=Math.max(5,action.radiusFeet)).length;score+=Math.max(0,count-1)*base*.65}
    if(immuneTo(target,action))score-=100;
    return score;
  }
  function choosePlan(hostile,state){
    const players=state.tokens.filter(t=>t.type==='player'&&t.hp>0&&t.visible!==false),actions=actionList(hostile);let best=null;
    for(const target of players)for(const action of actions){
      const score=targetScore(hostile,target,action,state)+expectedActionScore(hostile,target,action,state);
      if(!best||score>best.score)best={target,action,score};
    }
    return best;
  }
  function candidateGoals(hostile,target,action,state){
    const map=state.map,rangeCells=Math.max(1,Math.ceil(action.rangeFeet/5)),occupied=PF.occupiedFromTokens(state.tokens,hostile.id),goals=[];
    const minX=Math.max(0,target.x-rangeCells),maxX=Math.min(map.cols-hostile.size,target.x+rangeCells),minY=Math.max(0,target.y-rangeCells),maxY=Math.min(map.rows-hostile.size,target.y+rangeCells);
    for(let x=minX;x<=maxX;x++)for(let y=minY;y<=maxY;y++){
      const position={x,y};if(PF.distanceFeet({...position,size:hostile.size},target,5)>action.rangeFeet)continue;
      if(!PF.canOccupy(map,position,hostile.size,{occupied,avoidHazards:hostile.ai?.avoidHazards!==false}))continue;
      if(action.requiresLineOfSight&&!PF.hasLineOfSight(map,{...position,size:hostile.size},target))continue;
      goals.push(position);
    }
    if(PF.distanceFeet(hostile,target,5)<=action.rangeFeet&&(!action.requiresLineOfSight||PF.hasLineOfSight(map,hostile,target)))goals.unshift({x:hostile.x,y:hostile.y});
    return goals.sort((a,b)=>PF.distanceCells(a,hostile)-PF.distanceCells(b,hostile)).slice(0,150);
  }
  function bestMovement(hostile,target,action,state){
    const occupied=PF.occupiedFromTokens(state.tokens,hostile.id),budget=Math.max(0,CE.effectiveSpeed(hostile)-U.num(hostile.movementUsed)),options={occupied,tokenSize:hostile.size,diagonal:true,cornerCutting:false,avoidHazards:hostile.ai?.avoidHazards!==false};let best=null;
    for(const goal of candidateGoals(hostile,target,action,state)){
      const path=(goal.x===hostile.x&&goal.y===hostile.y)?[{x:hostile.x,y:hostile.y}]:PF.findPath(state.map,hostile,goal,options);if(!path.length)continue;
      let clipped=[path[0]];for(let i=1;i<path.length;i++){const candidate=[...clipped,path[i]];if(PF.pathFeet(candidate,5,state.rules?.diagonal)>budget)break;clipped=candidate}
      const end=clipped.at(-1),endToken={...end,size:hostile.size},distance=PF.distanceFeet(endToken,target,5),inRange=distance<=action.rangeFeet,los=!action.requiresLineOfSight||PF.hasLineOfSight(state.map,endToken,target),terrain=state.map.terrain?.[PF.key(end.x,end.y)]?.type,score=(inRange&&los?0:100)+distance+(terrain==='hazard'?40:0)+PF.pathFeet(clipped,5,state.rules?.diagonal)*.02;
      if(!best||score<best.score)best={path:clipped,end,feet:PF.pathFeet(clipped,5,state.rules?.diagonal),score,inRange:inRange&&los};
    }
    return best||{path:[{x:hostile.x,y:hostile.y}],end:{x:hostile.x,y:hostile.y},feet:0,score:999,inRange:false};
  }
  function rollFactory(encounterId){return(expr,label,kind,who,mode)=>{const suffix=mode==='advantage'?' adv':mode==='disadvantage'?' dis':'';return D.rollHostile({expression:`${expr}${suffix}`,label,hostile:who,encounterId,kind})}}
  function resolveAgainst(hostile,target,action,state){const result=CE.resolveAction({encounter:state,actor:hostile,target,action,distanceFeet:PF.distanceFeet(hostile,target,5),rollFactory:rollFactory(state.id)});result.rolls.forEach(r=>E.addRoll(r));result.messages.forEach(m=>E.addLog(m,'hostile-action',{actorId:hostile.id,targetId:target.id,actionId:action.id}));return result}
  function resolveAction(hostile,target,action,state){
    const results=[resolveAgainst(hostile,target,action,state)];
    if((action.targeting.includes('area')||action.radiusFeet>0)&&action.radiusFeet>0){state.tokens.filter(t=>t.type==='player'&&t.hp>0&&t.id!==target.id&&PF.distanceFeet(target,t,5)<=action.radiusFeet).forEach(t=>results.push(resolveAgainst(hostile,t,action,state)))}
    return results;
  }
  function remember(hostile,target,results){const m=AI.memory[hostile.id]||(AI.memory[hostile.id]={turns:0,hits:0,damage:0,targetBias:{}}),damage=results.reduce((s,r)=>s+U.num(r.damage),0),hit=results.some(r=>r.hit?.hit||r.save?.success===false);m.turns++;m.hits+=hit?1:0;m.damage+=damage;m.targetBias[target.id]=U.num(m.targetBias[target.id])+(target.hp<=0?10:hit?2:-1);hostile.threat=hostile.threat||{};hostile.threat.lastAction=results[0]?.action?.name||''}
  async function claimAuthority(state){try{const result=await window.ActiveWorkspaceAPI.call('authorityClaim',{encounterId:state.id,turn:{round:state.initiative.round,index:state.initiative.index},leaseSeconds:15},{dm:true});return result?.granted!==false}catch(err){console.warn('Backend authority claim failed',err);return false}}
  AI.runTurn=async()=>{
    const user=window.ActiveWorkspaceAPI.user,state=E.getState(),hostile=E.currentToken();
    if(AI.processing||user?.role!=='dm'||!state||state.status!=='active'||hostile?.type!=='hostile'||hostile.hp<=0)return;
    const turnKey=`${state.id}:${state.version}:${state.initiative.round}:${state.initiative.index}:${hostile.id}`;if(AI.lastTurnKey===turnKey)return;AI.processing=true;
    try{
      if(!await claimAuthority(state))return;AI.lastTurnKey=turnKey;await new Promise(r=>setTimeout(r,C.defaults.hostileDelayMs));
      CE.normalizeToken(hostile);
      if(['incapacitated','stunned','paralyzed','unconscious'].some(c=>hasCondition(hostile,c))){E.addLog(`${hostile.name} cannot act and loses the turn.`,'hostile-action');E.advanceTurn();await E.commit({reason:'hostile incapacitated',turnKey});U.emit('turn-changed',E.currentToken());return}
      const plan=choosePlan(hostile,state);if(!plan){E.addLog(`${hostile.name} has no valid living player target.`,'hostile-action');E.advanceTurn();await E.commit({reason:'hostile no target',turnKey});U.emit('turn-changed',E.currentToken());return}
      hostile.beats=U.clamp(U.int(hostile.beats,3),0,3);const move=bestMovement(hostile,plan.target,plan.action,state),from={x:hostile.x,y:hostile.y};hostile.x=move.end.x;hostile.y=move.end.y;hostile.movementUsed=U.num(hostile.movementUsed)+move.feet;if(move.feet>0&&!hostile.movementBeatSpent){hostile.beats=Math.max(0,hostile.beats-1);hostile.movementBeatSpent=true}
      if(from.x!==hostile.x||from.y!==hostile.y)E.addLog(`${hostile.name} moved ${move.feet} ft to an unoccupied grid position.`,'hostile-movement',{tokenId:hostile.id,path:move.path});
      const distance=PF.distanceFeet(hostile,plan.target,5),canAct=distance<=plan.action.rangeFeet&&(!plan.action.requiresLineOfSight||PF.hasLineOfSight(state.map,hostile,plan.target));
      const cost=plan.action.beatCost||2;if(canAct&&hostile.beats>=cost){const results=resolveAction(hostile,plan.target,plan.action,state);hostile.beats-=cost;hostile.actionUsed=hostile.beats<=0;remember(hostile,plan.target,results)}else E.addLog(`${hostile.name} could not reach a legal position for ${plan.action.name} and held its action.`,'hostile-action',{actorId:hostile.id,targetId:plan.target.id});
      E.advanceTurn();await E.commit({reason:'autonomous tactical hostile turn',turnKey});U.emit('turn-changed',E.currentToken());
    }catch(err){console.error(err);E.addLog(`Autonomous hostile turn stopped safely: ${err.message}`,'error');try{E.advanceTurn();await E.commit({reason:'hostile error recovery'})}catch(_){}
    }finally{AI.processing=false}
  };
  AI.start=()=>{clearInterval(AI.timer);AI.timer=setInterval(AI.runTurn,600);return AI};AI.stop=()=>{clearInterval(AI.timer);AI.timer=null};AI.choosePlan=choosePlan;AI.bestMovement=bestMovement;
  window.ActiveWorkspaceHostileAI=AI;
})();
