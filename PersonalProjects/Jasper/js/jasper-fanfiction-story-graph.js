/* Jasper Fanfiction — CYOA chapter/choice graph. */
(function(global){'use strict';
class JasperFanfictionStoryGraph{
  constructor(seed={}){this.nodes=new Map();this.edges=[];this.timeline=[];this.load(seed);}
  upsert(id,type='chapter',data={}){const prev=this.nodes.get(id)||{id,type};const node={...prev,...data,id,type:type||prev.type};this.nodes.set(id,node);return node;}
  relate(from,to,relation='choice-transition',data={}){const edge={from,to,relation,...data};this.edges.push(edge);return edge;}
  event(event){const e={id:event.id||global.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`,at:event.at||new Date().toISOString(),...event};this.timeline.push(e);return e;}
  ingestChapter(chapter,{seriesKey='',choiceFrom=null}={}){if(!chapter)return null;const id=chapter.id||`${seriesKey||chapter.series_slug||'story'}-${String(chapter.chapter_number||1).padStart(2,'0')}`;const node=this.upsert(id,'fanfic-chapter',{seriesKey:seriesKey||chapter.series_slug||'',chapterNumber:chapter.chapter_number||null,title:chapter.title||'',generated:Boolean(chapter.generated),choices:(chapter.choices||[]).map(c=>({id:c.id,label:c.label,target:c.target,pathKey:c.path_key,effect:c.effect||{}}))});if(choiceFrom?.chapterId)this.relate(choiceFrom.chapterId,id,'choice-transition',{choiceId:choiceFrom.choiceId||null,pathKey:choiceFrom.pathKey||null});this.event({type:'chapter-visited',chapterId:id,seriesKey:node.seriesKey});return node;}
  branchTrail(fromId){const trail=[];let current=fromId,guard=0;while(current&&guard++<500){trail.push(current);const edge=[...this.edges].reverse().find(e=>e.relation==='choice-transition'&&e.to===current);current=edge?.from||null;}return trail.reverse();}
  snapshot(){return {nodes:[...this.nodes.values()],edges:[...this.edges],timeline:[...this.timeline]};}
  load(seed={}){for(const n of seed?.nodes||[])this.nodes.set(n.id,{...n});if(Array.isArray(seed?.edges))this.edges=[...seed.edges];if(Array.isArray(seed?.timeline))this.timeline=[...seed.timeline];return this;}
}
global.JasperFanfictionStoryGraph=JasperFanfictionStoryGraph;
})(typeof globalThis!=='undefined'?globalThis:window);
