export function normalizeText(value) {
  return String(value ?? "").normalize("NFKC").replace(/\s+/g, " ").trim();
}

export function tokenize(value) {
  const stop = new Set(["the","a","an","and","or","to","of","in","on","for","with","is","are","i","me","my","it","that","this"]);
  return normalizeText(value).toLowerCase().split(/[^a-z0-9+_-]+/g).filter(t => t.length > 1 && !stop.has(t));
}

export function unique(list) { return [...new Set((list || []).filter(Boolean))]; }
export function clamp(n,min,max){ return Math.max(min,Math.min(max,n)); }
export function nowIso(){ return new Date().toISOString(); }
export function safeJsonParse(text, fallback=null){ try { return JSON.parse(text); } catch { return fallback; } }
export function compactObject(obj){ return Object.fromEntries(Object.entries(obj||{}).filter(([,v])=>v!==undefined && v!==null && v!=="")); }
export function assertString(value,name,max=12000){ const s=normalizeText(value); if(!s) throw new Error(`${name} is required`); if(s.length>max) throw new Error(`${name} is too long`); return s; }
