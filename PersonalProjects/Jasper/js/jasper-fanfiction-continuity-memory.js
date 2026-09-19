/* Jasper Fanfiction — continuity memory for story facts, choices, and unresolved threads. */
(function(global){'use strict';const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
class JasperFanfictionContinuityMemory{
 constructor(seed={}){this.state={stories:{},facts:[],...clone(seed)}}
 story(key='story'){if(!this.state.stories[key])this.state.stories[key]={seriesKey:key,choices:[],chapters:[],qualities:{},flags:{},notes:[],continuityUpdates:[],unresolvedThreads:[],updatedAt:new Date().toISOString()};return this.state.stories[key];}
 rememberFact(fact,meta={}){const item={id:meta.id||`fact-${Math.random().toString(36).slice(2)}`,fact:String(fact),tags:meta.tags||[],seriesKey:meta.seriesKey||null,createdAt:new Date().toISOString()};this.state.facts.push(item);return clone(item);}
 recall(query='',limit=20){const terms=String(query).toLowerCase().split(/\W+/).filter(Boolean);return this.state.facts.map(item=>({item,score:terms.reduce((n,t)=>n+(item.fact.toLowerCase().includes(t)?1:0)+((item.tags||[]).some(x=>String(x).toLowerCase().includes(t))?2:0),0)})).sort((a,b)=>b.score-a.score).filter(x=>x.score||!terms.length).slice(0,limit).map(x=>clone(x.item));}
 rememberChoice(key,choice){const s=this.story(key);s.choices.push({...clone(choice),at:new Date().toISOString()});for(const [k,v] of Object.entries(choice?.effect||{}))s.qualities[k]=typeof v==='number'?(Number(s.qualities[k])||0)+v:v;s.choices=s.choices.slice(-200);s.updatedAt=new Date().toISOString();return clone(s);}
 rememberChapter(key,chapter={}){const s=this.story(key);const item={id:chapter.id||null,chapter_number:chapter.chapter_number||null,title:chapter.title||'',generated:Boolean(chapter.generated),ending:String(chapter.content||'').slice(-3000),choices:(chapter.choices||[]).map(c=>({id:c.id,label:c.label,path_key:c.path_key,target:c.target,effect:clone(c.effect||{})}))};const i=s.chapters.findIndex(x=>x.id&&x.id===item.id);if(i>=0)s.chapters[i]=item;else s.chapters.push(item);s.chapters=s.chapters.slice(-100);if(chapter.continuity_updates)s.continuityUpdates.push({chapterId:item.id,updates:clone(chapter.continuity_updates)});if(chapter.unresolved_threads)s.unresolvedThreads=[...new Set([...(s.unresolvedThreads||[]),...chapter.unresolved_threads])];s.updatedAt=new Date().toISOString();return clone(item);}
 snapshot(){return clone(this.state);} load(seed={}){this.state={stories:{},facts:[],...clone(seed)};return this;}
}
global.JasperFanfictionContinuityMemory=JasperFanfictionContinuityMemory;
})(typeof globalThis!=='undefined'?globalThis:window);
