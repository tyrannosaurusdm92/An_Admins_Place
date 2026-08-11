export function accessibilityInstructions(profile={}) {
  const out=[];
  if(profile.lowEnergy) out.push("Use very small steps; offer a minimum-effort option first.");
  if(profile.cognitiveLoad === "low") out.push("Keep to 1-3 steps at a time; avoid dense paragraphs and long option lists.");
  if(profile.mobilityLimited) out.push("Do not assume standing, walking, exercise, showers, or leaving bed/chair are available; offer seated/lying-down alternatives.");
  if(profile.sensorySensitive) out.push("Avoid assuming breathing exercises, cold exposure, music, touch, bright visuals, or strong sensory input are soothing; ask or offer alternatives.");
  if(profile.communication === "literal") out.push("Use concrete, literal wording and make implied social expectations explicit.");
  if(profile.communication === "minimal") out.push("Allow yes/no, scale, multiple-choice, or one-word responses.");
  if(profile.readingDifficulty) out.push("Use short headings, bullets, and plain language; offer a condensed version.");
  if(profile.interoceptionDifficulty) out.push("Do not require precise body-feeling labels; offer observable cues and simple choices.");
  return out;
}
