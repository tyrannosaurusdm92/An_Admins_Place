export class SessionMemory {
  constructor({maxTurns=12,persist=false,storage=null,key="psy2-session"}={}){this.maxTurns=maxTurns;this.persist=persist;this.storage=storage;this.key=key;this.turns=[];if(persist)this.load();}
  add(role,text){this.turns.push({role,text:String(text||"").slice(0,8000),at:new Date().toISOString()});this.turns=this.turns.slice(-this.maxTurns);this.save();return this.turns;}
  clear(){this.turns=[];if(this.storage)try{this.storage.removeItem(this.key)}catch{} }
  save(){if(this.persist&&this.storage)try{this.storage.setItem(this.key,JSON.stringify(this.turns))}catch{} }
  load(){if(this.storage)try{const v=JSON.parse(this.storage.getItem(this.key)||"[]");if(Array.isArray(v))this.turns=v.slice(-this.maxTurns)}catch{} }
  context(){return this.turns.map(t=>({role:t.role,content:t.text}));}
}
