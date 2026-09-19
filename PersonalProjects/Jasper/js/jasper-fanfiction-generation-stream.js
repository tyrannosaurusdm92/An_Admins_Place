/* Jasper Fanfiction — streaming JSON/event reader for optional generation backends. */
(function(global){'use strict';
function splitSSEBuffer(buffer){const parts=String(buffer||'').split(/\r?\n\r?\n/);return {events:parts.slice(0,-1),rest:parts.at(-1)||''};}
function parseSSEEvent(block){const lines=String(block||'').split(/\r?\n/);let event='message',data=[];for(const line of lines){if(line.startsWith('event:'))event=line.slice(6).trim();else if(line.startsWith('data:'))data.push(line.slice(5).trimStart());}if(!data.length)return null;const raw=data.join('\n');try{return {event,data:JSON.parse(raw)}}catch(_){return {event,data:raw}}}
async function consumeGenerationStream(res,onEvent,{isAborted}={}){if(!res?.body)throw new Error('No generation response stream.');const reader=res.body.getReader(),decoder=new TextDecoder();let buffer='';while(true){if(isAborted?.())break;const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});const split=splitSSEBuffer(buffer);buffer=split.rest;for(const block of split.events){const evt=parseSSEEvent(block);if(evt)onEvent?.(evt);}}if(buffer.trim()){const evt=parseSSEEvent(buffer);if(evt)onEvent?.(evt);}}
global.JasperFanfictionGenerationStream=Object.freeze({splitSSEBuffer,parseSSEEvent,consumeGenerationStream});
})(typeof globalThis!=='undefined'?globalThis:window);
