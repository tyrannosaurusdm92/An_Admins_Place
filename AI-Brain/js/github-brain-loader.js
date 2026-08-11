/* Optional remote AI-Brain loader for projects that do not bundle the corpus. */
(function(global){
  'use strict';
  var SB=global.Superbot=global.Superbot||{};
  var ROOT='https://raw.githubusercontent.com/tyrannosaurusdm92/An_Admins_Place/main/AI-Brain/';
  function words(v){return String(v||'').toLowerCase().match(/[a-z0-9_\-]{3,}/g)||[];}
  async function json(path){var r=await fetch(ROOT+path,{cache:'no-cache'}); if(!r.ok)throw new Error('AI-Brain fetch '+r.status+' for '+path); return r.json();}
  async function search(query,options){
    options=options||{}; var routing=await json('json/retrieval-routing.json'); var wanted=new Map();
    words(query).forEach(function(t){(routing.terms[t]||[]).forEach(function(x){wanted.set(x.shard,(wanted.get(x.shard)||0)+x.hits);});});
    var ids=Array.from(wanted.entries()).sort(function(a,b){return b[1]-a[1];}).slice(0,options.maxShards||6).map(function(x){return x[0];});
    if(!ids.length){var sum=words(query).join('').split('').reduce(function(a,c){return (a+c.charCodeAt(0))&255;},0); ids=[sum.toString(16).padStart(2,'0'),((sum+97)&255).toString(16).padStart(2,'0')];}
    var all=(await Promise.all(ids.map(function(id){return json('json/intelligence-shards/shard-'+id+'.json').catch(function(){return {records:[]};});}))).flatMap(function(x){return x.records||[];});
    var tokens=Array.from(new Set(words(query))); function score(r){var h=(' '+(r.title||'')+' '+(r.tags||[]).join(' ')+' '+(r.prompt||'')).toLowerCase(),s=0;tokens.forEach(function(t){if(h.indexOf(t)!==-1)s++;});return s;}
    return all.map(function(r){return {r:r,s:score(r)};}).filter(function(x){return x.s;}).sort(function(a,b){return b.s-a.s;}).slice(0,options.limit||8).map(function(x){return Object.assign({score:x.s},x.r);});
  }
  SB.remoteBrain=Object.freeze({root:ROOT,search:search});
})(typeof window!=='undefined'?window:globalThis);
