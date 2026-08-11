export class WorldModel {
  constructor(){this.nodes=new Map();this.edges=[];this.timeline=[];}
  upsert(id,type,data={}){const prev=this.nodes.get(id)||{id,type};const node={...prev,...data,id,type:type||prev.type};this.nodes.set(id,node);return node;}
  relate(from,to,relation,data={}){const e={from,to,relation,...data};this.edges.push(e);return e;}
  event(event){const e={id:event.id||crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`,at:event.at||null,...event};this.timeline.push(e);return e;}
  query({type,relation,id}={}){return {nodes:[...this.nodes.values()].filter(n=>(!type||n.type===type)&&(!id||n.id===id)),edges:this.edges.filter(e=>!relation||e.relation===relation),timeline:this.timeline};}
}
