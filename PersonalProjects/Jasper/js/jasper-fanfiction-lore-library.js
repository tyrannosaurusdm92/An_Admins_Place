/* Jasper Fanfiction — per-series lore notes kept in local storage. */
(function(global){'use strict';const KEY='jasper-fanfiction-lore-v1';const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
function load(){try{return JSON.parse(global.localStorage?.getItem(KEY)||'{}')||{}}catch(_){return {}}}
function save(data){try{global.localStorage?.setItem(KEY,JSON.stringify(data))}catch(_){}return data;}
function list(seriesKey){const db=load();return clone(db[seriesKey]||[]);}
function upsert(seriesKey,record={}){const db=load(),items=db[seriesKey]||[];const id=record.id||`lore-${Math.random().toString(36).slice(2)}`;const next={id,type:record.type||'canon-note',title:record.title||record.name||'Untitled note',description:record.description||record.content||'',tags:record.tags||[],updated_at:new Date().toISOString()};const i=items.findIndex(x=>x.id===id);if(i>=0)items[i]={...items[i],...next};else items.push(next);db[seriesKey]=items;save(db);return clone(next);}
function remove(seriesKey,id){const db=load();db[seriesKey]=(db[seriesKey]||[]).filter(x=>x.id!==id);save(db);return true;}
global.JasperFanfictionLore=Object.freeze({list,upsert,remove,load});
})(typeof globalThis!=='undefined'?globalThis:window);
