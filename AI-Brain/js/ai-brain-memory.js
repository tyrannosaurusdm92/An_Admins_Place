export class AIBrainMemory {
  constructor(adapter=null){this.adapter=adapter;this.sessions=new Map();this.entities=new Map();this.projects=new Map();}
  rememberSession(sessionId,item){const a=this.sessions.get(sessionId)||[];a.push({...item,at:item.at||new Date().toISOString()});this.sessions.set(sessionId,a);return item;}
  rememberEntity(id,patch){const prev=this.entities.get(id)||{id};const next={...prev,...patch,updatedAt:new Date().toISOString()};this.entities.set(id,next);return next;}
  rememberProject(id,patch){const prev=this.projects.get(id)||{id,events:[]};const next={...prev,...patch,updatedAt:new Date().toISOString()};this.projects.set(id,next);return next;}
  async persist(key,value){if(!this.adapter?.set)return false;await this.adapter.set(key,value);return true;}
  async restore(key){return this.adapter?.get?this.adapter.get(key):null;}
  snapshot(){return {sessions:Object.fromEntries(this.sessions),entities:Object.fromEntries(this.entities),projects:Object.fromEntries(this.projects)};}
}
