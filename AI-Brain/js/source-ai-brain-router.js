import { fetchBrainJson } from "./ai-brain-loader.js";
const clean=s=>String(s||"").toLowerCase().replace(/[^a-z0-9+#.-]+/g," ").trim();
export async function routeIntent(text){
  const [routes,caps] = await Promise.all([
    fetchBrainJson("json/routing/intent-routes.json"),
    fetchBrainJson("json/routing/capability-registry.json")
  ]);
  const q=clean(text), tags=new Set(), capabilities=new Set();
  for(const [phrase,expansion] of Object.entries(routes.keyword_expansions||{})){
    if(q.includes(clean(phrase))) for(const item of expansion){
      if(caps.capabilities?.[item]) capabilities.add(item); else tags.add(item);
    }
  }
  for(const [cap,terms] of Object.entries(caps.capabilities||{})){
    if(q.includes(cap.replaceAll("_"," "))) capabilities.add(cap);
    for(const term of terms) if(q.includes(String(term).replaceAll("_"," "))) {capabilities.add(cap);tags.add(term);}
  }
  if(!capabilities.size) ["conversation","organization","strategy"].forEach(x=>capabilities.add(x));
  return {query:text, capabilities:[...capabilities], tags:[...tags]};
}
