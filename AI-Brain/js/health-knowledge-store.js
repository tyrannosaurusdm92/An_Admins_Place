import { tokenize } from "./utils.js";

export class KnowledgeStore {
  constructor({baseUrl="", fetchImpl=globalThis.fetch, maxCache=32}={}) {
    this.baseUrl = String(baseUrl||"").replace(/\/$/,"");
    this.fetchImpl = fetchImpl;
    this.maxCache = maxCache;
    this.cache = new Map();
  }
  async loadJson(relativePath){
    if(this.cache.has(relativePath)) return this.cache.get(relativePath);
    if(!this.fetchImpl) throw new Error("No fetch implementation available");
    const res = await this.fetchImpl(`${this.baseUrl}/${relativePath}`);
    if(!res.ok) throw new Error(`Knowledge fetch failed: ${res.status} ${relativePath}`);
    const data = await res.json();
    this.cache.set(relativePath,data);
    if(this.cache.size>this.maxCache) this.cache.delete(this.cache.keys().next().value);
    return data;
  }
  async manifest(){ return this.loadJson("manifest.json"); }
  async category(name){
    const manifest = await this.manifest();
    const file = manifest.categories?.[name] || manifest.categories?.general_mental_health;
    if(!file) return {cards:[]};
    return this.loadJson(file);
  }
  scoreCard(card, query){
    const q = new Set(tokenize(query));
    const words = tokenize([card.title, ...(card.tags||[]), card.when_to_use, card.summary].join(" "));
    let score=0; for(const word of words) if(q.has(word)) score += card.tags?.includes(word) ? 4 : 1;
    return score;
  }
  async search(query, categories=[], limit=8){
    const all=[];
    for(const c of categories.slice(0,5)){
      const pack=await this.category(c);
      for(const card of pack.cards||[]) all.push({...card,_category:c,_score:this.scoreCard(card,query)});
    }
    return all.sort((a,b)=>b._score-a._score).slice(0,limit);
  }
}
