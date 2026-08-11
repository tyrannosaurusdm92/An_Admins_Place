import { AI_BRAIN_CONFIG } from "./ai-brain-config.js";
const cache = new Map();
export function resolveBrainUrl(path, mode="raw") {
  const base = mode === "pages" ? AI_BRAIN_CONFIG.pagesBase : AI_BRAIN_CONFIG.rawBase;
  return new URL(String(path).replace(/^\/+/, ""), base).href;
}
export async function fetchBrainJson(path, {mode="raw", signal, refresh=false}={}) {
  const key = `${mode}:${path}`;
  if (!refresh && cache.has(key)) return cache.get(key);
  const res = await fetch(resolveBrainUrl(path, mode), {signal, cache: refresh ? "reload" : "default"});
  if (!res.ok) throw new Error(`AI-Brain fetch failed ${res.status}: ${path}`);
  const value = await res.json(); cache.set(key, value); return value;
}
export async function loadCatalog(opts={}) { return fetchBrainJson(AI_BRAIN_CONFIG.catalogPath, opts); }
export function clearBrainCache(){ cache.clear(); }
