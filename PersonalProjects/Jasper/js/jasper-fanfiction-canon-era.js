/* Jasper Fanfiction — canon-window + adults-only eligibility helpers. */
(function(global){'use strict';
function normalizeAges(value){if(!value)return {};if(typeof value==='object'&&!Array.isArray(value))return Object.fromEntries(Object.entries(value).map(([k,v])=>[String(k).trim(),Number(v)]).filter(([k,v])=>k&&Number.isFinite(v)));const out={};String(value).split(/[,;\n]+/).forEach(part=>{const m=part.trim().match(/^(.+?)\s*(?:=|:|\bis\b)\s*(\d{1,3})$/i);if(m)out[m[1].trim()]=Number(m[2]);});return out;}
function validateAdults({adultConfirmed=false,characterAges={}}={}){const ages=normalizeAges(characterAges);const underage=Object.entries(ages).filter(([,age])=>age<18).map(([name,age])=>({name,age}));return {ok:Boolean(adultConfirmed)&&!underage.length,adultConfirmed:Boolean(adultConfirmed),ages,underage,reason:!adultConfirmed?'adult-status-not-confirmed':underage.length?'under-18-character':'ok'};}
function context(series={}){return {fandom:series.fandom||'',canon_window:series.canon_window||'',character_ages:normalizeAges(series.character_ages),adult_validation:validateAdults({adultConfirmed:series.adult_characters_confirmed,characterAges:series.character_ages})};}
global.JasperFanfictionCanonEra=Object.freeze({normalizeAges,validateAdults,context});
})(typeof globalThis!=='undefined'?globalThis:window);
