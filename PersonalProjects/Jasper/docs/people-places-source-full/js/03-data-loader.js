(function(g){"use strict";const P=g.PeoplePlaces;
const cache=new Map();let manifest=null;let core=null;
async function json(path){if(cache.has(path))return cache.get(path);const res=await fetch(path);if(!res.ok)throw new Error(`Data load failed: ${path} (${res.status})`);const value=await res.json();cache.set(path,value);return value}
async function loadManifest(){return manifest||(manifest=await json("json/data-manifest.json"))}
async function loadCore(){return core||(core=await json("json/core-catalogs.json"))}
async function loadBank(id){const m=await loadManifest(),row=m.banks.find(x=>x.id===id||x.path.endsWith(id));if(!row)throw new Error(`Unknown data bank: ${id}`);return json(row.path)}
async function inspect(){const m=await loadManifest();return{...m,totalBankBytes:m.banks.reduce((s,x)=>s+x.bytes,0)}}
P.register("DataLoader",{json,loadManifest,loadCore,loadBank,inspect,cache});})(window);