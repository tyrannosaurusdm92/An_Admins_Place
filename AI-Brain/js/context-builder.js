(function(root){
  "use strict";
  function score(item,tokens){
    const blob=JSON.stringify(item).toLowerCase();
    return tokens.reduce((n,t)=>n+(blob.includes(t)?1:0),0);
  }
  function tokenize(text){return [...new Set(String(text||"").toLowerCase().match(/[a-z0-9_'-]{3,}/g)||[])].slice(0,40);}
  function select(items,text,limit){
    const tokens=tokenize(text);
    return (items||[]).map(x=>({x,s:score(x,tokens)})).sort((a,b)=>b.s-a.s).slice(0,limit||8).map(r=>r.x);
  }
  function build(opts){
    const out={policy:opts.policy||null,safety:opts.safety||null,domains:opts.domains||[],skills:select(opts.skills||[],opts.message,8),scenarios:select(opts.scenarios||[],opts.message,12),knowledge:select(opts.knowledge||[],opts.message,8)};
    let text=JSON.stringify(out);
    const cap=opts.maxChars||18000;
    if(text.length>cap){out.scenarios=out.scenarios.slice(0,5);out.knowledge=out.knowledge.slice(0,5);text=JSON.stringify(out);}
    if(text.length>cap){out.skills=out.skills.slice(0,4);out.scenarios=out.scenarios.slice(0,3);text=JSON.stringify(out);}
    return out;
  }
  root.PsychiatryPT3Context={tokenize,select,build};
})(typeof globalThis!=="undefined"?globalThis:this);
