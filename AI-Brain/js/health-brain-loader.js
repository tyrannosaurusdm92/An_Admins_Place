/** Unified Psychiatric AI Brain Part 1: manifest + knowledge loader. */
export async function loadJson(url, fetchImpl = fetch) {
  const r = await fetchImpl(url, {headers:{Accept:'application/json'}});
  if (!r.ok) throw new Error(`Knowledge fetch failed ${r.status}: ${url}`);
  return r.json();
}
export function rawGithubBase(owner='tyrannosaurusdm92', repo='An_Admins_Place', branch='main') {
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/AI-Brain`;
}
export async function loadCoreBrain(base, fetchImpl=fetch) {
  const names=['json/safety_policy.json','json/domain_principles.json','json/intent_catalog.json','json/support_templates.json','json/evidence_sources.json'];
  const entries=await Promise.all(names.map(async p=>[p,await loadJson(`${base}/${p}`,fetchImpl)]));
  return Object.fromEntries(entries);
}
