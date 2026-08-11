/* Genericized for AI-Brain capability use. Provenance group: active-session-runtime-a. */
(function(){
  'use strict';
  const LT=window.LifeTalk,U=LT.utils;
  function normalizeResponse(raw,request){
    let value=raw;if(typeof raw==='string'){const trimmed=raw.trim();try{value=JSON.parse(trimmed);}catch{const fenced=trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);if(fenced)try{value=JSON.parse(fenced[1]);}catch{}if(typeof value==='string')value={mode:'single',responses:[{text:trimmed,targetPlayerIds:[],emotion:'neutral',reaction:'neutral'}]};}}
    if(value?.data&&typeof value.data==='object')value=value.data;if(value?.result&&typeof value.result==='object')value=value.result;if(value?.response&&typeof value.response==='object')value=value.response;
    const responses=U.array(value?.responses||value?.messages||value?.reply).map((r,i)=>typeof r==='string'?{text:r,targetPlayerIds:[],emotion:'neutral',reaction:'neutral'}:{text:U.text(r.text||r.message||r.reply),targetPlayerIds:U.array(r.targetPlayerIds||r.targets),emotion:U.text(r.emotion,'neutral'),reaction:U.text(r.reaction||r.expression||r.emotion,'neutral')}).filter(r=>r.text);
    if(!responses.length&&U.text(value?.text))responses.push({text:U.text(value.text),targetPlayerIds:[],emotion:'neutral',reaction:'neutral'});
    if(!responses.length)throw new Error('Backend returned no usable NPC response.');
    return {requestId:request.requestId,mode:['single','varied'].includes(value?.mode)?value.mode:(responses.length>1?'varied':'single'),responses,memoryWrites:U.array(value?.memoryWrites),statePatch:U.isPlainObject(value?.statePatch)?value.statePatch:{},decisionFactors:U.array(value?.decisionFactors).slice(0,8),warnings:U.array(value?.warnings),raw:value};
  }
  async function post(request,settings){
    const endpoint=settings.backendEndpoint||LT.config.backend.endpoint,timeout=Number(settings.backendTimeoutMs||LT.config.backend.timeoutMs);const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
    const envelope={action:'npc_dialogue',version:LT.version,requestId:request.requestId,library:{id:LT.config.backend.libraryId,version:LT.config.backend.libraryVersion,url:settings.backendLibraryUrl||LT.config.backend.libraryUrl},systemInstruction:request.systemInstruction,payload:request.payload};
    try{
      const response=await fetch(endpoint,{method:'POST',redirect:'follow',mode:'cors',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8','Accept':'application/json,text/plain,*/*'},body:JSON.stringify(envelope),signal:controller.signal});
      const text=await response.text();if(!response.ok)throw new Error(`Backend HTTP ${response.status}: ${U.truncate(text,240)}`);return normalizeResponse(text,request);
    }catch(error){if(error.name==='AbortError')throw new Error(`Backend timed out after ${timeout} ms.`);throw error;}finally{clearTimeout(timer);}
  }
  async function test(settings){const requestId=U.randomId('health');const endpoint=settings.backendEndpoint||LT.config.backend.endpoint;const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),Math.min(Number(settings.backendTimeoutMs||15000),15000));try{const response=await fetch(endpoint,{method:'POST',mode:'cors',redirect:'follow',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action:'health',requestId,library:{id:LT.config.backend.libraryId,version:LT.config.backend.libraryVersion}}),signal:controller.signal});const text=await response.text();return {ok:response.ok,status:response.status,text:U.truncate(text,500)};}catch(error){return {ok:false,status:0,text:error.message};}finally{clearTimeout(timer);}}
  async function extractRecords(source,settings){const endpoint=settings.backendEndpoint||LT.config.backend.endpoint;const body={action:'extract_lifesimulation_records',version:LT.version,source:{name:source.name,kind:source.kind,scope:source.scope,text:U.truncate(source.rawText,LT.config.limits.maxBackendContextChars)},outputContract:{npcs:[],factions:[],quests:[],warnings:[]}};const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),Number(settings.backendTimeoutMs||30000));try{const r=await fetch(endpoint,{method:'POST',mode:'cors',redirect:'follow',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify(body),signal:controller.signal});const t=await r.text();if(!r.ok)throw new Error(`HTTP ${r.status}`);const parsed=U.parseJsonLoose(t).value;return parsed.data||parsed.result||parsed;}finally{clearTimeout(timer);}}
  LT.register('backend',{post,test,extractRecords,normalizeResponse});
})();
