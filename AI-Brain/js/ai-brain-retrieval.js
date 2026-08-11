import { AI_BRAIN_CONFIG } from "./ai-brain-config.js";
import { fetchBrainJson, loadCatalog } from "./ai-brain-loader.js";
import { routeIntent } from "./ai-brain-router.js";
const tokens=s=>new Set(String(s||"").toLowerCase().match(/[a-z0-9_+#.-]{2,}/g)||[]);
function overlap(a,b){let n=0;for(const x of a)if(b.has(x))n++;return n;}
function recordText(r){try{return JSON.stringify(r.data??r.text??r);}catch{return String(r);}}
export async function chooseShards(query,{limit=18}={}){
  const route=await routeIntent(query), catalog=await loadCatalog();
  const q=new Set([...tokens(query),...route.tags.flatMap(x=>[x,String(x).replaceAll("_"," ")]),...route.capabilities]);
  return (catalog.shards||[]).map(s=>{
    const st=new Set([...(s.routing_tags||[]),...(s.category?String(s.category).split(/[_-]/):[])]);
    return {shard:s,score:overlap(q,st)};
  }).sort((a,b)=>b.score-a.score||a.shard.bytes-b.shard.bytes).slice(0,limit).map(x=>x.shard);
}
export async function retrieveKnowledge(query,{shardLimit=18,recordLimit=AI_BRAIN_CONFIG.maxContextRecords,maxChars=AI_BRAIN_CONFIG.maxContextChars}={}){
  const shards=await chooseShards(query,{limit:shardLimit}), q=tokens(query), hits=[];
  for(const shard of shards){
    const doc=await fetchBrainJson(shard.path);
    const records=Array.isArray(doc?.records)?doc.records:[{data:doc,routing_tags:shard.routing_tags||[],source_path:shard.path}];
    for(const rec of records){
      const txt=recordText(rec), rt=tokens(txt.slice(0,180000));
      const score=overlap(q,rt)+overlap(q,new Set(rec.routing_tags||[]))*3;
      if(score) hits.push({score,shard:shard.path,record:rec,text:txt});
    }
  }
  hits.sort((a,b)=>b.score-a.score);
  const out=[];let chars=0;
  for(const h of hits){if(out.length>=recordLimit||chars>=maxChars)break;const t=h.text.slice(0,Math.max(0,maxChars-chars));out.push({...h,text:t});chars+=t.length;}
  return out;
}
