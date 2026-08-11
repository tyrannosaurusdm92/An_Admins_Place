/* Superbot Unified AI Brain bridge.
 * Does not expose an OpenAI key in the browser. It prepares retrieval context
 * for the Apps Script backend and can search the intact local corpus.
 */
(function (global) {
  'use strict';
  var SB = global.Superbot = global.Superbot || {};
  function words(v){ return String(v||'').toLowerCase().match(/[a-z0-9_\-]{3,}/g)||[]; }
  function unique(a){ return Array.from(new Set(a)); }
  function score(record, tokens){
    var title=' '+String(record.title||'').toLowerCase()+' ';
    var tags=' '+(record.tags||[]).join(' ').toLowerCase()+' ';
    var prompt=String(record.prompt||'').toLowerCase();
    var s=0;
    tokens.forEach(function(t){
      if(title.indexOf(t)!==-1) s+=8;
      if(tags.indexOf(t)!==-1) s+=5;
      var pos=prompt.indexOf(t); if(pos!==-1) s+=2+(pos<700?1:0);
    });
    if(record.mode==='operator'||record.mode==='planner'||record.mode==='verifier') s+=0.25;
    return s;
  }
  function localSearch(query, options){
    options=options||{}; var limit=Math.max(1,Math.min(20,Number(options.limit||8)));
    var tokens=unique(words(query)); var corpus=global.SUPERBOT_INTELLIGENCE_CORPUS||[];
    return corpus.map(function(r){ return {record:r,score:score(r,tokens)}; })
      .filter(function(x){return x.score>0;}).sort(function(a,b){return b.score-a.score;}).slice(0,limit)
      .map(function(x){return Object.assign({score:x.score},x.record);});
  }
  function contextText(query, options){
    options=options||{}; var maxChars=Number(options.maxChars||24000); var used=0, chunks=[];
    localSearch(query,{limit:options.limit||8}).forEach(function(r){
      var block='REFERENCE PATTERN ['+(r.mode||'source')+'] '+(r.title||r.id)+'\n'+String(r.prompt||'');
      if(used>=maxChars)return; block=block.slice(0,Math.max(0,maxChars-used)); used+=block.length; chunks.push(block);
    });
    return chunks.join('\n\n---\n\n');
  }
  function backendRequest(message, extra){
    extra=extra||{};
    return Object.assign({},extra,{action:extra.action||'chat',message:String(message||''),localBrainContext:contextText(message,{limit:6,maxChars:18000})});
  }
  SB.brain=Object.freeze({search:localSearch,contextText:contextText,backendRequest:backendRequest,version:'2026-08-10.unified.v1'});
})(typeof window!=='undefined'?window:globalThis);
